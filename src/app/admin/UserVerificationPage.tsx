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
import { CheckCircle, XCircle, Eye } from 'lucide-react';
const verifications = [
  {
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    idStatus: 'Submitted',
    date: 'Jan 10, 2025',
    initials: 'MS'
  },
  {
    name: 'Pedro Reyes',
    email: 'pedro.reyes@email.com',
    idStatus: 'Submitted',
    date: 'Jan 11, 2025',
    initials: 'PR'
  },
  {
    name: 'Ana Garcia',
    email: 'ana.garcia@email.com',
    idStatus: 'Submitted',
    date: 'Jan 12, 2025',
    initials: 'AG'
  },
  {
    name: 'Carlos Mendoza',
    email: 'carlos.m@email.com',
    idStatus: 'Resubmitted',
    date: 'Jan 12, 2025',
    initials: 'CM'
  },
  {
    name: 'Sofia Cruz',
    email: 'sofia.cruz@email.com',
    idStatus: 'Submitted',
    date: 'Jan 13, 2025',
    initials: 'SC'
  }];

export function UserVerificationPage() {
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground tracking-tight">
            User Verification
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Review and manage identity verification submissions.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
          <CheckCircle className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-bold text-amber-700 tracking-tight">{verifications.length} Pending Submissions</span>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">
              Pending Verifications
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-0 text-xs">

              {verifications.length} pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>ID Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Submitted
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.map((v) =>
                  <TableRow key={v.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {v.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{v.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {v.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {v.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs border-0 ${v.idStatus === 'Resubmitted' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>

                        {v.idStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {v.date}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-green-600 hover:text-green-700 hover:bg-green-50">

                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-50">

                          <XCircle className="w-4 h-4" />
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
