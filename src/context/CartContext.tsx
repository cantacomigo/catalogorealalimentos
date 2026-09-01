import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { CartItem, Product, OrderCustomerInfo, SalesRep, Order } from '../types';
import { INITIAL_SALES_REPS, findSalesRepByLocation } from '../data/salesReps';
import { 
  createOrder, 
  sendOrderToRepresentativeWhatsApp, 
  subscribeToOrders, 
  updateOrderInFirestore,
  deleteOrderFromFirestore,
  subscribeToSalesReps,
  saveSalesRepInFirestore,
  deleteSalesRepFromFirestore,
  resetSalesRepsToDefault
} from '../services/orderService';
import { deductStockForOrder } from '../services/stockService';
import { useProducts } from './ProductContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, unitType?: 'unidade' | 'caixa' | 'fardo', notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateUnitType: (productId: string, unitType: 'unidade' | 'caixa' | 'fardo') => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItemsCount: number;
  totalEstimatedPrice: number;
  
  // Sales Rep and Regional Selection
  salesReps: SalesRep[];
  selectedSalesRep: SalesRep;
  setSelectedSalesRep: (rep: SalesRep) => void;
  autoDetectRepByLocation: (locationText: string) => SalesRep;
  saveSalesRep: (rep: SalesRep) => Promise<void>;
  deleteSalesRep: (repId: string) => Promise<void>;
  resetSalesReps: () => Promise<void>;
  isRepFormModalOpen: boolean;
  setIsRepFormModalOpen: (open: boolean) => void;
  editingRep: SalesRep | null;
  setEditingRep: (rep: SalesRep | null) => void;
  openCreateRepModal: () => void;
  openEditRepModal: (rep: SalesRep) => void;

  // Order Placement Workflow
  placeCustomerOrder: (customer: OrderCustomerInfo) => Promise<Order>;
  lastPlacedOrder: Order | null;
  setLastPlacedOrder: (order: Order | null) => void;

  // Vendor Portal
  isRepPortalOpen: boolean;
  setIsRepPortalOpen: (open: boolean) => void;
  orders: Order[];
  deleteOrder: (orderId: string) => Promise<void>;
  pendingOrdersCount: number;
  selectedOrderForInvoice: Order | null;
  setSelectedOrderForInvoice: (order: Order | null) => void;

  // UI helpers
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (product: Product | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'real_alimentos_cart_v1';
const SELECTED_REP_KEY = 'real_alimentos_selected_rep_v1';
const REPS_CACHE_KEY = 'real_alimentos_reps_cache_v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const { stockMap } = useProducts();

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [salesReps, setSalesReps] = useState<SalesRep[]>(() => {
    try {
      const saved = localStorage.getItem(REPS_CACHE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_SALES_REPS;
    } catch {
      return INITIAL_SALES_REPS;
    }
  });

  const [selectedSalesRep, setSelectedSalesRepState] = useState<SalesRep>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_REP_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.name) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_SALES_REPS[0];
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRepPortalOpen, setIsRepPortalOpen] = useState(false);
  const [isRepFormModalOpen, setIsRepFormModalOpen] = useState(false);
  const [editingRep, setEditingRep] = useState<SalesRep | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = () => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToastMessage(null);
  };

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3200);
  };

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }, [cart]);

  // Subscribe to real-time sales reps from Firestore
  useEffect(() => {
    const unsubReps = subscribeToSalesReps((newReps) => {
      if (newReps && newReps.length > 0) {
        setSalesReps(newReps);
        // If current selectedSalesRep was updated, sync its state silently without triggering toasts
        setSelectedSalesRepState((currentSelected) => {
          const match = newReps.find(r => r.id === currentSelected.id);
          return match || currentSelected;
        });
      }
    });

    return () => {
      if (typeof unsubReps === 'function') unsubReps();
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Subscribe to real-time orders
  useEffect(() => {
    const unsub = subscribeToOrders((newOrders) => {
      setOrders(newOrders);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const setSelectedSalesRep = (rep: SalesRep) => {
    const isDifferent = selectedSalesRep.id !== rep.id;
    setSelectedSalesRepState(rep);
    try {
      localStorage.setItem(SELECTED_REP_KEY, JSON.stringify(rep));
    } catch {}
    if (isDifferent) {
      showToast(`Vendedor selecionado: ${rep.name} (${rep.regionName})`);
    }
  };

  const saveSalesRep = async (rep: SalesRep): Promise<void> => {
    await saveSalesRepInFirestore(rep);
    setSalesReps((prev) => {
      const idx = prev.findIndex(r => r.id === rep.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = rep;
        return next;
      }
      return [rep, ...prev];
    });
    if (selectedSalesRep.id === rep.id) {
      setSelectedSalesRepState(rep);
    }
    showToast(`Vendedor "${rep.name}" salvo com sucesso!`);
  };

  const deleteSalesRep = async (repId: string): Promise<void> => {
    const repToDelete = salesReps.find(r => r.id === repId);
    await deleteSalesRepFromFirestore(repId);
    setSalesReps((prev) => prev.filter(r => r.id !== repId));
    if (selectedSalesRep.id === repId) {
      const fallback = salesReps.find(r => r.id !== repId) || INITIAL_SALES_REPS[0];
      setSelectedSalesRepState(fallback);
    }
    showToast(`Vendedor "${repToDelete?.name || repId}" removido.`);
  };

  const resetSalesReps = async (): Promise<void> => {
    await resetSalesRepsToDefault();
    setSalesReps(INITIAL_SALES_REPS);
    setSelectedSalesRepState(INITIAL_SALES_REPS[0]);
    showToast('Equipe de vendedores restaurada para os padrões.');
  };

  const openCreateRepModal = () => {
    setEditingRep(null);
    setIsRepFormModalOpen(true);
  };

  const openEditRepModal = (rep: SalesRep) => {
    setEditingRep(rep);
    setIsRepFormModalOpen(true);
  };

  const autoDetectRepByLocation = (locationText: string): SalesRep => {
    const detected = findSalesRepByLocation(locationText, salesReps);
    if (detected && detected.id !== selectedSalesRep.id) {
      setSelectedSalesRepState(detected);
      try {
        localStorage.setItem(SELECTED_REP_KEY, JSON.stringify(detected));
      } catch {}
    }
    return detected;
  };

  const addToCart = (
    product: Product,
    quantity = 1,
    unitType: 'unidade' | 'caixa' | 'fardo' = 'unidade',
    notes?: string
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.unitType === unitType);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          notes: notes || updated[existingIndex].notes
        };
        return updated;
      }
      return [...prev, { product, quantity, unitType, notes }];
    });
    showToast(`"${product.name}" adicionado ao pedido!`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('Item removido do pedido.');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const updateUnitType = (productId: string, unitType: 'unidade' | 'caixa' | 'fardo') => {
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, unitType } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    showToast('Pedido esvaziado.');
  };

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const totalEstimatedPrice = cart.reduce((acc, item) => {
    return acc + (item.product.suggestedPrice * item.quantity);
  }, 0);

  /**
   * Complete client flow:
   * 1. Creates Order document in Firestore
   * 2. Deducts real stock
   * 3. Dispatches WhatsApp to the designated representative
   * 4. Clears local cart and opens confirmation modal
   */
  const placeCustomerOrder = async (customer: OrderCustomerInfo): Promise<Order> => {
    if (cart.length === 0) {
      throw new Error('Seu pedido está vazio!');
    }

    const order = await createOrder(cart, customer, selectedSalesRep);

    // Try deducting stock
    try {
      await deductStockForOrder(
        cart.map(c => ({
          productId: c.product.id,
          productName: c.product.name,
          quantity: c.quantity
        })),
        stockMap
      );
    } catch (e) {
      console.warn('Stock deduction fallback:', e);
    }

    // Trigger WhatsApp directly to designated representative
    sendOrderToRepresentativeWhatsApp(order);

    // Save as last placed order for confirmation screen
    setLastPlacedOrder(order);
    setCart([]);
    setIsCartOpen(false);

    showToast(`Pedido ${order.id} enviado com sucesso para ${selectedSalesRep.name}!`);
    return order;
  };

  const deleteOrder = async (orderId: string): Promise<void> => {
    try {
      await deleteOrderFromFirestore(orderId);
      showToast(`Pedido ${orderId} excluído com sucesso!`);
    } catch (e) {
      console.error('Error deleting order:', e);
      showToast('Erro ao excluir pedido.');
      throw e;
    }
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'aguardando_vendedor').length;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateUnitType,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItemsCount,
        totalEstimatedPrice,
        salesReps,
        selectedSalesRep,
        setSelectedSalesRep,
        autoDetectRepByLocation,
        saveSalesRep,
        deleteSalesRep,
        resetSalesReps,
        isRepFormModalOpen,
        setIsRepFormModalOpen,
        editingRep,
        setEditingRep,
        openCreateRepModal,
        openEditRepModal,
        placeCustomerOrder,
        lastPlacedOrder,
        setLastPlacedOrder,
        isRepPortalOpen,
        setIsRepPortalOpen,
        orders,
        deleteOrder,
        pendingOrdersCount,
        selectedOrderForInvoice,
        setSelectedOrderForInvoice,
        selectedProductForModal,
        setSelectedProductForModal,
        toastMessage,
        showToast,
        hideToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

