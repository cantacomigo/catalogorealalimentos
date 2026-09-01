import { Dispatch, SetStateAction } from 'react';
import { FilterState } from '../types';
import { 
  Snowflake, 
  ThermometerSnowflake, 
  Sun, 
  ArrowUpDown, 
  X, 
  Tag, 
  BookOpen
} from 'lucide-react';

interface FilterControlsProps {
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  totalMatches: number;
  totalCatalogCount: number;
  tempCounts: Record<string, number>;
}

const POPULAR_TAGS = [
  'Zero Lactose',
  'Food Service',
  'Hamburgueria',
  'Churrasco',
  'Grego',
  'Confeitaria',
  'Pão de Alho',
  'Bacalhau',
  '1kg',
  'Air Fryer'
];

export function FilterControls({
  filters,
  setFilters,
  totalMatches,
  totalCatalogCount,
  tempCounts
}: FilterControlsProps) {
  const hasActiveFilters = 
    filters.searchQuery ||
    filters.selectedBrand !== 'todas' ||
    filters.selectedCategory !== 'todas' ||
    filters.selectedTemperature !== 'todos' ||
    filters.selectedPage !== null ||
    filters.selectedTag !== null;

  const clearAllFilters = () => {
    setFilters(prev => ({
      ...prev,
      searchQuery: '',
      selectedBrand: 'todas',
      selectedCategory: 'todas',
      selectedTemperature: 'todos',
      selectedPage: null,
      selectedTag: null
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-2xs">
      {/* Top Bar: Results Count + Quick Temperature Filter + Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
        
        {/* Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            Exibindo <span className="text-blue-700 font-extrabold">{totalMatches}</span> de {totalCatalogCount} produtos
          </span>
          {filters.selectedPage && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
              <BookOpen className="w-3 h-3" /> Pág. {filters.selectedPage}
            </span>
          )}
        </div>

        {/* Temperature Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilters(prev => ({ ...prev, selectedTemperature: 'todos' }))}
            className={`text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all ${
              filters.selectedTemperature === 'todos'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Todos
          </button>

          <button
            onClick={() => setFilters(prev => ({ ...prev, selectedTemperature: 'congelado' }))}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all ${
              filters.selectedTemperature === 'congelado'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5" />
            <span>Congelados ({tempCounts.congelado || 0})</span>
          </button>

          <button
            onClick={() => setFilters(prev => ({ ...prev, selectedTemperature: 'resfriado' }))}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all ${
              filters.selectedTemperature === 'resfriado'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-800'
            }`}
          >
            <ThermometerSnowflake className="w-3.5 h-3.5" />
            <span>Resfriados ({tempCounts.resfriado || 0})</span>
          </button>

          <button
            onClick={() => setFilters(prev => ({ ...prev, selectedTemperature: 'ambiente' }))}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all ${
              filters.selectedTemperature === 'ambiente'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Secos / Ambiente ({tempCounts.ambiente || 0})</span>
          </button>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            id="sort-select"
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border-none rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="relevance">Ordem do Catálogo (Pág. 1 a 55)</option>
            <option value="name-asc">Nome: A a Z</option>
            <option value="name-desc">Nome: Z a A</option>
            <option value="brand">Marca</option>
            <option value="price-asc">Menor Preço Estimado</option>
            <option value="price-desc">Maior Preço Estimado</option>
          </select>
        </div>
      </div>

      {/* Bottom Bar: Tags & Clear Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3" /> Tags:
          </span>
          {POPULAR_TAGS.map((tag) => {
            const isTagActive = filters.selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setFilters(prev => ({
                  ...prev,
                  selectedTag: isTagActive ? null : tag
                }))}
                className={`text-[11px] px-2 py-0.5 rounded-lg font-medium transition-all ${
                  isTagActive
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-bold hover:underline"
          >
            <X className="w-3.5 h-3.5" /> Limpar Filtros
          </button>
        )}
      </div>
    </div>
  );
}
