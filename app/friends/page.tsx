"use client"

import { Check, PanelLeft, Plus, UserMinus, Users, X } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"

interface FriendUser {
  id: string
  name: string
  username: string | null
  avatarUrl: string | null
  friendshipId?: string
}

interface FriendRequest {
  id: string
  user: FriendUser
  createdAt: string
}

function Avatar({ user }: { user: FriendUser }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-base font-bold text-primary">
          {user.name[0]?.toUpperCase() ?? "?"}
        </span>
      )}
    </div>
  )
}

export default function FriendsPage() {
  const { toggle } = useInlineSidebar()

  const [friends, setFriends] = useState<FriendUser[]>([])
  const [incoming, setIncoming] = useState<FriendRequest[]>([])
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const [username, setUsername] = useState("")
  const [addError, setAddError] = useState("")
  const [addSuccess, setAddSuccess] = useState(false)
  const [addLoading, setAddLoading] = useState(false)

  function load() {
    Promise.all([
      fetch("/api/friends").then((r) => r.json()),
      fetch("/api/friends/requests").then((r) => r.json()),
    ])
      .then(([friendsData, requestsData]) => {
        if (Array.isArray(friendsData)) setFriends(friendsData)
        if (Array.isArray(requestsData?.incoming)) setIncoming(requestsData.incoming)
        if (Array.isArray(requestsData?.outgoing)) setOutgoing(requestsData.outgoing)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddError("")
    setAddSuccess(false)
    if (!username.trim()) return

    setAddLoading(true)
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      setAddError(data.error || "Fehler beim Senden")
    } else {
      setAddSuccess(true)
      setUsername("")
      load()
    }
    setAddLoading(false)
  }

  async function handleRespond(req: FriendRequest, accept: boolean) {
    setProcessing(req.id)
    const res = await fetch(`/api/friends/${req.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: accept ? "accept" : "decline" }),
    })
    if (res.ok) {
      setIncoming((prev) => prev.filter((r) => r.id !== req.id))
      if (accept) load()
    }
    setProcessing(null)
  }

  async function handleCancel(req: FriendRequest) {
    setProcessing(req.id)
    await fetch(`/api/friends/${req.id}`, { method: "DELETE" })
    setOutgoing((prev) => prev.filter((r) => r.id !== req.id))
    setProcessing(null)
  }

  async function handleRemove(friend: FriendUser) {
    if (!friend.friendshipId) return
    setProcessing(friend.id)
    await fetch(`/api/friends/${friend.friendshipId}`, { method: "DELETE" })
    setFriends((prev) => prev.filter((f) => f.id !== friend.id))
    setProcessing(null)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">Freunde</h1>
        {incoming.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground">
            {incoming.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
          {/* Add friend */}
          <section>
            <h2 className="text-base font-semibold">Freund hinzufügen</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Sende eine Freundschaftsanfrage über den Benutzernamen.
            </p>

            <form onSubmit={handleAdd} className="mt-4 flex items-start gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                <Input
                  placeholder="benutzername"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/^@/, ""))}
                  className="pl-7"
                  maxLength={30}
                />
              </div>
              <Button type="submit" disabled={addLoading} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Senden
              </Button>
            </form>
            {addError && (
              <p className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{addError}</p>
            )}
            {addSuccess && (
              <p className="mt-2 rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-500">
                Anfrage gesendet
              </p>
            )}
          </section>

          {/* Incoming requests */}
          {incoming.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Eingehende Anfragen
              </h2>
              <div className="flex flex-col gap-3">
                {incoming.map((req) => (
                  <div key={req.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                    <Avatar user={req.user} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{req.user.name}</p>
                      {req.user.username && (
                        <p className="truncate text-xs text-muted-foreground">@{req.user.username}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={processing === req.id}
                        onClick={() => handleRespond(req, false)}
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Ablehnen</span>
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1.5"
                        disabled={processing === req.id}
                        onClick={() => handleRespond(req, true)}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Annehmen</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Outgoing requests */}
          {outgoing.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Gesendete Anfragen
              </h2>
              <div className="flex flex-col gap-3">
                {outgoing.map((req) => (
                  <div key={req.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                    <Avatar user={req.user} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{req.user.name}</p>
                      {req.user.username && (
                        <p className="truncate text-xs text-muted-foreground">@{req.user.username}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 gap-1.5"
                      disabled={processing === req.id}
                      onClick={() => handleCancel(req)}
                    >
                      <X className="h-3.5 w-3.5" />
                      Abbrechen
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Friends list */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Freunde {friends.length > 0 && `(${friends.length})`}
            </h2>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-[72px] animate-pulse rounded-xl border bg-muted/20" />
                ))}
              </div>
            ) : friends.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                <Users className="mb-3 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm font-medium">Noch keine Freunde</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Füge Freunde über ihren Benutzernamen hinzu.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                    <Avatar user={friend} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{friend.name}</p>
                      {friend.username && (
                        <p className="truncate text-xs text-muted-foreground">@{friend.username}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 gap-1.5 text-muted-foreground hover:text-destructive"
                      disabled={processing === friend.id}
                      onClick={() => handleRemove(friend)}
                      title="Freundschaft beenden"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
