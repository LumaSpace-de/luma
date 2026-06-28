"use client"

import { Hash, Loader2, Megaphone, MessageSquare, PanelLeft, Plus, Send, Shield, Trash2, Users, Volume2, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { RoleManager } from "@/components/community/role-manager"
import { Button } from "@/components/ui/button"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"
import { cn } from "@/lib/utils"

type ChannelType = "text" | "news" | "voice"

interface Channel {
  id: string
  workspaceId: string
  name: string
  type: ChannelType
  createdAt: string
}

interface Author {
  id: string
  name: string
  username: string | null
  avatarUrl: string | null
}

interface Post {
  id: string
  channelId: string
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

interface Member {
  id: string
  userId: string
  role: string
  name: string
  username: string | null
  avatarUrl: string | null
}

const CHANNEL_TYPE_ICONS: Record<ChannelType, typeof Hash> = {
  text: Hash,
  news: Megaphone,
  voice: Volume2,
}

const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
  text: "Text",
  news: "News",
  voice: "Voice",
}

const ROLE_COLORS: Record<string, string> = {
  owner: "text-yellow-400",
  admin: "text-purple-400",
  member: "text-muted-foreground",
  viewer: "text-muted-foreground/60",
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Inhaber",
  admin: "Admin",
  member: "Mitglied",
  viewer: "Zuschauer",
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

function MemberAvatar({ member, className }: { member: Member; className?: string }) {
  if (member.avatarUrl) {
    return <img src={member.avatarUrl} alt={member.name} className={cn("shrink-0 rounded-full object-cover", className)} />
  }
  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary", className)}>
      {(member.name || "?").slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function CommunityPage({ params }: { params: { id: string } }) {
  const { toggle } = useInlineSidebar()
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const workspaceId = params.id
  const currentUserId = (session?.user as { id?: string } | undefined)?.id ?? null

  const [channels, setChannels] = useState<Channel[]>([])
  const [channelsLoading, setChannelsLoading] = useState(true)
  const [activeChannelId, setActiveChannelId] = useState<string | null>(searchParams.get("c"))

  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelType, setNewChannelType] = useState<ChannelType>("text")
  const [channelSaving, setChannelSaving] = useState(false)
  const [channelError, setChannelError] = useState("")
  const [showChannelForm, setShowChannelForm] = useState(false)
  const channelInputRef = useRef<HTMLInputElement>(null)

  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [postsError, setPostsError] = useState("")

  const [newPost, setNewPost] = useState("")
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState("")

  const [openComments, setOpenComments] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [commentsLoading, setCommentsLoading] = useState<Set<string>>(new Set())
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [commentSending, setCommentSending] = useState<Set<string>>(new Set())

  const [members, setMembers] = useState<Member[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [showMembers, setShowMembers] = useState(true)
  const [showRoles, setShowRoles] = useState(false)

  const [userRole, setUserRole] = useState<string | null>(null)

  function loadChannels() {
    setChannelsLoading(true)
    fetch(`/api/workspaces/${workspaceId}/community/channels`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.channels)) {
          setChannels(data.channels)
          if (data.channels.length > 0) {
            setActiveChannelId((prev) => {
              if (prev && data.channels.some((c: Channel) => c.id === prev)) return prev
              return data.channels[0].id
            })
          }
        }
        setChannelsLoading(false)
      })
      .catch(() => setChannelsLoading(false))
  }

  function loadPosts(channelId: string) {
    setPostsLoading(true)
    setPostsError("")
    setOpenComments(new Set())
    fetch(`/api/workspaces/${workspaceId}/community/channels/${channelId}/posts`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.posts)) setPosts(data.posts)
        else if (data?.error) setPostsError(data.error)
        setPostsLoading(false)
      })
      .catch(() => {
        setPostsError("Fehler beim Laden")
        setPostsLoading(false)
      })
  }

  function loadMembers() {
    setMembersLoading(true)
    fetch(`/api/workspaces/${workspaceId}/members`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMembers(data)
          if (currentUserId) {
            const me = data.find((m: Member) => m.userId === currentUserId)
            if (me) setUserRole(me.role)
          }
        }
        setMembersLoading(false)
      })
      .catch(() => setMembersLoading(false))
  }

  useEffect(() => { loadChannels(); loadMembers() }, [workspaceId])

  useEffect(() => {
    if (activeChannelId) loadPosts(activeChannelId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannelId])

  useEffect(() => {
    if (showChannelForm) channelInputRef.current?.focus()
  }, [showChannelForm])

  const isAdminOrOwner = userRole === "owner" || userRole === "admin"

  async function handleCreateChannel(e: React.FormEvent) {
    e.preventDefault()
    const name = newChannelName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40)
    if (!name) return
    setChannelSaving(true)
    setChannelError("")
    const res = await fetch(`/api/workspaces/${workspaceId}/community/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type: newChannelType }),
    })
    const data = await res.json()
    if (res.ok && data.channel) {
      setChannels((prev) => [...prev, data.channel])
      setActiveChannelId(data.channel.id)
      setNewChannelName("")
      setNewChannelType("text")
      setShowChannelForm(false)
    } else {
      setChannelError(data.error ?? "Fehler")
    }
    setChannelSaving(false)
  }

  async function handleDeleteChannel(channelId: string) {
    const res = await fetch(`/api/workspaces/${workspaceId}/community/channels/${channelId}`, {
      method: "DELETE",
    })
    if (res.ok) {
      setChannels((prev) => prev.filter((c) => c.id !== channelId))
      if (activeChannelId === channelId) {
        setActiveChannelId(channels.find((c) => c.id !== channelId)?.id ?? null)
      }
    }
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()
    if (!newPost.trim() || !activeChannelId) return
    setPosting(true)
    setPostError("")
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/community/channels/${activeChannelId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newPost.trim() }),
      })
      if (res.ok) {
        setNewPost("")
        loadPosts(activeChannelId)
      } else {
        const data = await res.json().catch(() => null)
        setPostError(data?.error ?? `Fehler (${res.status})`)
      }
    } catch {
      setPostError("Netzwerkfehler")
    }
    setPosting(false)
  }

  async function handleDeletePost(id: string) {
    if (!activeChannelId) return
    setPosts((prev) => prev.filter((p) => p.id !== id))
    await fetch(`/api/workspaces/${workspaceId}/community/channels/${activeChannelId}/posts/${id}`, { method: "DELETE" })
  }

  async function loadComments(postId: string) {
    if (!activeChannelId) return
    setCommentsLoading((prev) => new Set(prev).add(postId))
    const res = await fetch(`/api/workspaces/${workspaceId}/community/channels/${activeChannelId}/posts/${postId}/comments`)
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
    if (!activeChannelId) return
    const text = (commentDrafts[postId] ?? "").trim()
    if (!text) return
    setCommentSending((prev) => new Set(prev).add(postId))
    const res = await fetch(`/api/workspaces/${workspaceId}/community/channels/${activeChannelId}/posts/${postId}/comments`, {
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
    if (!activeChannelId) return
    setComments((prev) => ({ ...prev, [postId]: (prev[postId] ?? []).filter((c) => c.id !== commentId) }))
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p)))
    await fetch(`/api/workspaces/${workspaceId}/community/channels/${activeChannelId}/posts/${postId}/comments/${commentId}`, { method: "DELETE" })
  }

  const activeChannel = channels.find((c) => c.id === activeChannelId)
  const ActiveChannelIcon = activeChannel ? CHANNEL_TYPE_ICONS[activeChannel.type] : Hash

  const groupedChannels = {
    text: channels.filter((c) => c.type === "text"),
    news: channels.filter((c) => c.type === "news"),
    voice: channels.filter((c) => c.type === "voice"),
  }

  const onlineMembers = members
  const roleGroups = new Map<string, Member[]>()
  for (const m of onlineMembers) {
    const group = roleGroups.get(m.role) ?? []
    group.push(m)
    roleGroups.set(m.role, group)
  }
  const roleOrder = ["owner", "admin", "member", "viewer"]

  return (
    <div className="flex h-full overflow-hidden">
      {/* Channel sidebar */}
      <div className="flex w-52 shrink-0 flex-col border-r bg-sidebar">
        <div className="flex h-12 items-center gap-2 border-b px-3">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
            <PanelLeft className="h-4 w-4" />
          </Button>
          <span className="truncate text-sm font-semibold">Community</span>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {/* Channel creation */}
          <div className="mb-1 flex items-center justify-between px-3 pb-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Kanäle</span>
            <button
              type="button"
              title="Kanal erstellen"
              onClick={() => setShowChannelForm((v) => !v)}
              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {showChannelForm && (
            <form onSubmit={handleCreateChannel} className="px-2 pb-2">
              <div className="flex gap-1">
                <input
                  ref={channelInputRef}
                  type="text"
                  placeholder="kanal-name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  maxLength={40}
                  className="h-7 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <Button type="submit" size="icon" className="h-7 w-7 shrink-0" disabled={channelSaving}>
                  {channelSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                </Button>
                <button
                  type="button"
                  onClick={() => { setShowChannelForm(false); setChannelError("") }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-1.5 flex gap-1">
                {(["text", "news", "voice"] as ChannelType[]).map((t) => {
                  const Icon = CHANNEL_TYPE_ICONS[t]
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewChannelType(t)}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] transition-colors",
                        t === newChannelType
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {CHANNEL_TYPE_LABELS[t]}
                    </button>
                  )
                })}
              </div>
              {channelError && <p className="mt-1 px-1 text-[11px] text-destructive">{channelError}</p>}
            </form>
          )}

          {channelsLoading ? (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Lädt…
            </div>
          ) : channels.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">Noch keine Kanäle</p>
          ) : (
            <>
              {(["text", "news", "voice"] as ChannelType[]).map((type) => {
                const group = groupedChannels[type]
                if (group.length === 0) return null
                return (
                  <div key={type} className="mb-2">
                    <div className="mb-0.5 px-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        {CHANNEL_TYPE_LABELS[type]}
                      </span>
                    </div>
                    {group.map((ch) => {
                      const Icon = CHANNEL_TYPE_ICONS[ch.type]
                      return (
                        <div
                          key={ch.id}
                          className={cn(
                            "group flex w-full items-center gap-1.5 rounded-md px-2 py-1 mx-1 text-sm transition-colors",
                            ch.id === activeChannelId
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                          )}
                          style={{ width: "calc(100% - 8px)" }}
                        >
                          <button
                            type="button"
                            onClick={() => ch.type !== "voice" && setActiveChannelId(ch.id)}
                            className="flex min-w-0 flex-1 items-center gap-1.5"
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{ch.name}</span>
                          </button>
                          {isAdminOrOwner && (
                            <button
                              type="button"
                              title="Kanal löschen"
                              onClick={() => handleDeleteChannel(ch.id)}
                              className="hidden h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:text-destructive group-hover:flex"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          {activeChannel ? (
            <>
              <ActiveChannelIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h1 className="flex-1 text-base font-semibold tracking-tight">{activeChannel.name}</h1>
            </>
          ) : (
            <h1 className="flex-1 text-base font-semibold text-muted-foreground">Kein Kanal ausgewählt</h1>
          )}
          {isAdminOrOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title="Rollen verwalten"
              onClick={() => setShowRoles((v) => !v)}
            >
              <Shield className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title={showMembers ? "Mitglieder ausblenden" : "Mitglieder anzeigen"}
            onClick={() => setShowMembers((v) => !v)}
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Posts area */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {!activeChannel ? (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Wähle einen Kanal aus oder erstelle einen neuen.
              </div>
            ) : activeChannel.type === "voice" ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
                <Volume2 className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm font-medium">Voice-Kanal</p>
                <p className="text-xs text-muted-foreground/60">Voice-Kanäle sind noch in Entwicklung.</p>
              </div>
            ) : (
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-auto p-6">
                  <div className="mx-auto flex max-w-2xl flex-col gap-4">
                    {postsError && (
                      <div className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">{postsError}</div>
                    )}

                    {postsLoading ? (
                      <div className="flex flex-col gap-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-28 animate-pulse rounded-xl border bg-muted/20" />
                        ))}
                      </div>
                    ) : !postsError && posts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                        <ActiveChannelIcon className="mb-3 h-8 w-8 text-muted-foreground/30" />
                        <p className="text-sm font-medium">#{activeChannel.name} ist noch leer</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {activeChannel.type === "news"
                            ? "Veröffentliche die erste Neuigkeit in diesem Kanal."
                            : "Schreib die erste Nachricht in diesem Kanal."}
                        </p>
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
                                {(currentUserId === post.author.id || isAdminOrOwner) && (
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
                                          {(currentUserId === c.author.id || isAdminOrOwner) && (
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

                {/* Post composer at bottom */}
                <div className="shrink-0 border-t p-4">
                  <div className="mx-auto max-w-2xl">
                    <form onSubmit={handleCreatePost} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Nachricht in #${activeChannel.name}…`}
                        value={newPost}
                        onChange={(e) => { setNewPost(e.target.value); setPostError("") }}
                        maxLength={2000}
                        className="flex h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                      <Button type="submit" size="sm" disabled={posting || !newPost.trim()} className="h-9 gap-1.5 px-3">
                        {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        Senden
                      </Button>
                    </form>
                    {postError && <p className="mt-1.5 text-xs text-destructive">{postError}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Roles panel */}
          {showRoles && isAdminOrOwner && (
            <div className="flex w-64 shrink-0 flex-col border-l bg-sidebar">
              <RoleManager workspaceId={workspaceId} onClose={() => setShowRoles(false)} />
            </div>
          )}

          {/* Members sidebar */}
          {showMembers && !showRoles && (
            <div className="flex w-56 shrink-0 flex-col border-l bg-sidebar">
              <div className="flex h-12 items-center gap-2 border-b px-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Mitglieder</span>
                <span className="ml-auto text-xs text-muted-foreground">{members.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {membersLoading ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Lädt…
                  </div>
                ) : members.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground">Keine Mitglieder</p>
                ) : (
                  roleOrder.map((role) => {
                    const group = roleGroups.get(role)
                    if (!group || group.length === 0) return null
                    return (
                      <div key={role} className="mb-3">
                        <div className="mb-1 px-3">
                          <span className={cn("text-[10px] font-semibold uppercase tracking-wider", ROLE_COLORS[role] ?? "text-muted-foreground")}>
                            {ROLE_LABELS[role] ?? role} — {group.length}
                          </span>
                        </div>
                        {group.map((m) => (
                          <div
                            key={m.userId}
                            className="flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors hover:bg-accent/50"
                          >
                            <MemberAvatar member={m} className="h-7 w-7 text-[11px]" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium">{m.name || m.username || "Unbekannt"}</p>
                              {m.username && (
                                <p className="truncate text-[10px] text-muted-foreground/60">@{m.username}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
