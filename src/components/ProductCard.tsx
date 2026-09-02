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
  Info, 
  Check, 
  Package, 
  Edit3, 
  Camera,
  ZoomIn,
  Maximize2
} from 'lucide-react';
import { BRANDS } from '../data/brands';

interface ProductCardProps {
  product: Product;
  key?: string;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, setSelectedProductForModal, cart } = useCart();
  const { setEditingProductForPrice, setPreviewProductImage } = useProducts();
  const { isAdmin } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [unitType, setUnitType] = useState<'unidade' | 'caixa' | 'fardo'>('unidade');
  const [isAddedRecently, setIsAddedRecently] = useState(false);
  const [imageError, setImageError] = useState(false);

  const brandInfo = BRANDS.find(b => b.id === product.brand);
  const cartItem = cart.find(item => item.product.id === product.id);

  const handleAdd = () => {
    addToCart(product, quantity, unitType);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1400);
  };

  const getTemperatureBadge = (temp: string) => {
    switch (temp) {
      case 'congelado':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
            <Snowflake className="w-3 h-3 text-cyan-600" /> Congelado
          </span>
        );
      case 'resfriado':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <ThermometerSnowflake className="w-3 h-3 text-blue-600" /> Resfriado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            <Sun className="w-3 h-3 text-amber-600" /> Ambiente
          </span>
        );
    }
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group bg-white rounded-3xl border border-slate-200/90 hover:border-blue-400 p-4 flex flex-col justify-between transition-all hover:shadow-xl hover:translate-y-[-2px] relative"
    >
      {/* Top Meta: Brand & Page & Temperature */}
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Brand Pill */}
            <span
              className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg text-white shadow-2xs"
              style={{ backgroundColor: brandInfo?.accentColor || '#1e293b' }}
            >
              {product.brandName}
            </span>

            {/* Catalog Page Badge */}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Pág. {product.pageNumber}
            </span>
          </div>

          {getTemperatureBadge(product.temperature)}
        </div>

        {/* Highlight Banner if available */}
        {product.highlight && (
          <div className="mb-2">
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-wide bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md shadow-2xs">
              ★ {product.highlight}
            </span>
          </div>
        )}

        {/* Product Visual Container with Photo */}
        <div 
          onClick={() => setSelectedProductForModal(product)}
          className="cursor-pointer relative w-full h-44 bg-slate-50 rounded-2xl overflow-hidden mb-3 border border-slate-100 group-hover:border-blue-200 transition-all flex items-center justify-center"
        >
          {/* Product Real Image */}
          {product.imageUrl && !imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-3 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-700 mb-1 border border-slate-200">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {product.brandName}
              </span>
            </div>
          )}

          {/* Overlay gradient for bottom tags */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-2.5 flex items-end justify-between">
            <span className="text-[11px] font-bold text-white bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/20 shadow-xs">
              {product.weight}
            </span>
            <span className="text-[10px] text-slate-200 font-medium bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded border border-white/10">
              {product.packageType}
            </span>
          </div>

          {/* Quick info icon & edit photo trigger */}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewProductImage(product);
              }}
              className="p-1.5 rounded-full bg-white/95 text-slate-700 hover:text-blue-700 hover:bg-white shadow-sm transition-all cursor-pointer group-hover:scale-105"
              title="Abrir imagem em tamanho grande"
            >
              <ZoomIn className="w-3.5 h-3.5 text-blue-600" />
            </button>
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingProductForPrice(product);
                }}
                className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm transition-all cursor-pointer"
                title="Editar valor ou foto deste produto (Admin)"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedProductForModal(product);
              }}
              className="p-1.5 rounded-full bg-white/90 text-slate-600 hover:text-blue-700 hover:bg-white shadow-sm transition-all cursor-pointer"
              title="Ver detalhes completos"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Custom Price / Custom Photo indicator tag */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            {product.isCustomPrice && (
              <span className="text-[9px] font-extrabold uppercase tracking-wide bg-blue-600 text-white px-2 py-0.5 rounded-md shadow-sm">
                Preço Atualizado
              </span>
            )}
            {/* Live Firestore Stock Badge */}
            {product.isOutOfStock ? (
              <span className="text-[9px] font-extrabold uppercase tracking-wide bg-red-600 text-white px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Esgotado
              </span>
            ) : (product.stockQuantity ?? 50) <= (product.minStockAlert ?? 10) ? (
              <span className="text-[9px] font-extrabold uppercase tracking-wide bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md shadow-sm">
                Restam {product.stockQuantity} {product.packageType || 'un'}
              </span>
            ) : (
              <span className="text-[9px] font-bold tracking-tight bg-slate-900/80 backdrop-blur-xs text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-md shadow-sm">
                Estoque: {product.stockQuantity}
              </span>
            )}
          </div>
        </div>

        {/* Product Name & Description */}
        <h3 
          onClick={() => setSelectedProductForModal(product)}
          className="font-bold text-sm text-slate-900 leading-snug mb-1 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
        >
          {product.name}
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2">
          {product.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Actions: Price, Stepper & Add to Cart */}
      <div className="pt-2 border-t border-slate-100">
        
        {/* Suggested Reference Price with Quick Edit Trigger */}
        <div className="flex items-center justify-between mb-2.5 bg-slate-50/70 p-2 rounded-xl border border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              {product.isCustomPrice ? 'Valor Atualizado:' : 'Valor Ref:'}
            </span>
            {product.isCustomPrice && product.originalPrice && (
              <span className="text-[10px] text-slate-400 line-through mr-1">
                {product.originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            )}
            <span className="text-sm font-black text-blue-900">
              {product.suggestedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          {isAdmin && (
            <button
              onClick={() => setEditingProductForPrice(product)}
              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 transition-all flex items-center gap-1 text-[11px] font-semibold"
              title="Alterar valor unitário deste produto (Admin)"
            >
              <Edit3 className="w-3 h-3 text-red-600" />
              <span>Editar</span>
            </button>
          )}
        </div>

        {/* Unit type selection & Stepper */}
        <div className="flex items-center gap-1.5 mb-2.5">
          {/* Unit Selector */}
          <select
            value={unitType}
            onChange={(e) => setUnitType(e.target.value as any)}
            className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border-none rounded-xl px-2 py-1.5 outline-none cursor-pointer"
          >
            <option value="unidade">Unidade</option>
            <option value="caixa">Caixa (CX)</option>
            <option value="fardo">Fardo</option>
          </select>

          {/* Stepper */}
          <div className="flex-1 flex items-center justify-between bg-slate-100 rounded-xl p-0.5 border border-slate-200">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold text-slate-900 w-6 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Add to cart button */}
        <button
          id={`add-to-cart-${product.id}`}
          onClick={handleAdd}
          className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
            isAddedRecently
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-700 hover:bg-blue-800 text-white active:scale-98'
          }`}
        >
          {isAddedRecently ? (
            <>
              <Check className="w-4 h-4" /> Adicionado!
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" /> Adicionar ao Carrinho
            </>
          )}
        </button>

        {/* In Cart Indicator */}
        {cartItem && (
          <div className="text-[11px] text-center text-blue-700 font-semibold mt-1.5">
            ✓ {cartItem.quantity} {cartItem.unitType === 'caixa' ? 'caixas' : cartItem.unitType === 'fardo' ? 'fardos' : 'unidades'} no carrinho
          </div>
        )}
      </div>
    </div>
  );
}
