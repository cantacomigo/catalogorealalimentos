import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { RealAlimentosLogo } from './RealAlimentosLogo';
import { 
  Lock, 
  ShieldCheck, 
  UserCheck, 
  Users, 
  KeyRound, 
  X, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Eye,
  EyeOff
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authModalTargetRole, 
    loginAsAdmin, 
    loginAsSalesRep, 
    user,
    logoutToClient
  } = useAuth();
  const { salesReps, setSelectedSalesRep } = useCart();

  const [activeTab, setActiveTab] = useState<'admin' | 'sales_rep'>(
    authModalTargetRole === 'admin' ? 'admin' : 'sales_rep'
  );
  
  // Admin form
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Sales rep form
  const [selectedRepId, setSelectedRepId] = useState(salesReps[0]?.id || '');
  const [repPassword, setRepPassword] = useState('');
  const [showRepPass, setShowRepPass] = useState(false);
  const [repError, setRepError] = useState('');

  useEffect(() => {
    if ((!selectedRepId || !salesReps.some(r => r.id === selectedRepId)) && salesReps.length > 0) {
      setSelectedRepId(salesReps[0].id);
    }
  }, [salesReps, selectedRepId]);

  if (!authModalOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const success = loginAsAdmin(adminPassword.trim());
    if (success) {
      setAdminPassword('');
      setAuthModalOpen(false);
    } else {
      setAdminError('Senha incorreta! Verifique a senha com a administração.');
    }
  };

  const handleRepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRepError('');
    const rep = salesReps.find(r => r.id === selectedRepId);
    if (!rep) {
      setRepError('Selecione um vendedor.');
      return;
    }

    if (!repPassword.trim()) {
      setRepError('Digite a sua senha de acesso individual.');
      return;
    }

    const success = loginAsSalesRep(rep, repPassword.trim());
    if (success) {
      setSelectedSalesRep(rep);
      setRepPassword('');
      setAuthModalOpen(false);
    } else {
      setRepError('Senha incorreta para este vendedor. Solicite a redefinição à Administração caso tenha esquecido.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RealAlimentosLogo size="sm" variant="icon" theme="dark" />
            <div>
              <h3 className="font-bold text-base text-white">Controle de Acesso Restrito</h3>
              <p className="text-xs text-slate-300">
                {user.role === 'client' ? 'Identifique-se para acessar áreas restritas' : `Conectado como: ${user.role === 'admin' ? 'Administrador Geral' : user.salesRepName}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status bar if already logged */}
        {user.role !== 'client' && (
          <div className="bg-emerald-50 border-b border-emerald-100 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sessão ativa: {user.role === 'admin' ? 'Painel Administrador Geral' : `Vendedor: ${user.salesRepName}`}</span>
            </div>
            <button
              onClick={() => {
                logoutToClient();
                setAuthModalOpen(false);
              }}
              className="text-xs bg-white text-red-600 font-bold px-2.5 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
            >
              Sair (Modo Cliente)
            </button>
          </div>
        )}

        {/* Tabs: Admin vs Vendedor */}
        <div className="grid grid-cols-2 p-2 bg-slate-100 border-b border-slate-200 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('sales_rep');
              setAdminError('');
              setRepError('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'sales_rep'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Área do Vendedor</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setAdminError('');
              setRepError('');
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'admin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>Administrador</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {activeTab === 'sales_rep' ? (
            <form onSubmit={handleRepSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Selecione o Vendedor / Representante
                </label>
                <select
                  value={selectedRepId}
                  onChange={(e) => setSelectedRepId(e.target.value)}
                  className="w-full text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                >
                  {salesReps.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.name} ({rep.code}) - {rep.regionName.split('(')[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Senha Individual de Acesso
                  </label>
                  <span className="text-[11px] text-slate-400">Privada</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRepPass ? "text" : "password"}
                    placeholder="Digite sua senha cadastrada..."
                    value={repPassword}
                    onChange={(e) => setRepPassword(e.target.value)}
                    className="w-full text-sm pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepPass(!showRepPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title={showRepPass ? "Ocultar senha" : "Ver senha"}
                  >
                    {showRepPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  🔒 Somente o administrador da empresa pode cadastrar ou alterar a senha dos vendedores.
                </p>
              </div>

              {repError && (
                <div className="bg-red-50 text-red-700 border border-red-200 text-xs p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{repError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Acessar Painel do Vendedor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>Área da Diretoria & Administração Geral:</strong> Acesso restrito para alterar senhas de vendedores, gerenciar preços, estoque geral, faturamento e relatórios.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Senha Mestra do Administrador
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showAdminPass ? "text" : "password"}
                    autoFocus
                    placeholder="Digite a senha mestra..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full text-sm pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    title={showAdminPass ? "Ocultar senha" : "Ver senha"}
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {adminError && (
                <div className="bg-red-50 text-red-700 border border-red-200 text-xs p-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Entrar como Administrador</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer / Switch back to client view */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 text-center">
          <button
            type="button"
            onClick={() => {
              logoutToClient();
              setAuthModalOpen(false);
            }}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Permanecer como <strong>Cliente</strong> (Apenas visualização do cardápio e compras)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
