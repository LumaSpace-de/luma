"use client"

export interface AnnouncementEmbedData {
  title: string | null
  description: string | null
  color: string | null
  footer: string | null
}

export const EMBED_COLOR_PRESETS = ["#5865F2", "#57F287", "#FEE75C", "#ED4245", "#EB459E", "#9B59B6"]

export function AnnouncementEmbedCard({ title, description, color, footer }: AnnouncementEmbedData) {
  return (
    <div
      className="mt-3 flex flex-col gap-1 rounded-md border-l-4 bg-muted/30 px-3 py-2"
      style={{ borderLeftColor: color || "#5865F2" }}
    >
      {title && <p className="text-sm font-semibold">{title}</p>}
      {description && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{description}</p>}
      {footer && <p className="mt-1 text-xs text-muted-foreground/60">{footer}</p>}
    </div>
  )
}
