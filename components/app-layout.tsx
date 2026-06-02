"use client"

import { useEffect, useState } from "react"

import { AppSidebarContent } from "@/components/app-sidebar-content"
import { InlineSidebarContext } from "@/hooks/use-inline-sidebar"
import { cn } from "@/lib/utils"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function check() {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setOpen(!mobile)
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <InlineSidebarContext.Provider value={{ open, toggle: () => setOpen((o) => !o) }}>
      <div className="flex h-screen overflow-hidden bg-background">

        {/* Mobile backdrop */}
        {isMobile && open && (
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "shrink-0 overflow-hidden border-r bg-background transition-all duration-200 ease-linear",
            isMobile
              ? cn(
                  "fixed inset-y-0 left-0 z-50",
                  open ? "w-72 shadow-xl" : "w-0"
                )
              : open
              ? "w-64"
              : "w-0"
          )}
        >
          <div className={cn("h-full", isMobile ? "w-72" : "w-64")}>
            <AppSidebarContent onClose={() => isMobile && setOpen(false)} />
          </div>
        </aside>

        {/* Main */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </InlineSidebarContext.Provider>
  )
}
