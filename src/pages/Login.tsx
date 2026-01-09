import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        const stored = localStorage.getItem('affiliate_user');
        const user = stored ? JSON.parse(stored) : null;
        
        if (user?.role === 'admin') {
          navigate('/admin');
        } else if (user?.status === 'approved') {
          navigate('/affiliator');
        } else {
          navigate('/waiting-approval');
        }
        
        toast.success('Welcome back!');
      } else {
        toast.error('Invalid email or password');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-button">
              <span className="text-primary-foreground font-bold text-xl">A</span>
            </div>
            <span className="font-display font-bold text-2xl text-foreground">AffiliateHub</span>
          </Link>

          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground mb-8">
            Enter your credentials to access your dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="animate-pulse-soft">Signing in...</span>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Register as Affiliator
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 rounded-lg bg-secondary border border-border">
            <p className="text-sm font-medium text-foreground mb-2">Demo Credentials:</p>
            <p className="text-xs text-muted-foreground">Admin: admin@example.com / admin123</p>
            <p className="text-xs text-muted-foreground">Affiliator: john@example.com / john123</p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-primary-foreground"
        >
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
            <ArrowRight className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-display font-bold mb-4">
            Grow Your Income
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Join our affiliate program and earn commissions by promoting products you love.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
