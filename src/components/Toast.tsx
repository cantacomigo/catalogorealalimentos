import { useCart } from '../context/CartContext';
import { CheckCircle, X } from 'lucide-react';

export function Toast() {
  const { toastMessage, hideToast } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200 pointer-events-auto">
      <div className="flex items-center gap-3 bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/70 backdrop-blur-md max-w-md">
        <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle className="w-4 h-4" />
        </div>
        <p className="text-xs font-semibold leading-snug flex-1">
          {toastMessage}
        </p>
        <button
          type="button"
          onClick={hideToast}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors ml-1 cursor-pointer shrink-0"
          title="Fechar notificação"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

