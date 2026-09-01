import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot 
} from '../lib/firebase';

export const PRODUCT_CUSTOMIZATIONS_COLLECTION = 'product_customizations';

export interface ProductCustomizationDoc {
  productId: string;
  customImageUrl?: string;
  customPrice?: number;
  updatedAt?: string;
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
