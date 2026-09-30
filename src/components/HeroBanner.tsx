import { 
  Truck, 
  ShieldCheck, 
  Store, 
  Snowflake
} from 'lucide-react';
import { BRANDS } from '../data/brands';
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
  totalProductsCount
}: HeroBannerProps) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-md border border-slate-800">
      <div className="relative z-10 max-w-4xl">
        {/* Clean Editorial Kicker */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-300 mb-2 tabular-nums">
          <span>Catálogo Oficial Interativo 2026</span>
          <span aria-hidden="true">·</span>
          <span>{totalProductsCount} produtos disponíveis</span>
          <span aria-hidden="true">·</span>
          <span>Atacado & Food Service</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight mb-2">
          Catálogo Geral Real Alimentos
        </h1>
        
        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mb-5 leading-relaxed">
          Selecione os itens do catálogo para montar seu pedido com envio direto ao representante da sua região e faturamento ágil.
        </p>

        {/* Value Props */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-2.5">
            <Truck className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Entrega Rápida</div>
              <div className="text-[11px] text-slate-400">Frota climatizada</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Marcas Líderes</div>
              <div className="text-[11px] text-slate-400">Qualidade garantida</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-2.5">
            <Store className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">B2B & Atacado</div>
              <div className="text-[11px] text-slate-400">Condições comerciais</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-2.5">
            <Snowflake className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Cadeia do Frio</div>
              <div className="text-[11px] text-slate-400">Resfriados e congelados</div>
            </div>
          </div>
        </div>

        {/* Quick Brands Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          {BRANDS.filter(b => b.id !== 'todas').slice(0, 10).map(brand => (
            <button
              type="button"
              key={brand.id}
              onClick={() => setSelectedBrand(selectedBrand === brand.id ? 'todas' : brand.id)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedBrand === brand.id
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
