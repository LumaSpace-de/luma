import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { deleteCommunityChannel } from "@/lib/community-db"
import { getUserRoleInWorkspace } from "@/lib/workspaces-db"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; channelId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const role = await getUserRoleInWorkspace(session.user.id, params.id)
  if (role !== "owner" && role !== "admin") {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  await deleteCommunityChannel(params.channelId, params.id)
  return NextResponse.json({ success: true })
}
