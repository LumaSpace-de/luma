import "@/styles/globals.css"

import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <SidebarProvider>
          {/* SHADCN ROOT */}
          <div className="flex min-h-screen w-full">
            <AppSidebar />

            <div className="flex flex-1 flex-col">
              <header className="flex h-14 items-center gap-2 border-b px-4">
                <SidebarTrigger />
              </header>

              <main className="flex-1 overflow-auto p-4">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}