import React, { useState, useMemo, useRef } from 'react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BRANDS, REAL_ALIMENTOS_LOGO } from '../data/brands';
import { BrandId, Product } from '../types';
import { compressImage } from '../services/productCustomizationService';
import { 
  X, 
  Search, 
  SlidersHorizontal, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Percent, 
  DollarSign, 
  Sparkles, 
  Image as ImageIcon, 
  Camera, 
  Edit3, 
  CheckCircle2, 
  ArrowUpDown,
  Filter,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  Boxes,
  Database,
  History,
  TrendingUp,
  AlertTriangle,
  PackageX,
  PackageCheck,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';

export function PriceManagerModal() {
  const { 
    products, 
    stockMap,
    firebaseSyncState,
    customPricesCount, 
    customImagesCount,
    lowStockCount,
    outOfStockCount,
    updateProductPrice, 
    updateProductImage, 
    updateProductStock,
    bulkAdjustStock,
    seedInitialStock,
    applyBulkPriceAdjustment, 
    resetProductToDefault, 
    resetAllPricesToDefault,
    resetAllImagesToDefault,
    exportPriceTable, 
    importPriceTable, 
    exportStockReport,
    stockLogs,
    refreshStockLogs,
    isPriceManagerOpen, 
    setIsPriceManagerOpen,
    activeManagerTab,
    setActiveManagerTab
  } = useProducts();

  const { showToast } = useCart();
  const { isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<BrandId | 'todas'>('todas');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'normal'>('all');
  const [onlyModified, setOnlyModified] = useState(false);
  const [sortBy, setSortBy] = useState<'page' | 'name' | 'price-asc' | 'price-desc' | 'brand' | 'stock-asc' | 'stock-desc'>('page');

  // Bulk price adjustment state
  const [isBulkPanelOpen, setIsBulkPanelOpen] = useState(false);
  const [bulkType, setBulkType] = useState<'percentage' | 'fixed'>('percentage');
  const [bulkValue, setBulkValue] = useState<string>('10');
  const [bulkBrand, setBulkBrand] = useState<BrandId | 'todas'>('todas');

  // Bulk stock adjustment state
  const [isBulkStockOpen, setIsBulkStockOpen] = useState(false);
  const [bulkStockDelta, setBulkStockDelta] = useState<string>('20');
  const [bulkStockBrand, setBulkStockBrand] = useState<BrandId | 'todas'>('todas');
  const [bulkStockReason, setBulkStockReason] = useState<string>('Entrada de Mercadoria');
  const [isProcessingBulkStock, setIsProcessingBulkStock] = useState(false);

  // Seed stock modal state (replaces window.confirm which is blocked in iframes)
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [seedQtyInput, setSeedQtyInput] = useState<string>('50');
  const [isSeedingStock, setIsSeedingStock] = useState(false);

  // Editing individual price state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<string>('');

  // Editing individual photo modal
  const [photoEditingProduct, setPhotoEditingProduct] = useState<{ id: string; name: string; currentUrl: string } | null>(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Filtered product list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brandName.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchPage = p.pageNumber.toString() === q.replace(/\D/g, '');
        if (!matchName && !matchBrand && !matchCat && !matchPage) return false;
      }

      if (selectedBrand !== 'todas' && p.brand !== selectedBrand) {
        return false;
      }

      if (activeManagerTab === 'stock') {
        const qty = p.stockQuantity ?? 50;
        const min = p.minStockAlert ?? 10;
        if (stockStatusFilter === 'out' && qty > 0) return false;
        if (stockStatusFilter === 'low' && (qty <= 0 || qty > min)) return false;
        if (stockStatusFilter === 'normal' && qty <= min) return false;
      }

      if (activeManagerTab === 'prices' && onlyModified && !p.isCustomPrice && !p.isCustomImage) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'pt-BR');
        case 'brand':
          return a.brandName.localeCompare(b.brandName, 'pt-BR');
        case 'price-asc':
          return a.suggestedPrice - b.suggestedPrice;
        case 'price-desc':
          return b.suggestedPrice - a.suggestedPrice;
        case 'stock-asc':
          return (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0);
        case 'stock-desc':
          return (b.stockQuantity ?? 0) - (a.stockQuantity ?? 0);
        case 'page':
        default:
          return a.pageNumber - b.pageNumber;
      }
    });
  }, [products, searchQuery, selectedBrand, onlyModified, sortBy, activeManagerTab, stockStatusFilter]);

  // Overall Inventory Stats
  const totalInventoryUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.stockQuantity ?? 0), 0);
  }, [products]);

  const totalInventoryValue = useMemo(() => {
    return products.reduce((acc, p) => acc + ((p.stockQuantity ?? 0) * p.suggestedPrice), 0);
  }, [products]);

  if (!isPriceManagerOpen) return null;

  const startEditPrice = (id: string, currentPrice: number) => {
    setEditingId(id);
    setEditPriceInput(currentPrice.toFixed(2));
  };

  const saveEditPrice = (id: string) => {
    const num = parseFloat(editPriceInput.replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      updateProductPrice(id, num);
      showToast('Preço atualizado com sucesso!');
    }
    setEditingId(null);
  };

  const handleBulkApply = () => {
    const val = parseFloat(bulkValue.replace(',', '.'));
    if (isNaN(val)) {
      showToast('Por favor, informe um valor numérico válido.');
      return;
    }

    const res = applyBulkPriceAdjustment({
      type: bulkType,
      value: val,
      brand: bulkBrand
    });

    showToast(`Ajuste em massa aplicado a ${res.updatedCount} produtos!`);
    setIsBulkPanelOpen(false);
  };

  const handleBulkStockApply = async () => {
    const delta = parseInt(bulkStockDelta, 10);
    if (isNaN(delta) || delta === 0) {
      showToast('Informe uma quantidade válida (positiva ou negativa).');
      return;
    }

    setIsProcessingBulkStock(true);
    try {
      const targetProducts = products.filter(p => {
        if (bulkStockBrand !== 'todas' && p.brand !== bulkStockBrand) return false;
        return true;
      });

      const count = await bulkAdjustStock(
        targetProducts.map(p => p.id), 
        delta, 
        bulkStockReason || 'Entrada em lote'
      );

      showToast(`Estoque de ${count} produtos sincronizado no Firebase!`);
      setIsBulkStockOpen(false);
    } catch (e: any) {
      showToast(`Erro ao atualizar estoque: ${e?.message}`);
    } finally {
      setIsProcessingBulkStock(false);
    }
  };

  const handleSeedAllStock = async (customQty?: number) => {
    const qtyToSeed = customQty !== undefined ? customQty : (parseInt(seedQtyInput, 10) || 50);
    setIsSeedingStock(true);
    try {
      const count = await seedInitialStock(qtyToSeed);
      showToast(`Sucesso! ${count || products.length} produtos inicializados com ${qtyToSeed} unidades no Firestore.`);
      setShowSeedModal(false);
    } catch (e: any) {
      showToast(`Erro ao inicializar estoque: ${e?.message || 'Falha na conexão com o Firestore'}`);
    } finally {
      setIsSeedingStock(false);
    }
  };

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !photoEditingProduct) return;

    try {
      showToast('Otimizando e salvando imagem no Firebase...');
      const compressedDataUrl = await compressImage(file, 600, 0.85);
      updateProductImage(photoEditingProduct.id, compressedDataUrl);
      showToast(`Nova foto sincronizada com sucesso para ${photoEditingProduct.name}!`);
      setPhotoEditingProduct(null);
      setNewPhotoUrl('');
    } catch (err: any) {
      showToast(`Erro ao processar foto: ${err?.message || 'Tente novamente'}`);
    }
  };

  const handlePhotoUrlSubmit = () => {
    if (photoEditingProduct && newPhotoUrl.trim()) {
      updateProductImage(photoEditingProduct.id, newPhotoUrl.trim());
      showToast(`Foto do produto atualizada!`);
      setPhotoEditingProduct(null);
      setNewPhotoUrl('');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const res = importPriceTable(reader.result);
        showToast(res.message);
      }
    };
    reader.readAsText(file);
    if (importFileInputRef.current) {
      importFileInputRef.current.value = '';
    }
  };

  if (!isPriceManagerOpen) return null;
  if (!isAdmin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden shrink-0">
              <img 
                src={REAL_ALIMENTOS_LOGO} 
                alt="Real Alimentos" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white font-serif">
                  Central de Gestão Real Alimentos
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Firebase Firestore Ativo
                </span>
              </div>
              <p className="text-xs text-slate-300 font-normal">
                Gerenciamento em tempo real de estoque, tabela de preços e catálogo integrado.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPriceManagerOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 pt-3 bg-slate-900 border-b border-slate-800 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveManagerTab('stock')}
            className={`px-4 py-2.5 rounded-t-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeManagerTab === 'stock'
                ? 'bg-slate-50 text-blue-900 shadow-sm border-t-2 border-blue-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Boxes className="w-4 h-4 text-blue-600" />
            <span>Controle de Estoque (Firebase)</span>
            {lowStockCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {lowStockCount}
              </span>
            )}
            {outOfStockCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {outOfStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveManagerTab('prices')}
            className={`px-4 py-2.5 rounded-t-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeManagerTab === 'prices'
                ? 'bg-slate-50 text-blue-900 shadow-sm border-t-2 border-blue-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Tabela de Preços & Margens</span>
            {customPricesCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {customPricesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveManagerTab('logs')}
            className={`px-4 py-2.5 rounded-t-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeManagerTab === 'logs'
                ? 'bg-slate-50 text-blue-900 shadow-sm border-t-2 border-blue-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>Histórico de Movimentações</span>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full">
              {stockLogs.length}
            </span>
          </button>
        </div>

        {/* ===================== TAB: GESTOR DE ESTOQUE ===================== */}
        {activeManagerTab === 'stock' && (
          <div className="flex flex-col flex-1 overflow-hidden bg-slate-50">
            {/* Inventory Overview Metric Cards */}
            <div className="p-4 border-b border-slate-200 bg-white grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl">
                <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                  Total de Itens
                </div>
                <div className="text-xl font-extrabold text-blue-950">
                  {products.length} <span className="text-xs font-semibold text-slate-500">produtos</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                  Unidades em Estoque
                </div>
                <div className="text-xl font-extrabold text-emerald-950">
                  {totalInventoryUnits.toLocaleString('pt-BR')} <span className="text-xs font-semibold text-slate-500">un/cx</span>
                </div>
              </div>

              <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-2xl">
                <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider mb-1">
                  Valor Total em Mercadoria
                </div>
                <div className="text-xl font-extrabold text-purple-950">
                  {totalInventoryValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                    Alertas Críticos
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    <span className="text-amber-600 font-extrabold">{lowStockCount} baixos</span> • <span className="text-red-600 font-extrabold">{outOfStockCount} esgotados</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Filters & Action Toolbar */}
            <div className="p-4 border-b border-slate-200 bg-slate-100/70 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar produto por nome, código ou marca..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* Stock Status Pills */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => setStockStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      stockStatusFilter === 'all' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Todos ({products.length})
                  </button>
                  <button
                    onClick={() => setStockStatusFilter('low')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      stockStatusFilter === 'low' ? 'bg-amber-500 text-slate-950' : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" /> Baixo ({lowStockCount})
                  </button>
                  <button
                    onClick={() => setStockStatusFilter('out')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                      stockStatusFilter === 'out' ? 'bg-red-600 text-white' : 'text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <PackageX className="w-3 h-3" /> Esgotados ({outOfStockCount})
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsBulkStockOpen(!isBulkStockOpen)}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Entrada em Massa</span>
                  </button>

                  <button
                    onClick={() => setShowSeedModal(true)}
                    disabled={isSeedingStock}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                    title="Popular estoque padrão em todos os produtos no Firebase"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSeedingStock ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{isSeedingStock ? 'Inicializando...' : 'Inicializar Firestore'}</span>
                    <span className="sm:hidden">{isSeedingStock ? '...' : 'Firestore'}</span>
                  </button>

                  <button
                    onClick={exportStockReport}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
                    title="Exportar planilha de estoque em CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Exportar CSV</span>
                  </button>
                </div>
              </div>

              {/* Bulk Stock Input Box (Collapsible) */}
              {isBulkStockOpen && (
                <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                      <Boxes className="w-4 h-4 text-blue-700" />
                      <span>Reabastecimento em Lote / Entrada de Mercadoria</span>
                    </div>
                    <button
                      onClick={() => setIsBulkStockOpen(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Filtrar por Marca:</label>
                      <select
                        value={bulkStockBrand}
                        onChange={(e) => setBulkStockBrand(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                      >
                        <option value="todas">Todas as Marcas ({products.length} itens)</option>
                        {BRANDS.filter(b => b.id !== 'todas').map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Quantidade a Adicionar (+/-):</label>
                      <input
                        type="number"
                        value={bulkStockDelta}
                        onChange={(e) => setBulkStockDelta(e.target.value)}
                        placeholder="Ex: 20 ou -5"
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-extrabold text-blue-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Motivo / Nota Fiscal:</label>
                      <input
                        type="text"
                        value={bulkStockReason}
                        onChange={(e) => setBulkStockReason(e.target.value)}
                        placeholder="Ex: NF 10452 - Laticínios"
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={handleBulkStockApply}
                        disabled={isProcessingBulkStock}
                        className="w-full py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isProcessingBulkStock ? 'Sincronizando...' : 'Aplicar no Firestore'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stock Interactive Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider z-10 shadow-2xs">
                  <tr>
                    <th className="p-3">Produto & Marca</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3 text-center">Status Estoque</th>
                    <th className="p-3 text-center">Qtd Atual (Firestore)</th>
                    <th className="p-3 text-center">Alerta Mín.</th>
                    <th className="p-3 text-right">Ajuste Rápido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredProducts.map((product) => {
                    const stockQty = product.stockQuantity ?? 50;
                    const minAlert = product.minStockAlert ?? 10;
                    const isOut = stockQty <= 0;
                    const isLow = !isOut && stockQty <= minAlert;

                    return (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Product info */}
                        <td className="p-3 flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Boxes className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{product.name}</div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                              <span className="font-semibold text-blue-700">{product.brandName}</span>
                              <span>•</span>
                              <span>{product.weight}</span>
                              <span>•</span>
                              <span>Pág. {product.pageNumber}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-slate-600">
                          {product.category}
                        </td>

                        {/* Status Badge */}
                        <td className="p-3 text-center">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded-md">
                              <PackageX className="w-3 h-3 text-red-600" /> Esgotado
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> Estoque Baixo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                              <PackageCheck className="w-3 h-3 text-emerald-600" /> Normal ({stockQty})
                            </span>
                          )}
                        </td>

                        {/* Direct Stock Input */}
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={stockQty}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val >= 0) {
                                updateProductStock(product.id, val, 'Ajuste na tabela', minAlert);
                              }
                            }}
                            className="w-16 text-center font-extrabold text-sm py-1 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 outline-none text-blue-900"
                          />
                        </td>

                        {/* Min Alert Input */}
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={minAlert}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val >= 0) {
                                updateProductStock(product.id, stockQty, 'Alerta alterado', val);
                              }
                            }}
                            className="w-12 text-center text-xs py-1 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600 outline-none text-slate-700"
                          />
                        </td>

                        {/* Quick Action Steppers (+1, +5, -1, -5) */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => updateProductStock(product.id, Math.max(0, stockQty - 5), 'Redução rápida -5', minAlert)}
                              className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-red-50 text-red-700 border border-slate-200 rounded"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => updateProductStock(product.id, Math.max(0, stockQty - 1), 'Redução rápida -1', minAlert)}
                              className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-slate-100 hover:bg-red-50 text-red-700 border border-slate-200 rounded"
                            >
                              -
                            </button>
                            <button
                              onClick={() => updateProductStock(product.id, stockQty + 1, 'Entrada rápida +1', minAlert)}
                              className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-slate-100 hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded"
                            >
                              +
                            </button>
                            <button
                              onClick={() => updateProductStock(product.id, stockQty + 5, 'Entrada rápida +5', minAlert)}
                              className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => updateProductStock(product.id, stockQty + 20, 'Entrada rápida +20', minAlert)}
                              className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded"
                            >
                              +20
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB: TABELA DE PREÇOS ===================== */}
        {activeManagerTab === 'prices' && (
          <div className="flex flex-col flex-1 overflow-hidden bg-slate-50">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 bg-slate-100/70 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                
                {/* Search */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar produto por nome, código ou marca..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                {/* Brand Filter */}
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value as any)}
                  className="text-xs py-1.5 px-2.5 bg-white border border-slate-200 rounded-xl outline-none font-semibold text-slate-700 shadow-2xs"
                >
                  <option value="todas">Todas as Marcas ({products.length})</option>
                  {BRANDS.filter(b => b.id !== 'todas').map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsBulkPanelOpen(!isBulkPanelOpen)}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Reajuste em Massa</span>
                  </button>

                  <button
                    onClick={() => exportPriceTable('csv')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
                    title="Exportar em planilha CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Exportar CSV</span>
                  </button>

                  <input
                    type="file"
                    ref={importFileInputRef}
                    onChange={handleImportFile}
                    accept=".csv,.json"
                    className="hidden"
                  />
                  <button
                    onClick={() => importFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
                    title="Importar tabela de preços CSV/JSON"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Importar</span>
                  </button>
                </div>
              </div>

              {/* Bulk Price Adjustment Form */}
              {isBulkPanelOpen && (
                <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                      <Sparkles className="w-4 h-4 text-blue-700" />
                      <span>Reajuste de Preços em Massa</span>
                    </div>
                    <button
                      onClick={() => setIsBulkPanelOpen(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tipo de Reajuste:</label>
                      <select
                        value={bulkType}
                        onChange={(e) => setBulkType(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                      >
                        <option value="percentage">Porcentagem (%)</option>
                        <option value="fixed">Valor Fixo em Reais (R$)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Valor (+ para aumento, - para desconto):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={bulkValue}
                        onChange={(e) => setBulkValue(e.target.value)}
                        placeholder="Ex: 10 para +10% ou -5 para 5% desconto"
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Aplicar na Marca:</label>
                      <select
                        value={bulkBrand}
                        onChange={(e) => setBulkBrand(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold"
                      >
                        <option value="todas">Todas as Marcas ({products.length} itens)</option>
                        {BRANDS.filter(b => b.id !== 'todas').map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={handleBulkApply}
                        className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Aplicar Reajuste</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prices Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider z-10 shadow-2xs">
                  <tr>
                    <th className="p-3">Produto & Marca</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3 text-right">Preço Original</th>
                    <th className="p-3 text-right">Preço Atual (R$)</th>
                    <th className="p-3 text-center">Foto</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredProducts.map((p) => {
                    const isEditing = editingId === p.id;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {p.imageUrl ? (
                              <img 
                                src={p.imageUrl} 
                                alt={p.name} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                            <div className="text-[10px] text-slate-500">
                              <span className="font-semibold text-blue-700">{p.brandName}</span> • {p.weight} • Pág. {p.pageNumber}
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-slate-600">{p.category}</td>

                        <td className="p-3 text-right text-slate-400 font-medium">
                          {(p.originalPrice || p.suggestedPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>

                        <td className="p-3 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                step="0.01"
                                value={editPriceInput}
                                onChange={(e) => setEditPriceInput(e.target.value)}
                                className="w-20 px-2 py-1 bg-white border-2 border-blue-600 rounded-lg text-right font-extrabold text-blue-900 outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEditPrice(p.id);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                              />
                              <button
                                onClick={() => saveEditPrice(p.id)}
                                className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => startEditPrice(p.id, p.suggestedPrice)}
                              className="font-extrabold text-sm text-blue-900 cursor-pointer hover:underline inline-flex items-center gap-1"
                            >
                              {p.suggestedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              <Edit3 className="w-3 h-3 text-slate-400" />
                            </div>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          <button
                            onClick={() => setPhotoEditingProduct({ id: p.id, name: p.name, currentUrl: p.imageUrl || '' })}
                            className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg text-[10px] font-bold inline-flex items-center gap-1"
                          >
                            <Camera className="w-3.5 h-3.5 text-blue-600" />
                            <span>Trocar</span>
                          </button>
                        </td>

                        <td className="p-3 text-right">
                          {p.isCustomPrice || p.isCustomImage ? (
                            <button
                              onClick={() => resetProductToDefault(p.id)}
                              className="text-[10px] font-semibold text-red-600 hover:underline inline-flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" /> Restaurar
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">Padrão</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAB: LOGS DE ESTOQUE ===================== */}
        {activeManagerTab === 'logs' && (
          <div className="flex flex-col flex-1 overflow-hidden bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Registro de Entradas, Saídas e Ajustes (Firestore)
                </h3>
                <p className="text-xs text-slate-500">
                  Todas as movimentações de estoque gravadas de forma durável na nuvem.
                </p>
              </div>
              <button
                onClick={refreshStockLogs}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span>Atualizar Logs</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-2xs">
              {stockLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold">Nenhuma movimentação registrada ainda.</p>
                  <p className="text-xs mt-1">Faça um ajuste no estoque para gerar o primeiro registro.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Data / Hora</th>
                      <th className="p-3">Produto</th>
                      <th className="p-3 text-center">Qtd Anterior</th>
                      <th className="p-3 text-center">Variação</th>
                      <th className="p-3 text-center">Novo Estoque</th>
                      <th className="p-3">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stockLogs.map((log, idx) => (
                      <tr key={log.id || idx} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-500 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {log.productName}
                        </td>
                        <td className="p-3 text-center text-slate-600">
                          {log.previousStock} un
                        </td>
                        <td className="p-3 text-center font-extrabold">
                          <span className={log.changeAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                            {log.changeAmount >= 0 ? `+${log.changeAmount}` : log.changeAmount}
                          </span>
                        </td>
                        <td className="p-3 text-center font-extrabold text-blue-900">
                          {log.newStock} un
                        </td>
                        <td className="p-3 text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {log.reason}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-900 text-slate-300 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Sincronização com Cloud Firestore Realtime ativa</span>
          </div>

          <button
            onClick={() => setIsPriceManagerOpen(false)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>

        {/* Modal de Confirmação: Inicializar Firestore */}
        {showSeedModal && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">Inicializar Firestore</h4>
                    <p className="text-xs text-slate-500">Popular estoque inicial em lote</p>
                  </div>
                </div>
                <button
                  onClick={() => !isSeedingStock && setShowSeedModal(false)}
                  disabled={isSeedingStock}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <p>
                  Esta ação definirá o estoque inicial de todos os <strong>{products.length} produtos</strong> do catálogo no banco de dados Firestore em tempo real.
                </p>
                <p className="text-[11px] text-slate-500">
                  Ideal para cadastrar ou reiniciar o estoque da loja rapidamente.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Quantidade inicial para cada produto:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={seedQtyInput}
                    onChange={(e) => setSeedQtyInput(e.target.value)}
                    disabled={isSeedingStock}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                    placeholder="Ex: 50"
                  />
                  <div className="flex gap-1">
                    {[20, 50, 100].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSeedQtyInput(preset.toString())}
                        disabled={isSeedingStock}
                        className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        {preset} un
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSeedModal(false)}
                  disabled={isSeedingStock}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSeedAllStock(parseInt(seedQtyInput, 10) || 50)}
                  disabled={isSeedingStock}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSeedingStock ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Gravando no Firebase...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirmar e Inicializar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Troca de Foto */}
        {photoEditingProduct && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-700" />
                  <h4 className="font-bold text-sm text-slate-900">Alterar Foto do Produto</h4>
                </div>
                <button
                  onClick={() => setPhotoEditingProduct(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                {photoEditingProduct.name}
              </p>

              {photoEditingProduct.currentUrl && (
                <div className="w-28 h-28 mx-auto rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                  <img
                    src={photoEditingProduct.currentUrl}
                    alt={photoEditingProduct.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              )}

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Upload de Imagem (do seu computador/celular):
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileUpload}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ou Cole a URL da Imagem:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://exemplo.com/imagem.png"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-blue-600"
                    />
                    <button
                      onClick={handlePhotoUrlSubmit}
                      className="px-3 py-2 bg-blue-700 text-white text-xs font-bold rounded-xl hover:bg-blue-800"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
