import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Snowflake, 
  ThermometerSnowflake, 
  Sun, 
  BookOpen, 
  Package, 
  Check, 
  Edit3, 
  Camera,
  Image as ImageIcon,
  ZoomIn,
  Maximize2
} from 'lucide-react';
import { BRANDS } from '../data/brands';

export function ProductModal() {
  const { selectedProductForModal, setSelectedProductForModal, addToCart } = useCart();
  const { products, setEditingProductForPrice, setPreviewProductImage } = useProducts();
  const { isAdmin } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [unitType, setUnitType] = useState<'unidade' | 'caixa' | 'fardo'>('unidade');
  const [notes, setNotes] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!selectedProductForModal) return null;

  // Resolve current reactive product data
  const product = products.find(p => p.id === selectedProductForModal.id) || selectedProductForModal;
  const brand = BRANDS.find(b => b.id === product.brand);

  const handleAdd = () => {
    addToCart(product, quantity, unitType, notes);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setSelectedProductForModal(null);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span 
              className="text-xs font-extrabold px-3 py-1 rounded-xl text-white shadow-2xs"
              style={{ backgroundColor: brand?.accentColor || '#1e293b' }}
            >
              {product.brandName}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-white text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              Catálogo Pág. {product.pageNumber}
            </span>
          </div>

          <button
            onClick={() => setSelectedProductForModal(null)}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Main Visual Photo & Key Specs */}
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 rounded-3xl border border-slate-200/80 relative">
            
            {/* Product Photo */}
            <div 
              onClick={() => setPreviewProductImage(product)}
              className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-white shadow-md overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center cursor-pointer group/img hover:border-blue-300 transition-all"
              title="Clique para abrir imagem em tamanho grande"
            >
              {product.imageUrl && !imgError ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-1.5 group-hover/img:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <Package className="w-10 h-10 text-blue-700 mb-1" />
                  <span className="text-[10px]">{product.brandName}</span>
                </div>
              )}

              {/* Zoom overlay indicator */}
              <div className="absolute top-1.5 left-1.5 p-1 rounded-lg bg-slate-900/70 hover:bg-slate-900 text-white text-[10px] flex items-center gap-1 shadow-sm opacity-80 group-hover/img:opacity-100 transition-all">
                <ZoomIn className="w-3 h-3 text-blue-400" />
              </div>

              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProductForPrice(product);
                  }}
                  className="absolute bottom-1.5 right-1.5 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
                  title="Trocar foto do produto (Admin)"
                >
                  <Camera className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                {product.highlight && (
                  <span className="inline-block text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                    ★ {product.highlight}
                  </span>
                )}
                {product.isCustomPrice && (
                  <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-md">
                    Preço Atualizado
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                {product.name}
              </h2>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-lg">
                  Peso/Volume: {product.weight}
                </span>
                <span className="text-xs bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-lg font-medium">
                  {product.packageType}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Descrição do Produto
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {product.description}
            </p>
          </div>

          {/* Product Tags & Specifications & Real-Time Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div className="text-slate-400 font-bold mb-1">Armazenamento</div>
              <div className="font-bold text-slate-800 flex items-center gap-1.5 capitalize">
                {product.temperature === 'congelado' ? (
                  <>
                    <Snowflake className="w-4 h-4 text-cyan-600" /> Congelado (-18ºC)
                  </>
                ) : product.temperature === 'resfriado' ? (
                  <>
                    <ThermometerSnowflake className="w-4 h-4 text-blue-600" /> Resfriado (1ºC a 10ºC)
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-600" /> Local seco e fresco
                  </>
                )}
              </div>
            </div>

            {/* Firestore Stock Real-Time Badge */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 font-bold mb-1">
                <span>Estoque (Firestore)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className={`text-base font-extrabold ${
                  product.isOutOfStock ? 'text-red-600' : (product.stockQuantity ?? 50) <= (product.minStockAlert ?? 10) ? 'text-amber-600' : 'text-emerald-700'
                }`}>
                  {product.stockQuantity ?? 50} {product.packageType || 'un'}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  Min: {product.minStockAlert ?? 10}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-slate-400 font-bold mb-0.5">
                  {product.isCustomPrice ? 'Valor Atualizado' : 'Valor Sugerido Ref.'}
                </div>
                <div className="font-extrabold text-base text-blue-900">
                  {product.suggestedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                {product.isCustomPrice && product.originalPrice && (
                  <div className="text-[10px] text-slate-400">
                    Original: {product.originalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                )}
              </div>

              {isAdmin && (
                <button
                  onClick={() => setEditingProductForPrice(product)}
                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-all"
                  title="Editar preço, estoque ou foto (Admin)"
                >
                  <Edit3 className="w-3.5 h-3.5 text-red-600" />
                  <span>Editar</span>
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Características & Selos:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Observations note for this item */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observação para este produto no pedido (opcional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Preferência por caixas fechadas, data de validade longa..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
          
          {/* Unit selection & Stepper */}
          <div className="flex items-center gap-2">
            <select
              value={unitType}
              onChange={(e) => setUnitType(e.target.value as any)}
              className="text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl px-3 py-2 outline-none"
            >
              <option value="unidade">Unidade individual</option>
              <option value="caixa">Caixa fechada (CX)</option>
              <option value="fardo">Fardo promocional</option>
            </select>

            <div className="flex items-center bg-white rounded-xl p-1 border border-slate-300">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-black text-slate-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Subtotal & Add Button */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Subtotal estimado:</div>
              <div className="text-base font-extrabold text-slate-900">
                {(product.suggestedPrice * quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>

            <button
              onClick={handleAdd}
              className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-700 hover:bg-blue-800 text-white'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" /> Adicionado ao Carrinho!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> Adicionar ao Carrinho
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
