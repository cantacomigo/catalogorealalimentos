import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot 
} from '../lib/firebase';
import { Product } from '../types';

export const PRODUCT_CUSTOMIZATIONS_COLLECTION = 'product_customizations';
export const CUSTOM_PRODUCTS_COLLECTION = 'custom_products';
export const DELETED_PRODUCTS_COLLECTION = 'deleted_products';

export interface ProductCustomizationDoc {
  productId: string;
  customImageUrl?: string;
  customPrice?: number;
  updatedAt?: string;
}

/**
 * Sanitizes a Product object for Firestore so that no `undefined` values exist.
 */
export function sanitizeProductForFirestore(product: Product): Record<string, any> {
  const clean: Record<string, any> = {
    id: String(product.id || '').trim(),
    name: String(product.name || '').trim(),
    brand: product.brand || 'vigor',
    brandName: String(product.brandName || 'Real Alimentos').trim(),
    category: String(product.category || 'laticinios-iogurtes').trim(),
    weight: String(product.weight || '1 un').trim(),
    packageType: String(product.packageType || 'Unidade').trim(),
    description: String(product.description || '').trim(),
    temperature: product.temperature || 'resfriado',
    pageNumber: Number(product.pageNumber) || 2,
    tags: Array.isArray(product.tags) ? product.tags.filter(Boolean).map(t => String(t).trim()) : [],
    suggestedPrice: Number(product.suggestedPrice) || 0,
    originalPrice: Number(product.originalPrice ?? product.suggestedPrice) || 0,
    imageUrl: String(product.imageUrl || '').trim(),
    highlight: String(product.highlight || '').trim(),
    barcode: String(product.barcode || '').trim(),
    isCustomProduct: Boolean(product.isCustomProduct ?? true),
    updatedAt: new Date().toISOString()
  };

  // Strip any accidental undefined properties
  Object.keys(clean).forEach((key) => {
    if (clean[key] === undefined) {
      delete clean[key];
    }
  });

  return clean;
}

/**
 * Subscribes to real-time custom/edited products in Firestore
 */
export function subscribeToCustomProducts(
  onUpdate: (productsMap: Record<string, Product>) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, CUSTOM_PRODUCTS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const productsMap: Record<string, Product> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Product;
          if (data && (data.id || docSnap.id) && data.name) {
            const id = data.id || docSnap.id;
            productsMap[id] = {
              ...data,
              id,
              isCustomProduct: true,
              tags: Array.isArray(data.tags) ? data.tags : []
            };
          }
        });
        onUpdate(productsMap);
      },
      (err) => {
        console.warn('Firestore custom_products listener warning:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Failed to subscribe to custom_products:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Save or update a full custom/edited product in Firestore
 */
export async function saveCustomProductInFirestore(product: Product): Promise<void> {
  try {
    const cleanData = sanitizeProductForFirestore(product);
    const docRef = doc(db, CUSTOM_PRODUCTS_COLLECTION, cleanData.id);
    await setDoc(docRef, cleanData, { merge: true });
    // Ensure it is not marked as deleted
    try {
      await deleteDoc(doc(db, DELETED_PRODUCTS_COLLECTION, cleanData.id));
    } catch {
      // ignore if not in deleted_products
    }
  } catch (err) {
    console.warn(`Failed to save custom product ${product.id} in Firestore:`, err);
    throw err;
  }
}

/**
 * Delete a product in Firestore (removes from custom_products and records in deleted_products)
 */
export async function deleteProductInFirestore(productId: string): Promise<void> {
  try {
    await setDoc(doc(db, DELETED_PRODUCTS_COLLECTION, productId), {
      productId,
      deletedAt: new Date().toISOString()
    });
    await deleteDoc(doc(db, CUSTOM_PRODUCTS_COLLECTION, productId));
  } catch (err) {
    console.warn(`Failed to delete product ${productId} in Firestore:`, err);
    throw err;
  }
}

/**
 * Subscribe to deleted product IDs in Firestore
 */
export function subscribeToDeletedProducts(
  onUpdate: (deletedIds: string[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, DELETED_PRODUCTS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const ids: string[] = [];
        snapshot.forEach((docSnap) => {
          ids.push(docSnap.id);
        });
        onUpdate(ids);
      },
      (err) => {
        console.warn('Firestore deleted_products listener warning:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Failed to subscribe to deleted_products:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Sync local custom products to Firestore so offline/local creations are never lost
 */
export async function syncLocalCustomProductsToFirestore(
  localProducts: Record<string, Product>
): Promise<void> {
  try {
    const entries = Object.values(localProducts);
    if (entries.length === 0) return;
    for (const prod of entries) {
      if (prod && prod.id && prod.name) {
        const cleanData = sanitizeProductForFirestore(prod);
        await setDoc(doc(db, CUSTOM_PRODUCTS_COLLECTION, cleanData.id), cleanData, { merge: true });
      }
    }
  } catch (err) {
    console.warn('Initial local custom products to Firestore sync warning:', err);
  }
}

/**
 * Compresses an image (File or base64 DataURL) using HTML5 Canvas
 * to ensure fast rendering, low bandwidth, and Firestore payload compatibility (<100KB).
 */
export async function compressImage(
  fileOrDataUrl: File | string, 
  maxWidth = 600, 
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's already an external HTTP(S) URL, keep it as is
    if (typeof fileOrDataUrl === 'string' && (fileOrDataUrl.startsWith('http://') || fileOrDataUrl.startsWith('https://'))) {
      resolve(fileOrDataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '');
        return;
      }

      // Draw with smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      try {
        const compressed = canvas.toDataURL('image/webp', quality);
        resolve(compressed);
      } catch {
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      }
    };

    img.onerror = () => {
      if (typeof fileOrDataUrl === 'string') {
        resolve(fileOrDataUrl);
      } else {
        reject(new Error('Erro ao processar imagem'));
      }
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

/**
 * Subscribes to real-time product customizations (custom photos and custom prices) in Firestore
 */
export function subscribeToProductCustomizations(
  onUpdate: (customizations: {
    prices: Record<string, number>;
    images: Record<string, string>;
  }) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, PRODUCT_CUSTOMIZATIONS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const prices: Record<string, number> = {};
        const images: Record<string, string> = {};

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ProductCustomizationDoc;
          const productId = docSnap.id;
          if (data.customPrice !== undefined && !isNaN(data.customPrice)) {
            prices[productId] = data.customPrice;
          }
          if (data.customImageUrl) {
            images[productId] = data.customImageUrl;
          }
        });

        onUpdate({ prices, images });
      },
      (err) => {
        console.warn('Firestore customizations listener warning:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Failed to subscribe to product customizations:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Save or update a product's photo and/or price in Firestore
 */
export async function saveProductCustomizationInFirestore(
  productId: string,
  data: { customImageUrl?: string; customPrice?: number }
): Promise<void> {
  try {
    const docRef = doc(db, PRODUCT_CUSTOMIZATIONS_COLLECTION, productId);
    const payload: Partial<ProductCustomizationDoc> = {
      productId,
      updatedAt: new Date().toISOString()
    };

    if (data.customImageUrl !== undefined) {
      payload.customImageUrl = data.customImageUrl;
    }
    if (data.customPrice !== undefined) {
      payload.customPrice = data.customPrice;
    }

    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    console.warn(`Failed to save customization for product ${productId} in Firestore:`, err);
    throw err;
  }
}

/**
 * Reset a single product customization in Firestore
 */
export async function resetProductCustomizationInFirestore(productId: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCT_CUSTOMIZATIONS_COLLECTION, productId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Failed to delete customization for product ${productId}:`, err);
  }
}

/**
 * Bulk upload any initial local storage customizations to Firestore
 */
export async function syncLocalCustomizationsToFirestore(
  localPrices: Record<string, number>,
  localImages: Record<string, string>
): Promise<void> {
  try {
    const productIds = Array.from(new Set([...Object.keys(localPrices), ...Object.keys(localImages)]));
    if (productIds.length === 0) return;

    for (const pid of productIds) {
      const payload: Partial<ProductCustomizationDoc> = {
        productId: pid,
        updatedAt: new Date().toISOString()
      };
      if (localPrices[pid] !== undefined) {
        payload.customPrice = localPrices[pid];
      }
      if (localImages[pid] !== undefined) {
        payload.customImageUrl = localImages[pid];
      }
      await setDoc(doc(db, PRODUCT_CUSTOMIZATIONS_COLLECTION, pid), payload, { merge: true });
    }
  } catch (err) {
    console.warn('Initial local to Firestore sync warning:', err);
  }
}
