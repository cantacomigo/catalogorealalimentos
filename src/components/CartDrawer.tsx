import { useState, FormEvent } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Send, 
  Copy, 
  Check, 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  FileText,
  PackageCheck,
  ArrowRight,
  AlertTriangle,
  Boxes,
  Users,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';
import { OrderCustomerInfo, SalesRep } from '../types';

export function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    updateUnitType, 
    clearCart,
    totalItemsCount,
    totalEstimatedPrice,
    salesReps,
    selectedSalesRep,
    setSelectedSalesRep,
    autoDetectRepByLocation,
    placeCustomerOrder,
    showToast
  } = useCart();
  const { deductOrderStock } = useProducts();

  const [customer, setCustomer] = useState<OrderCustomerInfo>({
    name: '',
    companyName: '',
    cnpjOrCpf: '',
    stateRegistration: '',
    phone: '',
    email: '',
    city: '',
    neighborhood: '',
    address: '',
    state: 'SP',
    zipCode: '',
    paymentMethod: 'Boleto Faturado B2B',
    deliveryNotes: ''
  });

  const [copied, setCopied] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen) return null;

  const handleLocationChange = (field: 'city' | 'address' | 'neighborhood', value: string) => {
    const nextCustomer = { ...customer, [field]: value };
    setCustomer(nextCustomer);
    // Auto-detect representative if user types city or neighborhood
    if (value.length > 2) {
      autoDetectRepByLocation(`${nextCustomer.city} ${nextCustomer.neighborhood} ${nextCustomer.address}`);
    }
  };

  const handleCopySummary = () => {
    const summaryText = [
      '🛒 *SOLICITAÇÃO DE PEDIDO - REAL ALIMENTOS*',
      '----------------------------------------',
      `Vendedor: ${selectedSalesRep.name} (${selectedSalesRep.code}) - ${selectedSalesRep.regionName}`,
      `Cliente: ${customer.name || 'Não informado'}`,
      customer.companyName ? `Empresa: ${customer.companyName}` : '',
      customer.cnpjOrCpf ? `CNPJ/CPF: ${customer.cnpjOrCpf}` : '',
      customer.phone ? `Telefone: ${customer.phone}` : '',
      customer.city ? `Cidade: ${customer.city}` : '',
      '----------------------------------------',
      'ITENS:',
      ...cart.map((item, i) => {
        const u = item.unitType === 'caixa' ? 'CX' : item.unitType === 'fardo' ? 'FARDO' : 'UN';
        return `${i + 1}. ${item.product.name} | ${item.product.brandName} (Pág. ${item.product.pageNumber}) - ${item.quantity} ${u} [${item.product.weight}]`;
      }),
      '----------------------------------------',
      `Total Volumes: ${totalItemsCount}`,
      `Total Estimado: ${totalEstimatedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    showToast('Resumo do pedido copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinalizeOrder = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (cart.length === 0) return;

    if (!customer.name.trim() || !customer.phone.trim()) {
      setShowCheckoutForm(true);
      showToast('Por favor, informe seu Nome e WhatsApp de contato.');
      return;
    }

    try {
      setIsSubmitting(true);
      await placeCustomerOrder(customer);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Erro ao enviar pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md md:max-w-lg bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-slate-900 leading-none">
                  Pedido do Cliente
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'itens'} selecionados
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-bold text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Esvaziar pedido"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mb-4 shadow-inner">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Seu pedido está vazio
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
                  Navegue pelo catálogo interativo e adicione produtos para enviar ao vendedor da sua região.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-700 transition-all"
                >
                  Explorar Catálogo de Produtos
                </button>
              </div>
            ) : (
              <>
                {/* Designated Sales Representative Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-sm border border-slate-700">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      Vendedor / Representante Responsável
                    </span>
                    <span className="text-[10px] bg-red-600/80 text-white px-2 py-0.5 rounded font-mono font-bold">
                      {selectedSalesRep.code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-white">{selectedSalesRep.name}</h4>
                      <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="truncate">{selectedSalesRep.regionName}</span>
                      </p>
                    </div>

                    <select
                      value={selectedSalesRep.id}
                      onChange={(e) => {
                        const found = salesReps.find(r => r.id === e.target.value);
                        if (found) setSelectedSalesRep(found);
                      }}
                      className="bg-slate-800 border border-slate-600 text-slate-200 text-[11px] font-semibold rounded-lg px-2 py-1 outline-none max-w-[130px]"
                      title="Trocar Vendedor / Região"
                    >
                      {salesReps.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Switch Between Items & Customer Checkout Form */}
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setShowCheckoutForm(false)}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      !showCheckoutForm
                        ? 'bg-white text-red-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    1. Itens ({cart.length})
                  </button>
                  <button
                    onClick={() => setShowCheckoutForm(true)}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${
                      showCheckoutForm
                        ? 'bg-white text-red-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    2. Dados de Faturamento / Entrega
                  </button>
                </div>

                {!showCheckoutForm ? (
                  /* Item List */
                  <div className="space-y-3">
                    {cart.map((item) => {
                      const itemSubtotal = item.product.suggestedPrice * item.quantity;
                      return (
                        <div
                          key={`${item.product.id}-${item.unitType}`}
                          className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col gap-2.5 relative group hover:border-red-300 transition-all"
                        >
                          {/* Top Row: Brand & Product Name & Remove */}
                          <div className="flex items-start justify-between gap-2 pr-6">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-900 text-white">
                                  {item.product.brandName}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500">
                                  Pág. {item.product.pageNumber} • {item.product.weight}
                                </span>
                              </div>
                              <h4 className="font-bold text-xs text-slate-900 leading-snug">
                                {item.product.name}
                              </h4>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="absolute top-3 right-3 text-slate-400 hover:text-red-600 p-1 transition-colors"
                              title="Remover"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Middle Row: Unit selection & Stepper & Subtotal */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                            <div className="flex items-center gap-2">
                              {/* Unit Selector */}
                              <select
                                value={item.unitType}
                                onChange={(e) => updateUnitType(item.product.id, e.target.value as any)}
                                className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none"
                              >
                                <option value="unidade">UN</option>
                                <option value="caixa">CX</option>
                                <option value="fardo">FARDO</option>
                              </select>

                              {/* Stepper */}
                              <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-black text-slate-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-[10px] text-slate-400">Subtotal:</div>
                              <div className="text-xs font-black text-slate-900">
                                {itemSubtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </div>
                            </div>
                          </div>

                          {/* Live Stock Warning if exceeds available */}
                          <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500">
                            <span className="flex items-center gap-1">
                              <Boxes className="w-3 h-3 text-red-600" />
                              Estoque Real Alimentos: <b>{item.product.stockQuantity ?? 50} un</b>
                            </span>
                            {item.quantity > (item.product.stockQuantity ?? 50) && (
                              <span className="text-amber-700 font-bold flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                <AlertTriangle className="w-3 h-3 text-amber-600" /> Qtd excede estoque
                              </span>
                            )}
                          </div>

                          {item.notes && (
                            <div className="text-[11px] text-slate-600 bg-white/60 p-1.5 rounded-lg border border-slate-200/50">
                              Obs: {item.notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Customer & Fiscal Form for Commercial Order */
                  <form onSubmit={handleFinalizeOrder} className="space-y-3 text-xs">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-950 font-medium">
                      O pedido será enviado diretamente para <strong>{selectedSalesRep.name}</strong>, que encaminhará para faturamento e emissão da Nota Fiscal na matriz.
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Nome do Responsável / Comprador *
                      </label>
                      <input
                        type="text"
                        required
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        placeholder="Ex: Carlos Silva"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> Razão Social / Nome Fantasia (Pessoa Jurídica ou Física)
                      </label>
                      <input
                        type="text"
                        value={customer.companyName}
                        onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
                        placeholder="Ex: Padaria & Confeitaria Estrela Ltda"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400" /> CNPJ / CPF
                        </label>
                        <input
                          type="text"
                          value={customer.cnpjOrCpf}
                          onChange={(e) => setCustomer({ ...customer, cnpjOrCpf: e.target.value })}
                          placeholder="00.000.000/0001-00"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400" /> Inscrição Estadual (IE)
                        </label>
                        <input
                          type="text"
                          value={customer.stateRegistration}
                          onChange={(e) => setCustomer({ ...customer, stateRegistration: e.target.value })}
                          placeholder="Ex: 110.220.330.440"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> WhatsApp / Tel *
                        </label>
                        <input
                          type="text"
                          required
                          value={customer.phone}
                          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                          placeholder="(11) 99999-9999"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                          E-mail para XML da NF
                        </label>
                        <input
                          type="email"
                          value={customer.email}
                          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                          placeholder="compras@empresa.com.br"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> Cidade / Região
                        </label>
                        <input
                          type="text"
                          value={customer.city}
                          onChange={(e) => handleLocationChange('city', e.target.value)}
                          placeholder="Ex: São Paulo, Campinas, Santos..."
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={customer.neighborhood}
                          onChange={(e) => handleLocationChange('neighborhood', e.target.value)}
                          placeholder="Ex: Moema, Tatuapé..."
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">
                          Endereço Completo de Entrega
                        </label>
                        <input
                          type="text"
                          value={customer.address}
                          onChange={(e) => handleLocationChange('address', e.target.value)}
                          placeholder="Av. Paulista, 1000 - Galpão 2"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          CEP
                        </label>
                        <input
                          type="text"
                          value={customer.zipCode}
                          onChange={(e) => setCustomer({ ...customer, zipCode: e.target.value })}
                          placeholder="01310-100"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Forma de Pagamento Desejada
                      </label>
                      <select
                        value={customer.paymentMethod}
                        onChange={(e) => setCustomer({ ...customer, paymentMethod: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 outline-none font-semibold text-slate-800"
                      >
                        <option value="Boleto Faturado B2B (28 DD)">Boleto Faturado B2B (28 Dias)</option>
                        <option value="Boleto Faturado B2B (14/28 DD)">Boleto Faturado B2B (14/28 Dias)</option>
                        <option value="PIX à Vista (com desconto negociado)">PIX à Vista (com desconto especial)</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="A combinar com o vendedor">A combinar com o vendedor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Observações da Entrega ou Restrições de Horário
                      </label>
                      <textarea
                        rows={2}
                        value={customer.deliveryNotes}
                        onChange={(e) => setCustomer({ ...customer, deliveryNotes: e.target.value })}
                        placeholder="Ex: Recebimento das 08h às 14h; Estacionamento para caminhão refrigerado..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 outline-none"
                      />
                    </div>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              {/* Financial summary */}
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Total de Volumes:</span>
                <span className="font-bold text-slate-900">{totalItemsCount} volumes</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-extrabold text-slate-900">Total Estimado do Pedido:</span>
                <span className="text-lg font-black text-red-600">
                  {totalEstimatedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  id="send-rep-order-btn"
                  onClick={() => handleFinalizeOrder()}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Pedido para {selectedSalesRep.name}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopySummary}
                    className="py-2.5 px-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copiar Resumo
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowCheckoutForm(!showCheckoutForm)}
                    className="py-2.5 px-3 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {showCheckoutForm ? 'Ver Itens' : 'Dados de Entrega/NF'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

