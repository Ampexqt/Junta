import { useLocation, useNavigate, Link } from "react-router-dom"
import {
    LayoutDashboard,
    CalendarDays,
    Map,
    Clock,
    UserCheck,
    FolderOpen,
    FileCheck,
    ClipboardCheck,
    UserPlus,
    Users,
    Leaf,
    User,
    Settings,
    LogOut,
    ChevronsUpDown,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuBadge,
    useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/components/ui/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/features/auth/AuthContext"
import type { UserRole } from "@/features/auth/AuthContext"

type NavItem = {
    label: string
    icon: any
    path: string
    badge?: number
}

type NavGroup = {
    title: string
    items: NavItem[]
}

const participantNav: NavGroup[] = [
    {
        title: "HOME",
        items: [
            {
                label: "Dashboard",
                icon: LayoutDashboard,
                path: "/app/dashboard",
            },
        ],
    },
    {
        title: "DISCOVER",
        items: [
            {
                label: "Events",
                icon: CalendarDays,
                path: "/app/events",
            },
            {
                label: "Map View",
                icon: Map,
                path: "/app/map",
            },
            {
                label: "Schedule",
                icon: Clock,
                path: "/app/schedule",
            },
        ],
    },
    {
        title: "ACTIVITY",
        items: [
            {
                label: "My Participation",
                icon: UserCheck,
                path: "/app/participation",
            },
        ],
    },
]

const organizerNav: NavGroup[] = [
    {
        title: "HOME",
        items: [
            {
                label: "Dashboard",
                icon: LayoutDashboard,
                path: "/app/dashboard",
            },
        ],
    },
    {
        title: "DISCOVER",
        items: [
            {
                label: "Events",
                icon: CalendarDays,
                path: "/app/events",
            },
            {
                label: "Map View",
                icon: Map,
                path: "/app/map",
            },
            {
                label: "Schedule",
                icon: Clock,
                path: "/app/schedule",
            },
        ],
    },
    {
        title: "MANAGEMENT",
        items: [
            {
                label: "My Events",
                icon: FolderOpen,
                path: "/app/organizer/my-events",
            },
            {
                label: "Event Submissions",
                icon: FileCheck,
                path: "/app/organizer/submissions",
            },
        ],
    },
    {
        title: "ACTIVITY",
        items: [
            {
                label: "My Participation",
                icon: UserCheck,
                path: "/app/participation",
            },
        ],
    },
]

const adminNav: NavGroup[] = [
    {
        title: "HOME",
        items: [
            {
                label: "Dashboard",
                icon: LayoutDashboard,
                path: "/app/dashboard",
            },
        ],
    },
    {
        title: "MODERATION",
        items: [
            {
                label: "Event Approvals",
                icon: ClipboardCheck,
                path: "/app/admin/approvals",
                badge: 3,
            },
            {
                label: "User Verification",
                icon: UserCheck,
                path: "/app/admin/verification",
                badge: 5,
            },
            {
                label: "Organizer Requests",
                icon: UserPlus,
                path: "/app/admin/organizer-requests",
                badge: 2,
            },
        ],
    },
    {
        title: "OVERVIEW",
        items: [
            {
                label: "All Events",
                icon: CalendarDays,
                path: "/app/admin/all-events",
            },
            {
                label: "All Users",
                icon: Users,
                path: "/app/admin/users",
            },
        ],
    },
]

const navByRole: Record<UserRole, NavGroup[]> = {
    participant: participantNav,
    organizer: organizerNav,
    admin: adminNav,
}

const roleLabels: Record<UserRole, string> = {
    participant: "Participant",
    organizer: "Organizer",
    admin: "Admin",
}

export function AppSidebar() {
    const { role, userName } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const groups = navByRole[role]
    const { state } = useSidebar()
    const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r-0">
            <SidebarHeader className="h-16 px-4 flex-row items-center border-b justify-between group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                <Link to="/" className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-primary-foreground/10 group-data-[collapsible=icon]:mr-0">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    {state === "expanded" && (
                        <span className="font-brand font-bold text-[22px] text-foreground tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                            Junta
                        </span>
                    )}
                </Link>
            </SidebarHeader>

            <SidebarContent className="py-2 overflow-y-auto scrollbar-hide">
                {groups.map((group) => (
                    <SidebarGroup key={group.title} className="group-data-[collapsible=icon]:px-0">
                        <SidebarGroupLabel className="px-4 text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-1 group-data-[collapsible=icon]:hidden">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-0.5 px-2">
                                {group.items.map((item) => {
                                    const isActive = location.pathname === item.path
                                    return (
                                        <SidebarMenuItem key={item.path}>
                                            <SidebarMenuButton
                                                onClick={() => navigate(item.path)}
                                                isActive={isActive}
                                                tooltip={item.label}
                                                size="sm"
                                                className={cn(
                                                    "transition-all duration-200 h-[35px] px-3 rounded-lg group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center",
                                                    isActive
                                                        ? "bg-primary/10 text-primary font-bold shadow-sm"
                                                        : "hover:bg-muted text-muted-foreground/80 font-medium"
                                                )}
                                            >
                                                <item.icon
                                                    className={cn(
                                                        "w-5 h-5 mr-1.5 group-data-[collapsible=icon]:mr-0 flex-shrink-0",
                                                        isActive ? "text-primary" : "text-muted-foreground/70"
                                                    )}
                                                />
                                                <span className="text-[14px] tracking-tight group-data-[collapsible=icon]:hidden">
                                                    {item.label}
                                                </span>
                                                {item.badge && state === "expanded" && (
                                                    <SidebarMenuBadge className="bg-red-500 text-white hover:bg-red-600 border-0 group-data-[collapsible=icon]:hidden">
                                                        {item.badge}
                                                    </SidebarMenuBadge>
                                                )}
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="p-4 border-t bg-muted/20">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-14 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
                        >
                            <Avatar className="h-9 w-9 rounded-lg shadow-sm group-data-[collapsible=icon]:mr-0">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-lg">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight ml-3 group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-bold text-[14.5px]">{userName}</span>
                                <span className="truncate text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                    {roleLabels[role]}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg mb-2"
                        side="top"
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                            <User className="w-4 h-4 mr-2" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => navigate('/login')}
                            className="text-red-600 focus:text-red-600"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
