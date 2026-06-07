import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { deleteAnnouncement, markAnnouncementRead } from "@/lib/announcements-db"
import { isAdminEmail } from "@/lib/admin"

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  await markAnnouncementRead(params.id, session.user.id)
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  await deleteAnnouncement(params.id, session.user.id)
  return NextResponse.json({ success: true })
}
