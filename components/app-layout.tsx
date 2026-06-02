"use client"

import { Menu, X } from "lucide-react"
import { useEffect, useState } from "react"

import { AppSidebarContent } from "@/components/app-sidebar-content"
import { Button } from "@/components/ui/button"
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
          {/* Mobile top bar */}
          {isMobile && (
            <div className="flex h-12 shrink-0 items-center border-b px-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen((o) => !o)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          )}
          {children}
        </main>
      </div>
    </InlineSidebarContext.Provider>
  )
}
