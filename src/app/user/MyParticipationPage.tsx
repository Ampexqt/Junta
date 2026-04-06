import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
'../../components/ui/table';
import {
  CalendarDays,
  CheckCircle,
  Clock,
  MapPin,
  Trophy,
  TrendingUp } from
'lucide-react';
const participations = [
{
  id: 1,
  title: 'Sta. Cruz Beach Cleanup Drive',
  date: 'Jan 15, 2025',
  location: 'Great Sta. Cruz Island',
  status: 'Upcoming',
  progress: 0
},
{
  id: 2,
  title: 'Mangrove Planting Initiative',
  date: 'Jan 22, 2025',
  location: 'Sinunuc Mangrove Area',
  status: 'Upcoming',
  progress: 0
},
{
  id: 3,
  title: 'Marine Biodiversity Workshop',
  date: 'Feb 3, 2025',
  location: 'Zamboanga City Hall',
  status: 'Upcoming',
  progress: 0
},
{
  id: 4,
  title: 'Paseo del Mar Awareness Walk',
  date: 'Nov 20, 2024',
  location: 'Paseo del Mar',
  status: 'Completed',
  progress: 100
},
{
  id: 5,
  title: 'Pasonanca Park Reforestation',
  date: 'Nov 5, 2024',
  location: 'Pasonanca Natural Park',
  status: 'Completed',
  progress: 100
},
{
  id: 6,
  title: 'Coastal Cleanup Month',
  date: 'Oct 15, 2024',
  location: 'Rio Hondo Coastline',
  status: 'Completed',
  progress: 100
},
{
  id: 7,
  title: 'Youth Eco-Leadership Camp',
  date: 'Oct 1, 2024',
  location: 'Zamboanga Eco-Park',
  status: 'Completed',
  progress: 100
},
{
  id: 8,
  title: 'Urban Garden Build',
  date: 'Sep 20, 2024',
  location: 'Barangay Tetuan',
  status: 'Completed',
  progress: 100
},
{
  id: 9,
  title: 'River Monitoring Day',
  date: 'Sep 8, 2024',
  location: 'Tumaga River',
  status: 'Completed',
  progress: 100
},
{
  id: 10,
  title: 'Coral Reef Survey',
  date: 'Aug 25, 2024',
  location: 'Sta. Cruz Island',
  status: 'Completed',
  progress: 100
},
{
  id: 11,
  title: 'Wetland Conservation Talk',
  date: 'Aug 10, 2024',
  location: 'City Library',
  status: 'Completed',
  progress: 100
},
{
  id: 12,
  title: 'Beach Nesting Site Protection',
  date: 'Jul 28, 2024',
  location: 'Bolong Beach',
  status: 'Completed',
  progress: 100
}];

const statusStyles: Record<string, string> = {
  Completed: 'bg-green-50 text-green-700',
  Upcoming: 'bg-blue-50 text-blue-700',
  'In Progress': 'bg-amber-50 text-amber-700'
};
export function MyParticipationPage() {
  const navigate = useNavigate();
  const total = participations.length;
  const completed = participations.filter(
    (p) => p.status === 'Completed'
  ).length;
  const upcoming = participations.filter((p) => p.status === 'Upcoming').length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">
          My Participation
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your environmental event participation and impact.
        </p>
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 10
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="grid grid-cols-3 gap-4">
        
        {[
        {
          icon: CalendarDays,
          label: 'Total Events',
          value: total,
          color: 'bg-primary/10 text-primary'
        },
        {
          icon: CheckCircle,
          label: 'Completed',
          value: completed,
          color: 'bg-green-50 text-green-600'
        },
        {
          icon: Clock,
          label: 'Upcoming',
          value: upcoming,
          color: 'bg-blue-50 text-blue-600'
        }].
        map((s) =>
        <Card key={s.label} className="rounded-2xl shadow-sm border">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-heading font-semibold text-foreground mt-1">
                    {s.value}
                  </p>
                </div>
                <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">
              Event History
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="font-medium">{completed} events completed</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Location
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participations.map((p) =>
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/app/events/${p.id}`)}>
                  
                    <TableCell>
                      <p className="font-medium text-sm">{p.title}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {p.date}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {p.date}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {p.location}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                      variant="outline"
                      className={`text-xs border-0 ${statusStyles[p.status]}`}>
                      
                        {p.status}
                      </Badge>
                      {p.status === 'In Progress' &&
                    <Progress
                      value={p.progress}
                      className="h-1 mt-1.5 w-20" />

                    }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-xs">
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
