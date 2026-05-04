import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Bell,
  CalendarDays,
  CheckCircle,
  Info,
  Users,
  Shield,
  Star,
  Zap,
  Trash2,
  LucideIcon,
  Filter,
  CheckCheck,
  ChevronRight
} from 'lucide-react';
import { useNotifications, AppNotification } from '@/hooks/useNotifications';
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import { sileo } from 'sileo';
import { cn } from '@/lib/utils';

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

export function NotificationsPage() {
  const { notifications, loading: isLoading, unreadCount, markAsRead, markAllAsRead, clearAllRead } = useNotifications();

  const handleMarkAllRead = () => {
    markAllAsRead();
    sileo.success({ title: 'All notifications marked as read' });
  };

  const handleClearAll = async () => {
    await clearAllRead();
    sileo.success({ title: 'Cleared read notifications' });
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const renderNotificationItem = (n: AppNotification) => {
    const Icon = iconMap[n.type] || Bell;
    const colors = colorMap[n.type] || colorMap.default;
    
    return (
      <motion.div 
        key={n.id}
        variants={itemVariants}
        onClick={() => { if (!n.read) markAsRead(n.id); }}
        className={cn(
          "group relative flex items-start gap-4 p-4 transition-all cursor-pointer border-b border-slate-50 last:border-0",
          !n.read ? "bg-white shadow-[0_0_20px_-12px_rgba(0,0,0,0.1)] z-10" : "hover:bg-slate-50/50"
        )}
      >
        {!n.read && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
        )}
        
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border transition-transform group-hover:scale-105",
          colors.bg,
          colors.border
        )}>
          <Icon className={cn("w-5 h-5", colors.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "text-sm leading-snug",
              !n.read ? "font-bold text-slate-900" : "font-semibold text-slate-600"
            )}>
              {n.title}
            </h4>
            <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5">
              {formatDistanceToNow(n.createdAt, { addSuffix: true })}
            </span>
          </div>
          <p className={cn(
            "text-[13px] mt-1 line-clamp-2",
            !n.read ? "text-slate-700 font-medium" : "text-slate-500"
          )}>
            {n.message}
          </p>
          
          <div className="flex items-center gap-3 mt-2.5">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[11px] font-bold text-primary hover:bg-primary/5 transition-colors"
            >
              View Details
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
            {!n.read && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  markAsRead(n.id);
                }}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderList = (items: AppNotification[]) => {
    if (items.length === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center mb-6">
            <Bell className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="font-heading font-black text-xl text-slate-800 mb-2">
            {isLoading ? 'Fetching notifications...' : 'All quiet for now'}
          </h3>
          <p className="text-slate-500 max-w-[280px] text-sm leading-relaxed">
            {isLoading 
              ? 'We\'re checking for any new updates for you.' 
              : 'When you get notifications about events, rewards or your account, they\'ll show up here.'}
          </p>
        </motion.div>
      );
    }

    const grouped = groupNotifications(items);

    return (
      <motion.div 
        key={items.length > 0 ? items[0].id : 'empty'}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {Object.entries(grouped).map(([label, groupItems]) => {
          if (groupItems.length === 0) return null;
          return (
            <div key={label} className="space-y-4">
              <div className="flex items-center gap-3 px-1">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {label}
                </h4>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden divide-y divide-slate-50">
                <AnimatePresence>
                  {groupItems.map(renderNotificationItem)}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 md:sticky md:top-24 space-y-6">
            <div className="px-1">
              <h1 className="font-heading font-black text-3xl text-slate-900 tracking-tight">
                Inbox
              </h1>
              <p className="text-slate-500 font-semibold text-xs mt-1 uppercase tracking-wider">
                {unreadCount > 0 ? `${unreadCount} unread updates` : 'Completely caught up'}
              </p>
            </div>

            <TabsList className="flex flex-row md:flex-col w-full h-auto bg-transparent p-0 gap-1 overflow-x-auto hide-scrollbar md:overflow-visible">
              <TabsTrigger 
                value="all" 
                className="justify-start px-4 py-2.5 rounded-xl font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-slate-500 hover:text-slate-900 transition-all flex-shrink-0"
              >
                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4" />
                  <span>All Activity</span>
                </div>
                {unreadCount > 0 && (
                  <Badge className="ml-auto bg-primary text-white hover:bg-primary border-0 text-[10px] px-1.5 h-4 min-w-[16px] flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="justify-start px-4 py-2.5 rounded-xl font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-slate-500 hover:text-slate-900 transition-all flex-shrink-0"
              >
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4 h-4" />
                  <span>Events</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="rewards" 
                className="justify-start px-4 py-2.5 rounded-xl font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-slate-500 hover:text-slate-900 transition-all flex-shrink-0"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4" />
                  <span>Rewards</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="kyc" 
                className="justify-start px-4 py-2.5 rounded-xl font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-slate-500 hover:text-slate-900 transition-all flex-shrink-0"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4" />
                  <span>Security</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="system" 
                className="justify-start px-4 py-2.5 rounded-xl font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-slate-500 hover:text-slate-900 transition-all flex-shrink-0"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <span>System</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <div className="hidden md:block pt-6 border-t border-slate-200 mt-6 space-y-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="w-full justify-start text-xs font-bold text-slate-600 hover:text-primary hover:bg-primary/5"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearAll}
                disabled={!notifications.some(n => n.read)}
                className="w-full justify-start text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear read history
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 w-full">
            <TabsContent value="all" className="m-0 focus-visible:outline-none">
              {renderList(notifications)}
            </TabsContent>
            <TabsContent value="events" className="m-0 focus-visible:outline-none">
              {renderList(notifications.filter((n) => n.type.includes('event')))}
            </TabsContent>
            <TabsContent value="rewards" className="m-0 focus-visible:outline-none">
              {renderList(notifications.filter((n) => n.type === 'xp_earned' || n.type === 'op_earned'))}
            </TabsContent>
            <TabsContent value="kyc" className="m-0 focus-visible:outline-none">
              {renderList(notifications.filter((n) => n.type.includes('organizer') || n.type.includes('kyc')))}
            </TabsContent>
            <TabsContent value="system" className="m-0 focus-visible:outline-none">
              {renderList(notifications.filter((n) => n.type === 'system' || n.type === 'rating_received'))}
            </TabsContent>
          </main>
        </div>
      </Tabs>
    </div>
  );
}
