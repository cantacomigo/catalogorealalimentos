import { 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Store, 
  Flame, 
  Snowflake,
  ShoppingBag
} from 'lucide-react';
import { BRANDS, REAL_ALIMENTOS_LOGO } from '../data/brands';
import { RealAlimentosLogo } from './RealAlimentosLogo';
import { BrandId } from '../types';

interface HeroBannerProps {
  selectedBrand: BrandId;
  setSelectedBrand: (brand: BrandId) => void;
  setSelectedCategory: (cat: string) => void;
  totalProductsCount: number;
}

export const HeroBanner = ({
  selectedBrand,
  setSelectedBrand,
  setSelectedCategory,
  totalProductsCount
}: HeroBannerProps) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl border border-blue-900/40">
      {/* Background visual geometric accents */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 rounded-full bg-red-600/10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Catálogo Oficial Interativo 2026
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              {totalProductsCount} Produtos Cadastrados
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border border-white/20 shrink-0">
            <RealAlimentosLogo size="sm" variant="full" theme="dark" />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="sm:hidden shrink-0">
            <RealAlimentosLogo size="md" variant="icon" theme="dark" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Catálogo Geral <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-red-400">Real Alimentos</span>
          </h1>
        </div>
        
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mb-6 leading-relaxed">
          Selecione qualquer produto para adicionar ao seu carrinho de compras e montar sua cotação instantânea com envio direto para nossa equipe comercial.
        </p>

        {/* Feature Pill Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <Truck className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Entrega Rápida</div>
              <div className="text-[11px] text-slate-400">Frota climatizada</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Garantia de Qualidade</div>
              <div className="text-[11px] text-slate-400">Marcas homologadas</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <Store className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Atacado & Food Service</div>
              <div className="text-[11px] text-slate-400">Condições especiais</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
            <Snowflake className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Cadeia do Frio</div>
              <div className="text-[11px] text-slate-400">Congelados e resfriados</div>
            </div>
          </div>
        </div>

        {/* Quick Brands bar */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Marcas em Destaque no Catálogo:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {BRANDS.filter(b => b.id !== 'todas').slice(0, 10).map(brand => (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(selectedBrand === brand.id ? 'todas' : brand.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedBrand === brand.id
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
