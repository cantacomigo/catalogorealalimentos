import { useState } from 'react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  SlidersHorizontal,
  PackageCheck
} from 'lucide-react';
import { TOTAL_PAGES_IN_CATALOG } from '../data/products';
import { BRANDS } from '../data/brands';

interface CatalogBrochureViewProps {
  products: Product[];
  selectedPage: number | null;
  setSelectedPage: (page: number | null) => void;
}

export function CatalogBrochureView({
  products,
  selectedPage,
  setSelectedPage
}: CatalogBrochureViewProps) {
  const currentPage = selectedPage || 1;

  const pageProducts = products.filter(p => p.pageNumber === currentPage);

  // Group pages info
  const pagesList = Array.from({ length: TOTAL_PAGES_IN_CATALOG }, (_, i) => i + 1);

  const getBrandsOnPage = (pg: number) => {
    const prods = products.filter(p => p.pageNumber === pg);
    const brandNames = Array.from(new Set(prods.map(p => p.brandName)));
    return brandNames.join(', ');
  };

  const handleNextPage = () => {
    if (currentPage < TOTAL_PAGES_IN_CATALOG) {
      setSelectedPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setSelectedPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Brochure Navigator Top Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Current page details */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex flex-col items-center justify-center shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Pág.</span>
            <span className="text-lg font-black leading-none">{currentPage}</span>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Folheando Catálogo Real Alimentos</span>
              <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                {currentPage} de {TOTAL_PAGES_IN_CATALOG}
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {getBrandsOnPage(currentPage) ? `Marcas na página: ${getBrandsOnPage(currentPage)}` : 'Produtos do catálogo'}
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          {/* Quick Page Selector */}
          <select
            value={currentPage}
            onChange={(e) => setSelectedPage(Number(e.target.value))}
            className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border-none rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            {pagesList.map(pg => (
              <option key={pg} value={pg}>
                Página {pg} {getBrandsOnPage(pg) ? `(${getBrandsOnPage(pg)})` : ''}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= TOTAL_PAGES_IN_CATALOG}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-xs font-bold text-white shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Próxima <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pages Quick Strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {pagesList.map(pg => {
          const isCurrent = pg === currentPage;
          const prodsCount = products.filter(p => p.pageNumber === pg).length;

          return (
            <button
              key={pg}
              onClick={() => setSelectedPage(pg)}
              className={`flex flex-col items-center min-w-[50px] py-1.5 px-2 rounded-xl border transition-all shrink-0 ${
                isCurrent
                  ? 'bg-blue-700 border-blue-700 text-white shadow-md scale-105'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="text-[10px] font-bold opacity-80">Pág</span>
              <span className="text-sm font-black">{pg}</span>
              <span className="text-[9px] opacity-70">({prodsCount})</span>
            </button>
          );
        })}
      </div>

      {/* Products on this page */}
      {pageProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {pageProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Página {currentPage} do Catálogo
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Utilize a navegação para explorar as demais páginas do catálogo impresso digitalizado.
          </p>
        </div>
      )}
    </div>
  );
}
