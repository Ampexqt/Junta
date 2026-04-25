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

const colorMap: Record<string, { color: string; bg: string; border: string }> = {
  event: { color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10' },
  system: { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  reminder: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  verification: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  default: { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' }
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => {
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
      setNotifications(fetched);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true
      }))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderList = (items: Notification[]) => (
    <div className="space-y-3">
      {items.length > 0 ? (
        items.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02, duration: 0.3 }}
          >
            <Card
              className={`rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                !n.read 
                  ? 'bg-white border-primary/20 shadow-md shadow-primary/5' 
                  : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
              }`}
              onClick={() => {
                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
              }}
            >
              {!n.read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
              )}
              <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-300 ${n.iconBg}`}>
                  <n.icon className={`w-6 h-6 ${n.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className={`text-sm tracking-tight ${!n.read ? 'font-black text-slate-900' : 'font-bold text-slate-600'} truncate`}>
                        {n.title}
                      </p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 animate-pulse" />}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-md">
                      {n.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                    {n.description}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Bell className="w-3 h-3" /> {n.time}
                    </p>
                    {n.read && (
                      <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Seen
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      ) : (
        <Card className="rounded-[2rem] border-dashed border-2 border-slate-200 shadow-none bg-slate-50/30">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 relative">
              <Bell className="w-10 h-10 text-slate-200" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary/20 rounded-full blur-sm" />
            </div>
            <h3 className="font-heading font-black text-xl text-slate-900 mb-2">
              {isLoading ? 'Fetching Updates...' : 'All caught up!'}
            </h3>
            <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
              {isLoading 
                ? 'We are checking our records for any new messages or events just for you.' 
                : 'You have no new notifications right now. Enjoy the peace while it lasts!'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full pb-20 px-4 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-heading font-black text-3xl text-slate-900 tracking-tight">
              Notifications
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-sm ml-1">
            {unreadCount > 0 ?
              `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''} waiting for your attention.` :
              'No unread messages. You\'re doing great!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllRead} 
            className="rounded-xl border-slate-200 font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm active:scale-95"
          >
            <Check className="w-4 h-4 mr-2" /> Mark all read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl pb-4 -mx-4 px-4 pt-2">
          <TabsList className="bg-slate-100/50 border border-slate-200/40 p-1 rounded-2xl w-full sm:w-auto justify-start overflow-x-auto no-scrollbar gap-1">
            <TabsTrigger value="all" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">
              All{' '}
              {unreadCount > 0 && (
                <span className="ml-2 w-5 h-5 flex items-center justify-center bg-primary text-white rounded-lg text-[9px] font-black">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">Events</TabsTrigger>
            <TabsTrigger value="system" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">System</TabsTrigger>
            <TabsTrigger value="reminders" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all">Reminders</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="mt-2">
          <TabsContent value="all" className="mt-0 focus-visible:outline-none">
            {renderList(notifications)}
          </TabsContent>
          <TabsContent value="events" className="mt-0 focus-visible:outline-none">
            {renderList(notifications.filter((n) => n.type === 'event'))}
          </TabsContent>
          <TabsContent value="system" className="mt-0 focus-visible:outline-none">
            {renderList(notifications.filter((n) => n.type === 'system'))}
          </TabsContent>
          <TabsContent value="reminders" className="mt-0 focus-visible:outline-none">
            {renderList(notifications.filter((n) => n.type === 'reminder'))}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
