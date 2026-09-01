import { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  BookOpen, 
  PhoneCall, 
  PackageCheck,
  X,
  SlidersHorizontal,
  DollarSign,
  Boxes,
  Database,
  Users,
  Send,
  FileText,
  MapPin,
  ShieldCheck,
  Lock,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { TOTAL_PAGES_IN_CATALOG } from '../data/products';
import { REAL_ALIMENTOS_LOGO } from '../data/brands';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPage: number | null;
  setSelectedPage: (page: number | null) => void;
  viewMode: 'grid' | 'pages';
  setViewMode: (mode: 'grid' | 'pages') => void;
}

export function Header({
  searchQuery,
  setSearchQuery,
  selectedPage,
  setSelectedPage,
  viewMode,
  setViewMode
}: HeaderProps) {
  const { 
    totalItemsCount, 
    totalEstimatedPrice, 
    setIsCartOpen,
    setIsRepPortalOpen,
    orders,
    selectedSalesRep,
    salesReps,
    setSelectedSalesRep,
    openCreateRepModal,
    openEditRepModal
  } = useCart();
  const { 
    setIsPriceManagerOpen, 
    setActiveManagerTab, 
    customPricesCount, 
    lowStockCount, 
    outOfStockCount 
  } = useProducts();
  const { 
    user, 
    isAdmin, 
    isSalesRep, 
    isClient, 
    openAuthModal, 
    logoutToClient 
  } = useAuth();
  
  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);
  const [isRepSelectorOpen, setIsRepSelectorOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Orders count filtered by current rep if logged in as rep, or total if admin
  const visibleOrders = isSalesRep
    ? orders.filter(o => o.salesRep.id === user.salesRepId)
    : orders;
  const pendingOrdersCount = visibleOrders.filter(o => o.status === 'aguardando_vendedor').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top micro bar with regional rep routing notice and Role Session indicator */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden sm:inline">Real Alimentos • Distribuição com atendimento regional e emissão direta de NF</span>
            <span className="sm:hidden">Real Alimentos • Catálogo Digital</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-100">
            {/* Quick Rep Switcher Chip for Client / Routing */}
            <div className="relative">
              <button
                onClick={() => setIsRepSelectorOpen(!isRepSelectorOpen)}
                className="bg-white/15 hover:bg-white/25 text-white px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                title="Vendedor atribuído à sua região"
              >
                <Users className="w-3 h-3 text-red-200" />
                <span>Vendedor: <strong>{selectedSalesRep.name}</strong></span>
              </button>

              {isRepSelectorOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
                  <div className="text-[11px] font-bold text-slate-500 uppercase px-2 py-1 border-b border-slate-100">
                    Selecione o Vendedor da sua Região:
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1">
                    {salesReps.map((rep) => (
                      <button
                        key={rep.id}
                        onClick={() => {
                          setSelectedSalesRep(rep);
                          setIsRepSelectorOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex flex-col transition-colors ${
                          selectedSalesRep.id === rep.id ? 'bg-red-50 text-red-700 font-bold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{rep.name}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">{rep.code}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">{rep.regionName}</span>
                      </button>
                    ))}
                  </div>

                  {isAdmin && (
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                      <button
                        onClick={() => {
                          setIsRepSelectorOpen(false);
                          openCreateRepModal();
                        }}
                        className="text-red-700 hover:text-red-800 font-bold hover:underline py-1 px-1 flex items-center gap-1 cursor-pointer"
                      >
                        + Cadastrar Vendedor
                      </button>
                      <button
                        onClick={() => {
                          setIsRepSelectorOpen(false);
                          setIsRepPortalOpen(true);
                        }}
                        className="text-slate-600 hover:text-slate-900 font-semibold hover:underline py-1 px-1 cursor-pointer"
                      >
                        Gerenciar Equipe →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Role Session Status Pill & Switcher */}
            <div className="relative">
              {isAdmin ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>Admin</span>
                </button>
              ) : isSalesRep ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-200" />
                  <span>{user.salesRepName?.split(' ')[0]} (Vendedor)</span>
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('sales_rep')}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                  title="Acesso restrito para Vendedores e Administrador"
                >
                  <Lock className="w-3 h-3 text-slate-300" />
                  <span>Área Restrita</span>
                </button>
              )}

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
                  <div className="p-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900">
                      {isAdmin ? '🛡️ Administrador Geral' : `💼 ${user.salesRepName}`}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {isAdmin ? 'Acesso total: alterar preços, estoque e fotos' : 'Acesso restrito aos seus pedidos'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      openAuthModal('admin');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 flex items-center gap-2 text-slate-700"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                    <span>Trocar Perfil / Entrar como Admin</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logoutToClient();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair (Modo Cliente)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              onClick={() => {
                setSearchQuery('');
                setSelectedPage(null);
                setViewMode('grid');
              }}
              className="cursor-pointer group flex items-center gap-2.5"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm border border-slate-200 group-hover:scale-105 group-hover:shadow-md transition-all overflow-hidden shrink-0">
                <img 
                  src={REAL_ALIMENTOS_LOGO} 
                  alt="Real Alimentos Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 font-serif">
                    Real Alimentos
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                    Catálogo
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
                  Distribuindo sabor e qualidade
                </p>
              </div>
            </div>
          </div>

          {/* Central Live Search Bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="main-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por produto, marca (Vigor, Xandô, Seara...), pág ou categoria..."
                className="w-full pl-10 pr-10 py-2 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-red-500 rounded-xl outline-none transition-all placeholder:text-slate-400 text-slate-900"
              />
              {searchQuery && (
                <button
                  id="clear-search-button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Sales Rep / Orders Portal Button (If client clicks, open login modal) */}
            <button
              id="open-rep-portal-btn"
              onClick={() => {
                if (isClient) {
                  openAuthModal('sales_rep');
                } else {
                  setIsRepPortalOpen(true);
                }
              }}
              className="relative px-3 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              title="Acessar Painel de Pedidos"
            >
              <Users className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">
                {isAdmin ? 'Painel Geral' : isSalesRep ? 'Meus Pedidos' : 'Área do Vendedor'}
              </span>
              <span className="sm:hidden">Pedidos</span>
              {pendingOrdersCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {/* Admin-only Price & Stock Management Button */}
            {isAdmin ? (
              <button
                id="open-stock-manager-btn"
                onClick={() => {
                  setActiveManagerTab('prices');
                  setIsPriceManagerOpen(true);
                }}
                className="relative px-3 py-2 text-xs font-bold rounded-xl bg-red-700 hover:bg-red-800 text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                title="Painel Administrador: Editar preços, fotos e estoque"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Painel Admin</span>
                <span className="sm:hidden">Admin</span>
                {(lowStockCount > 0 || outOfStockCount > 0) && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {lowStockCount + outOfStockCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                id="open-admin-login-btn"
                onClick={() => openAuthModal('admin')}
                className="px-2.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all flex items-center gap-1 cursor-pointer"
                title="Acesso exclusivo para administradores"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden lg:inline">Admin</span>
              </button>
            )}

            {/* View mode toggle (Grid vs Catalog Brochure Pages) */}
            <div className="hidden xl:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                id="view-grid-btn"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-red-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Produtos
              </button>
              <button
                id="view-pages-btn"
                onClick={() => setViewMode('pages')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'pages'
                    ? 'bg-white text-red-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Catálogo (1-55)
              </button>
            </div>

            {/* Quick Page Jump Selector */}
            <div className="relative">
              <button
                id="page-selector-btn"
                onClick={() => setIsPageMenuOpen(!isPageMenuOpen)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                  selectedPage !== null
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-red-600" />
                <span>{selectedPage ? `Pág. ${selectedPage}` : 'Páginas'}</span>
              </button>

              {isPageMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Ir para página do catálogo:</span>
                    {selectedPage && (
                      <button 
                        onClick={() => { setSelectedPage(null); setIsPageMenuOpen(false); }}
                        className="text-[11px] text-red-600 hover:underline font-semibold"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto p-1">
                    {Array.from({ length: TOTAL_PAGES_IN_CATALOG }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => {
                          setSelectedPage(selectedPage === pg ? null : pg);
                          setIsPageMenuOpen(false);
                        }}
                        className={`h-7 rounded text-xs font-medium transition-all ${
                          selectedPage === pg
                            ? 'bg-red-600 text-white font-bold'
                            : 'bg-slate-100 hover:bg-red-100 text-slate-700'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Trigger Button */}
            <button
              id="open-cart-button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Pedido</span>
              {totalItemsCount > 0 && (
                <span className="bg-white text-red-700 text-[11px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-xs">
                  {totalItemsCount}
                </span>
              )}
              {totalEstimatedPrice > 0 && (
                <span className="hidden 2xl:inline border-l border-red-500/60 pl-2 text-red-100 font-normal text-xs">
                  {totalEstimatedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produtos, marcas, páginas..."
              className="w-full pl-9 pr-9 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-red-500 text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

