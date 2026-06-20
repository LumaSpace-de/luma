import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { createInvitation } from "@/lib/invitations-db"
import { DbUser } from "@/lib/users-db"
import { getWorkspaceMembers } from "@/lib/workspaces-db"
import { supabase } from "@/lib/supabase"

async function findUserByEmailWithError(email: string): Promise<{ user: DbUser | null; error: string | null }> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, password, name, username, avatar_url, created_at")
    .ilike("email", email)
    .maybeSingle()
  if (error) return { user: null, error: error.message }
  if (!data) return { user: null, error: null }
  return {
    user: { id: data.id, email: data.email, password: data.password, name: data.name, username: data.username ?? null, avatarUrl: data.avatar_url ?? null, createdAt: data.created_at },
    error: null,
  }
}

async function findUserByUsernameWithError(username: string): Promise<{ user: DbUser | null; error: string | null }> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, password, name, username, avatar_url, created_at")
    .ilike("username", username)
    .maybeSingle()
  if (error) return { user: null, error: error.message }
  if (!data) return { user: null, error: null }
  return {
    user: { id: data.id, email: data.email, password: data.password, name: data.name, username: data.username ?? null, avatarUrl: data.avatar_url ?? null, createdAt: data.created_at },
    error: null,
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const { data: ws } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", params.id)
    .maybeSingle()

  const members = await getWorkspaceMembers(params.id)

  if (ws?.owner_id) {
    const { data: owner } = await supabase
      .from("users")
      .select("id, name, email, username, avatar_url")
      .eq("id", ws.owner_id)
      .maybeSingle()

    if (owner) {
      members.unshift({
        id: "owner",
        workspaceId: params.id,
        userId: owner.id,
        role: "owner",
        addedAt: "",
        name: owner.name ?? "",
        email: owner.email ?? "",
        username: owner.username ?? null,
        avatarUrl: owner.avatar_url ?? null,
      })
    }
  }

  return NextResponse.json(members)
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const body = await req.json()
  const query = (body.query ?? body.email ?? "").trim()

  if (!query) {
    return NextResponse.json({ error: "E-Mail oder @Benutzername erforderlich" }, { status: 400 })
  }

  let user = null
  let lookupError: string | null = null

  if (query.startsWith("@")) {
    const result = await findUserByUsernameWithError(query.slice(1).toLowerCase())
    user = result.user
    lookupError = result.error
  } else {
    const result = await findUserByEmailWithError(query.toLowerCase())
    user = result.user
    lookupError = result.error
  }

  if (lookupError) {
    console.error("[invite] lookup error:", lookupError)
    return NextResponse.json({ error: `Datenbankfehler: ${lookupError}` }, { status: 500 })
  }

  if (!user) {
    return NextResponse.json(
      { error: query.startsWith("@") ? "Kein Nutzer mit diesem Benutzernamen gefunden" : "Kein Nutzer mit dieser E-Mail gefunden" },
      { status: 404 }
    )
  }

  if (user.id === session.user.id) {
    return NextResponse.json({ error: "Du kannst dich nicht selbst einladen" }, { status: 400 })
  }

  try {
    await createInvitation(params.id, user.id, session.user.id)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[invite] createInvitation error:", msg)
    if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("already")) {
      return NextResponse.json({ error: "Einladung bereits gesendet oder Nutzer ist bereits Mitglied" }, { status: 400 })
    }
    return NextResponse.json({ error: `Fehler beim Einladen: ${msg}` }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
