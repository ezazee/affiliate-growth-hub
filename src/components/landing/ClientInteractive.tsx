"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Users, DollarSign, TrendingUp, CheckCircle, Star, Sparkles, Shield, Award, ChevronDown, LogOut, Instagram, MessageCircle, ShoppingBag, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface ClientInteractiveProps {
  whatsappNumber?: string;
  email?: string;
}

export default function ClientInteractive({ whatsappNumber, email }: ClientInteractiveProps) {
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper functions for formatting links
  const formatWhatsAppLink = (phone: string) => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('62') ? cleanPhone : `62${cleanPhone}`;
    return `https://wa.me/${formattedPhone}`;
  };

  const formatEmailLink = (email: string) => {
    return `mailto:${email}`;
  };

  return (
    <div className="relative">
      {/* User Menu */}
      <div className="fixed top-4 right-4 z-50">
        {isAuthenticated ? (
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-md border-white/20 shadow-lg"
                disabled={isLoggingOut}
              >
                {user?.name || 'User'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md border-white/20">
              <DropdownMenuItem asChild>
                <Link href="/affiliator/dashboard" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/affiliator/profile" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/affiliator/commissions" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Komisi & Penarikan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout} 
                disabled={isLoggingOut}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-2">
            <Button asChild size="sm" className="bg-white/90 backdrop-blur-md text-primary hover:bg-white/100 shadow-lg">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm" className="bg-primary/90 backdrop-blur-md hover:bg-primary shadow-lg">
              <Link href="/register">Daftar</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Contact and Social Links */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-40">
        {whatsappNumber && (
          <Button
            asChild
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white shadow-lg rounded-full w-12 h-12 p-0"
          >
            <Link href={formatWhatsAppLink(whatsappNumber)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
            </Link>
          </Button>
        )}
        {email && (
          <Button
            asChild
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg rounded-full w-12 h-12 p-0"
          >
            <Link href={formatEmailLink(email)}>
              <Globe className="h-5 w-5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}