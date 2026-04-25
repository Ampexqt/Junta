import { useLocation, useNavigate, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
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

    LogOut,
    ChevronsUpDown,
    LucideIcon
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
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/features/auth/AuthContext"
import type { UserRole } from "@/features/auth/AuthContext"

type NavItem = {
    label: string
    icon: LucideIcon
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
            { label: "Dashboard", icon: LayoutDashboard, path: "/app/dashboard" },
        ],
    },
    {
        title: "DISCOVER",
        items: [
            { label: "Events",   icon: CalendarDays, path: "/app/events" },
            { label: "Map View", icon: Map,          path: "/app/map" },
            { label: "Schedule", icon: Clock,        path: "/app/schedule" },
        ],
    },
    {
        title: "ACTIVITY",
        items: [
            { label: "My Participation", icon: UserCheck, path: "/app/participation" },
        ],
    },
]

const organizerNav: NavGroup[] = [
    {
        title: "HOME",
        items: [
            { label: "Dashboard", icon: LayoutDashboard, path: "/app/dashboard" },
        ],
    },
    {
        title: "DISCOVER",
        items: [
            { label: "Events",   icon: CalendarDays, path: "/app/events" },
            { label: "Map View", icon: Map,          path: "/app/map" },
            { label: "Schedule", icon: Clock,        path: "/app/schedule" },
        ],
    },
    {
        title: "MANAGEMENT",
        items: [
            { label: "My Events",          icon: FolderOpen, path: "/app/organizer/my-events" },
            { label: "Event Submissions",  icon: FileCheck,  path: "/app/organizer/submissions" },
        ],
    },
    {
        title: "ACTIVITY",
        items: [
            { label: "My Participation", icon: UserCheck, path: "/app/participation" },
        ],
    },
]

const adminNav: NavGroup[] = [
    {
        title: "HOME",
        items: [
            { label: "Dashboard", icon: LayoutDashboard, path: "/app/dashboard" },
        ],
    },
    {
        title: "MODERATION",
        items: [
            { label: "Event Approvals",     icon: ClipboardCheck, path: "/app/admin/approvals",         badge: 3 },
            { label: "User Verification",   icon: UserCheck,      path: "/app/admin/verification",      badge: 5 },
            { label: "Organizer Requests",  icon: UserPlus,       path: "/app/admin/organizer-requests", badge: 2 },
        ],
    },
    {
        title: "OVERVIEW",
        items: [
            { label: "All Events", icon: CalendarDays, path: "/app/admin/all-events" },
            { label: "All Users",  icon: Users,        path: "/app/admin/users" },
        ],
    },
]

const navByRole: Record<UserRole, NavGroup[]> = {
    participant: participantNav,
    organizer:   organizerNav,
    admin:       adminNav,
}

const roleLabels: Record<UserRole, string> = {
    participant: "Participant",
    organizer:   "Organizer",
    admin:       "Admin",
}

export function AppSidebar() {
    const { role, userName, profile, logout: handleLogout } = useAuth()
    const location = useLocation()
    const navigate  = useNavigate()
    const { state, isMobile, openMobile, setOpenMobile } = useSidebar()
    const isExpanded = state === "expanded" || (isMobile && openMobile)

    const [adminBadges, setAdminBadges] = useState({ approvals: 0, verification: 0, organizer: 0 })

    useEffect(() => {
        if (role !== 'admin') return;
        
        const unsub1 = onSnapshot(query(collection(db, 'events'), where('status', '==', 'pending')), (snap) => {
            setAdminBadges(p => ({ ...p, approvals: snap.size }))
        });
        const unsub2 = onSnapshot(query(collection(db, 'users'), where('kycStatus', '==', 'pending')), (snap) => {
            setAdminBadges(p => ({ ...p, verification: snap.size }))
        });
        const unsub3 = onSnapshot(query(collection(db, 'users'), where('organizerRequestStatus', '==', 'pending')), (snap) => {
            setAdminBadges(p => ({ ...p, organizer: snap.size }))
        });
        
        return () => { unsub1(); unsub2(); unsub3(); }
    }, [role])

    const groups = navByRole[role].map(group => {
        if (role === 'admin' && group.title === "MODERATION") {
            return {
                ...group,
                items: group.items.map(item => {
                    if (item.label === "Event Approvals") return { ...item, badge: adminBadges.approvals || undefined }
                    if (item.label === "User Verification") return { ...item, badge: adminBadges.verification || undefined }
                    if (item.label === "Organizer Requests") return { ...item, badge: adminBadges.organizer || undefined }
                    return item
                })
            }
        }
        return group
    })

    const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

    const handleNav = (path: string) => {
        navigate(path)
        if (isMobile) setOpenMobile(false)
    }

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r-0">
            {/* ── Header / Logo ── */}
            <SidebarHeader className="h-16 px-3 flex-row items-center border-b border-border/40 justify-start gap-2 overflow-hidden">
                <Link to="/" className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    {isExpanded && (
                        <span className="font-['Lora'] font-bold text-[20px] text-foreground tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
                            Junta
                        </span>
                    )}
                </Link>
            </SidebarHeader>

            {/* ── Navigation ── */}
            <SidebarContent className="py-3 gap-0 overflow-y-auto scrollbar-hide">
                {groups.map((group) => (
                    <SidebarGroup key={group.title} className="px-2 py-1">
                        {isExpanded && (
                            <SidebarGroupLabel className="px-2 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.18em] mb-1">
                                {group.title}
                            </SidebarGroupLabel>
                        )}
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-0.5">
                                {group.items.map((item) => {
                                    const isActive = location.pathname === item.path
                                    return (
                                        <SidebarMenuItem key={item.path}>
                                            <SidebarMenuButton
                                                onClick={() => handleNav(item.path)}
                                                isActive={isActive}
                                                tooltip={item.label}
                                                size="sm"
                                                className={cn(
                                                    "h-9 rounded-lg px-2.5 transition-all duration-150 w-full",
                                                    "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:mx-auto",
                                                    isActive
                                                        ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                                                        : "text-muted-foreground/70 font-medium hover:bg-muted hover:text-foreground"
                                                )}
                                            >
                                                <item.icon
                                                    className={cn(
                                                        "w-[18px] h-[18px] flex-shrink-0 transition-colors",
                                                        isActive ? "text-primary" : "text-muted-foreground/60"
                                                    )}
                                                />
                                                <span className="text-[13.5px] tracking-tight group-data-[collapsible=icon]:hidden ml-2">
                                                    {item.label}
                                                </span>
                                                {item.badge && isExpanded && (
                                                    <SidebarMenuBadge className="ml-auto bg-red-500 text-white text-[10px] font-bold border-0 rounded-md h-4 min-w-[16px] px-1">
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

            {/* ── Footer / User ── */}
            <SidebarFooter className="p-2 border-t border-border/40">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className={cn(
                                "h-12 rounded-xl w-full transition-all hover:bg-muted",
                                "group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:px-0"
                            )}
                        >
                            <Avatar className="h-8 w-8 rounded-lg border border-border/40 shadow-sm flex-shrink-0">
                                <AvatarImage src={profile?.photoURL} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold rounded-lg">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            {isExpanded && (
                                <div className="grid flex-1 text-left text-sm leading-tight ml-2 group-data-[collapsible=icon]:hidden overflow-hidden">
                                    <span className="truncate font-bold text-[13.5px]">{userName}</span>
                                    <span className="truncate text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                                        {roleLabels[role]}
                                    </span>
                                </div>
                            )}
                            {isExpanded && (
                                <ChevronsUpDown className="ml-auto h-3.5 w-3.5 text-muted-foreground/40 group-data-[collapsible=icon]:hidden" />
                            )}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-52 rounded-xl mb-1 shadow-xl border-border/50"
                        side="top"
                        align="end"
                        sideOffset={6}
                    >
                        <DropdownMenuItem onClick={() => handleNav('/app/settings')} className="rounded-lg">
                            <User className="w-4 h-4 mr-2 text-muted-foreground" />
                            Profile
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => { handleLogout(); navigate('/login'); }}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>

            {/* ── Rail (drag to collapse/expand) ── */}
            <SidebarRail />
        </Sidebar>
    )
}
