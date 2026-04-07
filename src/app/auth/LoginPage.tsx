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
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ShieldCheck, Briefcase, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { setRole, setUserName } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('admin')) {
      setRole('admin');
      setUserName('Admin User');
    } else if (email.includes('organizer')) {
      setRole('organizer');
      setUserName('Juan Dela Cruz');
    } else {
      setRole('participant');
      setUserName('Eco Hero');
    }
    navigate('/app/dashboard');
  };

  const fillCredentials = (role: 'admin' | 'organizer' | 'participant') => {
    setEmail(`${role}@envirolink.com`);
    setPassword('password123');
  };

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
        className="w-full max-w-[400px] relative z-10"
      >
        <Card className="rounded-xl shadow-sm border border-gray-200 bg-white">
          <CardHeader className="text-center pt-6 pb-1 px-6">
            <CardTitle className="font-heading font-bold text-xl text-gray-900 tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="text-gray-500 text-[13px] mt-1">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-5 pt-4">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-gray-600">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-9 rounded-lg border-gray-200 bg-white text-sm focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-gray-600">Password</Label>
                  <a href="#" className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 h-9 rounded-lg border-gray-200 bg-white text-sm focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover active:bg-primary-active text-white h-9 rounded-lg text-sm font-semibold shadow-none transition-colors"
              >
                Sign In
              </Button>
            </form>

            <div className="relative my-4">
              <Separator className="bg-gray-100" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                or continue with
              </span>
            </div>

            <div className="w-full">
              <Button
                variant="outline"
                className="w-full h-9 rounded-lg border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium gap-2 shadow-none transition-all active:scale-[0.98]"
                onClick={() => navigate('/app/dashboard')}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </Button>
            </div>

            <div className="mt-4 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center mb-2.5">
                Quick Login (Demo Accounts)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'admin' as const, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', label: 'Admin' },
                  { role: 'organizer' as const, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', label: 'Organizer' },
                  { role: 'participant' as const, icon: UsersIcon, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10', label: 'User' }
                ].map((p) => (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => fillCredentials(p.role)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border ${p.border} ${p.bg} hover:opacity-80 active:scale-[0.97] transition-all`}
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center ${p.color}`}>
                      <p.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[10px] font-semibold ${p.color}`}>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
