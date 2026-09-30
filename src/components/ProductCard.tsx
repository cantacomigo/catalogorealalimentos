import { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  Snowflake, 
  ThermometerSnowflake, 
  Sun, 
  Check, 
  Package, 
  Edit3, 
  ZoomIn
} from 'lucide-react';
import { BRANDS } from '../data/brands';

interface ProductCardProps {
  product: Product;
  key?: string;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, setSelectedProductForModal, cart } = useCart();
  const { setEditingProductForPrice, openEditProductModal, setPreviewProductImage } = useProducts();
  const { isAdmin } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [unitType, setUnitType] = useState<'unidade' | 'caixa' | 'fardo'>('unidade');
  const [isAddedRecently, setIsAddedRecently] = useState(false);
  const [imageError, setImageError] = useState(false);

  const brandInfo = BRANDS.find(b => b.id === product.brand);
  const cartItem = cart.find(item => item.product.id === product.id);
  const stockQty = product.stockQuantity ?? 50;
  const minAlert = product.minStockAlert ?? 10;
  const isOut = Boolean(product.isOutOfStock || stockQty <= 0);
  const isLow = !isOut && stockQty <= minAlert;

  const handleAdd = () => {
    addToCart(product, quantity, unitType);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1400);
  };

  const renderTemperatureMeta = (temp: string) => {
    switch (temp) {
      case 'congelado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-700">
            <Snowflake className="w-3 h-3 text-cyan-600" /> Congelado
          </span>
        );
      case 'resfriado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700">
            <ThermometerSnowflake className="w-3 h-3 text-blue-600" /> Resfriado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
            <Sun className="w-3 h-3 text-amber-600" /> Ambiente
          </span>
        );
    }
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-4 flex flex-col justify-between transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5 relative"
    >
      <div>
        {/* Clean Unboxed Top Metadata Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5 text-xs">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span
              className="font-extrabold uppercase tracking-wider text-[11px] truncate"
              style={{ color: brandInfo?.accentColor || '#1d4ed8' }}
            >
              {product.brandName}
            </span>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-[11px] font-medium text-slate-500 shrink-0 tabular-nums">
              Pág. {product.pageNumber}
            </span>
          </div>

          <div className="shrink-0">
            {renderTemperatureMeta(product.temperature)}
          </div>
        </div>

        {/* Clean Studio Product Image Container (no dark gradient blocking the photo) */}
        <div 
          onClick={() => setSelectedProductForModal(product)}
          className="cursor-pointer relative w-full h-48 bg-slate-50/70 rounded-xl overflow-hidden mb-3 border border-slate-100 group-hover:border-slate-200 transition-colors flex items-center justify-center p-3"
        >
          {product.imageUrl && !imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-3 text-slate-400">
              <div className="w-12 h-12 rounded-xl bg-white shadow-2xs flex items-center justify-center text-blue-700 mb-1.5 border border-slate-200">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {product.brandName}
              </span>
            </div>
          )}

          {/* Single Clean Status / Highlight Indicator (Top-Left) */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start pointer-events-none">
            {isOut ? (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-red-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                Esgotado
              </span>
            ) : isLow ? (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md shadow-xs tabular-nums">
                Restam {stockQty}
              </span>
            ) : product.highlight ? (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-900/85 text-amber-300 px-2 py-0.5 rounded-md shadow-xs">
                ★ {product.highlight}
              </span>
            ) : null}
          </div>

          {/* Quick Action Buttons (Top-Right) */}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewProductImage(product);
              }}
              className="p-1.5 rounded-lg bg-white/95 text-slate-600 hover:text-blue-700 hover:bg-white border border-slate-200/80 shadow-xs transition-all cursor-pointer"
              title="Ampliar imagem do produto"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditProductModal(product);
                }}
                className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-all cursor-pointer"
                title="Editar cadastro completo deste item (Admin)"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Product Name */}
        <h3 
          onClick={() => setSelectedProductForModal(product)}
          className="font-bold text-sm text-slate-900 leading-snug mb-1 cursor-pointer hover:text-blue-700 transition-colors line-clamp-2 min-h-[2.5rem]"
        >
          {product.name}
        </h3>

        {/* Clean Unboxed Technical Metadata Line */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 mb-2 tabular-nums">
          <span className="font-semibold text-slate-700">{product.weight}</span>
          <span aria-hidden="true">·</span>
          <span>{product.packageType}</span>
          <span aria-hidden="true">·</span>
          <span className={isOut ? 'text-red-600 font-semibold' : isLow ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-medium'}>
            Estoque: {stockQty}
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed line-clamp-1 mb-3">
          {product.description}
        </p>
      </div>

      {/* Bottom Purchase & Admin Controls */}
      <div className="pt-2.5 border-t border-slate-100">
        {/* Price Row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="tabular-nums">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
              {product.isCustomPrice ? 'Valor Atualizado' : 'Valor Unitário Ref.'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                {product.suggestedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              {product.isCustomPrice && product.originalPrice && (
                <span className="text-[11px] text-slate-400 line-through">
                  {product.originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setEditingProductForPrice(product)}
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                title="Ajuste rápido de preço, foto e estoque"
              >
                <Edit3 className="w-3 h-3 text-blue-600" />
                <span>Ajustar</span>
              </button>
            </div>
          )}
        </div>

        {/* Unit Type & Stepper */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <select
            value={unitType}
            onChange={(e) => setUnitType(e.target.value as any)}
            className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="unidade">Unidade</option>
            <option value="caixa">Caixa (CX)</option>
            <option value="fardo">Fardo</option>
          </select>

          <div className="flex-1 flex items-center justify-between bg-slate-100 rounded-xl p-0.5 border border-slate-200/80 tabular-nums">
            <button
              type="button"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold text-slate-900 w-6 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(q => q + 1)}
              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          id={`add-to-cart-${product.id}`}
          onClick={handleAdd}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            isAddedRecently
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-700 hover:bg-blue-800 text-white shadow-2xs'
          }`}
        >
          {isAddedRecently ? (
            <>
              <Check className="w-4 h-4" /> Adicionado ao Pedido
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" /> Adicionar ao Pedido
            </>
          )}
        </button>

        {cartItem && (
          <div className="text-[11px] text-center text-blue-700 font-semibold mt-1.5 tabular-nums">
            ✓ {cartItem.quantity} {cartItem.unitType === 'caixa' ? 'cx' : cartItem.unitType === 'fardo' ? 'fardos' : 'un'} no pedido
          </div>
        )}
      </div>
    </div>
  );
}
