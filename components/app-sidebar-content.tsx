"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { TemplatesDialog } from "@/components/templates-dialog"
import {
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  Home,
  LogOut,
  Mail,
  Plus,
  Search,
  Settings,
  Star,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type WorkspacePlan = "free" | "pro" | "enterprise"

interface Workspace {
  id: string
  name: string
  plan: WorkspacePlan
}

interface Page {
  id: string
  title: string
  parentId: string | null
}

const navigationItems = [
  { icon: Mail, label: "Inbox", href: "/inbox" },
  { icon: Calendar, label: "Kalender", href: "/calendar" },
  { icon: Home, label: "Dashboard", href: "/dashboard" },
]

const planLabel: Record<WorkspacePlan, string> = {
  free: "Free Plan",
  pro: "Pro Plan",
  enterprise: "Enterprise Plan",
}

function PageTree({
  pages,
  parentId,
  depth,
  pathname,
  onAddChild,
}: {
  pages: Page[]
  parentId: string | null
  depth: number
  pathname: string
  onAddChild: (parentId: string) => void
}) {
  const children = pages.filter((p) => p.parentId === parentId)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  return (
    <>
      {children.map((page) => {
        const hasChildren = pages.some((p) => p.parentId === page.id)
        const isExpanded = expanded[page.id] ?? true
        const active = pathname === `/pages/${page.id}`

        return (
          <div key={page.id}>
            <div
              className={cn(
                "group flex items-center gap-1 rounded-md py-1 pr-1 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
              style={{ paddingLeft: `${8 + depth * 12}px` }}
            >
              <button
                className="flex h-4 w-4 shrink-0 items-center justify-center"
                onClick={() => setExpanded((e) => ({ ...e, [page.id]: !isExpanded }))}
              >
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )
                ) : (
                  <FileText className="h-3 w-3 opacity-50" />
                )}
              </button>

              <Link href={`/pages/${page.id}`} className="flex-1 truncate">
                {page.title}
              </Link>

              <button
                className="hidden h-4 w-4 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent group-hover:flex"
                onClick={() => onAddChild(page.id)}
                title="Unterseite erstellen"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {hasChildren && isExpanded && (
              <PageTree
                pages={pages}
                parentId={page.id}
                depth={depth + 1}
                pathname={pathname}
                onAddChild={onAddChild}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

export function AppSidebarContent() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [templatesParentId, setTemplatesParentId] = useState<string | null>(null)

  const userEmail = session?.user?.email ?? ""
  const userName = session?.user?.name ?? userEmail.split("@")[0]
  const userInitials = userName.slice(0, 2).toUpperCase()

  useEffect(() => {
    if (!session?.user) return
    fetch("/api/workspaces")
      .then((r) => r.json())
      .then((data: Workspace[]) => {
        if (!Array.isArray(data)) return
        setWorkspaces(data)
        const savedId = localStorage.getItem("luma-active-workspace")
        const saved = data.find((w) => w.id === savedId)
        setActiveWorkspace(saved ?? data[0] ?? null)
      })
      .catch(() => {})
  }, [session])

  useEffect(() => {
    if (!activeWorkspace) return
    fetch(`/api/pages?workspaceId=${activeWorkspace.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPages(data)
      })
      .catch(() => {})
  }, [activeWorkspace])

  function selectWorkspace(ws: Workspace) {
    setActiveWorkspace(ws)
    setPages([])
    localStorage.setItem("luma-active-workspace", ws.id)
  }

  function openTemplates(parentId: string | null = null) {
    setTemplatesParentId(parentId)
    setTemplatesOpen(true)
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Workspace switcher */}
      <div className="border-b p-4">
        {activeWorkspace ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
                  <span className="text-sm font-medium text-primary-foreground">
                    {activeWorkspace.name[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col items-start">
                  <span className="truncate text-sm font-medium">{activeWorkspace.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {planLabel[activeWorkspace.plan]}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              {workspaces.map((ws) => (
                <DropdownMenuItem key={ws.id} className="gap-2 p-2" onClick={() => selectWorkspace(ws)}>
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
                    <span className="text-xs font-medium">{ws.name[0].toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{ws.name}</span>
                    <span className="text-xs text-muted-foreground">{planLabel[ws.plan]}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              <Separator className="my-1" />
              <DropdownMenuItem asChild className="gap-2 p-2">
                <Link href="/dashboard">
                  <Plus className="h-4 w-4" />
                  <span>Workspace verwalten</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/dashboard"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Building2 className="h-4 w-4" />
            <span>Workspace erstellen</span>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Suchen..." className="bg-background pl-8" />
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-auto p-3">
        {/* Navigation */}
        <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </p>
        <nav className="flex flex-col gap-0.5">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <Separator className="my-3" />

        {/* Favoriten */}
        <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Favoriten
        </p>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
            <Star className="h-4 w-4 shrink-0 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/60">Noch keine Favoriten</span>
          </div>
        </div>

        <Separator className="my-3" />

        {/* Workspace pages */}
        {activeWorkspace && (
          <>
            <div className="flex items-center justify-between px-2 mb-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
                {activeWorkspace.name}
              </p>
              <button
                onClick={() => openTemplates(null)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title="Seite erstellen"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {pages.length === 0 ? (
              <button
                onClick={() => openTemplates(null)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground/60 transition-colors hover:bg-accent/50 hover:text-muted-foreground"
              >
                <Plus className="h-3 w-3" />
                <span>Seite hinzufügen</span>
              </button>
            ) : (
              <PageTree
                pages={pages}
                parentId={null}
                depth={0}
                pathname={pathname}
                onAddChild={(pid) => openTemplates(pid)}
              />
            )}
          </>
        )}
      </div>

      <Separator />

      <TemplatesDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        workspaceId={activeWorkspace?.id ?? null}
        parentId={templatesParentId}
        onCreated={(page) =>
          setPages((prev) => [...prev, { id: page.id, title: page.title, parentId: templatesParentId }])
        }
      />

      {/* User footer */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{userName}</span>
            <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild title="Einstellungen">
              <Link href="/settings">
                <Settings className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Abmelden"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
