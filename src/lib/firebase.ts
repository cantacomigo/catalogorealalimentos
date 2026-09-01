import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  writeBatch, 
  query, 
  orderBy, 
  limit, 
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfigFile from '../../firebase-applet-config.json';

// Support both firebase-applet-config.json and Vite environment variables on Vercel
const rawConfig = (firebaseConfigFile || {}) as Record<string, any>;

const config = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId || 'indexar-470703',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawConfig.appId || '1:752362929352:web:bc9cf7a76e871c6ef139fd',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || rawConfig.apiKey || 'AIzaSyDE2pnm9H8dV2BrqLYlgepn_TBxg5AffF8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain || 'indexar-470703.firebaseapp.com',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || rawConfig.firestoreDatabaseId || 'ai-studio-catlogointerativ-71bd75a4-49ef-407c-a069-f04aab7225f0',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket || 'indexar-470703.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId || '752362929352',
};

let app: any;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(config);
} catch (err) {
  console.warn('Firebase initialization error/warning:', err);
  app = getApps()[0] || initializeApp(config);
}

// Initialize Cloud Firestore using the configured database ID
export const db = config.firestoreDatabaseId 
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

export const STOCK_COLLECTION = 'stock';
export const STOCK_LOGS_COLLECTION = 'stock_logs';

export {
  app,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  writeBatch,
  query,
  orderBy,
  limit,
  addDoc,
  deleteDoc
};
