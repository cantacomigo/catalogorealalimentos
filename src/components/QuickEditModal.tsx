import React, { useState, useRef, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, DollarSign, Camera, Check, RotateCcw, Image as ImageIcon, Boxes, AlertTriangle, CloudCheck } from 'lucide-react';
import { BRANDS } from '../data/brands';
import { compressImage } from '../services/productCustomizationService';

export function QuickEditModal() {
  const { 
    editingProductForPrice, 
    setEditingProductForPrice, 
    updateProductPrice, 
    updateProductImage, 
    updateProductStock,
    resetProductToDefault,
    firebaseSyncState
  } = useProducts();
  const { showToast } = useCart();
  const { isAdmin } = useAuth();

  const [priceInput, setPriceInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [stockInput, setStockInput] = useState('50');
  const [minAlertInput, setMinAlertInput] = useState('10');
  const [stockReason, setStockReason] = useState('Ajuste rápido');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProductForPrice) {
      setPriceInput(editingProductForPrice.suggestedPrice.toFixed(2));
      setImageUrlInput(editingProductForPrice.imageUrl || '');
      setStockInput(String(editingProductForPrice.stockQuantity ?? 50));
      setMinAlertInput(String(editingProductForPrice.minStockAlert ?? 10));
      setStockReason('Ajuste rápido');
    }
  }, [editingProductForPrice]);

  if (!editingProductForPrice) return null;
  if (!isAdmin) return null;

  const product = editingProductForPrice;
  const brand = BRANDS.find(b => b.id === product.brand);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const numPrice = parseFloat(priceInput.replace(',', '.'));
      if (!isNaN(numPrice) && numPrice > 0) {
        updateProductPrice(product.id, numPrice);
      }
      if (imageUrlInput.trim() && imageUrlInput.trim() !== product.imageUrl) {
        updateProductImage(product.id, imageUrlInput.trim());
      }
      
      const numStock = parseInt(stockInput, 10);
      const numMinAlert = parseInt(minAlertInput, 10);
      if (!isNaN(numStock) && numStock >= 0) {
        await updateProductStock(
          product.id, 
          numStock, 
          stockReason || 'Ajuste manual',
          isNaN(numMinAlert) ? 10 : numMinAlert
        );
      }

      showToast(`Produto e estoque sincronizados no Firebase para "${product.name}"!`);
      setEditingProductForPrice(null);
    } catch (err: any) {
      showToast(`Erro ao salvar no Firebase: ${err.message || 'Tente novamente'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Processando foto com compressão inteligente...');
      const compressed = await compressImage(file, 600, 0.85);
      setImageUrlInput(compressed);
    } catch (err: any) {
      showToast(`Erro ao carregar foto: ${err?.message || 'Tente novamente'}`);
    }
  };

  const handleReset = () => {
    resetProductToDefault(product.id);
    showToast(`Preço e foto originais restaurados para ${product.name}`);
    setEditingProductForPrice(null);
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span 
              className="text-[10px] font-extrabold px-2.5 py-0.5 rounded text-white shadow-2xs"
              style={{ backgroundColor: brand?.accentColor || '#1e293b' }}
            >
              {product.brandName}
            </span>
            <span className="text-xs font-bold text-slate-800">
              Editar Produto, Preço & Estoque
            </span>
          </div>

          <button
            onClick={() => setEditingProductForPrice(null)}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Title & Cloud Sync Badge */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
              {product.name}
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Firebase Sync
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {product.weight} • {product.packageType} • Pág. {product.pageNumber}
          </p>
        </div>

        {/* Stock Management Box (Firebase Synced) */}
        <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-950">
              <Boxes className="w-4 h-4 text-blue-700" />
              <span>Estoque Atual (Firestore)</span>
            </div>
            <span className="text-[10px] text-blue-700 font-semibold bg-white px-2 py-0.5 rounded-md border border-blue-200">
              Unidade: {product.packageType || 'un'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Quantidade em Estoque:
              </label>
              <input
                type="number"
                min="0"
                value={stockInput}
                onChange={(e) => setStockInput(e.target.value)}
                className="w-full px-3 py-1.5 text-base font-extrabold text-blue-900 bg-white border border-blue-300 focus:border-blue-600 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Alerta Mínimo:
              </label>
              <input
                type="number"
                min="0"
                value={minAlertInput}
                onChange={(e) => setMinAlertInput(e.target.value)}
                className="w-full px-3 py-1.5 text-sm font-bold text-slate-800 bg-white border border-blue-300 focus:border-blue-600 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Quick Increment Buttons */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500 font-semibold">Ajuste rápido:</span>
            {[-10, -5, +5, +10, +50].map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => {
                  const curr = parseInt(stockInput, 10) || 0;
                  setStockInput(String(Math.max(0, curr + delta)));
                }}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                  delta > 0 
                    ? 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-white hover:bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>
        </div>

        {/* Price Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Valor Unitário de Referência (R$):
            </label>
            <span className="text-[11px] text-slate-400">
              Catálogo: {(product.originalPrice || product.suggestedPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              R$
            </div>
            <input
              type="number"
              step="0.01"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-base font-extrabold text-blue-900 bg-slate-50 border border-slate-300 focus:bg-white focus:border-blue-600 rounded-xl outline-none"
            />
          </div>
        </div>

        {/* Photo Preview & Edit */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Foto do Produto:
          </label>
          
          <div className="flex gap-3 items-center bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
              {imageUrlInput ? (
                <img 
                  src={imageUrlInput} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-300" />
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload de Nova Foto</span>
              </button>

              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Ou link (URL) da imagem"
                className="w-full text-[11px] px-2.5 py-1 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {(product.isCustomPrice || product.isCustomImage) ? (
            <button
              onClick={handleReset}
              className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-1 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditingProductForPrice(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Gravando...' : 'Salvar no Firebase'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

