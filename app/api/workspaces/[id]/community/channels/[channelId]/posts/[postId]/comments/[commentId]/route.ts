import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { deleteCommunityComment } from "@/lib/community-db"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; channelId: string; postId: string; commentId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  await deleteCommunityComment(params.commentId, session.user.id)
  return NextResponse.json({ success: true })
}
