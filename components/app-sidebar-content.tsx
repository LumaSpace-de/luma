"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { TemplatesDialog } from "@/components/templates-dialog"
import {
  BarChart2,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  Home,
  Lock,
  LogOut,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Smile,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type WorkspacePlan = "free" | "enterprise"
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
  icon: string | null
}

type FavoritePage = { id: string; title: string; icon: string | null }

const EMOJI_OPTIONS = [
  "📄","📝","📌","⭐","🎯","📊","💡","🗂️","📂","🔔",
  "🏠","✅","💼","📅","🚀","🎨","💬","🔗","📋","🔒",
  "💰","🎁","✏️","🌟","❤️","🔍",
]

const navigationItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Calendar, label: "Kalender", href: "/calendar" },
  { icon: Mail, label: "Inbox", href: "/inbox" },
  { icon: BarChart2, label: "Statistiken", href: "/statistics" },
]

const planLabel: Record<WorkspacePlan, string> = {
  free: "Free Plan",
  enterprise: "Enterprise Plan",
}

function loadFavorites(): FavoritePage[] {
  try {
    return JSON.parse(localStorage.getItem("luma-favorites") ?? "[]")
  } catch { return [] }
}

function saveFavorites(favs: FavoritePage[]) {
  localStorage.setItem("luma-favorites", JSON.stringify(favs))
}

function PageTree({
  pages,
  parentId,
  depth,
  pathname,
  canCreate,
  canRename,
  canDelete,
  favorites,
  onAddChild,
  onDelete,
  onRename,
  onFavorite,
  onIconChange,
}: {
  pages: Page[]
  parentId: string | null
  depth: number
  pathname: string
  canCreate: boolean
  canRename: boolean
  canDelete: boolean
  favorites: Set<string>
  onAddChild: (parentId: string) => void
  onDelete: (id: string) => void
  onRename: (id: string, title: string) => void
  onFavorite: (page: Page) => void
  onIconChange: (id: string, icon: string | null) => void
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
        const isFav = favorites.has(page.id)

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
                  <span className="h-3 w-3" />
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
                <Link href={`/pages/${page.id}`} className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm">
                  {page.icon ? (
                    <span className="shrink-0 text-[13px] leading-none">{page.icon}</span>
                  ) : (
                    <FileText className="h-3.5 w-3.5 shrink-0 opacity-40" />
                  )}
                  <span className="truncate">{page.title}</span>
                </Link>
              )}

              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                {canCreate && (
                  <button
                    className="flex h-4 w-4 items-center justify-center rounded hover:bg-accent"
                    onClick={() => onAddChild(page.id)}
                    title="Unterseite erstellen"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-4 w-4 items-center justify-center rounded hover:bg-accent">
                      <MoreHorizontal className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={4} className="w-48">
                    {canRename && (
                      <DropdownMenuItem className="gap-2 text-xs" onClick={() => startRename(page)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Umbenennen
                      </DropdownMenuItem>
                    )}
                    {canRename && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="gap-2 text-xs">
                        <Smile className="h-3.5 w-3.5" />
                        Icon ändern
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="p-2">
                        <div className="grid grid-cols-6 gap-1">
                          {EMOJI_OPTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => onIconChange(page.id, emoji)}
                              className={cn(
                                "flex h-7 w-7 items-center justify-center rounded text-base hover:bg-accent",
                                page.icon === emoji && "bg-accent ring-1 ring-ring"
                              )}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        {page.icon && (
                          <button
                            onClick={() => onIconChange(page.id, null)}
                            className="mt-1.5 w-full rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
                          >
                            Icon entfernen
                          </button>
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    )}
                    <DropdownMenuItem className="gap-2 text-xs" onClick={() => onFavorite(page)}>
                      <Star className={cn("h-3.5 w-3.5", isFav && "fill-yellow-400 text-yellow-400")} />
                      {isFav ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
                    </DropdownMenuItem>
                    {canDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2 text-xs text-destructive focus:text-destructive"
                          onClick={() => onDelete(page.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Löschen
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                favorites={favorites}
                onAddChild={onAddChild}
                onDelete={onDelete}
                onRename={onRename}
                onFavorite={onFavorite}
                onIconChange={onIconChange}
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

  const [privateWorkspace, setPrivateWorkspace] = useState<Workspace | null>(null)
  const [privatePages, setPrivatePages] = useState<Page[]>([])

  const [favorites, setFavorites] = useState<FavoritePage[]>([])
  const [inboxCount, setInboxCount] = useState(0)
  const [aiOpen, setAiOpen] = useState(false)

  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [templatesParentId, setTemplatesParentId] = useState<string | null>(null)
  const [templatesWorkspaceId, setTemplatesWorkspaceId] = useState<string | null>(null)

  const userEmail = session?.user?.email ?? ""
  const userName = session?.user?.name ?? userEmail.split("@")[0]
  const userInitials = userName.slice(0, 2).toUpperCase()
  const userAvatarUrl = (session?.user as { avatarUrl?: string | null })?.avatarUrl ?? null

  useEffect(() => {
    setFavorites(loadFavorites())
  }, [])

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

    fetch("/api/inbox?count=1")
      .then((r) => r.json())
      .then((d) => { if (typeof d.count === "number") setInboxCount(d.count) })
      .catch(() => {})

    fetch("/api/workspaces/private")
      .then((r) => (r.ok ? r.json() : null))
      .then((ws: Workspace | null) => {
        if (!ws) return
        setPrivateWorkspace(ws)
        fetch(`/api/pages?workspaceId=${ws.id}`)
          .then((r) => r.json())
          .then((data) => { if (Array.isArray(data)) setPrivatePages(data) })
          .catch(() => {})
      })
      .catch(() => {})
  }, [session])

  useEffect(() => {
    if (!activeWorkspace) return
    fetch(`/api/pages?workspaceId=${activeWorkspace.id}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPages(data) })
      .catch(() => {})
  }, [activeWorkspace])

  function selectWorkspace(ws: Workspace) {
    setActiveWorkspace(ws)
    setPages([])
    localStorage.setItem("luma-active-workspace", ws.id)
  }

  function openTemplates(workspaceId: string, parentId: string | null = null) {
    setTemplatesWorkspaceId(workspaceId)
    setTemplatesParentId(parentId)
    setTemplatesOpen(true)
  }

  async function handleDeletePage(id: string) {
    await fetch(`/api/pages/${id}`, { method: "DELETE" })
    setPages((prev) => prev.filter((p) => p.id !== id))
    setPrivatePages((prev) => prev.filter((p) => p.id !== id))
    const newFavs = favorites.filter((f) => f.id !== id)
    setFavorites(newFavs)
    saveFavorites(newFavs)
  }

  async function handleRenamePage(id: string, title: string) {
    await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, title } : p)))
    setPrivatePages((prev) => prev.map((p) => (p.id === id ? { ...p, title } : p)))
    const newFavs = favorites.map((f) => (f.id === id ? { ...f, title } : f))
    setFavorites(newFavs)
    saveFavorites(newFavs)
  }

  async function handleIconChange(id: string, icon: string | null) {
    await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icon }),
    })
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, icon } : p)))
    setPrivatePages((prev) => prev.map((p) => (p.id === id ? { ...p, icon } : p)))
    const newFavs = favorites.map((f) => (f.id === id ? { ...f, icon } : f))
    setFavorites(newFavs)
    saveFavorites(newFavs)
  }

  function handleFavorite(page: Page) {
    const isFav = favorites.some((f) => f.id === page.id)
    const newFavs = isFav
      ? favorites.filter((f) => f.id !== page.id)
      : [...favorites, { id: page.id, title: page.title, icon: page.icon }]
    setFavorites(newFavs)
    saveFavorites(newFavs)
  }

  const favSet = new Set(favorites.map((f) => f.id))
  const activeRole = activeWorkspace?.userRole ?? "viewer"
  const canCreate = activeRole !== "viewer"
  const canRename = activeRole !== "viewer"
  const canDelete = activeRole === "owner" || activeRole === "admin"

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Workspace switcher — top */}
      <div className="border-b p-3">
        {activeWorkspace ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent">
                <div className="h-7 w-7 shrink-0 overflow-hidden rounded-md bg-primary">
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
                  <span className="text-xs text-muted-foreground">{planLabel[activeWorkspace.plan]}</span>
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
                      <span className="flex h-full w-full items-center justify-center text-xs font-medium">
                        {ws.name[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{ws.name}</span>
                    <span className="text-xs text-muted-foreground">{planLabel[ws.plan]}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
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

      {/* Search + AI button */}
      <div className="flex items-center gap-2 p-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Suchen..." className="bg-background pl-8" />
        </div>
        <button
          onClick={() => setAiOpen(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-gradient-to-br from-blue-500/10 to-violet-600/10 text-violet-400 transition-colors hover:from-blue-500/20 hover:to-violet-600/20 hover:text-violet-300"
          title="AI Assistent"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto px-3 pb-3">
        {/* Navigation */}
        <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </p>
        <nav className="flex flex-col gap-0.5">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            const badge = item.href === "/inbox" && inboxCount > 0 ? inboxCount : null
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
                <span className="flex-1">{item.label}</span>
                {badge !== null && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Privat Bereich */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between px-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Lock className="h-3 w-3" />
              Privat
            </p>
            {privateWorkspace && (
              <button
                onClick={() => openTemplates(privateWorkspace.id, null)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title="Private Seite erstellen"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {privateWorkspace ? (
            privatePages.length === 0 ? (
              <button
                onClick={() => openTemplates(privateWorkspace.id, null)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground/60 transition-colors hover:bg-accent/50 hover:text-muted-foreground"
              >
                <Plus className="h-3 w-3" />
                <span>Private Seite hinzufügen</span>
              </button>
            ) : (
              <PageTree
                pages={privatePages}
                parentId={null}
                depth={0}
                pathname={pathname}
                canCreate={true}
                canRename={true}
                canDelete={true}
                favorites={favSet}
                onAddChild={(pid) => openTemplates(privateWorkspace.id, pid)}
                onDelete={handleDeletePage}
                onRename={handleRenamePage}
                onFavorite={handleFavorite}
                onIconChange={handleIconChange}
              />
            )
          ) : (
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
              <span className="text-xs text-muted-foreground/50">Wird geladen…</span>
            </div>
          )}
        </div>

        {/* Favoriten — no separator above */}
        <div className="mt-4">
          <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Favoriten
          </p>
          {favorites.length === 0 ? (
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
              <Star className="h-4 w-4 shrink-0 text-muted-foreground/40" />
              <span className="text-xs text-muted-foreground/60">Noch keine Favoriten</span>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {favorites.map((fav) => {
                const active = pathname === `/pages/${fav.id}`
                return (
                  <Link
                    key={fav.id}
                    href={`/pages/${fav.id}`}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    {fav.icon ? (
                      <span className="h-4 w-4 shrink-0 text-center text-[11px]">{fav.icon}</span>
                    ) : (
                      <FileText className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate">{fav.title}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Workspace pages — fixed at bottom above user footer */}
      {activeWorkspace && (
        <div className="max-h-60 overflow-auto px-3 py-3">
          <div className="mb-1 flex items-center justify-between px-2">
            <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {activeWorkspace.name}
            </p>
            {canCreate && (
              <button
                onClick={() => openTemplates(activeWorkspace.id, null)}
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
                onClick={() => openTemplates(activeWorkspace.id, null)}
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
              favorites={favSet}
              onAddChild={(pid) => openTemplates(activeWorkspace.id, pid)}
              onDelete={handleDeletePage}
              onRename={handleRenamePage}
              onFavorite={handleFavorite}
              onIconChange={handleIconChange}
            />
          )}
        </div>
      )}

      <Separator />

      <TemplatesDialog
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        workspaceId={templatesWorkspaceId ?? activeWorkspace?.id ?? null}
        parentId={templatesParentId}
        onCreated={(page) => {
          const newPage: Page = { id: page.id, title: page.title, parentId: templatesParentId, icon: null }
          if (templatesWorkspaceId === privateWorkspace?.id) {
            setPrivatePages((prev) => [...prev, newPage])
          } else {
            setPages((prev) => [...prev, newPage])
          }
        }}
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
