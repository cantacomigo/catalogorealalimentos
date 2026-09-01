import React, { useState } from 'react';
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
  ShoppingBag
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
  const [adminError, setAdminError] = useState('');

  // Sales rep form
  const [selectedRepId, setSelectedRepId] = useState(salesReps[0]?.id || '');
  const [repPin, setRepPin] = useState('');
  const [repError, setRepError] = useState('');

  if (!authModalOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const success = loginAsAdmin(adminPassword.trim());
    if (success) {
      setAdminPassword('');
      setAuthModalOpen(false);
    } else {
      setAdminError('Senha incorreta! Dica padrão: admin123 ou real2026');
    }
  };

  const handleRepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRepError('');
    const rep = salesReps.find(r => r.id === selectedRepId);
    if (!rep) {
      setRepError('Selecione um vendedor');
      return;
    }

    const success = loginAsSalesRep(rep, repPin.trim());
    if (success) {
      setSelectedSalesRep(rep);
      setRepPin('');
      setAuthModalOpen(false);
    } else {
      setRepError(`PIN incorreto! Código do vendedor: ${rep.code}`);
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
              <h3 className="font-bold text-base text-white">Controle de Acesso</h3>
              <p className="text-xs text-slate-300">
                {user.role === 'client' ? 'Identifique-se para acessar áreas restritas' : `Conectado como: ${user.role === 'admin' ? 'Administrador' : user.salesRepName}`}
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
                  Selecione o seu Perfil de Representante
                </label>
                <select
                  value={selectedRepId}
                  onChange={(e) => setSelectedRepId(e.target.value)}
                  className="w-full text-sm font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                >
                  {salesReps.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.name} ({rep.regionName}) - Cód: {rep.code}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Cada representante visualiza estritamente os pedidos faturados em seu nome.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Código ou PIN do Vendedor
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Digite o código (ex: REP-01 ou 1234)"
                    value={repPin}
                    onChange={(e) => setRepPin(e.target.value)}
                    className="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900"
                  />
                </div>
              </div>

              {repError && (
                <div className="bg-red-50 text-red-700 border border-red-200 text-xs p-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
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
                <strong>Área Restrita da Diretoria / Matriz:</strong> Apenas administradores têm permissão para editar preços de produtos, fotos, estoque geral, criar novos representantes e gerenciar toda a operação.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Senha de Administrador
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    autoFocus
                    placeholder="Digite a senha mestra..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-all text-slate-900"
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[11px] text-slate-400">Senha padrão: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">admin123</code></span>
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
