import { SalesRep, CompanySettings } from '../types';

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'Real Alimentos Distribuidora Ltda',
  tradingName: 'Real Alimentos Distribuidora',
  cnpj: '45.892.102/0001-35',
  stateRegistration: '112.489.300.114',
  phone: '(11) 3228-5500',
  whatsappFaturamento: '5511998887777', // WhatsApp da Matriz / Faturamento / Emissão de NF
  emailFaturamento: 'faturamento@realalimentos.com.br',
  address: 'Av. das Nações Unidas, 14200 - Galpão 04',
  city: 'São Paulo',
  state: 'SP'
};

export const INITIAL_SALES_REPS: SalesRep[] = [
  {
    id: 'rep-sp-capital-centro-sul',
    name: 'Carlos Oliveira',
    code: 'RTV-01',
    password: '1234',
    phone: '5511991234567',
    email: 'carlos.oliveira@realalimentos.com.br',
    regionName: 'São Paulo - Capital (Centro, Zona Sul e Zona Oeste)',
    cities: [
      'São Paulo',
      'Centro',
      'Pinheiros',
      'Moema',
      'Morumbi',
      'Vila Mariana',
      'Itaim Bibi',
      'Santo Amaro',
      'Brooklin',
      'Lapa',
      'Perdizes',
      'Butantã',
      'Jardins',
      'Campo Belo',
      'Vila Leopoldina'
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    notes: 'Especialista em Food Service, Bares, Restaurantes e Redes de Padarias.'
  },
  {
    id: 'rep-sp-capital-leste-norte',
    name: 'Mariana Santos',
    code: 'RTV-02',
    password: '1234',
    phone: '5511992345678',
    email: 'mariana.santos@realalimentos.com.br',
    regionName: 'São Paulo - Capital (Zona Leste, Zona Norte e Guarulhos)',
    cities: [
      'São Paulo',
      'Tatuapé',
      'Mooca',
      'Anália Franco',
      'Santana',
      'Penha',
      'Tucuruvi',
      'Guarulhos',
      'Itaquera',
      'Vila Maria',
      'Casa Verde',
      'Vila Guilherme',
      'São Miguel Paulista'
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    notes: 'Atendimento a Supermercados, Mercadinhos, Pizzarias e Lanchonetes.'
  },
  {
    id: 'rep-campinas-interior',
    name: 'Fernando Souza',
    code: 'RTV-03',
    password: '1234',
    phone: '5519987654321',
    email: 'fernando.souza@realalimentos.com.br',
    regionName: 'Região de Campinas, RMC & Interior Paulista',
    cities: [
      'Campinas',
      'Paulínia',
      'Sumaré',
      'Hortolândia',
      'Americana',
      'Indaiatuba',
      'Valinhos',
      'Vinhedo',
      'Jundiaí',
      'Piracicaba',
      'Limeira',
      'Sorocaba',
      'Itu',
      'Salto'
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    notes: 'Distribuição atacado regional com rotas diárias de entrega refrigerada.'
  },
  {
    id: 'rep-abc-litoral',
    name: 'Roberto Lima',
    code: 'RTV-04',
    password: '1234',
    phone: '5513996543210',
    email: 'roberto.lima@realalimentos.com.br',
    regionName: 'Grande ABC & Litoral Paulista (Baixada Santista)',
    cities: [
      'Santo André',
      'São Bernardo do Campo',
      'São Caetano do Sul',
      'Diadema',
      'Mauá',
      'Santos',
      'São Vicente',
      'Praia Grande',
      'Guarujá',
      'Cubatão',
      'Bertioga',
      'Itanhaém'
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    notes: 'Atendimento especializado para Quiosques, Hotéis, Restaurantes e Empórios.'
  },
  {
    id: 'rep-vale-paraiba',
    name: 'Juliana Costa',
    code: 'RTV-05',
    password: '1234',
    phone: '5512998761234',
    email: 'juliana.costa@realalimentos.com.br',
    regionName: 'Vale do Paraíba, Serra da Mantiqueira & Alto Tietê',
    cities: [
      'São José dos Campos',
      'Taubaté',
      'Jacareí',
      'Mogi das Cruzes',
      'Suzano',
      'Caçapava',
      'Pindamonhangaba',
      'Guaratinguetá',
      'Campos do Jordão',
      'Lorena'
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    notes: 'Foco em Gastronomia, Redes Hoteleiras e Confeitarias artesanais.'
  },
  {
    id: 'rep-central-geral',
    name: 'Central de Vendas Real Alimentos',
    code: 'RTV-00',
    password: '1234',
    phone: '5511998887777',
    email: 'comercial@realalimentos.com.br',
    regionName: 'Demais Cidades & Atendimento Geral Brasil',
    cities: [
      'Outras Cidades',
      'Todo o Brasil',
      'São Paulo - Outros Bairros',
      'Atendimento Geral'
    ],
    avatarUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=200&q=80',
    isActive: true,
    notes: 'Mesa de Operações e Vendas Corporativas da Matriz Real Alimentos.'
  }
];

/**
 * Helper to recommend or find representative based on city/region text
 */
export function findSalesRepByLocation(text: string, reps: SalesRep[] = INITIAL_SALES_REPS): SalesRep {
  if (!text || text.trim() === '') {
    return reps[0] || INITIAL_SALES_REPS[0];
  }

  const clean = text.toLowerCase().trim();

  // Match against city list
  for (const rep of reps) {
    if (!rep.isActive) continue;
    const matchedCity = rep.cities.some(city => clean.includes(city.toLowerCase()) || city.toLowerCase().includes(clean));
    const matchedRegion = rep.regionName.toLowerCase().includes(clean);
    if (matchedCity || matchedRegion) {
      return rep;
    }
  }

  return reps.find(r => r.id === 'rep-central-geral') || reps[0];
}
