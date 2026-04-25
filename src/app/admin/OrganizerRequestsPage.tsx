import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';
import { API_BASE_URL } from '@/lib/api';
import { sileo } from 'sileo';
import { Loader2 } from 'lucide-react';
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
interface OrganizerRequestData {
  uid: string;
  name: string;
  email: string;
  reason: string;
  date: string;
  initials: string;
}

export function OrganizerRequestsPage() {
  const [requests, setRequests] = useState<OrganizerRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('organizerRequestStatus', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        let formattedDate = 'Unknown';
        if (docData.organizerRequestDate) {
           try {
             formattedDate = format(docData.organizerRequestDate.toDate(), 'MMM dd, yyyy');
           } catch (e) { console.error('Date parse error', e); }
        }
        const fullName = (docData.firstName && docData.lastName) ? `${docData.firstName} ${docData.lastName}` : '';
        const resolvedName = fullName || docData.displayName || docData.name || 'Anonymous User';

        return {
          uid: doc.id,
          name: resolvedName,
          email: docData.email || 'No Email',
          reason: docData.organizerRequestReason || 'No reason provided',
          date: formattedDate,
          initials: resolvedName.substring(0, 2).toUpperCase()
        };
      });
      setRequests(data);
      setLoading(false);
    }, (error) => {
      console.error(error);
      sileo.error({ title: 'Error', description: 'Failed to load requests.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAction = async (uid: string, status: 'approved' | 'rejected') => {
    setActionLoading(uid);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/admin/organizer-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ uid, status })
      });

      if (!response.ok) throw new Error('Failed');
      sileo.success({ title: 'Success', description: `Request ${status} successfully.` });
    } catch (err) {
      sileo.error({ title: 'Error', description: 'Failed to process request.' });
    } finally {
      setActionLoading(null);
    }
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
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No pending requests.
                    </TableCell>
                  </TableRow>
                ) : requests.map((r) =>
                  <TableRow key={r.uid} className="group hover:bg-slate-50/50 transition-colors">
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
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={actionLoading === r.uid}
                          onClick={() => handleAction(r.uid, 'approved')}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs h-8 font-bold transition-all px-3">
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={actionLoading === r.uid}
                          onClick={() => handleAction(r.uid, 'rejected')}
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 text-xs h-8 font-bold transition-all px-3">
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
