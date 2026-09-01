import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, MessageCircle, MapPin, User, FileText, ArrowRight, X, Phone, Building2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { sendOrderToRepresentativeWhatsApp } from '../services/orderService';

export const OrderConfirmationModal: React.FC = () => {
  const { lastPlacedOrder, setLastPlacedOrder, setIsRepPortalOpen } = useCart();

  if (!lastPlacedOrder) return null;

  const handleReopenWhatsApp = () => {
    sendOrderToRepresentativeWhatsApp(lastPlacedOrder);
  };

  const handleOpenRepPortal = () => {
    setLastPlacedOrder(null);
    setIsRepPortalOpen(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center relative">
            <button
              onClick={() => setLastPlacedOrder(null)}
              className="absolute right-4 top-4 text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-emerald-800/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold font-serif tracking-tight">Pedido Enviado com Sucesso!</h3>
            <p className="text-emerald-100 text-sm mt-1">
              Encaminhado diretamente para o vendedor responsável pela sua região.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 bg-white/15 px-3.5 py-1 rounded-full text-xs font-mono font-semibold tracking-wide">
              <span>{lastPlacedOrder.id}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-5 text-slate-800">
            {/* Sales Representative Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                Representante Comercial Vinculado
              </span>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 text-red-700 flex items-center justify-center font-bold text-lg shrink-0">
                  {lastPlacedOrder.salesRep.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base">{lastPlacedOrder.salesRep.name}</h4>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-mono font-bold">
                      {lastPlacedOrder.salesRep.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span className="truncate">{lastPlacedOrder.salesRep.regionName}</span>
                  </p>
                  <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp: {lastPlacedOrder.salesRep.phone}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps Info */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <Building2 className="w-4 h-4 text-amber-700" /> O que acontece agora?
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-700">
                <li>O vendedor <strong>{lastPlacedOrder.salesRep.name}</strong> recebeu sua lista detalhada de itens no WhatsApp.</li>
                <li>Ele validará disponibilidade, descontos especiais e prazos de entrega.</li>
                <li>O vendedor encaminhará o pedido para a <strong>Matriz Real Alimentos</strong> para emissão da Nota Fiscal e faturamento.</li>
              </ol>
            </div>

            {/* Order Items Preview */}
            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Resumo dos Produtos ({lastPlacedOrder.items.length} itens)
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {lastPlacedOrder.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 text-xs">
                {lastPlacedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <span className="font-medium text-slate-900">{item.quantity}x {item.productName}</span>
                      <span className="text-slate-500 block text-[11px]">{item.brandName} • Pág. {item.pageNumber}</span>
                    </div>
                    <span className="font-medium text-slate-700 shrink-0">
                      {item.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleReopenWhatsApp}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4" />
              Reabrir WhatsApp do Vendedor
            </button>
            <button
              onClick={handleOpenRepPortal}
              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <FileText className="w-4 h-4" />
              Área do Vendedor
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
