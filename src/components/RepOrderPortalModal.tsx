import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Filter, 
  Send, 
  FileText, 
  CheckCircle, 
  Clock, 
  Building2, 
  Phone, 
  MapPin, 
  ChevronRight, 
  DollarSign, 
  Package, 
  FileSpreadsheet, 
  User, 
  Check, 
  AlertCircle, 
  Users, 
  Edit3, 
  MessageCircle,
  Truck,
  Layers,
  ArrowUpRight,
  Plus,
  RotateCcw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Order, OrderStatus, SalesRep } from '../types';
import { updateOrderInFirestore, forwardOrderToCompanyWhatsApp, sendOrderToRepresentativeWhatsApp, safeOpenUrl } from '../services/orderService';
import { DEFAULT_COMPANY_SETTINGS } from '../data/salesReps';
import { InvoicePreviewModal } from './InvoicePreviewModal';

export const RepOrderPortalModal: React.FC = () => {
  const { 
    isRepPortalOpen, 
    setIsRepPortalOpen, 
    orders, 
    salesReps, 
    selectedSalesRep, 
    setSelectedSalesRep,
    openCreateRepModal,
    openEditRepModal,
    resetSalesReps,
    saveSalesRep,
    showToast 
  } = useCart();

  const [selectedRepFilter, setSelectedRepFilter] = useState<string>(selectedSalesRep.id || 'all');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'reps'>('orders');

  // Edit / Commercial terms states for selected order
  const [paymentTerms, setPaymentTerms] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [repNotes, setRepNotes] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  if (!isRepPortalOpen) return null;

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Rep filter
    if (selectedRepFilter !== 'all' && order.salesRep.id !== selectedRepFilter) {
      return false;
    }
    // Status tab
    if (selectedStatusTab !== 'all' && order.status !== selectedStatusTab) {
      return false;
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchCustomer = order.customer.name.toLowerCase().includes(q) || 
                            (order.customer.companyName && order.customer.companyName.toLowerCase().includes(q));
      const matchCnpj = order.customer.cnpjOrCpf && order.customer.cnpjOrCpf.includes(q);
      const matchCity = order.customer.city.toLowerCase().includes(q);
      const matchRep = order.salesRep.name.toLowerCase().includes(q);
      return matchId || matchCustomer || matchCnpj || matchCity || matchRep;
    }
    return true;
  });

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setPaymentTerms(order.paymentTerms || order.customer.paymentMethod || 'Boleto 28 DD');
    setDiscountPercent(order.discountPercentage || 0);
    setRepNotes(order.representativeNotes || '');
    setDeliveryDate(order.deliveryDatePreference || 'Imediata / Conforme Rota');
    setIsEditingOrder(false);
  };

  const handleSaveOrderTerms = async () => {
    if (!selectedOrder) return;
    const discountAmount = (selectedOrder.totalAmount * discountPercent) / 100;
    const finalAmount = Math.max(0, selectedOrder.totalAmount - discountAmount);

    const updates: Partial<Order> = {
      paymentTerms,
      discountPercentage: discountPercent,
      discountAmount,
      finalAmount,
      representativeNotes: repNotes,
      deliveryDatePreference: deliveryDate
    };

    try {
      await updateOrderInFirestore(selectedOrder.id, updates);
      setSelectedOrder({ ...selectedOrder, ...updates });
      setIsEditingOrder(false);
      showToast('Condições comerciais atualizadas!');
    } catch (e) {
      console.error(e);
      showToast('Erro ao atualizar pedido.');
    }
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    try {
      await updateOrderInFirestore(selectedOrder.id, { status: newStatus });
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      showToast(`Status atualizado para: ${getStatusLabel(newStatus)}`);
    } catch (e) {
      showToast('Erro ao atualizar status.');
    }
  };

  const handleOpenInvoiceModal = (order: Order) => {
    setInvoiceOrder(order);
    setIsInvoiceModalOpen(true);
  };

  const handleWhatsAppClient = (order: Order) => {
    const phone = order.customer.phone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Olá ${order.customer.name}! Aqui é ${order.salesRep.name}, representante da Real Alimentos. Recebi seu pedido ${order.id} através do nosso catálogo digital!`
    );
    safeOpenUrl(`https://api.whatsapp.com/send?phone=${phone}&text=${text}`);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'aguardando_vendedor':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" /> Novo / Aguardando
          </span>
        );
      case 'em_analise':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <Edit3 className="w-3 h-3 text-blue-600" /> Em Análise
          </span>
        );
      case 'enviado_faturamento':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <Send className="w-3 h-3 text-purple-600" /> Enviado p/ Faturamento & NF
          </span>
        );
      case 'faturado_nf':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> NF Emitida / Faturado
          </span>
        );
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <Check className="w-3 h-3 text-slate-600" /> Concluído
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <AlertCircle className="w-3 h-3 text-red-600" /> Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'aguardando_vendedor': return 'Aguardando Vendedor';
      case 'em_analise': return 'Em Análise Comercial';
      case 'enviado_faturamento': return 'Enviado para Matriz / Faturamento';
      case 'faturado_nf': return 'Nota Fiscal Emitida';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
    }
  };

  const totalFilteredValue = filteredOrders.reduce((acc, o) => acc + o.finalAmount, 0);
  const pendingCount = orders.filter(o => o.status === 'aguardando_vendedor').length;
  const forwardedCount = orders.filter(o => o.status === 'enviado_faturamento').length;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[94vh] flex flex-col overflow-hidden border border-slate-300"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-600 rounded-xl text-white shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold font-serif">Área do Vendedor & Gestão de Pedidos</h2>
                    <span className="bg-red-500/30 text-red-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-red-500/40">
                      Real Alimentos
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Fluxo integrado: Cliente → Representante Regional → Matriz Faturamento & NF
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Tab switch */}
                <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      activeTab === 'orders' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Pedidos ({orders.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('reps')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      activeTab === 'reps' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Representantes & Regiões ({salesReps.length})
                  </button>
                </div>

                <button
                  onClick={() => setIsRepPortalOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors ml-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Subheader: Representative & Metrics Bar */}
            <div className="bg-slate-100 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700">Filtrar por Vendedor:</span>
                <select
                  value={selectedRepFilter}
                  onChange={(e) => {
                    setSelectedRepFilter(e.target.value);
                    const found = salesReps.find(r => r.id === e.target.value);
                    if (found) setSelectedSalesRep(found);
                  }}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">⭐ Todos os Representantes ({orders.length} pedidos)</option>
                  {salesReps.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {rep.name} ({rep.code}) - {rep.regionName.split('(')[0]}
                    </option>
                  ))}
                </select>

                <button
                  onClick={openCreateRepModal}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                  title="Cadastrar novo representante comercial"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar Vendedor</span>
                </button>
              </div>

              <div className="flex items-center gap-4 text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                  <span><strong>{pendingCount}</strong> novos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
                  <span><strong>{forwardedCount}</strong> p/ NF</span>
                </div>
                <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm font-bold text-slate-900">
                  Total Listado: {totalFilteredValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>

            {/* Main Tab Content */}
            {activeTab === 'orders' ? (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
                {/* Left Side: Order List */}
                <div className="w-full md:w-5/12 lg:w-4/12 border-r border-slate-200 flex flex-col bg-white overflow-hidden shrink-0">
                  {/* Search and Tabs */}
                  <div className="p-3 border-b border-slate-200 space-y-2 bg-white">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Buscar por cliente, CNPJ, pedido ou cidade..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
                      {[
                        { id: 'all', label: 'Todos' },
                        { id: 'aguardando_vendedor', label: 'Novos' },
                        { id: 'em_analise', label: 'Em Análise' },
                        { id: 'enviado_faturamento', label: 'Enviados NF' },
                        { id: 'faturado_nf', label: 'Faturados' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setSelectedStatusTab(tab.id)}
                          className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                            selectedStatusTab === tab.id
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders Scrollable List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-semibold">Nenhum pedido encontrado</p>
                        <p className="text-xs mt-1">Os pedidos feitos pelos clientes no catálogo aparecerão aqui em tempo real.</p>
                      </div>
                    ) : (
                      filteredOrders.map((order) => {
                        const isSelected = selectedOrder?.id === order.id;
                        return (
                          <div
                            key={order.id}
                            onClick={() => handleSelectOrder(order)}
                            className={`p-3.5 cursor-pointer transition-all hover:bg-slate-50 border-l-4 ${
                              isSelected
                                ? 'bg-red-50/70 border-l-red-600'
                                : order.status === 'aguardando_vendedor'
                                ? 'border-l-amber-500 bg-amber-50/30'
                                : 'border-l-transparent'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="font-mono font-bold text-xs text-slate-900">{order.id}</span>
                              {getStatusBadge(order.status)}
                            </div>

                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {order.customer.companyName || order.customer.name}
                            </h4>

                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                              <span className="truncate">{order.customer.city} - {order.salesRep.regionName}</span>
                            </p>

                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-xs">
                              <span className="text-slate-500 font-medium text-[11px]">
                                {order.items.length} itens ({order.totalVolumes} vol)
                              </span>
                              <span className="font-bold text-slate-900 font-mono">
                                {order.finalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Side: Selected Order Workspace */}
                <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 p-4 sm:p-6">
                  {selectedOrder ? (
                    <div className="space-y-5 max-w-3xl">
                      {/* Top Action & Status Bar */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 uppercase font-bold">Pedido Selecionado:</span>
                            <span className="font-mono font-bold text-sm text-slate-900">{selectedOrder.id}</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Criado em {new Date(selectedOrder.createdAt).toLocaleDateString('pt-BR')} às {new Date(selectedOrder.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleWhatsAppClient(selectedOrder)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp Cliente
                          </button>

                          <button
                            onClick={() => handleOpenInvoiceModal(selectedOrder)}
                            className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-red-400" />
                            Espelho de Pedido / NF
                          </button>
                        </div>
                      </div>

                      {/* Main Forward to Company (Matriz) Banner */}
                      <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-800 text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-red-200 block mb-1">
                            Ação do Representante / Vendedor
                          </span>
                          <h3 className="text-lg font-bold">Enviar Pedido para Faturamento e Emissão de NF</h3>
                          <p className="text-xs text-red-100 mt-1 max-w-xl">
                            Encaminha todos os dados cadastrais do cliente, lista consolidada de itens e condições comerciais para a <strong>Central de Expedição e Faturamento da Real Alimentos</strong> via WhatsApp e sistema.
                          </p>
                        </div>

                        <button
                          onClick={() => handleOpenInvoiceModal(selectedOrder)}
                          className="bg-white text-red-700 hover:bg-red-50 font-bold text-xs py-3 px-5 rounded-xl shadow flex items-center gap-2 shrink-0 transition-all active:scale-95 uppercase tracking-wide"
                        >
                          <Send className="w-4 h-4 text-red-600" />
                          <span>Encaminhar para a Empresa</span>
                        </button>
                      </div>

                      {/* Customer Info Card */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-red-600" />
                            Dados do Cliente & Entrega
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            Vendedor Atribuído: <strong>{selectedOrder.salesRep.name} ({selectedOrder.salesRep.code})</strong>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Razão Social / Nome</span>
                            <span className="font-bold text-slate-900 text-sm">
                              {selectedOrder.customer.companyName || selectedOrder.customer.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">CNPJ / CPF</span>
                            <span className="font-semibold text-slate-800 font-mono">
                              {selectedOrder.customer.cnpjOrCpf || 'Não informado'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Inscrição Estadual (IE)</span>
                            <span className="font-semibold text-slate-800">
                              {selectedOrder.customer.stateRegistration || 'Isento / Não informada'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Contato / Telefone</span>
                            <span className="font-semibold text-slate-800">
                              {selectedOrder.customer.name} • {selectedOrder.customer.phone}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">E-mail</span>
                            <span className="font-semibold text-slate-800">
                              {selectedOrder.customer.email || 'Não informado'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">Região de Atendimento</span>
                            <span className="font-semibold text-slate-800">
                              {selectedOrder.salesRep.regionName}
                            </span>
                          </div>
                          <div className="sm:col-span-2 md:col-span-3 pt-2 border-t border-slate-100">
                            <span className="text-slate-400 block text-[11px]">Endereço de Entrega</span>
                            <span className="font-medium text-slate-800">
                              {selectedOrder.customer.address} {selectedOrder.customer.neighborhood ? `- ${selectedOrder.customer.neighborhood}` : ''} - {selectedOrder.customer.city}/{selectedOrder.customer.state || 'SP'} {selectedOrder.customer.zipCode ? `(CEP: ${selectedOrder.customer.zipCode})` : ''}
                            </span>
                            {selectedOrder.customer.deliveryNotes && (
                              <p className="text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 mt-1.5 text-[11px]">
                                <strong>Obs do Cliente:</strong> {selectedOrder.customer.deliveryNotes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Commercial Conditions & Discount Editor */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            Condições Comerciais & Ajustes do Vendedor
                          </h4>
                          {!isEditingOrder ? (
                            <button
                              onClick={() => setIsEditingOrder(true)}
                              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Editar Condições
                            </button>
                          ) : (
                            <button
                              onClick={handleSaveOrderTerms}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" /> Salvar Condições
                            </button>
                          )}
                        </div>

                        {isEditingOrder ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                              <label className="block text-slate-600 font-semibold mb-1">
                                Condição de Pagamento
                              </label>
                              <select
                                value={paymentTerms}
                                onChange={(e) => setPaymentTerms(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-red-500"
                              >
                                <option value="Boleto 28 DD">Boleto 28 DD</option>
                                <option value="Boleto 14/28 DD">Boleto 14/28 DD</option>
                                <option value="Boleto 21/42 DD">Boleto 21/42 DD</option>
                                <option value="À Vista com 3% de desconto">À Vista com 3% de desconto</option>
                                <option value="Pix Antecipado">Pix Antecipado</option>
                                <option value="Cartão de Crédito">Cartão de Crédito</option>
                                <option value="A combinar na entrega">A combinar na entrega</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-slate-600 font-semibold mb-1">
                                Desconto Comercial Especial (%)
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={discountPercent}
                                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                                  className="w-24 bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono font-bold"
                                />
                                <span className="text-slate-500 text-xs">
                                  Economia: R$ {((selectedOrder.totalAmount * discountPercent) / 100).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-slate-600 font-semibold mb-1">
                                Previsão / Rota de Entrega
                              </label>
                              <input
                                type="text"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                placeholder="Ex: Próxima Terça-feira (Rota ABC)"
                                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-600 font-semibold mb-1">
                                Observações Internas p/ Faturamento & Expedição
                              </label>
                              <input
                                type="text"
                                value={repNotes}
                                onChange={(e) => setRepNotes(e.target.value)}
                                placeholder="Ex: Cliente antigo, liberar sem restrição."
                                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[11px]">Condição Comercial</span>
                              <span className="font-bold text-slate-900">{selectedOrder.paymentTerms || 'A combinar'}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[11px]">Desconto Vendedor</span>
                              <span className="font-bold text-emerald-700">
                                {selectedOrder.discountPercentage ? `${selectedOrder.discountPercentage}% (-R$ ${selectedOrder.discountAmount?.toFixed(2)})` : 'Nenhum desconto'}
                              </span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[11px]">Previsão de Entrega</span>
                              <span className="font-bold text-slate-900">{selectedOrder.deliveryDatePreference || 'Rota Regular'}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Items Table */}
                      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center text-xs">
                          <span className="font-bold uppercase tracking-wider text-slate-600">
                            Produtos Solicitados ({selectedOrder.items.length} itens • {selectedOrder.totalVolumes} volumes)
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            Total: {selectedOrder.finalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>

                        <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                          {selectedOrder.items.map((item, idx) => (
                            <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50">
                              <div className="flex items-center gap-3 min-w-0">
                                {item.imageUrl && (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="w-10 h-10 object-contain rounded border border-slate-200 bg-white p-0.5 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate">{item.productName}</p>
                                  <p className="text-[11px] text-slate-500">
                                    Marca: <span className="font-semibold text-slate-700">{item.brandName}</span> • Pág. {item.pageNumber} • Peso: {item.weight}
                                    {item.notes && <span className="text-amber-700 ml-2">Obs: {item.notes}</span>}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-bold text-slate-900 block">
                                  {item.quantity} {item.unitType.toUpperCase()}
                                </span>
                                <span className="text-slate-500 font-mono text-[11px]">
                                  {item.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Changing Buttons */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-500">Alterar Status do Pedido:</span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleUpdateStatus('em_analise')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 transition-colors"
                          >
                            Em Análise
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('enviado_faturamento')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 transition-colors"
                          >
                            Enviado p/ NF
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('faturado_nf')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          >
                            NF Emitida
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('concluido')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
                          >
                            Concluído
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                      <FileText className="w-16 h-16 mb-3 opacity-30 text-red-500" />
                      <h3 className="text-base font-bold text-slate-700">Selecione um pedido na lista</h3>
                      <p className="text-xs max-w-sm mt-1">
                        Clique em qualquer pedido à esquerda para revisar os produtos, ajustar condições de pagamento e encaminhar para emissão de Nota Fiscal na Matriz.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Reps and Regions Tab */
              <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
                      <Users className="w-5 h-5 text-red-600" />
                      Equipe de Vendedores & Setores Regionais
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cadastre, edite e gerencie os vendedores responsáveis pelo atendimento regional e encaminhamento à emissão de NF.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={resetSalesReps}
                      className="text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Restaurar lista de vendedores para os 5 padrões iniciais"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restaurar Padrões
                    </button>

                    <button
                      onClick={openCreateRepModal}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Cadastrar Novo Vendedor</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {salesReps.map((rep) => {
                    const repOrders = orders.filter(o => o.salesRep.id === rep.id);
                    const isSelected = selectedSalesRep.id === rep.id;
                    const cleanPhone = rep.phone.replace(/\D/g, '');

                    return (
                      <div
                        key={rep.id}
                        className={`bg-white rounded-xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                          !rep.isActive 
                            ? 'opacity-60 bg-slate-50 border-slate-200' 
                            : isSelected 
                              ? 'border-red-500 ring-2 ring-red-100' 
                              : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          {/* Card Top: Avatar, Name, Code, Edit Button */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                                isSelected ? 'bg-red-600 text-white border-red-700' : 'bg-red-100 text-red-800 border-red-200'
                              }`}>
                                {rep.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="font-bold text-slate-900 text-sm">{rep.name}</h4>
                                  <button
                                    onClick={() => openEditRepModal(rep)}
                                    className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 transition-colors"
                                    title={`Editar dados de ${rep.name}`}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="inline-block text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">
                                    {rep.code}
                                  </span>
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                    rep.isActive 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {rep.isActive ? 'Ativo' : 'Inativo'}
                                  </span>
                                  {isSelected && (
                                    <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                                      Selecionado
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => openEditRepModal(rep)}
                              className="text-xs bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold px-2.5 py-1 rounded-lg border border-slate-200 hover:border-red-200 transition-colors flex items-center gap-1 shrink-0"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                          </div>

                          {/* Info Rows */}
                          <div className="space-y-2 text-xs text-slate-600 mb-4">
                            <p className="flex items-start gap-1.5 font-medium text-slate-900">
                              <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                              <span>{rep.regionName}</span>
                            </p>

                            <div className="flex items-center justify-between">
                              <p className="flex items-center gap-1.5 text-emerald-700 font-medium">
                                <Phone className="w-4 h-4 shrink-0" />
                                <span>{rep.phone}</span>
                              </p>
                              <a
                                href={`https://api.whatsapp.com/send?phone=${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold hover:underline flex items-center gap-0.5"
                              >
                                <MessageCircle className="w-3 h-3" /> WhatsApp
                              </a>
                            </div>

                            {rep.email && (
                              <p className="text-[11px] text-slate-500 truncate">
                                ✉️ {rep.email}
                              </p>
                            )}

                            {rep.notes && (
                              <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                {rep.notes}
                              </p>
                            )}

                            <div className="pt-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Cidades & Bairros Atendidos ({rep.cities.length}):
                              </span>
                              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                                {rep.cities.map((city, cIdx) => (
                                  <span key={cIdx} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded">
                                    {city}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                          <span className="text-slate-500 font-medium">
                            {repOrders.length} pedidos
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedSalesRep(rep);
                                setSelectedRepFilter(rep.id);
                                setActiveTab('orders');
                              }}
                              className="text-red-600 hover:text-red-700 font-bold hover:underline"
                            >
                              Ver Pedidos →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Invoice Modal for Official NF View */}
      {isInvoiceModalOpen && invoiceOrder && (
        <InvoicePreviewModal
          order={invoiceOrder}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      )}
    </>
  );
};
