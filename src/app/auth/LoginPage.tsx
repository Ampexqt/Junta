import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { AuthNavigation } from '@/components/auth/AuthNavigation';
import { sileo } from 'sileo';
import { API_BASE_URL } from '@/lib/api';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import loginImg from '@/assets/Junta-Login-Register.png';


import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function LoginPage() {
  const navigate = useNavigate();
  const { setRole, setUserName, setUid } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewUserAlert, setShowNewUserAlert] = useState<{show: boolean, email: string, uid: string, displayName: string} | null>(null);

  useEffect(() => {
    // Auto-login check
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('user_role');
    if (token && userRole) {
      setIsLoading(true);
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 500);
      return;
    }

    // Pre-fill email if remembered
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 1. Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const fullName = `${userData.firstName} ${userData.lastName}`;
        
        // Exchange Firebase ID token for a Junta JWT (needed for protected API routes like /join)
        let juntaToken: string | null = null;
        try {
          const idToken = await user.getIdToken(true);
          const syncRes = await fetch(`${API_BASE_URL}/auth/google-sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            juntaToken = syncData.token;
          }
        } catch (syncErr) {
          console.warn('[Google Login] Failed to sync JWT, some features may be unavailable:', syncErr);
        }

        // Success! Set up session
        if (juntaToken) localStorage.setItem('token', juntaToken);
        localStorage.setItem('junta_user_uid', user.uid);
        localStorage.setItem('junta_user_name', fullName);
        localStorage.setItem('junta_user_role', userData.role);
        localStorage.setItem('junta_user_profile', JSON.stringify(userData));
        
        setRole(userData.role);
        setUserName(fullName);
        setUid(user.uid);

        sileo.success({
          title: 'Welcome Back',
          description: `Good to see you, ${userData.firstName}!`,
          duration: 2000
        });

        setTimeout(() => navigate('/app/dashboard'), 800);
      } else {
        // User is new! Show the alert
        setIsLoading(false);
        setShowNewUserAlert({ 
          show: true, 
          email: user.email || '', 
          uid: user.uid,
          displayName: user.displayName || ''
        });
        
        // We log them out of Firebase Auth for now so they don't count as "logged in" 
        // without a profile
        await signOut(auth);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Google Auth Error:', error);
      sileo.error({
        title: 'Authentication Failed',
        description: 'Could not connect to Google. Please try again.',
        duration: 3000
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      sileo.error({ 
        title: 'Missing Info', 
        description: 'Please enter both email and password',
        duration: 2000 
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Success! Standardize keys for immediate hydration
      const fullName = data.user.displayName || `${data.user.firstName} ${data.user.lastName}`;
      localStorage.setItem('token', data.token);
      localStorage.setItem('junta_user_uid', data.user.uid);
      localStorage.setItem('junta_user_name', fullName);
      localStorage.setItem('junta_user_role', data.user.role);
      localStorage.setItem('junta_user_profile', JSON.stringify(data.user));
      
      // Update Context
      setRole(data.user.role);
      setUserName(fullName);
      setUid(data.user.uid);

      // Remember me logic
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      sileo.success({
        title: 'Welcome Back',
        description: `Good to see you, ${data.user.displayName?.split(' ')[0] || data.user.firstName}!`,
        duration: 2000
      });

      // Brief delay for the animation to feel "intentional" and smooth
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 800);
      
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error instanceof Error ? error.message : 'Please check your credentials and try again.';
      sileo.error({
        title: 'Login Failed',
        description: errorMsg,
        duration: 2000
      });

    }
  };




  return (
    <div className="grid min-h-screen lg:grid-cols-2 relative overflow-hidden bg-white">
      <AuthNavigation />

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl"
            style={{ pointerEvents: 'all' }}
          >
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
              />
              
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="relative z-10 w-16 h-16 flex items-center justify-center"
              >
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-slate-100"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    className="text-primary"
                    initial={{ strokeDashoffset: 280 }}
                    animate={{ strokeDashoffset: [280, 100, 280] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </svg>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-8 flex flex-col items-center"
            >
              <h3 className="text-slate-900 font-bold text-lg tracking-tight">Authenticating</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Preparing your dashboard...</p>
            </motion.div>
          </motion.div>
        )}

        {showNewUserAlert?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-[400px] w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">👋</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Account Found</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                We've connected your Google account, but you don't have a **Junta** profile yet. Create one now to finish your setup and **set a backup password** for direct login.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate('/register', { 
                    state: { 
                      email: showNewUserAlert.email, 
                      uid: showNewUserAlert.uid,
                      displayName: showNewUserAlert.displayName
                    } 
                  })}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl"
                >
                  Yes, Create Profile
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowNewUserAlert(null)}
                  className="text-slate-400 font-bold hover:text-slate-600"
                >
                  Maybe Later
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[380px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left mb-2">
                  <h1 className="text-4xl font-bold tracking-tight text-slate-900">Welcome back</h1>
                  <p className="text-sm text-slate-500 font-medium">
                    Sign in to your account to continue
                  </p>
                </div>
                
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</FieldLabel>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        disabled={isLoading}
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/30 focus-visible:ring-primary/10 focus-visible:border-primary transition-all"
                      />
                    </div>
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</FieldLabel>
                      <Link to="/forgot-password" className="text-xs font-bold text-primary/80 hover:text-primary transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        disabled={isLoading}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 h-11 rounded-xl border-slate-200 bg-slate-50/30 focus-visible:ring-primary/10 focus-visible:border-primary transition-all"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        disabled={isLoading}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-transparent transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </Field>

                  <div className="flex items-center space-x-2 py-1">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe} 
                      disabled={isLoading}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="w-4 h-4 rounded border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label
                      htmlFor="remember"
                      className="text-xs font-semibold text-slate-500 cursor-pointer select-none"
                    >
                      Remember me for 7 days
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white h-12 rounded-xl text-sm font-bold shadow-[0_4px_20px_-4px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </FieldGroup>

                <FieldSeparator className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">OR CONTINUE WITH</FieldSeparator>

                <div className="grid gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isLoading}
                    className="h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 gap-3 shadow-sm transition-all active:scale-[0.98]"
                    onClick={handleGoogleLogin}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </Button>
                </div>

                <p className="text-center text-sm text-slate-500 font-medium">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-all">
                    Sign up for free
                  </Link>
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden">
        <img
          src={loginImg}
          alt="Junta Login"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-12 left-12 right-12 text-white z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-2">Empowering Communities</h2>
            <p className="text-emerald-50/80 text-sm font-medium max-w-md">Join thousands of volunteers making a real difference for our planet, one event at a time.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
