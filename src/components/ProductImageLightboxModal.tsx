import { useState, useEffect, useCallback, useRef, MouseEvent } from 'react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BRANDS } from '../data/brands';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  Package, 
  Download, 
  ExternalLink,
  BookOpen,
  Check,
  Edit3,
  Maximize2
} from 'lucide-react';

export function ProductImageLightboxModal() {
  const { 
    products, 
    previewProductImage, 
    setPreviewProductImage,
    setEditingProductForPrice 
  } = useProducts();
  const { addToCart, setSelectedProductForModal } = useCart();
  const { isAdmin } = useAuth();

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAddedRecently, setIsAddedRecently] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [qty, setQty] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);

  // Current reactive product
  const activeProduct = previewProductImage
    ? products.find(p => p.id === previewProductImage.id) || previewProductImage
    : null;

  const brand = activeProduct ? BRANDS.find(b => b.id === activeProduct.brand) : null;

  // Reset zoom & pan when product changes
  useEffect(() => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
    setImgError(false);
    setQty(1);
  }, [activeProduct?.id]);

  // Navigate through products
  const handleNext = useCallback(() => {
    if (!activeProduct) return;
    const currentIndex = products.findIndex(p => p.id === activeProduct.id);
    if (currentIndex >= 0 && currentIndex < products.length - 1) {
      setPreviewProductImage(products[currentIndex + 1]);
    } else if (products.length > 0) {
      setPreviewProductImage(products[0]);
    }
  }, [activeProduct, products, setPreviewProductImage]);

  const handlePrev = useCallback(() => {
    if (!activeProduct) return;
    const currentIndex = products.findIndex(p => p.id === activeProduct.id);
    if (currentIndex > 0) {
      setPreviewProductImage(products[currentIndex - 1]);
    } else if (products.length > 0) {
      setPreviewProductImage(products[products.length - 1]);
    }
  }, [activeProduct, products, setPreviewProductImage]);

  // Keyboard navigation & zoom
  useEffect(() => {
    if (!activeProduct) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewProductImage(null);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        setZoomLevel(prev => Math.min(prev + 0.25, 3));
      } else if (e.key === '-') {
        setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
      } else if (e.key === '0') {
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProduct, handleNext, handlePrev, setPreviewProductImage]);

  if (!activeProduct) return null;

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.35, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.35, 0.75));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleToggleZoom = () => {
    if (zoomLevel > 1.1) {
      handleResetZoom();
    } else {
      setZoomLevel(2);
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleAddToCart = () => {
    addToCart(activeProduct, qty, 'unidade');
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1500);
  };

  const handleOpenDetails = () => {
    setPreviewProductImage(null);
    setSelectedProductForModal(activeProduct);
  };

  const handleEditAdmin = () => {
    setPreviewProductImage(null);
    setEditingProductForPrice(activeProduct);
  };

  const handleDownloadImage = () => {
    if (!activeProduct.imageUrl) return;
    const a = document.createElement('a');
    a.href = activeProduct.imageUrl;
    a.download = `foto-${activeProduct.id}-${activeProduct.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      id="product-image-lightbox"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={() => setPreviewProductImage(null)}
    >
      {/* Top Header Bar */}
      <div 
        className="w-full max-w-7xl px-4 sm:px-6 py-3.5 flex items-center justify-between z-20 shrink-0 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span 
            className="text-xs font-extrabold px-3 py-1 rounded-xl text-white shadow-sm shrink-0"
            style={{ backgroundColor: brand?.accentColor || '#1e293b' }}
          >
            {activeProduct.brandName}
          </span>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
              {activeProduct.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <BookOpen className="w-3 h-3 text-blue-400" />
                Página {activeProduct.pageNumber}
              </span>
              <span>•</span>
              <span>{activeProduct.weight}</span>
              <span>•</span>
              <span className="font-mono text-slate-400 text-[11px]">{activeProduct.id}</span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-1 text-slate-300">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.75}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-30"
              title="Diminuir Zoom (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold px-2 text-slate-200 min-w-[45px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-30"
              title="Aumentar Zoom (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {zoomLevel !== 1 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 text-blue-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Redefinir tamanho (0)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Download button */}
          {activeProduct.imageUrl && (
            <button
              type="button"
              onClick={handleDownloadImage}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              title="Baixar ou abrir imagem"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Salvar Foto</span>
            </button>
          )}

          {/* Admin Edit Trigger */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleEditAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
              title="Editar valor ou trocar foto (Admin)"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trocar Foto / Preço</span>
            </button>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={() => setPreviewProductImage(null)}
            className="w-9 h-9 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-800 transition-colors cursor-pointer shrink-0 ml-1"
            title="Fechar (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Display Area */}
      <div 
        ref={containerRef}
        className={`relative flex-1 w-full max-w-6xl flex items-center justify-center overflow-hidden p-4 sm:p-8 cursor-${zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'}`}
        onClick={(e) => {
          // If clicking strictly on the background, close
          if (e.target === containerRef.current) {
            setPreviewProductImage(null);
          }
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Previous Navigation Arrow */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-2 sm:left-6 z-30 w-11 h-11 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center border border-slate-700/60 shadow-xl transition-all hover:scale-105 cursor-pointer"
          title="Produto anterior (Seta Esquerda)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Image Content Container */}
        <div 
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
            cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onDoubleClick={handleToggleZoom}
        >
          {activeProduct.imageUrl && !imgError ? (
            <div className="relative rounded-3xl overflow-hidden bg-white/95 p-4 sm:p-8 shadow-2xl border border-white/10 max-h-[70vh] flex items-center justify-center">
              <img
                src={activeProduct.imageUrl}
                alt={activeProduct.name}
                className="max-h-[62vh] max-w-[85vw] sm:max-w-xl object-contain pointer-events-none drop-shadow-md transition-all"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
              <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 bg-slate-100/90 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                <Maximize2 className="w-2.5 h-2.5" />
                <span>Duplo clique p/ zoom</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center text-slate-400 shadow-2xl">
              <div className="w-20 h-20 rounded-3xl bg-slate-800 flex items-center justify-center text-blue-400 mb-4 border border-slate-700">
                <Package className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{activeProduct.name}</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Imagem ilustrativa oficial do catálogo Real Alimentos ({activeProduct.brandName})
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleEditAdmin}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" /> Inserir foto do produto
                </button>
              )}
            </div>
          )}
        </div>

        {/* Next Navigation Arrow */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-2 sm:right-6 z-30 w-11 h-11 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center border border-slate-700/60 shadow-xl transition-all hover:scale-105 cursor-pointer"
          title="Próximo produto (Seta Direita)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Floating Control Bar */}
      <div 
        className="w-full max-w-3xl px-4 py-3 sm:py-4 z-20 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-white">
          {/* Price & Stock info */}
          <div>
            <div className="text-[11px] text-slate-400">Preço Sugerido / Tabela:</div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
              {activeProduct.suggestedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              <span className="text-xs font-normal text-slate-400 ml-1">/ un</span>
            </div>
          </div>

          {/* Quick Actions: Stepper + Add to cart + View full specs */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quantity selector */}
            <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 px-1 py-0.5">
              <button
                type="button"
                onClick={() => setQty(prev => Math.max(1, prev - 1))}
                className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white font-bold hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="w-8 text-center text-xs font-bold font-mono text-white">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty(prev => prev + 1)}
                className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white font-bold hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isAddedRecently
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isAddedRecently ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Adicionado!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Adicionar ao Pedido</span>
                </>
              )}
            </button>

            {/* Details modal button */}
            <button
              type="button"
              onClick={handleOpenDetails}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Ver Ficha Técnica</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
