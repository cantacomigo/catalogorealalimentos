import { BRANDS } from '../data/brands';
import { BrandId } from '../types';
import { Sparkles } from 'lucide-react';

interface BrandSelectorProps {
  selectedBrand: BrandId;
  setSelectedBrand: (brand: BrandId) => void;
  brandCounts: Record<string, number>;
}

export function BrandSelector({
  selectedBrand,
  setSelectedBrand,
  brandCounts
}: BrandSelectorProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Filtrar por Marca Parceira
          </h2>
          <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
            {BRANDS.length - 1} marcas
          </span>
        </div>
        {selectedBrand !== 'todas' && (
          <button
            onClick={() => setSelectedBrand('todas')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline"
          >
            Ver todas as marcas
          </button>
        )}
      </div>

      {/* Horizontal scrolling chips with active styles */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {BRANDS.map((brand) => {
          const isSelected = selectedBrand === brand.id;
          const count = brand.id === 'todas' 
            ? Object.values(brandCounts).reduce((a, b) => a + b, 0)
            : brandCounts[brand.id] || 0;

          return (
            <button
              key={brand.id}
              id={`brand-btn-${brand.id}`}
              onClick={() => setSelectedBrand(brand.id)}
              className={`group flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Mini brand indicator circle */}
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isSelected ? 'bg-amber-400' : 'bg-slate-300 group-hover:bg-blue-500'
                }`}
                style={brand.id !== 'todas' ? { backgroundColor: isSelected ? '#fbbf24' : brand.accentColor } : undefined}
              />
              
              <span>{brand.name}</span>

              {/* Count badge */}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
