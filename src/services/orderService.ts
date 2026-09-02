import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  updateDoc,
  deleteDoc,
  writeBatch
} from '../lib/firebase';
import { Order, OrderStatus, SalesRep, CartItem, OrderCustomerInfo, CompanySettings } from '../types';
import { INITIAL_SALES_REPS, DEFAULT_COMPANY_SETTINGS } from '../data/salesReps';

export const ORDERS_COLLECTION = 'orders';
export const SALES_REPS_COLLECTION = 'sales_reps';

const LOCAL_ORDERS_KEY = 'real_alimentos_orders_cache_v1';
const LOCAL_REPS_KEY = 'real_alimentos_reps_cache_v1';
const LOCAL_DELETED_REPS_KEY = 'real_alimentos_deleted_reps_v1';

/**
 * Sanitize and clean a SalesRep object for Firestore storage.
 * CRITICAL: Firestore throws 'Unsupported field value: undefined' if any field is undefined.
 */
export function sanitizeSalesRepForFirestore(rep: Partial<SalesRep>): Record<string, any> {
  const clean: Record<string, any> = {
    id: rep.id || `rep-${Date.now()}`,
    name: (rep.name || 'Vendedor').trim(),
    code: (rep.code || 'RTV-01').trim().toUpperCase(),
    phone: (rep.phone || '').replace(/\D/g, ''),
    regionName: (rep.regionName || 'Geral').trim(),
    cities: Array.isArray(rep.cities) ? rep.cities.map(c => String(c).trim()).filter(Boolean) : [],
    isActive: rep.isActive !== false,
    updatedAt: new Date().toISOString()
  };

  clean.password = rep.password && rep.password.trim() ? rep.password.trim() : '1234';

  if (rep.lastPasswordChange) {
    clean.lastPasswordChange = rep.lastPasswordChange;
  }

  if (rep.email && typeof rep.email === 'string' && rep.email.trim()) {
    clean.email = rep.email.trim();
  }

  if (rep.notes && typeof rep.notes === 'string' && rep.notes.trim()) {
    clean.notes = rep.notes.trim();
  }

  if (rep.avatarUrl && typeof rep.avatarUrl === 'string' && rep.avatarUrl.trim()) {
    clean.avatarUrl = rep.avatarUrl.trim();
  }

  // Double check: strictly remove any key that is undefined
  Object.keys(clean).forEach((k) => {
    if (clean[k] === undefined) {
      delete clean[k];
    }
  });

  return clean;
}

/**
 * Generate human-friendly Unique Order ID: PED-YYYYMMDD-XXXX
 */
export function generateOrderId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PED-${dateStr}-${randomSuffix}`;
}

/**
 * Save new customer order to Firestore
 */
export async function createOrder(
  cartItems: CartItem[],
  customer: OrderCustomerInfo,
  salesRep: SalesRep
): Promise<Order> {
  const orderId = generateOrderId();
  const now = new Date().toISOString();

  const totalVolumes = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cartItems.reduce((acc, item) => acc + (item.product.suggestedPrice * item.quantity), 0);

  const order: Order = {
    id: orderId,
    createdAt: now,
    updatedAt: now,
    status: 'aguardando_vendedor',
    customer: {
      name: customer.name,
      companyName: customer.companyName || '',
      cnpjOrCpf: customer.cnpjOrCpf || '',
      stateRegistration: customer.stateRegistration || '',
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address,
      neighborhood: customer.neighborhood || '',
      city: customer.city,
      state: customer.state || 'SP',
      zipCode: customer.zipCode || '',
      paymentMethod: customer.paymentMethod || 'A combinar com o vendedor',
      deliveryNotes: customer.deliveryNotes || ''
    },
    salesRep: {
      id: salesRep.id,
      name: salesRep.name,
      code: salesRep.code,
      phone: salesRep.phone,
      regionName: salesRep.regionName
    },
    items: cartItems.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      brandName: item.product.brandName,
      weight: item.product.weight,
      pageNumber: item.product.pageNumber,
      quantity: item.quantity,
      unitType: item.unitType,
      unitPrice: item.product.suggestedPrice,
      totalPrice: item.product.suggestedPrice * item.quantity,
      notes: item.notes || '',
      imageUrl: item.product.imageUrl
    })),
    totalVolumes,
    totalAmount,
    discountPercentage: 0,
    discountAmount: 0,
    finalAmount: totalAmount,
    representativeNotes: '',
    paymentTerms: customer.paymentMethod || 'A combinar',
    deliveryDatePreference: 'Imediata / Conforme Rota'
  };

  // Save to Firestore
  try {
    const orderDocRef = doc(db, ORDERS_COLLECTION, orderId);
    await setDoc(orderDocRef, order);
  } catch (err) {
    console.warn('Could not save order to Firestore, saving to local cache:', err);
    // Fallback to local cache
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify([order, ...existing]));
    } catch {}
  }

  return order;
}

/**
 * Subscribe to real-time orders from Firestore
 */
export function subscribeToOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const ordersCol = collection(db, ORDERS_COLLECTION);
    const q = query(ordersCol, orderBy('createdAt', 'desc'), limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as Order), id: d.id });
        });
        // Also update local cache
        localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(list));
        onUpdate(list);
      },
      (err) => {
        console.error('Error in onSnapshot orders:', err);
        // Load fallback from localStorage
        try {
          const cached = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
          onUpdate(cached);
        } catch {}
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.error('Failed to attach orders listener:', err);
    try {
      const cached = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
      onUpdate(cached);
    } catch {}
    return () => {};
  }
}

/**
 * Update order details or status in Firestore
 */
export async function updateOrderInFirestore(
  orderId: string,
  updates: Partial<Order>
): Promise<void> {
  const now = new Date().toISOString();
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);

  await setDoc(orderRef, { ...updates, updatedAt: now }, { merge: true });

  // Update local cache
  try {
    const cached: Order[] = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
    const updated = cached.map(o => o.id === orderId ? { ...o, ...updates, updatedAt: now } : o);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Delete an order from Firestore and local cache
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
  } catch (err) {
    console.warn('Could not delete order from Firestore, deleting locally:', err);
  }

  // Update local cache
  try {
    const cached: Order[] = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || '[]');
    const updated = cached.filter(o => o.id !== orderId);
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Format Customer -> Representative WhatsApp Message
 */
export function buildCustomerToRepWhatsAppMessage(order: Order): string {
  const lines: string[] = [
    `📦 *NOVO PEDIDO DO CLIENTE - REAL ALIMENTOS*`,
    `🔖 *Código:* ${order.id}`,
    `👤 *Representante:* ${order.salesRep.name} (${order.salesRep.code})`,
    `📍 *Região:* ${order.salesRep.regionName}`,
    `📅 *Data:* ${new Date(order.createdAt).toLocaleDateString('pt-BR')} às ${new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    `----------------------------------------`,
    `🏢 *DADOS DO CLIENTE:*`,
    `• *Contato:* ${order.customer.name}`,
    order.customer.companyName ? `• *Razão Social / Fantasia:* ${order.customer.companyName}` : '',
    order.customer.cnpjOrCpf ? `• *CNPJ/CPF:* ${order.customer.cnpjOrCpf}` : '',
    order.customer.stateRegistration ? `• *Inscrição Estadual:* ${order.customer.stateRegistration}` : '',
    `• *Telefone:* ${order.customer.phone}`,
    order.customer.email ? `• *E-mail:* ${order.customer.email}` : '',
    `• *Endereço:* ${order.customer.address} - ${order.customer.city}/${order.customer.state || 'SP'}`,
    order.customer.neighborhood ? `• *Bairro:* ${order.customer.neighborhood}` : '',
    `• *Forma de Pagamento:* ${order.customer.paymentMethod || 'A combinar'}`,
    order.customer.deliveryNotes ? `• *Obs Entrega:* ${order.customer.deliveryNotes}` : '',
    `----------------------------------------`,
    `🛒 *ITENS SELECIONADOS NO CATÁLOGO:*`,
    ...order.items.map((item, idx) => {
      const unit = item.unitType === 'caixa' ? 'CX' : item.unitType === 'fardo' ? 'FARDO' : 'UN';
      const subtotal = item.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      return `${idx + 1}. *${item.productName}*\n   • Marca: ${item.brandName} (Pág. ${item.pageNumber})\n   • Qtd: ${item.quantity} ${unit} (${item.weight})\n   • Subtotal: ${subtotal}${item.notes ? `\n   • Obs: ${item.notes}` : ''}`;
    }),
    `----------------------------------------`,
    `📊 *RESUMO DO PEDIDO:*`,
    `• *Total de Volumes:* ${order.totalVolumes} volumes`,
    `• *Valor Total Estimado:* ${order.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
    `----------------------------------------`,
    `💬 Olá ${order.salesRep.name}! Montei este pedido pelo Catálogo Digital Real Alimentos. Aguardo seu retorno para confirmação e fechamento!`
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * Format Representative -> Company (Matriz / Faturamento / Emissão de NF) WhatsApp Message
 */
export function buildRepToCompanyWhatsAppMessage(
  order: Order,
  companySettings: CompanySettings = DEFAULT_COMPANY_SETTINGS
): string {
  const lines: string[] = [
    `🚨 *ENCAMINHAMENTO DE PEDIDO PARA FATURAMENTO E EMISSÃO DE NF*`,
    `🏢 *MATRIZ REAL ALIMENTOS - CENTRAL DE VENDAS & EXPEDIÇÃO*`,
    `----------------------------------------`,
    `🔖 *PEDIDO Nº:* ${order.id}`,
    `👔 *Vendedor Responsável:* ${order.salesRep.name} (${order.salesRep.code})`,
    `📞 *WhatsApp do Vendedor:* ${order.salesRep.phone}`,
    `📍 *Região / Rota:* ${order.salesRep.regionName}`,
    `📅 *Data de Emissão:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    `----------------------------------------`,
    `📑 *DADOS FISCAIS PARA FATURAMENTO / NOTA FISCAL:*`,
    `• *Razão Social / Nome:* ${order.customer.companyName || order.customer.name}`,
    order.customer.cnpjOrCpf ? `• *CNPJ / CPF:* ${order.customer.cnpjOrCpf}` : '• *CNPJ/CPF:* A coletar / Consumidor Final',
    order.customer.stateRegistration ? `• *Inscrição Estadual (IE):* ${order.customer.stateRegistration}` : '• *Inscrição Estadual:* Isento / Não informada',
    `• *Responsável / Comprador:* ${order.customer.name}`,
    `• *Telefone / Contato:* ${order.customer.phone}`,
    order.customer.email ? `• *E-mail para XML/Danfe:* ${order.customer.email}` : '',
    `• *Endereço de Entrega:* ${order.customer.address}`,
    order.customer.neighborhood ? `• *Bairro:* ${order.customer.neighborhood}` : '',
    `• *Cidade / UF:* ${order.customer.city} / ${order.customer.state || 'SP'}`,
    order.customer.zipCode ? `• *CEP:* ${order.customer.zipCode}` : '',
    `----------------------------------------`,
    `💳 *CONDIÇÕES COMERCIAIS FECHADAS PELO VENDEDOR:*`,
    `• *Prazo / Condição:* ${order.paymentTerms || order.customer.paymentMethod || 'À Vista / Boleto 28DD'}`,
    `• *Previsão de Entrega Solicitada:* ${order.deliveryDatePreference || 'Próxima rota padrão'}`,
    order.representativeNotes ? `• *Instruções Comerciais:* ${order.representativeNotes}` : '',
    `----------------------------------------`,
    `📦 *ITENS CONSOLIDADOS PARA EXPEDIÇÃO:*`,
    ...order.items.map((item, idx) => {
      const unit = item.unitType === 'caixa' ? 'CX' : item.unitType === 'fardo' ? 'FARDO' : 'UN';
      const unitPriceStr = item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const subtotalStr = item.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      return `${idx + 1}. [${item.brandName.toUpperCase()}] *${item.productName}*\n   • Qtd: ${item.quantity} ${unit} (${item.weight}) | Unit: ${unitPriceStr} | Total: ${subtotalStr}${item.notes ? ` (Obs: ${item.notes})` : ''}`;
    }),
    `----------------------------------------`,
    `💰 *TOTAIS:*`,
    `• *Total de Volumes:* ${order.totalVolumes} volumes`,
    `• *Subtotal:* ${order.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
    order.discountAmount && order.discountAmount > 0 ? `• *Desconto Aplicado:* -${order.discountAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (${order.discountPercentage}%)` : '',
    `• *VALOR FINAL DO PEDIDO / NF:* ${order.finalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
    `----------------------------------------`,
    `Favor gerar pedido no ERP e emitir Nota Fiscal para separação e despacho na expedição. Obrigado!`
  ].filter(Boolean);

  return lines.join('\n');
}

/**
 * Safe external URL opener that works seamlessly across iframes, pop-up blockers, and direct tabs
 */
export function safeOpenUrl(url: string): void {
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    window.open(url, '_blank');
  }
}

/**
 * Dispatch Customer -> Representative WhatsApp
 */
export function sendOrderToRepresentativeWhatsApp(order: Order): void {
  const message = encodeURIComponent(buildCustomerToRepWhatsAppMessage(order));
  const repPhone = order.salesRep.phone.replace(/\D/g, '');
  const url = `https://api.whatsapp.com/send?phone=${repPhone}&text=${message}`;
  safeOpenUrl(url);
}

/**
 * Dispatch Representative -> Company Matriz Faturamento WhatsApp
 */
export async function forwardOrderToCompanyWhatsApp(
  order: Order,
  companySettings: CompanySettings = DEFAULT_COMPANY_SETTINGS,
  repName: string = order.salesRep.name
): Promise<void> {
  // Update status in Firestore
  const now = new Date().toISOString();
  await updateOrderInFirestore(order.id, {
    status: 'enviado_faturamento',
    forwardedToCompanyAt: now,
    forwardedByRepName: repName
  });

  const message = encodeURIComponent(buildRepToCompanyWhatsAppMessage(order, companySettings));
  const companyPhone = companySettings.whatsappFaturamento.replace(/\D/g, '');
  const url = `https://api.whatsapp.com/send?phone=${companyPhone}&text=${message}`;
  safeOpenUrl(url);
}

/**
 * Subscribe to Real-Time Sales Representatives from Firestore
 * Features:
 * - Two-way reconciliation: prevents Firestore snapshots from wiping newly registered local reps.
 * - Auto-sync: automatically syncs any local reps missing in the cloud to Firestore.
 * - Deletion tracking: respects deleted reps so they aren't resurrected.
 */
export function subscribeToSalesReps(
  onUpdate: (reps: SalesRep[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const repsCol = collection(db, SALES_REPS_COLLECTION);

    return onSnapshot(
      repsCol,
      async (snapshot) => {
        // Read locally cached reps and deletion registry
        let cachedReps: SalesRep[] = [];
        let deletedIds: string[] = [];
        try {
          cachedReps = JSON.parse(localStorage.getItem(LOCAL_REPS_KEY) || '[]');
          deletedIds = JSON.parse(localStorage.getItem(LOCAL_DELETED_REPS_KEY) || '[]');
        } catch {}

        if (snapshot.empty) {
          // If Firestore is completely empty, seed with initial sales reps + any existing un-deleted local reps!
          console.log('[Firestore] Seeding initial sales reps to Firestore...');
          const combinedMap = new Map<string, SalesRep>();
          INITIAL_SALES_REPS.forEach(r => combinedMap.set(r.id, r));
          cachedReps.forEach(r => {
            if (!deletedIds.includes(r.id)) {
              combinedMap.set(r.id, r);
            }
          });

          const toSeed = Array.from(combinedMap.values());
          try {
            const batch = writeBatch(db);
            toSeed.forEach(rep => {
              const clean = sanitizeSalesRepForFirestore(rep);
              const ref = doc(db, SALES_REPS_COLLECTION, rep.id);
              batch.set(ref, clean);
            });
            await batch.commit();
            console.log('[Firestore] Initial reps seeded successfully.');
          } catch (seedErr) {
            console.warn('[Firestore] Failed to seed reps batch:', seedErr);
          }
          localStorage.setItem(LOCAL_REPS_KEY, JSON.stringify(toSeed));
          onUpdate(toSeed);
          return;
        }

        const firestoreList: SalesRep[] = [];
        const firestoreIds = new Set<string>();

        snapshot.forEach((d) => {
          const rep = { ...(d.data() as SalesRep), id: d.id };
          // If marked deleted locally by admin, remove from Firestore
          if (deletedIds.includes(d.id)) {
            deleteDoc(doc(db, SALES_REPS_COLLECTION, d.id)).catch(() => {});
            return;
          }
          firestoreList.push(rep);
          firestoreIds.add(d.id);
        });

        // RECONCILIATION: Check if any locally added seller was not yet synced to Firestore!
        // This ensures that newly registered sellers NEVER disappear when Firestore refreshes!
        const missingFromFirestore = cachedReps.filter(
          localRep => !firestoreIds.has(localRep.id) && !deletedIds.includes(localRep.id)
        );

        if (missingFromFirestore.length > 0) {
          console.log(`[Firestore] Syncing ${missingFromFirestore.length} locally created sales reps to Firestore...`);
          // Save missing reps to Firestore in background with sanitization
          missingFromFirestore.forEach(async (rep) => {
            try {
              const clean = sanitizeSalesRepForFirestore(rep);
              await setDoc(doc(db, SALES_REPS_COLLECTION, rep.id), clean, { merge: true });
              console.log(`[Firestore] Successfully synced local rep ${rep.id} (${rep.name}) to Firestore.`);
            } catch (syncErr) {
              console.warn(`[Firestore] Failed to background-sync local rep ${rep.id}:`, syncErr);
            }
          });
          // Include them in the merged list so they are immediately visible and preserved in state
          firestoreList.push(...missingFromFirestore);
        }

        // Sort: active first, then by code
        firestoreList.sort((a, b) => {
          if (a.isActive && !b.isActive) return -1;
          if (!a.isActive && b.isActive) return 1;
          return (a.code || '').localeCompare(b.code || '');
        });

        localStorage.setItem(LOCAL_REPS_KEY, JSON.stringify(firestoreList));
        onUpdate(firestoreList);
      },
      (err) => {
        console.error('Error in onSnapshot sales_reps:', err);
        try {
          const cached = JSON.parse(localStorage.getItem(LOCAL_REPS_KEY) || '[]');
          onUpdate(cached.length > 0 ? cached : INITIAL_SALES_REPS);
        } catch {
          onUpdate(INITIAL_SALES_REPS);
        }
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.error('Failed to attach sales reps listener:', err);
    try {
      const cached = JSON.parse(localStorage.getItem(LOCAL_REPS_KEY) || '[]');
      onUpdate(cached.length > 0 ? cached : INITIAL_SALES_REPS);
    } catch {
      onUpdate(INITIAL_SALES_REPS);
    }
    return () => {};
  }
}

/**
 * Save or update a Sales Representative in Firestore and local cache
 */
export async function saveSalesRepInFirestore(rep: SalesRep): Promise<void> {
  const cleanData = sanitizeSalesRepForFirestore(rep) as SalesRep;

  // 1. Remove from deleted registry if it was previously marked deleted
  try {
    const deletedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_DELETED_REPS_KEY) || '[]');
    const filteredDeleted = deletedIds.filter(id => id !== cleanData.id);
    localStorage.setItem(LOCAL_DELETED_REPS_KEY, JSON.stringify(filteredDeleted));
  } catch {}

  // 2. Immediately update local storage so user has zero latency and offline persistence
  try {
    const cached: SalesRep[] = JSON.parse(localStorage.getItem(LOCAL_REPS_KEY) || '[]');
    const index = cached.findIndex(r => r.id === cleanData.id);
    let updated: SalesRep[];
    if (index >= 0) {
      updated = [...cached];
      updated[index] = cleanData;
    } else {
      updated = [cleanData, ...cached];
    }
    localStorage.setItem(LOCAL_REPS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to update local sales reps cache:', e);
  }

  // 3. Persist to Firestore with sanitized payload (no unsupported undefined values)
  try {
    const repRef = doc(db, SALES_REPS_COLLECTION, cleanData.id);
    await setDoc(repRef, cleanData, { merge: true });
    console.log(`[Firestore] Successfully saved sales rep ${cleanData.id} (${cleanData.name})`);
  } catch (err) {
    console.error('CRITICAL: Error saving sales rep to Firestore:', err);
    throw err;
  }
}

/**
 * Delete a Sales Representative from Firestore and local cache
 */
export async function deleteSalesRepFromFirestore(repId: string): Promise<void> {
  // 1. Mark in deleted tracking list to avoid reconciliation resurrection
  try {
    const deletedIds: string[] = JSON.parse(localStorage.getItem(LOCAL_DELETED_REPS_KEY) || '[]');
    if (!deletedIds.includes(repId)) {
      deletedIds.push(repId);
      localStorage.setItem(LOCAL_DELETED_REPS_KEY, JSON.stringify(deletedIds));
    }
  } catch {}

  // 2. Delete from Firestore
  try {
    const repRef = doc(db, SALES_REPS_COLLECTION, repId);
    await deleteDoc(repRef);
    console.log(`[Firestore] Successfully deleted sales rep ${repId}`);
  } catch (err) {
    console.warn('Could not delete sales rep from Firestore:', err);
  }

  // 3. Update local cache
  try {
    const cached: SalesRep[] = JSON.parse(localStorage.getItem(LOCAL_REPS_KEY) || '[]');
    const updated = cached.filter(r => r.id !== repId);
    localStorage.setItem(LOCAL_REPS_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Reset all Sales Reps to default initial list
 */
export async function resetSalesRepsToDefault(): Promise<void> {
  // Clear deleted tracking list
  try {
    localStorage.removeItem(LOCAL_DELETED_REPS_KEY);
  } catch {}

  try {
    const repsCol = collection(db, SALES_REPS_COLLECTION);
    const snap = await getDocs(repsCol);
    const batch = writeBatch(db);
    snap.forEach((d) => {
      batch.delete(d.ref);
    });
    INITIAL_SALES_REPS.forEach((rep) => {
      const clean = sanitizeSalesRepForFirestore(rep);
      const ref = doc(db, SALES_REPS_COLLECTION, rep.id);
      batch.set(ref, clean);
    });
    await batch.commit();
  } catch (err) {
    console.warn('Could not reset sales reps in Firestore:', err);
  }
  localStorage.setItem(LOCAL_REPS_KEY, JSON.stringify(INITIAL_SALES_REPS));
}

