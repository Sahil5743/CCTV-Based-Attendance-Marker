import {
  Calendar,
  Camera,
  DollarSign,
  Home,
  Mail,
  Settings,
  Users,
  BarChart3,
  UserCheck,
  Briefcase,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Live CCTV",
    url: "/dashboard/cctv",
    icon: Camera,
  },
  {
    title: "Attendance",
    url: "/dashboard/attendance",
    icon: UserCheck,
  },
  {
    title: "Employees",
    url: "/dashboard/employees",
    icon: Users,
  },
  {
    title: "Students",
    url: "/dashboard/students",
    icon: Briefcase,
  },
  {
    title: "Salary Management",
    url: "/dashboard/salary",
    icon: DollarSign,
  },
  {
    title: "Holiday Management",
    url: "/dashboard/holidays",
    icon: Calendar,
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Email Settings",
    url: "/dashboard/email",
    icon: Mail,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-2">
          <Camera className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg">AttendanceVision</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="p-4 text-sm text-gray-600">
          <p>© 2024 AttendanceVision</p>
          <p>Version 1.0.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
