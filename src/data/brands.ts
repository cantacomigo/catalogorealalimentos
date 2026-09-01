import { Brand, BrandId } from '../types';

// Official Real Alimentos Logo Vector Data URI (Exact match to official branding: Blue typography + Red & Blue Flame)
export const REAL_ALIMENTOS_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120" width="100%" height="100%">
  <!-- Clean white background rounded card for optimal contrast anywhere -->
  <rect x="0" y="0" width="420" height="120" rx="16" fill="#FFFFFF"/>
  
  <!-- "Real Alimentos" Typography in official royal blue -->
  <text x="24" y="78" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="44" font-weight="900" fill="#00529B" letter-spacing="-1">Real Alimentos</text>
  
  <!-- Flame / Ribbon symbol on the right -->
  <g transform="translate(325, 12) scale(0.72)">
    <!-- Top Red Petal -->
    <path d="M32 38 C 30 18, 48 4, 64 2 C 78 1, 94 12, 94 28 C 94 42, 80 54, 60 56 C 54 44, 42 38, 32 38 Z" fill="#E30613"/>
    <!-- Bottom Blue Swoosh -->
    <path d="M48 20 C 34 26, 20 46, 20 68 C 20 96, 42 118, 68 128 C 82 122, 92 108, 92 90 C 92 70, 78 54, 52 46 C 46 36, 46 26, 48 20 Z" fill="#00529B"/>
    <!-- Center blend shade -->
    <path d="M48 20 C 44 28, 44 38, 54 46 C 62 46, 72 40, 78 32 C 70 24, 58 20, 48 20 Z" fill="#003366" opacity="0.35"/>
  </g>
</svg>
`)}`;

export const BRANDS: Brand[] = [
  {
    id: 'todas',
    name: 'Todas as Marcas',
    categoryDesc: 'Catálogo Geral',
    logoBg: 'bg-slate-800',
    textColor: 'text-white',
    accentColor: '#1e293b',
    description: 'Explore todo o portfólio distribuído pela Real Alimentos.'
  },
  {
    id: 'vigor',
    name: 'Vigor',
    categoryDesc: 'Laticínios, Iogurtes & Queijos Nobres',
    logoBg: 'bg-blue-700',
    textColor: 'text-white',
    accentColor: '#1d4ed8',
    badgeText: 'Líder de Mercado',
    description: 'Iogurtes Gregos, Bebidas Lácteas Protein, Requeijões, Manteigas, Danúbio e Queijos Faixa Azul.'
  },
  {
    id: 'rezende',
    name: 'Rezende',
    categoryDesc: 'Frios, Carnes, Bacon & Pratos Prontos',
    logoBg: 'bg-red-700',
    textColor: 'text-white',
    accentColor: '#b91c1c',
    badgeText: 'Tradição & Sabor',
    description: 'Presuntos, Linguiças Calabresas, Salsichas, Bacon, Lasanhas, Pizzas e Hambúrgueres.'
  },
  {
    id: 'seara',
    name: 'Seara',
    categoryDesc: 'Gourmet, Empanados & Food Solutions',
    logoBg: 'bg-orange-600',
    textColor: 'text-white',
    accentColor: '#ea580c',
    badgeText: 'Qualidade Seara',
    description: 'Linha Gourmet, Hambúrguer Queijo Crispy, Chicken Supreme, Salames e Fingers Food.'
  },
  {
    id: 'zinho',
    name: 'Zinho',
    categoryDesc: 'Pães de Alho & Pães Toda Hora',
    logoBg: 'bg-amber-500',
    textColor: 'text-slate-950',
    accentColor: '#f59e0b',
    badgeText: 'Líder em Pão de Alho',
    description: 'Pão de Alho Baguete e Bolinha tradicional/picante, linha Airfryer e pães recheados doces e salgados.'
  },
  {
    id: 'xando',
    name: 'Xandô',
    categoryDesc: 'Leites Tipo A, Queijos & Sucos Integrais',
    logoBg: 'bg-sky-600',
    textColor: 'text-white',
    accentColor: '#0284c7',
    badgeText: 'Fazenda Colorado',
    description: 'Leites Tipo A pasteurizados, Leite A2 de fácil digestão, Queijo de Coalho e Sucos 100% integrais.'
  },
  {
    id: 'demarchi',
    name: 'De Marchi',
    categoryDesc: 'Frutas Congeladas, Polpas & Vegetais',
    logoBg: 'bg-emerald-700',
    textColor: 'text-white',
    accentColor: '#047857',
    badgeText: '100% Natural',
    description: 'Frutas congeladas premium, polpas puras 100g/1kg, legumes e vegetais IQF congelados.'
  },
  {
    id: 'massaleve',
    name: 'Massa Leve',
    categoryDesc: 'Massas Frescas, Pastéis & Pães de Queijo',
    logoBg: 'bg-rose-700',
    textColor: 'text-white',
    accentColor: '#be123c',
    badgeText: 'Desde 1980',
    description: 'Massas de pastel em rolo e disco, nhoques, ravióles recheados, capelettis e pães de queijo.'
  },
  {
    id: 'simplot',
    name: 'Simplot',
    categoryDesc: 'Batatas Pré-Fritas & Especialidades',
    logoBg: 'bg-blue-900',
    textColor: 'text-white',
    accentColor: '#1e3a8a',
    badgeText: 'Crocância Máxima',
    description: 'Batatas palito corte tradicional e fino, Bat Crunch crocante, Sidewinders e Batata Rústica.'
  },
  {
    id: 'alfama',
    name: 'Alfama',
    categoryDesc: 'Carnes Desfiadas Prontas Congeladas',
    logoBg: 'bg-slate-700',
    textColor: 'text-white',
    accentColor: '#334155',
    badgeText: 'Praticidade Food Service',
    description: 'Carne seca bovina desfiada, cupim, costela bovina, pernil suíno e peito de frango 1kg.'
  },
  {
    id: 'domfredy',
    name: 'Dom Fredy',
    categoryDesc: 'Queijo Mussarela em Barra',
    logoBg: 'bg-indigo-700',
    textColor: 'text-white',
    accentColor: '#4338ca',
    badgeText: 'Alto Rendimento',
    description: 'Queijos mussarela de alto rendimento para pizzarias, lanchonetes e fatiadores.'
  },
  {
    id: 'topmais',
    name: 'Top Mais',
    categoryDesc: 'Açaí, Gelos Saborizados & Conservas',
    logoBg: 'bg-red-600',
    textColor: 'text-white',
    accentColor: '#dc2626',
    badgeText: 'Top Mais Sabor',
    description: 'Baldes e potes de Açaí Tradicional/Premium, gelos saborizados para drinks e palmitos de pupunha.'
  },
  {
    id: 'padrinho',
    name: 'Padrinho',
    categoryDesc: 'Pães Especiais para Hamburgueria',
    logoBg: 'bg-yellow-600',
    textColor: 'text-white',
    accentColor: '#ca8a04',
    badgeText: 'Fábrica de Pães',
    description: 'Pães brioche amanteigados, pão australiano, pão tigre craquelado e hambúrguer tradicional.'
  },
  {
    id: 'riberalves',
    name: 'Riberalves',
    categoryDesc: 'Bacalhau Nobre Dessalgado Congelado',
    logoBg: 'bg-blue-800',
    textColor: 'text-white',
    accentColor: '#1e40af',
    badgeText: 'Autêntico Bacalhau',
    description: 'Lombos de Bacalhau Morhua e Saithe dessalgados congelados, postas nobres e bolinhos prontos.'
  },
  {
    id: 'cepera',
    name: 'Cepêra',
    categoryDesc: 'Molhos, Ketchup, Mostardas & Conservas',
    logoBg: 'bg-emerald-800',
    textColor: 'text-white',
    accentColor: '#065f46',
    badgeText: 'Desde 1947',
    description: 'Ketchups artesanais e sachês, mostardas dijon/mel, pimentas, molhos especiais Bob\'s e bags food service.'
  },
  {
    id: 'reservaone',
    name: 'Reserva One',
    categoryDesc: 'Pão de Alho Baguete Gourmet',
    logoBg: 'bg-neutral-900',
    textColor: 'text-amber-400',
    accentColor: '#171717',
    badgeText: 'Cheeeio de Recheio',
    description: 'Pão de alho tipo baguete ultra-recheado com queijo premium.'
  },
  {
    id: 'vabene',
    name: 'VaBene',
    categoryDesc: 'Confeitaria, Sorveteria & Recheios',
    logoBg: 'bg-rose-800',
    textColor: 'text-white',
    accentColor: '#9f1239',
    badgeText: 'Confeitaria Fina',
    description: 'Cremes artesanais leitinho, pistache, avelã, variegatos de sorvete, farofas crocantes e cereais.'
  },
  {
    id: 'olimpia',
    name: 'Olímpia Cervejaria',
    categoryDesc: 'Chopp Artesanal Fresco 1L Pet',
    logoBg: 'bg-amber-700',
    textColor: 'text-white',
    accentColor: '#b45309',
    badgeText: 'Chopp Artesanal',
    description: 'Chopp Pilsen e Chopp Lager artesanais engarrafados de 1 litro.'
  }
];
