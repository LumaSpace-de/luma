"use client"

import { Building2, FileText, ShieldCheck, Sparkles, Users, type LucideIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BadgeDef } from "@/lib/badges"
import { cn } from "@/lib/utils"

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  ShieldCheck,
  FileText,
  Building2,
  Users,
}

const COLORS: Record<string, string> = {
  yellow: "bg-yellow-500/15 text-yellow-400",
  purple: "bg-purple-500/15 text-purple-400",
  blue: "bg-blue-500/15 text-blue-400",
  orange: "bg-orange-500/15 text-orange-400",
  green: "bg-green-500/15 text-green-400",
}

export function ProfileBadges() {
  const [badges, setBadges] = useState<BadgeDef[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/badges")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setBadges(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-7 w-28 animate-pulse rounded-full bg-muted/30" />
        ))}
      </div>
    )
  }

  if (badges.length === 0) {
    return (
      <p className="text-sm text-muted-foreground/60">
        Noch keine Abzeichen freigeschaltet.
      </p>
    )
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => {
          const Icon = ICONS[badge.icon] ?? Sparkles
          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                    COLORS[badge.color] ?? "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {badge.name}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
