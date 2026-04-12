import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { AuthNavigation } from '@/components/auth/AuthNavigation';
import { sileo } from 'sileo';
import { API_BASE_URL } from '@/lib/api';


export function LoginPage() {
  const navigate = useNavigate();
  const { setRole, setUserName } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

      // Success!
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update Context
      setRole(data.user.role);
      setUserName(data.user.displayName);

      sileo.success({
        title: 'Welcome back!',
        description: `Successfully signed in as ${data.user.displayName}`,
        duration: 2000
      });


      navigate('/app/dashboard');
    } catch (error: any) {
      sileo.error({
        title: 'Login Failed',
        description: error.message || 'Please check your credentials and try again.',
        duration: 2000
      });

    }
  };




  return (
    <div className="min-h-screen w-full bg-slate-50/50 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <AuthNavigation />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[390px] relative z-10"
      >
        <Card className="rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 bg-white overflow-hidden">
          <CardHeader className="text-center pt-9 pb-1 px-8">
            <CardTitle className="font-heading font-bold text-[22px] text-slate-900 leading-tight tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="text-slate-500 text-[14px] mt-1.5 font-medium">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[12px] font-bold text-slate-700 ml-0.5">Email Address <span className="text-rose-500">*</span></Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10 rounded-[12px] border-slate-200 bg-slate-50/30 text-[14px] focus-visible:ring-2 focus-visible:ring-primary/10 focus-visible:border-primary transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-0.5">
                  <Label htmlFor="password" className="text-[12px] font-bold text-slate-700">Password <span className="text-rose-500">*</span></Label>
                  <a href="#" className="text-[12px] font-bold text-primary/80 hover:text-primary transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-10 rounded-[12px] border-slate-200 bg-slate-50/30 text-[14px] focus-visible:ring-2 focus-visible:ring-primary/10 focus-visible:border-primary transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover active:scale-[0.98] text-white h-10 rounded-[12px] text-[14px] font-bold shadow-lg shadow-primary/10 transition-all duration-200"
              >
                Sign In
              </Button>
            </form>

            <div className="relative my-5">
              <Separator className="bg-slate-100" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                OR
              </span>
            </div>

            <div className="w-full">
              <Button
                variant="outline"
                className="w-full h-10 rounded-[12px] border-slate-200 bg-white hover:bg-slate-50 text-[14px] font-bold text-slate-700 gap-2.5 shadow-sm transition-all active:scale-[0.98]"
                onClick={() => navigate('/app/dashboard')}
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </Button>
            </div>

            <p className="text-center text-[14px] text-slate-500 mt-7">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-bold hover:text-primary-hover transition-colors">
                Sign up free
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
