import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  RefreshCw,
  ChevronDown,
  FileText,
  Focus,
  Sun,
  ScanFace,
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  Check,
  Building2,
  Info,
  Ban,
  Cpu,
  Glasses
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
import loginImg from '@/assets/Junta-Login-Register.png';

export function RegisterPage() {
  const navigate = useNavigate();
  const { setRole, setUserName, setUid } = useAuth();
  const location = useLocation();
  const googleData = location.state as { email?: string; uid?: string; displayName?: string } | null;

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [kycStage, setKycStage] = useState<'selection' | 'capture'>('selection');
  const [webcamStep, setWebcamStep] = useState<'intro' | 'camera'>('intro');
  const [captureTarget, setCaptureTarget] = useState<'id-front' | 'id-back' | 'selfie'>('id-front');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('participant');
  const [openBarangay, setOpenBarangay] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logic to parse Google Name
  const getInitialNames = () => {
    if (!googleData?.displayName) return { first: '', last: '' };
    const parts = googleData.displayName.trim().split(' ');
    if (parts.length === 1) return { first: parts[0], last: '' };
    const last = parts.pop() || '';
    const first = parts.join(' ');
    return { first, last };
  };

  const initialNames = getInitialNames();

  const [formData, setFormData] = useState({
    firstName: initialNames.first,
    lastName: initialNames.last,
    suffix: '',
    phone: '+63',
    email: googleData?.email || '',
    password: '', // Empty by default, users should set one for fallback
    orgName: '',
    barangay: ''
  });

  useEffect(() => {
    // If coming from Google, stay on Step 1 so they can pick their role,
    // but show a friendly message.
    if (googleData?.email) {
      sileo.info({
        title: 'Google Connected',
        description: 'Please choose your role to continue.',
        duration: 3000
      });
    }
  }, [googleData]);

  const stepTitles = [
    'Choose Your Role',
    'Basic Information',
    'Email Verification',
    'Identity Check'
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
      // Pre-flight: enforce max 2MB per image (Face++ limit)
      const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
      const getBase64Size = (base64: string) => {
        const base64Data = base64.split(',')[1] || base64;
        return Math.ceil((base64Data.length * 3) / 4);
      };

      if (idPreview && getBase64Size(idPreview) > MAX_SIZE_BYTES) {
        sileo.error({ title: 'ID Front Too Large', description: 'The image must be under 2MB. Please retake it.' });
        setIsCompleting(false);
        return;
      }
      if (idBackPreview && getBase64Size(idBackPreview) > MAX_SIZE_BYTES) {
        sileo.error({ title: 'ID Back Too Large', description: 'The image must be under 2MB. Please retake it.' });
        setIsCompleting(false);
        return;
      }
      if (selfiePreview && getBase64Size(selfiePreview) > MAX_SIZE_BYTES) {
        sileo.error({ title: 'Selfie Too Large', description: 'The image must be under 2MB. Please retake it.' });
        setIsCompleting(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: selectedRole,
          idImage: idPreview,
          idBackImage: idBackPreview,
          selfieImage: selfiePreview
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

      const pipelineStatusMessages: Record<string, string> = {
        success: `Identity analysis complete — ${Math.round(data.verificationScore || 0)}% match.`,
        no_face_detected: 'Note: No face detected in selfie. Manual review required.',
        multiple_faces: 'Note: Multiple faces detected. Manual review required.',
        low_quality: 'Note: Selfie quality was low. Manual review required.',
        id_invalid: 'Note: ID could not be verified automatically. Manual review required.',
        api_error: 'Automated analysis error — manual review required.',
        api_keys_missing: 'Automated analysis unavailable — manual review required.',
      };

      const kycDesc = data.kycApiStatus ? pipelineStatusMessages[data.kycApiStatus] : 'Your account has been created successfully.';

      sileo.success({
        title: 'Welcome to Junta!',
        description: kycDesc,
        duration: 4000
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



  const handleStep2Continue = async () => {
    const { firstName, lastName, email, password, phone, barangay, orgName } = formData;

    // Strict Validation for fields with *
    if (!firstName.trim() || !lastName.trim()) {
      sileo.error({ title: 'Name Required', description: 'Please enter your first and last name.' });
      return;
    }
    
    if (!barangay) {
      sileo.error({ title: 'Location Required', description: 'Please select your barangay.' });
      return;
    }

    const phoneDigits = phone.slice(4).replace(/\s/g, '');
    if (phoneDigits.length < 10) {
      sileo.error({ title: 'Phone Required', description: 'Please enter a complete 10-digit mobile number.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      sileo.error({ title: 'Email Required', description: 'Please enter a valid email address.' });
      return;
    }

    // Password validation (Always required for fallback login)
    const isPassValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
    if (!isPassValid) {
      sileo.error({ 
        title: 'Secure Password Required', 
        description: googleData?.uid 
          ? 'Please set a password for email/password login fallback.' 
          : 'Password must meet all security requirements.' 
      });
      return;
    }

    if (selectedRole === 'organizer' && !orgName.trim()) {
      sileo.error({ title: 'Organization Required', description: 'Organizers must provide their organization name.' });
      return;
    }

    // If Google user, go to Step 3 but skip sending an actual OTP
    if (googleData?.uid) {
      setStep(3);
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
      const isId = captureTarget.startsWith('id');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: isId ? 'environment' : 'user', 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error('Webcam error:', err);
      sileo.error({ title: 'Camera Error', description: 'Could not access your camera. Please check permissions.' });
    }
  }, [captureTarget]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

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
    
    if (captureTarget === 'id-front') {
      setIdPreview(dataUrl);
      sileo.success({ title: 'Front Captured', description: 'Now scan the back of your ID.' });
      setCaptureTarget('id-back');
      setWebcamStep('intro');
      stopCamera();
    } else if (captureTarget === 'id-back') {
      setIdBackPreview(dataUrl);
      sileo.success({ title: 'Back Captured', description: 'ID scanning complete.' });
      setKycStage('selection');
      stopCamera();
    } else {
      setSelfiePreview(dataUrl);
      sileo.success({ title: 'Selfie Captured', description: 'Biometric verified.' });
      setKycStage('selection');
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      sileo.error({ title: 'File Too Large', description: 'Please upload an image smaller than 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (captureTarget === 'id-front') {
        setIdPreview(result);
        setCaptureTarget('id-back');
        setWebcamStep('intro');
      } else if (captureTarget === 'id-back') {
        setIdBackPreview(result);
        setKycStage('selection');
      } else {
        setSelfiePreview(result);
        setKycStage('selection');
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (kycStage === 'capture' && webcamStep === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [kycStage, webcamStep, startCamera, stopCamera]);



  return (
    <div className="grid min-h-screen lg:grid-cols-2 relative overflow-hidden bg-white">
      <AuthNavigation />

      <div className="flex flex-col gap-4 p-0 sm:p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full sm:max-w-[440px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="h-full sm:h-auto"
            >
              <Card className="rounded-none sm:rounded-[20px] shadow-none sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none sm:border border-slate-100 bg-white overflow-hidden min-h-screen sm:min-h-0">
                <CardHeader className="pb-2 pt-8 sm:pt-6 px-6 sm:px-8">
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
                  <CardTitle className="font-heading font-bold text-xl sm:text-2xl text-slate-900">
                    Step {step}: {stepTitles[step - 1]}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 font-medium mt-1">
                    {step === 1 && 'How would you like to use Junta?'}
                    {step === 2 && 'Create your Junta account'}
                    {step === 3 && 'Enter the 6-digit code sent to your email'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-6 sm:px-8 pb-8 pt-4">
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
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-5 relative group">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                              <Input
                                placeholder="First"
                                value={formData.firstName}
                                maxLength={30}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className={`pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/30 text-sm focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all`}
                              />
                            </div>
                            <div className="sm:col-span-4">
                              <Input
                                placeholder="Last"
                                value={formData.lastName}
                                maxLength={30}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="h-10 rounded-xl border-slate-200 bg-slate-50/30 text-sm focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all"
                              />
                            </div>
                            <div className="sm:col-span-3">
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
                              disabled={!!googleData?.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/30 text-sm focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all disabled:opacity-70"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[12px] font-bold text-slate-700 ml-1">
                            {googleData?.uid ? 'Backup Password (for direct login)' : 'Password'} <span className="text-red-500">*</span>
                          </Label>
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
                          {googleData?.uid && (
                            <p className="text-[10px] text-slate-400 px-1 font-medium leading-tight">
                              Set a password so you can still login even if Google is unavailable.
                            </p>
                          )}
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

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <Button
                            variant="outline"
                            className="w-full sm:flex-1 h-11 rounded-xl border-slate-200 text-sm font-bold shadow-sm"
                            onClick={() => setStep(1)}
                          >
                            <ArrowLeft className="mr-2 w-4 h-4" /> Back
                          </Button>
                          <Button
                            className="w-full sm:flex-1 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white h-11 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
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
                            {googleData?.uid ? (
                              <CheckCircle className="w-8 h-8 text-emerald-600" />
                            ) : (
                              <Mail className="w-7 h-7 text-emerald-600" />
                            )}
                          </div>
                        </div>

                        {googleData?.uid ? (
                          <div className="text-center space-y-4">
                            <div className="space-y-1">
                              <h3 className="text-lg font-bold text-slate-900">Identity Verified</h3>
                              <p className="text-sm font-medium text-slate-500">
                                Your email <span className="font-bold text-slate-900">{formData.email}</span> is verified via Google.
                              </p>
                            </div>
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 text-[11px] text-emerald-700 font-medium">
                              You have successfully linked your Google identity. No further email verification code is required.
                            </div>
                            <Button
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                              onClick={() => setStep(4)}
                            >
                              Continue to Final Step
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
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
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button
                                variant="outline"
                                className="w-full sm:flex-1 h-11 rounded-xl border-slate-200 text-sm font-bold shadow-sm"
                                onClick={() => setStep(2)}
                              >
                                <ArrowLeft className="mr-2 w-4 h-4" /> Back
                              </Button>
                              <Button
                                className="w-full sm:flex-1 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white h-11 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
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
                          </>
                        )}
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
                        {kycStage === 'selection' ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              <div
                                onClick={() => { setCaptureTarget('id-front'); setKycStage('capture'); setWebcamStep('intro'); }}
                                className={`border border-dashed rounded-xl p-5 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[130px] ${idPreview ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-500/40 hover:bg-emerald-50/30'}`}
                              >
                                {idPreview ? (
                                  <div className="relative w-full h-full flex flex-col items-center animate-in zoom-in-95">
                                    <img src={idPreview} alt="ID Preview" className="w-20 h-14 object-cover rounded-lg border-2 border-emerald-500/20 mb-2 shadow-sm" />
                                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Front Captured</p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 group-hover:border-emerald-300 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 flex items-center justify-center mb-3 transition-all">
                                      <Upload className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">ID Front</p>
                                    <p className="text-[10px] text-slate-500 font-medium mt-1 leading-tight">Front of ID</p>
                                  </>
                                )}
                              </div>

                              <div
                                onClick={() => { setCaptureTarget('id-back'); setKycStage('capture'); setWebcamStep('intro'); }}
                                className={`border border-dashed rounded-xl p-5 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[130px] ${idBackPreview ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-500/40 hover:bg-emerald-50/30'}`}
                              >
                                {idBackPreview ? (
                                  <div className="relative w-full h-full flex flex-col items-center animate-in zoom-in-95">
                                    <img src={idBackPreview} alt="ID Back Preview" className="w-20 h-14 object-cover rounded-lg border-2 border-emerald-500/20 mb-2 shadow-sm" />
                                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Back Captured</p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 group-hover:border-emerald-300 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 flex items-center justify-center mb-3 transition-all">
                                      <Upload className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">ID Back</p>
                                    <p className="text-[10px] text-slate-500 font-medium mt-1 leading-tight">Reverse side</p>
                                  </>
                                )}
                              </div>

                              <div
                                onClick={() => { setCaptureTarget('selfie'); setKycStage('capture'); setWebcamStep('intro'); }}
                                className={`border border-dashed rounded-xl p-5 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[130px] sm:col-span-2 md:col-span-1 ${selfiePreview ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-500/40 hover:bg-emerald-50/30'}`}
                              >
                                {selfiePreview ? (
                                  <div className="relative w-full h-full flex flex-col items-center animate-in zoom-in-95">
                                    <img src={selfiePreview} alt="Selfie Preview" className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 mb-2 shadow-md" />
                                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Selfie Taken</p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 group-hover:border-emerald-300 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 flex items-center justify-center mb-3 transition-all">
                                      <Camera className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">Take Selfie</p>
                                    <p className="text-[10px] text-slate-500 font-medium mt-1 leading-tight">Biometric check</p>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                      <FileText className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Valid IDs Accepted</h4>
                                  </div>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {['PhilID (National ID)', 'Passport', "Driver's License", 'UMID', 'Postal ID', 'PRC ID', 'Voter\'s ID', 'SSS / GSIS'].map(id => (
                                      <div key={id} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        {id}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
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

                                <div className="flex flex-col gap-3 pt-2">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Button
                                      variant="outline"
                                      className="h-10 rounded-xl border-slate-200 text-sm font-bold shadow-sm hover:bg-slate-50"
                                      onClick={() => setStep(3)}
                                    >
                                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                    </Button>
                                    <Button
                                      className="h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
                                      onClick={handleComplete}
                                      disabled={!idPreview || !selfiePreview || !agreedPrivacy || isCompleting}
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
                                      onClick={handleComplete}
                                      disabled={isCompleting}
                                      className="text-[10px] font-bold text-slate-400 hover:text-emerald-700 uppercase tracking-widest hover:underline"
                                    >
                                      Skip for now, I'll verify later
                                    </button>
                                  </div>
                                </div>
                          </div>
                        ) : (
                          <motion.div
                            key="capture-flow"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-2xl flex flex-col min-h-[500px]"
                          >
                            {/* Premium Header */}
                            <div className="bg-white border-b border-slate-50 p-5 flex items-center justify-between">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em]">
                                    {captureTarget === 'selfie' ? 'Final Step' : captureTarget === 'id-front' ? 'Step 1 of 3' : 'Step 2 of 3'}
                                  </span>
                                </div>
                                <h3 className="text-slate-900 font-black text-sm uppercase tracking-tight">
                                  {captureTarget === 'id-front' ? 'Identity Front' : captureTarget === 'id-back' ? 'Identity Back' : 'Face Verification'}
                                </h3>
                              </div>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => setKycStage('selection')}
                                className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            {webcamStep === 'intro' ? (
                              <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                                <div className="relative w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center shadow-inner">
                                  {captureTarget.startsWith('id') ? (
                                    <FileText className="w-10 h-10 text-emerald-600" />
                                  ) : (
                                    <ScanFace className="w-10 h-10 text-emerald-600" />
                                  )}
                                </div>

                                <div className="space-y-1.5 text-center max-w-[280px]">
                                  <h4 className="text-sm font-black text-slate-900 uppercase">
                                      {captureTarget.startsWith('id') ? 'Document Scan' : 'Biometric Scan'}
                                  </h4>
                                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                                    {captureTarget.startsWith('id') 
                                      ? 'Position your ID card within the frame and ensure all details are clearly visible.' 
                                      : 'Position your face within the frame. Ensure good lighting and a neutral expression.'}
                                  </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 w-full">
                                  {captureTarget.startsWith('id') ? (
                                    <>
                                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <Focus className="w-4 h-4 text-emerald-600" />
                                        <span className="text-[10px] font-bold text-slate-700">Clear Text</span>
                                      </div>
                                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <Sun className="w-4 h-4 text-emerald-600" />
                                        <span className="text-[10px] font-bold text-slate-700">No Glare</span>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="relative">
                                          <Ban className="w-4 h-4 text-slate-300 absolute -inset-0.5 opacity-50" />
                                          <User className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-700">No Hats</span>
                                      </div>
                                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="relative">
                                          <Ban className="w-4 h-4 text-slate-300 absolute -inset-0.5 opacity-50" />
                                          <Glasses className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-700">No Glasses</span>
                                      </div>
                                    </>
                                  )}
                                </div>

                                <div className="w-full space-y-4">
                                  <Button 
                                    onClick={() => setWebcamStep('camera')} 
                                    className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-slate-200"
                                  >
                                    Start Scanning
                                  </Button>
                                  
                                  {captureTarget === 'selfie' && (
                                    <div className="flex items-center justify-center gap-1.5 opacity-40">
                                      <Cpu className="w-3 h-3 text-slate-500" />
                                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Powered by Face++ biometric analysis</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="relative flex-1 bg-black overflow-hidden">
                                <video 
                                  ref={videoRef} 
                                  autoPlay 
                                  playsInline 
                                  className={`absolute inset-0 w-full h-full object-cover ${captureTarget === 'selfie' ? 'scale-x-[-1]' : ''}`}
                                />
                                
                                {/* Professional Vignette Overlay */}
                                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <defs>
                                      <mask id="verificationMaskReg">
                                        <rect x="0" y="0" width="100" height="100" fill="white" />
                                        {captureTarget.startsWith('id') ? (
                                          <rect x="7.5" y="27.5" width="85" height="45" rx="4" fill="black" />
                                        ) : (
                                          <ellipse cx="50" cy="45" rx="35" ry="42" fill="black" />
                                        )}
                                      </mask>
                                    </defs>
                                    <rect x="0" y="0" width="100" height="100" fill="rgba(0,0,0,0.8)" mask="url(#verificationMaskReg)" />
                                  </svg>

                                  {/* Guide Box/Circle (High Vis) */}
                                  {captureTarget.startsWith('id') ? (
                                    <div className="w-[85%] aspect-[1.6/1] border-2 border-dashed border-emerald-500/40 rounded-2xl relative">
                                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl" />
                                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl" />
                                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl" />
                                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-500 rounded-br-xl" />
                                    </div>
                                  ) : (
                                    <div className="w-[70%] aspect-[35/42] border-2 border-dashed border-emerald-500/40 rounded-[50%] relative">
                                      <div className="absolute inset-0 border border-white/20 rounded-[50%]" />
                                    </div>
                                  )}
                                </div>

                                {/* Controls */}
                                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center gap-6 pb-6 backdrop-blur-[2px]">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => setWebcamStep('intro')}
                                    className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20"
                                  >
                                    <ArrowLeft className="w-4 h-4" />
                                  </Button>
                                  
                                  <button 
                                    onClick={capturePhoto}
                                    className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center active:scale-95 transition-all"
                                  >
                                    <div className="w-12 h-12 rounded-full bg-white" />
                                  </button>

                                  <div className="w-10" /> {/* Spacer */}
                                </div>

                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="absolute bottom-4 right-4 text-[10px] font-bold text-white/60 hover:text-white uppercase tracking-widest"
                                >
                                  <ImageIcon className="w-3 h-3 mr-1.5" /> Upload
                                </Button>
                              </div>
                            )}
                          </motion.div>
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
