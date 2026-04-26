import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { CreateEventModal } from '../features/events/components/CreateEventModal';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from
  '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from
  '@/components/ui/table';
import {
  CalendarDays,
  Users,
  Clock,
  Star,
  TrendingUp,
  Plus,
  ArrowRight,
  MapPin,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Shield,
  BarChart3,
  LucideIcon
} from
  'lucide-react';
import { cn } from '@/lib/utils';
import { GamificationDashboardCard } from '@/features/gamification/components/GamificationDashboardCard';

interface EventData {
  id: string;
  title: string;
  date: string;
  location: string;
  status: string;
  category: string;
  participants: number;
}

interface ActivityData {
  text: string;
  time: string;
  icon: LucideIcon;
  timestamp: number;
}
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4
    }
  })
};
const GreetingHeader = ({ userName, subtitle }: { userName: string; subtitle: string; }) => {
  const firstName = userName.split(' ').slice(0, 2).join(' ');
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  if (hour >= 17 || hour < 5) greeting = 'Good evening';

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mb-4 sm:mb-8"
    >
      <h1 className="font-heading font-bold text-3xl tracking-tight text-slate-900 flex items-center gap-2">
        {greeting}, <span className="text-primary">{firstName}</span>
        <span className="text-2xl animate-bounce-subtle">👋</span>
      </h1>
      <p className="text-[14px] font-medium text-slate-500 mt-1">
        {subtitle}
      </p>
    </motion.div>
  );
};

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
  subtext
}: { 
  icon: LucideIcon; 
  label: string; 
  value: string; 
  trend?: string; 
  color: string;
  subtext?: string;
}) {
  return (
    <Card className="rounded-[24px] shadow-sm border border-slate-100 bg-white hover:shadow-md transition-all duration-300 group overflow-hidden relative">
      {/* Decorative background element */}
      <div className={cn("absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-5 transition-transform group-hover:scale-125 duration-700", color.split(' ')[0])} />
      
      <CardContent className="p-5 relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">{label}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">
              {value}
            </h3>
            
            <div className="flex items-center gap-2 mt-2">
              {trend ? (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100/50">
                  <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
                  <span className="text-[9px] font-bold text-emerald-700">{trend}</span>
                </div>
              ) : subtext && (
                <span className="text-[10px] font-bold text-slate-400 italic">{subtext}</span>
              )}
            </div>
          </div>

          <div className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 duration-300 shadow-sm",
            color
          )}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
function ParticipantDashboard() {
  const navigate = useNavigate();
  const { userName } = useAuth();
  
  const [upcoming, setUpcoming] = useState<EventData[]>([]);
  const [recommended, setRecommended] = useState<EventData[]>([]);
  const [stats, setStats] = useState({ joined: '0', upcoming: '0', hours: '0', impact: '0' });

  useEffect(() => {
    const q = query(
      collection(db, 'events'),
      where('visibility', '==', 'public'),
      where('status', '==', 'published')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled',
          date: data.date ? format(new Date(data.date), 'MMM d, yyyy') : 'TBD',
          location: data.locationName || 'Unknown Location',
          status: 'Confirmed',
          category: data.category || 'Other',
          participants: data.participantsCount || 0
        };
      });

      // Split dynamically for UI purposes
      setUpcoming(fetched.slice(0, 3));
      setRecommended(fetched.slice(3, 6));
      setStats({
        joined: fetched.length.toString(),
        upcoming: Math.min(3, fetched.length).toString(),
        hours: (fetched.length * 4).toString(),
        impact: (fetched.length > 0 ? 85 : 0).toString()
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <GreetingHeader 
        userName={userName} 
        subtitle="Here's your environmental impact overview for today." 
      />

      <GamificationDashboardCard />

      <motion.div
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {[
          {
            icon: CalendarDays,
            label: 'Total Impact',
            value: stats.joined,
            subtext: 'Lifetime events',
            color: 'bg-emerald-600/10 text-emerald-600'
          },
          {
            icon: Clock,
            label: 'Next Sessions',
            value: stats.upcoming,
            subtext: 'Active schedule',
            color: 'bg-blue-600/10 text-blue-600'
          },
          {
            icon: Users,
            label: 'Volunteer Hours',
            value: stats.hours,
            trend: '+0 this month',
            color: 'bg-indigo-600/10 text-indigo-600'
          }].
          map((s, i) =>
            <motion.div key={s.label} variants={fadeUp} custom={i}>
              <StatCard {...s} />
            </motion.div>
          )}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-sm border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-lg">
                Upcoming Events
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/participation')}
                className="text-primary">

                View All <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarDays className="w-10 h-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No upcoming events</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Browse events to get started.</p>
            </div>
          ) : upcoming.map((e) =>
              <div
                key={e.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => navigate(`/app/events/${e.id}`)}>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {e.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {e.location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{e.date}</p>
                  <Badge
                    variant={e.status === 'Confirmed' ? 'default' : 'outline'}
                    className={`text-[10px] mt-1 ${e.status === 'Confirmed' ? 'bg-primary/10 text-primary border-0' : ''}`}>

                    {e.status}
                  </Badge>
                </div>
              </div>
          )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-lg">
                Recommended For You
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/events')}
                className="text-primary">

                Browse All <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
          {recommended.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="w-10 h-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No recommendations yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">More events are coming soon.</p>
            </div>
          ) : recommended.map((e) =>
              <div
                key={e.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => navigate(`/app/events/${e.id}`)}>  

                <div>
                  <p className="text-sm font-medium text-foreground">
                    {e.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-4">

                      {e.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {e.date}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {e.participants}
                </div>
              </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>);

}
function OrganizerDashboard() {
  const navigate = useNavigate();
  const { userName, uid } = useAuth();
  
  interface OrganizerEvent {
    id: string;
    name: string;
    date: string;
    status: string;
    participants: number;
    averageRating: number;
  }

  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [stats, setStats] = useState({ total: '0', pending: '0', participants: '0', rating: '0' });

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'events'),
      where('organizerId', '==', uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      let pending = 0;
      let participants = 0;

      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        total++;
        if (data.status === 'pending') pending++;
        participants += (data.participantsCount || 0);

        return {
          id: doc.id,
          name: data.title || 'Untitled',
          date: data.date ? format(new Date(data.date), 'MMM d, yyyy') : 'TBD',
          status: data.status === 'published' ? 'Approved' : (data.status === 'pending' ? 'Pending' : 'Rejected'),
          participants: data.participantsCount || 0,
          averageRating: data.averageRating || 0
        };
      });

      // Calculate aggregate rating across all organizer events
      const validRatings = fetched.filter(e => (e.averageRating || 0) > 0);
      const avgRating = validRatings.length > 0 
        ? (validRatings.reduce((acc, e) => acc + (e.averageRating || 0), 0) / validRatings.length).toFixed(1)
        : '0.0';

      setEvents(fetched);
      setStats({
        total: total.toString(),
        pending: pending.toString(),
        participants: participants.toString(),
        rating: avgRating
      });
    });

    return () => unsubscribe();
  }, [uid]);

  const statusColor: Record<string, string> = {
    Approved: 'bg-green-50 text-green-700',
    Pending: 'bg-amber-50 text-amber-700',
    Rejected: 'bg-red-50 text-red-700'
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <GreetingHeader 
          userName={userName} 
          subtitle="Manage your events and track participant engagement effortlessly." 
        />
        <div className="self-start">
        <CreateEventModal
          trigger={
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200/50 font-semibold border-none">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          }
        />
        </div>
      </div>

      <GamificationDashboardCard />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarDays}
          label="My Events"
          value={stats.total}
          trend="+0 this month"
          color="bg-primary/10 text-primary" />

        <StatCard
          icon={AlertCircle}
          label="Pending Approval"
          value={stats.pending}
          color="bg-amber-50 text-amber-600" />

        <StatCard
          icon={Users}
          label="Total Participants"
          value={stats.participants}
          trend="+0 this week"
          color="bg-blue-50 text-blue-600" />

        <StatCard
          icon={Star}
          label="Avg Rating"
          value={stats.rating}
          color="bg-green-50 text-green-600" />

      </div>

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">
              Event Status Overview
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => navigate('/app/organizer/submissions')}>

              View All <ArrowRight className="ml-1 w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) =>
                <TableRow
                  key={e.name}
                  className="cursor-pointer"
                  onClick={() => navigate('/app/organizer/submissions')}>

                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.date}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`border-0 text-xs ${statusColor[e.status]}`}>

                      {e.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.participants}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>);

}
function AdminDashboard() {
  const navigate = useNavigate();
  const { userName } = useAuth();
  
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [stats, setStats] = useState({ 
    pendingVerifications: '0', 
    pendingEvents: '0', 
    activeUsers: '0', 
    totalEvents: '0', 
    pendingOrganizerRequests: '0',
    activeEvents: '0',
    verifiedUsers: '0',
    pendingTasks: '0'
  });

  useEffect(() => {
    const unsubscribeEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
        let pending = 0;
        let active = 0;
        const total = snapshot.size;
        
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.status === 'pending') {
                pending++;
            } else if (data.status === 'published') {
                active++;
            }
        });
        
        setStats(prev => ({ ...prev, pendingEvents: pending.toString(), activeEvents: active.toString(), totalEvents: total.toString(), pendingTasks: (pending + parseInt(prev.pendingVerifications) + parseInt(prev.pendingOrganizerRequests)).toString() }));
    });

    const qLogs = query(collection(db, 'admin_logs'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
        const acts: ActivityData[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            let icon = CheckCircle;
            if (data.actionStatus === 'rejected') icon = AlertCircle;
            
            let text = '';
            if (data.actionType === 'event_approval') {
               text = `Event "${data.targetName}" was ${data.actionStatus} by ${data.adminName}`;
            } else if (data.actionType === 'kyc_verification') {
               text = `User "${data.targetName}" KYC was ${data.actionStatus} by ${data.adminName}`;
               icon = data.actionStatus === 'approved' ? UserCheck : AlertCircle;
            } else if (data.actionType === 'organizer_request') {
               text = `Organizer request for "${data.targetName}" was ${data.actionStatus} by ${data.adminName}`;
               icon = data.actionStatus === 'approved' ? Shield : AlertCircle;
            }

            acts.push({
                text,
                time: data.createdAt ? format(new Date(data.createdAt), 'MMM d, h:mm a') : 'Recently',
                icon,
                timestamp: data.timestamp || Date.now()
            });
        });
        setActivities(acts);
    });

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        let pendingVerifications = 0;
        let pendingOrganizerRequests = 0;
        let verified = 0;
        const activeUsers = snapshot.size;
        
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.kycStatus === 'pending') pendingVerifications++;
            if (data.kycStatus === 'verified' || data.kycVerified) verified++;
            if (data.organizerRequestStatus === 'pending') pendingOrganizerRequests++;
        });
        
        setStats(prev => ({ 
            ...prev, 
            activeUsers: activeUsers.toString(), 
            verifiedUsers: verified.toString(),
            pendingVerifications: pendingVerifications.toString(), 
            pendingOrganizerRequests: pendingOrganizerRequests.toString(),
            pendingTasks: (pendingVerifications + pendingOrganizerRequests + parseInt(prev.pendingEvents)).toString()
        }));
    });

    return () => {
        unsubscribeEvents();
        unsubscribeUsers();
        unsubscribeLogs();
    }
  }, []);

  return (
    <div className="space-y-6">
      <GreetingHeader 
        userName={userName} 
        subtitle="Review system metrics and take necessary administrative actions." 
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.activeUsers}
          subtext="Registered accounts"
          color="bg-primary/10 text-primary" />

        <StatCard
          icon={CalendarDays}
          label="Active Events"
          value={stats.activeEvents}
          subtext="Published & live"
          color="bg-emerald-50 text-emerald-600" />

        <StatCard
          icon={Shield}
          label="Verified Users"
          value={stats.verifiedUsers}
          subtext="KYC approved"
          color="bg-blue-50 text-blue-600" />

        <StatCard
          icon={AlertCircle}
          label="Pending Tasks"
          value={stats.pendingTasks}
          subtext="Requires admin action"
          color="bg-amber-50 text-amber-600" />

      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-sm border border-border/50 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading font-bold text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((a, i) =>
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors group">

                <div className="w-11 h-11 rounded-xl bg-white border border-border/50 flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                  <a.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">{a.text}</p>
                  <p className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {a.time}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-border/50 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading font-bold text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-14 rounded-2xl border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-all hover:translate-x-1 group"
              onClick={() => navigate('/app/admin/verification')}>

              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mr-3 group-hover:bg-amber-100 transition-colors">
                <UserCheck className="w-4 h-4 text-amber-600" />
              </div>
              <span className="font-semibold text-sm">Review User Verifications</span>
              <Badge className="ml-auto bg-amber-500 text-white border-0 font-bold shadow-sm shadow-amber-200">
                {stats.pendingVerifications}
              </Badge>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-14 rounded-2xl border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-all hover:translate-x-1 group"
              onClick={() => navigate('/app/admin/approvals')}>

              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                <CalendarDays className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-semibold text-sm">Approve Pending Events</span>
              <Badge className="ml-auto bg-blue-500 text-white border-0 font-bold shadow-sm shadow-blue-200">
                {stats.pendingEvents}
              </Badge>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-14 rounded-2xl border-border/50 hover:bg-primary/5 hover:border-primary/20 transition-all hover:translate-x-1 group"
              onClick={() => navigate('/app/admin/organizer-requests')}>

              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center mr-3 group-hover:bg-purple-100 transition-colors">
                <Shield className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-semibold text-sm">Review Organizer Requests</span>
              <Badge className="ml-auto bg-purple-500 text-white border-0 font-bold shadow-sm shadow-purple-200">
                {stats.pendingOrganizerRequests}
              </Badge>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>);

}
export function DashboardPage() {
  const { role } = useAuth();
  return (
    <>
      {role === 'participant' && <ParticipantDashboard />}
      {role === 'organizer' && <OrganizerDashboard />}
      {role === 'admin' && <AdminDashboard />}
    </>);

}
