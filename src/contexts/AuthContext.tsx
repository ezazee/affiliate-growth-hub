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
        const stored = localStorage.getItem('affiliate_user');
        if (stored) {
          let parsedUser: User = JSON.parse(stored);

          if (parsedUser._id && !parsedUser.id) {
            parsedUser.id = parsedUser._id.toString();
          }

          // If referralCode is missing, fetch the full user data from the server
          if (!parsedUser.referralCode && parsedUser.id) {
            console.log('AuthContext: User in localStorage is missing referralCode, fetching from server...');
            const response = await fetch(`/api/user/${parsedUser.id}`);
            if (response.ok) {
              const { user: freshUser } = await response.json();
              if (freshUser) {
                parsedUser = freshUser;
                localStorage.setItem('affiliate_user', JSON.stringify(freshUser));
                console.log('AuthContext: Fetched fresh user data with referralCode:', freshUser);
              }
            }
          }

          setUser(parsedUser);
          console.log('AuthContext: User data loaded:', parsedUser);

          // Handle redirects
          if (parsedUser.status === 'pending' && pathname !== '/waiting-approval') {
            router.push('/waiting-approval');
          } else if ((parsedUser.status === 'rejected' || parsedUser.status === 'suspended') && pathname !== '/account-status') {
            router.push(`/account-status?status=${parsedUser.status}`);
          } else if (parsedUser.status === 'approved') {
            if (pathname === '/login' || pathname === '/register' || pathname === '/waiting-approval' || pathname === '/account-status') {
              router.push(parsedUser.role === 'admin' ? '/admin' : '/affiliator');
            }
          }
        } else {
          console.log('AuthContext: No user data in localStorage.');
        }
      } catch (error) {
        console.error("AuthContext: Failed to load or refresh user from localStorage", error);
        localStorage.removeItem('affiliate_user');
        setUser(null);
      } finally {
        setLoading(false);
        console.log('AuthContext: Loading finished.');
      }
    };
    loadUserFromLocalStorage();
  }, [router, pathname]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true); // Set loading true on login attempt
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
        // Ensure 'id' is set from '_id' for consistency with User interface
        if (loggedInUser._id && !loggedInUser.id) {
          loggedInUser.id = loggedInUser._id.toString();
        }
        // Ensure 'id' is set from '_id' for consistency with User interface
        if (loggedInUser._id && !loggedInUser.id) {
          loggedInUser.id = loggedInUser._id.toString();
        }
        // Ensure 'id' is set from '_id' for consistency with User interface
        if (loggedInUser._id && !loggedInUser.id) {
          loggedInUser.id = loggedInUser._id.toString();
        }
        setUser(loggedInUser);
        localStorage.setItem('affiliate_user', JSON.stringify(loggedInUser));
        console.log('AuthContext: User logged in:', loggedInUser);

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
      setLoading(false); // Set loading to false after login attempt
    }
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string, phone: string): Promise<boolean> => {
    setLoading(true); // Set loading true on register attempt
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
        // Ensure 'id' is set from '_id' for consistency with User interface
        if (registeredUser._id && !registeredUser.id) {
          registeredUser.id = registeredUser._id.toString();
        }
        // Ensure 'id' is set from '_id' for consistency with User interface
        if (registeredUser._id && !registeredUser.id) {
          registeredUser.id = registeredUser._id.toString();
        }
        setUser(registeredUser);
        localStorage.setItem('affiliate_user', JSON.stringify(registeredUser));
        console.log('AuthContext: User registered:', registeredUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('AuthContext: Registration failed:', error);
      return false;
    } finally {
      setLoading(false); // Set loading to false after register attempt
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true); // Set loading true on logout attempt
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('AuthContext: Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('affiliate_user');
      setLoading(false); // Set loading to false after logout
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
