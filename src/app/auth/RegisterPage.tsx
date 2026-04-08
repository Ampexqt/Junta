import { useState, useRef, useEffect } from 'react';
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
  Search
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/components/ui/utils';
import { useAuth } from '../../features/auth/AuthContext';
import type { UserRole } from '../../features/auth/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { setRole, setUserName } = useAuth();
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

  const handleComplete = () => {
    if (!agreedPrivacy) {
      sileo.info({
        title: 'Agreement Required',
        description: 'Agree to the Data Privacy Act to proceed.',
        duration: 3000
      });
      return;
    }
    setRole(selectedRole);
    const suffixValue = formData.suffix && formData.suffix !== 'none' ? ` ${formData.suffix}` : '';
    const fullName = `${formData.firstName} ${formData.lastName}${suffixValue}`;
    if (fullName.trim()) setUserName(fullName.trim());
    navigate('/app/dashboard');
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

  const inputClass = "h-9 rounded-lg border-gray-200 bg-white text-sm focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary";

  const barangays = [
    "Arena Blanco", "Ayala", "Baliwasan", "Baluno", "Boalan", "Bolong", "Buenavista", "Bunguiao", "Busay", "Cabaluay", "Cabatangan", "Cacao", "Calabasa", "Calarian", "Camino Nuevo", "Campo Islam", "Canelar", "Capisan", "Cawit", "Culianan", "Curuan", "Dita", "Divisoria", "Dulian (Upper Bunguiao)", "Guisao", "Guiwan", "Kasanyangan", "La Paz", "Labuan", "Lamisahan", "Landang Gua", "Landang Laum", "Lanzones", "Lapakan", "Latuan", "Licomo", "Limaong", "Limpapa", "Lubigan", "Lumayang", "Lumbangan", "Lunzuran", "Maasin", "Malagutay", "Mampang", "Manalipa", "Mangusu", "Manicahan", "Mariki", "Mercedes", "Muti", "Pamucutan", "Pangapuyan", "Panubigan", "Pasilmanta", "Pasobolong", "Pasonanca", "Patalon", "Putik", "Quiniput", "Recodo", "Rio Hondo", "Salaan", "San Jose Cawa‑Cawa", "San Jose Gusu", "San Ramon", "San Roque", "Sangali", "Santa Barbara", "Santa Catalina", "Santa Maria", "Santo Niño", "Tagasilay", "Taguiti", "Talabaan", "Talisayan", "Talon‑Talon", "Taluksangay", "Tetuan", "Tictapul", "Tigbalabag", "Tigtabon", "Tolosa", "Tugbungan", "Tulungatung", "Tumaga", "Tumalutab", "Tumitus", "Victoria", "Vitali", "Zambowood", "Zone I", "Zone II", "Zone III", "Zone IV"
  ];

  const handleStep2Continue = () => {
    const { firstName, lastName, email, password, phone, barangay, orgName } = formData;

    if (!firstName.trim() || !lastName.trim()) {
      sileo.error({
        title: 'Name Required',
        description: 'Please enter your first and last name.'
      });
      return;
    }

    if (!barangay) {
      sileo.error({
        title: 'Barangay Required',
        description: 'Please select your barangay.'
      });
      return;
    }

    if (phone.length < 16) {
      sileo.error({
        title: 'Invalid Phone',
        description: 'Please enter a valid 10-digit phone number.'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      sileo.error({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.'
      });
      return;
    }

    const isPassValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
    if (!isPassValid) {
      sileo.error({
        title: 'Weak Password',
        description: 'Password must meet all security requirements.'
      });
      return;
    }

    if (selectedRole === 'organizer' && !orgName.trim()) {
      sileo.error({
        title: 'Organization Required',
        description: 'Please enter your organization name.'
      });
      return;
    }

    setStep(3);
  };

  const startCamera = async () => {
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
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

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
  }, [kycMode]);

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex flex-col items-center justify-center px-4 py-6 relative">
      <Link
        to="/"
        className="absolute top-5 left-5 z-50 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center group-hover:border-primary/40 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <Card className="rounded-xl shadow-sm border border-gray-200 bg-white">
          <CardHeader className="pb-2 pt-5 px-6">
            <div className="flex items-center gap-1.5 mb-3">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-1.5 flex-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${s < step
                      ? 'bg-primary text-white'
                      : s === step
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-400'
                      }`}
                  >
                    {s < step ? <CheckCircle className="w-3 h-3" /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-[2px] rounded-full transition-colors ${s < step ? 'bg-primary' : 'bg-gray-100'}`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-[2px] mb-1 bg-gray-100 shrink-0" />
            <CardTitle className="font-heading font-bold text-base text-gray-900">
              Step {step}: {stepTitles[step - 1]}
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              {step === 1 && 'How would you like to use Junta?'}
              {step === 2 && 'Create your Junta account'}
              {step === 3 && 'Enter the 6-digit code sent to your email'}
              {step === 4 && 'Upload your documents for verification'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-5">
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
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setSelectedRole('participant')}
                      className={`relative p-4 rounded-lg border text-left transition-all ${selectedRole === 'participant'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {selectedRole === 'participant' && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${selectedRole === 'participant' ? 'bg-primary/10' : 'bg-gray-100'}`}>
                        <Users className={`w-5 h-5 ${selectedRole === 'participant' ? 'text-primary' : 'text-gray-400'}`} />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">Participant</p>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                        Join events, volunteer, and track your environmental impact with Junta.
                      </p>
                    </button>

                    <button
                      onClick={() => setSelectedRole('organizer')}
                      className={`relative p-4 rounded-lg border text-left transition-all ${selectedRole === 'organizer'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {selectedRole === 'organizer' && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${selectedRole === 'organizer' ? 'bg-primary/10' : 'bg-gray-100'}`}>
                        <Megaphone className={`w-5 h-5 ${selectedRole === 'organizer' ? 'text-primary' : 'text-gray-400'}`} />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">Organizer</p>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
                        Create and manage environmental events for the community.
                      </p>
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 border border-gray-100">
                    {selectedRole === 'participant' ? (
                      <p>
                        As a <span className="font-semibold text-gray-700">Participant</span>, you can discover events, join activities, track your hours, and build your environmental impact score.
                      </p>
                    ) : (
                      <p>
                        As an <span className="font-semibold text-gray-700">Organizer</span>, you get everything a participant has, plus the ability to create events, manage participants, and submit events for admin approval.
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary-hover h-10 rounded-lg text-sm font-semibold shadow-none"
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
                  className="space-y-2.5"
                >
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-600">Full Name <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-12 gap-1.5">
                      <div className="col-span-5 relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <Input
                          placeholder="First Name"
                          value={formData.firstName}
                          maxLength={30}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className={`pl-9 ${inputClass}`}
                        />
                      </div>
                      <div className="col-span-4">
                        <Input
                          placeholder="Last Name"
                          value={formData.lastName}
                          maxLength={30}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div className="col-span-3">
                        <Select value={formData.suffix} onValueChange={(val) => setFormData({ ...formData, suffix: val })}>
                          <SelectTrigger className="w-full h-9 rounded-lg border-gray-200 text-sm">
                            <SelectValue placeholder="Suffix" />
                          </SelectTrigger>
                          <SelectContent>
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

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500 ml-1">Barangay <span className="text-red-500">*</span></Label>
                    <Popover open={openBarangay} onOpenChange={setOpenBarangay}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openBarangay}
                          className={cn(
                            "w-full justify-between h-9 rounded-lg border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-none hover:bg-white focus:ring-1 focus:ring-primary/30",
                            !formData.barangay && "text-gray-400"
                          )}
                        >
                          <span className="truncate">
                            {formData.barangay || "Select barangay..."}
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl overflow-hidden border-gray-200/50 shadow-2xl backdrop-blur-md" align="start">
                        <Command className="w-full border-none">
                          <div className="flex items-center border-b border-gray-100 px-3">
                            <Search className="w-3.5 h-3.5 text-gray-400 mr-2" />
                            <CommandInput
                              placeholder="Search barangay..."
                              className="h-10 w-full bg-transparent border-none focus:ring-0 text-sm py-3 outline-none"
                            />
                          </div>
                          <CommandList className="max-h-[240px] w-full p-1 overflow-y-auto no-scrollbar">
                            <CommandEmpty className="py-6 text-sm text-gray-400">No barangay found.</CommandEmpty>
                            <CommandGroup>
                              {barangays.map((b) => (
                                <CommandItem
                                  key={b}
                                  value={b}
                                  onSelect={(val) => {
                                    setFormData({ ...formData, barangay: val });
                                    setOpenBarangay(false);
                                  }}
                                  className="text-sm py-2 px-3 rounded-md transition-all aria-selected:bg-primary/5 aria-selected:text-primary flex items-center justify-between cursor-pointer hover:bg-gray-50 group"
                                >
                                  <span className="flex items-center">
                                    <Check
                                      className={cn(
                                        "mr-2 h-3.5 w-3.5 text-primary transition-all",
                                        formData.barangay === b ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                      )}
                                    />
                                    {b}
                                  </span>
                                  {formData.barangay === b && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="reg-phone" className="text-xs font-semibold text-gray-600">Phone Number <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <Input
                          id="reg-phone"
                          type="tel"
                          placeholder="+63 9XX XXX XXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                          className={`pl-9 ${inputClass}`}
                          maxLength={16}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="reg-email" className="text-xs font-semibold text-gray-600">Email <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          maxLength={50}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`pl-9 ${inputClass}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-pass" className="text-xs font-semibold text-gray-600">Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <Input
                        id="reg-pass"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={formData.password}
                        maxLength={32}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                          setFormData({ ...formData, password: val });
                        }}
                        className={`pl-9 pr-9 ${inputClass}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {selectedRole === 'organizer' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1"
                    >
                      <Label className="text-xs font-semibold text-gray-600">Organization <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <Input
                          placeholder="Organization Name"
                          value={formData.orgName}
                          onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                          className={`pl-9 ${inputClass}`}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 px-0.5 leading-tight">
                        The name of the NGO, foundation, or environmental group you represent.
                      </p>
                    </motion.div>
                  )}

                  <div className="bg-gray-50 border border-gray-100 rounded-lg py-1.5 px-3 flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-primary shrink-0 mr-1">
                      <Info className="w-3 h-3" />
                      Guide
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                      {[
                        { label: '8+ chars', met: formData.password.length >= 8 },
                        { label: '1 Uppercase', met: /[A-Z]/.test(formData.password) },
                        { label: 'Numbers', met: /[0-9]/.test(formData.password) },
                      ].map((req, i) => (
                        <div key={i} className="flex items-center gap-1 whitespace-nowrap">
                          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${req.met ? 'bg-primary' : 'bg-gray-200'}`} />
                          <span className={`text-[9px] uppercase tracking-tight transition-colors ${req.met ? 'text-primary font-bold' : 'text-gray-400'}`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-0.5">
                    <Button
                      variant="outline"
                      className="flex-1 h-9 rounded-lg border-gray-200 text-sm font-medium shadow-none"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary-hover h-9 rounded-lg text-sm font-semibold shadow-none"
                      onClick={handleStep2Continue}
                    >
                      Continue <ArrowRight className="ml-2 w-4 h-4" />
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
                  className="space-y-5"
                >
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-500">
                    We sent a 6-digit code to{' '}
                    <span className="font-semibold text-gray-700">{formData.email || 'your email'}</span>
                  </p>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-center text-xs text-gray-400">
                    Didn't receive the code?{' '}
                    <button className="text-primary font-medium hover:underline">Resend</button>
                  </p>
                  <div className="flex gap-2.5">
                    <Button
                      variant="outline"
                      className="flex-1 h-10 rounded-lg border-gray-200 text-sm font-medium shadow-none"
                      onClick={() => setStep(2)}
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary-hover h-10 rounded-lg text-sm font-semibold shadow-none"
                      onClick={() => setStep(4)}
                    >
                      Verify <ArrowRight className="ml-2 w-4 h-4" />
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
                  className="space-y-3"
                >
                  {kycMode === 'none' ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div
                        onClick={() => setKycMode('id')}
                        className={`border border-dashed rounded-lg p-4 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[110px] ${idUploaded ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40 hover:bg-primary/5'}`}
                      >
                        {idPreview ? (
                          <div className="relative w-full h-full flex flex-col items-center">
                            <img src={idPreview} alt="ID Preview" className="w-16 h-12 object-cover rounded border border-primary/20 mb-1" />
                            <p className="text-[10px] font-bold text-primary">ID Captured</p>
                          </div>
                        ) : (
                          <>
                            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-2 transition-all ${idUploaded ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200 group-hover:border-primary/30 group-hover:bg-primary/10'}`}>
                              <Upload className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">Upload ID</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Valid government ID</p>
                          </>
                        )}
                      </div>

                      <div
                        onClick={() => setKycMode('selfie')}
                        className={`border border-dashed rounded-lg p-4 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[110px] ${selfieUploaded ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40 hover:bg-primary/5'}`}
                      >
                        {selfiePreview ? (
                          <div className="relative w-full h-full flex flex-col items-center">
                            <img src={selfiePreview} alt="Selfie Preview" className="w-12 h-12 rounded-full object-cover border-2 border-primary mb-1 shadow-sm" />
                            <p className="text-[10px] font-bold text-primary">Selfie Taken</p>
                          </div>
                        ) : (
                          <>
                            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-2 transition-all ${selfieUploaded ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200 group-hover:border-primary/30 group-hover:bg-primary/10'}`}>
                              <Camera className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">Take Selfie</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">Face recognition</p>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-900 rounded-xl overflow-hidden relative"
                    >
                      <div className="aspect-video relative bg-black flex items-center justify-center min-h-[220px]">
                        {!idPreview && kycMode === 'id' && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                            <div className="w-[80%] h-[60%] border-2 border-dashed border-primary/60 rounded-lg flex items-center justify-center">
                              <span className="bg-primary/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Align ID Here</span>
                            </div>
                          </div>
                        )}
                        {!selfiePreview && kycMode === 'selfie' && (
                          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                            <div className="w-[180px] h-[180px] border-2 border-dashed border-primary/60 rounded-full flex flex-col items-center justify-center">
                              <span className="bg-primary/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2">Align Face</span>
                            </div>
                          </div>
                        )}

                        {((kycMode === 'id' && idPreview) || (kycMode === 'selfie' && selfiePreview)) ? (
                          <img
                            src={kycMode === 'id' ? idPreview! : selfiePreview!}
                            className="w-full h-full object-contain"
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

                        <button
                          onClick={() => {
                            setKycMode('none');
                            stopCamera();
                          }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors z-20"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-3 px-4">
                          {!((kycMode === 'id' && idPreview) || (kycMode === 'selfie' && selfiePreview)) ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white/10 hover:bg-white/20 text-white border-white/10 rounded-full"
                              >
                                <ImageIcon className="w-4 h-4 mr-2" /> Upload
                              </Button>
                              <Button
                                size="sm"
                                onClick={capturePhoto}
                                className="bg-primary hover:bg-primary-hover text-white rounded-full px-6"
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
                                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-full"
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
                                className="bg-primary hover:bg-primary-hover text-white rounded-full px-8"
                              >
                                <Check className="w-4 h-4 mr-2" /> Confirm
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </motion.div>
                  )}

                  {(idUploaded || selfieUploaded) && kycMode === 'none' && (
                    <div className="flex items-center gap-2 px-1 text-[10px] text-gray-400 animate-in fade-in duration-500">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      <p>Admin will review your identity once documents are submitted.</p>
                    </div>
                  )}

                  {kycMode === 'none' && (
                    <>
                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="privacy"
                            checked={agreedPrivacy}
                            onCheckedChange={(checked) => setAgreedPrivacy(checked as boolean)}
                            className="mt-0.5 size-4 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <Label htmlFor="privacy" className="text-[11px] text-gray-500 leading-relaxed cursor-pointer select-none">
                            I recognize and agree to the <span className="text-primary font-semibold">Philippine Data Privacy Act of 2012</span>. Your information is encrypted and strictly used for identity verification purposes only.
                          </Label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5 pt-1">
                        <div className="grid grid-cols-2 gap-2.5">
                          <Button
                            variant="outline"
                            className="h-10 rounded-lg border-gray-200 text-sm font-medium shadow-none"
                            onClick={() => setStep(3)}
                          >
                            <ArrowLeft className="mr-2 w-4 h-4" /> Back
                          </Button>
                          <Button
                            className="h-10 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleComplete}
                            disabled={!idUploaded || !selfieUploaded}
                          >
                            Finish
                          </Button>
                        </div>
                        <p className="text-center">
                          <button
                            type="button"
                            onClick={handleComplete}
                            className="text-[11px] font-medium text-gray-400 hover:text-primary transition-colors underline underline-offset-4 decoration-gray-300 hover:decoration-primary/50"
                          >
                            Skip for now, I'll verify later in my profile settings
                          </button>
                        </p>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
