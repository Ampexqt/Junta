import { Outlet, useLocation } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { NotificationsPopover } from '@/components/layout/NotificationsPopover';

const PAGE_TITLES: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/events': 'Events',
  '/app/map': 'Map View',
  '/app/schedule': 'Schedule',
  '/app/participation': 'My Participation',
  '/app/notifications': 'Notifications',
  '/app/settings': 'Settings',
  '/app/organizer/my-events': 'My Events',
  '/app/organizer/submissions': 'Event Submissions',
  '/app/organizer/create-event': 'Create Event',
  '/app/admin/approvals': 'Event Approvals',
  '/app/admin/verification': 'User Verification',
  '/app/admin/organizer-requests': 'Organizer Requests',
  '/app/admin/all-events': 'All Events',
  '/app/admin/users': 'All Users',
};

export function AppLayout() {
  const location = useLocation();

  // Match exact path or prefix for detail pages (e.g. /app/events/xyz)
  const pageTitle =
    PAGE_TITLES[location.pathname] ??
    (location.pathname.startsWith('/app/events/') ? 'Event Details' : 'Workspace');

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#f8faf9]">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-border/40 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="hover:text-primary transition-colors h-9 w-9" />
            <div className="w-[1px] h-5 bg-border/60 mx-0.5" />
            
            {/* Mobile Logo Branding */}
            <div className="flex items-center gap-2 sm:hidden">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-['Lora'] font-bold text-[16px] text-foreground tracking-tight">
                Junta
              </span>
            </div>

            <div className="hidden sm:flex flex-col">
              <span className="text-[11px] font-semibold text-muted-foreground/50 tracking-[0.12em] uppercase leading-none">
                Workspace
              </span>
              <span className="text-[13px] font-bold text-foreground leading-tight mt-0.5">
                {pageTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationsPopover />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-3 duration-400">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
