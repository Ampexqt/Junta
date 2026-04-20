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

const colorMap: Record<string, { color: string; bg: string }> = {
  event: { color: 'text-blue-600', bg: 'bg-blue-50' },
  system: { color: 'text-purple-600', bg: 'bg-purple-50' },
  reminder: { color: 'text-amber-600', bg: 'bg-amber-50' },
  verification: { color: 'text-green-600', bg: 'bg-green-50' },
  default: { color: 'text-primary', bg: 'bg-primary/10' }
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
              className={`rounded-xl shadow-sm border cursor-pointer transition-all hover:shadow-md overflow-hidden ${
                !n.read 
                  ? 'bg-primary/[0.02] border-primary/15 shadow-primary/5' 
                  : 'hover:bg-muted/30'
              }`}
              onClick={() => {
                // Update local state (should update Firestore in real app)
                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
              }}
            >
              {!n.read && (
                <div className="h-0.5 w-full bg-gradient-to-r from-primary/60 to-primary/20" />
              )}
              <CardContent className="py-4 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.iconBg}`}>
                  <n.icon className={`w-5 h-5 ${n.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'} text-foreground truncate`}>
                      {n.title}
                    </p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {n.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {n.time}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading notifications...' : 'No notifications in this category.'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-semibold text-2xl text-foreground">
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ?
              `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.` :
              'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all">
            <Check className="w-4 h-4 mr-1.5" /> Mark all read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All{' '}
            {unreadCount > 0 && (
              <Badge className="ml-1.5 bg-primary/10 text-primary border-0 text-[10px] px-1.5 h-4">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>
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
