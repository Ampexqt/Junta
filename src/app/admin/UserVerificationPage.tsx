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
import { Progress } from '@/components/ui/progress';
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
  DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, Eye, Loader2, Info, AlertCircle, AlertTriangle,
  Fingerprint, ScanFace, IdCard, FileWarning, ServerCrash, ShieldCheck,
  ShieldAlert, ShieldX, User, Hash, ZoomIn
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { sileo } from 'sileo';

interface OcrData {
  isIdCard: boolean;
  name: string | null;
  idNumber: string | null;
}

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
  kycApiStatus?: string;
  kycErrorLogs?: string | null;
  ocrData?: OcrData | null;
}

// ------- Helpers -------
function getScoreTier(score: number, apiStatus?: string) {
  if (!apiStatus || apiStatus === 'api_keys_missing') {
    return { label: 'Manual Review (No API)', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', icon: ServerCrash, progressColor: 'bg-slate-400' };
  }
  if (apiStatus === 'api_error') {
    return { label: 'API Error', color: 'bg-red-50 text-red-600', dot: 'bg-red-500', icon: ServerCrash, progressColor: 'bg-red-400' };
  }
  if (['no_face_detected', 'multiple_faces', 'low_quality', 'id_invalid'].includes(apiStatus || '')) {
    return { label: 'Pre-check Failed', color: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500', icon: FileWarning, progressColor: 'bg-rose-400' };
  }
  if (score >= 85) {
    return { label: 'High Confidence', color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', icon: ShieldCheck, progressColor: 'bg-emerald-500' };
  }
  if (score >= 60) {
    return { label: 'Manual Review Needed', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', icon: ShieldAlert, progressColor: 'bg-amber-500' };
  }
  return { label: 'Low Confidence', color: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500', icon: ShieldX, progressColor: 'bg-rose-500' };
}

function getApiStatusLabel(status?: string) {
  switch(status) {
    case 'success': return { label: 'Pipeline Success', color: 'text-emerald-600 bg-emerald-50' };
    case 'no_face_detected': return { label: 'No Face in Selfie', color: 'text-rose-600 bg-rose-50' };
    case 'multiple_faces': return { label: 'Multiple Faces Detected', color: 'text-rose-600 bg-rose-50' };
    case 'low_quality': return { label: 'Low Image Quality', color: 'text-amber-600 bg-amber-50' };
    case 'id_invalid': return { label: 'Invalid ID Document', color: 'text-rose-600 bg-rose-50' };
    case 'api_error': return { label: 'API Error', color: 'text-red-600 bg-red-50' };
    case 'api_keys_missing': return { label: 'API Keys Missing', color: 'text-slate-600 bg-slate-100' };
    default: return { label: 'Unknown', color: 'text-slate-600 bg-slate-100' };
  }
}

// --------------------------

export function UserVerificationPage() {
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<VerificationRecord | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'users'), where('kycStatus', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const docData = doc.data();
        const fullName = (docData.firstName && docData.lastName) ? `${docData.firstName} ${docData.lastName}` : '';
        const resolvedName = fullName || docData.displayName || docData.name || 'Anonymous User';
        return { uid: doc.id, name: resolvedName, ...docData };
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
    setRejectNotes('');
    setIsReviewOpen(true);
  };

  const processVerification = async (uid: string, status: 'verified' | 'rejected') => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/admin/verify-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ uid, status, notes: status === 'rejected' ? rejectNotes : '' })
      });
      if (!response.ok) throw new Error('Action failed');
      sileo.success({ 
        title: `User ${status === 'verified' ? 'Approved' : 'Rejected'}`, 
        description: `The identity verification has been processed.` 
      });
      setIsReviewOpen(false);
    } catch {
      sileo.error({ title: 'Action Failed', description: 'Could not update verification status.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground tracking-tight">User Verification</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Review identity verification submissions with biometric analysis.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
          <Fingerprint className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-bold text-amber-700 tracking-tight">
            {isLoading ? '...' : verifications.length} Pending Submissions
          </span>
        </div>
      </div>

      {/* Table Card */}
      <Card className="rounded-2xl shadow-sm border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <ScanFace className="w-5 h-5 text-primary" />
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
            <div className="text-center py-12 space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto" />
              <p className="text-muted-foreground font-medium">No pending verifications found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden sm:table-cell">Biometric Score</TableHead>
                    <TableHead className="hidden md:table-cell">API Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verifications.map((v) => {
                    const tier = getScoreTier(v.verificationScore || 0, v.kycApiStatus);
                    const apiStatusInfo = getApiStatusLabel(v.kycApiStatus);
                    const TierIcon = tier.icon;
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
                            <TierIcon className={`w-4 h-4 ${tier.dot.replace('bg-', 'text-')}`} />
                            <div>
                              <p className="text-sm font-black">{Math.round(v.verificationScore || 0)}%</p>
                              <p className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${tier.color}`}>{tier.label}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter ${apiStatusInfo.color}`}>
                            {apiStatusInfo.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-0 bg-amber-50 text-amber-700 capitalize">
                            {v.kycStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {v.kycSubmittedAt ? new Date(v.kycSubmittedAt).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" size="sm" onClick={() => handleReview(v)}
                            className="h-8 gap-1.5 rounded-lg border-slate-200 hover:bg-slate-50 font-bold text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" /> Review
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
        <DialogContent className="max-w-[95vw] sm:max-w-4xl p-0 overflow-hidden border-none shadow-2xl bg-slate-50 flex flex-col rounded-[2rem]" style={{ maxHeight: '92vh' }}>

          {/* Header */}
          <DialogHeader className="px-6 py-5 bg-white border-b border-slate-100 flex-shrink-0">
            <DialogTitle className="text-xl font-black text-slate-900 leading-tight flex items-center gap-2">
              <ScanFace className="w-5 h-5 text-primary" />
              Identity Review
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500 mt-0.5">
              Biometric analysis for{' '}
              <span className="font-bold text-slate-700">{selectedUser?.displayName || selectedUser?.name}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (() => {
            const score = selectedUser.verificationScore || 0;
            const threshold = selectedUser.verificationThreshold || 80;
            const tier = getScoreTier(score, selectedUser.kycApiStatus);
            const TierIcon = tier.icon;
            const apiStatusInfo = getApiStatusLabel(selectedUser.kycApiStatus);

            return (
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="p-5 sm:p-6 space-y-5">

                  {/* Score Banner */}
                  <div className={`p-4 rounded-2xl border flex flex-wrap items-center gap-4 justify-between shadow-sm ${tier.color.includes('emerald') ? 'bg-emerald-50/70 border-emerald-100' : tier.color.includes('amber') ? 'bg-amber-50/70 border-amber-100' : 'bg-rose-50/70 border-rose-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${tier.color.includes('emerald') ? 'bg-emerald-500' : tier.color.includes('amber') ? 'bg-amber-500' : 'bg-rose-500'} text-white shadow-md`}>
                        <TierIcon className="w-5 h-5" />
                        <span className="text-xs font-black mt-0.5">{Math.round(score)}%</span>
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900">{tier.label}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Face++ Confidence Score vs Threshold {threshold}%</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={Math.min(score, 100)} className="h-2 w-36 bg-slate-200" />
                          <span className="text-[10px] font-black text-slate-500">{score.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${apiStatusInfo.color}`}>
                        {apiStatusInfo.label}
                      </span>
                      {selectedUser.kycErrorLogs && (
                        <div className="flex items-center gap-1.5 bg-white/70 border border-slate-200 rounded-xl px-3 py-1.5 max-w-[260px]">
                          <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          <p className="text-[10px] text-slate-600 font-medium leading-tight">{selectedUser.kycErrorLogs}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* OCR Data Section */}
                  {selectedUser.ocrData && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <IdCard className="w-3.5 h-3.5" /> ID Document Analysis (OCR)
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className={`p-3 rounded-xl border ${selectedUser.ocrData.isIdCard ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Document Type</p>
                          <div className="flex items-center gap-1.5">
                            {selectedUser.ocrData.isIdCard ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                            <span className={`text-xs font-bold ${selectedUser.ocrData.isIdCard ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {selectedUser.ocrData.isIdCard ? 'Valid ID Detected' : 'Invalid / Not an ID'}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl border bg-slate-50 border-slate-100">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><User className="w-2.5 h-2.5" /> Name on ID</p>
                          <p className="text-xs font-bold text-slate-900">{selectedUser.ocrData.name || '—'}</p>
                          {selectedUser.ocrData.name && (
                            <p className={`text-[9px] mt-1 font-bold ${selectedUser.ocrData.name.toLowerCase().includes((selectedUser.displayName || '').split(' ')[0]?.toLowerCase() || '') ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {selectedUser.ocrData.name.toLowerCase().includes((selectedUser.displayName || '').split(' ')[0]?.toLowerCase() || '') ? '✓ Matches profile' : '⚠ Possible mismatch'}
                            </p>
                          )}
                        </div>
                        <div className="p-3 rounded-xl border bg-slate-50 border-slate-100">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Hash className="w-2.5 h-2.5" /> ID Number</p>
                          <p className="text-xs font-bold text-slate-900 font-mono">{selectedUser.ocrData.idNumber || '—'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'ID Front', url: selectedUser.validIdUrl, fallback: false },
                      { label: 'ID Back', url: selectedUser.validIdBackUrl, fallback: !selectedUser.validIdBackUrl },
                      { label: 'Live Selfie', url: selectedUser.selfieUrl, fallback: false },
                    ].map(({ label, url, fallback }) => (
                      <div key={label} className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</p>
                        <div
                          className={`aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-200/60 bg-white relative group shadow-sm transition-all ${url && !fallback ? 'cursor-zoom-in hover:border-primary/30 hover:shadow-md' : ''}`}
                          onClick={() => url && !fallback && setZoomedImage(url)}
                        >
                          {url && !fallback ? (
                            <>
                              <img src={url} alt={label} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all">
                                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2 bg-slate-50">
                              <Info className="w-7 h-7" />
                              <span className="text-[11px] font-medium text-slate-400 italic">No image</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Admin Instructions */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <h5 className="flex items-center gap-2 text-[10px] font-black text-slate-900 mb-3 tracking-widest uppercase">
                      <Info className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      Admin Checklist
                    </h5>
                    <ul className="space-y-2.5 pl-1">
                      {[
                        <>Registered name: <strong className="text-slate-900">{selectedUser.displayName || `${selectedUser.firstName} ${selectedUser.lastName}`}</strong>. Compare with name on ID.</>,
                        'Ensure the selfie matches the person in the ID photo.',
                        'Check if the ID is valid and not expired (if visible).',
                        'A score ≥85% with pipeline success is recommended for auto-approval.',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Rejection Notes */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rejection Notes (required if rejecting)</label>
                    <Textarea
                      value={rejectNotes}
                      onChange={e => setRejectNotes(e.target.value)}
                      placeholder="Explain why this verification is being rejected..."
                      className="h-20 resize-none text-sm rounded-xl"
                    />
                  </div>

                </div>
              </div>
            );
          })()}

          {/* Footer */}
          <div className="px-6 py-4 bg-white border-t border-slate-100 flex-shrink-0 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => selectedUser && processVerification(selectedUser.uid, 'rejected')}
              disabled={isProcessing || !rejectNotes.trim()}
              className="h-10 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-black uppercase text-[11px] tracking-widest transition-all disabled:opacity-40"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject'}
            </Button>
            <Button
              onClick={() => selectedUser && processVerification(selectedUser.uid, 'verified')}
              disabled={isProcessing}
              className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[11px] tracking-widest shadow-md shadow-emerald-600/20 transition-all"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve Identity'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-[90vw] md:max-w-5xl p-2 bg-white border-none rounded-[2rem] shadow-2xl">
          {zoomedImage && (
            <img src={zoomedImage} alt="Zoomed Document" className="w-full h-auto max-h-[80vh] object-contain rounded-[1.5rem]" />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
