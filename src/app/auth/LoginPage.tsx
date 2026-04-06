import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { Separator } from '../../components/ui/separator';
import { Leaf, Mail, Lock, Eye, EyeOff, ShieldCheck, Briefcase, Users as UsersIcon } from 'lucide-react';
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
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
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

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-brand font-bold text-4xl text-foreground tracking-tight">
              Junta
            </span>
          </Link>
        </div>

        <Card className="rounded-2xl shadow-sm border">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-heading font-semibold text-2xl">
              Welcome back
            </CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10" />

                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10" />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">

                    {showPassword ?
                      <EyeOff className="w-4 h-4" /> :

                      <Eye className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 h-11">

                Sign In
              </Button>
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-11"
                onClick={() => navigate('/app/dashboard')}>

                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />

                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />

                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />

                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />

                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="h-11"
                onClick={() => navigate('/app/dashboard')}>

                <svg
                  className="w-4 h-4 mr-2"
                  fill="#1877F2"
                  viewBox="0 0 24 24">

                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-4">
                Quick Login (Demo Accounts)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-700">Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('organizer')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-700">Organizer</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('participant')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <UsersIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-primary/80">User</span>
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>);

}
