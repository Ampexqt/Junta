import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  name?: string;
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
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'users'), where('kycStatus', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        const fullName = (docData.firstName && docData.lastName) ? `${docData.firstName} ${docData.lastName}` : '';
        const resolvedName = fullName || docData.displayName || docData.name || 'Anonymous User';

        return {
          uid: doc.id,
          name: resolvedName,
          ...docData
        };
      }) as unknown as VerificationRecord[];
      setVerifications(data);
      setIsLoading(false);
    }, (error) => {
      console.error(error);
      sileo.error({ title: 'Fetch Error', description: 'Could not load pending verifications.' });
      setIsLoading(false);
    });

    return () => unsubscribe();
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
      // fetchVerifications(); no longer needed due to onSnapshot
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
                      <TableRow key={v.uid} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={v.photoURL} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {v.firstName?.[0]}{v.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{v.name}</p>
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
        <DialogContent className="sm:max-w-4xl max-h-[85vh] p-0 overflow-hidden border-none shadow-2xl bg-slate-50 flex flex-col rounded-[2rem]">
          <DialogHeader className="p-6 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 flex-shrink-0">
            <div className="space-y-1">
               <DialogTitle className="text-2xl font-black text-slate-900 leading-tight">Identity Review</DialogTitle>
               <DialogDescription className="text-xs font-medium text-slate-500">
                 Comparing ID documents and selfie for <span className="font-bold text-slate-700">{selectedUser?.displayName || selectedUser?.name}</span>.
               </DialogDescription>
            </div>
          </DialogHeader>

          {selectedUser && (
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Score Banner */}
              <div className={`p-5 rounded-2xl flex items-center justify-between shadow-sm border ${selectedUser.verificationScore >= (selectedUser.verificationThreshold || 80) ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50/50 border-amber-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${selectedUser.verificationScore >= (selectedUser.verificationThreshold || 80) ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {selectedUser.verificationScore >= (selectedUser.verificationThreshold || 80) ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className={`font-black text-base ${selectedUser.verificationScore >= (selectedUser.verificationThreshold || 80) ? 'text-emerald-900' : 'text-amber-900'}`}>
                      {selectedUser.verificationScore >= (selectedUser.verificationThreshold || 80) ? 'High Confidence Match' : 'Potential Mismatch'}
                    </h4>
                    <p className="text-sm opacity-70 font-bold mt-0.5">Automated analysis score: {Math.round(selectedUser.verificationScore)}%</p>
                  </div>
                </div>
                <Badge variant="outline" className={`px-3 py-1 font-black uppercase tracking-widest text-[10px] border-none ${selectedUser.verificationScore >= (selectedUser.verificationThreshold || 80) ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                   Threshold: {selectedUser.verificationThreshold || 80}%
                </Badge>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">ID Front</p>
                  <div 
                    className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-200/60 bg-white relative group cursor-zoom-in shadow-sm hover:border-primary/30 transition-colors"
                    onClick={() => setZoomedImage(selectedUser.validIdUrl)}
                  >
                    <img src={selectedUser.validIdUrl} alt="ID Front" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">ID Back</p>
                  <div 
                    className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-200/60 bg-white relative group cursor-zoom-in shadow-sm hover:border-primary/30 transition-colors"
                    onClick={() => selectedUser.validIdBackUrl && setZoomedImage(selectedUser.validIdBackUrl)}
                  >
                    {selectedUser.validIdBackUrl ? (
                      <img src={selectedUser.validIdBackUrl} alt="ID Back" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 gap-2">
                         <Info className="w-6 h-6 opacity-30" />
                         <span className="italic text-[11px] font-medium">No back image</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Live Selfie</p>
                  <div 
                    className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-200/60 bg-white relative group cursor-zoom-in shadow-sm hover:border-primary/30 transition-colors"
                    onClick={() => setZoomedImage(selectedUser.selfieUrl)}
                  >
                    <img src={selectedUser.selfieUrl} alt="Selfie" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h5 className="flex items-center gap-2 text-xs font-black text-slate-900 mb-3 tracking-widest uppercase">
                  <Info className="w-4 h-4 text-primary" />
                  Admin Instructions
                </h5>
                <ul className="text-xs text-slate-600 space-y-2 list-none pl-1 font-medium">
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1" />Verify that the name on the ID matches the profile name: <strong className="text-slate-900">{selectedUser.displayName || `${selectedUser.firstName} ${selectedUser.lastName}`}</strong>.</li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1" />Ensure the selfie matches the person in the ID photo.</li>
                  <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1" />Check if the ID is valid and not expired (if visible).</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="p-4 bg-white border-t border-slate-100 flex-shrink-0 flex-row justify-end gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={() => selectedUser && processVerification(selectedUser.uid, 'rejected')}
              disabled={isProcessing}
              className="flex-1 sm:flex-none h-11 px-8 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-black uppercase text-xs tracking-widest"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject Submission'}
            </Button>
            <Button 
              onClick={() => selectedUser && processVerification(selectedUser.uid, 'verified')}
              disabled={isProcessing}
              className="flex-1 sm:flex-none h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-600/20"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve Identity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-[90vw] md:max-w-5xl p-2 bg-white border-none rounded-[2rem] shadow-2xl">
          {zoomedImage && (
            <img 
              src={zoomedImage} 
              alt="Zoomed Verification Document" 
              className="w-full h-auto max-h-[80vh] object-contain rounded-[1.5rem]" 
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
