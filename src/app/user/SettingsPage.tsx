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
import { useAuth } from '@/features/auth/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { uploadImage } from '@/lib/cloudinary';
import { sileo } from 'sileo';

export function SettingsPage() {
  const { user, profile, role } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local states for inputs (initialized from profile or empty)
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [suffix, setSuffix] = useState(profile?.suffix || 'none');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Sync local state when profile loads/updates
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setSuffix(profile.suffix || 'none');
    }
  }, [profile]);

  const [prefs, setPrefs] = useState({
    eventReminders: true,
    systemUpdates: true,
    newsletter: false,
    organizerNotifs: true
  });

  const handleSave = async () => {
    if (!user) {
      sileo.error({ title: 'Auth Error', description: 'User session not found.' });
      return;
    }
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        firstName,
        lastName,
        suffix: suffix === 'none' ? '' : suffix
      };
      
      await updateDoc(userRef, updateData);
      
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
    if (!file || !user) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      sileo.error({ title: 'Invalid File', description: 'Please upload an image file.' });
      return;
    }

    setIsUploading(true);
    try {
      // Uploading to Cloudinary via backend API
      const result = await uploadImage(file);
      const photoURL = result.url;

      // Update Firestore with the new Cloudinary URL
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { photoURL });

      sileo.success({ title: 'Photo Uploaded', description: 'Your profile picture has been updated on Cloudinary.' });
    } catch (error) {
      console.error('Upload error:', error);
      sileo.error({ title: 'Upload Failed', description: 'Could not upload photo to Cloudinary.' });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePhotoDelete = async () => {
    if (!user || !profile?.photoURL) return;

    setIsUploading(true);
    try {
      // Clear Firestore record
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { photoURL: null });

      sileo.success({ title: 'Photo Removed', description: 'Profile picture cleared from your profile.' });
    } catch (error) {
      console.error('Delete error:', error);
      sileo.error({ title: 'Action Failed', description: 'Could not remove photo.' });
    } finally {
      setIsUploading(false);
    }
  };

  if (!profile && !user) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  const kycVerified = profile?.kycStatus === 'verified' || profile?.isVerified;

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handlePhotoUpload}
      />

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
                  <AvatarImage src={profile?.photoURL} className="object-cover" />
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
                    {profile?.photoURL && (
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
                  {profile?.email}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-email" className="text-muted-foreground opacity-70">Email Address (Read Only)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                  <Input
                    id="settings-email"
                    type="email"
                    value={profile?.email || ''}
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
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">
                  Upload Valid ID
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Replace current ID document
                </p>
                <Badge
                  variant="outline"
                  className={`mt-2 text-[10px] border-0 ${kycVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}
                >
                  {kycVerified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors cursor-pointer">
                <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">
                  Upload Selfie
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Replace current selfie
                </p>
                <Badge
                  variant="outline"
                  className={`mt-2 text-[10px] border-0 ${kycVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}
                >
                  {kycVerified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
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
                  // Future implementation for organizer request
                  sileo.info({ title: 'Coming Soon', description: 'Organizer application flow is being finalized.' });
                }}>
                <UserPlus className="w-4 h-4 mr-3 text-primary" /> Request to become an Organizer
              </Button>
            )}
            <Button variant="outline" className="w-full justify-start h-12">
              <Lock className="w-4 h-4 mr-3" /> Change Password
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              <Trash2 className="w-4 h-4 mr-3" /> Delete Account
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>);
}
