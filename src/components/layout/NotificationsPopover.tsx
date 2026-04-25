import { Bell, CalendarDays, CheckCircle, Info, Settings, ArrowRight, LucideIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from 'react-router-dom';
import { useNotifications, AppNotification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';



const iconMap: Record<string, LucideIcon> = {
  event: CalendarDays,
  system: Info,
  reminder: Bell,
  verification: CheckCircle,
  settings: Settings,
};

const colorMap: Record<string, { color: string; bg: string }> = {
  event_created: { color: 'text-blue-600', bg: 'bg-blue-50' },
  event_approved: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
  event_rejected: { color: 'text-rose-600', bg: 'bg-rose-50' },
  event_joined: { color: 'text-indigo-600', bg: 'bg-indigo-50' },
  kyc_submitted: { color: 'text-amber-600', bg: 'bg-amber-50' },
  kyc_verified: { color: 'text-green-600', bg: 'bg-green-50' },
  kyc_rejected: { color: 'text-red-600', bg: 'bg-red-50' },
  organizer_approved: { color: 'text-teal-600', bg: 'bg-teal-50' },
  organizer_rejected: { color: 'text-orange-600', bg: 'bg-orange-50' },
  system: { color: 'text-purple-600', bg: 'bg-purple-50' },
  default: { color: 'text-primary', bg: 'bg-primary/10' }
};

export function NotificationsPopover() {
  const { notifications, unreadCount, markAsRead } = useNotifications({ maxItems: 10 });
  const navigate = useNavigate();

  const handleNotificationClick = (n: AppNotification) => {
    if (!n.read) {
      markAsRead(n.id);
    }
    if (n.link) {
      navigate(n.link);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-primary/5 hover:text-primary transition-all duration-200 rounded-xl h-9 w-9"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4 rounded-2xl shadow-2xl border-slate-200/60 overflow-hidden" align="end">
        <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-[10px] font-black uppercase tracking-widest px-2 group">
                {unreadCount} New
              </Badge>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[350px]">
          <div className="divide-y divide-slate-50">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const colors = colorMap[n.type] || colorMap.default;
                const Icon = iconMap[n.type] || Bell;
                
                return (
                  <div 
                    key={n.id} 
                    className={`p-4 transition-all hover:bg-slate-50 relative group cursor-pointer ${!n.read ? 'bg-primary/[0.02]' : ''}`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    {!n.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-full my-4" />
                    )}
                    <div className="flex gap-3">
                      <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${colors.bg}`}>
                        <Icon className={`w-4.5 h-4.5 ${colors.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className={`text-[13px] leading-tight truncate ${!n.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-600'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] font-medium text-slate-400 shrink-0">
                            {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-900">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No new notifications at the moment.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-2 border-t border-slate-100 bg-slate-50/50">
          <Button 
            variant="ghost" 
            className="w-full text-xs font-bold text-slate-500 hover:text-primary hover:bg-white rounded-xl h-9 group transition-all"
            onClick={() => navigate('/app/notifications')}
          >
            See all notifications
            <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
