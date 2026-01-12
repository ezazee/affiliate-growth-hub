"use client";

import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { User, UserRole, UserStatus } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean; // Add loading state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Initialize loading state
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
          
          let parsedUser: User = sessionData.user;

          if (parsedUser._id && !parsedUser.id) {
            parsedUser.id = parsedUser._id.toString();
          }

          if (!parsedUser.referralCode || parsedUser.referralCode === '') {
            const response = await fetch(`/api/user/${parsedUser.id}`);
            if (response.ok) {
              const { user: freshUser } = await response.json();
              if (freshUser) {
                parsedUser = freshUser;
                const newSessionData = { user: freshUser, timestamp: new Date().getTime() };
                localStorage.setItem('affiliate_user_session', JSON.stringify(newSessionData));
              }
            }
          }

          setUser(parsedUser);

          // Handle redirects
          const publicPaths = ['/login', '/register', '/'];
          if (parsedUser.status === 'pending' && pathname !== '/waiting-approval' && !publicPaths.includes(pathname)) {
            router.push('/waiting-approval');
          } else if ((parsedUser.status === 'rejected' || parsedUser.status === 'suspended') && pathname !== '/account-status') {
            router.push(`/account-status?status=${parsedUser.status}`);
          } else if (parsedUser.status === 'approved') {
            if (pathname === '/login' || pathname === '/register' || pathname === '/waiting-approval' || pathname === '/account-status') {
              router.push(parsedUser.role === 'admin' ? '/admin' : '/affiliator');
            }
          }
        } else {
        }
      } catch (error) {
        console.error("AuthContext: Failed to load or refresh user from localStorage", error);
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { user: loggedInUser } = await response.json();
        if (loggedInUser._id && !loggedInUser.id) {
          loggedInUser.id = loggedInUser._id.toString();
        }
        
        const sessionData = {
            user: loggedInUser,
            timestamp: new Date().getTime(),
        };
        
        setUser(loggedInUser);
        localStorage.setItem('affiliate_user_session', JSON.stringify(sessionData));

        if (loggedInUser.status === 'pending') {
          router.push('/waiting-approval');
        } else if (loggedInUser.status === 'rejected' || loggedInUser.status === 'suspended') {
          router.push(`/account-status?status=${loggedInUser.status}`);
        } else if (loggedInUser.status === 'approved') {
          router.push(loggedInUser.role === 'admin' ? '/admin' : '/affiliator');
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone }),
      });

      if (response.ok) {
        const { user: registeredUser } = await response.json();
        if (registeredUser._id && !registeredUser.id) {
          registeredUser.id = registeredUser._id.toString();
        }

        const sessionData = {
            user: registeredUser,
            timestamp: new Date().getTime(),
        };

        setUser(registeredUser);
        localStorage.setItem('affiliate_user_session', JSON.stringify(sessionData));
        console.log('AuthContext: User registered:', registeredUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('AuthContext: Registration failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('AuthContext: Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('affiliate_user_session');
      setLoading(false);
      console.log('AuthContext: User logged out.');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading }}>
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
