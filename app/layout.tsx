import "@/styles/globals.css"

import type { Metadata } from "next"
import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export const metadata: Metadata = {
  title: "LumaSpace",
  description: "LumaSpace - Your workspace dashboard",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <SidebarProvider>
          <AppSidebar />

          <div className="flex flex-1 flex-col">
            <header className="flex h-14 items-center gap-2 border-b px-4">
              <SidebarTrigger />
            </header>

            <main className="flex-1 overflow-auto p-4">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
