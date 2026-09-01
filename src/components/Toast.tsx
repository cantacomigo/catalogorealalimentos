import { useCart } from '../context/CartContext';
import { CheckCircle, ShoppingBag, X } from 'lucide-react';

export function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="flex items-center gap-2.5 bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/60 backdrop-blur-md max-w-md">
        <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle className="w-4 h-4" />
        </div>
        <p className="text-xs font-semibold leading-snug">
          {toastMessage}
        </p>
      </div>
    </div>
  );
}
