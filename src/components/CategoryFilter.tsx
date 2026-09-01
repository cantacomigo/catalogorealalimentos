import { CATEGORIES } from '../data/categories';
import { 
  LayoutGrid, 
  Milk, 
  Boxes, 
  Beef, 
  UtensilsCrossed, 
  Wheat, 
  Apple, 
  Sparkles, 
  Flame, 
  Cake, 
  Beer 
} from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categoryCounts: Record<string, number>;
}

const iconMap: Record<string, any> = {
  LayoutGrid,
  Milk,
  Boxes,
  Beef,
  UtensilsCrossed,
  Wheat,
  Apple,
  Sparkles,
  Flame,
  Cake,
  Beer
};

export function CategoryFilter({
  selectedCategory,
  setSelectedCategory,
  categoryCounts
}: CategoryFilterProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Departamentos & Categorias
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComponent = iconMap[cat.iconName] || LayoutGrid;
          const count = cat.id === 'todas'
            ? Object.values(categoryCounts).reduce((a, b) => a + b, 0)
            : categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              id={`cat-btn-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex flex-col items-start text-left p-3 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-blue-700 border-blue-700 text-white shadow-md shadow-blue-700/20 translate-y-[-2px]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`p-2 rounded-xl ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </div>

              <div className="font-bold text-xs leading-tight mb-0.5 line-clamp-1">
                {cat.name}
              </div>
              <div
                className={`text-[10px] line-clamp-1 ${
                  isSelected ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {cat.badge}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
