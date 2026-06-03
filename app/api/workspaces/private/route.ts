import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { getOrCreatePrivateWorkspace } from "@/lib/workspaces-db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const workspace = await getOrCreatePrivateWorkspace(session.user.id)
  return NextResponse.json(workspace)
}
