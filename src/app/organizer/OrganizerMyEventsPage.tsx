import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from
  '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from
  '../../components/ui/table';
import { Eye, MapPin, Users, CalendarDays, Plus } from 'lucide-react';
import { CreateEventModal } from '../../features/events/components/CreateEventModal';
const approvedEvents = [
  {
    id: 1,
    name: 'Sta. Cruz Beach Cleanup Drive',
    date: 'Jan 15, 2025',
    location: 'Great Sta. Cruz Island',
    participants: 45
  },
  {
    id: 2,
    name: 'Mangrove Planting Initiative',
    date: 'Jan 22, 2025',
    location: 'Sinunuc Mangrove Area',
    participants: 32
  },
  {
    id: 3,
    name: 'Coral Reef Monitoring',
    date: 'Mar 1, 2025',
    location: 'Sta. Cruz Island Reef',
    participants: 15
  },
  {
    id: 4,
    name: 'Youth Eco-Leadership Camp',
    date: 'Mar 8, 2025',
    location: 'Zamboanga Eco-Park',
    participants: 40
  },
  {
    id: 5,
    name: 'Urban Garden Community Build',
    date: 'Mar 15, 2025',
    location: 'Barangay Tetuan',
    participants: 22
  }];

export function OrganizerMyEventsPage() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-semibold text-2xl text-foreground">
            My Events
          </h1>
          <p className="text-muted-foreground mt-1">
            Your approved and active events.
          </p>
        </div>
        <CreateEventModal
          trigger={
            <Button
              className="bg-primary hover:bg-primary/90 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          }
        />
      </div>

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">
              Approved Events
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-0 text-xs">

              {approvedEvents.length} active
            </Badge>
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
                  <TableHead>Participants</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedEvents.map((e) =>
                  <TableRow
                    key={e.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/app/events/${e.id}`)}>

                    <TableCell>
                      <p className="font-medium text-sm">{e.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {e.date}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {e.date}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {e.location}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {e.participants}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>);

}
