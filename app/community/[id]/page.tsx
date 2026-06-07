"use client"

import { Loader2, MessageSquare, PanelLeft, Send, Trash2, Users } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"
import { cn } from "@/lib/utils"

interface Author {
  id: string
  name: string
  username: string | null
  avatarUrl: string | null
}

interface Post {
  id: string
  body: string
  author: Author
  commentCount: number
  createdAt: string
}

interface Comment {
  id: string
  body: string
  author: Author
  createdAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function AuthorAvatar({ author, className }: { author: Author; className?: string }) {
  if (author.avatarUrl) {
    return <img src={author.avatarUrl} alt={author.name} className={cn("shrink-0 rounded-full object-cover", className)} />
  }
  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary", className)}>
      {(author.name || "?").slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function CommunityPage({ params }: { params: { id: string } }) {
  const { toggle } = useInlineSidebar()
  const { data: session } = useSession()
  const workspaceId = params.id
  const currentUserId = (session?.user as { id?: string } | undefined)?.id ?? null

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [newPost, setNewPost] = useState("")
  const [posting, setPosting] = useState(false)

  const [openComments, setOpenComments] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [commentsLoading, setCommentsLoading] = useState<Set<string>>(new Set())
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [commentSending, setCommentSending] = useState<Set<string>>(new Set())

  function load() {
    setLoading(true)
    setError("")
    fetch(`/api/workspaces/${workspaceId}/community/posts`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.posts)) setPosts(data.posts)
        else if (data?.error) setError(data.error)
        setLoading(false)
      })
      .catch(() => {
        setError("Fehler beim Laden")
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId])

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()
    if (!newPost.trim()) return
    setPosting(true)
    const res = await fetch(`/api/workspaces/${workspaceId}/community/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: newPost.trim() }),
    })
    if (res.ok) {
      setNewPost("")
      load()
    }
    setPosting(false)
  }

  async function handleDeletePost(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    await fetch(`/api/workspaces/${workspaceId}/community/posts/${id}`, { method: "DELETE" })
  }

  async function loadComments(postId: string) {
    setCommentsLoading((prev) => new Set(prev).add(postId))
    const res = await fetch(`/api/workspaces/${workspaceId}/community/posts/${postId}/comments`)
    const data = await res.json()
    if (Array.isArray(data?.comments)) {
      setComments((prev) => ({ ...prev, [postId]: data.comments }))
    }
    setCommentsLoading((prev) => {
      const next = new Set(prev)
      next.delete(postId)
      return next
    })
  }

  function toggleComments(postId: string) {
    setOpenComments((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
        if (!comments[postId]) loadComments(postId)
      }
      return next
    })
  }

  async function handleSendComment(postId: string) {
    const text = (commentDrafts[postId] ?? "").trim()
    if (!text) return
    setCommentSending((prev) => new Set(prev).add(postId))
    const res = await fetch(`/api/workspaces/${workspaceId}/community/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    })
    if (res.ok) {
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }))
      await loadComments(postId)
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)))
    }
    setCommentSending((prev) => {
      const next = new Set(prev)
      next.delete(postId)
      return next
    })
  }

  async function handleDeleteComment(postId: string, commentId: string) {
    setComments((prev) => ({ ...prev, [postId]: (prev[postId] ?? []).filter((c) => c.id !== commentId) }))
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p)))
    await fetch(`/api/workspaces/${workspaceId}/community/posts/${postId}/comments/${commentId}`, { method: "DELETE" })
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Users className="h-4 w-4 text-muted-foreground" />
        <h1 className="text-lg font-semibold tracking-tight">Community</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <form onSubmit={handleCreatePost} className="flex flex-col gap-2 rounded-xl border bg-card p-4">
            <textarea
              placeholder="Was möchtest du mit dem Workspace teilen?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={3}
              maxLength={2000}
              className="flex w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={posting || !newPost.trim()} className="gap-1.5">
                {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Posten
              </Button>
            </div>
          </form>

          {error && (
            <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">{error}</div>
          )}

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl border bg-muted/20" />
              ))}
            </div>
          ) : !error && posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
              <Users className="mb-3 h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm font-medium">Noch keine Beiträge</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Sei der Erste, der etwas mit dem Workspace teilt.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {posts.map((post) => {
                const isOpen = openComments.has(post.id)
                const postComments = comments[post.id] ?? []
                const draft = commentDrafts[post.id] ?? ""
                return (
                  <div key={post.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
                    <div className="flex gap-3">
                      <AuthorAvatar author={post.author} className="h-9 w-9 text-sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">{post.author.name || post.author.username || "Unbekannt"}</p>
                          <p className="shrink-0 text-xs text-muted-foreground/60">{formatDate(post.createdAt)}</p>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{post.body}</p>
                      </div>
                      {currentUserId === post.author.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleComments(post.id)}
                      className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post.commentCount > 0 ? `${post.commentCount} Kommentare` : "Kommentieren"}
                    </button>

                    {isOpen && (
                      <div className="flex flex-col gap-3 border-t pt-3">
                        {commentsLoading.has(post.id) ? (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Lädt…
                          </div>
                        ) : postComments.length === 0 ? (
                          <p className="text-xs text-muted-foreground/60">Noch keine Kommentare.</p>
                        ) : (
                          <div className="flex flex-col gap-2.5">
                            {postComments.map((c) => (
                              <div key={c.id} className="flex gap-2.5">
                                <AuthorAvatar author={c.author} className="h-7 w-7 text-[11px]" />
                                <div className="min-w-0 flex-1 rounded-lg bg-muted/40 px-3 py-1.5">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate text-xs font-semibold">{c.author.name || c.author.username || "Unbekannt"}</p>
                                    <p className="shrink-0 text-[11px] text-muted-foreground/60">{formatDate(c.createdAt)}</p>
                                  </div>
                                  <p className="whitespace-pre-wrap text-xs text-muted-foreground">{c.body}</p>
                                </div>
                                {currentUserId === c.author.id && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteComment(post.id, c.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Kommentar schreiben…"
                            value={draft}
                            onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                handleSendComment(post.id)
                              }
                            }}
                            maxLength={1000}
                            className="flex h-8 w-full rounded-md border border-input bg-background px-3 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                          <Button
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            disabled={commentSending.has(post.id) || !draft.trim()}
                            onClick={() => handleSendComment(post.id)}
                          >
                            {commentSending.has(post.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
