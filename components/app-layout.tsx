"use client"

import { useEffect, useState } from "react"

import { AppSidebarContent } from "@/components/app-sidebar-content"
import { MobileBottomNav, MobileTopNav } from "@/components/mobile-nav"
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

        {/* Sidebar — hidden on mobile */}
        {!isMobile && (
          <aside
            className={cn(
              "shrink-0 overflow-hidden border-r bg-background transition-all duration-200 ease-linear",
              open ? "w-64" : "w-0"
            )}
          >
            <div className="h-full w-64">
              <AppSidebarContent onClose={() => setOpen(false)} />
            </div>
          </aside>
        )}

        {/* Sidebar overlay on mobile */}
        {isMobile && (
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 shrink-0 overflow-hidden border-r bg-background transition-all duration-200 ease-linear",
              open ? "w-72 shadow-xl" : "w-0"
            )}
          >
            <div className="h-full w-72">
              <AppSidebarContent onClose={() => setOpen(false)} />
            </div>
          </aside>
        )}

        {/* Main */}
        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Floating top nav — rendered above content via absolute positioning */}
          {isMobile && <MobileTopNav />}

          {/* Page content:
              - pt-[62px]: clears the floating top nav (44px pill + 12px gap + 6px buffer)
              - pb-[90px]: clears the floating bottom nav (58px pill + 16px safe-area + buffer) */}
          <div className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden",
            isMobile && "pt-[62px] pb-[90px]"
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && <MobileBottomNav />}
    </InlineSidebarContext.Provider>
  )
}
