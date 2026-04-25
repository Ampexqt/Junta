import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { Loader2, Search, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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


const roleStyles: Record<string, string> = {
  Participant: 'bg-primary/10 text-primary font-bold uppercase tracking-tighter text-[9px]',
  Organizer: 'bg-amber-50 text-amber-700 font-bold uppercase tracking-tighter text-[9px]',
  Admin: 'bg-purple-50 text-purple-700 font-bold uppercase tracking-tighter text-[9px]'
};
const statusStyles: Record<string, string> = {
  Verified: 'bg-emerald-50 text-emerald-700 font-bold uppercase tracking-tighter text-[9px]',
  Pending: 'bg-amber-50 text-amber-700 font-bold uppercase tracking-tighter text-[9px]',
  Rejected: 'bg-rose-50 text-rose-700 font-bold uppercase tracking-tighter text-[9px]'
};

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  joined: string;
  status: string;
  events: number;
  initials: string;
  createdAt: Date;
}

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => {
        const data = doc.data();
        let formattedJoined = 'Unknown';
        if (data.createdAt) {
          try {
            formattedJoined = format(data.createdAt.toDate(), 'MMM dd, yyyy');
          } catch (e) {
            // fallback
          }
        }
        
        let statusDisplay = 'Pending';
        if (data.verificationStatus === 'verified') statusDisplay = 'Verified';
        else if (data.verificationStatus === 'rejected') statusDisplay = 'Rejected';
        
        const roleDisplay = data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : 'Participant';

        const fullName = (data.firstName && data.lastName) ? `${data.firstName} ${data.lastName}` : '';
        const resolvedName = fullName || data.displayName || data.name || 'Anonymous User';

        return {
          id: doc.id,
          name: resolvedName,
          email: data.email || 'No Email',
          role: roleDisplay,
          joined: formattedJoined,
          status: statusDisplay,
          events: data.eventsCount || 0,
          initials: resolvedName.substring(0, 2).toUpperCase(),
          createdAt: data.createdAt?.toDate?.() || new Date(0)
        };
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filtered = users.filter(
    (u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
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

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader className="pb-0 pt-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground font-medium">
                      No users match your search.
                    </TableCell>
                  </TableRow>
                ) : filtered.map((u) =>
                <TableRow key={u.email} className="group hover:bg-slate-50/50 transition-colors">
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
                        className={`border-none px-2 py-0.5 rounded-lg ${roleStyles[u.role]}`}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-[13px] font-medium">
                      {u.joined}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`border-none px-2 py-0.5 rounded-lg ${statusStyles[u.status]}`}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-right text-muted-foreground text-sm">
                      {u.events}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-4 rounded-xl text-primary font-bold hover:bg-primary/5 transition-all flex items-center gap-1.5 ml-auto"
                      >
                        View Details <ArrowRight className="w-3.5 h-3.5" />
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
