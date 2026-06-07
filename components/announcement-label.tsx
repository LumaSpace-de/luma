"use client"

import {
  AlertTriangle,
  Bell,
  Bug,
  FileText,
  Megaphone,
  Rocket,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

export const LABEL_ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Megaphone,
  Rocket,
  Wrench,
  FileText,
  Bug,
  Bell,
  AlertTriangle,
}

export const LABEL_ICON_OPTIONS = Object.keys(LABEL_ICONS) as (keyof typeof LABEL_ICONS)[]

export const LABEL_COLORS: Record<string, string> = {
  blue: "bg-blue-500/15 text-blue-400",
  green: "bg-green-500/15 text-green-400",
  purple: "bg-purple-500/15 text-purple-400",
  orange: "bg-orange-500/15 text-orange-400",
  red: "bg-red-500/15 text-red-400",
  yellow: "bg-yellow-500/15 text-yellow-400",
}

export const LABEL_COLOR_OPTIONS = Object.keys(LABEL_COLORS)

export function AnnouncementLabelBadge({
  text,
  icon,
  color,
  className,
}: {
  text: string
  icon: string
  color: string
  className?: string
}) {
  const Icon = LABEL_ICONS[icon] ?? Megaphone
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        LABEL_COLORS[color] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {text}
    </span>
  )
}
