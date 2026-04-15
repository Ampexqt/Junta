import { useState } from 'react';
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
  Check
} from
  'lucide-react';
type Notification = {
  id: number;
  type: 'event' | 'system' | 'reminder';
  title: string;
  description: string;
  time: string;
  read: boolean;
  icon: any;
  iconColor: string;
  iconBg: string;
};
const initialNotifications: Notification[] = [
  {
    id: 1,
    type: 'event',
    title: 'Beach Cleanup Drive Tomorrow',
    description:
      "Don't forget! The Sta. Cruz Beach Cleanup starts at 6:00 AM. Meet at the Port Area.",
    time: '2 hours ago',
    read: false,
    icon: CalendarDays,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50'
  },
  {
    id: 2,
    type: 'system',
    title: 'Account Verified',
    description:
      'Your identity has been verified. You now have full access to all Junta features.',
    time: '5 hours ago',
    read: false,
    icon: CheckCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50'
  },
  {
    id: 3,
    type: 'event',
    title: 'New Event: Mangrove Planting',
    description:
      'A new planting event has been posted in your area. Check it out!',
    time: '1 day ago',
    read: false,
    icon: CalendarDays,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10'
  },
  {
    id: 4,
    type: 'reminder',
    title: 'Event Reminder: Eco Workshop',
    description:
      'The Marine Biodiversity Workshop is in 3 days. Make sure to prepare your materials.',
    time: '1 day ago',
    read: true,
    icon: Bell,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50'
  },
  {
    id: 5,
    type: 'system',
    title: 'Organizer Application Received',
    description:
      'Your application to become an organizer has been submitted and is under review.',
    time: '2 days ago',
    read: true,
    icon: Info,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50'
  },
  {
    id: 6,
    type: 'event',
    title: 'Event Completed: Awareness Walk',
    description:
      'Great job! The Paseo del Mar Awareness Walk has been completed. Check your impact score.',
    time: '3 days ago',
    read: true,
    icon: CheckCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50'
  },
  {
    id: 7,
    type: 'reminder',
    title: 'Weekly Impact Summary',
    description:
      'You contributed 8 hours this week across 2 events. Keep up the great work!',
    time: '4 days ago',
    read: true,
    icon: Users,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50'
  },
  {
    id: 8,
    type: 'system',
    title: 'System Maintenance',
    description:
      'Junta will undergo scheduled maintenance on Jan 20 from 2:00 AM to 4:00 AM.',
    time: '5 days ago',
    read: true,
    icon: Settings,
    iconColor: 'text-muted-foreground',
    iconBg: 'bg-muted'
  }];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const markAllRead = () =>
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true
      }))
    );
  const unreadCount = notifications.filter((n) => !n.read).length;
  const renderList = (items: Notification[]) =>
    <div className="space-y-2">
      {items.length > 0 ?
        items.map((n, i) =>
          <motion.div
            key={n.id}
            initial={{
              opacity: 0,
              y: 5
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: i * 0.03
            }}>

            <Card
              className={`rounded-xl shadow-sm border cursor-pointer transition-all hover:shadow-md overflow-hidden ${
                !n.read 
                  ? 'bg-primary/[0.02] border-primary/15 shadow-primary/5' 
                  : 'hover:bg-muted/30'
              }`}
              onClick={() =>
                setNotifications((prev) =>
                  prev.map((x) =>
                    x.id === n.id ?
                      {
                        ...x,
                        read: true
                      } :
                      x
                  )
                )
              }>
              {!n.read && (
                <div className="h-0.5 w-full bg-gradient-to-r from-primary/60 to-primary/20" />
              )}
                  <CardContent className="py-4 flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.iconBg}`}>

                  <n.icon className={`w-5 h-5 ${n.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'} text-foreground truncate`}>

                      {n.title}
                    </p>
                    {!n.read &&
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    }
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
        ) :

        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No notifications in this category.
          </p>
        </div>
      }
    </div>;

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
        {unreadCount > 0 &&
          <Button variant="outline" size="sm" onClick={markAllRead} className="hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all">
            <Check className="w-4 h-4 mr-1.5" /> Mark all read
          </Button>
        }
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All{' '}
            {unreadCount > 0 &&
              <Badge className="ml-1.5 bg-primary/10 text-primary border-0 text-[10px] px-1.5 h-4">
                {unreadCount}
              </Badge>
            }
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
    </div>);

}
