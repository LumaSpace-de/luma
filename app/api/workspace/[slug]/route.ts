import { NextRequest, NextResponse } from "next/server"

import { getWorkspaceBySlug } from "@/lib/workspaces-db"

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const workspace = await getWorkspaceBySlug(params.slug)
  if (!workspace) {
    return NextResponse.json({ error: "Workspace nicht gefunden" }, { status: 404 })
  }
  return NextResponse.json(workspace)
}
