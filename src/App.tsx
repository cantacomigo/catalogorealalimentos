/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { CartProvider } from './context/CartContext';
import { ProductProvider, useProducts } from './context/ProductContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { BrandSelector } from './components/BrandSelector';
import { CategoryFilter } from './components/CategoryFilter';
import { FilterControls } from './components/FilterControls';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { PriceManagerModal } from './components/PriceManagerModal';
import { QuickEditModal } from './components/QuickEditModal';
import { CartDrawer } from './components/CartDrawer';
import { CatalogBrochureView } from './components/CatalogBrochureView';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { RepOrderPortalModal } from './components/RepOrderPortalModal';
import { SalesRepFormModal } from './components/SalesRepFormModal';
import { Toast } from './components/Toast';
import { filterAndSortProducts } from './data/products';
import { REAL_ALIMENTOS_LOGO } from './data/brands';
import { FilterState, BrandId } from './types';
import { 
  PackageSearch, 
  Phone, 
  Mail, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Clock, 
  MessageSquare,
  Sparkles,
  ArrowUp
} from 'lucide-react';

function CatalogApp() {
  const { products } = useProducts();

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedBrand: 'todas',
    selectedCategory: 'todas',
    selectedTemperature: 'todos',
    selectedPage: null,
    selectedTag: null,
    sortBy: 'relevance'
  });

  const [viewMode, setViewMode] = useState<'grid' | 'pages'>('grid');

  const stats = useMemo(() => {
    const brandCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const tempCounts: Record<string, number> = {};

    products.forEach(p => {
      brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      tempCounts[p.temperature] = (tempCounts[p.temperature] || 0) + 1;
    });

    return { brandCounts, categoryCounts, tempCounts };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(products, filters);
  }, [products, filters]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Bar */}
      <Header
        searchQuery={filters.searchQuery}
        setSearchQuery={(q) => setFilters(prev => ({ ...prev, searchQuery: q }))}
        selectedPage={filters.selectedPage}
        setSelectedPage={(page) => setFilters(prev => ({ ...prev, selectedPage: page }))}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Presentation */}
        <HeroBanner
          selectedBrand={filters.selectedBrand}
          setSelectedBrand={(b) => setFilters(prev => ({ ...prev, selectedBrand: b }))}
          setSelectedCategory={(c) => setFilters(prev => ({ ...prev, selectedCategory: c }))}
          totalProductsCount={products.length}
        />

        {/* Brand Selector Bar */}
        <BrandSelector
          selectedBrand={filters.selectedBrand}
          setSelectedBrand={(b: BrandId) => setFilters(prev => ({ ...prev, selectedBrand: b }))}
          brandCounts={stats.brandCounts}
        />

        {/* Categories Bar */}
        <CategoryFilter
          selectedCategory={filters.selectedCategory}
          setSelectedCategory={(c: string) => setFilters(prev => ({ ...prev, selectedCategory: c }))}
          categoryCounts={stats.categoryCounts}
        />

        {/* Filter & Sorting Controls */}
        <FilterControls
          filters={filters}
          setFilters={setFilters}
          totalMatches={filteredProducts.length}
          totalCatalogCount={products.length}
          tempCounts={stats.tempCounts}
        />

        {/* Content View: Grid or Brochure Page-by-Page */}
        {viewMode === 'pages' ? (
          <CatalogBrochureView
            products={products}
            selectedPage={filters.selectedPage}
            setSelectedPage={(page) => setFilters(prev => ({ ...prev, selectedPage: page }))}
          />
        ) : (
          <div>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <PackageSearch className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Nenhum produto encontrado
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                  Tente alterar seus termos de busca ou limpar os filtros de marca, categoria e temperatura aplicados.
                </p>
                <button
                  onClick={() => setFilters({
                    searchQuery: '',
                    selectedBrand: 'todas',
                    selectedCategory: 'todas',
                    selectedTemperature: 'todos',
                    selectedPage: null,
                    selectedTag: null,
                    sortBy: 'relevance'
                  })}
                  className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all"
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Back to Top Floating Button */}
      <div className="fixed bottom-6 left-6 z-30 hidden md:block">
        <button
          onClick={scrollToTop}
          className="p-3 rounded-2xl bg-white/90 hover:bg-white text-slate-700 hover:text-blue-700 shadow-lg border border-slate-200 transition-all hover:scale-105 active:scale-95"
          title="Voltar ao Topo"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
            
            {/* Column 1: Company Logo & Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden shrink-0">
                  <img 
                    src={REAL_ALIMENTOS_LOGO} 
                    alt="Real Alimentos" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <span className="font-extrabold text-xl text-white tracking-tight font-serif block">
                    Real Alimentos
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Distribuição & Food Service
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Distribuidora e atacadista de alimentos de alta qualidade. Atendimento para supermercados, padarias, hamburguerias, pizzarias e restaurantes.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <Truck className="w-4 h-4" /> Entregas programadas com frota refrigerada
              </div>
            </div>

            {/* Column 2: Brands Portfolio */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Marcas Parceiras
              </h4>
              <ul className="text-xs space-y-1.5 text-slate-400">
                <li>• Vigor, Danúbio, Faixa Azul, Serrabella</li>
                <li>• Xandô (Leites Tipo A, Sucos & Queijos)</li>
                <li>• Seara Gourmet, Rezende, Perdigão</li>
                <li>• McCain Batatas & Aperitivos</li>
                <li>• Trevisan Queijos Especiais</li>
                <li>• Padrinho Pães de Hamburgueria</li>
              </ul>
            </div>

            {/* Column 3: Contact & Commercial */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Atendimento Comercial
              </h4>
              <div className="text-xs space-y-2 text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Televendas: (11) 99999-9999</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>pedidos@realalimentos.com.br</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Segunda a Sexta: 07h às 18h</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>São Paulo - SP • Distribuição Regional</span>
                </div>
              </div>
            </div>

            {/* Column 4: B2B WhatsApp Call to Action */}
            <div className="space-y-3 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Cotações Rápidas B2B</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Adicione os produtos ao carrinho e envie diretamente para nossa equipe comercial com condições especiais de atacado.
              </p>
              <div className="text-[10px] text-slate-500">
                Catálogo Digital Interativo 2026 • 55 Páginas
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              © {new Date().getFullYear()} Real Alimentos. Todos os direitos reservados.
            </div>
            <div className="flex items-center gap-4">
              <span>Privacidade & Termos</span>
              <span>•</span>
              <span>Tabela de Preços & Condições</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductModal />

      {/* Quick Edit Price & Photo Popup */}
      <QuickEditModal />

      {/* Master Price & Catalog Manager Modal */}
      <PriceManagerModal />

      {/* Shopping Cart Drawer */}
      <CartDrawer />

      {/* Order Confirmation Screen */}
      <OrderConfirmationModal />

      {/* Sales Representative & Invoice Management Portal */}
      <RepOrderPortalModal />

      {/* Sales Representative Add/Edit Form Modal */}
      <SalesRepFormModal />

      {/* Toast Notification */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <CatalogApp />
      </CartProvider>
    </ProductProvider>
  );
}

