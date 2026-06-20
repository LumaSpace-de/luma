import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, label, label_icon, label_color, embed_title, embed_description, embed_color, embed_footer, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const announcements = (data ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    label: a.label,
    labelIcon: a.label_icon,
    labelColor: a.label_color,
    embedTitle: a.embed_title,
    embedDescription: a.embed_description,
    embedColor: a.embed_color,
    embedFooter: a.embed_footer,
    createdAt: a.created_at,
  }))

  return NextResponse.json({ announcements })
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const id = typeof body?.id === "string" ? body.id : ""
  const title = typeof body?.title === "string" ? body.title.trim() : ""
  const text = typeof body?.body === "string" ? body.body.trim() : ""

  if (!id || !title || !text) {
    return NextResponse.json({ error: "ID, Titel und Inhalt erforderlich" }, { status: 400 })
  }

  const { error } = await supabase
    .from("announcements")
    .update({
      title,
      body: text,
      label: body.label ?? null,
      label_icon: body.labelIcon ?? null,
      label_color: body.labelColor ?? null,
      embed_title: body.embedTitle ?? null,
      embed_description: body.embedDescription ?? null,
      embed_color: body.embedColor ?? null,
      embed_footer: body.embedFooter ?? null,
    })
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
