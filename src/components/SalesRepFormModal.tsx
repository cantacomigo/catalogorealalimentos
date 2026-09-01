import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Check, 
  Trash2, 
  AlertTriangle, 
  Plus, 
  Building2, 
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { SalesRep } from '../types';
import { safeOpenUrl } from '../services/orderService';

export const SalesRepFormModal: React.FC = () => {
  const { 
    isRepFormModalOpen, 
    setIsRepFormModalOpen, 
    editingRep, 
    saveSalesRep, 
    deleteSalesRep,
    salesReps,
    showToast 
  } = useCart();
  const { isAdmin } = useAuth();

  const isEditing = Boolean(editingRep);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [regionName, setRegionName] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Popular sample cities in SP/Brazil for fast suggestion chips
  const SUGGESTED_CITIES = [
    'São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André',
    'Osasco', 'Sorocaba', 'Ribeirão Preto', 'Santos', 'São José dos Campos',
    'Piracicaba', 'Jundiaí', 'Bauru', 'Barueri', 'Praia Grande', 'Taubaté'
  ];

  // Initialize form when modal opens or editingRep changes
  useEffect(() => {
    if (isRepFormModalOpen) {
      if (editingRep) {
        setName(editingRep.name);
        setCode(editingRep.code);
        setPhone(editingRep.phone);
        setEmail(editingRep.email || '');
        setRegionName(editingRep.regionName);
        setCities([...editingRep.cities]);
        setNotes(editingRep.notes || '');
        setAvatarUrl(editingRep.avatarUrl || '');
        setIsActive(editingRep.isActive !== false);
      } else {
        // New Sales Rep defaults
        const nextNumber = (salesReps.length + 1).toString().padStart(2, '0');
        setName('');
        setCode(`RTV-${nextNumber}`);
        setPhone('5511');
        setEmail('');
        setRegionName('');
        setCities(['São Paulo']);
        setNotes('');
        setAvatarUrl('');
        setIsActive(true);
      }
      setErrors({});
      setShowDeleteConfirm(false);
      setCityInput('');
    }
  }, [isRepFormModalOpen, editingRep, salesReps.length]);

  if (!isRepFormModalOpen) return null;
  if (!isAdmin) return null;

  const handleAddCity = () => {
    const trimmed = cityInput.trim();
    if (!trimmed) return;

    // Support comma-separated additions
    const newItems = trimmed
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0 && !cities.some(existing => existing.toLowerCase() === c.toLowerCase()));

    if (newItems.length > 0) {
      setCities([...cities, ...newItems]);
      setCityInput('');
    }
  };

  const handleRemoveCity = (cityToRemove: string) => {
    setCities(cities.filter(c => c !== cityToRemove));
  };

  const handleAddSuggestedCity = (sugCity: string) => {
    if (!cities.some(c => c.toLowerCase() === sugCity.toLowerCase())) {
      setCities([...cities, sugCity]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Informe o nome do vendedor.';
    }
    if (!code.trim()) {
      newErrors.code = 'Informe o código do vendedor (ex: RTV-01).';
    }
    
    // Validate phone (must have at least 10-11 digits)
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = 'Informe um telefone/WhatsApp válido com DDD (mínimo 10 dígitos).';
    }

    if (!regionName.trim()) {
      newErrors.regionName = 'Informe a região ou setor comercial de atendimento.';
    }

    if (cities.length === 0) {
      newErrors.cities = 'Adicione ao menos uma cidade ou bairro atendido.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Ensure phone has DDI format for WhatsApp links
      let formattedPhone = phone.replace(/\D/g, '');
      if (!formattedPhone.startsWith('55') && (formattedPhone.length === 10 || formattedPhone.length === 11)) {
        formattedPhone = `55${formattedPhone}`;
      }

      const repId = editingRep ? editingRep.id : `rep-${Date.now()}-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

      const repData: SalesRep = {
        id: repId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        phone: formattedPhone,
        email: email.trim() || undefined,
        regionName: regionName.trim(),
        cities,
        notes: notes.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        isActive
      };

      await saveSalesRep(repData);
      setIsRepFormModalOpen(false);
    } catch (err: any) {
      console.error('Error saving sales rep:', err);
      showToast('Erro ao salvar vendedor. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingRep) return;
    if (salesReps.length <= 1) {
      showToast('É necessário manter pelo menos um vendedor cadastrado no sistema.');
      return;
    }

    setIsSaving(true);
    try {
      await deleteSalesRep(editingRep.id);
      setIsRepFormModalOpen(false);
    } catch (err) {
      console.error('Error deleting sales rep:', err);
      showToast('Erro ao excluir vendedor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWhatsApp = () => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('55') && (cleanPhone.length === 10 || cleanPhone.length === 11)) {
      cleanPhone = `55${cleanPhone}`;
    }
    const testMsg = encodeURIComponent(`Olá ${name || 'Vendedor'}! Teste de integração do Catálogo Digital Real Alimentos.`);
    safeOpenUrl(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${testMsg}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 via-red-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <User className="w-5 h-5 text-red-200" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg font-serif">
                  {isEditing ? 'Editar Vendedor / Representante' : 'Cadastrar Novo Vendedor'}
                </h3>
                <p className="text-xs text-red-100">
                  {isEditing 
                    ? `Atualize os dados de atendimento e região de ${editingRep?.name}`
                    : 'Adicione um novo representante comercial com suas rotas e WhatsApp'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsRepFormModalOpen(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* Top Grid: Name, Code, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-7">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo do Vendedor *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Oliveira"
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-xl outline-none transition-all ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.name}</p>}
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Código / RTV *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: RTV-01"
                  className={`w-full px-3 py-2 text-sm font-mono font-bold border rounded-xl outline-none transition-all uppercase ${
                    errors.code ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                  }`}
                />
                {errors.code && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.code}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status
                </label>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`w-full py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' 
                      : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {isActive ? 'Ativo' : 'Inativo'}
                </button>
              </div>
            </div>

            {/* Contacts: Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    WhatsApp Comercial *
                  </label>
                  {phone.replace(/\D/g, '').length >= 10 && (
                    <button
                      type="button"
                      onClick={handleTestWhatsApp}
                      className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="w-3 h-3" /> Testar no WhatsApp
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: (11) 99123-4567 ou 5511991234567"
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-xl outline-none transition-all ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Número para onde os clientes enviarão os pedidos fechados pelo catálogo.
                </p>
                {errors.phone && <p className="text-[11px] text-red-600 font-medium mt-0.5">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  E-mail Corporativo (Opcional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: vendedor@realalimentos.com.br"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Region & Coverage */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome da Região / Setor Comercial *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-red-600 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={regionName}
                  onChange={(e) => setRegionName(e.target.value)}
                  placeholder="Ex: São Paulo - Capital (Centro, Zona Sul e Zona Oeste)"
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-xl outline-none transition-all ${
                    errors.regionName ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                  }`}
                />
              </div>
              {errors.regionName && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.regionName}</p>}
            </div>

            {/* Cities and Neighborhoods Tags */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-red-600" />
                    Cidades & Bairros Atendidos ({cities.length}) *
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Usado no roteamento automático pelo CEP/endereço
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCity();
                      }
                    }}
                    placeholder="Digite uma cidade ou bairro e clique em Adicionar (ex: Campinas, Moema)..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-red-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCity}
                    className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
                {errors.cities && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.cities}</p>}
              </div>

              {/* Tags Display */}
              <div className="flex flex-wrap gap-1.5 min-h-[36px] bg-white p-2.5 rounded-lg border border-slate-200 max-h-32 overflow-y-auto">
                {cities.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">
                    Nenhuma cidade cadastrada ainda. Adicione as localidades atendidas.
                  </span>
                ) : (
                  cities.map((city, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-red-50 text-red-800 border border-red-200 text-xs px-2.5 py-0.5 rounded-full font-medium"
                    >
                      {city}
                      <button
                        type="button"
                        onClick={() => handleRemoveCity(city)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-200 rounded-full p-0.5"
                        title={`Remover ${city}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Sugestões Rápidas:
                </span>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_CITIES.filter(s => !cities.some(c => c.toLowerCase() === s.toLowerCase())).slice(0, 8).map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => handleAddSuggestedCity(sug)}
                      className="text-[10px] bg-slate-200/80 hover:bg-red-100 text-slate-700 hover:text-red-800 px-2 py-0.5 rounded-md transition-colors flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" /> {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes & Specialties */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Segmentos de Atuação / Observações Comerciais
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Especialista em Food Service, Bares, Restaurantes, Pizzarias e Redes de Padarias..."
                className="w-full p-3 text-xs border border-slate-300 rounded-xl outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 resize-none transition-all"
              />
            </div>

            {/* Delete Confirmation Box */}
            {showDeleteConfirm && isEditing && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs text-red-900">
                  <p className="font-bold">Tem certeza que deseja excluir o vendedor {name}?</p>
                  <p className="text-red-700 mt-0.5">Esta ação removerá o vendedor do roteamento de novos pedidos.</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isSaving}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs"
                    >
                      {isSaving ? 'Excluindo...' : 'Sim, Excluir Vendedor'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg font-semibold text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Footer Actions */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div>
              {isEditing && !showDeleteConfirm && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir Vendedor
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setIsRepFormModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <span>Salvando...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEditing ? 'Salvar Alterações' : 'Cadastrar Vendedor'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
