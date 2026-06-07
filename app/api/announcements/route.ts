import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { countUnreadAnnouncements, createAnnouncement, getAnnouncementsForUser } from "@/lib/announcements-db"
import { isAdminEmail } from "@/lib/admin"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  if (searchParams.get("count") === "1") {
    const count = await countUnreadAnnouncements(session.user.id)
    return NextResponse.json({ count })
  }

  const announcements = await getAnnouncementsForUser(session.user.id)
  return NextResponse.json({ announcements, isAdmin: isAdminEmail(session.user.email) })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const title = typeof body?.title === "string" ? body.title.trim() : ""
  const text = typeof body?.body === "string" ? body.body.trim() : ""
  const label = typeof body?.label === "string" ? body.label.trim().slice(0, 30) : ""
  const labelIcon = typeof body?.labelIcon === "string" ? body.labelIcon : ""
  const labelColor = typeof body?.labelColor === "string" ? body.labelColor : ""
  const embedTitle = typeof body?.embedTitle === "string" ? body.embedTitle.trim().slice(0, 120) : ""
  const embedDescription = typeof body?.embedDescription === "string" ? body.embedDescription.trim().slice(0, 1000) : ""
  const embedColor = typeof body?.embedColor === "string" ? body.embedColor.trim() : ""
  const embedFooter = typeof body?.embedFooter === "string" ? body.embedFooter.trim().slice(0, 100) : ""
  const hasEmbed = !!(embedTitle || embedDescription)

  if (!title || !text) {
    return NextResponse.json({ error: "Titel und Inhalt erforderlich" }, { status: 400 })
  }

  try {
    await createAnnouncement(session.user.id, {
      title,
      body: text,
      label: label || null,
      labelIcon: label ? labelIcon || null : null,
      labelColor: label ? labelColor || null : null,
      embedTitle: hasEmbed ? embedTitle || null : null,
      embedDescription: hasEmbed ? embedDescription || null : null,
      embedColor: hasEmbed ? embedColor || null : null,
      embedFooter: hasEmbed ? embedFooter || null : null,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Fehler"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
