"use client"

import { Building2, Compass, Lock, PanelLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"

const PREVIEW_ITEMS = [
  { name: "Design Community", members: "2.4k", category: "Design" },
  { name: "Startup Founders", members: "1.8k", category: "Business" },
  { name: "Dev Collective", members: "5.1k", category: "Entwicklung" },
  { name: "Creative Hub", members: "890", category: "Kreativ" },
  { name: "Product Builders", members: "3.2k", category: "Produkt" },
  { name: "Marketing Circle", members: "1.1k", category: "Marketing" },
]

export default function DiscoverPage() {
  const { toggle } = useInlineSidebar()

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">Entdecken</h1>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* Blurred preview */}
        <div className="pointer-events-none select-none p-6 blur-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Öffentliche Communitys
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            Entdecke Workspaces und Communities anderer Nutzer.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PREVIEW_ITEMS.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-xl border bg-card p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                  {item.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.name}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {item.members}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px]">
          <div className="flex flex-col items-center rounded-2xl border border-border/60 bg-card/80 px-10 py-10 text-center shadow-xl backdrop-blur-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Demnächst verfügbar</h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Öffentliche Workspaces und Communities befinden sich noch in der Entwicklung.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-4 py-2">
              <Compass className="h-4 w-4 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground">Entdecken · Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
