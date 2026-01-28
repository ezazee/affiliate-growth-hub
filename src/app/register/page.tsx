"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
  Phone,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

import Image from "next/image";

import { validateEmail, validatePhone, validatePassword } from "@/lib/validation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const { register } = useAuth();
  const router = useRouter();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);

    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }


    if (value.includes('@')) {
      const validation = validateEmail(value);
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, email: validation.message || 'Email tidak valid' }));
      }
    }
  };

  const handleEmailBlur = () => {
    if (email) {
      const validation = validateEmail(email);
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, email: validation.message || 'Email tidak valid' }));
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    let value = e.target.value.replace(/\D/g, '');

    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }


    if (value) {
      let formatted = value;
      if (!value.startsWith('62')) {
        if (value.startsWith('0') && value.length > 1) {
          formatted = '62' + value.substring(1);
        } else if (!value.startsWith('0')) {
          formatted = '62' + value;
        }
      }
      setPhone(formatted);
    } else {
      setPhone('');
    }
  };

  const handlePhoneBlur = () => {
    if (phone) {
      const validation = validatePhone(phone);
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, phone: validation.message || 'Nomor telepon tidak valid' }));
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }


    if (value.length >= 6) {
      const validation = validatePassword(value);
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, password: validation.message || 'Password tidak valid' }));
      }
    }
  };

  const handlePasswordBlur = () => {
    if (password) {
      const validation = validatePassword(password);
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, password: validation.message || 'Password tidak valid' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      password: ''
    };


    if (!name.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi';
    }


    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message || 'Email tidak valid';
    }


    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.message || 'Nomor telepon tidak valid';
    }


    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message || 'Password tidak valid';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.phone && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (!validateForm()) {
      toast.error('Periksa kembali form Anda');
      return;
    }

    setIsLoading(true);

    try {

      const phoneValidation = validatePhone(phone);
      const formattedPhone = phoneValidation.formatted || phone;

      const success = await register(name, email, password, formattedPhone);

      if (success) {
        toast.success("Pendaftaran berhasil!");
        router.push("/waiting-approval");
      } else {
        toast.error("Email sudah terdaftar");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    "Dapatkan komisi dari setiap penjualan",
    "Lacak penghasilan Anda secara real-time",
    "Dibayar setiap bulan",
    "Akses ke promosi eksklusif",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Benefits */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-primary-foreground max-w-md"
        >
          <h2 className="text-4xl font-display font-bold mb-6">
            Menjadi Affiliator
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Bergabunglah dengan ribuan affiliator sukses yang menghasilkan
            penghasilan pasif.
          </p>
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.li
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <CheckCircle className="w-6 h-6 text-accent" />
                <span className="text-lg">{benefit}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-button">
              <Image
                width={100}
                height={100}
                src="/logo-white.png"
                alt="PE Skinpro"
                className="w-8 h-8"
              />
            </div>
            <span className="font-display font-bold text-2xl text-foreground">
              PE Skinpro
            </span>
          </Link>

          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Buat akun Anda
          </h1>
          <p className="text-muted-foreground mb-8">
            Daftar untuk menjadi affiliator dan mulai menghasilkan
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={handleNameChange}
                  className={`pl-10 h-12 ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

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
                  className={`pl-10 h-12 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Gunakan email dari provider terpercaya: Gmail, Yahoo, Outlook, dll
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="628123456789"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  onKeyPress={(e) => {

                    const char = String.fromCharCode(e.which || e.keyCode);
                    if (!/[0-9]/.test(char)) {
                      e.preventDefault();
                    }
                  }}
                  className={`pl-10 h-12 ${errors.phone ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Nomor akan otomatis diformat dengan prefix 62
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter (huruf + angka)"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  className={`pl-10 pr-10 h-12 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Minimal 6 karakter, harus mengandung huruf dan angka
              </p>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-pulse-soft">Membuat akun...</span>
              ) : (
                <>
                  Buat Akun
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Masuk
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
