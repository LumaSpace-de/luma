import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { BadgeDef, computeUserBadges } from "@/lib/badges"
import { countFriends } from "@/lib/friends-db"
import { getPagesByWorkspace } from "@/lib/pages-db"
import { supabase } from "@/lib/supabase"
import { getWorkspacesByUser } from "@/lib/workspaces-db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const userId = session.user.id

  const { data: user } = await supabase
    .from("users")
    .select("created_at")
    .eq("id", userId)
    .maybeSingle()

  let registrationRank = Number.MAX_SAFE_INTEGER
  if (user?.created_at) {
    const { count } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .lte("created_at", user.created_at)
    registrationRank = count ?? registrationRank
  }

  const workspaces = await getWorkspacesByUser(userId)
  const ownedWorkspaces = workspaces.filter((w) => w.userRole === "owner")
  const ownsEnterpriseWorkspace = ownedWorkspaces.some((w) => w.plan === "enterprise")

  const pageCounts = await Promise.all(ownedWorkspaces.map((w) => getPagesByWorkspace(w.id)))
  const pageCount = pageCounts.reduce((sum, pages) => sum + pages.length, 0)

  const friendCount = await countFriends(userId)

  const badges: BadgeDef[] = computeUserBadges({
    registrationRank,
    ownsEnterpriseWorkspace,
    pageCount,
    ownedWorkspaceCount: ownedWorkspaces.length,
    friendCount,
  })

  return NextResponse.json(badges)
}
