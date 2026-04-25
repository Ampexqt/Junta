import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Camera,
  Shield,
  Trash2,
  Mail,
  Loader2,
  User,
  Fingerprint,
  KeyRound,
  FileText,
  Sun,
  Glasses,
  Focus,
  ChevronRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from '@/features/auth/AuthContext';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { uploadImage } from '@/lib/cloudinary';
import { API_BASE_URL } from '@/lib/api';
import { sileo } from 'sileo';
import { useNavigate, Navigate } from 'react-router-dom';

export function SettingsPage() {
  const { user, profile, role, logout, uid } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const orgLogoInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  
  // Local states for inputs (initialized from profile or empty)
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [organizationName, setOrganizationName] = useState(profile?.organizationName || '');
  const [suffix, setSuffix] = useState((profile as { suffix?: string })?.suffix || 'none');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingOrgLogo, setIsUploadingOrgLogo] = useState(false);
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [isUploadingIdBack, setIsUploadingIdBack] = useState(false);
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [webcamStep, setWebcamStep] = useState<'intro' | 'camera'>('intro');
  const [captureTarget, setCaptureTarget] = useState<'id-front' | 'id-back' | 'selfie'>('id-front');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Staged URLs
  const [pendingPhotoURL, setPendingPhotoURL] = useState<string | null>(profile?.photoURL || null);
  const [pendingOrgLogoURL, setPendingOrgLogoURL] = useState<string | null>(profile?.organizationLogo || null);
  const [pendingValidIdUrl, setPendingValidIdUrl] = useState<string | null>(profile?.validIdUrl || null);
  const [pendingValidIdBackUrl, setPendingValidIdBackUrl] = useState<string | null>((profile as { validIdBackUrl?: string })?.validIdBackUrl || null);
  const [pendingSelfieUrl, setPendingSelfieUrl] = useState<string | null>(profile?.selfieUrl || null);

  // Sync local state when profile loads/updates
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setPhone(profile.phone || '');
      setOrganizationName(profile.organizationName || '');
      setSuffix((profile as { suffix?: string })?.suffix || 'none');
      setPendingPhotoURL(profile.photoURL || null);
      setPendingOrgLogoURL(profile.organizationLogo || null);
      setPendingValidIdUrl(profile.validIdUrl || null);
      setPendingSelfieUrl(profile.selfieUrl || null);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!uid) {
      sileo.error({ title: 'Auth Error', description: 'User session not found.' });
      return;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const updateData: Record<string, unknown> = {
        firstName,
        lastName,
        phone,
        organizationName,
        suffix: suffix === 'none' ? '' : suffix
      };

      if (pendingPhotoURL !== (profile?.photoURL || null)) {
        updateData.photoURL = pendingPhotoURL;
      }

      if (pendingOrgLogoURL !== (profile?.organizationLogo || null)) {
        updateData.organizationLogo = pendingOrgLogoURL;
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      sileo.success({
        title: 'Profile Updated',
        description: 'Your changes have been saved to the database successfully.'
      });
    } catch (error) {
      console.error('Update error:', error);
      sileo.error({
        title: 'Update Failed',
        description: 'Could not save changes. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;

    if (!file.type.startsWith('image/')) {
      sileo.error({ title: 'Invalid File', description: 'Please upload an image file.' });
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadImage(file);
      setPendingPhotoURL(result.url);
      sileo.success({ title: 'Photo Uploaded', description: 'Click "Save Changes" to apply this profile picture.' });
    } catch (error) {
      console.error('Upload error:', error);
      sileo.error({ title: 'Upload Failed', description: 'Could not upload photo to Cloudinary.' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleOrgLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;

    if (!file.type.startsWith('image/')) {
      sileo.error({ title: 'Invalid File', description: 'Please upload an image file.' });
      return;
    }

    setIsUploadingOrgLogo(true);
    try {
      const result = await uploadImage(file);
      setPendingOrgLogoURL(result.url);
      sileo.success({ title: 'Logo Uploaded', description: 'Organization logo staged. Save changes to apply.' });
    } catch (error) {
      console.error('Upload error:', error);
      sileo.error({ title: 'Upload Failed', description: 'Could not upload logo.' });
    } finally {
      setIsUploadingOrgLogo(false);
      if (orgLogoInputRef.current) orgLogoInputRef.current.value = '';
    }
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;
    setIsUploadingId(true);
    try {
      const result = await uploadImage(file);
      setPendingValidIdUrl(result.url);
      sileo.success({ title: 'ID Uploaded', description: 'ID staged. Click "Submit Verification" to finalize.' });
    } catch (error) {
      sileo.error({ title: 'Upload Failed', description: 'Could not upload Valid ID.' });
    } finally {
      setIsUploadingId(false);
      if (idInputRef.current) idInputRef.current.value = '';
    }
  };

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;
    setIsUploadingSelfie(true);
    try {
      const result = await uploadImage(file);
      setPendingSelfieUrl(result.url);
      sileo.success({ title: 'Selfie Uploaded', description: 'Selfie staged. Click "Submit Verification" to finalize.' });
    } catch (error) {
      sileo.error({ title: 'Upload Failed', description: 'Could not upload Selfie.' });
    } finally {
      setIsUploadingSelfie(false);
      if (selfieInputRef.current) selfieInputRef.current.value = '';
    }
  };

  const startWebcam = async (target: 'id-front' | 'id-back' | 'selfie') => {
    setCaptureTarget(target);
    setIsWebcamOpen(true);
    setWebcamStep('intro');
  };

  const launchCamera = async () => {
    setWebcamStep('camera');
    try {
      const isId = captureTarget.startsWith('id');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: isId ? 'environment' : 'user', 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        } 
      });
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('Webcam error:', err);
      sileo.error({ title: 'Camera Error', description: 'Could not access your camera. Please check permissions.' });
      setIsWebcamOpen(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.srcObject) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    // Process the capture
    fetch(dataUrl)
      .then(res => res.blob())
      .then(async blob => {
        const file = new File([blob], `${captureTarget}-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        if (captureTarget === 'id-front') setIsUploadingId(true);
        else if (captureTarget === 'id-back') setIsUploadingIdBack(true);
        else setIsUploadingSelfie(true);

        try {
          const result = await uploadImage(file);
          if (captureTarget === 'id-front') {
            setPendingValidIdUrl(result.url);
            sileo.success({ title: 'Front Captured', description: 'Now scan the back of your ID.' });
            // Automatically switch to back
            setCaptureTarget('id-back');
          } else if (captureTarget === 'id-back') {
            setPendingValidIdBackUrl(result.url);
            sileo.success({ title: 'Back Captured', description: 'ID scanning complete.' });
            closeWebcam();
          } else {
            setPendingSelfieUrl(result.url);
            sileo.success({ title: 'Selfie Captured', description: 'Photo verified.' });
            closeWebcam();
          }
        } catch (error) {
          sileo.error({ title: 'Upload Failed', description: 'Could not upload captured photo.' });
          closeWebcam();
        } finally {
          setIsUploadingId(false);
          setIsUploadingIdBack(false);
          setIsUploadingSelfie(false);
        }
      });
  };

  const closeWebcam = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsWebcamOpen(false);
  };

  const handleKYCSubmit = async () => {
    if (!pendingValidIdUrl || !pendingValidIdBackUrl || !pendingSelfieUrl) {
      sileo.error({ title: 'Missing Documents', description: 'Please upload Front and Back of ID, and a Selfie.' });
      return;
    }
    setIsSubmittingKYC(true);
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        validIdUrl: pendingValidIdUrl,
        validIdBackUrl: pendingValidIdBackUrl,
        selfieUrl: pendingSelfieUrl
      };
      
      const response = await fetch(`${API_BASE_URL}/auth/submit-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) throw new Error('Failed to submit verification');
      
      const result = await response.json();
      
      sileo.success({ 
        title: 'Verification Submitted', 
        description: result.automatedResult 
          ? `Analysis complete (${Math.round(result.automatedResult.confidence)}% match). Pending admin review.`
          : 'Your identity documents are now pending review.' 
      });
    } catch (error) {
      sileo.error({ title: 'Submit Failed', description: 'Could not submit verification documents.' });
    } finally {
      setIsSubmittingKYC(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!profile?.email) return;
    try {
      await sendPasswordResetEmail(auth, profile.email);
      sileo.success({ 
        title: 'Password Reset Email Sent', 
        description: `Check ${profile.email} for instructions to reset your password.` 
      });
    } catch (error) {
      sileo.error({ title: 'Reset Failed', description: 'Could not send password reset email.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) {
      sileo.error({ title: 'Delete Failed', description: 'Please log in to Firebase to delete your account.' });
      return;
    }
    try {
      await deleteUser(auth.currentUser);
      sileo.success({ title: 'Account Deleted', description: 'Your account has been permanently deleted.' });
      await logout();
      navigate('/login');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/requires-recent-login') {
        sileo.error({ 
          title: 'Recent Login Required', 
          description: 'For security reasons, please log out and log back in before deleting your account.' 
        });
      } else {
        sileo.error({ title: 'Action Failed', description: 'Could not delete account. Please try again later.' });
      }
    }
  };

  if (!uid) {
    return <Navigate to="/login" replace />;
  }

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  const kycVerified = profile?.kycStatus === 'verified' || profile?.isVerified;
  const kycPending = profile?.kycStatus === 'pending';
  const kycRejected = profile?.kycStatus === 'rejected';
  const kycBlocked = kycVerified || kycPending;

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-10 px-4">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
      <input type="file" ref={orgLogoInputRef} className="hidden" accept="image/*" onChange={handleOrgLogoUpload} />
      <input type="file" ref={idInputRef} className="hidden" accept="image/*" onChange={handleIdUpload} />
      <input type="file" ref={selfieInputRef} className="hidden" accept="image/*" capture="user" onChange={handleSelfieUpload} />

      <div className="flex flex-col gap-1 px-1">
        <h1 className="font-heading font-black text-lg text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-slate-500 text-[12px] font-medium">
          Personal identity and security preferences.
        </p>
      </div>

      <Tabs defaultValue="account" orientation="horizontal" className="w-full flex flex-col">
        <div className="mb-4 overflow-x-auto pb-1 scrollbar-hide">
          <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-slate-100/50 p-0.5 text-slate-500 border border-slate-200/40 w-full sm:w-auto min-w-max gap-0.5">
            <TabsTrigger 
              value="account" 
              className="rounded-md px-3 py-1 text-[11px] data-active:bg-white data-active:text-primary data-active:shadow-sm font-bold transition-all flex items-center gap-1.5 h-full"
            >
              <User className="w-3.5 h-3.5" />
              Account
            </TabsTrigger>
            {role === 'organizer' && (
              <TabsTrigger 
                value="organization" 
                className="rounded-md px-3 py-1 text-[11px] data-active:bg-white data-active:text-emerald-600 data-active:shadow-md font-bold transition-all flex items-center gap-1.5 h-full"
              >
                <Shield className="w-3.5 h-3.5" />
                Organization
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="verification" 
              className="rounded-md px-3 py-1 text-[11px] data-active:bg-white data-active:text-amber-600 data-active:shadow-md font-bold transition-all flex items-center gap-1.5 h-full"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              Verification
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="rounded-md px-3 py-1 text-[11px] data-active:bg-white data-active:text-slate-900 data-active:shadow-md font-bold transition-all flex items-center gap-1.5 h-full"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Security
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1">
          <TabsContent value="account" className="mt-0 focus-visible:ring-0">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="rounded-2xl shadow-sm border-slate-200/60 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4">
                  <CardTitle className="font-heading text-md font-black text-slate-900">Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-4 bg-white p-1">
                    <div className="relative group/avatar">
                      <Avatar className="w-14 h-14 border-2 border-white shadow-sm transition-all relative">
                        <AvatarImage src={pendingPhotoURL || profile?.photoURL} className="object-cover" />
                        <AvatarFallback className="bg-slate-100 text-slate-400 text-sm font-black">
                          {initials || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-primary rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform flex items-center justify-center"
                      >
                        {isUploading ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Camera className="w-3 h-3 text-white" />}
                      </Button>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-2">
                        {firstName} {lastName} {suffix && suffix !== 'none' ? suffix : ''}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge className="px-2 py-0.5 rounded-md font-black uppercase text-[8px] tracking-widest bg-primary/10 text-primary border-0 shadow-none">
                          {role}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                          <Mail className="w-3 h-3" />
                          {profile?.email || user?.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="opacity-40" />

                  <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                    <div className="md:col-span-3 space-y-1.5">
                      <Label htmlFor="settings-firstname" className="font-black text-[9px] uppercase tracking-[0.1em] text-slate-400 px-1">First Name</Label>
                      <Input id="settings-firstname" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-9 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-semibold text-sm" />
                    </div>
                    <div className="md:col-span-3 space-y-1.5">
                      <Label htmlFor="settings-lastname" className="font-black text-[9px] uppercase tracking-[0.1em] text-slate-400 px-1">Last Name</Label>
                      <Input id="settings-lastname" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-9 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-semibold text-sm" />
                    </div>
                    <div className="md:col-span-1 space-y-1.5">
                      <Label htmlFor="settings-suffix" className="font-black text-[9px] uppercase tracking-[0.1em] text-slate-400 px-1">Suffix</Label>
                      <Select value={suffix} onValueChange={setSuffix}>
                        <SelectTrigger id="settings-suffix" className="h-9 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all font-semibold text-sm">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="Jr.">Jr.</SelectItem>
                          <SelectItem value="Sr.">Sr.</SelectItem>
                          <SelectItem value="II">II</SelectItem>
                          <SelectItem value="III">III</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="settings-phone" className="font-black text-[9px] uppercase tracking-[0.1em] text-slate-400 px-1">Phone Contact</Label>
                      <Input id="settings-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 rounded-xl border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-semibold text-sm" placeholder="e.g. 09123456789" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="settings-email" className="font-black text-[9px] uppercase tracking-[0.1em] text-slate-300 px-1">Registered Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <Input
                          id="settings-email"
                          value={profile?.email || user?.email || ''}
                          disabled
                          className="pl-9 h-9 bg-slate-100/50 border-slate-100 text-slate-400 cursor-not-allowed rounded-xl font-semibold italic border-dashed text-sm" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving} className="h-9 px-8 rounded-xl font-black uppercase text-[10px] tracking-[0.1em] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                      {isSaving ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {role === 'organizer' && (
            <TabsContent value="organization">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="rounded-2xl shadow-sm border-emerald-100 bg-emerald-50/5 overflow-hidden">
                  <CardHeader className="bg-emerald-50/50 border-b border-emerald-100/50 p-4">
                    <CardTitle className="font-heading text-md font-black text-emerald-900">Organization Identity</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-6">
                    <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-emerald-100/50 shadow-sm relative">
                      <div className="relative group/logo">
                        <Avatar className="w-12 h-12 rounded-xl border-2 border-white shadow-sm transition-all group-hover/logo:scale-105 relative">
                          <AvatarImage src={pendingOrgLogoURL || profile?.organizationLogo} className="object-cover" />
                          <AvatarFallback className="bg-emerald-100 text-emerald-600 text-sm font-black rounded-xl uppercase">
                            {organizationName?.substring(0, 2) || 'OG'}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="icon"
                          onClick={() => orgLogoInputRef.current?.click()}
                          className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 rounded-lg border-2 border-white shadow-md hover:bg-emerald-700 flex items-center justify-center transition-all"
                        >
                          {isUploadingOrgLogo ? <Loader2 className="w-2.5 h-2.5 animate-spin text-white" /> : <Camera className="w-2.5 h-2.5 text-white" />}
                        </Button>
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-black text-sm text-emerald-900 tracking-tight leading-none">Organization Logo</h4>
                        <p className="text-[10px] text-emerald-700/60 font-medium">Consistent branding across all events.</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="settings-orgname" className="font-black text-[9px] uppercase tracking-[0.1em] text-emerald-800/40 px-1">Official Name</Label>
                      <Input
                        id="settings-orgname"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)} 
                        className="h-9 rounded-xl border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-white font-bold text-sm"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button onClick={handleSave} className="h-9 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-[0.1em] shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]">
                        {isSaving ? <Loader2 className="animate-spin mr-2 w-3 h-3" /> : 'Update Brand'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          <TabsContent value="verification">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden bg-white">
                <CardHeader className="p-4 border-b border-slate-50 flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="font-heading text-md font-black text-slate-900 tracking-tight">Identity Verification</CardTitle>
                    <p className="text-slate-400 font-medium text-[10px]">Complete the following steps to verify your account.</p>
                  </div>
                  <Badge className={`${kycVerified ? 'bg-emerald-50 text-emerald-600' : kycPending ? 'bg-amber-50 text-amber-600' : kycRejected ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'} border-0 px-3 py-1 font-bold text-[9px] uppercase tracking-[0.1em] rounded-full`}>
                    {kycVerified ? 'Verified' : kycPending ? 'Verification Submitted' : kycRejected ? 'Rejected' : 'Action Required'}
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {/* Unified Identification Row */}
                    <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50/50 transition-colors gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/50">
                          <FileText className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-black text-xs text-slate-900 uppercase tracking-tight">Identification Document</h4>
                          <p className="text-[10px] text-slate-500 font-medium">Front & Back of Passport, License, or Student ID</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Front ID Slot */}
                        <div className="flex flex-col items-center gap-1.5">
                          {pendingValidIdUrl ? (
                            <div className="group relative">
                              <div className="w-12 h-8 rounded-md overflow-hidden border border-slate-200 bg-white">
                                <img src={pendingValidIdUrl} alt="Front" className="w-full h-full object-cover" />
                              </div>
                              <button 
                                onClick={() => !kycBlocked && startWebcam('id-front')} 
                                disabled={kycBlocked}
                                className={`absolute inset-0 bg-black/40 ${kycBlocked ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} flex items-center justify-center transition-opacity rounded-md`}
                              >
                                <Camera className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              disabled={kycBlocked}
                              onClick={() => startWebcam('id-front')} 
                              className="h-8 w-12 p-0 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50"
                            >
                              <Camera className="w-3 h-3 text-slate-400" />
                            </Button>
                          )}
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Front</span>
                        </div>

                        <div className="h-8 w-[1px] bg-slate-100 hidden sm:block" />

                        {/* Back ID Slot */}
                        <div className="flex flex-col items-center gap-1.5">
                          {pendingValidIdBackUrl ? (
                            <div className="group relative">
                              <div className="w-12 h-8 rounded-md overflow-hidden border border-slate-200 bg-white">
                                <img src={pendingValidIdBackUrl} alt="Back" className="w-full h-full object-cover" />
                              </div>
                              <button 
                                onClick={() => !kycBlocked && startWebcam('id-back')} 
                                disabled={kycBlocked}
                                className={`absolute inset-0 bg-black/40 ${kycBlocked ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} flex items-center justify-center transition-opacity rounded-md`}
                              >
                                <Camera className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              disabled={kycBlocked}
                              onClick={() => startWebcam('id-back')} 
                              className="h-8 w-12 p-0 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50"
                            >
                              <Camera className="w-3 h-3 text-slate-400" />
                            </Button>
                          )}
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Back</span>
                        </div>

                        {!pendingValidIdUrl || !pendingValidIdBackUrl ? (
                           <Button 
                             size="sm"
                             disabled={kycBlocked}
                             onClick={() => !pendingValidIdUrl ? startWebcam('id-front') : startWebcam('id-back')}
                             className="h-8 px-4 rounded-lg bg-slate-900 text-white font-black uppercase text-[10px] tracking-tight hover:bg-slate-800 ml-2 disabled:opacity-50"
                           >
                             Scan ID
                           </Button>
                        ) : null}
                      </div>
                    </div>

                    {/* Selfie Row */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/50">
                          <Camera className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-black text-xs text-slate-900 uppercase tracking-tight">Live Selfie Check</h4>
                          <p className="text-[10px] text-slate-500 font-medium">Hold your ID next to your face clearly</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {pendingSelfieUrl ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200">
                              <img src={pendingSelfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              disabled={kycBlocked}
                              onClick={() => startWebcam('selfie')} 
                              className="h-8 px-2 text-[10px] font-bold text-slate-400 hover:text-primary uppercase"
                            >
                              Retake
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => startWebcam('selfie')} 
                            disabled={isUploadingSelfie || kycBlocked}
                            className="h-8 px-4 rounded-lg bg-slate-900 text-white font-black uppercase text-[10px] tracking-tight hover:bg-slate-800 disabled:opacity-50"
                          >
                            {isUploadingSelfie ? <Loader2 className="animate-spin w-3 h-3" /> : 'Take Selfie'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Dialog open={isWebcamOpen} onOpenChange={(open) => {
                    if (!open) closeWebcam();
                  }}>
                    <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] bg-white">
                      <div className="sr-only">
                        <DialogTitle>{captureTarget === 'selfie' ? 'Selfie Verification' : 'ID Verification'}</DialogTitle>
                        <DialogDescription>Please follow the on-screen instructions to verify your identity.</DialogDescription>
                      </div>

                      <div className="relative flex flex-col h-[520px]">
                        {/* Premium Glass Header - Light Mode */}
                        <div className="absolute top-0 inset-x-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">
                                {captureTarget === 'selfie' ? 'Final Step' : captureTarget === 'id-front' ? 'Step 1 of 3' : 'Step 2 of 3'}
                              </span>
                            </div>
                            <h3 className="text-slate-900 font-black text-lg uppercase tracking-tight leading-none">
                              {captureTarget === 'id-front' ? 'Identity Front' : captureTarget === 'id-back' ? 'Identity Back' : 'Face Verification'}
                            </h3>
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={closeWebcam}
                            className="w-10 h-10 rounded-2xl bg-slate-100/50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
                          >
                            <Trash2 className="w-4 h-4 rotate-45" />
                          </Button>
                        </div>
                      {webcamStep === 'intro' ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 pt-24 space-y-8 bg-gradient-to-b from-white to-slate-50">
                          <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full" />
                            <div className="relative w-20 h-20 rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-xl">
                              {captureTarget.startsWith('id') ? (
                                <FileText className="w-10 h-10 text-emerald-600" />
                              ) : (
                                <Shield className="w-10 h-10 text-emerald-600" />
                              )}
                            </div>
                          </div>

                          <div className="space-y-2 text-center max-w-[280px]">
                            <p className="text-slate-600 text-xs font-bold leading-relaxed">
                              {captureTarget.startsWith('id') 
                                ? 'Position your ID card within the frame and ensure all details are visible.' 
                                : 'Look directly at the camera and keep a neutral expression.'}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 w-full">
                            {captureTarget.startsWith('id') ? (
                              <>
                                <div className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-white border border-slate-100 transition-all hover:border-emerald-500/30 hover:bg-emerald-50/30 group">
                                  <Focus className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 group-hover:text-emerald-700">Readable Text</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-white border border-slate-100 transition-all hover:border-emerald-500/30 hover:bg-emerald-50/30 group">
                                  <Sun className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 group-hover:text-emerald-700">No Glare</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-white border border-slate-100 transition-all hover:border-rose-500/30 hover:bg-rose-50/30 group">
                                  <User className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform" />
                                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 group-hover:text-rose-700">No Hats</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-white border border-slate-100 transition-all hover:border-rose-500/30 hover:bg-rose-50/30 group">
                                  <Glasses className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform" />
                                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 group-hover:text-rose-700">No Glasses</span>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="w-full pt-4">
                            <Button 
                              onClick={launchCamera} 
                              className="w-full h-14 rounded-[1.25rem] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95 group"
                            >
                              Start Scanning
                              <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative aspect-[3/4] bg-black overflow-hidden group">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className={`w-full h-full object-cover ${captureTarget === 'selfie' ? 'scale-x-[-1]' : ''}`}
                          />
                          
                          {/* Professional Vignette Overlay */}
                          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center pt-16">
                            {/* Darkened mask outside the guide */}
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <defs>
                                <mask id="verificationMask">
                                  <rect x="0" y="0" width="100" height="100" fill="white" />
                                  {captureTarget.startsWith('id') ? (
                                    <rect x="10" y="30" width="80" height="45" rx="4" fill="black" />
                                  ) : (
                                    <ellipse cx="50" cy="45" rx="35" ry="42" fill="black" />
                                  )}
                                </mask>
                              </defs>
                              <rect x="0" y="0" width="100" height="100" fill="rgba(0,0,0,0.7)" mask="url(#verificationMask)" />
                            </svg>
                            
                            {/* Actual Guide Border */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-12">
                              {captureTarget.startsWith('id') ? (
                                <div className="w-[85%] aspect-[1.6/1] border-[3px] border-emerald-500 rounded-2xl relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                  <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500/20" />
                                  
                                  <AnimatePresence mode="wait">
                                    <motion.div 
                                      key={captureTarget}
                                      initial={{ x: '100%' }}
                                      animate={{ x: '-100%' }}
                                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                      className="absolute inset-y-0 w-1/2 bg-emerald-500/10 skew-x-[-20deg] blur-xl"
                                    />
                                  </AnimatePresence>
                                </div>
                              ) : (
                                <div className="w-[70%] aspect-[0.85] border-[3px] border-emerald-500 rounded-[100%] relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                  {/* Live Scanning Bar */}
                                  <motion.div 
                                    animate={{ top: ['5%', '95%', '5%'] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute left-4 right-4 h-[1px] bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Top Controls - Removed because it is now in the Header */}

                          {/* Controls Bar - Light Mode */}
                          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white/95 via-white/80 to-transparent flex flex-col items-center justify-center gap-4 pb-4">
                            <div className="flex items-center justify-center w-full px-8 relative">
                              <Button 
                                variant="ghost" 
                                onClick={() => setWebcamStep('intro')}
                                className="absolute left-8 text-slate-900 hover:bg-slate-100 font-bold text-[10px] uppercase tracking-widest h-10 px-4 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-md shadow-sm"
                              >
                                ← Back
                              </Button>
                              
                            <button 
                                onClick={capturePhoto}
                                disabled={isUploadingId || isUploadingIdBack || isUploadingSelfie}
                                className="w-16 h-16 rounded-full border-4 border-slate-200 flex items-center justify-center group transition-all active:scale-95 hover:scale-105 shadow-xl relative disabled:opacity-50 bg-white"
                              >
                                {isUploadingId || isUploadingIdBack || isUploadingSelfie ? (
                                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-slate-900 group-hover:scale-90 transition-transform" />
                                )}
                              </button>
                            </div>
                            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] bg-slate-100/80 px-3 py-1 rounded-full backdrop-blur-sm border border-slate-200">
                              Neutral Expression • Front View
                            </p>
                          </div>

                          {/* Capture Flash Effect */}
                          <AnimatePresence>
                            {isUploadingSelfie && (
                              <motion.div 
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0 bg-white z-50"
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                        </div>
                      </DialogContent>
                  </Dialog>

                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <p className="text-[10px] text-slate-500 font-medium italic">Verified accounts get priority review.</p>
                    </div>
                    <Button 
                      onClick={handleKYCSubmit} 
                      disabled={isSubmittingKYC || kycBlocked || (!pendingValidIdUrl || !pendingSelfieUrl)} 
                      className="h-8 px-6 font-black uppercase text-[10px] tracking-widest rounded-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingKYC ? <Loader2 className="animate-spin w-3 h-3" /> : kycVerified ? 'Confirmed' : kycPending ? 'Pending Review' : kycRejected ? 'Try Again' : 'Submit Verification'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="security">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-[2.5rem] shadow-xl border-slate-200/60 transition-all hover:shadow-2xl">
                  <CardHeader className="p-5">
                    <CardTitle className="font-heading text-xl font-black uppercase tracking-tight text-slate-900">Security Credentials</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Manage your access and active sessions.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-8">
                    <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 flex flex-col items-center text-center space-y-6">
                      <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center border border-slate-100">
                        <KeyRound className="w-10 h-10 text-primary" />
                      </div>
                      <div className="space-y-2">
                         <h4 className="font-black text-xl text-slate-900 tracking-tight">Need a password update?</h4>
                         <p className="text-xs text-slate-400 font-medium max-w-[200px]">We'll send a secure validation link to your recovery email.</p>
                      </div>
                      <Button variant="outline" onClick={handlePasswordReset} className="w-full h-10 font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-white hover:text-primary transition-all border-slate-200 shadow-sm">
                        Request Reset Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] shadow-xl border-red-100 bg-red-50/5 overflow-hidden transition-all hover:shadow-2xl">
                  <CardHeader className="p-5">
                    <CardTitle className="font-heading text-xl font-black uppercase tracking-tight text-red-900">Sensitive Actions</CardTitle>
                    <CardDescription className="text-red-700/60 font-medium">Critical changes that cannot be undone.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-8">
                    <div className="p-5 rounded-3xl bg-white border border-red-100 shadow-sm space-y-8">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                          <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h5 className="font-black text-red-900 tracking-tight">Permanent Account Deletion</h5>
                          <p className="text-xs text-red-700/60 leading-relaxed font-bold mt-1 uppercase tracking-tighter italic">Warning: All event data will be lost.</p>
                        </div>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full h-10 font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-red-500/20 transition-all hover:scale-105 active:scale-95">
                            Terminate Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2rem] border-red-100 shadow-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-lg font-black text-red-900 tracking-tight">Absolute Confirmation Required</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500 font-medium leading-relaxed">
                              Deleting your account is permanent. This will remove your organizer profile, all submitted events, and participant records. This action <span className="font-black text-red-600 underline">cannot be undone</span>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-3">
                            <AlertDialogCancel className="h-12 rounded-xl font-bold">Keep My Account</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className="h-12 rounded-xl bg-red-600 hover:bg-red-700 font-black uppercase text-[10px] tracking-widest px-6 shadow-xl shadow-red-600/20">
                              Confirm Deletion
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </div>);
}
