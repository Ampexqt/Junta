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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Camera,
  Upload,
  CheckCircle,
  Shield,
  Bell,
  Newspaper,
  Megaphone,
  Lock,
  UserPlus,
  Trash2,
  Mail,
  Loader2,
  XCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { uploadImage } from '@/lib/cloudinary';
import { API_BASE_URL } from '@/lib/api';
import { sileo } from 'sileo';
import { useNavigate, Navigate } from 'react-router-dom';

export function SettingsPage() {
  const { user, profile, role, logout, uid } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  
  // Local states for inputs (initialized from profile or empty)
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [suffix, setSuffix] = useState(profile?.suffix || 'none');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);

  // Staged URLs
  const [pendingPhotoURL, setPendingPhotoURL] = useState<string | null>(profile?.photoURL || null);
  const [pendingValidIdUrl, setPendingValidIdUrl] = useState<string | null>(profile?.validIdUrl || null);
  const [pendingSelfieUrl, setPendingSelfieUrl] = useState<string | null>(profile?.selfieUrl || null);

  // Sync local state when profile loads/updates
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setPhone(profile.phone || '');
      setSuffix(profile.suffix || 'none');
      setPendingPhotoURL(profile.photoURL || null);
      setPendingValidIdUrl(profile.validIdUrl || null);
      setPendingSelfieUrl(profile.selfieUrl || null);
    }
  }, [profile]);

  const [prefs, setPrefs] = useState({
    eventReminders: true,
    systemUpdates: true,
    newsletter: false,
    organizerNotifs: true
  });

  const handleSave = async () => {
    if (!uid) {
      sileo.error({ title: 'Auth Error', description: 'User session not found.' });
      return;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const updateData: any = {
        firstName,
        lastName,
        phone,
        suffix: suffix === 'none' ? '' : suffix
      };

      if (pendingPhotoURL !== (profile?.photoURL || null)) {
        updateData.photoURL = pendingPhotoURL;
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

  const handlePhotoDelete = async () => {
    setPendingPhotoURL('');
    sileo.success({ title: 'Photo Removed', description: 'Click "Save Changes" to confirm removal.' });
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
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
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
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
      <input type="file" ref={idInputRef} className="hidden" accept="image/*" onChange={handleIdUpload} />
      <input type="file" ref={selfieInputRef} className="hidden" accept="image/*" onChange={handleSelfieUpload} />

      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, verification, and preferences.
        </p>
      </div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="rounded-2xl shadow-sm border">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal details and profile photo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative group/avatar">
                <Avatar className="w-20 h-20 border-2 border-slate-100 shadow-sm transition-all group-hover/avatar:border-primary/20">
                  <AvatarImage src={pendingPhotoURL || profile?.photoURL} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {initials || '??'}
                  </AvatarFallback>
                </Avatar>
                
                {isUploading ? (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full z-10">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <Button
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-2 border-white shadow-sm hover:bg-primary/90 flex items-center justify-center"
                      aria-label="Change profile photo"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </Button>
                    {pendingPhotoURL && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handlePhotoDelete}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full border border-slate-100 shadow-sm text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{firstName} {lastName} {suffix && suffix !== 'none' ? suffix : ''}</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.email || user?.email}
                </p>
                <Badge
                  variant="outline"
                  className={`mt-1 text-xs border-0 capitalize ${
                    role === 'admin' ? 'bg-purple-50 text-purple-700' : 
                    role === 'organizer' ? 'bg-blue-50 text-blue-700' : 
                    'bg-primary/10 text-primary'
                  }`}
                >
                  {role}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-4">
                <div className="sm:col-span-3 space-y-2">
                  <Label htmlFor="settings-firstname">First Name</Label>
                  <Input
                    id="settings-firstname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)} 
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="sm:col-span-3 space-y-2">
                  <Label htmlFor="settings-lastname">Last Name</Label>
                  <Input
                    id="settings-lastname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)} 
                    placeholder="Enter your last name"
                  />
                </div>
                <div className="sm:col-span-1 space-y-2">
                  <Label htmlFor="settings-suffix">Suffix</Label>
                  <Select value={suffix} onValueChange={setSuffix}>
                    <SelectTrigger id="settings-suffix">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="Jr.">Jr.</SelectItem>
                      <SelectItem value="Sr.">Sr.</SelectItem>
                      <SelectItem value="II">II</SelectItem>
                      <SelectItem value="III">III</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3 space-y-2 mt-2">
                  <Label htmlFor="settings-phone">Phone Number</Label>
                  <Input
                    id="settings-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="e.g. 09123456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-email" className="text-muted-foreground opacity-70">Email Address (Read Only)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                  <Input
                    id="settings-email"
                    type="email"
                    value={profile?.email || user?.email || ''}
                    disabled
                    className="pl-10 bg-muted/30 border-dashed border-muted-foreground/20 cursor-not-allowed opacity-60" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground opacity-30" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                className="bg-primary hover:bg-primary/90" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Verification */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="rounded-2xl shadow-sm border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-lg">
                  Verification Status
                </CardTitle>
                <CardDescription>
                  Your identity verification details.
                </CardDescription>
              </div>
              <Badge className={`${kycVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'} border-0 gap-1.5`}>
                {kycVerified ? <CheckCircle className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                {kycVerified ? 'Verified' : 'Pending Verification'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div 
                onClick={() => idInputRef.current?.click()}
                className="relative border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors cursor-pointer overflow-hidden group min-h-[160px] flex flex-col items-center justify-center"
              >
                {isUploadingId ? (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : null}
                
                {pendingValidIdUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                    <img src={pendingValidIdUrl} alt="Valid ID" className="h-full w-full object-cover opacity-30 group-hover:opacity-20 transition-opacity" />
                    <div className="absolute flex flex-col items-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                      <p className="text-sm font-medium text-foreground">ID Staged</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to replace</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Upload Valid ID</p>
                    <p className="text-xs text-muted-foreground mt-1">PhilID, Passport, or Driver's License</p>
                  </>
                )}
              </div>
              
              <div 
                onClick={() => selfieInputRef.current?.click()}
                className="relative border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors cursor-pointer overflow-hidden group min-h-[160px] flex flex-col items-center justify-center"
              >
                {isUploadingSelfie ? (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : null}

                {pendingSelfieUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                    <img src={pendingSelfieUrl} alt="Selfie" className="h-full w-full object-cover opacity-30 group-hover:opacity-20 transition-opacity" />
                    <div className="absolute flex flex-col items-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                      <p className="text-sm font-medium text-foreground">Selfie Staged</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to replace</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Upload Selfie</p>
                    <p className="text-xs text-muted-foreground mt-1">Clear photo showing your face</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button 
                onClick={handleKYCSubmit}
                disabled={isSubmittingKYC || (!pendingValidIdUrl || !pendingSelfieUrl)}
                className="bg-primary hover:bg-primary/90 text-white font-bold h-10 px-6 rounded-lg shadow-sm transition-all shadow-primary/20"
              >
                {isSubmittingKYC ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Verification'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Safety */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="rounded-2xl shadow-sm border">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Account</CardTitle>
            <CardDescription>
              Manage your account security and data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {role === 'participant' && (
              <Button
                variant="outline"
                className="w-full justify-start h-12"
                onClick={() => {
                  sileo.info({ title: 'Coming Soon', description: 'Organizer application flow is being finalized.' });
                }}>
                <UserPlus className="w-4 h-4 mr-3 text-primary" /> Request to become an Organizer
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="w-full justify-start h-12"
              onClick={handlePasswordReset}
            >
              <Lock className="w-4 h-4 mr-3" /> Change Password
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                  <Trash2 className="w-4 h-4 mr-3" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white">
                    Yes, delete account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </motion.div>
    </div>);
}
