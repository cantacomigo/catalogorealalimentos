import { Dispatch, SetStateAction } from 'react';
import { FilterState } from '../types';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { 
  Snowflake, 
  ThermometerSnowflake, 
  Sun, 
  ArrowUpDown, 
  X, 
  Tag, 
  BookOpen,
  PlusCircle
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
  const { isAdmin } = useAuth();
  const { openCreateProductModal } = useProducts();

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
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        {/* Counter */}
        <div className="flex flex-wrap items-center gap-2.5 tabular-nums">
          <span className="text-xs font-semibold text-slate-700">
            Exibindo <strong className="text-slate-950 font-extrabold">{totalMatches}</strong> de {totalCatalogCount} itens
          </span>
          {filters.selectedPage && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-bold">
              · <BookOpen className="w-3.5 h-3.5" /> Página {filters.selectedPage}
            </span>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={() => openCreateProductModal()}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Cadastrar Item Individual</span>
            </button>
          )}
        </div>

        {/* Segmented Temperature Filter Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto tabular-nums">
          <button
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, selectedTemperature: 'todos' }))}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filters.selectedTemperature === 'todos'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos
          </button>

          <button
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, selectedTemperature: 'congelado' }))}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filters.selectedTemperature === 'congelado'
                ? 'bg-white text-cyan-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Snowflake className="w-3 h-3 text-cyan-600" />
            <span>Congelados ({tempCounts.congelado || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, selectedTemperature: 'resfriado' }))}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filters.selectedTemperature === 'resfriado'
                ? 'bg-white text-blue-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ThermometerSnowflake className="w-3 h-3 text-blue-600" />
            <span>Resfriados ({tempCounts.resfriado || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, selectedTemperature: 'ambiente' }))}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filters.selectedTemperature === 'ambiente'
                ? 'bg-white text-amber-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3 h-3 text-amber-600" />
            <span>Ambiente ({tempCounts.ambiente || 0})</span>
          </button>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            id="sort-select"
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="relevance">Ordem do Catálogo (Pág. 2 a 55)</option>
            <option value="name-asc">Nome: A a Z</option>
            <option value="name-desc">Nome: Z a A</option>
            <option value="brand">Marca</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
          </select>
        </div>
      </div>

      {/* Bottom Bar: Quick Tags & Clear Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3" /> Filtros rápidos:
          </span>
          {POPULAR_TAGS.map((tag) => {
            const isTagActive = filters.selectedTag === tag;
            return (
              <button
                type="button"
                key={tag}
                onClick={() => setFilters(prev => ({
                  ...prev,
                  selectedTag: isTagActive ? null : tag
                }))}
                className={`text-[11px] px-2.5 py-0.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isTagActive
                    ? 'bg-blue-700 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" /> Limpar Filtros
          </button>
        )}
      </div>
    </div>
  );
}
