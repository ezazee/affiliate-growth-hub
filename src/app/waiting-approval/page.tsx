"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function WaitingApproval() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/user/${user.id}`);
        if (response.ok) {
          const { user: freshUser } = await response.json();
          if (freshUser && freshUser.status === 'approved') {
            toast.success("Akun Anda telah disetujui! Mengalihkan ke dasbor...");
            clearInterval(interval);
            
            // CRITICAL FIX: Update localStorage before reloading
            const newSessionData = { user: freshUser, timestamp: new Date().getTime() };
            localStorage.setItem('affiliate_user_session', JSON.stringify(newSessionData));
            
            // Reload the page, AuthContext will handle the redirect
            setTimeout(() => window.location.reload(), 1500);
          }
        }
      } catch (error) {
        console.error("Gagal memeriksa status persetujuan:", error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const steps = [
    { icon: CheckCircle, label: 'Account Created', completed: true },
    { icon: Clock, label: 'Under Review', completed: false, active: true },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg text-center"
      >
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-button">
            <span className="text-primary-foreground font-bold text-xl">A</span>
          </div>
          <span className="font-display font-bold text-2xl text-foreground">AffiliateHub</span>
        </Link>

        {/* Main Icon */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
          className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-accent/20 flex items-center justify-center"
        >
          <Clock className="w-12 h-12 text-accent" />
        </motion.div>

        <h1 className="text-3xl font-display font-bold text-foreground mb-4">
          Waiting for Approval
        </h1>
        <p className="text-muted-foreground mb-2 max-w-md mx-auto">
          Hi <span className="font-medium text-foreground">{user?.name || 'there'}</span>! 
          Your registration is being reviewed by our team. We'll notify you once your account is approved.
        </p>
        {user?.registrationNumber && (
          <p className="text-sm font-medium text-foreground mb-8">
            Your Registration Number: <span className="text-primary">{user.registrationNumber}</span>
          </p>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {steps.map((step, index) => (
            <React.Fragment key={step.label}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  step.completed 
                    ? 'bg-primary text-primary-foreground' 
                    : step.active 
                      ? 'bg-accent text-accent-foreground animate-pulse-soft' 
                      : 'bg-secondary text-muted-foreground'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <span className={`text-xs font-medium ${
                  step.completed || step.active ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </motion.div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mb-6 ${
                  step.completed ? 'bg-primary' : 'bg-border'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* New Contact Admin CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-8"
        >
          
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <a 
              href={`https://wa.me/6281313711180?text=${encodeURIComponent(
                `*Permintaan Registrasi Affiliate Baru*\nNama Lengkap: ${user?.name || 'N/A'}\nEmail: ${user?.email || 'N/A'}\nNo Handphone: ${user?.phone || 'N/A'}\nNomor Registrasi: ${user?.registrationNumber || 'N/A'}\nKode Referral: ${user?.referralCode || 'N/A'}\nMohon segera ditindaklanjuti. Terima kasih.`
              )}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Contact Admin on WhatsApp
            </a>
          </Button>
        </motion.div>

        {/* Info Card */}
        <div className="bg-card rounded-xl p-6 shadow-card border border-border mb-8">
          <h3 className="font-semibold text-foreground mb-2">What happens next?</h3>
          <p className="text-sm text-muted-foreground">
                      Our admin team typically reviews applications within 24-48 hours. 
                      Once approved, you'll be able to log in and start creating affiliate links.
                      If you have any questions, please contact an administrator.          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={handleLogout}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
