import { 
  db, 
  STOCK_COLLECTION, 
  STOCK_LOGS_COLLECTION,
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch,
  addDoc,
  query,
  orderBy,
  limit
} from '../lib/firebase';
import { ProductStock, StockMovementLog } from '../types';
import { ALL_PRODUCTS } from '../data/products';

export interface FirebaseSyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
}

// Initial default stock for catalog items
export const DEFAULT_INITIAL_STOCK = 50;
export const DEFAULT_MIN_ALERT = 10;

/**
 * Subscribe to real-time stock updates from Firestore
 */
export function subscribeToStock(
  onUpdate: (stockMap: Record<string, ProductStock>) => void,
  onError: (error: Error) => void
) {
  try {
    const stockCol = collection(db, STOCK_COLLECTION);
    return onSnapshot(
      stockCol,
      (snapshot) => {
        const stockMap: Record<string, ProductStock> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ProductStock;
          stockMap[docSnap.id] = {
            ...data,
            productId: docSnap.id
          };
        });
        onUpdate(stockMap);
      },
      (err) => {
        console.error('Firestore onSnapshot stock error:', err);
        onError(err);
      }
    );
  } catch (err: any) {
    console.error('Failed to attach stock listener:', err);
    onError(err);
    return () => {};
  }
}

/**
 * Update stock for a single product and log movement
 */
export async function updateProductStockInFirestore(
  productId: string,
  newQuantity: number,
  previousQuantity: number,
  productName: string,
  reason: string = 'Ajuste manual',
  minAlert: number = DEFAULT_MIN_ALERT
): Promise<void> {
  const stockRef = doc(db, STOCK_COLLECTION, productId);
  const now = new Date().toISOString();

  const stockData: ProductStock = {
    productId,
    stockQuantity: Math.max(0, newQuantity),
    minStockAlert: minAlert,
    lastUpdated: now,
    isUnlimited: false
  };

  await setDoc(stockRef, stockData, { merge: true });

  // Add movement log
  try {
    const logsCol = collection(db, STOCK_LOGS_COLLECTION);
    const logData: StockMovementLog = {
      productId,
      productName,
      previousStock: previousQuantity,
      newStock: Math.max(0, newQuantity),
      changeAmount: newQuantity - previousQuantity,
      reason,
      timestamp: now
    };
    await addDoc(logsCol, logData);
  } catch (logErr) {
    console.warn('Could not save stock movement log:', logErr);
  }
}

/**
 * Bulk initialize all catalog products in Firestore if empty
 */
export async function seedInitialStockToFirestore(
  defaultQty: number = DEFAULT_INITIAL_STOCK,
  defaultMin: number = DEFAULT_MIN_ALERT
): Promise<number> {
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  let count = 0;

  for (const product of ALL_PRODUCTS) {
    const stockRef = doc(db, STOCK_COLLECTION, product.id);
    batch.set(
      stockRef,
      {
        productId: product.id,
        stockQuantity: defaultQty,
        minStockAlert: defaultMin,
        unit: product.packageType || 'unidade',
        isUnlimited: false,
        lastUpdated: now
      },
      { merge: true }
    );
    count++;
  }

  await batch.commit();
  return count;
}

/**
 * Bulk adjustment for selected brand or entire catalog
 */
export async function bulkAdjustStockInFirestore(
  productIds: string[],
  amount: number, // e.g. +20 or -5
  currentStockMap: Record<string, ProductStock>,
  reason: string = 'Ajuste em massa'
): Promise<number> {
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  let updatedCount = 0;

  for (const pid of productIds) {
    const current = currentStockMap[pid]?.stockQuantity ?? DEFAULT_INITIAL_STOCK;
    const nextQty = Math.max(0, current + amount);
    const stockRef = doc(db, STOCK_COLLECTION, pid);

    batch.set(
      stockRef,
      {
        productId: pid,
        stockQuantity: nextQty,
        lastUpdated: now
      },
      { merge: true }
    );
    updatedCount++;
  }

  await batch.commit();
  return updatedCount;
}

/**
 * Deduct stock upon order placement
 */
export async function deductStockForOrder(
  items: Array<{ productId: string; productName: string; quantity: number }>,
  currentStockMap: Record<string, ProductStock>
): Promise<void> {
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  for (const item of items) {
    const current = currentStockMap[item.productId]?.stockQuantity ?? DEFAULT_INITIAL_STOCK;
    const newQty = Math.max(0, current - item.quantity);
    const stockRef = doc(db, STOCK_COLLECTION, item.productId);

    batch.set(
      stockRef,
      {
        productId: item.productId,
        stockQuantity: newQty,
        lastUpdated: now
      },
      { merge: true }
    );
  }

  await batch.commit();
}

/**
 * Fetch recent stock logs
 */
export async function fetchStockLogs(maxLogs: number = 30): Promise<StockMovementLog[]> {
  try {
    const logsCol = collection(db, STOCK_LOGS_COLLECTION);
    const q = query(logsCol, orderBy('timestamp', 'desc'), limit(maxLogs));
    const snapshot = await getDocs(q);
    const logs: StockMovementLog[] = [];
    snapshot.forEach((d) => {
      logs.push({ id: d.id, ...(d.data() as StockMovementLog) });
    });
    return logs;
  } catch (e) {
    console.warn('Error fetching stock logs:', e);
    return [];
  }
}
