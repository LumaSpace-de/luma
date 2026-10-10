"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart2,
  Calendar,
  Compass,
  Home,
  Mail,
  Menu,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"

const TOP_NAV_ITEMS = [
  { icon: Home,      label: "Home",      href: "/dashboard" },
  { icon: Calendar,  label: "Kalender",  href: "/calendar" },
  { icon: Mail,      label: "Inbox",     href: "/inbox" },
  { icon: BarChart2, label: "Stats",     href: "/statistics" },
  { icon: Compass,   label: "Entdecken", href: "/discover" },
]

const BOTTOM_NAV_ITEMS = [
  { icon: Home,      label: "Home",     href: "/dashboard" },
  { icon: Calendar,  label: "Kalender", href: "/calendar" },
  { icon: Mail,      label: "Inbox",    href: "/inbox" },
  { icon: BarChart2, label: "Stats",    href: "/statistics" },
  { icon: Settings,  label: "Settings", href: "/settings" },
]

export function MobileTopNav() {
  const pathname = usePathname()
  const { toggle } = useInlineSidebar()

  return (
    /* Floating pill — hovers above page content */
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-40 flex justify-center px-3 pt-3">
      <div className="pointer-events-auto flex h-11 w-full max-w-sm items-center gap-0.5 rounded-2xl border border-white/[0.08] bg-background/60 px-1.5 shadow-lg shadow-black/20 backdrop-blur-xl">
        {/* Hamburger */}
        <button
          onClick={toggle}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground/60 transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Section tabs */}
        <div className="flex flex-1 items-center gap-0.5 overflow-x-auto scrollbar-none">
          {TOP_NAV_ITEMS.map(({ icon: Icon, label, href }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[12px] font-medium transition-all",
                  active
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground/50 hover:bg-white/[0.06] hover:text-muted-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    /* Floating pill — hovers above bottom edge */
    <div
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)" }}
    >
      <div className="pointer-events-auto flex h-[58px] w-full max-w-xs items-stretch rounded-2xl border border-white/[0.08] bg-background/60 shadow-2xl shadow-black/30 backdrop-blur-xl">
        {BOTTOM_NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-[3px] rounded-2xl transition-all",
                active
                  ? "text-foreground"
                  : "text-muted-foreground/40 hover:text-muted-foreground/70"
              )}
            >
              <Icon
                className={cn(
                  "h-[19px] w-[19px] transition-all",
                  active ? "scale-110 text-foreground" : "text-muted-foreground/40"
                )}
              />
              <span
                className={cn(
                  "text-[9.5px] font-medium leading-none tracking-wide",
                  active ? "text-foreground" : "text-muted-foreground/35"
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
