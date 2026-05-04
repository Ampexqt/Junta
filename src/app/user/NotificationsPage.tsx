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
  Star,
  Zap,
  Trash2,
  LucideIcon
} from 'lucide-react';
import { useNotifications, AppNotification } from '@/hooks/useNotifications';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import { sileo } from 'sileo';

const iconMap: Record<string, LucideIcon> = {
  event_created: CalendarDays,
  event_approved: CheckCircle,
  event_rejected: Info,
  event_joined: Users,
  event_started: Zap,
  event_completed: CheckCircle,
  rating_received: Star,
  kyc_submitted: Info,
  kyc_verified: CheckCircle,
  kyc_rejected: Info,
  organizer_approved: Shield,
  organizer_rejected: Info,
  xp_earned: Star,
  op_earned: Shield,
  system: Bell,
};

const colorMap: Record<string, { color: string; bg: string }> = {
  event_created: { color: 'text-blue-600', bg: 'bg-blue-50' },
  event_approved: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
  event_rejected: { color: 'text-rose-600', bg: 'bg-rose-50' },
  event_joined: { color: 'text-indigo-600', bg: 'bg-indigo-50' },
  event_started: { color: 'text-teal-600', bg: 'bg-teal-50' },
  event_completed: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
  rating_received: { color: 'text-yellow-600', bg: 'bg-yellow-50' },
  kyc_submitted: { color: 'text-amber-600', bg: 'bg-amber-50' },
  kyc_verified: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
  kyc_rejected: { color: 'text-rose-600', bg: 'bg-rose-50' },
  organizer_approved: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
  organizer_rejected: { color: 'text-rose-600', bg: 'bg-rose-50' },
  xp_earned: { color: 'text-emerald-600', bg: 'bg-emerald-50' },
  op_earned: { color: 'text-blue-600', bg: 'bg-blue-50' },
  system: { color: 'text-purple-600', bg: 'bg-purple-50' },
  default: { color: 'text-slate-600', bg: 'bg-slate-100' }
};

export function NotificationsPage() {
  const { notifications, loading: isLoading, unreadCount, markAsRead, markAllAsRead, clearAllRead } = useNotifications();

  const handleMarkAllRead = () => markAllAsRead();
  const handleClearAll = async () => {
    await clearAllRead();
    sileo.success('Notifications cleared');
  };

  const groupNotifications = (items: AppNotification[]) => {
    const groups: Record<string, AppNotification[]> = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Older': []
    };

    items.forEach(n => {
      const date = n.createdAt;
      if (isToday(date)) groups['Today'].push(n);
      else if (isYesterday(date)) groups['Yesterday'].push(n);
      else if (isThisWeek(date)) groups['This Week'].push(n);
      else groups['Older'].push(n);
    });

    return groups;
  };

  const renderNotificationItem = (n: AppNotification) => {
    const Icon = iconMap[n.type] || Bell;
    const colors = colorMap[n.type] || colorMap.default;
    
    return (
      <div 
        key={n.id}
        onClick={() => { if (!n.read) markAsRead(n.id); }}
        className={`group relative flex items-start gap-4 p-4 sm:px-6 transition-all cursor-pointer ${
          !n.read ? 'bg-blue-50/30' : 'hover:bg-slate-50'
        }`}
      >
        {!n.read && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
        )}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.color}`} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm ${!n.read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
              {n.title}
            </p>
            <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap flex-shrink-0">
              {formatDistanceToNow(n.createdAt, { addSuffix: true })}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[95%]">
            {n.message}
          </p>
        </div>
      </div>
    );
  };

  const renderList = (items: AppNotification[]) => {
    if (items.length === 0) {
      return (
        <Card className="rounded-2xl border-dashed border-2 shadow-sm bg-slate-50/50 mt-4">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-white border shadow-sm flex items-center justify-center mb-4 grayscale opacity-60">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-800 mb-1">
              {isLoading ? 'Loading...' : 'You\'re all caught up!'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto text-balance">
              {isLoading 
                ? 'Please wait while we fetch your notifications.' 
                : 'No new notifications to show in this category. Take a break!'}
            </p>
          </CardContent>
        </Card>
      );
    }

    const grouped = groupNotifications(items);

    return (
      <div className="space-y-6 mt-4">
        {Object.entries(grouped).map(([label, groupItems]) => {
          if (groupItems.length === 0) return null;
          return (
            <div key={label} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pl-2">
                {label}
              </h4>
              <Card className="rounded-2xl shadow-sm border overflow-hidden bg-white">
                <div className="divide-y divide-slate-100">
                  {groupItems.map(renderNotificationItem)}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto w-full pb-16 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl text-slate-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {unreadCount > 0 ? (
              <span>You have <strong className="text-blue-600">{unreadCount} unread</strong> notification{unreadCount > 1 ? 's' : ''}.</span>
            ) : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="h-9 font-semibold text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-700">
              <Check className="w-4 h-4 mr-1.5" /> Mark read
            </Button>
          )}
          {notifications.some(n => n.read) && (
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-9 font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50">
              <Trash2 className="w-4 h-4 mr-1.5" /> Clear read
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-slate-100/80 rounded-xl overflow-x-auto hide-scrollbar flex-nowrap">
          <TabsTrigger value="all" className="rounded-lg px-5 py-2 text-sm font-bold data-[state=active]:shadow-sm flex-shrink-0">
            All
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-blue-500 text-white hover:bg-blue-600 border-0 text-[10px] px-1.5 h-4">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="events" className="rounded-lg px-5 py-2 text-sm font-bold data-[state=active]:shadow-sm flex-shrink-0">
            Events
          </TabsTrigger>
          <TabsTrigger value="rewards" className="rounded-lg px-5 py-2 text-sm font-bold data-[state=active]:shadow-sm flex-shrink-0">
            Rewards 🌟
          </TabsTrigger>
          <TabsTrigger value="kyc" className="rounded-lg px-5 py-2 text-sm font-bold data-[state=active]:shadow-sm flex-shrink-0">
            KYC & Org
          </TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg px-5 py-2 text-sm font-bold data-[state=active]:shadow-sm flex-shrink-0">
            System
          </TabsTrigger>
        </TabsList>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <TabsContent value="all" className="focus-visible:outline-none">
            {renderList(notifications)}
          </TabsContent>
          <TabsContent value="events" className="focus-visible:outline-none">
            {renderList(notifications.filter((n) => n.type.includes('event')))}
          </TabsContent>
          <TabsContent value="rewards" className="focus-visible:outline-none">
            {renderList(notifications.filter((n) => n.type === 'xp_earned' || n.type === 'op_earned'))}
          </TabsContent>
          <TabsContent value="kyc" className="focus-visible:outline-none">
            {renderList(notifications.filter((n) => n.type.includes('organizer') || n.type.includes('kyc')))}
          </TabsContent>
          <TabsContent value="system" className="focus-visible:outline-none">
            {renderList(notifications.filter((n) => n.type === 'system' || n.type === 'rating_received'))}
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}

