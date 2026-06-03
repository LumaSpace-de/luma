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
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

type WorkspaceRole = "owner" | "admin" | "member" | "viewer"

interface Workspace {
  id: string
  name: string
  plan: WorkspacePlan
  ownerId: string
  imageUrl: string | null
  userRole: WorkspaceRole
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
  canCreate,
  canRename,
  canDelete,
  onAddChild,
  onDelete,
  onRename,
}: {
  pages: Page[]
  parentId: string | null
  depth: number
  pathname: string
  canCreate: boolean
  canRename: boolean
  canDelete: boolean
  onAddChild: (parentId: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, title: string) => void
}) {
  const children = pages.filter((p) => p.parentId === parentId)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  function startRename(page: Page) {
    setRenamingId(page.id)
    setRenameValue(page.title)
  }

  function commitRename(id: string) {
    if (renameValue.trim()) onRename(id, renameValue.trim())
    setRenamingId(null)
  }

  return (
    <>
      {children.map((page) => {
        const hasChildren = pages.some((p) => p.parentId === page.id)
        const isExpanded = expanded[page.id] ?? true
        const active = pathname === `/pages/${page.id}`
        const isRenaming = renamingId === page.id

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
                  isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
                ) : (
                  <FileText className="h-3 w-3 opacity-50" />
                )}
              </button>

              {isRenaming ? (
                <input
                  autoFocus
                  className="flex-1 rounded bg-background px-1 text-xs outline-none ring-1 ring-ring"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => commitRename(page.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename(page.id)
                    if (e.key === "Escape") setRenamingId(null)
                  }}
                />
              ) : (
                <Link href={`/pages/${page.id}`} className="flex-1 truncate text-sm">
                  {page.title}
                </Link>
              )}

              {(canCreate || canRename || canDelete) && (
                <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                  {canCreate && (
                    <button
                      className="flex h-4 w-4 items-center justify-center rounded hover:bg-accent"
                      onClick={() => onAddChild(page.id)}
                      title="Unterseite erstellen"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                  {(canRename || canDelete) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-4 w-4 items-center justify-center rounded hover:bg-accent">
                          <MoreHorizontal className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-40">
                        {canRename && (
                          <DropdownMenuItem className="gap-2 text-xs" onClick={() => startRename(page)}>
                            <Pencil className="h-3.5 w-3.5" />
                            Umbenennen
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem
                            className="gap-2 text-xs text-destructive focus:text-destructive"
                            onClick={() => onDelete(page.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Löschen
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </div>

            {hasChildren && isExpanded && (
              <PageTree
                pages={pages}
                parentId={page.id}
                depth={depth + 1}
                pathname={pathname}
                canCreate={canCreate}
                canRename={canRename}
                canDelete={canDelete}
                onAddChild={onAddChild}
                onDelete={onDelete}
                onRename={onRename}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

export function AppSidebarContent({ onClose }: { onClose?: () => void } = {}) {
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
  const userAvatarUrl = (session?.user as { avatarUrl?: string | null })?.avatarUrl ?? null

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

  async function handleDeletePage(id: string) {
    await fetch(`/api/pages/${id}`, { method: "DELETE" })
    setPages((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleRenamePage(id: string, title: string) {
    await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, title } : p)))
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Workspace switcher */}
      <div className="border-b p-4">
        {activeWorkspace ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md bg-primary">
                  {activeWorkspace.imageUrl ? (
                    <img src={activeWorkspace.imageUrl} alt={activeWorkspace.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-medium text-primary-foreground">
                      {activeWorkspace.name[0].toUpperCase()}
                    </span>
                  )}
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
                  <div className="h-6 w-6 shrink-0 overflow-hidden rounded bg-muted">
                    {ws.imageUrl ? (
                      <img src={ws.imageUrl} alt={ws.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs font-medium">{ws.name[0].toUpperCase()}</span>
                    )}
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
                onClick={onClose}
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
        {activeWorkspace && (() => {
          const role = activeWorkspace.userRole
          const canCreate = role === "owner" || role === "admin" || role === "member"
          const canRename = role === "owner" || role === "admin" || role === "member"
          const canDelete = role === "owner" || role === "admin"
          return (
            <>
              <div className="flex items-center justify-between px-2 mb-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
                  {activeWorkspace.name}
                </p>
                {canCreate && (
                  <button
                    onClick={() => openTemplates(null)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    title="Seite erstellen"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {pages.length === 0 ? (
                canCreate ? (
                  <button
                    onClick={() => openTemplates(null)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground/60 transition-colors hover:bg-accent/50 hover:text-muted-foreground"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Seite hinzufügen</span>
                  </button>
                ) : (
                  <p className="px-2 text-xs text-muted-foreground/50">Keine Seiten vorhanden</p>
                )
              ) : (
                <PageTree
                  pages={pages}
                  parentId={null}
                  depth={0}
                  pathname={pathname}
                  canCreate={canCreate}
                  canRename={canRename}
                  canDelete={canDelete}
                  onAddChild={(pid) => openTemplates(pid)}
                  onDelete={handleDeletePage}
                  onRename={handleRenamePage}
                />
              )}
            </>
          )
        })()}
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
            {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName} />}
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
