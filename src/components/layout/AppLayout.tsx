import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Bell,
} from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';

export function AppLayout() {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#f8faf9]">
        <header className="h-16 bg-white/70 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="hover:text-primary transition-colors h-9 w-9" />
            <div className="w-[1px] h-4 bg-border/60 mx-1 hidden sm:block" />
            <span className="text-xs font-medium text-muted-foreground/60 tracking-wider uppercase hidden sm:block">
              Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">

            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-primary/5 hover:text-primary transition-all duration-300 rounded-xl"
              onClick={() => navigate('/app/notifications')}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}