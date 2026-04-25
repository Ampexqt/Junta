import { useState, useEffect } from 'react';
import { Bell, CalendarDays, CheckCircle, Info, Settings, ArrowRight, LucideIcon } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

type Notification = {
  id: string;
  type: 'event' | 'system' | 'reminder' | 'verification';
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const iconMap: Record<string, LucideIcon> = {
  event: CalendarDays,
  system: Info,
  reminder: Bell,
  verification: CheckCircle,
  settings: Settings,
};

const colorMap: Record<string, { color: string; bg: string }> = {
  event: { color: 'text-primary', bg: 'bg-primary/5' },
  system: { color: 'text-slate-600', bg: 'bg-slate-100' },
  reminder: { color: 'text-amber-600', bg: 'bg-amber-50' },
  verification: { color: 'text-primary', bg: 'bg-primary/10' },
  default: { color: 'text-primary', bg: 'bg-primary/10' }
};

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenAll, setHasSeenAll] = useState(false);
  const navigate = useNavigate();
  const { profile, role } = useAuth();

  // Reset "seen" state when new notifications arrive from the DB
  useEffect(() => {
    setHasSeenAll(false);
  }, [unreadCount]);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'), 
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbNotifications = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Notification',
          description: data.message || data.description || '',
          type: data.type || 'system',
          time: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
          read: data.read || false,
        };
      }) as Notification[];

      // Inject System Notifications based on User State
      const systemNotifications: Notification[] = [];

      // 1. Verification Prompt (High Priority)
      if (profile && profile.kycStatus !== 'verified' && role === 'participant') {
        systemNotifications.push({
          id: 'sys-verify',
          type: 'verification',
          title: 'Action Required: Identity Verification',
          description: 'Please verify your identity to join exclusive events and unlock all features.',
          time: 'System',
          read: false
        });
      }

      // 2. Welcome Message
      if (profile && role === 'participant') {
        systemNotifications.push({
          id: 'sys-welcome',
          type: 'event',
          title: `Welcome back, ${profile.firstName}!`,
          description: 'Explore upcoming environmental events and make an impact today.',
          time: 'Today',
          read: true
        });
      }

      const allNotifications = [...systemNotifications, ...dbNotifications];
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [profile, role]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    setHasSeenAll(true);
    // In a real app, you would also update the Firestore docs here
  };

  return (
    <Popover onOpenChange={(open) => {
      setIsOpen(open);
      if (open) setHasSeenAll(true);
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-primary/5 hover:text-primary transition-all duration-200 rounded-xl h-9 w-9"
          aria-label="Notifications"
        >
          <Bell className={`w-[18px] h-[18px] transition-colors ${isOpen ? 'text-primary' : 'text-slate-600'}`} />
          {unreadCount > 0 && !hasSeenAll && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0 mr-4 rounded-2xl shadow-2xl border-slate-200/60 overflow-hidden" align="end">
        <div className="p-4 border-b border-slate-100 bg-white/50 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-[10px] font-black uppercase tracking-widest px-2">
                {unreadCount} New
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-7 px-2 text-[10px] font-bold text-primary hover:bg-primary/5 rounded-lg"
            >
              Mark all as read
            </Button>
          )}
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
                    className={`p-4 transition-all hover:bg-slate-50 relative group cursor-pointer ${!n.read ? 'bg-primary/[0.03]' : ''}`}
                    onClick={() => {
                      if (n.id === 'sys-verify') navigate('/app/settings');
                      else navigate('/app/events');
                    }}
                  >
                    {!n.read && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-full" />
                    )}
                    <div className="flex gap-3">
                      <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${colors.bg}`}>
                        <Icon className={`w-4.5 h-4.5 ${colors.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className={`text-[13px] leading-snug flex-1 ${!n.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-600'}`}>
                            {n.title}
                          </p>
                          <span className="text-[9px] font-bold text-slate-400 shrink-0 uppercase tracking-tight mt-0.5">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {n.description}
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
