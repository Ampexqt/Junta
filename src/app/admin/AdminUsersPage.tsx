import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { Loader2, Search, ArrowRight, X, Mail, CalendarDays, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

const roleStyles: Record<string, string> = {
  Participant: 'bg-primary/10 text-primary font-bold uppercase tracking-tighter text-[9px]',
  Organizer: 'bg-amber-50 text-amber-700 font-bold uppercase tracking-tighter text-[9px]',
  Admin: 'bg-purple-50 text-purple-700 font-bold uppercase tracking-tighter text-[9px]',
};
const statusStyles: Record<string, string> = {
  Verified: 'bg-emerald-50 text-emerald-700 font-bold uppercase tracking-tighter text-[9px]',
  Pending: 'bg-amber-50 text-amber-700 font-bold uppercase tracking-tighter text-[9px]',
  Rejected: 'bg-rose-50 text-rose-700 font-bold uppercase tracking-tighter text-[9px]',
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
  photoURL: string;
  createdAt: Date;
}

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => {
        const data = doc.data();
        let formattedJoined = 'Unknown';
        if (data.createdAt) {
          try {
            formattedJoined = format(data.createdAt.toDate(), 'MMM dd, yyyy');
          } catch (e) { /* fallback */ }
        }

        let statusDisplay = 'Pending';
        if (data.verificationStatus === 'verified' || data.kycStatus === 'verified') statusDisplay = 'Verified';
        else if (data.verificationStatus === 'rejected' || data.kycStatus === 'rejected') statusDisplay = 'Rejected';

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
          photoURL: data.photoURL || '',
          createdAt: data.createdAt?.toDate?.() || new Date(0),
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

  const openUserDetail = (u: UserData) => {
    setSelectedUser(u);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">All Users</h1>
        <p className="text-muted-foreground mt-1">Platform user directory.</p>
      </div>

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader className="pb-0 pt-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
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
                  <TableHead className="hidden lg:table-cell text-right">Events</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground font-medium">
                      No users match your search.
                    </TableCell>
                  </TableRow>
                ) : filtered.map((u) => (
                  <TableRow
                    key={u.id}
                    className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => openUserDetail(u)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={u.photoURL} className="object-cover" />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {u.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border-none px-2 py-0.5 rounded-lg ${roleStyles[u.role] || roleStyles.Participant}`}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-[13px] font-medium">{u.joined}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border-none px-2 py-0.5 rounded-lg ${statusStyles[u.status] || statusStyles.Pending}`}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-right text-muted-foreground text-sm">{u.events}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-4 rounded-xl text-primary font-bold hover:bg-primary/5 transition-all flex items-center gap-1.5 ml-auto"
                        onClick={(ev) => { ev.stopPropagation(); openUserDetail(u); }}
                      >
                        View Details <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md p-0 overflow-hidden border-none shadow-2xl bg-white rounded-3xl">
          {selectedUser && (
            <>
              {/* Header */}
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-700 px-6 pt-8 pb-16">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 border-4 border-white/20 shadow-2xl mb-3">
                    <AvatarImage src={selectedUser.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-primary text-white text-2xl font-black">
                      {selectedUser.initials}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-black text-white leading-tight">{selectedUser.name}</h2>
                  <p className="text-white/60 text-sm mt-0.5">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className={`border-0 text-[10px] font-black uppercase tracking-widest px-3 py-1 ${roleStyles[selectedUser.role] || 'bg-white/10 text-white'}`}>
                      {selectedUser.role}
                    </Badge>
                    <Badge className={`border-0 text-[10px] font-black uppercase tracking-widest px-3 py-1 ${statusStyles[selectedUser.status] || 'bg-white/10 text-white'}`}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats ribbon */}
              <div className="relative -mt-8 mx-5">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
                  {[
                    { label: 'Events', value: selectedUser.events, icon: CalendarDays },
                    { label: 'Role', value: selectedUser.role, icon: Shield },
                    { label: 'Status', value: selectedUser.status, icon: Users },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex flex-col items-center py-4 px-2">
                      <Icon className="w-4 h-4 text-muted-foreground mb-1" />
                      <p className="text-xs font-black text-foreground">{value}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="px-5 py-5 space-y-3">
                {[
                  { icon: Mail, label: 'Email Address', value: selectedUser.email },
                  { icon: CalendarDays, label: 'Date Joined', value: selectedUser.joined },
                  { icon: Shield, label: 'KYC Status', value: selectedUser.status },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
