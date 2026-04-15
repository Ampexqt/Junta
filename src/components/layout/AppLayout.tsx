import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';

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
  const navigate = useNavigate();
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
            <div className="w-[1px] h-5 bg-border/60 mx-0.5 hidden sm:block" />
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
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-primary/5 hover:text-primary transition-all duration-200 rounded-xl h-9 w-9"
              onClick={() => navigate('/app/notifications')}
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
            </Button>
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
