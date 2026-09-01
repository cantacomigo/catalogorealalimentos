export type BrandId =
  | 'vigor'
  | 'rezende'
  | 'seara'
  | 'zinho'
  | 'todahora'
  | 'xando'
  | 'demarchi'
  | 'massaleve'
  | 'simplot'
  | 'alfama'
  | 'domfredy'
  | 'topmais'
  | 'padrinho'
  | 'riberalves'
  | 'cepera'
  | 'knorr'
  | 'reservaone'
  | 'vabene'
  | 'olimpia'
  | 'todas';

export interface Brand {
  id: BrandId;
  name: string;
  categoryDesc: string;
  logoBg: string;
  textColor: string;
  accentColor: string;
  badgeText?: string;
  description: string;
}

export type StorageTemperature = 'congelado' | 'resfriado' | 'ambiente' | 'seco';

export interface Product {
  id: string;
  name: string;
  brand: BrandId;
  brandName: string;
  category: string;
  weight: string;
  packageType: string;
  description: string;
  temperature: StorageTemperature;
  pageNumber: number;
  tags: string[];
  suggestedPrice: number;
  originalPrice?: number;
  imageUrl?: string;
  isCustomPrice?: boolean;
  isCustomImage?: boolean;
  highlight?: string;
  barcode?: string;
  stockQuantity?: number;
  minStockAlert?: number;
  isOutOfStock?: boolean;
  isUnlimitedStock?: boolean;
}

export interface ProductStock {
  productId: string;
  stockQuantity: number;
  minStockAlert?: number;
  unit?: string;
  isUnlimited?: boolean;
  lastUpdated?: string;
  customPrice?: number;
  customImage?: string;
}

export interface StockMovementLog {
  id?: string;
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  changeAmount: number;
  reason: string;
  timestamp: string;
}

export interface BulkPriceAdjustment {
  type: 'percentage' | 'fixed';
  value: number; // e.g. +10 for +10%, or +2.50 for +R$ 2,50
  brand?: BrandId | 'todas';
  category?: string | 'todas';
  roundDecimals?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitType: 'unidade' | 'caixa' | 'fardo';
  notes?: string;
}

export interface OrderCustomerInfo {
  name: string;
  companyName?: string;
  cnpjOrCpf?: string;
  stateRegistration?: string; // Inscrição Estadual (IE)
  phone: string;
  email?: string;
  address: string;
  neighborhood?: string; // Bairro
  city: string;
  state?: string; // UF
  zipCode?: string; // CEP
  paymentMethod: string;
  deliveryNotes?: string;
}

export interface SalesRep {
  id: string;
  name: string;
  code: string;
  phone: string; // WhatsApp formatted e.g. "5511991234567"
  email?: string;
  regionName: string; // Ex: "São Paulo - Capital (Centro, Zona Sul, Zona Oeste)"
  cities: string[]; // Ex: ["São Paulo", "Pinheiros", "Moema", "Centro"]
  avatarUrl?: string;
  isActive: boolean;
  notes?: string;
  password?: string; // Individual private password/PIN set by Administrator
  lastPasswordChange?: string;
}

export type OrderStatus =
  | 'aguardando_vendedor'   // Pedido feito pelo cliente, aguardando representante
  | 'em_analise'            // Vendedor revisando / negociando com o cliente
  | 'enviado_faturamento'   // Vendedor enviou para empresa emitir pedido & NF
  | 'faturado_nf'           // Pedido e Nota Fiscal emitidos pela empresa
  | 'concluido'             // Entregue / Concluído
  | 'cancelado';

export interface OrderItem {
  productId: string;
  productName: string;
  brandName: string;
  weight: string;
  pageNumber: number;
  quantity: number;
  unitType: 'unidade' | 'caixa' | 'fardo';
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  imageUrl?: string;
}

export interface Order {
  id: string; // Ex: PED-2026-0814
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  customer: OrderCustomerInfo;
  salesRep: {
    id: string;
    name: string;
    code: string;
    phone: string;
    regionName: string;
  };
  items: OrderItem[];
  totalVolumes: number;
  totalAmount: number;
  discountPercentage?: number;
  discountAmount?: number;
  finalAmount: number;
  
  // Condições do Vendedor
  representativeNotes?: string;
  paymentTerms?: string; // Ex: Boleto 28 DD, À Vista 3% desc, Pix, Cartão
  deliveryDatePreference?: string;
  
  // Encaminhamento para a Empresa / Matriz (Faturamento & NF)
  forwardedToCompanyAt?: string;
  forwardedByRepName?: string;
  companyInvoiceNumber?: string; // Número da NF emitida
  companyInvoiceNotes?: string;
}

export interface CompanySettings {
  companyName: string;
  tradingName: string;
  cnpj: string;
  stateRegistration: string;
  phone: string;
  whatsappFaturamento: string;
  emailFaturamento: string;
  address: string;
  city: string;
  state: string;
}

export interface FilterState {
  searchQuery: string;
  selectedBrand: BrandId;
  selectedCategory: string;
  selectedTemperature: string;
  selectedPage: number | null;
  selectedTag: string | null;
  sortBy: 'relevance' | 'name-asc' | 'name-desc' | 'brand' | 'page-asc' | 'price-asc' | 'price-desc';
}
