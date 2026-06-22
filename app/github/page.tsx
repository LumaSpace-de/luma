"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import {
  ArrowLeft,
  Building2,
  Check,
  ChevronRight,
  File,
  Folder,
  GitBranch,
  Lock,
  PanelLeft,
  Pencil,
  Star,
  User,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"
import { cn } from "@/lib/utils"

function decodeBase64Utf8(base64: string): string {
  try {
    const binary = atob(base64.replace(/\n/g, ""))
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new TextDecoder("utf-8").decode(bytes)
  } catch {
    return base64
  }
}

function encodeUtf8Base64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export interface GhFavoriteRepo {
  fullName: string
  name: string
  owner: string
}

const GH_FAV_KEY = "luma-github-favorites"

function loadGhFavorites(): GhFavoriteRepo[] {
  try { return JSON.parse(localStorage.getItem(GH_FAV_KEY) ?? "[]") } catch { return [] }
}

function saveGhFavorites(favs: GhFavoriteRepo[]) {
  localStorage.setItem(GH_FAV_KEY, JSON.stringify(favs))
  window.dispatchEvent(new Event("gh-favorites-changed"))
}

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
  sha: string
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

const SYN = {
  keyword: "#cba6f7",
  string: "#a6e3a1",
  comment: "#6c7086",
  number: "#fab387",
  tag: "#89b4fa",
  attr: "#f9e2af",
  type: "#f9e2af",
  func: "#89b4fa",
  operator: "#89dceb",
  punct: "#9399b2",
  text: "#cdd6f4",
}

const JS_KEYWORDS = new Set([
  "import","export","from","default","function","const","let","var","return",
  "if","else","for","while","do","switch","case","break","continue","throw",
  "try","catch","finally","new","delete","typeof","instanceof","void","in","of",
  "class","extends","super","this","static","async","await","yield",
  "true","false","null","undefined","interface","type","enum","implements",
  "public","private","protected","readonly","abstract","declare","module",
  "namespace","require","as","is",
])

const PY_KEYWORDS = new Set([
  "import","from","def","class","return","if","elif","else","for","while",
  "try","except","finally","with","as","yield","raise","pass","break",
  "continue","and","or","not","is","in","True","False","None","self",
  "lambda","global","nonlocal","del","assert","async","await",
])

function highlightLine(line: string, ext: string): React.ReactNode[] {
  if (!line) return [<span key="e">{" "}</span>]

  const isPy = ext === "py"
  const isRust = ext === "rs"
  const isGo = ext === "go"
  const isJson = ext === "json"
  const isCss = ext === "css" || ext === "scss"
  const isHtml = ext === "html" || ext === "xml" || ext === "svg"
  const isShell = ext === "sh" || ext === "bash"
  const isMd = ext === "md"
  const keywords = isPy ? PY_KEYWORDS : JS_KEYWORDS

  const tokens: React.ReactNode[] = []
  let i = 0
  let key = 0

  function push(text: string, color: string) {
    tokens.push(<span key={key++} style={{ color }}>{text}</span>)
  }

  while (i < line.length) {
    // Line comments
    if (line[i] === "/" && line[i + 1] === "/") {
      push(line.substring(i), SYN.comment); return tokens
    }
    if (isPy && line[i] === "#") {
      push(line.substring(i), SYN.comment); return tokens
    }
    if (isShell && line[i] === "#") {
      push(line.substring(i), SYN.comment); return tokens
    }
    // Block comment start
    if (line[i] === "/" && line[i + 1] === "*") {
      const end = line.indexOf("*/", i + 2)
      if (end !== -1) {
        push(line.substring(i, end + 2), SYN.comment); i = end + 2; continue
      }
      push(line.substring(i), SYN.comment); return tokens
    }

    // Strings
    if (line[i] === '"' || line[i] === "'" || line[i] === "`") {
      const q = line[i]
      let j = i + 1
      while (j < line.length && line[j] !== q) { if (line[j] === "\\") j++; j++ }
      push(line.substring(i, j + 1), SYN.string); i = j + 1; continue
    }

    // JSX/HTML tags
    if (line[i] === "<" && !isJson && (line[i + 1]?.match(/[A-Za-z\/]/) || line[i + 1] === "!")) {
      const end = line.indexOf(">", i)
      if (end !== -1) {
        const tag = line.substring(i, end + 1)
        // Color tag name and attributes differently
        const parts = tag.match(/^(<\/?)([\w.-]+)([\s\S]*?)(\/?>)$/)
        if (parts) {
          push(parts[1], SYN.punct)
          push(parts[2], SYN.tag)
          if (parts[3]) {
            // Highlight attributes
            const attrStr = parts[3]
            const attrParts = attrStr.split(/("[^"]*"|'[^']*'|{[^}]*})/)
            for (const ap of attrParts) {
              if (ap.startsWith('"') || ap.startsWith("'")) push(ap, SYN.string)
              else if (ap.startsWith("{")) push(ap, SYN.text)
              else if (ap.includes("=")) {
                const [name, ...rest] = ap.split("=")
                push(name, SYN.attr)
                if (rest.length) push("=" + rest.join("="), SYN.punct)
              } else push(ap, SYN.attr)
            }
          }
          push(parts[4], SYN.punct)
        } else {
          push(tag, SYN.tag)
        }
        i = end + 1; continue
      }
    }

    // Numbers
    if (/[0-9]/.test(line[i]) && (i === 0 || /[\s=:,([\-+*/%!<>&|^~?]/.test(line[i - 1]))) {
      let j = i
      while (j < line.length && /[0-9a-fA-FxXoObBeE._n]/.test(line[j])) j++
      push(line.substring(i, j), SYN.number); i = j; continue
    }

    // Words (keywords, identifiers)
    if (/[a-zA-Z_$@]/.test(line[i])) {
      let j = i
      while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++
      const word = line.substring(i, j)
      if (keywords.has(word)) {
        push(word, SYN.keyword)
      } else if (/^[A-Z]/.test(word)) {
        push(word, SYN.type)
      } else if (line[j] === "(") {
        push(word, SYN.func)
      } else {
        push(word, SYN.text)
      }
      i = j; continue
    }

    // Operators
    if (/[=+\-*/%<>!&|^~?:]/.test(line[i])) {
      let j = i
      while (j < line.length && /[=+\-*/%<>!&|^~?:]/.test(line[j])) j++
      push(line.substring(i, j), SYN.operator); i = j; continue
    }

    // Brackets/punctuation
    if (/[{}()[\],;.]/.test(line[i])) {
      push(line[i], SYN.punct); i++; continue
    }

    // Default
    push(line[i], SYN.text); i++
  }
  return tokens
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
  const searchParams = useSearchParams()

  const [connected, setConnected] = useState<boolean | null>(null)
  const [ghUsername, setGhUsername] = useState("")
  const [repos, setRepos] = useState<Repo[]>([])
  const [orgs, setOrgs] = useState<Org[]>([])
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [reposLoading, setReposLoading] = useState(false)
  const [ghFavorites, setGhFavorites] = useState<GhFavoriteRepo[]>([])

  // Browser state
  const [activeRepo, setActiveRepo] = useState<Repo | null>(null)
  const [currentPath, setCurrentPath] = useState("")
  const [dirItems, setDirItems] = useState<DirItem[]>([])
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [browsing, setBrowsing] = useState(false)

  // Editor state
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [commitMsg, setCommitMsg] = useState("")
  const [commitDialogOpen, setCommitDialogOpen] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [commitError, setCommitError] = useState("")
  const [commitSuccess, setCommitSuccess] = useState("")
  const [cursorLine, setCursorLine] = useState(1)
  const [cursorCol, setCursorCol] = useState(1)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setGhFavorites(loadGhFavorites())
  }, [])

  function toggleFavorite(repo: Repo) {
    const current = loadGhFavorites()
    const exists = current.some((f) => f.fullName === repo.fullName)
    const next = exists
      ? current.filter((f) => f.fullName !== repo.fullName)
      : [...current, { fullName: repo.fullName, name: repo.name, owner: repo.owner.login }]
    saveGhFavorites(next)
    setGhFavorites(next)
  }

  const favSet = new Set(ghFavorites.map((f) => f.fullName))

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
          const repoList: Repo[] = Array.isArray(repoData) ? repoData : []
          setRepos(repoList)
          if (orgData && Array.isArray(orgData)) setOrgs(orgData)

          const repoParam = searchParams.get("repo")
          if (repoParam) {
            const match = repoList.find((r) => r.fullName === repoParam)
            if (match) {
              setActiveRepo(match)
              loadDir(match.fullName, "")
            }
          }

          setLoading(false)
        })
      })
      .catch(() => setLoading(false))
  }, [searchParams])

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

  function startEditing() {
    if (!fileData) return
    setEditContent(decodeBase64Utf8(fileData.content))
    setEditing(true)
    setCursorLine(1)
    setCursorCol(1)
    setCommitError("")
    setCommitSuccess("")
  }

  function updateCursorPos(el: HTMLTextAreaElement) {
    const pos = el.selectionStart
    const text = el.value.substring(0, pos)
    const line = text.split("\n").length
    const col = pos - text.lastIndexOf("\n")
    setCursorLine(line)
    setCursorCol(col)
  }

  function handleEditorKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const val = ta.value
      if (e.shiftKey) {
        const lineStart = val.lastIndexOf("\n", start - 1) + 1
        const lineText = val.substring(lineStart, start)
        const spaces = lineText.match(/^ {1,2}/)?.[0].length ?? 0
        if (spaces > 0) {
          const next = val.substring(0, lineStart) + val.substring(lineStart + spaces)
          setEditContent(next)
          setTimeout(() => { ta.selectionStart = ta.selectionEnd = start - spaces }, 0)
        }
      } else {
        const next = val.substring(0, start) + "  " + val.substring(end)
        setEditContent(next)
        setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2 }, 0)
      }
    }
  }

  const handleEditorScroll = useCallback(() => {
    if (editorRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop
    }
  }, [])

  function cancelEditing() {
    setEditing(false)
    setCommitDialogOpen(false)
    setCommitMsg("")
    setCommitError("")
    setCommitSuccess("")
  }

  async function handleCommit() {
    if (!activeRepo || !fileData || !commitMsg.trim()) return
    setCommitting(true)
    setCommitError("")

    const [owner, repo] = activeRepo.fullName.split("/")
    const res = await fetch(`/api/github/repos/${owner}/${repo}/contents`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: fileData.path,
        content: editContent,
        message: commitMsg.trim(),
        sha: fileData.sha,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setCommitError(data.error ?? "Commit fehlgeschlagen")
      setCommitting(false)
      return
    }

    setFileData({ ...fileData, content: encodeUtf8Base64(editContent), sha: data.sha })
    setCommitSuccess("Commit erfolgreich!")
    setEditing(false)
    setCommitDialogOpen(false)
    setCommitMsg("")
    setCommitting(false)
    setTimeout(() => setCommitSuccess(""), 3000)
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

  // --- File viewer / editor ---
  if (activeRepo && fileData) {
    const decoded = decodeBase64Utf8(fileData.content)
    const ext = getFileExtension(fileData.name)
    const isImage = ["png", "jpg", "jpeg", "gif", "svg", "webp", "ico"].includes(ext)
    const isBinary = isImage || ["pdf", "zip", "tar", "gz", "woff", "woff2", "ttf", "eot", "mp3", "mp4"].includes(ext)
    const allViewLines = decoded.split("\n")
    const MAX_RENDER = 3000
    const truncated = allViewLines.length > MAX_RENDER
    const viewLines = truncated ? allViewLines.slice(0, MAX_RENDER) : allViewLines
    const useHighlight = allViewLines.length <= 1500
    const editLines = editing ? editContent.split("\n") : viewLines
    const totalLines = editing ? editLines.length : allViewLines.length

    return (
      <div className="flex h-full flex-col bg-[#11111b]">
        {/* Tab bar */}
        <div className="flex h-9 shrink-0 items-center border-b border-[#1e1e2e] bg-[#0b0b12]">
          <div className="flex items-center gap-0 overflow-x-auto">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-none text-[#6c7086] hover:text-[#cdd6f4]" onClick={toggle}>
              <PanelLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-none text-[#6c7086] hover:text-[#cdd6f4]" onClick={() => { cancelEditing(); navigateUp() }}>
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <div className="flex h-9 items-center gap-1.5 border-b-2 border-[#89b4fa] bg-[#11111b] px-3">
              <File className="h-3.5 w-3.5 text-[#89b4fa]" />
              <span className="text-xs font-medium text-[#cdd6f4]">{fileData.name}</span>
              {editing && <span className="ml-0.5 h-2 w-2 rounded-full bg-[#f9e2af]" title="Ungespeicherte Änderungen" />}
            </div>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 px-3">
            {commitSuccess && (
              <span className="flex items-center gap-1 text-xs text-[#a6e3a1]">
                <Check className="h-3 w-3" />
                {commitSuccess}
              </span>
            )}
            {!isBinary && !editing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 rounded px-2 text-xs text-[#89b4fa] hover:bg-[#1e1e2e] hover:text-[#89b4fa]"
                onClick={startEditing}
              >
                <Pencil className="h-3 w-3" />
                Bearbeiten
              </Button>
            )}
            {editing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 rounded px-2 text-xs text-[#6c7086] hover:bg-[#1e1e2e] hover:text-[#cdd6f4]"
                  onClick={cancelEditing}
                >
                  Abbrechen
                </Button>
                <Button
                  size="sm"
                  className="h-6 gap-1 rounded bg-[#a6e3a1] px-2 text-xs text-[#1e1e2e] hover:bg-[#a6e3a1]/90"
                  onClick={() => setCommitDialogOpen(true)}
                >
                  <Check className="h-3 w-3" />
                  Commit & Push
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex h-7 shrink-0 items-center gap-1 overflow-x-auto border-b border-[#1e1e2e] bg-[#0b0b12] px-3 text-xs text-[#6c7086]">
          <button onClick={() => { cancelEditing(); setActiveRepo(null); setDirItems([]); setFileData(null) }} className="shrink-0 hover:text-[#cdd6f4]">
            {activeRepo.owner.login}
          </button>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <button onClick={() => { cancelEditing(); setFileData(null); loadDir(activeRepo.fullName, "") }} className="shrink-0 hover:text-[#cdd6f4]">
            {activeRepo.name}
          </button>
          {pathParts.map((part, i) => (
            <span key={i} className="flex shrink-0 items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              {i < pathParts.length - 1 ? (
                <button
                  onClick={() => { cancelEditing(); setFileData(null); loadDir(activeRepo.fullName, pathParts.slice(0, i + 1).join("/")) }}
                  className="hover:text-[#cdd6f4]"
                >{part}</button>
              ) : (
                <span className="text-[#cdd6f4]">{part}</span>
              )}
            </span>
          ))}
        </div>

        {/* Commit dialog */}
        {commitDialogOpen && (
          <div className="border-b border-[#1e1e2e] bg-[#0b0b12] px-4 py-3">
            <div className="mx-auto flex max-w-2xl flex-col gap-2">
              <p className="text-xs font-medium text-[#cdd6f4]">Commit-Nachricht</p>
              <input
                autoFocus
                className="rounded border border-[#1e1e2e] bg-[#11111b] px-3 py-1.5 text-sm text-[#cdd6f4] outline-none ring-[#89b4fa] focus:ring-1"
                placeholder="Beschreibe deine Änderungen…"
                value={commitMsg}
                onChange={(e) => setCommitMsg(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && commitMsg.trim()) handleCommit() }}
              />
              {commitError && <p className="text-xs text-[#f38ba8]">{commitError}</p>}
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-[#6c7086] hover:bg-[#1e1e2e] hover:text-[#cdd6f4]"
                  onClick={() => setCommitDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  size="sm"
                  className="h-7 gap-1 bg-[#a6e3a1] text-xs text-[#1e1e2e] hover:bg-[#a6e3a1]/90"
                  disabled={!commitMsg.trim() || committing}
                  onClick={handleCommit}
                >
                  {committing ? "Committing…" : "Commit & Push"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Editor / Viewer content */}
        <div className="relative flex flex-1 overflow-hidden">
          {isImage ? (
            <div className="flex flex-1 items-center justify-center overflow-auto p-8">
              <img
                src={`data:image/${ext};base64,${fileData.content.replace(/\n/g, "")}`}
                alt={fileData.name}
                className="max-h-[70vh] max-w-full rounded-lg border border-[#1e1e2e]"
              />
            </div>
          ) : editing ? (
            <>
              {/* Line numbers */}
              <div
                ref={lineNumbersRef}
                className="flex shrink-0 flex-col overflow-hidden border-r border-[#1e1e2e] bg-[#0b0b12] py-1 text-right font-mono text-xs leading-[20px] text-[#6c7086] select-none"
                style={{ width: `${Math.max(String(totalLines).length * 9 + 24, 48)}px` }}
              >
                {editLines.map((_, i) => (
                  <div
                    key={i}
                    className={cn("px-3", cursorLine === i + 1 && "text-[#cdd6f4]")}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              {/* Textarea editor */}
              <textarea
                ref={editorRef}
                className="flex-1 resize-none overflow-auto bg-[#11111b] py-1 pl-4 pr-4 font-mono text-sm leading-[20px] text-[#cdd6f4] caret-[#f5e0dc] outline-none"
                value={editContent}
                onChange={(e) => {
                  setEditContent(e.target.value)
                  updateCursorPos(e.target)
                }}
                onKeyDown={handleEditorKeyDown}
                onKeyUp={(e) => updateCursorPos(e.currentTarget)}
                onClick={(e) => updateCursorPos(e.currentTarget)}
                onScroll={handleEditorScroll}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
              />
            </>
          ) : (
            <div className="flex flex-1 overflow-auto">
              {/* Line numbers */}
              <div className="sticky left-0 z-10 flex shrink-0 flex-col border-r border-[#1e1e2e] bg-[#0b0b12] py-1 text-right font-mono text-xs leading-[20px] text-[#6c7086] select-none"
                style={{ width: `${Math.max(String(viewLines.length).length * 9 + 24, 48)}px` }}
              >
                {viewLines.map((_, i) => (
                  <div key={i} className="px-3">{i + 1}</div>
                ))}
              </div>
              {/* Code content */}
              <pre className="flex-1 overflow-x-auto py-1 pl-4 pr-4 font-mono text-sm leading-[20px]">
                {viewLines.map((line, i) => (
                  <div key={i} className="hover:bg-[#181825]/80">
                    {useHighlight ? highlightLine(line, ext) : <span style={{ color: SYN.text }}>{line || " "}</span>}
                  </div>
                ))}
                {truncated && (
                  <div className="mt-2 border-t border-[#1e1e2e] py-3 text-center text-xs text-[#6c7086]">
                    Datei zu groß — nur die ersten {MAX_RENDER.toLocaleString("de-DE")} von {allViewLines.length.toLocaleString("de-DE")} Zeilen werden angezeigt
                  </div>
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex h-6 shrink-0 items-center justify-between border-t border-[#1e1e2e] bg-[#0b0b12] px-3 text-[11px] text-[#6c7086]">
          <div className="flex items-center gap-3">
            {editing && (
              <span>Zeile {cursorLine}, Spalte {cursorCol}</span>
            )}
            <span>{totalLines} Zeilen</span>
            <span>{formatBytes(fileData.size)}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{ext.toUpperCase() || "TXT"}</span>
            <span>UTF-8</span>
            {!useHighlight && !editing && <span className="text-[#f9e2af]">Highlighting deaktiviert (große Datei)</span>}
            {editing && (
              <span className="text-[#f9e2af]">Tab = 2 Leerzeichen</span>
            )}
          </div>
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
            {filteredRepos.map((repo) => {
              const isFav = favSet.has(repo.fullName)
              return (
                <div
                  key={repo.id}
                  className="flex items-start gap-2 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
                >
                  <button
                    onClick={() => openRepo(repo)}
                    className="flex min-w-0 flex-1 flex-col gap-1 text-left"
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
                  <button
                    onClick={() => toggleFavorite(repo)}
                    className="mt-0.5 shrink-0 rounded p-1 transition-colors hover:bg-accent"
                    title={isFav ? "Aus Sidebar entfernen" : "Zur Sidebar hinzufügen"}
                  >
                    <Star className={cn("h-4 w-4", isFav ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40")} />
                  </button>
                </div>
              )
            })}
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
