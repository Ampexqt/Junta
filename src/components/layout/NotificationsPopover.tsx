import { useState } from 'react';
import { Bell, CalendarDays, CheckCircle, Info, Star, Shield, Zap, LucideIcon, ChevronRight } from 'lucide-react';
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
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  event_created: CalendarDays,
  event_approved: CheckCircle,
  event_rejected: Info,
  event_joined: CalendarDays,
  event_started: Zap,
  event_completed: CheckCircle,
  rating_received: Star,
  kyc_submitted: Shield,
  kyc_verified: CheckCircle,
  kyc_rejected: Info,
  organizer_approved: CheckCircle,
  organizer_rejected: Info,
  xp_earned: Star,
  op_earned: Shield,
  system: Info,
};

const colorMap: Record<string, { color: string; bg: string; border: string }> = {
  event_created: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  event_approved: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  event_rejected: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
  event_joined: { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  event_started: { color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
  event_completed: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  rating_received: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
  kyc_submitted: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  kyc_verified: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  kyc_rejected: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
  organizer_approved: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  organizer_rejected: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
  xp_earned: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  op_earned: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  system: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  default: { color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' }
};

export function NotificationsPopover() {
  const { notifications, unreadCount, markAsRead } = useNotifications({ maxItems: 8 });
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);


  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-slate-100 transition-all duration-200 rounded-xl h-9 w-9 border border-transparent hover:border-slate-200"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px] text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white shadow-sm" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0 mr-4 rounded-2xl shadow-2xl border-slate-200/60 overflow-hidden" align="end">
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-900 tracking-tight">Activity</h3>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-white border-0 text-[10px] font-black uppercase tracking-widest px-1.5 h-4 min-w-[18px] flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[380px]">
          <div className="divide-y divide-slate-50">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const colors = colorMap[n.type] || colorMap.default;
                const Icon = iconMap[n.type] || Bell;
                
                return (
                  <div 
                    key={n.id} 
                    className={cn(
                      "p-4 border-b border-slate-50 last:border-0 relative",
                      !n.read ? "bg-white" : ""
                    )}
                  >
                    {!n.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full my-3" />
                    )}
                    <div className="flex gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border shadow-sm",
                        colors.bg,
                        colors.border
                      )}>
                        <Icon className={cn("w-4.5 h-4.5", colors.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1 mb-0.5">
                          <p className={cn(
                            "text-[13px] leading-snug",
                            !n.read ? "font-bold text-slate-900" : "font-semibold text-slate-600"
                          )}>
                            {n.title}
                          </p>
                          <span className="text-[10px] font-medium text-slate-400 shrink-0 mt-0.5">
                            {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                          </span>
                        </div>
                        <p className={cn(
                          "text-[11px] line-clamp-2 leading-relaxed",
                          !n.read ? "text-slate-700 font-medium" : "text-slate-500"
                        )}>
                          {n.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                <div className="w-16 h-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-sm font-black text-slate-800 tracking-tight">All caught up!</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">No new updates to show at the moment.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-2 border-t border-slate-100 bg-slate-50/50">
          <Button 
            variant="ghost" 
            className="w-full text-[11px] font-bold text-slate-500 hover:text-primary hover:bg-white rounded-xl h-9 group transition-all"
            onClick={() => {
              setIsOpen(false);
              navigate('/app/notifications');
            }}
          >
            Manage all notifications
            <ChevronRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
