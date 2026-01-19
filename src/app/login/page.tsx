"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Image from 'next/image';

// List of valid email providers for Indonesia
const VALID_EMAIL_PROVIDERS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
  'icloud.com', 'ymail.com', 'rocketmail.com',
  // Indonesia-specific providers
  'plasa.com', 'telkom.net', 'indo.net.id', 'cbn.net.id',
  'rad.net.id', 'centrin.net.id', 'klikbca.com', 'bni.co.id',
  'mandiri.co.id', 'bri.co.id'
];

// Blocked domains (examples, testing, etc)
const BLOCKED_DOMAINS = [
  'example.com', 'test.com', 'demo.com', 'fake.com',
  'temp.com', 'throwaway.email', '10minutemail.com',
  'guerrillamail.com', 'mailinator.com', 'yopmail.com'
];

function validateEmail(email: string): { isValid: boolean; message?: string } {
  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Format email tidak valid' };
  }

  const domain = email.toLowerCase().split('@')[1];

  // Check for blocked domains
  if (BLOCKED_DOMAINS.some(blocked => domain.includes(blocked))) {
    return { isValid: false, message: 'Domain email tidak diizinkan. Gunakan email pribadi yang valid.' };
  }

  // Check for valid providers
  const isValidProvider = VALID_EMAIL_PROVIDERS.some(provider => domain === provider);
  
  if (!isValidProvider) {
    return { 
      isValid: false, 
      message: 'Hanya email dari provider terpercaya yang diizinkan (Gmail, Yahoo, Outlook, dll)' 
    };
  }

  return { isValid: true };
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error when user starts typing
    if (emailError) {
      setEmailError('');
    }
    
    // Validate email on blur (when user leaves the field)
    if (value.includes('@')) {
      const validation = validateEmail(value);
      if (!validation.isValid) {
        setEmailError(validation.message || 'Email tidak valid');
      }
    }
  };

  const handleEmailBlur = () => {
    if (email) {
      const validation = validateEmail(email);
      if (!validation.isValid) {
        setEmailError(validation.message || 'Email tidak valid');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email before submission
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setEmailError(validation.message || 'Email tidak valid');
      toast.error(validation.message || 'Email tidak valid');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        const stored = localStorage.getItem('affiliate_user');
        const user = stored ? JSON.parse(stored) : null;
        
        if (user?.role === 'admin') {
          router.push('/admin');
        } else if (user?.status === 'approved') {
          router.push('/affiliator');
        } else {
          router.push('/waiting-approval');
        }
        
        toast.success('Selamat datang kembali!');
      } else {
        toast.error('Email atau password salah');
      }
    } catch {
      toast.error('Terjadi kesalahan');
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
          <Link href="/" className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-button">
            <Image width={100} height={100} src="/logo-white.png" alt="PE Skinpro" className="w-8 h-8" />
          </div>
            <span className="font-display font-bold text-2xl text-foreground">Affiliate</span>
          </Link>

          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Selamat datang kembali
          </h1>
          <p className="text-muted-foreground mb-8">
            Masukkan kredensial Anda untuk mengakses dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
<div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@gmail.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  className={`pl-10 h-12 ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                />
              </div>
              {emailError && (
                <p className="text-sm text-red-500 mt-1">{emailError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Gunakan email dari provider terpercaya: Gmail, Yahoo, Outlook, dll
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
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
                <span className="animate-pulse-soft">Masuk...</span>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Daftar sebagai Affiliator
            </Link>
          </p>
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
            Tingkatkan Penghasilan Anda
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Bergabunglah dengan program afiliasi kami dan dapatkan komisi dengan mempromosikan produk yang Anda sukai.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
