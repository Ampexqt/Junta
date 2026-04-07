import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from
  '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from
  '@/components/ui/table';
const requests = [
  {
    name: 'Roberto Lim',
    email: 'roberto.lim@email.com',
    reason: 'Leading local beach cleanup group for 3 years',
    date: 'Jan 8, 2025',
    initials: 'RL'
  },
  {
    name: 'Elena Tan',
    email: 'elena.tan@email.com',
    reason:
      'Environmental Science teacher, wants to organize student activities',
    date: 'Jan 10, 2025',
    initials: 'ET'
  },
  {
    name: 'Marco Villanueva',
    email: 'marco.v@email.com',
    reason: 'Runs a community garden project in Barangay Tetuan',
    date: 'Jan 13, 2025',
    initials: 'MV'
  }];

export function OrganizerRequestsPage() {
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
          Organizer Requests
        </h1>
        <p className="text-muted-foreground mt-1">
          Review organizer role applications.
        </p>
      </div>

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">
              Pending Applications
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-0 text-xs">

              {requests.length} pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Reason</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) =>
                  <TableRow key={r.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-purple-50 text-purple-700 text-xs">
                            {r.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{r.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {r.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {r.email}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-xs truncate">
                      {r.reason}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {r.date}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50 text-xs h-8">

                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-200 hover:bg-red-50 text-xs h-8">

                          Reject
                        </Button>
                      </div>
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
