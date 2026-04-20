import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sileo } from 'sileo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from '@/components/ui/input-otp';
import {
  ArrowLeft,
  CheckCircle,
  Users,
  Megaphone,
  ArrowRight,
  User,
  Phone,
  Mail,
  Lock,
  EyeOff,
  Eye,
  Info,
  Upload,
  Camera,
  Building2,
  RefreshCw,
  X,
  Check,
  Image as ImageIcon,
  ChevronDown,
  Search,
  GalleryVerticalEnd
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ZAMBOANGA_BARANGAYS as barangays } from '@/constants/barangays';
import { useAuth } from '../../features/auth/AuthContext';
import type { UserRole } from '../../features/auth/AuthContext';
import { API_BASE_URL } from '@/lib/api';
import { AuthNavigation } from '@/components/auth/AuthNavigation';
import { Badge } from '@/components/ui/badge';
import loginImg from '@/assets/Junta-Login-Register.png';

export function RegisterPage() {
  const navigate = useNavigate();
  const { setRole, setUserName, setUid } = useAuth();
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('participant');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    suffix: '',
    phone: '+63',
    email: '',
    password: '',
    orgName: '',
    barangay: ''
  });
  const [idUploaded, setIdUploaded] = useState(false);
  const [selfieUploaded, setSelfieUploaded] = useState(false);
  const [kycMode, setKycMode] = useState<'none' | 'id' | 'selfie'>('none');
  const [openBarangay, setOpenBarangay] = useState(false);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stepTitles = [
    'Choose Your Role',
    'Basic Information',
    'OTP Verification',
    'Identity Verification'
  ];

  const progress = (step / 4) * 100;

  const slideVariants = {
    enter: { x: 20, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 }
  };

  const handleComplete = async () => {
    if (!agreedPrivacy) {
      sileo.info({
        title: 'Agreement Required',
        description: 'Agree to the Data Privacy Act to proceed.',
        duration: 2000

      });
      return;
    }

    setIsCompleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Success logic - Auto Login with Standardized Keys
      const suffixValue = formData.suffix && formData.suffix !== 'none' ? ` ${formData.suffix}` : '';
      const fullName = `${formData.firstName} ${formData.lastName}${suffixValue}`.trim() || data.user.displayName;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('junta_user_uid', data.user.uid);
      localStorage.setItem('junta_user_name', fullName);
      localStorage.setItem('junta_user_role', selectedRole);
      localStorage.setItem('junta_user_profile', JSON.stringify({ ...data.user, role: selectedRole }));
      
      setUid(data.user.uid);
      setRole(selectedRole);
      setUserName(fullName);

      sileo.success({
        title: 'Welcome to Junta!',
        description: 'Your account has been created successfully.',
        duration: 2000
      });


      navigate('/app/dashboard');

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Could not create account. Please try again.';
      sileo.error({
        title: 'Registration Error',
        description: errorMsg,
        duration: 2000
      });

    } finally {
      setIsCompleting(false);
    }
  };

  const formatPhone = (value: string) => {
    if (value.length < 3) return '+63';
    let digits = value.slice(3).replace(/[^\d]/g, '');
    digits = digits.slice(0, 10);
    let formatted = '+63';
    if (digits.length > 0) formatted += ' ' + digits.slice(0, 3);
    if (digits.length > 3) formatted += ' ' + digits.slice(3, 6);
    if (digits.length > 6) formatted += ' ' + digits.slice(6, 10);
    return formatted;
  };

  const inputClass = "h-10 rounded-[12px] border-slate-200 bg-slate-50/30 text-[14px] focus-visible:ring-2 focus-visible:ring-primary/10 focus-visible:border-primary transition-all placeholder:text-slate-400";

  const handleStep2Continue = async () => {
    const { firstName, lastName, email, password, phone, barangay, orgName } = formData;

    // ... existing validation ...
    if (!firstName.trim() || !lastName.trim()) {
      sileo.error({ 
        title: 'Name Required', 
        description: 'Please enter your first and last name.',
        duration: 1500 
      });
      return;
    }
    if (!barangay) {
      sileo.error({ 
        title: 'Barangay Required', 
        description: 'Please select your barangay.',
        duration: 1500 
      });
      return;
    }
    const phoneDigits = phone.slice(4).replace(/\s/g, '');
    if (phoneDigits.length > 0 && phoneDigits[0] !== '9') {
      sileo.error({ 
        title: 'Invalid Phone Format', 
        description: 'Your phone number must start with 9 (e.g., +63 9XX XXX XXXX).',
        duration: 2000
      });

      return;
    }
    if (phoneDigits.length < 10) {
      sileo.error({ 
        title: 'Incomplete Phone', 
        description: 'Please enter a complete 10-digit mobile number.' 
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      sileo.error({ 
        title: 'Invalid Email', 
        description: 'Please enter a valid email address.',
        duration: 1500 
      });
      return;
    }
    const isPassValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
    if (!isPassValid) {
      sileo.error({ title: 'Weak Password', description: 'Password must meet all security requirements.' });
      return;
    }
    if (selectedRole === 'organizer' && !orgName.trim()) {
      sileo.error({ title: 'Organization Required', description: 'Please enter your organization name.' });
      return;
    }

    setIsSendingOTP(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to send verification code';
        throw new Error(errorMessage);
      }

      if (data.devMode) {
        sileo.warning({
          title: 'OTP Bypass Active',
          description: 'We couldn\'t send the email, but we\'ve logged your verification code to the server terminal. Grab it from there to continue!',
          duration: 5000
        });
      } else {
        sileo.success({
          title: 'OTP Sent',
          description: `A verification code has been sent to ${email}`,
          duration: 3000
        });
      }
      setStep(3);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Check your internet connection and try again.';
      sileo.error({
        title: 'Network Error',
        description: errorMsg
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    if (isSendingOTP) return;
    
    setIsSendingOTP(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      if (data.devMode) {
        sileo.warning({
          title: 'OTP Bypass Active',
          description: 'The code has been logged to the server terminal. Grab it from there!',
          duration: 4000
        });
      } else {
        sileo.success({
          title: 'Code Resent',
          description: 'A new verification code has been sent.',
          duration: 3000
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Could not resend code. Please try again later.';
      sileo.error({
        title: 'Resend Failed',
        description: errorMsg
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      sileo.error({
        title: 'Incomplete Code',
        description: 'Please enter all 6 digits of the verification code.'
      });
      return;
    }

    setIsVerifyingOTP(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      sileo.success({
        title: 'Email Verified',
        description: 'Your email has been successfully verified.',
      });
      setStep(4);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'The code you entered is incorrect or has expired.';
      sileo.error({
        title: 'Verification Failed',
        description: errorMsg
      });
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: kycMode === 'selfie' ? 'user' : 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      sileo.error({
        title: 'Camera Access Error',
        description: 'Please enable camera permissions to continue verification.'
      });
    }
  }, [kycMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        if (kycMode === 'id') setIdPreview(dataUrl);
        else setSelfiePreview(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (kycMode === 'id') setIdPreview(result);
        else setSelfiePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const currentPreview = kycMode === 'id' ? idPreview : selfiePreview;
    if (kycMode !== 'none' && !currentPreview) {
      startCamera();
    }
    return () => stopCamera();
  }, [kycMode, idPreview, selfiePreview, startCamera, stopCamera]);

  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (kycMode === 'selfie' && !selfiePreview && videoRef.current) {
      setIsScanning(true);
    } else {
      setIsScanning(false);
    }
  }, [kycMode, selfiePreview]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2 relative overflow-hidden bg-white">
      <AuthNavigation />

      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[440px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card className="rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 bg-white overflow-hidden">
                <CardHeader className="pb-2 pt-6 px-8">
                  <div className="flex items-center gap-1.5 mb-4">
                    {[1, 2, 3, 4].map((s) => (
                      <div key={s} className="flex items-center gap-1.5 flex-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${s < step
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                            : s === step
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 ring-2 ring-emerald-100'
                              : 'bg-slate-100 text-slate-400'
                            }`}
                        >
                          {s < step ? <CheckCircle className="w-3.5 h-3.5" /> : s}
                        </div>
                        {s < 4 && (
                          <div className={`flex-1 h-[2px] rounded-full transition-colors ${s < step ? 'bg-emerald-600' : 'bg-slate-100'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <Progress value={progress} className="h-[2px] mb-3 bg-slate-50 shrink-0" />
                  <CardTitle className="font-heading font-bold text-xl text-slate-900">
                    Step {step}: {stepTitles[step - 1]}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 font-medium mt-1">
                    {step === 1 && 'How would you like to use Junta?'}
                    {step === 2 && 'Create your Junta account'}
                    {step === 3 && 'Enter the 6-digit code sent to your email'}
                    {step === 4 && 'Upload your documents for verification'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8 pt-4">
                  <AnimatePresence mode="wait">
                    {/* Step 1 */}
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div
                            onClick={() => setSelectedRole('participant')}
                            className={`relative p-5 rounded-2xl border text-left transition-all cursor-pointer ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${selectedRole === 'participant'
                              ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/20 shadow-sm'
                              : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 shadow-sm'
                              }`}
                          >
                            {selectedRole === 'participant' && (
                              <div className="absolute top-4 right-4">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                              </div>
                            )}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${selectedRole === 'participant' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                              <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Participant</h3>
                            <p className="text-[12px] text-slate-500 font-medium leading-relaxed mt-1.5">
                              Join events, volunteer, and track your impact.
                            </p>
                          </div>

                          <div
                            onClick={() => setSelectedRole('organizer')}
                            className={`relative p-5 rounded-2xl border text-left transition-all cursor-pointer ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${selectedRole === 'organizer'
                              ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/20 shadow-sm'
                              : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 shadow-sm'
                              }`}
                          >
                            {selectedRole === 'organizer' && (
                              <div className="absolute top-4 right-4">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                              </div>
                            )}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${selectedRole === 'organizer' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                              <Megaphone className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Organizer</h3>
                            <p className="text-[12px] text-slate-500 font-medium leading-relaxed mt-1.5">
                              Create and manage environmental events.
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-50/50 rounded-xl p-4 text-[11px] text-slate-500 border border-slate-100 font-medium leading-relaxed">
                          {selectedRole === 'participant' ? (
                            <p>
                              As a <span className="font-bold text-slate-900 uppercase tracking-tight">Participant</span>, you can discover events, join activities, track your hours, and build your environmental impact score.
                            </p>
                          ) : (
                            <p>
                              As an <span className="font-bold text-slate-900 uppercase tracking-tight">Organizer</span>, you get everything a participant has, plus the ability to create events and manage volunteers.
                            </p>
                          )}
                        </div>

                        <Button
                          className="w-full bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white h-11 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                          onClick={() => setStep(2)}
                        >
                          Continue as {selectedRole === 'participant' ? 'Participant' : 'Organizer'}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </motion.div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                      <motion.div
                        key="step2"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <Label className="text-[12px] font-bold text-slate-700 ml-1">Full Name <span className="text-red-500">*</span></Label>
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-5 relative group">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                              <Input
                                placeholder="First"
                                value={formData.firstName}
                                maxLength={30}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className={`pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/30 text-sm focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all`}
                              />
                            </div>
                            <div className="col-span-4">
                              <Input
                                placeholder="Last"
                                value={formData.lastName}
                                maxLength={30}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 bg-slate-50/30 text-sm focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all"
                              />
                            </div>
                            <div className="col-span-3">
                              <Select value={formData.suffix} onValueChange={(val) => setFormData({ ...formData, suffix: val })}>
                                <SelectTrigger className="w-full h-10 rounded-xl border-slate-200 bg-slate-50/30 text-sm focus:ring-emerald-500/10">
                                  <SelectValue placeholder="Suffix" />
                                </SelectTrigger>
                                <SelectContent position="popper" sideOffset={4} className="rounded-xl border-slate-200 shadow-xl z-[100] w-[var(--radix-select-trigger-width)]">
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="Jr.">Jr.</SelectItem>
                                  <SelectItem value="Sr.">Sr.</SelectItem>
                                  <SelectItem value="II">II</SelectItem>
                                  <SelectItem value="III">III</SelectItem>
                                  <SelectItem value="IV">IV</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[12px] font-bold text-slate-700 ml-1">Barangay <span className="text-red-500">*</span></Label>
                            <Popover open={openBarangay} onOpenChange={setOpenBarangay}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={openBarangay}
                                  className={cn(
                                    "w-full justify-between h-10 rounded-xl border-slate-200 bg-slate-50/30 px-3.5 py-2 text-sm text-slate-900 shadow-none hover:bg-slate-50 focus:ring-emerald-500/10",
                                    !formData.barangay && "text-slate-400"
                                  )}
                                >
                                  <span className="truncate">
                                    {formData.barangay || "Select..."}
                                  </span>
                                  <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                <Command className="border-none">
                                  <CommandInput placeholder="Search barangay..." />
                                  <CommandList>
                                    <CommandEmpty>No barangay found.</CommandEmpty>
                                    <CommandGroup>
                                      {barangays.map((b) => (
                                        <CommandItem
                                          key={b}
                                          value={b}
                                          onSelect={(val) => {
                                            setFormData({ ...formData, barangay: val });
                                            setOpenBarangay(false);
                                          }}
                                          className="cursor-pointer"
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              formData.barangay === b ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {b}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-[12px] font-bold text-slate-700 ml-1">Phone Number <span className="text-red-500">*</span></Label>
                            <div className="relative group">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                              <Input
                                placeholder="+63 000 000 0000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/30 text-sm focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[12px] font-bold text-slate-700 ml-1">Email <span className="text-red-500">*</span></Label>
                          <div className="relative group">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                            <Input
                              type="email"
                              placeholder="name@example.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/30 text-sm focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[12px] font-bold text-slate-700 ml-1">Password <span className="text-red-500">*</span></Label>
                          <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              className="pl-10 pr-10 h-10 rounded-xl border-slate-200 bg-slate-50/30 text-sm focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-transparent transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>

                        {selectedRole === 'organizer' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-1.5"
                          >
                            <Label className="text-[12px] font-bold text-slate-700 ml-1">Organization <span className="text-red-500">*</span></Label>
                            <div className="relative group">
                              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                              <Input
                                placeholder="Organization Name"
                                value={formData.orgName}
                                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                                className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/30 text-sm focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all"
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 px-1 font-medium leading-tight">
                              The name of the NGO, foundation, or group you represent.
                            </p>
                          </motion.div>
                        )}

                        <div className="bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-emerald-700 shrink-0">
                            <Info className="w-3.5 h-3.5" />
                            Guide
                          </div>
                          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
                            {[
                              { label: '8+ chars', met: formData.password.length >= 8 },
                              { label: 'Uppercase', met: /[A-Z]/.test(formData.password) },
                              { label: 'Number', met: /[0-9]/.test(formData.password) },
                            ].map((req, i) => (
                              <div key={i} className="flex items-center gap-1.5 whitespace-nowrap">
                                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${req.met ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${req.met ? 'text-emerald-700' : 'text-slate-400'}`}>
                                  {req.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button
                            variant="outline"
                            className="flex-1 h-11 rounded-xl border-slate-200 text-sm font-bold shadow-sm"
                            onClick={() => setStep(1)}
                          >
                            <ArrowLeft className="mr-2 w-4 h-4" /> Back
                          </Button>
                          <Button
                            className="flex-1 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white h-11 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                            onClick={handleStep2Continue}
                            disabled={isSendingOTP}
                          >
                            {isSendingOTP ? (
                              <>
                                <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                Continue <ArrowRight className="ml-2 w-4 h-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                      <motion.div
                        key="step3"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        className="space-y-6 py-2"
                      >
                        <div className="flex justify-center">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center shadow-inner">
                            <Mail className="w-7 h-7 text-emerald-600" />
                          </div>
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-medium text-slate-500">
                            We sent a 6-digit code to
                          </p>
                          <p className="text-sm font-bold text-slate-900 underline decoration-emerald-200">
                            {formData.email || 'your email'}
                          </p>
                        </div>
                        <div className="flex justify-center py-2">
                          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                            <InputOTPGroup className="gap-2">
                              <InputOTPSlot index={0} className="h-12 w-10 rounded-xl border-slate-200 bg-slate-50/50 text-lg font-bold" />
                              <InputOTPSlot index={1} className="h-12 w-10 rounded-xl border-slate-200 bg-slate-50/50 text-lg font-bold" />
                              <InputOTPSlot index={2} className="h-12 w-10 rounded-xl border-slate-200 bg-slate-50/50 text-lg font-bold" />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup className="gap-2">
                              <InputOTPSlot index={3} className="h-12 w-10 rounded-xl border-slate-200 bg-slate-50/50 text-lg font-bold" />
                              <InputOTPSlot index={4} className="h-12 w-10 rounded-xl border-slate-200 bg-slate-50/50 text-lg font-bold" />
                              <InputOTPSlot index={5} className="h-12 w-10 rounded-xl border-slate-200 bg-slate-50/50 text-lg font-bold" />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <p className="text-center text-xs font-medium text-slate-400">
                          Didn't receive the code?{' '}
                          <Button 
                            variant="link"
                            className={cn(
                              "h-auto p-0 text-emerald-600 font-bold hover:no-underline",
                              isSendingOTP && "opacity-50 cursor-not-allowed"
                            )}
                            onClick={handleResendOTP}
                            disabled={isSendingOTP}
                          >
                            {isSendingOTP ? 'Sending...' : 'Resend Code'}
                          </Button>
                        </p>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1 h-11 rounded-xl border-slate-200 text-sm font-bold shadow-sm"
                            onClick={() => setStep(2)}
                          >
                            <ArrowLeft className="mr-2 w-4 h-4" /> Back
                          </Button>
                          <Button
                            className="flex-1 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white h-11 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                            onClick={handleVerifyOTP}
                            disabled={isVerifyingOTP}
                          >
                            {isVerifyingOTP ? (
                              <>
                                <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                Verify <ArrowRight className="ml-2 w-4 h-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4 */}
                    {step === 4 && (
                      <motion.div
                        key="step4"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        {kycMode === 'none' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div
                              onClick={() => setKycMode('id')}
                              className={`border border-dashed rounded-xl p-5 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[130px] ${idUploaded ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-500/40 hover:bg-emerald-50/30'}`}
                            >
                              {idPreview ? (
                                <div className="relative w-full h-full flex flex-col items-center animate-in zoom-in-95">
                                  <img src={idPreview} alt="ID Preview" className="w-20 h-14 object-cover rounded-lg border-2 border-emerald-500/20 mb-2 shadow-sm" />
                                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">ID Captured</p>
                                </div>
                              ) : (
                                <>
                                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 transition-all ${idUploaded ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 border-slate-200 group-hover:border-emerald-300 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600'}`}>
                                    <Upload className="w-5 h-5" />
                                  </div>
                                  <p className="text-sm font-bold text-slate-900">Upload ID</p>
                                  <p className="text-[10px] text-slate-500 font-medium mt-1 leading-tight">Valid government ID</p>
                                </>
                              )}
                            </div>

                            <div
                              onClick={() => setKycMode('selfie')}
                              className={`border border-dashed rounded-xl p-5 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[130px] ${selfieUploaded ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-500/40 hover:bg-emerald-50/30'}`}
                            >
                              {selfiePreview ? (
                                <div className="relative w-full h-full flex flex-col items-center animate-in zoom-in-95">
                                  <img src={selfiePreview} alt="Selfie Preview" className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 mb-2 shadow-md" />
                                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Selfie Taken</p>
                                </div>
                              ) : (
                                <>
                                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 transition-all ${selfieUploaded ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 border-slate-200 group-hover:border-emerald-300 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600'}`}>
                                    <Camera className="w-5 h-5" />
                                  </div>
                                  <p className="text-sm font-bold text-slate-900">Take Selfie</p>
                                  <p className="text-[10px] text-slate-500 font-medium mt-1 leading-tight">Face recognition</p>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-2xl overflow-hidden relative shadow-2xl border border-slate-800 flex flex-col"
                          >
                            {/* ── Video / Preview area ── */}
                            <div className="relative bg-slate-950" style={{ aspectRatio: '4/3' }}>

                              {/* ID alignment guide */}
                              {!idPreview && kycMode === 'id' && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                  <div className="w-[85%] h-[65%] border-2 border-dashed border-emerald-500/60 rounded-xl flex items-center justify-center">
                                    <Badge variant="default" className="bg-emerald-600 text-white text-[10px] uppercase tracking-widest px-3 py-1 shadow-lg">Align ID Here</Badge>
                                  </div>
                                </div>
                              )}

                              {/* Selfie alignment guide — perfectly centered over video only */}
                              {!selfiePreview && kycMode === 'selfie' && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                  <div className="relative w-44 h-44 flex items-center justify-center">
                                    {/* Outer dashed ring */}
                                    <div className="absolute inset-0 border-[3px] border-dashed border-emerald-500/50 rounded-full" />
                                    {/* Inner solid ring */}
                                    <div className="absolute inset-3 border-[2px] border-emerald-500/30 rounded-full" />
                                    <Badge variant="default" className="bg-slate-800/90 backdrop-blur-sm text-slate-200 text-[10px] uppercase tracking-[0.15em] px-4 py-1.5 z-20">
                                      Align Face
                                    </Badge>
                                  </div>
                                </div>
                              )}

                              {/* Video or captured image */}
                              {(kycMode === 'id' && idPreview) || (kycMode === 'selfie' && selfiePreview) ? (
                                <img
                                  src={(kycMode === 'id' ? idPreview : selfiePreview) || ''}
                                  className="w-full h-full object-cover"
                                  alt="Preview"
                                />
                              ) : (
                                <video
                                  ref={videoRef}
                                  autoPlay
                                  playsInline
                                  className="w-full h-full object-cover"
                                />
                              )}

                              {/* Close button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setKycMode('none'); stopCamera(); }}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors z-20"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* ── Button row — completely separate from video ── */}
                            <div className="bg-slate-900 flex items-center justify-center gap-3 px-4 py-3">
                              {!((kycMode === 'id' && idPreview) || (kycMode === 'selfie' && selfiePreview)) ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl backdrop-blur-md transition-all font-semibold"
                                  >
                                    <ImageIcon className="w-4 h-4 mr-2" /> Upload ID
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={capturePhoto}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/40 transition-all active:scale-95 font-semibold"
                                  >
                                    <Camera className="w-4 h-4 mr-2" /> Capture
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (kycMode === 'id') setIdPreview(null);
                                      else setSelfiePreview(null);
                                      startCamera();
                                    }}
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl backdrop-blur-md transition-all font-semibold"
                                  >
                                    <RefreshCw className="w-4 h-4 mr-2" /> Retake
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      if (kycMode === 'id') setIdUploaded(true);
                                      else setSelfieUploaded(true);
                                      setKycMode('none');
                                    }}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/40 transition-all font-semibold"
                                  >
                                    <Check className="w-4 h-4 mr-2" /> Confirm
                                  </Button>
                                </>
                              )}
                            </div>

                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                            <canvas ref={canvasRef} className="hidden" />
                          </motion.div>
                        )}

                        {(idUploaded || selfieUploaded) && kycMode === 'none' && (
                          <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider animate-in fade-in slide-in-from-left-2 duration-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-sm shadow-emerald-200" />
                            <p>Admin will review your identity once submitted.</p>
                          </div>
                        )}

                        {kycMode === 'none' && (
                          <>
                            <div className="grid grid-cols-1 gap-3">
                              <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2">
                                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valid IDs Accepted</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                  {['PhilID (National ID)', 'Passport', "Driver's License", 'UMID', 'Postal ID', 'PRC ID', 'Voter\'s ID', 'SSS / GSIS'].map(id => (
                                    <div key={id} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold">
                                      <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                      {id}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id="privacy"
                                    checked={agreedPrivacy}
                                    onCheckedChange={(checked) => setAgreedPrivacy(checked as boolean)}
                                    className="mt-0.5 size-4 border-emerald-200 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 shadow-sm"
                                  />
                                  <Label htmlFor="privacy" className="text-[11px] text-slate-600 font-bold leading-relaxed cursor-pointer select-none">
                                    I recognize and agree to the <span className="text-emerald-700 font-extrabold underline decoration-emerald-200 underline-offset-2">Philippine Data Privacy Act of 2012</span>.
                                  </Label>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-4 pt-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Button
                                  variant="outline"
                                  className="h-11 rounded-xl border-slate-200 text-sm font-bold shadow-sm hover:bg-slate-50"
                                  onClick={() => setStep(3)}
                                >
                                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                </Button>
                                <Button
                                  className="h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
                                  onClick={handleComplete}
                                  disabled={!idUploaded || !selfieUploaded || isCompleting}
                                >
                                  {isCompleting ? (
                                    <>
                                      <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                                      Finishing...
                                    </>
                                  ) : (
                                    'Complete Registration'
                                  )}
                                </Button>
                              </div>
                              <div className="text-center">
                                <button
                                  type="button"
                                  onClick={handleComplete}
                                  disabled={isCompleting}
                                  className={cn(
                                    "text-[11px] font-bold text-slate-400 hover:text-emerald-700 transition-all underline decoration-slate-200 hover:decoration-emerald-500/50",
                                    isCompleting && "opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  {isCompleting ? 'Creating account...' : "Skip for now. I'll verify later in my Profile Settings"}
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="text-center text-sm text-slate-500 font-medium mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 transition-all hover:underline">
                      Sign in
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      
      <div className="relative hidden lg:block overflow-hidden bg-slate-50">
        <img
          src={loginImg}
          alt="Junta Community"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-16 left-16 right-16 text-white z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-50 text-[10px] font-bold uppercase tracking-widest">
              <CheckCircle className="size-3" /> Join the movement
            </div>
            <h2 className="text-5xl font-bold leading-[1.1]">The Planet <br />Needs You.</h2>
            <p className="text-emerald-50/80 text-lg font-medium max-w-md leading-relaxed">Become an organizer or a volunteer today and help build a sustainable future for our community.</p>
            
            <div className="flex gap-8 pt-4">
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold">12K+</span>
                <span className="text-[10px] font-bold text-emerald-50/60 uppercase tracking-widest">Volunteers</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold">450+</span>
                <span className="text-[10px] font-bold text-emerald-50/60 uppercase tracking-widest">Events</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold">98%</span>
                <span className="text-[10px] font-bold text-emerald-50/60 uppercase tracking-widest">Impact Rate</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
