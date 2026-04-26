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
  Check,
  Shield,
  LucideIcon
} from 'lucide-react';
import { useNotifications, AppNotification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const iconMap: Record<string, LucideIcon> = {
  event_created: CalendarDays,
  event_approved: CheckCircle,
  event_rejected: Info,
  event_joined: Users,
  kyc_submitted: Info,
  kyc_verified: CheckCircle,
  kyc_rejected: Info,
  organizer_approved: Shield,
  organizer_rejected: Info,
  system: Bell,
};

const colorMap: Record<string, { color: string; bg: string }> = {
  event_created: { color: 'text-blue-600', bg: 'bg-blue-50' },
  event_approved: { color: 'text-green-600', bg: 'bg-green-50' },
  event_rejected: { color: 'text-red-600', bg: 'bg-red-50' },
  event_joined: { color: 'text-blue-600', bg: 'bg-blue-50' },
  kyc_submitted: { color: 'text-amber-600', bg: 'bg-amber-50' },
  kyc_verified: { color: 'text-green-600', bg: 'bg-green-50' },
  kyc_rejected: { color: 'text-red-600', bg: 'bg-red-50' },
  organizer_approved: { color: 'text-green-600', bg: 'bg-green-50' },
  organizer_rejected: { color: 'text-red-600', bg: 'bg-red-50' },
  system: { color: 'text-purple-600', bg: 'bg-purple-50' },
  default: { color: 'text-primary', bg: 'bg-primary/10' }
};

export function NotificationsPage() {
  const { notifications, loading: isLoading, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const markAllRead = () => {
    markAllAsRead();
  };

  const renderList = (items: AppNotification[]) => (
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
                if (!n.read) markAsRead(n.id);
              }}
            >
              {!n.read && (
                <div className="h-0.5 w-full bg-gradient-to-r from-primary/60 to-primary/20" />
              )}
              <CardContent className="py-4 flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[n.type]?.bg || colorMap.default.bg}`}>
                  {(() => {
                     const Icon = iconMap[n.type] || Bell;
                     return <Icon className={`w-5 h-5 ${colorMap[n.type]?.color || colorMap.default.color}`} />
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'} text-foreground truncate`}>
                      {n.title}
                    </p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {n.createdAt ? formatDistanceToNow(n.createdAt, { addSuffix: true }) : 'Just now'}
                  </p>
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
    <div className="space-y-6 max-w-4xl mx-auto w-full pb-10">
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

      <Tabs defaultValue="all" className="w-full">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-2 -mx-2 px-2 pt-2">
          <TabsList className="bg-muted/50 border p-1 rounded-xl w-full justify-start overflow-x-auto hide-scrollbar">
            <TabsTrigger value="all" className="rounded-lg px-4">
              All{' '}
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/20 border-0 text-[10px] px-1.5 h-4">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-lg px-4">Events</TabsTrigger>
            <TabsTrigger value="system" className="rounded-lg px-4">System</TabsTrigger>
            <TabsTrigger value="reminders" className="rounded-lg px-4">Reminders</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="all" className="mt-4">
          {renderList(notifications)}
        </TabsContent>
        <TabsContent value="events" className="mt-4">
          {renderList(notifications.filter((n) => n.type.includes('event')))}
        </TabsContent>
        <TabsContent value="system" className="mt-4">
          {renderList(notifications.filter((n) => !n.type.includes('event') && !n.type.includes('organizer') && !n.type.includes('kyc')))}
        </TabsContent>
        <TabsContent value="reminders" className="mt-4">
          {renderList(notifications.filter((n) => n.type.includes('organizer') || n.type.includes('kyc')))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
