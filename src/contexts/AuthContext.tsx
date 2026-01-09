import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole, UserStatus } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - will be replaced with backend
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    status: 'approved',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'John Affiliator',
    email: 'john@example.com',
    password: 'john123',
    role: 'affiliator',
    status: 'approved',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'Pending User',
    email: 'pending@example.com',
    password: 'pending123',
    role: 'affiliator',
    status: 'pending',
    createdAt: new Date('2024-02-01'),
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('affiliate_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('affiliate_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    return false;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user exists
    if (mockUsers.some(u => u.email === email)) {
      return false;
    }
    
    const newUser: User = {
      id: String(mockUsers.length + 1),
      name,
      email,
      role: 'affiliator',
      status: 'pending',
      createdAt: new Date(),
    };
    
    mockUsers.push({ ...newUser, password });
    setUser(newUser);
    localStorage.setItem('affiliate_user', JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('affiliate_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
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
