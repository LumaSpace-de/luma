import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  Users,
  Settings,
  FileText,
  Calendar,
  ChevronDown,
  Search,
  Bell,
  User,
  Folder,
  BarChart,
  Mail,
  HelpCircle,
  LogOut,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function AppSidebar() {
  const { open } = useSidebar()

  const navigationItems = [
    { icon: <Home className="h-4 w-4" />, label: "Dashboard", badge: 3 },
    { icon: <Users className="h-4 w-4" />, label: "Team", badge: "New" },
    { icon: <FileText className="h-4 w-4" />, label: "Projects" },
    { icon: <Calendar className="h-4 w-4" />, label: "Calendar" },
    { icon: <BarChart className="h-4 w-4" />, label: "Analytics" },
    { icon: <Mail className="h-4 w-4" />, label: "Inbox", badge: 12 },
    { icon: <Folder className="h-4 w-4" />, label: "Documents" },
    { icon: <Settings className="h-4 w-4" />, label: "Settings" },
  ]

  const workspaces = [
    { name: "Acme Inc", plan: "Pro" },
    { name: "Stark Industries", plan: "Free" },
    { name: "Wayne Enterprises", plan: "Enterprise" },
  ]

  const recentProjects = [
    { name: "Website Redesign", team: "Design", progress: 75 },
    { name: "Mobile App", team: "Development", progress: 40 },
    { name: "Marketing Campaign", team: "Marketing", progress: 90 },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="data-[state=open]:bg-accent">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                      <span className="text-sm font-medium text-primary-foreground">
                        A
                      </span>
                    </div>
                    {open && (
                      <>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">Acme Inc</span>
                          <span className="text-xs text-muted-foreground">
                            Pro Plan
                          </span>
                        </div>
                        <ChevronDown className="ml-auto h-4 w-4" />
                      </>
                    )}
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-popper-anchor-width]"
                align="start"
              >
                {workspaces.map((workspace, index) => (
                  <DropdownMenuItem key={index} className="gap-2 p-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
                      <span className="text-xs font-medium">
                        {workspace.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {workspace.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {workspace.plan} Plan
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
                <Separator className="my-1" />
                <DropdownMenuItem className="gap-2 p-2">
                  <Plus className="h-4 w-4" />
                  <span>Create New Workspace</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Search */}
        <SidebarGroup className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background pl-8"
            />
          </div>
        </SidebarGroup>

        <Separator />

        {/* Main Navigation */}
        <SidebarGroup className="p-4">
          {open && (
            <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
              NAVIGATION
            </h3>
          )}
          <SidebarMenu>
            {navigationItems.map((item, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton
                  className="w-full justify-start gap-2"
                  tooltip={!open ? item.label : undefined}
                >
                  {item.icon}
                  {open && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant={
                            typeof item.badge === "number"
                              ? "secondary"
                              : "default"
                          }
                          className="ml-auto"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <Separator />

        {/* Recent Projects */}
        {open && (
          <SidebarGroup className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-muted-foreground">
                RECENT PROJECTS
              </h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentProjects.map((project, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{project.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {project.team} Team
                  </span>
                </div>
              ))}
            </div>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {open && (
            <>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium">John Doe</span>
                <span className="text-xs text-muted-foreground">
                  john@acme.com
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <HelpCircle className="h-4 w-4" />
                  <span className="sr-only">Help</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}