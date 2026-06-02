"use client"

import { useState } from "react"

import { AppSidebarContent } from "@/components/app-sidebar-content"
import { InlineSidebarContext } from "@/hooks/use-inline-sidebar"
import { cn } from "@/lib/utils"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <InlineSidebarContext.Provider
      value={{ open, toggle: () => setOpen((o) => !o) }}
    >
      <div className="flex h-screen overflow-hidden bg-background">
        <aside
          className={cn(
            "shrink-0 overflow-hidden border-r transition-[width] duration-200 ease-linear",
            open ? "w-64" : "w-0"
          )}
        >
          <div className="h-full w-64">
            <AppSidebarContent />
          </div>
        </aside>
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </InlineSidebarContext.Provider>
  )
}
