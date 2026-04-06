import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { motion } from 'framer-motion';
import { CreateEventModal } from '../features/events/components/CreateEventModal';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from
  '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from
  '../components/ui/table';
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
  BarChart3
} from
  'lucide-react';
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
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color






}: { icon: any; label: string; value: string; trend?: string; color: string; }) {
  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-heading font-semibold text-foreground mt-1">
              {value}
            </p>
            {trend &&
              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {trend}
              </p>
            }
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>

            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>);

}
function ParticipantDashboard() {
  const navigate = useNavigate();
  const { userName } = useAuth();
  const upcoming = [
    {
      title: 'Sta. Cruz Beach Cleanup',
      date: 'Jan 15, 2025',
      location: 'Great Sta. Cruz Island',
      status: 'Confirmed'
    },
    {
      title: 'Mangrove Planting Day',
      date: 'Jan 22, 2025',
      location: 'Sinunuc Mangrove Area',
      status: 'Pending'
    },
    {
      title: 'Eco Workshop Series',
      date: 'Feb 3, 2025',
      location: 'City Hall Auditorium',
      status: 'Confirmed'
    }];

  const recommended = [
    {
      title: 'River Cleanup Initiative',
      date: 'Feb 15, 2025',
      category: 'Cleanup',
      participants: 45
    },
    {
      title: 'Urban Gardening Workshop',
      date: 'Feb 20, 2025',
      category: 'Workshop',
      participants: 28
    },
    {
      title: 'Coral Reef Monitoring',
      date: 'Mar 1, 2025',
      category: 'Research',
      participants: 15
    }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">
          Welcome back, {userName.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's your environmental impact overview.
        </p>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {[
          {
            icon: CalendarDays,
            label: 'Events Joined',
            value: '12',
            trend: '+3 this month',
            color: 'bg-primary/10 text-primary'
          },
          {
            icon: Clock,
            label: 'Upcoming',
            value: '3',
            color: 'bg-blue-50 text-blue-600'
          },
          {
            icon: Users,
            label: 'Hours Contributed',
            value: '48',
            trend: '+8 this month',
            color: 'bg-green-50 text-green-600'
          },
          {
            icon: Star,
            label: 'Impact Score',
            value: '85',
            trend: '+5 points',
            color: 'bg-amber-50 text-amber-600'
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
            {upcoming.map((e) =>
              <div
                key={e.title}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => navigate('/app/events/1')}>

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
            {recommended.map((e) =>
              <div
                key={e.title}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => navigate('/app/events/1')}>

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
  const events = [
    {
      name: 'Beach Cleanup Drive',
      date: 'Jan 15, 2025',
      status: 'Approved',
      participants: 45
    },
    {
      name: 'Tree Planting Activity',
      date: 'Jan 28, 2025',
      status: 'Pending',
      participants: 0
    },
    {
      name: 'Eco Workshop',
      date: 'Feb 3, 2025',
      status: 'Approved',
      participants: 28
    },
    {
      name: 'River Monitoring',
      date: 'Feb 10, 2025',
      status: 'Rejected',
      participants: 0
    }];

  const statusColor: Record<string, string> = {
    Approved: 'bg-green-50 text-green-700',
    Pending: 'bg-amber-50 text-amber-700',
    Rejected: 'bg-red-50 text-red-700'
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-semibold text-2xl text-foreground">
            Organizer Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your events and track participation.
          </p>
        </div>
        <CreateEventModal
          trigger={
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          }
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarDays}
          label="My Events"
          value="8"
          trend="+2 this month"
          color="bg-primary/10 text-primary" />

        <StatCard
          icon={AlertCircle}
          label="Pending Approval"
          value="2"
          color="bg-amber-50 text-amber-600" />

        <StatCard
          icon={Users}
          label="Total Participants"
          value="156"
          trend="+24 this week"
          color="bg-blue-50 text-blue-600" />

        <StatCard
          icon={Star}
          label="Avg Rating"
          value="4.8"
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
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>);

}
function AdminDashboard() {
  const navigate = useNavigate();
  const activities = [
    {
      text: 'Maria Santos submitted ID verification',
      time: '2 min ago',
      icon: UserCheck
    },
    {
      text: 'New event "Coral Reef Survey" pending approval',
      time: '15 min ago',
      icon: CalendarDays
    },
    {
      text: 'Pedro Reyes requested organizer role',
      time: '1 hour ago',
      icon: Shield
    },
    {
      text: 'Beach Cleanup Drive completed with 45 participants',
      time: '3 hours ago',
      icon: CheckCircle
    }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          System overview and pending actions.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={UserCheck}
          label="Pending Verifications"
          value="5"
          color="bg-amber-50 text-amber-600" />

        <StatCard
          icon={CalendarDays}
          label="Pending Events"
          value="3"
          color="bg-blue-50 text-blue-600" />

        <StatCard
          icon={Users}
          label="Active Users"
          value="1,247"
          trend="+89 this month"
          color="bg-primary/10 text-primary" />

        <StatCard
          icon={BarChart3}
          label="Total Events"
          value="89"
          trend="+12 this month"
          color="bg-green-50 text-green-600" />

      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-sm border">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activities.map((a, i) =>
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">

                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <a.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground">{a.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.time}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-12"
              onClick={() => navigate('/app/admin/verification')}>

              <UserCheck className="w-4 h-4 mr-3" /> Review User Verifications{' '}
              <Badge className="ml-auto bg-amber-100 text-amber-700 border-0">
                5
              </Badge>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-12"
              onClick={() => navigate('/app/admin/approvals')}>

              <CalendarDays className="w-4 h-4 mr-3" /> Approve Pending Events{' '}
              <Badge className="ml-auto bg-blue-100 text-blue-700 border-0">
                3
              </Badge>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-12"
              onClick={() => navigate('/app/admin/organizer-requests')}>

              <Shield className="w-4 h-4 mr-3" /> Review Organizer Requests{' '}
              <Badge className="ml-auto bg-purple-100 text-purple-700 border-0">
                2
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
