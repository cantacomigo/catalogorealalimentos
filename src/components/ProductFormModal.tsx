import React, { useState, useEffect, useRef } from 'react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BRANDS } from '../data/brands';
import { CATEGORIES } from '../data/categories';
import { BrandId, StorageTemperature } from '../types';
import { compressImage } from '../services/productCustomizationService';
import {
  X,
  PlusCircle,
  Edit3,
  Camera,
  Check,
  Trash2,
  Image as ImageIcon,
  Boxes,
  DollarSign,
  Tag,
  BookOpen,
  ThermometerSnowflake,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

const PACKAGE_TYPES = [
  'Unidade',
  'Caixa',
  'Fardo',
  'Pacote',
  'Pote Individual',
  'Bandeja',
  'Balde',
  'Peça',
  'Barra',
  'Garrafa',
  'Bisnaga',
  'Sachê',
  'Bag Food Service'
];

export function ProductFormModal() {
  const {
    isProductFormOpen,
    setIsProductFormOpen,
    editingProductForForm,
    saveCustomProduct,
    deleteProduct
  } = useProducts();
  const { showToast } = useCart();
  const { isAdmin } = useAuth();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState<BrandId>('vigor');
  const [customBrandName, setCustomBrandName] = useState('');
  const [category, setCategory] = useState('laticinios-iogurtes');
  const [priceInput, setPriceInput] = useState('19.90');
  const [stockInput, setStockInput] = useState('50');
  const [minAlertInput, setMinAlertInput] = useState('10');
  const [weight, setWeight] = useState('1kg');
  const [packageType, setPackageType] = useState('Unidade');
  const [temperature, setTemperature] = useState<StorageTemperature>('resfriado');
  const [pageNumberInput, setPageNumberInput] = useState('2');
  const [highlight, setHighlight] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isProductFormOpen) {
      setConfirmDelete(false);
      if (editingProductForForm) {
        setName(editingProductForForm.name || '');
        setBrand(editingProductForForm.brand || 'vigor');
        setCustomBrandName(editingProductForForm.brandName || '');
        setCategory(editingProductForForm.category || 'laticinios-iogurtes');
        setPriceInput(String((editingProductForForm.suggestedPrice || 0).toFixed(2)));
        setStockInput(String(editingProductForForm.stockQuantity ?? 50));
        setMinAlertInput(String(editingProductForForm.minStockAlert ?? 10));
        setWeight(editingProductForForm.weight || '1 un');
        setPackageType(editingProductForForm.packageType || 'Unidade');
        setTemperature(editingProductForForm.temperature || 'resfriado');
        setPageNumberInput(String(editingProductForForm.pageNumber || 2));
        setHighlight(editingProductForForm.highlight || '');
        setDescription(editingProductForForm.description || '');
        setTagsInput(Array.isArray(editingProductForForm.tags) ? editingProductForForm.tags.join(', ') : '');
        setImageUrl(editingProductForForm.imageUrl || '');
      } else {
        setName('');
        setBrand('vigor');
        setCustomBrandName('Vigor');
        setCategory('laticinios-iogurtes');
        setPriceInput('');
        setStockInput('50');
        setMinAlertInput('10');
        setWeight('1kg');
        setPackageType('Unidade');
        setTemperature('resfriado');
        setPageNumberInput('2');
        setHighlight('Novidade');
        setDescription('');
        setTagsInput('');
        setImageUrl('');
      }
    }
  }, [isProductFormOpen, editingProductForForm]);

  if (!isProductFormOpen || !isAdmin) return null;

  const isEditing = Boolean(editingProductForForm);

  const handleBrandChange = (newBrandId: BrandId) => {
    setBrand(newBrandId);
    const found = BRANDS.find(b => b.id === newBrandId);
    if (found && found.id !== 'todas') {
      setCustomBrandName(found.name);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Otimizando foto do produto...');
      const compressed = await compressImage(file, 600, 0.85);
      setImageUrl(compressed);
      showToast('Foto carregada e pronta para salvar!');
    } catch (err: any) {
      showToast(`Erro ao processar imagem: ${err?.message || 'Tente novamente'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast('Por favor, informe o nome do produto.');
      return;
    }

    const parsedPrice = parseFloat(String(priceInput).replace(',', '.'));
    const validPrice = !isNaN(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 0;
    const parsedStock = parseInt(stockInput, 10);
    const validStock = !isNaN(parsedStock) && parsedStock >= 0 ? parsedStock : 50;
    const parsedMinAlert = parseInt(minAlertInput, 10);
    const validMinAlert = !isNaN(parsedMinAlert) && parsedMinAlert >= 0 ? parsedMinAlert : 10;
    const parsedPage = parseInt(pageNumberInput, 10);
    const validPage = !isNaN(parsedPage) && parsedPage >= 2 ? parsedPage : 2;

    const selectedBrandObj = BRANDS.find(b => b.id === brand);
    const resolvedBrandName = customBrandName.trim() || selectedBrandObj?.name || 'Real Alimentos';

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (parsedTags.length === 0) {
      parsedTags.push(resolvedBrandName);
      if (weight.trim()) parsedTags.push(weight.trim());
    }

    setIsSaving(true);
    try {
      const saved = await saveCustomProduct(
        {
          id: editingProductForForm?.id,
          name: trimmedName,
          brand,
          brandName: resolvedBrandName,
          category,
          weight: weight.trim() || '1 un',
          packageType: packageType.trim() || 'Unidade',
          description:
            description.trim() ||
            `${trimmedName} (${resolvedBrandName}) - ${weight.trim() || '1 un'}. Distribuído por Real Alimentos.`,
          temperature,
          pageNumber: validPage,
          tags: parsedTags,
          suggestedPrice: validPrice,
          originalPrice: editingProductForForm?.originalPrice ?? validPrice,
          imageUrl: imageUrl.trim(),
          highlight: highlight.trim()
        },
        validStock,
        validMinAlert
      );

      showToast(
        isEditing
          ? `Produto "${saved.name}" atualizado com sucesso!`
          : `Novo item "${saved.name}" cadastrado no catálogo e sincronizado no Firebase!`
      );
      setIsProductFormOpen(false);
    } catch (err: any) {
      showToast(`Erro ao salvar produto: ${err?.message || 'Tente novamente'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingProductForForm) return;
    setIsSaving(true);
    try {
      await deleteProduct(editingProductForForm.id);
      showToast(`Produto "${editingProductForForm.name}" removido do catálogo.`);
      setIsProductFormOpen(false);
    } catch (err: any) {
      showToast(`Erro ao excluir produto: ${err?.message || 'Tente novamente'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {isEditing ? 'Editar Cadastro do Produto' : 'Cadastrar Novo Item Individual'}
              </h3>
              <p className="text-xs text-slate-300">
                {isEditing
                  ? 'Altere nome, marca, categoria, preço, estoque ou foto no catálogo.'
                  : 'Adicione um novo produto individualmente ao catálogo e estoque Firebase.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsProductFormOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/60">
          {/* 1. Nome do Produto & Selo de Destaque */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Produto <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Queijo Mussarela Fatiado Vigor 500g"
                  className="w-full px-3.5 py-2 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selo / Destaque (Opcional)
                </label>
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value)}
                  placeholder="Ex: Novidade, Oferta..."
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            {/* Marca e Categoria */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Marca do Catálogo <span className="text-red-600">*</span>
                </label>
                <select
                  value={brand}
                  onChange={(e) => handleBrandChange(e.target.value as BrandId)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
                >
                  {BRANDS.filter(b => b.id !== 'todas').map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Exibido da Marca
                </label>
                <input
                  type="text"
                  value={customBrandName}
                  onChange={(e) => setCustomBrandName(e.target.value)}
                  placeholder="Ex: Vigor, Seara ou Outra Marca"
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Departamento / Categoria <span className="text-red-600">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
                >
                  {CATEGORIES.filter(c => c.id !== 'todas').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Preço & Estoque Inicial (Sincronizados com Firestore) */}
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-blue-950">
              <DollarSign className="w-4 h-4 text-blue-700" />
              <span>Preço de Tabela & Controle de Estoque (Firestore)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preço Unitário / Sugerido (R$) <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="24.90"
                    className="w-full pl-9 pr-3 py-2 text-sm font-extrabold text-blue-950 bg-white border border-blue-300 rounded-xl focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Qtd. em Estoque Atual
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value)}
                  placeholder="50"
                  className="w-full px-3 py-2 text-sm font-extrabold text-emerald-900 bg-white border border-blue-300 rounded-xl focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alerta de Estoque Mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  value={minAlertInput}
                  onChange={(e) => setMinAlertInput(e.target.value)}
                  placeholder="10"
                  className="w-full px-3 py-2 text-sm font-bold text-slate-800 bg-white border border-blue-300 rounded-xl focus:border-blue-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Especificações Técnicas (Peso, Embalagem, Temperatura, Página) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peso / Volume
                </label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ex: 500g, 1kg, 2L"
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Apresentação / Emb.
                </label>
                <select
                  value={PACKAGE_TYPES.includes(packageType) ? packageType : 'Unidade'}
                  onChange={(e) => setPackageType(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
                >
                  {PACKAGE_TYPES.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Conservação
                </label>
                <select
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value as StorageTemperature)}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
                >
                  <option value="resfriado">Resfriado</option>
                  <option value="congelado">Congelado</option>
                  <option value="ambiente">Ambiente / Seco</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Página do Catálogo
                </label>
                <input
                  type="number"
                  min="2"
                  max="99"
                  value={pageNumberInput}
                  onChange={(e) => setPageNumberInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            {/* Descrição e Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição Comercial (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrição breve sobre o produto para os clientes..."
                  className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags de Busca (separadas por vírgula)
                </label>
                <textarea
                  rows={2}
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Ex: Food Service, Pizzaria, Fatiado, 1kg"
                  className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Foto do Produto */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Foto do Produto (Upload do dispositivo ou Link de Imagem)
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={name || 'Preview'}
                    className="w-full h-full object-contain p-1"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <ImageIcon className="w-7 h-7 text-slate-400" />
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Enviar Foto do Computador / Celular</span>
                  </button>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      Remover Foto
                    </button>
                  )}
                </div>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Ou cole aqui a URL da imagem (https://...)"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
            {isEditing ? (
              <div>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Produto</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-xl">
                    <span className="text-[11px] font-bold text-red-800">Confirmar exclusão?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isSaving}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                    >
                      Sim, Excluir
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setIsProductFormOpen(false)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isSaving
                    ? 'Salvando no Firebase...'
                    : isEditing
                    ? 'Salvar Alterações'
                    : 'Cadastrar Produto no Catálogo'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
