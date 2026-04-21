import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
  Upload,

  Shield,
  Lock,

  Trash2,
  Mail,
  Loader2,

  Clock,
  User,
  Fingerprint,
  KeyRound,
  FileText
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
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);

  // Staged URLs
  const [pendingPhotoURL, setPendingPhotoURL] = useState<string | null>(profile?.photoURL || null);
  const [pendingOrgLogoURL, setPendingOrgLogoURL] = useState<string | null>(profile?.organizationLogo || null);
  const [pendingValidIdUrl, setPendingValidIdUrl] = useState<string | null>(profile?.validIdUrl || null);
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

    // Basic validation
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

  const handleKYCSubmit = async () => {
    if (!pendingValidIdUrl || !pendingSelfieUrl) {
      sileo.error({ title: 'Missing Documents', description: 'Please upload both your Valid ID and a Selfie.' });
      return;
    }
    setIsSubmittingKYC(true);
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        validIdUrl: pendingValidIdUrl,
        selfieUrl: pendingSelfieUrl,
        kycStatus: 'pending'
      };
      
      const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Failed to submit KYC');
      
      sileo.success({ title: 'Verification Submitted', description: 'Your identity documents are now pending review.' });
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
    // Note: Since this is JWT auth, auth.currentUser might be null on frontend.
    // However, Firebase Auth deleteUser requires the user object.
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

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-10 px-4">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
      <input type="file" ref={orgLogoInputRef} className="hidden" accept="image/*" onChange={handleOrgLogoUpload} />
      <input type="file" ref={idInputRef} className="hidden" accept="image/*" onChange={handleIdUpload} />
      <input type="file" ref={selfieInputRef} className="hidden" accept="image/*" onChange={handleSelfieUpload} />

      <div className="flex flex-col gap-2 px-1">
        <h1 className="font-heading font-black text-lg text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-slate-500 text-[13px] font-medium">
          Manage your personal identity, organization branding, and security preferences.
        </p>
      </div>

      <Tabs defaultValue="account" orientation="horizontal" className="w-full flex flex-col">
        <div className="mb-10 overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="inline-flex h-11 items-center justify-start rounded-xl bg-slate-100/50 p-1 text-slate-500 border border-slate-200/40 w-full sm:w-auto min-w-max gap-0.5">
            <TabsTrigger 
              value="account" 
              className="rounded-lg px-4 py-2 text-xs data-active:bg-white data-active:text-primary data-active:shadow-sm font-bold transition-all flex items-center gap-2 h-full"
            >
              <User className="w-4 h-4" />
              Account
            </TabsTrigger>
            {role === 'organizer' && (
              <TabsTrigger 
                value="organization" 
                className="rounded-xl px-6 py-2.5 data-active:bg-white data-active:text-emerald-600 data-active:shadow-md font-bold transition-all flex items-center gap-2.5 h-full"
              >
                <Shield className="w-4 h-4" />
                Organization
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="verification" 
              className="rounded-xl px-6 py-2.5 data-active:bg-white data-active:text-amber-600 data-active:shadow-md font-bold transition-all flex items-center gap-2.5 h-full"
            >
              <Fingerprint className="w-4 h-4" />
              Verification
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="rounded-xl px-6 py-2.5 data-active:bg-white data-active:text-slate-900 data-active:shadow-md font-bold transition-all flex items-center gap-2.5 h-full"
            >
              <KeyRound className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1">
          <TabsContent value="account" className="mt-0 focus-visible:ring-0">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="rounded-[1.5rem] shadow-sm border-slate-200/60 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                  <CardTitle className="font-heading text-lg font-black text-slate-900">Personal Details</CardTitle>
                  <CardDescription className="text-[13px] text-slate-500 font-medium">Update your profile identity and contact information.</CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-6">
                  <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-2 text-center md:text-left">
                    <div className="relative group/avatar mx-auto md:mx-0">
                      <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-primary-foreground rounded-full blur opacity-10 group-hover/avatar:opacity-20 transition-opacity" />
                      <Avatar className="w-20 h-20 border-2 border-white shadow-md transition-all relative">
                        <AvatarImage src={pendingPhotoURL || profile?.photoURL} className="object-cover" />
                        <AvatarFallback className="bg-slate-100 text-slate-400 text-lg font-black">
                          {initials || '??'}
                        </AvatarFallback>
                      </Avatar>
                      
                      {isUploading ? (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-full z-10 border border-slate-100">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      ) : (

                          <Button
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary rounded-full border-4 border-white shadow-xl hover:scale-110 transition-transform flex items-center justify-center"
                          >
                            <Camera className="w-5 h-5 text-white" />
                          </Button>











                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                        {firstName} {lastName} {suffix && suffix !== 'none' ? suffix : ''}
                      </h3>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <Badge className="px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary/10 text-primary border-0 shadow-none">
                          {role}
                        </Badge>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                          <Mail className="w-3.5 h-3.5" />
                          {profile?.email || user?.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="opacity-40" />

                  <div className="grid grid-cols-1 md:grid-cols-7 gap-5">
                    <div className="md:col-span-3 space-y-3">
                      <Label htmlFor="settings-firstname" className="font-black text-[10px] uppercase tracking-[0.1em] text-slate-400 px-1">First Name</Label>
                      <Input id="settings-firstname" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-10 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-semibold" />
                    </div>
                    <div className="md:col-span-3 space-y-3">
                      <Label htmlFor="settings-lastname" className="font-black text-[10px] uppercase tracking-[0.1em] text-slate-400 px-1">Last Name</Label>
                      <Input id="settings-lastname" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-10 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-semibold" />
                    </div>
                    <div className="md:col-span-1 space-y-3">
                      <Label htmlFor="settings-suffix" className="font-black text-[10px] uppercase tracking-[0.1em] text-slate-400 px-1">Suffix</Label>
                      <Select value={suffix} onValueChange={setSuffix}>
                        <SelectTrigger id="settings-suffix" className="h-10 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white transition-all font-semibold">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="Jr.">Jr.</SelectItem>
                          <SelectItem value="Sr.">Sr.</SelectItem>
                          <SelectItem value="II">II</SelectItem>
                          <SelectItem value="III">III</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <Label htmlFor="settings-phone" className="font-black text-[10px] uppercase tracking-[0.1em] text-slate-400 px-1">Phone Contact</Label>
                      <Input id="settings-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10 rounded-2xl border-slate-200 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-semibold" placeholder="e.g. 09123456789" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="settings-email" className="font-black text-[10px] uppercase tracking-[0.1em] text-slate-300 px-1">Registered Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <Input
                          id="settings-email"
                          value={profile?.email || user?.email || ''}
                          disabled
                          className="pl-12 h-10 bg-slate-100/50 border-slate-100 text-slate-400 cursor-not-allowed rounded-2xl font-semibold italic border-dashed" 
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-200" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving} className="h-10 px-12 rounded-2xl font-black uppercase text-xs tracking-[0.15em] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95">
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save Profile Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {role === 'organizer' && (
            <TabsContent value="organization">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="rounded-[2.5rem] shadow-xl shadow-emerald-200/30 border-emerald-100 bg-emerald-50/5 overflow-hidden">
                  <CardHeader className="bg-emerald-50/50 border-b border-emerald-100/50 p-5">
                    <CardTitle className="font-heading text-lg font-black text-emerald-900">Organization Identity</CardTitle>
                    <CardDescription className="text-emerald-700/60 font-medium">Customize how your group appears to participants.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 space-y-10">
                    <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-5 rounded-[2rem] border border-emerald-100/50 shadow-sm relative">
                      <div className="absolute top-4 right-4">
                         <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-tighter">
                           <Shield className="w-3 h-3" /> Brand Verified
                         </div>
                      </div>
                      <div className="relative group/logo">
                        <div className="absolute -inset-2 bg-emerald-400/20 rounded-[2.5rem] blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                        <Avatar className="w-16 h-16 rounded-[2rem] border-4 border-white shadow-2xl transition-all group-hover/logo:scale-105 relative">
                          <AvatarImage src={pendingOrgLogoURL || profile?.organizationLogo} className="object-cover" />
                          <AvatarFallback className="bg-emerald-100 text-emerald-600 text-xl font-black rounded-[2rem] uppercase">
                            {organizationName?.substring(0, 2) || 'OG'}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="icon"
                          onClick={() => orgLogoInputRef.current?.click()}
                          className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-600 rounded-2xl border-4 border-white shadow-xl hover:bg-emerald-700 flex items-center justify-center transition-all"
                        >
                          {isUploadingOrgLogo ? <Loader2 className="w-3 h-3 animate-spin text-white" /> : <Camera className="w-3 h-3 text-white" />}
                        </Button>
                      </div>
                      <div className="text-center md:text-left space-y-2 max-w-md">
                        <h4 className="font-black text-lg text-emerald-900 tracking-tight leading-none">Organization Logo</h4>
                        <p className="text-sm text-emerald-700/60 leading-relaxed font-medium">
                          This logo stays consistent across all your events. Recommended: High-res PNG with transparent background.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="settings-orgname" className="font-black text-[10px] uppercase tracking-[0.1em] text-emerald-800/40 px-1">Official Organization Name</Label>
                      <Input
                        id="settings-orgname"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)} 
                        placeholder="e.g. Green Earth Foundation"
                        className="h-10 rounded-2xl border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 bg-white font-bold text-lg"
                      />
                      {(() => {
                        const lastUpdate = profile?.lastOrgNameUpdate;
                        if (!lastUpdate) return null;
                        const diff = Date.now() - new Date(lastUpdate).getTime();
                        const hours = Math.ceil(24 - (diff / 3600000));
                        if (hours > 0) return (
                          <div className="flex items-start gap-3 bg-amber-50 rounded-2xl p-4 border border-amber-100/50">
                            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                            <div className="space-y-1">
                              <p className="text-xs font-black text-amber-900 uppercase">Name Change Cooldown</p>
                              <p className="text-[11px] text-amber-700 font-medium">To maintain consistency, names can only be changed once every 24 hours. Reset available in <span className="font-black underline">{hours} hours</span>.</p>
                            </div>
                          </div>
                        );
                        return null;
                      })()}
                    </div>

                    <div className="pt-6 border-t border-emerald-100/30 flex justify-end">
                      <Button 
                        onClick={async () => {
                          const lastUpdate = profile?.lastOrgNameUpdate;
                          const hours = lastUpdate ? 24 - (Date.now() - new Date(lastUpdate).getTime()) / 3600000 : 25;
                          if (organizationName !== profile?.organizationName && hours > 0) {
                            sileo.error({ title: 'Brand Update Failed', description: `Please wait ${Math.ceil(hours)} more hours.` });
                            return;
                          }
                          await handleSave();
                        }}
                        className="h-10 px-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-[0.15em] shadow-2xl shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                      >
                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : 'Update Brand Identity'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          )}

          <TabsContent value="verification">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="rounded-[2.5rem] shadow-xl border-slate-200/60 overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <CardTitle className="font-heading text-lg font-black tracking-tight">Identity & Validation</CardTitle>
                      <CardDescription className="text-slate-400 font-medium tracking-wide">Establish trust with your community.</CardDescription>
                    </div>
                    <Badge className={`${kycVerified ? 'bg-emerald-500' : 'bg-amber-500'} text-white border-0 px-6 py-2 font-black text-[10px] uppercase tracking-widest rounded-full shadow-lg`}>
                      {kycVerified ? 'Trusted Account' : 'Verification Required'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="p-6 space-y-8 border-b lg:border-b-0 lg:border-r border-slate-100">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/50 shadow-sm">
                          <FileText className="w-7 h-7 text-slate-600" />
                        </div>
                        <div className="space-y-6 flex-1">
                          <div>
                            <h4 className="font-black text-xl text-slate-900 leading-tight tracking-tight uppercase">Government ID</h4>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed">Proof of legal identity (Passport, Driver's License, or National ID).</p>
                          </div>
                          <div className="aspect-video rounded-3xl border-4 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-4 group/upload relative overflow-hidden transition-all hover:bg-slate-100/50">
                            {pendingValidIdUrl ? (
                              <div className="relative w-full h-full group/preview">
                                <img src={pendingValidIdUrl} alt="ID" className="w-full h-full object-cover rounded-2xl shadow-inner" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                  <Button size="sm" variant="secondary" onClick={() => idInputRef.current?.click()} className="rounded-xl font-bold">Change</Button>
                                  <Button size="sm" variant="destructive" onClick={() => setPendingValidIdUrl('')} className="rounded-xl font-bold">Remove</Button>
                                </div>
                              </div>
                            ) : (
                              <Button variant="ghost" onClick={() => idInputRef.current?.click()} className="flex flex-col gap-4 h-auto text-slate-300 font-black hover:bg-transparent hover:text-slate-500 w-full transition-all">
                                {isUploadingId ? <Loader2 className="animate-spin w-10 h-10" /> : <div className="w-14 h-10 rounded-full bg-white shadow-xl flex items-center justify-center transition-transform group-hover/upload:scale-110"><Upload className="w-6 h-6" /></div>}
                                <div className="space-y-1">
                                  <span className="text-[10px] uppercase tracking-[0.3em]">Click to upload front view</span>
                                  <p className="text-[9px] font-medium opacity-50 uppercase tracking-tighter">Maximum file size: 5MB</p>
                                </div>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-8">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/50 shadow-sm">
                          <Camera className="w-7 h-7 text-slate-600" />
                        </div>
                        <div className="space-y-6 flex-1">
                          <div>
                            <h4 className="font-black text-xl text-slate-900 leading-tight tracking-tight uppercase">Live Selfie</h4>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed">Ensure a clear face view with your ID held next to it.</p>
                          </div>
                          <div className="aspect-video rounded-3xl border-4 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-4 group/upload relative overflow-hidden transition-all hover:bg-slate-100/50">
                            {pendingSelfieUrl ? (
                              <div className="relative w-full h-full group/preview">
                                <img src={pendingSelfieUrl} alt="Selfie" className="w-full h-full object-cover rounded-2xl shadow-inner" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                  <Button size="sm" variant="secondary" onClick={() => selfieInputRef.current?.click()} className="rounded-xl font-bold">Change</Button>
                                  <Button size="sm" variant="destructive" onClick={() => setPendingSelfieUrl('')} className="rounded-xl font-bold">Remove</Button>
                                </div>
                              </div>
                            ) : (
                              <Button variant="ghost" onClick={() => selfieInputRef.current?.click()} className="flex flex-col gap-4 h-auto text-slate-300 font-black hover:bg-transparent hover:text-slate-500 w-full transition-all">
                                {isUploadingSelfie ? <Loader2 className="animate-spin w-10 h-10" /> : <div className="w-14 h-10 rounded-full bg-white shadow-xl flex items-center justify-center transition-transform group-hover/upload:scale-110"><Camera className="w-6 h-6" /></div>}
                                <div className="space-y-1">
                                  <span className="text-[10px] uppercase tracking-[0.3em]">Click to capture selfie</span>
                                  <p className="text-[9px] font-medium opacity-50 uppercase tracking-tighter">High clarity required</p>
                                </div>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t bg-slate-50/50">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex gap-6 max-w-xl">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500 flex items-center justify-center shrink-0 shadow-xl shadow-emerald-500/20">
                          <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-black text-slate-900 uppercase text-xs tracking-widest">Why get verified?</h5>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                            Verification is a manual process by our security team. Trusted accounts enjoy higher visibility, <span className="text-emerald-600 font-black tracking-tight">PRIORITY EVENT APPROVAL</span>, and direct support.
                          </p>
                        </div>
                      </div>
                      <Button onClick={handleKYCSubmit} disabled={isSubmittingKYC || kycVerified} className="px-12 h-10 font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all hover:scale-105 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 shadow-xl shadow-primary/20">
                        {isSubmittingKYC ? <Loader2 className="animate-spin mr-2" /> : kycVerified ? 'Identity Confirmed' : 'Submit for Validation'}
                      </Button>
                    </div>
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
