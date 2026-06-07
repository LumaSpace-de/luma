"use client"

import { cn } from "@/lib/utils"

export interface AnnouncementEmbedData {
  title: string | null
  description: string | null
  color: string | null
  footer: string | null
}

export const EMBED_COLOR_PRESETS = ["#5865F2", "#57F287", "#FEE75C", "#ED4245", "#EB459E", "#9B59B6"]

export function AnnouncementEmbedCard({
  title,
  description,
  color,
  footer,
  large,
}: AnnouncementEmbedData & { large?: boolean }) {
  return (
    <div
      className={cn(
        "mt-3 flex flex-col rounded-md border-l-4 bg-muted/30",
        large ? "gap-2 px-4 py-3" : "gap-1 px-3 py-2"
      )}
      style={{ borderLeftColor: color || "#5865F2" }}
    >
      {title && <p className={cn("font-semibold", large ? "text-base" : "text-sm")}>{title}</p>}
      {description && (
        <p className={cn("whitespace-pre-wrap text-muted-foreground", large ? "text-sm" : "text-sm")}>{description}</p>
      )}
      {footer && <p className="mt-1 text-xs text-muted-foreground/60">{footer}</p>}
    </div>
  )
}
