import { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  BookOpen, 
  X,
  Users,
  ShieldCheck,
  Lock,
  LogOut,
  UserCheck,
  PlusCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { FIRST_CATALOG_PAGE, CATALOG_PAGES_WITH_PRODUCTS } from '../data/products';
import { RealAlimentosLogo } from './RealAlimentosLogo';

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
    openCreateRepModal
  } = useCart();
  const { 
    products,
    setIsPriceManagerOpen, 
    setActiveManagerTab, 
    openCreateProductModal,
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

  const visibleOrders = isSalesRep
    ? orders.filter(o => o.salesRep.id === user.salesRepId)
    : orders;
  const pendingOrdersCount = visibleOrders.filter(o => o.status === 'aguardando_vendedor').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Slim Top Utility Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="hidden sm:inline">Real Alimentos · Distribuição Atacadista e Food Service com emissão direta de NF</span>
            <span className="sm:hidden">Real Alimentos · Catálogo Digital</span>
          </div>

          <div className="flex items-center gap-2 text-slate-100">
            {/* Regional Sales Rep Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRepSelectorOpen(!isRepSelectorOpen)}
                className="bg-white/10 hover:bg-white/15 text-white px-2.5 py-0.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                title="Vendedor atribuído à sua região"
              >
                <Users className="w-3 h-3 text-blue-300" />
                <span>Representante: <strong className="font-semibold">{selectedSalesRep.name}</strong></span>
              </button>

              {isRepSelectorOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                  <div className="text-[11px] font-bold text-slate-500 uppercase px-2 py-1 border-b border-slate-100">
                    Representante da sua Região
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1">
                    {salesReps.map((rep) => (
                      <button
                        type="button"
                        key={rep.id}
                        onClick={() => {
                          setSelectedSalesRep(rep);
                          setIsRepSelectorOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex flex-col transition-colors cursor-pointer ${
                          selectedSalesRep.id === rep.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{rep.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{rep.code}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">{rep.regionName}</span>
                      </button>
                    ))}
                  </div>

                  {isAdmin && (
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsRepSelectorOpen(false);
                          openCreateRepModal();
                        }}
                        className="text-blue-700 hover:text-blue-800 font-bold hover:underline py-1 px-1 flex items-center gap-1 cursor-pointer"
                      >
                        + Novo Vendedor
                      </button>
                      <button
                        type="button"
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

            {/* Role Switcher */}
            <div className="relative">
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>Modo Admin</span>
                </button>
              ) : isSalesRep ? (
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-200" />
                  <span>{user.salesRepName?.split(' ')[0]} (Vendedor)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('sales_rep')}
                  className="bg-white/10 hover:bg-white/15 text-slate-200 font-medium text-[11px] px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                  title="Acesso para Vendedores e Administração"
                >
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Acesso Restrito</span>
                </button>
              )}

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                  <div className="p-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900">
                      {isAdmin ? 'Administrador Geral' : user.salesRepName}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {isAdmin ? 'Controle de catálogo, preços e estoque' : 'Painel de pedidos da sua carteira'}
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openCreateProductModal();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-emerald-50 text-emerald-700 font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>+ Cadastrar Novo Produto</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      openAuthModal('admin');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 flex items-center gap-2 text-slate-700 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Trocar Perfil de Acesso</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logoutToClient();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2 mt-1 cursor-pointer"
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

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Zone 1: Brand */}
          <div 
            onClick={() => {
              setSearchQuery('');
              setSelectedPage(null);
              setViewMode('grid');
            }}
            className="cursor-pointer shrink-0"
            title="Real Alimentos - Início"
          >
            <RealAlimentosLogo size="md" variant="full" showSubtitle={false} />
          </div>

          {/* Zone 2: Central Live Search & View Mode */}
          <div className="flex-1 max-w-xl hidden md:flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="main-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produto, marca (Vigor, Seara, Xandô...) ou página..."
                className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-100 hover:bg-slate-100/90 focus:bg-white border border-slate-200 focus:border-blue-600 rounded-xl outline-none transition-all placeholder:text-slate-400 text-slate-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  id="clear-search-button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View mode toggle */}
            <div className="hidden xl:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold shrink-0">
              <button
                type="button"
                id="view-grid-btn"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grade
              </button>
              <button
                type="button"
                id="view-pages-btn"
                onClick={() => setViewMode('pages')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  viewMode === 'pages'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Folhear</span>
              </button>
            </div>
          </div>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Page Selector */}
            <div className="relative">
              <button
                type="button"
                id="page-selector-btn"
                onClick={() => setIsPageMenuOpen(!isPageMenuOpen)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  selectedPage !== null
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>{selectedPage ? `Pág. ${selectedPage}` : 'Páginas'}</span>
              </button>

              {isPageMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Ir para página do catálogo:</span>
                    {selectedPage && (
                      <button 
                        type="button"
                        onClick={() => { setSelectedPage(null); setIsPageMenuOpen(false); }}
                        className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto p-1 tabular-nums">
                    {(products && products.length > 0
                      ? Array.from(new Set(products.map(p => p.pageNumber).filter((pg): pg is number => typeof pg === 'number' && pg >= FIRST_CATALOG_PAGE))).sort((a: number, b: number) => a - b)
                      : CATALOG_PAGES_WITH_PRODUCTS
                    ).map((pg: number) => (
                      <button
                        type="button"
                        key={pg}
                        onClick={() => {
                          setSelectedPage(selectedPage === pg ? null : pg);
                          setIsPageMenuOpen(false);
                        }}
                        className={`h-7 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          selectedPage === pg
                            ? 'bg-blue-700 text-white font-bold'
                            : 'bg-slate-100 hover:bg-blue-50 text-slate-700'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Direct Actions */}
            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => openCreateProductModal()}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
                  title="Cadastrar novo produto individual no catálogo"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">+ Novo Produto</span>
                  <span className="lg:hidden">+ Item</span>
                </button>

                <button
                  type="button"
                  id="open-stock-manager-btn"
                  onClick={() => {
                    setActiveManagerTab('prices');
                    setIsPriceManagerOpen(true);
                  }}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
                  title="Central de Gestão: Preços, Fotos e Estoque"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Gestão & Estoque</span>
                  <span className="sm:hidden">Gestão</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                id="open-admin-login-btn"
                onClick={() => openAuthModal('admin')}
                className="px-2.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                title="Acesso Administrativo"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden lg:inline">Admin</span>
              </button>
            )}

            {/* Orders Portal Button */}
            <button
              type="button"
              id="open-rep-portal-btn"
              onClick={() => {
                if (isClient) {
                  openAuthModal('sales_rep');
                } else {
                  setIsRepPortalOpen(true);
                }
              }}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Acessar Painel de Pedidos e Faturamento"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">
                {isAdmin ? 'Pedidos' : isSalesRep ? 'Meus Pedidos' : 'Vendedor'}
              </span>
              {pendingOrdersCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full tabular-nums">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              type="button"
              id="open-cart-button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap tabular-nums"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Pedido</span>
              {totalItemsCount > 0 && (
                <span className="bg-white text-blue-800 text-[11px] font-extrabold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                  {totalItemsCount}
                </span>
              )}
              {totalEstimatedPrice > 0 && (
                <span className="hidden 2xl:inline border-l border-blue-500 pl-2 text-blue-100 font-medium text-xs">
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
              className="w-full pl-9 pr-9 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-slate-900"
            />
            {searchQuery && (
              <button
                type="button"
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
