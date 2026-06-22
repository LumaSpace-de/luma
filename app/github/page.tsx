"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import {
  ArrowLeft,
  Building2,
  ChevronRight,
  File,
  Folder,
  GitBranch,
  Lock,
  PanelLeft,
  Star,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"
import { cn } from "@/lib/utils"

interface Repo {
  id: number
  name: string
  fullName: string
  description: string | null
  private: boolean
  language: string | null
  updatedAt: string
  stargazersCount: number
  owner: { login: string; avatarUrl: string }
}

interface Org {
  login: string
  avatarUrl: string
  description: string | null
}

interface DirItem {
  name: string
  path: string
  type: "file" | "dir"
  size: number
}

interface FileData {
  name: string
  path: string
  size: number
  content: string
  encoding: string
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Rust: "bg-orange-500",
  Go: "bg-cyan-500",
  Java: "bg-red-500",
  HTML: "bg-orange-400",
  CSS: "bg-purple-500",
  Shell: "bg-emerald-500",
  Ruby: "bg-red-400",
  PHP: "bg-violet-500",
  "C++": "bg-pink-500",
  C: "bg-gray-400",
  "C#": "bg-green-600",
  Swift: "bg-orange-600",
  Kotlin: "bg-purple-400",
  Dart: "bg-blue-400",
  Vue: "bg-emerald-400",
  SCSS: "bg-pink-400",
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `vor ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `vor ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `vor ${days}d`
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "short" })
}

function getFileExtension(name: string): string {
  const parts = name.split(".")
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ""
}

export default function GitHubPage() {
  const { toggle } = useInlineSidebar()

  const [connected, setConnected] = useState<boolean | null>(null)
  const [ghUsername, setGhUsername] = useState("")
  const [repos, setRepos] = useState<Repo[]>([])
  const [orgs, setOrgs] = useState<Org[]>([])
  const [activeFilter, setActiveFilter] = useState<string | null>(null) // null = alle, "user" = eigene, org login = org
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [reposLoading, setReposLoading] = useState(false)

  // Browser state
  const [activeRepo, setActiveRepo] = useState<Repo | null>(null)
  const [currentPath, setCurrentPath] = useState("")
  const [dirItems, setDirItems] = useState<DirItem[]>([])
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [browsing, setBrowsing] = useState(false)

  useEffect(() => {
    fetch("/api/github/status")
      .then((r) => r.json())
      .then((status) => {
        if (!status.connected) {
          setConnected(false)
          setLoading(false)
          return
        }
        setConnected(true)
        setGhUsername(status.username ?? "")

        Promise.all([
          fetch("/api/github/repos").then((r) => r.ok ? r.json() : []),
          fetch("/api/github/orgs").then((r) => r.ok ? r.json() : []),
        ]).then(([repoData, orgData]) => {
          setRepos(Array.isArray(repoData) ? repoData : [])
          if (orgData && Array.isArray(orgData)) setOrgs(orgData)
          setLoading(false)
        })
      })
      .catch(() => setLoading(false))
  }, [])

  async function selectFilter(filter: string | null) {
    setActiveFilter(filter)
    setSearch("")

    if (filter && filter !== "user") {
      setReposLoading(true)
      const res = await fetch(`/api/github/repos?org=${encodeURIComponent(filter)}`)
      if (res.ok) {
        const data = await res.json()
        setRepos(Array.isArray(data) ? data : [])
      }
      setReposLoading(false)
    } else {
      setReposLoading(true)
      const res = await fetch("/api/github/repos")
      if (res.ok) {
        const data = await res.json()
        setRepos(Array.isArray(data) ? data : [])
      }
      setReposLoading(false)
    }
  }

  function openRepo(repo: Repo) {
    setActiveRepo(repo)
    setCurrentPath("")
    setFileData(null)
    loadDir(repo.fullName, "")
  }

  async function loadDir(fullName: string, path: string) {
    setBrowsing(true)
    const [owner, repo] = fullName.split("/")
    const res = await fetch(`/api/github/repos/${owner}/${repo}/contents?path=${encodeURIComponent(path)}`)
    const data = await res.json()
    if (data.type === "dir") {
      const sorted = [...data.items].sort((a: DirItem, b: DirItem) => {
        if (a.type !== b.type) return a.type === "dir" ? -1 : 1
        return a.name.localeCompare(b.name)
      })
      setDirItems(sorted)
      setFileData(null)
      setCurrentPath(path)
    }
    setBrowsing(false)
  }

  async function openFile(fullName: string, path: string) {
    setBrowsing(true)
    const [owner, repo] = fullName.split("/")
    const res = await fetch(`/api/github/repos/${owner}/${repo}/contents?path=${encodeURIComponent(path)}`)
    const data = await res.json()
    if (data.type === "file") {
      setFileData(data)
      setCurrentPath(path)
    }
    setBrowsing(false)
  }

  function navigateUp() {
    if (!activeRepo) return
    if (fileData) {
      const parentPath = currentPath.split("/").slice(0, -1).join("/")
      setFileData(null)
      loadDir(activeRepo.fullName, parentPath)
      return
    }
    if (!currentPath) {
      setActiveRepo(null)
      setDirItems([])
      return
    }
    const parentPath = currentPath.split("/").slice(0, -1).join("/")
    loadDir(activeRepo.fullName, parentPath)
  }

  function handleItemClick(item: DirItem) {
    if (!activeRepo) return
    if (item.type === "dir") {
      loadDir(activeRepo.fullName, item.path)
    } else {
      openFile(activeRepo.fullName, item.path)
    }
  }

  const pathParts = currentPath ? currentPath.split("/") : []

  const filteredRepos = repos.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? "").toLowerCase().includes(search.toLowerCase())
    if (activeFilter === "user") return matchesSearch && r.owner.login === ghUsername
    return matchesSearch
  })

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
            <PanelLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold tracking-tight">GitHub</h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
                style={{ animation: `luma-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
          <style>{`@keyframes luma-pulse{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
        </div>
      </div>
    )
  }

  // --- Not connected ---
  if (connected === false) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
            <PanelLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold tracking-tight">GitHub</h1>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <GitBranch className="h-12 w-12 text-muted-foreground/30" />
          <div>
            <h2 className="text-lg font-semibold">GitHub nicht verbunden</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Verbinde deinen GitHub-Account in den Einstellungen, um deine Repositories hier zu sehen.
            </p>
          </div>
          <Button asChild>
            <Link href="/settings">Zu den Einstellungen</Link>
          </Button>
        </div>
      </div>
    )
  }

  // --- File viewer ---
  if (activeRepo && fileData) {
    let decoded = ""
    try {
      decoded = atob(fileData.content.replace(/\n/g, ""))
    } catch {
      decoded = fileData.content
    }
    const ext = getFileExtension(fileData.name)
    const isImage = ["png", "jpg", "jpeg", "gif", "svg", "webp", "ico"].includes(ext)
    const lines = decoded.split("\n")

    return (
      <div className="flex h-full flex-col">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={navigateUp}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <button onClick={() => { setActiveRepo(null); setDirItems([]); setFileData(null) }} className="hover:text-foreground">
              {activeRepo.owner.login}
            </button>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => { setFileData(null); loadDir(activeRepo.fullName, "") }} className="hover:text-foreground">
              {activeRepo.name}
            </button>
            {pathParts.map((part, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                {i < pathParts.length - 1 ? (
                  <button
                    onClick={() => {
                      setFileData(null)
                      loadDir(activeRepo.fullName, pathParts.slice(0, i + 1).join("/"))
                    }}
                    className="hover:text-foreground"
                  >
                    {part}
                  </button>
                ) : (
                  <span className="font-medium text-foreground">{part}</span>
                )}
              </span>
            ))}
          </div>
          <span className="ml-auto text-xs text-muted-foreground">{formatBytes(fileData.size)}</span>
        </div>

        <div className="flex-1 overflow-auto">
          {isImage ? (
            <div className="flex items-center justify-center p-8">
              <img
                src={`data:image/${ext};base64,${fileData.content.replace(/\n/g, "")}`}
                alt={fileData.name}
                className="max-h-[70vh] max-w-full rounded-lg border"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-mono text-sm">
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className="hover:bg-accent/30">
                      <td className="select-none border-r px-3 py-0.5 text-right text-xs text-muted-foreground/40">
                        {i + 1}
                      </td>
                      <td className="whitespace-pre px-4 py-0.5">
                        {line}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- Directory browser ---
  if (activeRepo) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={navigateUp}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <button onClick={() => { setActiveRepo(null); setDirItems([]) }} className="hover:text-foreground">
              {activeRepo.owner.login}
            </button>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => loadDir(activeRepo.fullName, "")} className="font-medium text-foreground hover:text-foreground">
              {activeRepo.name}
            </button>
            {pathParts.map((part, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                {i < pathParts.length - 1 ? (
                  <button
                    onClick={() => loadDir(activeRepo.fullName, pathParts.slice(0, i + 1).join("/"))}
                    className="hover:text-foreground"
                  >
                    {part}
                  </button>
                ) : (
                  <span className="font-medium text-foreground">{part}</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {browsing ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
                    style={{ animation: `luma-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
              <style>{`@keyframes luma-pulse{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
            </div>
          ) : (
            <div className="divide-y">
              {dirItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleItemClick(item)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-accent/50"
                >
                  {item.type === "dir" ? (
                    <Folder className="h-4 w-4 shrink-0 text-blue-400" />
                  ) : (
                    <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.type === "file" && (
                    <span className="text-xs text-muted-foreground">{formatBytes(item.size)}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- Repo list with org filter ---
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">GitHub</h1>
        <span className="text-sm text-muted-foreground">@{ghUsername}</span>
      </div>

      {/* Owner / Org filter tabs */}
      {orgs.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto border-b px-4 py-2">
          <button
            onClick={() => selectFilter(null)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              activeFilter === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            Alle
          </button>
          <button
            onClick={() => selectFilter("user")}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              activeFilter === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <User className="h-3 w-3" />
            {ghUsername}
          </button>
          {orgs.map((org) => (
            <button
              key={org.login}
              onClick={() => selectFilter(org.login)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                activeFilter === org.login
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {org.avatarUrl ? (
                <img src={org.avatarUrl} alt={org.login} className="h-4 w-4 rounded-full" />
              ) : (
                <Building2 className="h-3 w-3" />
              )}
              {org.login}
            </button>
          ))}
        </div>
      )}

      <div className="p-4">
        <Input
          placeholder="Repository suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-background"
        />
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        {reposLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
                  style={{ animation: `luma-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
            <style>{`@keyframes luma-pulse{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>
          </div>
        ) : (
          <div className="grid gap-2">
            {filteredRepos.map((repo) => (
              <button
                key={repo.id}
                onClick={() => openRepo(repo)}
                className="flex flex-col gap-1 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-2">
                  {repo.owner.login !== ghUsername && (
                    <span className="text-xs text-muted-foreground">{repo.owner.login}/</span>
                  )}
                  <span className="truncate text-sm font-medium text-foreground">{repo.name}</span>
                  {repo.private && <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />}
                </div>
                {repo.description && (
                  <p className="line-clamp-1 text-xs text-muted-foreground">{repo.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span className={cn("h-2 w-2 rounded-full", LANG_COLORS[repo.language] ?? "bg-gray-500")} />
                      {repo.language}
                    </span>
                  )}
                  {repo.stargazersCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3" />
                      {repo.stargazersCount}
                    </span>
                  )}
                  <span>{formatDate(repo.updatedAt)}</span>
                </div>
              </button>
            ))}
            {filteredRepos.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {search ? "Keine Repositories gefunden" : "Keine Repositories vorhanden"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
