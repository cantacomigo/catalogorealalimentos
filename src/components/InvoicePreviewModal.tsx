import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Printer, 
  Send, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Building2, 
  UserCheck, 
  Calendar, 
  ShieldCheck,
  CreditCard,
  Truck
} from 'lucide-react';
import { Order, CompanySettings } from '../types';
import { DEFAULT_COMPANY_SETTINGS } from '../data/salesReps';
import { forwardOrderToCompanyWhatsApp, buildRepToCompanyWhatsAppMessage } from '../services/orderService';
import { useCart } from '../context/CartContext';

interface InvoicePreviewModalProps {
  order: Order | null;
  onClose: () => void;
  companySettings?: CompanySettings;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  order,
  onClose,
  companySettings = DEFAULT_COMPANY_SETTINGS
}) => {
  const { showToast } = useCart();
  const [copied, setCopied] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyERP = () => {
    const text = buildRepToCompanyWhatsAppMessage(order, companySettings);
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Dados do pedido copiados para a área de transferência!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendToCompany = async () => {
    try {
      setIsSending(true);
      await forwardOrderToCompanyWhatsApp(order, companySettings, order.salesRep.name);
      showToast('Pedido encaminhado com sucesso para a Central de Faturamento da Real Alimentos!');
    } catch (e) {
      console.error(e);
      showToast('Erro ao encaminhar pedido.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-slate-300 flex flex-col max-h-[92vh]"
        >
          {/* Top Modal Controls */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-lg text-white">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Espelho de Pedido & Pré-Nota Fiscal</h3>
                <p className="text-xs text-slate-400 font-mono">{order.id} • Status: {order.status.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyERP}
                className="hidden sm:inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                title="Copiar dados formatados para ERP"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar p/ ERP'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Imprimir / PDF</span>
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Body */}
          <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50 space-y-6" ref={printRef}>
            {/* Real Alimentos Official Header */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-black tracking-tight text-red-600 font-serif">REAL ALIMENTOS</span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold uppercase">Distribuidora</span>
                </div>
                <p className="text-xs font-semibold text-slate-800">{companySettings.companyName}</p>
                <p className="text-xs text-slate-500">CNPJ: {companySettings.cnpj} | IE: {companySettings.stateRegistration}</p>
                <p className="text-xs text-slate-500">{companySettings.address} - {companySettings.city}/{companySettings.state}</p>
                <p className="text-xs text-slate-500">Fone: {companySettings.phone} | WhatsApp: {companySettings.whatsappFaturamento}</p>
              </div>

              <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pedido Comercial de Venda</span>
                <span className="text-2xl font-black font-mono text-slate-900 block">{order.id}</span>
                <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                  <p><strong>Emissão:</strong> {new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p><strong>Vendedor (RTV):</strong> {order.salesRep.name} ({order.salesRep.code})</p>
                  <p><strong>Região/Rota:</strong> {order.salesRep.regionName}</p>
                </div>
              </div>
            </div>

            {/* Fiscal Customer Information Box */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-red-600" />
                Dados Cadastrais do Cliente / Faturamento
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Razão Social / Nome Fantasia</span>
                  <span className="font-bold text-slate-900 text-sm">{order.customer.companyName || order.customer.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">CNPJ / CPF</span>
                  <span className="font-semibold text-slate-800 font-mono">{order.customer.cnpjOrCpf || 'Não informado / Consumidor'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Inscrição Estadual (IE)</span>
                  <span className="font-semibold text-slate-800">{order.customer.stateRegistration || 'Isento / Não informada'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Contato / Comprador</span>
                  <span className="font-semibold text-slate-800">{order.customer.name} ({order.customer.phone})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">E-mail para Envio de XML/Danfe</span>
                  <span className="font-semibold text-slate-800">{order.customer.email || 'Não informado'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Condição de Pagamento</span>
                  <span className="font-bold text-emerald-700">{order.paymentTerms || order.customer.paymentMethod || 'A combinar'}</span>
                </div>
                <div className="sm:col-span-2 md:col-span-3">
                  <span className="text-slate-400 block text-[11px]">Endereço Completo de Entrega</span>
                  <span className="font-medium text-slate-800">
                    {order.customer.address} {order.customer.neighborhood ? `- Bairro: ${order.customer.neighborhood}` : ''} - {order.customer.city}/{order.customer.state || 'SP'} {order.customer.zipCode ? `(CEP: ${order.customer.zipCode})` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Itens Solicitados para Faturamento & Separação
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  {order.items.length} itens • {order.totalVolumes} volumes
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-4 w-12 text-center">#</th>
                      <th className="py-2.5 px-4">Produto</th>
                      <th className="py-2.5 px-4">Marca / Pág.</th>
                      <th className="py-2.5 px-4">Embalagem</th>
                      <th className="py-2.5 px-4 text-center">Qtd / Un</th>
                      <th className="py-2.5 px-4 text-right">Unitário (R$)</th>
                      <th className="py-2.5 px-4 text-right">Subtotal (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {item.productName}
                          {item.notes && <span className="block text-[11px] text-amber-700 font-normal">Obs: {item.notes}</span>}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          <span className="font-medium text-slate-800 uppercase">{item.brandName}</span>
                          <span className="text-slate-400 block text-[11px]">Pág. {item.pageNumber}</span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{item.weight}</td>
                        <td className="py-2.5 px-4 text-center font-bold text-slate-900">
                          {item.quantity} <span className="text-[10px] text-slate-500 uppercase">{item.unitType}</span>
                        </td>
                        <td className="py-2.5 px-4 text-right text-slate-700 font-mono">
                          {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-slate-900 font-mono">
                          {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals Footer */}
              <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-slate-500" />
                    <strong>Previsão de Entrega:</strong> {order.deliveryDatePreference || 'Rota Regular'}
                  </p>
                  {order.representativeNotes && (
                    <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 mt-1">
                      <strong>Obs do Vendedor:</strong> {order.representativeNotes}
                    </p>
                  )}
                </div>

                <div className="w-full sm:w-64 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Bruto:</span>
                    <span className="font-mono font-medium">{order.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  {order.discountAmount && order.discountAmount > 0 ? (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Desconto ({order.discountPercentage}%):</span>
                      <span className="font-mono">-{order.discountAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total da Nota / Pedido:</span>
                    <span className="text-red-600 font-mono text-base">{order.finalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-white border-t border-slate-200 px-6 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pedido pronto para importação no ERP e emissão de Nota Fiscal Eletrônica (NF-e).</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={handleSendToCompany}
                disabled={isSending}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                <span>{order.status === 'enviado_faturamento' ? 'Reenviar para Faturamento / NF' : 'Enviar para Faturamento / Emissão de NF'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
