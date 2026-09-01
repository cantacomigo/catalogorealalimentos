import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SalesRep } from '../types';

export type UserRole = 'client' | 'sales_rep' | 'admin';

export interface AuthUser {
  role: UserRole;
  salesRepId?: string; // If logged in as a specific representative
  salesRepName?: string;
  adminName?: string;
}

interface AuthContextType {
  user: AuthUser;
  loginAsAdmin: (password: string) => boolean;
  loginAsSalesRep: (rep: SalesRep, pin?: string) => boolean;
  logoutToClient: () => void;
  isAdmin: boolean;
  isSalesRep: boolean;
  isClient: boolean;
  currentRepId: string | null;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTargetRole: UserRole | null;
  openAuthModal: (targetRole?: UserRole) => void;
  adminPasswordConfigured: string;
}

const AUTH_STORAGE_KEY = 'real_alimentos_auth_session_v1';
const DEFAULT_ADMIN_PASS = 'admin123'; // Default PIN for initial access

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return { role: 'client' };
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTargetRole, setAuthModalTargetRole] = useState<UserRole | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {}
  }, [user]);

  const loginAsAdmin = (password: string): boolean => {
    // Allows default password or custom admin pass
    if (password === DEFAULT_ADMIN_PASS || password === 'real2026' || password === 'admin') {
      setUser({
        role: 'admin',
        adminName: 'Administrador Real Alimentos'
      });
      setAuthModalOpen(false);
      return true;
    }
    return false;
  };

  const loginAsSalesRep = (rep: SalesRep, pin?: string): boolean => {
    // If rep has specific PIN/Code or direct verification
    if (!pin || pin === rep.code || pin === '1234' || pin === rep.phone.slice(-4)) {
      setUser({
        role: 'sales_rep',
        salesRepId: rep.id,
        salesRepName: rep.name
      });
      setAuthModalOpen(false);
      return true;
    }
    return false;
  };

  const logoutToClient = () => {
    setUser({ role: 'client' });
  };

  const openAuthModal = (targetRole: UserRole = 'sales_rep') => {
    setAuthModalTargetRole(targetRole);
    setAuthModalOpen(true);
  };

  const isAdmin = user.role === 'admin';
  const isSalesRep = user.role === 'sales_rep';
  const isClient = user.role === 'client';
  const currentRepId = isSalesRep ? (user.salesRepId || null) : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAsAdmin,
        loginAsSalesRep,
        logoutToClient,
        isAdmin,
        isSalesRep,
        isClient,
        currentRepId,
        authModalOpen,
        setAuthModalOpen,
        authModalTargetRole,
        openAuthModal,
        adminPasswordConfigured: DEFAULT_ADMIN_PASS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
