import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { CheckCircle, Eye, Loader2, Info, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { sileo } from 'sileo';

interface VerificationRecord {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
  photoURL?: string;
  kycStatus: string;
  kycSubmittedAt: string;
  validIdUrl: string;
  validIdBackUrl: string;
  selfieUrl: string;
  verificationScore: number;
  verificationThreshold: number;
}

export function UserVerificationPage() {
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<VerificationRecord | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/admin/pending-verifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setVerifications(data);
    } catch (error) {
      sileo.error({ title: 'Fetch Error', description: 'Could not load pending verifications.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleReview = (user: VerificationRecord) => {
    setSelectedUser(user);
    setIsReviewOpen(true);
  };

  const processVerification = async (uid: string, status: 'verified' | 'rejected') => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/admin/verify-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ uid, status })
      });

      if (!response.ok) throw new Error('Action failed');
      
      sileo.success({ 
        title: `User ${status === 'verified' ? 'Approved' : 'Rejected'}`, 
        description: `The identity verification has been processed.` 
      });
      
      setIsReviewOpen(false);
      fetchVerifications();
    } catch (error) {
      sileo.error({ title: 'Action Failed', description: 'Could not update verification status.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
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
          <span className="text-sm font-bold text-amber-700 tracking-tight">
            {isLoading ? '...' : verifications.length} Pending Submissions
          </span>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">
              Pending Verifications
            </CardTitle>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-0 text-xs">
              {verifications.length} pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium">Loading submissions...</p>
            </div>
          ) : verifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-medium">No pending verifications found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden sm:table-cell">Auto-Match</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verifications.map((v) => {
                    const matchScore = v.verificationScore || 0;
                    const threshold = v.verificationThreshold || 80;
                    const isHighConfidence = matchScore >= threshold;

                    return (
                      <TableRow key={v.uid}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={v.photoURL} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {v.firstName?.[0]}{v.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{v.displayName || `${v.firstName} ${v.lastName}`}</p>
                              <p className="text-xs text-muted-foreground">{v.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${isHighConfidence ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                             <span className="text-sm font-bold">{Math.round(matchScore)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-0 bg-amber-50 text-amber-700 capitalize">
                            {v.kycStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {new Date(v.kycSubmittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleReview(v)}
                            className="h-8 gap-1.5 rounded-lg border-slate-200 hover:bg-slate-50 font-bold text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Identity Review</DialogTitle>
            <DialogDescription>
              Comparing ID documents and selfie for {selectedUser?.displayName}.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* Score Banner */}
              <div className={`p-4 rounded-2xl flex items-center justify-between ${selectedUser.verificationScore >= (selectedUser.verificationThreshold || 80) ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedUser.verificationScore >= (selectedUser.verificationThreshold || 80) ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {selectedUser.verificationScore >= (selectedUser.verificationThreshold || 80) ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className={`font-black text-sm ${selectedUser.verificationScore >= (selectedUser.verificationThreshold || 80) ? 'text-emerald-900' : 'text-amber-900'}`}>
                      {selectedUser.verificationScore >= (selectedUser.verificationThreshold || 80) ? 'High Confidence Match' : 'Potential Mismatch'}
                    </h4>
                    <p className="text-xs opacity-70 font-medium">Automated analysis score: {Math.round(selectedUser.verificationScore)}%</p>
                  </div>
                </div>
                <Badge className={selectedUser.verificationScore >= (selectedUser.verificationThreshold || 80) ? 'bg-emerald-500' : 'bg-amber-500'}>
                   Threshold: {selectedUser.verificationThreshold || 80}%
                </Badge>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">ID Front</p>
                  <div className="aspect-[3/2] rounded-xl overflow-hidden border bg-slate-100 relative group cursor-zoom-in">
                    <img src={selectedUser.validIdUrl} alt="ID Front" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">ID Back</p>
                  <div className="aspect-[3/2] rounded-xl overflow-hidden border bg-slate-100 relative group cursor-zoom-in">
                    {selectedUser.validIdBackUrl ? (
                      <img src={selectedUser.validIdBackUrl} alt="ID Back" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 italic text-xs">No back image</div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Live Selfie</p>
                  <div className="aspect-[3/2] rounded-xl overflow-hidden border bg-slate-100 relative group cursor-zoom-in">
                    <img src={selectedUser.selfieUrl} alt="Selfie" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                <h5 className="flex items-center gap-2 text-xs font-black text-slate-900 mb-2">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  Admin Instructions
                </h5>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 font-medium">
                  <li>Verify that the name on the ID matches the profile name: <strong>{selectedUser.displayName || `${selectedUser.firstName} ${selectedUser.lastName}`}</strong>.</li>
                  <li>Ensure the selfie matches the person in the ID photo.</li>
                  <li>Check if the ID is valid and not expired (if visible).</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => processVerification(selectedUser!.uid, 'rejected')}
              disabled={isProcessing}
              className="flex-1 sm:flex-none h-11 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-black uppercase text-[10px] tracking-widest"
            >
              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Reject Submission'}
            </Button>
            <Button 
              onClick={() => processVerification(selectedUser!.uid, 'verified')}
              disabled={isProcessing}
              className="flex-1 sm:flex-none h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/20"
            >
              {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Approve Identity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
