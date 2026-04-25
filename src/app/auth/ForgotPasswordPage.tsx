import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, Info } from 'lucide-react';
import { AuthNavigation } from '@/components/auth/AuthNavigation';
import { sileo } from 'sileo';
import { API_BASE_URL } from '@/lib/api';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import loginImg from '@/assets/Junta-Login-Register.png';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset code');
      }

      sileo.success({
        title: 'Code Sent',
        description: data.devMode ? `Code (Dev): ${data.otp}` : 'A reset code has been sent to your email.',
        duration: 5000
      });
      setStep(2);
      setCountdown(60); // Start 60s countdown
    } catch (error) {
      sileo.error({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid reset code');
      }

      sileo.success({
        title: 'Code Verified',
        description: 'Please set your new password.',
      });
      setStep(3);
    } catch (error) {
      sileo.error({
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'The code you entered is incorrect',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) return;

    const isPassValid = newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword);
    if (!isPassValid) {
      sileo.error({ title: 'Secure Password Required', description: 'Password must meet all security requirements.' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      sileo.success({
        title: 'Success!',
        description: 'Your password has been reset. You can now log in.',
        duration: 3000
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      sileo.error({
        title: 'Reset Failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 relative overflow-hidden bg-white">
      <AuthNavigation />

      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[380px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">Reset Password</h1>
                <p className="text-sm text-slate-500 font-medium">
                  {step === 1 && "Enter your email to receive a reset code"}
                  {step === 2 && "Enter the 6-digit code sent to your email"}
                  {step === 3 && "Create a new secure password"}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleRequestOTP}
                    className="flex flex-col gap-6"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/30 focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Send Reset Code
                    </Button>

                    <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                  </motion.form>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={setOtp}
                        className="gap-2"
                      >
                        <InputOTPGroup className="gap-2">
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="w-12 h-14 text-xl font-bold rounded-xl border-slate-300 bg-white shadow-sm ring-offset-white focus-visible:ring-emerald-500"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button
                      onClick={handleVerifyOTP}
                      disabled={otp.length < 6 || isLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Verify Code
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => handleRequestOTP()}
                        disabled={countdown > 0 || isLoading}
                        className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        {countdown > 0 ? `Resend code in ${countdown}s` : "Resend Code"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.form
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleResetPassword}
                    className="flex flex-col gap-6"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/30 focus-visible:ring-emerald-500/10 focus-visible:border-emerald-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-emerald-700 shrink-0">
                          <Info className="w-3.5 h-3.5" />
                          Guide
                        </div>
                        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
                          {[
                            { label: '8+ chars', met: newPassword.length >= 8 },
                            { label: 'Uppercase', met: /[A-Z]/.test(newPassword) },
                            { label: 'Number', met: /[0-9]/.test(newPassword) },
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
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !newPassword}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-xl text-sm font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Update Password
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block overflow-hidden">
        <img
          src={loginImg}
          alt="Junta Auth"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white z-10">
          <h2 className="text-3xl font-bold mb-2">Secure Your Account</h2>
          <p className="text-emerald-50/80 text-sm font-medium max-w-md">We take your security seriously. Follow the steps to safely regain access to your dashboard.</p>
        </div>
      </div>
    </div>
  );
}
