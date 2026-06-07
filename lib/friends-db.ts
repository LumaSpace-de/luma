import { supabase } from "./supabase"

// Required SQL:
// CREATE TABLE IF NOT EXISTS friendships (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   status TEXT NOT NULL DEFAULT 'pending',
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   responded_at TIMESTAMPTZ,
//   CONSTRAINT no_self_friend CHECK (requester_id <> addressee_id),
//   UNIQUE(requester_id, addressee_id)
// );

export interface FriendUser {
  id: string
  name: string
  username: string | null
  avatarUrl: string | null
  friendshipId?: string
}

export interface FriendRequest {
  id: string
  user: FriendUser
  createdAt: string
}

interface UserRow {
  id: string
  name: string
  username: string | null
  avatar_url: string | null
}

function toFriendUser(row: UserRow, friendshipId?: string): FriendUser {
  return {
    id: row.id,
    name: row.name,
    username: row.username ?? null,
    avatarUrl: row.avatar_url ?? null,
    ...(friendshipId ? { friendshipId } : {}),
  }
}

async function findUserId(username: string): Promise<UserRow | null> {
  const { data } = await supabase
    .from("users")
    .select("id, name, username, avatar_url")
    .ilike("username", username)
    .maybeSingle()
  return (data as UserRow | null) ?? null
}

export async function sendFriendRequest(requesterId: string, username: string): Promise<void> {
  const target = await findUserId(username)
  if (!target) throw new Error("Nutzer nicht gefunden")
  if (target.id === requesterId) throw new Error("Du kannst dich nicht selbst hinzufügen")

  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status, requester_id")
    .or(`and(requester_id.eq.${requesterId},addressee_id.eq.${target.id}),and(requester_id.eq.${target.id},addressee_id.eq.${requesterId})`)
    .maybeSingle()

  if (existing) {
    if (existing.status === "accepted") throw new Error("Ihr seid bereits befreundet")
    if (existing.status === "pending") throw new Error("Anfrage bereits gesendet")
  }

  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: requesterId, addressee_id: target.id, status: "pending" })

  if (error) throw new Error(error.message)
}

export async function getFriends(userId: string): Promise<FriendUser[]> {
  const { data, error } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

  if (error || !data || data.length === 0) return []

  const friendshipIdMap = new Map(
    data.map((r) => [(r.requester_id === userId ? r.addressee_id : r.requester_id) as string, r.id as string])
  )
  const otherIds = Array.from(friendshipIdMap.keys())
  if (otherIds.length === 0) return []

  const { data: users } = await supabase
    .from("users")
    .select("id, name, username, avatar_url")
    .in("id", otherIds)

  return ((users ?? []) as UserRow[]).map((u) => toFriendUser(u, friendshipIdMap.get(u.id)))
}

export async function getIncomingRequests(userId: string): Promise<FriendRequest[]> {
  const { data, error } = await supabase
    .from("friendships")
    .select("id, requester_id, created_at")
    .eq("status", "pending")
    .eq("addressee_id", userId)
    .order("created_at", { ascending: false })

  if (error || !data || data.length === 0) return []

  const ids = data.map((r) => r.requester_id as string)
  const { data: users } = await supabase.from("users").select("id, name, username, avatar_url").in("id", ids)
  const map = new Map(((users ?? []) as UserRow[]).map((u) => [u.id, toFriendUser(u)]))

  return data
    .map((r) => ({ id: r.id as string, user: map.get(r.requester_id as string), createdAt: r.created_at as string }))
    .filter((r): r is FriendRequest => !!r.user)
}

export async function getOutgoingRequests(userId: string): Promise<FriendRequest[]> {
  const { data, error } = await supabase
    .from("friendships")
    .select("id, addressee_id, created_at")
    .eq("status", "pending")
    .eq("requester_id", userId)
    .order("created_at", { ascending: false })

  if (error || !data || data.length === 0) return []

  const ids = data.map((r) => r.addressee_id as string)
  const { data: users } = await supabase.from("users").select("id, name, username, avatar_url").in("id", ids)
  const map = new Map(((users ?? []) as UserRow[]).map((u) => [u.id, toFriendUser(u)]))

  return data
    .map((r) => ({ id: r.id as string, user: map.get(r.addressee_id as string), createdAt: r.created_at as string }))
    .filter((r): r is FriendRequest => !!r.user)
}

export async function countIncomingRequests(userId: string): Promise<number> {
  const { count } = await supabase
    .from("friendships")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")
    .eq("addressee_id", userId)
  return count ?? 0
}

export async function respondToRequest(friendshipId: string, userId: string, accept: boolean): Promise<void> {
  const { data, error } = await supabase
    .from("friendships")
    .update({ status: accept ? "accepted" : "declined", responded_at: new Date().toISOString() })
    .eq("id", friendshipId)
    .eq("addressee_id", userId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle()

  if (error || !data) throw new Error("Anfrage nicht gefunden")
}

export async function removeFriendship(friendshipId: string, userId: string): Promise<void> {
  await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId)
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
}

export async function countFriends(userId: string): Promise<number> {
  const { count } = await supabase
    .from("friendships")
    .select("id", { count: "exact", head: true })
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
  return count ?? 0
}
