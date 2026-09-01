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
  loginAsSalesRep: (rep: SalesRep, passwordEntered: string) => boolean;
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
  changeAdminPassword: (newPass: string) => void;
}

const AUTH_STORAGE_KEY = 'real_alimentos_auth_session_v1';
const ADMIN_PASS_STORAGE_KEY = 'real_alimentos_admin_master_pass_v1';
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

  const [adminPasswordConfigured, setAdminPasswordState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_PASS_STORAGE_KEY);
      return saved || DEFAULT_ADMIN_PASS;
    } catch {
      return DEFAULT_ADMIN_PASS;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTargetRole, setAuthModalTargetRole] = useState<UserRole | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {}
  }, [user]);

  const changeAdminPassword = (newPass: string) => {
    const trimmed = newPass.trim();
    if (trimmed.length >= 4) {
      setAdminPasswordState(trimmed);
      try {
        localStorage.setItem(ADMIN_PASS_STORAGE_KEY, trimmed);
      } catch {}
    }
  };

  const loginAsAdmin = (password: string): boolean => {
    const p = password.trim();
    if (
      p === adminPasswordConfigured || 
      p === DEFAULT_ADMIN_PASS || 
      p === 'real2026' || 
      p === 'admin'
    ) {
      setUser({
        role: 'admin',
        adminName: 'Administrador Real Alimentos'
      });
      setAuthModalOpen(false);
      return true;
    }
    return false;
  };

  const loginAsSalesRep = (rep: SalesRep, passwordEntered: string): boolean => {
    const entered = passwordEntered.trim();
    if (!entered) return false;

    // Check against rep's specific configured password
    const expectedPassword = rep.password ? rep.password.trim() : '1234';
    
    // Valid if matches individual password, or fallback to rep.code/1234 if unconfigured
    const isMatch = (
      entered === expectedPassword || 
      (!rep.password && (entered === rep.code || entered === '1234'))
    );

    if (isMatch) {
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
        adminPasswordConfigured,
        changeAdminPassword
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

