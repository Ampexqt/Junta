import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from
  '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator
} from
  '../../components/ui/input-otp';
import { Building2 } from 'lucide-react';
import { Checkbox } from '../../components/ui/checkbox/Checkbox';
import {
  User,
  Mail,
  Lock,
  Camera,
  Upload,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Users,
  Megaphone,
  Phone,
  Eye,
  EyeOff,
  Info
} from
  'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select/Select';
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
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    suffix: '',
    phone: '+63',
    email: '',
    password: '',
    orgName: ''
  });
  const stepTitles = [
    'Choose Your Role',
    'Basic Information',
    'OTP Verification',
    'Identity Verification'];

  const progress = step / 4 * 100;
  const slideVariants = {
    enter: {
      x: 30,
      opacity: 0
    },
    center: {
      x: 0,
      opacity: 1
    },
    exit: {
      x: -30,
      opacity: 0
    }
  };
  const handleComplete = () => {
    setRole(selectedRole);
    const fullName = `${form.firstName} ${form.lastName}${form.suffix ? ` ${form.suffix}` : ''}`;
    if (fullName.trim()) setUserName(fullName.trim());
    navigate('/app/dashboard');
  };

  const formatPhone = (value: string) => {
    // If user tries to delete the prefix, keep it
    if (value.length < 3) return '+63';

    // Get only the numeric part after +63
    let digits = value.slice(3).replace(/[^\d]/g, '');

    // Limit to 10 digits after +63
    digits = digits.slice(0, 10);

    // Construct the formatted string: +63 9XX XXX XXXX
    let formatted = '+63';
    if (digits.length > 0) {
      formatted += ' ' + digits.slice(0, 3);
    }
    if (digits.length > 3) {
      formatted += ' ' + digits.slice(3, 6);
    }
    if (digits.length > 6) {
      formatted += ' ' + digits.slice(6, 10);
    }
    return formatted;
  };
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center pt-4 md:pt-6 p-4 relative overflow-hidden">
      {/* Minimalist Back Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300 group"
      >
        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="hidden sm:inline">Back to Home</span>
      </Link>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.5
        }}
        className="w-full max-w-md relative z-10">


        <Card className="rounded-2xl shadow-sm border">
          <CardHeader className="pb-3 pt-4">
            <div className="flex items-center gap-2 mb-3 px-1">
              {[1, 2, 3, 4].map((s) =>
                <div key={s} className="flex items-center gap-1.5 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${s < step ? 'bg-primary text-white shadow-[0_0_10px_rgba(31,122,99,0.3)]' : s === step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                    {s < step ? <CheckCircle className="w-3.5 h-3.5" /> : s}
                  </div>
                  {s < 4 &&
                    <div
                      className={`flex-1 h-[3px] rounded-full transition-all duration-500 ${s < step ? 'bg-primary' : 'bg-border'}`} />
                  }
                </div>
              )}
            </div>
            <Progress value={progress} className="h-0.5 mb-1 bg-muted shrink-0" />
            <CardTitle className="font-heading font-semibold text-lg">
              Step {step}: {stepTitles[step - 1]}
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              {step === 1 && 'How would you like to request Junta?'}
              {step === 2 && 'Create your Junta account'}
              {step === 3 && 'Enter the 6-digit code sent to your email'}
              {step === 4 && 'Upload your documents for verification'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {/* Step 1: Role Selection */}
              {step === 1 &&
                <motion.div
                  key="step1"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.3
                  }}
                  className="space-y-4">

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedRole('participant')}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all ${selectedRole === 'participant' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30 hover:bg-muted/50'}`}>

                      {selectedRole === 'participant' &&
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="w-5 h-5 text-primary" />
                        </div>
                      }
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${selectedRole === 'participant' ? 'bg-primary/10' : 'bg-muted'}`}>

                        <Users
                          className={`w-6 h-6 ${selectedRole === 'participant' ? 'text-primary' : 'text-muted-foreground'}`} />

                      </div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Participant</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Join events, volunteer, and track your environmental impact with Junta.
                      </p>
                    </button>

                    <button
                      onClick={() => setSelectedRole('organizer')}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all ${selectedRole === 'organizer' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30 hover:bg-muted/50'}`}>

                      {selectedRole === 'organizer' &&
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="w-5 h-5 text-primary" />
                        </div>
                      }
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${selectedRole === 'organizer' ? 'bg-primary/10' : 'bg-muted'}`}>

                        <Megaphone
                          className={`w-6 h-6 ${selectedRole === 'organizer' ? 'text-primary' : 'text-muted-foreground'}`} />

                      </div>
                      <p className="font-heading font-semibold text-sm text-foreground">
                        Organizer
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Create and manage environmental events for the
                        community.
                      </p>
                    </button>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground">
                    {selectedRole === 'participant' ?
                      <p>
                        As a{' '}
                        <span className="font-medium text-foreground">
                          Participant
                        </span>
                        , you can discover events, join activities, track your
                        hours, and build your environmental impact score.
                      </p> :

                      <p>
                        As an{' '}
                        <span className="font-medium text-foreground">
                          Organizer
                        </span>
                        , you get everything a participant has, plus the ability
                        to create events, manage participants, and submit events
                        for admin approval.
                      </p>
                    }
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 h-11"
                    onClick={() => setStep(2)}>

                    Continue as{' '}
                    {selectedRole === 'participant' ?
                      'Participant' :
                      'Organizer'}{' '}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              }

              {/* Step 2: Basic Info */}
              {step === 2 &&
                <motion.div
                  key="step2"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.3
                  }}
                  className="space-y-4">

                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 space-y-2">
                      <Label>Full Name</Label>
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-5 relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="First Name"
                            value={form.firstName}
                            maxLength={30}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                        <div className="col-span-4">
                          <Input
                            placeholder="Last Name"
                            value={form.lastName}
                            maxLength={30}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                          />
                        </div>
                        <div className="col-span-3">
                          <Select
                            value={form.suffix}
                            onValueChange={(val) => setForm({ ...form, suffix: val })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Suffix" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-phone"
                        type="tel"
                        placeholder="+63 953 843 5067"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                        className="pl-10"
                        maxLength={16}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        maxLength={50}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-pass">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-pass"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={form.password}
                        maxLength={32}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                          setForm({ ...form, password: val });
                        }}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {selectedRole === 'organizer' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 pt-1"
                      >
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Organization Name"
                            value={form.orgName}
                            onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground px-1">
                          The name of the NGO, foundation, or environmental group you represent.
                        </p>
                      </motion.div>
                    )}

                    {/* Password Guide - Compact 1 Row */}
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-2 flex items-center justify-between gap-2 px-3">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-primary shrink-0 mr-2">
                        <Info className="w-3 h-3" />
                        Guide
                      </div>
                      <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide py-0.5">
                        {[
                          { label: '8+ alphanumeric', met: form.password.length >= 8 },
                          { label: '1 Uppercase', met: /[A-Z]/.test(form.password) },
                          { label: 'Numbers', met: /[0-9]/.test(form.password) },
                        ].map((req, i) => (
                          <div key={i} className="flex items-center gap-1.5 whitespace-nowrap">
                            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${req.met ? 'bg-primary shadow-[0_0_8px_rgba(31,122,99,0.5)]' : 'bg-muted'}`} />
                            <span className={`text-[9px] uppercase tracking-tight transition-colors ${req.met ? 'text-primary font-bold' : 'text-muted-foreground/50'}`}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-11"
                      onClick={() => setStep(1)}>

                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90 h-11"
                      onClick={() => setStep(3)}>

                      Continue <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              }

              {/* Step 3: OTP */}
              {step === 3 &&
                <motion.div
                  key="step3"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.3
                  }}
                  className="space-y-6">

                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    We sent a 6-digit code to{' '}
                    <span className="font-medium text-foreground">
                      {form.email || 'your email'}
                    </span>
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
                  <p className="text-center text-xs text-muted-foreground">
                    Didn't receive the code?{' '}
                    <button className="text-primary font-medium hover:underline">
                      Resend
                    </button>
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-11"
                      onClick={() => setStep(2)}>

                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90 h-11"
                      onClick={() => setStep(4)}>

                      Verify <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              }

              {/* Step 4: ID Upload */}
              {step === 4 &&
                <motion.div
                  key="step4"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.3
                  }}
                  className="space-y-4">

                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="border-2 border-dashed border-border rounded-2xl p-4 text-center hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group bg-muted/20 flex flex-col items-center justify-center min-h-[140px]">
                      <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center mb-3 group-hover:border-primary/30 group-hover:bg-primary/10 transition-all">
                        <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        Upload ID
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 px-2 leading-tight">
                        Valid government ID up to 5MB
                      </p>
                    </div>
                    <div className="border-2 border-dashed border-border rounded-2xl p-4 text-center hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group bg-muted/20 flex flex-col items-center justify-center min-h-[140px]">
                      <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center mb-3 group-hover:border-primary/30 group-hover:bg-primary/10 transition-all">
                        <Camera className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        Take Selfie
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 px-2 leading-tight">
                        For face recognition checks
                      </p>
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        id="privacy"
                        checked={agreedPrivacy}
                        onCheckedChange={setAgreedPrivacy}
                        className="mt-1 size-5 border-primary border-2 shadow-sm transition-all data-[checked]:bg-primary data-[checked]:border-primary"
                      />
                      <Label htmlFor="privacy" className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer select-none py-0.5">
                        I recognize and agree to the <span className="text-primary font-bold underline decoration-primary/30">Philippine Data Privacy Act of 2012</span>. Your information is encrypted and strictly used for identity verification purposes only.
                      </Label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-11 rounded-xl border-border text-sm font-medium"
                        onClick={() => setStep(3)}>
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                      </Button>
                      <Button
                        disabled={!agreedPrivacy}
                        className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm transition-all active:scale-95 disabled:grayscale"
                        onClick={handleComplete}>
                        Finish
                      </Button>
                    </div>
                    <p className="text-center">
                      <button
                        type="button"
                        onClick={handleComplete}
                        className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-all underline decoration-muted-foreground/30 hover:decoration-primary/50 underline-offset-4"
                      >
                        Skip for now, I'll verify later in my profile settings
                      </button>
                    </p>
                  </div>
                </motion.div>
              }
            </AnimatePresence>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline">

                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>);
}
