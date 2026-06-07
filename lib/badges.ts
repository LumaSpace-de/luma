export type BadgeCategory = "status" | "achievement"

export interface BadgeDef {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: BadgeCategory
}

export interface UserStats {
  registrationRank: number
  ownsEnterpriseWorkspace: boolean
  pageCount: number
  ownedWorkspaceCount: number
  friendCount: number
}

export const BADGE_CATALOG: BadgeDef[] = [
  {
    id: "early_supporter",
    name: "Early Supporter",
    description: "Gehört zu den ersten 100 registrierten Nutzern",
    icon: "Sparkles",
    color: "yellow",
    category: "status",
  },
  {
    id: "verified_org",
    name: "Verifiziertes Unternehmen",
    description: "Besitzt einen Workspace mit Enterprise-Plan",
    icon: "ShieldCheck",
    color: "purple",
    category: "status",
  },
  {
    id: "first_page",
    name: "Erste Schritte",
    description: "Hat die erste Seite erstellt",
    icon: "FileText",
    color: "blue",
    category: "achievement",
  },
  {
    id: "workspace_builder",
    name: "Workspace-Baumeister",
    description: "Besitzt mindestens 3 Workspaces",
    icon: "Building2",
    color: "orange",
    category: "achievement",
  },
  {
    id: "social_butterfly",
    name: "Gut vernetzt",
    description: "Hat mindestens 5 Freunde",
    icon: "Users",
    color: "green",
    category: "achievement",
  },
]

export function computeUserBadges(stats: UserStats): BadgeDef[] {
  const earned = new Set<string>()

  if (stats.registrationRank <= 100) earned.add("early_supporter")
  if (stats.ownsEnterpriseWorkspace) earned.add("verified_org")
  if (stats.pageCount >= 1) earned.add("first_page")
  if (stats.ownedWorkspaceCount >= 3) earned.add("workspace_builder")
  if (stats.friendCount >= 5) earned.add("social_butterfly")

  return BADGE_CATALOG.filter((b) => earned.has(b.id))
}
