import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { Product, BulkPriceAdjustment, ProductStock, StockMovementLog } from '../types';
import { ALL_PRODUCTS } from '../data/products';
import { 
  subscribeToStock, 
  updateProductStockInFirestore, 
  seedInitialStockToFirestore, 
  bulkAdjustStockInFirestore, 
  deductStockForOrder, 
  fetchStockLogs,
  FirebaseSyncState,
  DEFAULT_INITIAL_STOCK,
  DEFAULT_MIN_ALERT
} from '../services/stockService';
import {
  subscribeToProductCustomizations,
  saveProductCustomizationInFirestore,
  resetProductCustomizationInFirestore,
  syncLocalCustomizationsToFirestore
} from '../services/productCustomizationService';

interface ProductContextType {
  products: Product[];
  stockMap: Record<string, ProductStock>;
  firebaseSyncState: FirebaseSyncState;
  customPricesCount: number;
  customImagesCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  updateProductPrice: (productId: string, newPrice: number) => void;
  updateProductImage: (productId: string, newImageUrl: string) => void;
  updateProductStock: (productId: string, newQty: number, reason?: string, minAlert?: number) => Promise<void>;
  bulkAdjustStock: (productIds: string[], amount: number, reason?: string) => Promise<number>;
  seedInitialStock: (defaultQty?: number) => Promise<number>;
  deductOrderStock: (items: Array<{ productId: string; productName: string; quantity: number }>) => Promise<void>;
  applyBulkPriceAdjustment: (adj: BulkPriceAdjustment) => { updatedCount: number };
  resetProductToDefault: (productId: string) => void;
  resetAllPricesToDefault: () => void;
  resetAllImagesToDefault: () => void;
  exportPriceTable: (format: 'json' | 'csv') => void;
  importPriceTable: (dataString: string) => { success: boolean; importedCount: number; message: string };
  exportStockReport: () => void;
  stockLogs: StockMovementLog[];
  refreshStockLogs: () => Promise<void>;
  isPriceManagerOpen: boolean;
  setIsPriceManagerOpen: (open: boolean) => void;
  isStockManagerOpen: boolean;
  setIsStockManagerOpen: (open: boolean) => void;
  activeManagerTab: 'prices' | 'stock' | 'logs';
  setActiveManagerTab: (tab: 'prices' | 'stock' | 'logs') => void;
  editingProductForPrice: Product | null;
  setEditingProductForPrice: (product: Product | null) => void;
  getProductById: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const CUSTOM_PRICES_STORAGE_KEY = 'real_alimentos_custom_prices_v1';
const CUSTOM_IMAGES_STORAGE_KEY = 'real_alimentos_custom_images_v1';
const LOCAL_STOCK_CACHE_KEY = 'real_alimentos_stock_cache_v1';

export function ProductProvider({ children }: { children: ReactNode }) {
  // Map of productId -> customPrice
  const [customPrices, setCustomPrices] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_PRICES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Map of productId -> customImageUrl
  const [customImages, setCustomImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_IMAGES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Map of productId -> ProductStock (synced with Firebase)
  const [stockMap, setStockMap] = useState<Record<string, ProductStock>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STOCK_CACHE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Firebase connection and sync status
  const [firebaseSyncState, setFirebaseSyncState] = useState<FirebaseSyncState>({
    isConnected: false,
    isSyncing: true,
    lastSyncTime: null,
    error: null
  });

  const [stockLogs, setStockLogs] = useState<StockMovementLog[]>([]);
  const [isPriceManagerOpen, setIsPriceManagerOpen] = useState(false);
  const [isStockManagerOpen, setIsStockManagerOpen] = useState(false);
  const [activeManagerTab, setActiveManagerTab] = useState<'prices' | 'stock' | 'logs'>('prices');
  const [editingProductForPrice, setEditingProductForPrice] = useState<Product | null>(null);

  // Initial local to Firestore migration (runs once if local data exists)
  useEffect(() => {
    try {
      const savedPrices = localStorage.getItem(CUSTOM_PRICES_STORAGE_KEY);
      const savedImages = localStorage.getItem(CUSTOM_IMAGES_STORAGE_KEY);
      const parsedPrices = savedPrices ? JSON.parse(savedPrices) : {};
      const parsedImages = savedImages ? JSON.parse(savedImages) : {};
      if (Object.keys(parsedPrices).length > 0 || Object.keys(parsedImages).length > 0) {
        syncLocalCustomizationsToFirestore(parsedPrices, parsedImages);
      }
    } catch (e) {
      console.warn('Could not sync initial local customizations to Firestore:', e);
    }
  }, []);

  // Subscribe to real-time Firestore product customizations (photos & prices)
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToProductCustomizations(
      ({ prices, images }) => {
        if (!isMounted) return;
        setCustomPrices((prev) => {
          const merged = { ...prev, ...prices };
          return merged;
        });
        setCustomImages((prev) => {
          const merged = { ...prev, ...images };
          return merged;
        });
      },
      (err) => {
        console.warn('Firebase customizations sync warning:', err);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Subscribe to real-time Firestore stock collection
  useEffect(() => {
    let isMounted = true;
    setFirebaseSyncState(prev => ({ ...prev, isSyncing: true }));

    const unsubscribe = subscribeToStock(
      (incomingStock) => {
        if (!isMounted) return;
        setStockMap(incomingStock);
        setFirebaseSyncState({
          isConnected: true,
          isSyncing: false,
          lastSyncTime: new Date(),
          error: null
        });

        // Save local cache for offline resiliency
        try {
          localStorage.setItem(LOCAL_STOCK_CACHE_KEY, JSON.stringify(incomingStock));
        } catch (e) {
          console.warn('Could not cache stock locally:', e);
        }
      },
      (err) => {
        if (!isMounted) return;
        console.warn('Firebase stock sync warning:', err.message);
        setFirebaseSyncState(prev => ({
          ...prev,
          isConnected: false,
          isSyncing: false,
          error: err.message
        }));
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Fetch initial logs when manager opens
  const refreshStockLogs = async () => {
    const logs = await fetchStockLogs(30);
    setStockLogs(logs);
  };

  useEffect(() => {
    if (isPriceManagerOpen || isStockManagerOpen) {
      refreshStockLogs();
    }
  }, [isPriceManagerOpen, isStockManagerOpen]);

  // Persist custom prices
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_PRICES_STORAGE_KEY, JSON.stringify(customPrices));
    } catch (e) {
      console.error('Failed to save custom prices', e);
    }
  }, [customPrices]);

  // Persist custom images
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_IMAGES_STORAGE_KEY, JSON.stringify(customImages));
    } catch (e) {
      console.error('Failed to save custom images', e);
    }
  }, [customImages]);

  // Compute merged products with Prices, Images & Real-Time Stock
  const products = useMemo(() => {
    return ALL_PRODUCTS.map((raw) => {
      const hasCustomPrice = customPrices[raw.id] !== undefined;
      const hasCustomImage = customImages[raw.id] !== undefined;

      const effectivePrice = hasCustomPrice ? customPrices[raw.id] : raw.suggestedPrice;
      const effectiveImage = hasCustomImage ? customImages[raw.id] : raw.imageUrl;

      // Stock from Firebase or default
      const stockDoc = stockMap[raw.id];
      const stockQuantity = stockDoc !== undefined ? stockDoc.stockQuantity : DEFAULT_INITIAL_STOCK;
      const minStockAlert = stockDoc?.minStockAlert ?? DEFAULT_MIN_ALERT;
      const isOutOfStock = stockQuantity <= 0;
      const isUnlimitedStock = stockDoc?.isUnlimited ?? false;

      return {
        ...raw,
        suggestedPrice: effectivePrice,
        imageUrl: effectiveImage,
        originalPrice: raw.originalPrice ?? raw.suggestedPrice,
        isCustomPrice: hasCustomPrice,
        isCustomImage: hasCustomImage,
        stockQuantity,
        minStockAlert,
        isOutOfStock,
        isUnlimitedStock
      };
    });
  }, [customPrices, customImages, stockMap]);

  const customPricesCount = Object.keys(customPrices).length;
  const customImagesCount = Object.keys(customImages).length;

  const lowStockCount = useMemo(() => {
    return products.filter(p => !p.isUnlimitedStock && (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= (p.minStockAlert ?? 10)).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter(p => !p.isUnlimitedStock && (p.stockQuantity ?? 0) <= 0).length;
  }, [products]);

  const updateProductPrice = (productId: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) return;
    const cleanPrice = Number(newPrice.toFixed(2));
    setCustomPrices((prev) => ({
      ...prev,
      [productId]: cleanPrice
    }));
    saveProductCustomizationInFirestore(productId, { customPrice: cleanPrice }).catch(err => {
      console.warn('Failed to persist price in Firestore:', err);
    });
  };

  const updateProductImage = (productId: string, newImageUrl: string) => {
    if (!newImageUrl.trim()) return;
    const cleanUrl = newImageUrl.trim();
    setCustomImages((prev) => ({
      ...prev,
      [productId]: cleanUrl
    }));
    saveProductCustomizationInFirestore(productId, { customImageUrl: cleanUrl }).catch(err => {
      console.warn('Failed to persist image in Firestore:', err);
    });
  };

  const updateProductStock = async (
    productId: string, 
    newQty: number, 
    reason: string = 'Ajuste manual', 
    minAlert?: number
  ) => {
    const prod = products.find(p => p.id === productId);
    const prevQty = prod?.stockQuantity ?? DEFAULT_INITIAL_STOCK;
    const cleanQty = Math.max(0, Math.round(newQty));
    const effectiveMinAlert = minAlert ?? prod?.minStockAlert ?? DEFAULT_MIN_ALERT;

    // Optimistic update
    setStockMap(prev => ({
      ...prev,
      [productId]: {
        productId,
        stockQuantity: cleanQty,
        minStockAlert: effectiveMinAlert,
        lastUpdated: new Date().toISOString()
      }
    }));

    try {
      await updateProductStockInFirestore(
        productId, 
        cleanQty, 
        prevQty, 
        prod?.name || productId, 
        reason, 
        effectiveMinAlert
      );
      refreshStockLogs();
    } catch (e) {
      console.error('Firestore stock update failed:', e);
    }
  };

  const bulkAdjustStock = async (productIds: string[], amount: number, reason: string = 'Ajuste em massa') => {
    try {
      const count = await bulkAdjustStockInFirestore(productIds, amount, stockMap, reason);
      refreshStockLogs();
      return count;
    } catch (e) {
      console.error('Bulk adjust stock failed:', e);
      return 0;
    }
  };

  const seedInitialStock = async (defaultQty: number = DEFAULT_INITIAL_STOCK) => {
    try {
      const count = await seedInitialStockToFirestore(defaultQty, DEFAULT_MIN_ALERT);
      refreshStockLogs();
      return count;
    } catch (e) {
      console.error('Seed stock failed:', e);
      return 0;
    }
  };

  const deductOrderStock = async (items: Array<{ productId: string; productName: string; quantity: number }>) => {
    try {
      await deductStockForOrder(items, stockMap);
      refreshStockLogs();
    } catch (e) {
      console.error('Deduct order stock failed:', e);
    }
  };

  const applyBulkPriceAdjustment = (adj: BulkPriceAdjustment) => {
    let count = 0;
    setCustomPrices((prev) => {
      const next = { ...prev };
      products.forEach((p) => {
        // Check brand condition
        if (adj.brand && adj.brand !== 'todas' && p.brand !== adj.brand) {
          return;
        }
        // Check category condition
        if (adj.category && adj.category !== 'todas' && p.category !== adj.category) {
          return;
        }

        const currentPrice = p.suggestedPrice;
        let adjusted = currentPrice;

        if (adj.type === 'percentage') {
          adjusted = currentPrice * (1 + adj.value / 100);
        } else if (adj.type === 'fixed') {
          adjusted = currentPrice + adj.value;
        }

        if (adjusted < 0.01) adjusted = 0.01;
        adjusted = Number(adjusted.toFixed(2));

        next[p.id] = adjusted;
        count++;
      });
      return next;
    });

    return { updatedCount: count };
  };

  const resetProductToDefault = (productId: string) => {
    setCustomPrices((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    setCustomImages((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    resetProductCustomizationInFirestore(productId).catch((err) => {
      console.warn('Failed to reset product customization in Firestore:', err);
    });
  };

  const resetAllPricesToDefault = () => {
    setCustomPrices({});
  };

  const resetAllImagesToDefault = () => {
    setCustomImages({});
  };

  const exportPriceTable = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const exportData = products.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brandName,
        category: p.category,
        page: p.pageNumber,
        price: p.suggestedPrice,
        originalPrice: p.originalPrice,
        imageUrl: p.imageUrl,
        stockQuantity: p.stockQuantity,
        isCustomPrice: p.isCustomPrice
      }));
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tabela_precos_real_alimentos_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV format
      const header = 'ID;Nome;Marca;Categoria;Pagina;Preco_Atual;Preco_Original;Estoque;Foto_URL\n';
      const rows = products
        .map(
          (p) =>
            `"${p.id}";"${p.name.replace(/"/g, '""')}";"${p.brandName}";"${p.category}";${p.pageNumber};${p.suggestedPrice.toFixed(2)};${(p.originalPrice || p.suggestedPrice).toFixed(2)};${p.stockQuantity || 0};"${p.imageUrl || ''}"`
        )
        .join('\n');
      const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tabela_precos_real_alimentos_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportStockReport = () => {
    const totalUnits = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
    const totalInventoryValue = products.reduce((acc, p) => acc + ((p.stockQuantity || 0) * p.suggestedPrice), 0);

    const header = 'ID;Produto;Marca;Categoria;Qtd_Estoque;Status;Alerta_Minimo;Preco_Unitario_Ref;Valor_Total_Estoque_R$\n';
    const rows = products
      .map((p) => {
        const qty = p.stockQuantity || 0;
        const status = qty <= 0 ? 'ESGOTADO' : qty <= (p.minStockAlert || 10) ? 'ESTOQUE_BAIXO' : 'NORMAL';
        const itemVal = (qty * p.suggestedPrice).toFixed(2);
        return `"${p.id}";"${p.name.replace(/"/g, '""')}";"${p.brandName}";"${p.category}";${qty};"${status}";${p.minStockAlert || 10};${p.suggestedPrice.toFixed(2)};${itemVal}`;
      })
      .join('\n');

    const summary = `\n\nResumo:;Total Itens Cadastrados: ${products.length};Total Unidades Estoque: ${totalUnits};Valor Total Estoque: R$ ${totalInventoryValue.toFixed(2)}`;
    const blob = new Blob(['\uFEFF' + header + rows + summary], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_estoque_real_alimentos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importPriceTable = (dataString: string): { success: boolean; importedCount: number; message: string } => {
    try {
      let importedPrices: Record<string, number> = {};
      let count = 0;

      if (dataString.trim().startsWith('[')) {
        // JSON format
        const parsed = JSON.parse(dataString);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any) => {
            if (item.id && typeof item.price === 'number') {
              importedPrices[item.id] = Number(item.price.toFixed(2));
              count++;
            }
          });
        }
      } else {
        // CSV format (semicolon or comma separated)
        const lines = dataString.split('\n');
        lines.forEach((line, idx) => {
          if (idx === 0 || !line.trim()) return; // skip header or blank
          const delimiter = line.includes(';') ? ';' : ',';
          const cols = line.split(delimiter).map(c => c.replace(/^"|"$/g, '').trim());
          const id = cols[0];
          // Try to find price column
          const priceCandidate = parseFloat(cols[5]?.replace(',', '.') || cols[4]?.replace(',', '.'));
          if (id && !isNaN(priceCandidate)) {
            importedPrices[id] = Number(priceCandidate.toFixed(2));
            count++;
          }
        });
      }

      if (count > 0) {
        setCustomPrices((prev) => ({ ...prev, ...importedPrices }));
        return {
          success: true,
          importedCount: count,
          message: `${count} preços de produtos foram importados e aplicados com sucesso!`
        };
      } else {
        return {
          success: false,
          importedCount: 0,
          message: 'Nenhum preço válido foi identificado no arquivo enviado.'
        };
      }
    } catch (e: any) {
      return {
        success: false,
        importedCount: 0,
        message: `Erro ao processar arquivo: ${e?.message || 'Formato inválido'}`
      };
    }
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductContext.Provider
      value={{
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
        deductOrderStock,
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
        isStockManagerOpen,
        setIsStockManagerOpen,
        activeManagerTab,
        setActiveManagerTab,
        editingProductForPrice,
        setEditingProductForPrice,
        getProductById
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}

