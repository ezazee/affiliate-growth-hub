"use client";

import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { User, UserRole, UserStatus } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: (shouldRedirect?: boolean) => void;
  loading: boolean; // Add loading state
  isLoggingOut: boolean; // Add logout loading state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const processUser = (user: any): User => {
  if (user && user._id) {
    user.id = user._id.toString();
  }
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Add logout loading state
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadUserFromLocalStorage = async () => {
      try {
        const stored = localStorage.getItem('affiliate_user_session');
        if (stored) {
          const sessionData = JSON.parse(stored);
          const oneDay = 24 * 60 * 60 * 1000;
          const isExpired = new Date().getTime() - sessionData.timestamp > oneDay;

          if (isExpired) {
            localStorage.removeItem('affiliate_user_session');
            setUser(null);
            return;
          }

          // Verify user session against the backend
          const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: sessionData.user._id }),
          });

          if (!verifyResponse.ok) {
            localStorage.removeItem('affiliate_user_session');
            setUser(null);
            return;
          }

          const verification = await verifyResponse.json();
          if (!verification.valid) {
            localStorage.removeItem('affiliate_user_session');
            setUser(null);
            return;
          }

          const parsedUser = processUser(sessionData.user);

          setUser(parsedUser);

          // Handle redirects
          const publicPaths = ['/login', '/register', '/', '/forgot-password', '/reset-password'];
          const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

          console.log('[AuthContext] Path:', pathname, 'Status:', parsedUser.status, 'IsPublic:', isPublicPath);

          if (parsedUser.status === 'pending' && pathname !== '/waiting-approval' && !isPublicPath) {
            console.log('[AuthContext] Redirecting pending user to /waiting-approval');
            router.push('/waiting-approval');
          } else if ((parsedUser.status === 'rejected' || parsedUser.status === 'suspended') && pathname !== '/account-status') {
            console.log('[AuthContext] Redirecting rejected/suspended user');
            router.push(`/account-status?status=${parsedUser.status}`);
          } else if (parsedUser.status === 'approved') {
            if (pathname === '/login' || pathname === '/register' || pathname === '/waiting-approval' || pathname === '/account-status') {
              console.log('[AuthContext] Redirecting approved user to dashboard');
              router.push(parsedUser.role === 'admin' ? '/admin' : '/affiliator');
            }
          }
        } else {
        }
      } catch (error) {

        localStorage.removeItem('affiliate_user_session');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUserFromLocalStorage();
  }, [router, pathname]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { user: loggedInUser } = await response.json();
        const processedUser = processUser(loggedInUser);

        const sessionData = {
          user: processedUser,
          timestamp: new Date().getTime(),
        };

        setUser(processedUser);
        localStorage.setItem('affiliate_user_session', JSON.stringify(sessionData));

        if (processedUser.status === 'pending') {
          router.push('/waiting-approval');
        } else if (processedUser.status === 'rejected' || processedUser.status === 'suspended') {
          router.push(`/account-status?status=${processedUser.status}`);
        } else if (processedUser.status === 'approved') {
          router.push(processedUser.role === 'admin' ? '/admin' : '/affiliator');
        }
        return true;
      }
      return false;
    } catch (error) {

      return false;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone }),
      });

      if (response.ok) {
        const { user: registeredUser } = await response.json();
        const processedUser = processUser(registeredUser);

        const sessionData = {
          user: processedUser,
          timestamp: new Date().getTime(),
        };

        setUser(processedUser);
        localStorage.setItem('affiliate_user_session', JSON.stringify(sessionData));

        return true;
      }
      return false;
    } catch (error) {

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (shouldRedirect = true) => {
    setIsLoggingOut(true);
    try {
      // Call logout API (for logging purposes)
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user state and local storage
      setUser(null);
      localStorage.removeItem('affiliate_user_session');
      setIsLoggingOut(false);

      if (shouldRedirect) {
        // Redirect to home page and refresh to clear any cached state
        window.location.href = '/';
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading, isLoggingOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
