import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader
} from
'@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
'@/components/ui/table';
import { Search } from 'lucide-react';
const allEvents = [
{
  name: 'Sta. Cruz Beach Cleanup Drive',
  organizer: 'Juan Dela Cruz',
  date: 'Jan 15, 2025',
  category: 'Cleanup',
  status: 'Approved',
  participants: 45
},
{
  name: 'Mangrove Planting Initiative',
  organizer: 'Juan Dela Cruz',
  date: 'Jan 22, 2025',
  category: 'Planting',
  status: 'Approved',
  participants: 32
},
{
  name: 'Marine Biodiversity Workshop',
  organizer: 'Elena Tan',
  date: 'Feb 3, 2025',
  category: 'Workshop',
  status: 'Approved',
  participants: 28
},
{
  name: 'Paseo del Mar Awareness Walk',
  organizer: 'Roberto Lim',
  date: 'Feb 10, 2025',
  category: 'Awareness',
  status: 'Completed',
  participants: 60
},
{
  name: 'Coral Reef Survey 2025',
  organizer: 'Roberto Lim',
  date: 'Feb 20, 2025',
  category: 'Research',
  status: 'Pending',
  participants: 0
},
{
  name: 'Wetland Bird Watching Day',
  organizer: 'Elena Tan',
  date: 'Mar 5, 2025',
  category: 'Awareness',
  status: 'Pending',
  participants: 0
},
{
  name: 'School Recycling Drive',
  organizer: 'Maria Santos',
  date: 'Mar 12, 2025',
  category: 'Cleanup',
  status: 'Pending',
  participants: 0
},
{
  name: 'Youth Eco-Leadership Camp',
  organizer: 'Juan Dela Cruz',
  date: 'Mar 8, 2025',
  category: 'Workshop',
  status: 'Approved',
  participants: 40
},
{
  name: 'River Cleanup Initiative',
  organizer: 'Pedro Reyes',
  date: 'Feb 15, 2025',
  category: 'Cleanup',
  status: 'Rejected',
  participants: 0
},
{
  name: 'Urban Garden Community Build',
  organizer: 'Juan Dela Cruz',
  date: 'Mar 15, 2025',
  category: 'Planting',
  status: 'Approved',
  participants: 22
}];

const categoryStyles: Record<string, string> = {
  Cleanup: 'bg-blue-50 text-blue-700',
  Planting: 'bg-green-50 text-green-700',
  Workshop: 'bg-purple-50 text-purple-700',
  Awareness: 'bg-amber-50 text-amber-700',
  Research: 'bg-cyan-50 text-cyan-700'
};
const statusStyles: Record<string, string> = {
  Approved: 'bg-green-50 text-green-700',
  Pending: 'bg-amber-50 text-amber-700',
  Rejected: 'bg-red-50 text-red-700',
  Completed: 'bg-blue-50 text-blue-700'
};
export function AdminAllEventsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const filtered = allEvents.filter((e) => {
    const matchSearch =
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.organizer.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || e.category === category;
    return matchSearch && matchCat;
  });
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
      
      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">
          All Events
        </h1>
        <p className="text-muted-foreground mt-1">Complete event directory.</p>
      </div>

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader className="pb-0 pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events or organizers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10" />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Cleanup">Cleanup</SelectItem>
                <SelectItem value="Planting">Planting</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
                <SelectItem value="Awareness">Awareness</SelectItem>
                <SelectItem value="Research">Research</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Organizer
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">
                    Participants
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e, i) =>
                <TableRow key={i}>
                    <TableCell className="font-medium text-sm">
                      {e.name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {e.organizer}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {e.date}
                    </TableCell>
                    <TableCell>
                      <Badge
                      variant="outline"
                      className={`text-xs border-0 ${categoryStyles[e.category]}`}>
                      
                        {e.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                      variant="outline"
                      className={`text-xs border-0 ${statusStyles[e.status]}`}>
                      
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-right text-muted-foreground text-sm">
                      {e.participants}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary hover:bg-primary/5 h-8 px-3 rounded-lg transition-colors font-medium"
                      >
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
    </motion.div>);

}
