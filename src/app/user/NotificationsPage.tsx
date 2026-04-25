import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Bell,
  CalendarDays,
  CheckCircle,
  Info,
  Users,
  Settings,
  Check,
  LucideIcon
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/features/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

type Notification = {
  id: string;
  type: 'event' | 'system' | 'reminder' | 'verification';
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
};

const iconMap: Record<string, LucideIcon> = {
  event: CalendarDays,
  system: Info,
  reminder: Bell,
  verification: CheckCircle,
  settings: Settings,
  users: Users
};

const colorMap: Record<string, { color: string; bg: string }> = {
  event: { color: 'text-primary', bg: 'bg-primary/5' },
  system: { color: 'text-slate-600', bg: 'bg-slate-100' },
  reminder: { color: 'text-amber-600', bg: 'bg-amber-50' },
  verification: { color: 'text-primary', bg: 'bg-primary/10' },
  default: { color: 'text-primary', bg: 'bg-primary/10' }
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbNotifications = snapshot.docs.map(doc => {
        const data = doc.data();
        const type = data.type || 'system';
        const colors = colorMap[type as keyof typeof colorMap] || colorMap.default;
        
        return {
          id: doc.id,
          title: data.title || 'Notification',
          description: data.message || data.description || '',
          type: type as Notification['type'],
          time: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : 'Just now',
          read: data.read || false,
          icon: iconMap[type as keyof typeof iconMap] || Bell,
          iconColor: colors.color,
          iconBg: colors.bg
        };
      }) as Notification[];

      // Inject System Notifications
      const systemNotifications: Notification[] = [];
      
      if (profile && profile.kycStatus !== 'verified' && role === 'participant') {
        const colors = colorMap.verification;
        systemNotifications.push({
          id: 'sys-verify',
          type: 'verification',
          title: 'Action Required: Identity Verification',
          description: 'Please verify your identity to join exclusive events and unlock all features.',
          time: 'System Required',
          read: false,
          icon: CheckCircle,
          iconColor: colors.color,
          iconBg: colors.bg
        });
      }

      if (profile && role === 'participant') {
        const colors = colorMap.event;
        systemNotifications.push({
          id: 'sys-welcome',
          type: 'event',
          title: `Welcome back, ${profile.firstName}!`,
          description: 'Explore upcoming environmental events and make an impact today.',
          time: 'Account Status',
          read: true,
          icon: CalendarDays,
          iconColor: colors.color,
          iconBg: colors.bg
        });
      }

      setNotifications([...systemNotifications, ...dbNotifications]);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [profile, role]);

  const markAllRead = () => {
    // In a real app, this would update Firestore
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true
      }))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderList = (items: Notification[]) => (
    <div className="space-y-2">
      {items.length > 0 ? (
        items.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card
              className={`rounded-2xl shadow-sm border transition-all hover:shadow-md overflow-hidden ${
                !n.read 
                  ? 'bg-primary/[0.02] border-primary/20' 
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
              onClick={() => {
                if (n.id === 'sys-verify') navigate('/app/settings');
                // Update local state
                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
              }}
            >
              <CardContent className="p-0">
                <div className="flex items-stretch min-h-[90px]">
                  {!n.read && (
                    <div className="w-1.5 bg-primary shrink-0" />
                  )}
                  <div className="flex-1 p-4 flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${n.iconBg} shadow-sm`}>
                      <n.icon className={`w-5 h-5 ${n.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className={`text-sm tracking-tight truncate ${!n.read ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                            {n.title}
                          </h3>
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-pulse" />}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 whitespace-nowrap">
                          {n.time}
                        </span>
                      </div>
                      <p className={`text-[12px] leading-relaxed ${!n.read ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                        {n.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      ) : (
        <Card className="rounded-2xl border-dashed border-2 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-heading font-medium text-lg text-foreground mb-1">
              {isLoading ? 'Loading...' : 'No notifications'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {isLoading 
                ? 'Please wait while we fetch your notifications.' 
                : 'You currently have no notifications in this category. We\'ll let you know when something comes up.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full pb-20 px-4">
      <div className="flex flex-col gap-1 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <Button variant="ghost" onClick={markAllRead} className="h-8 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all">
              <Check className="w-3.5 h-3.5 mr-1.5" /> Mark all read
            </Button>
          )}
        </div>
        <p className="text-slate-500 text-[12px] font-medium">
          {unreadCount > 0 ?
            `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''} that need your attention.` :
            'You are all caught up for now! Check back later for updates.'}
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full flex flex-col items-center">
        <div className="w-full mb-6 overflow-x-auto pb-1 scrollbar-hide flex justify-center">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-100/50 p-1 text-slate-500 border border-slate-200/40 gap-1">
            <TabsTrigger value="all" className="rounded-lg px-4 font-bold text-[11px] data-active:bg-white data-active:text-primary data-active:shadow-sm">
              All
              {unreadCount > 0 && (
                <span className="ml-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-lg px-4 font-bold text-[11px] data-active:bg-white data-active:text-primary data-active:shadow-sm">Events</TabsTrigger>
            <TabsTrigger value="system" className="rounded-lg px-4 font-bold text-[11px] data-active:bg-white data-active:text-primary data-active:shadow-sm">System</TabsTrigger>
            <TabsTrigger value="reminders" className="rounded-lg px-4 font-bold text-[11px] data-active:bg-white data-active:text-primary data-active:shadow-sm">Reminders</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="all" className="mt-4">
          {renderList(notifications)}
        </TabsContent>
        <TabsContent value="events" className="mt-4">
          {renderList(notifications.filter((n) => n.type === 'event'))}
        </TabsContent>
        <TabsContent value="system" className="mt-4">
          {renderList(notifications.filter((n) => n.type === 'system'))}
        </TabsContent>
        <TabsContent value="reminders" className="mt-4">
          {renderList(notifications.filter((n) => n.type === 'reminder'))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
