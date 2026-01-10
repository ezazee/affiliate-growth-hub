"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ban, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientOnlyAccountStatus() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  useEffect(() => {
    // If no user or user is approved/pending, redirect them away
    if (!user || user.status === 'approved' || user.status === 'pending') {
      router.push('/'); // Or appropriate dashboard
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const statusMessage = {
    rejected: {
      icon: XCircle,
      title: 'Account Rejected',
      description: 'Unfortunately, your application for an affiliate account has been rejected. For more information, please contact our support team.',
      iconClass: 'text-destructive',
    },
    suspended: {
      icon: Ban,
      title: 'Account Suspended',
      description: 'Your affiliate account has been suspended. Please contact our support team to resolve this issue.',
      iconClass: 'text-orange-500',
    },
  }[status as string] || {
    icon: Ban,
    title: 'Access Denied',
    description: 'You do not have permission to access this page. If you believe this is an error, please contact support.',
    iconClass: 'text-muted-foreground',
  };

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
          className={`w-24 h-24 mx-auto mb-8 rounded-2xl bg-secondary flex items-center justify-center ${statusMessage.iconClass}/20`}
        >
          <statusMessage.icon className={`w-12 h-12 ${statusMessage.iconClass}`} />
        </motion.div>

        <h1 className="text-3xl font-display font-bold text-foreground mb-4">
          {statusMessage.title}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {statusMessage.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={handleLogout}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <Button asChild>
            <Link href="mailto:admin@example.com">Contact Support</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}