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
  indigo: "bg-indigo-500/15 text-indigo-400",
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
    </svg>
  )
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
          const Icon = badge.icon === "Discord" ? DiscordIcon : (ICONS[badge.icon] ?? Sparkles)
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
