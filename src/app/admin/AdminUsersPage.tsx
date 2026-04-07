import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
'@/components/ui/table';
import { Search } from 'lucide-react';
const users = [
{
  name: 'Juan Dela Cruz',
  email: 'juan.dc@email.com',
  role: 'Organizer',
  joined: 'Oct 5, 2024',
  status: 'Verified',
  events: 12,
  initials: 'JD'
},
{
  name: 'Maria Santos',
  email: 'maria.santos@email.com',
  role: 'Participant',
  joined: 'Nov 10, 2024',
  status: 'Pending',
  events: 3,
  initials: 'MS'
},
{
  name: 'Pedro Reyes',
  email: 'pedro.reyes@email.com',
  role: 'Participant',
  joined: 'Nov 15, 2024',
  status: 'Verified',
  events: 7,
  initials: 'PR'
},
{
  name: 'Roberto Lim',
  email: 'roberto.lim@email.com',
  role: 'Organizer',
  joined: 'Sep 20, 2024',
  status: 'Verified',
  events: 15,
  initials: 'RL'
},
{
  name: 'Elena Tan',
  email: 'elena.tan@email.com',
  role: 'Organizer',
  joined: 'Oct 1, 2024',
  status: 'Verified',
  events: 9,
  initials: 'ET'
},
{
  name: 'Ana Garcia',
  email: 'ana.garcia@email.com',
  role: 'Participant',
  joined: 'Dec 5, 2024',
  status: 'Pending',
  events: 1,
  initials: 'AG'
},
{
  name: 'Carlos Mendoza',
  email: 'carlos.m@email.com',
  role: 'Participant',
  joined: 'Dec 10, 2024',
  status: 'Pending',
  events: 0,
  initials: 'CM'
},
{
  name: 'Sofia Cruz',
  email: 'sofia.cruz@email.com',
  role: 'Participant',
  joined: 'Jan 2, 2025',
  status: 'Verified',
  events: 4,
  initials: 'SC'
}];

const roleStyles: Record<string, string> = {
  Participant: 'bg-primary/10 text-primary',
  Organizer: 'bg-amber-50 text-amber-700',
  Admin: 'bg-purple-50 text-purple-700'
};
const statusStyles: Record<string, string> = {
  Verified: 'bg-green-50 text-green-700',
  Pending: 'bg-amber-50 text-amber-700'
};
export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const filtered = users.filter(
    (u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
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
          All Users
        </h1>
        <p className="text-muted-foreground mt-1">Platform user directory.</p>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10" />
        
      </div>

      <Card className="rounded-2xl shadow-sm border">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">
                    Events
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) =>
                <TableRow key={u.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {u.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                      variant="outline"
                      className={`text-xs border-0 ${roleStyles[u.role]}`}>
                      
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {u.joined}
                    </TableCell>
                    <TableCell>
                      <Badge
                      variant="outline"
                      className={`text-xs border-0 ${statusStyles[u.status]}`}>
                      
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-right text-muted-foreground text-sm">
                      {u.events}
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
