import { Brand, BrandId } from '../types';

// High-Definition Crisp Vector Emblem Logo for Real Alimentos
export const REAL_ALIMENTOS_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#DC2626" />
      <stop offset="60%" stop-color="#991B1B" />
      <stop offset="100%" stop-color="#7F1D1D" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>
  
  <!-- Outer Rounded Shield -->
  <rect x="10" y="10" width="180" height="180" rx="36" fill="url(#bgGrad)" stroke="url(#goldGrad)" stroke-width="4" filter="url(#shadow)"/>
  
  <!-- Subtle Inner Border -->
  <rect x="18" y="18" width="164" height="164" rx="28" fill="none" stroke="#FDE047" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.7"/>

  <!-- Golden Crown -->
  <path d="M60 70 L75 42 L100 58 L125 42 L140 70 Z" fill="url(#goldGrad)" stroke="#B45309" stroke-width="2"/>
  <circle cx="75" cy="40" r="5" fill="#FEF08A" stroke="#B45309" stroke-width="1"/>
  <circle cx="100" cy="54" r="5.5" fill="#FEF08A" stroke="#B45309" stroke-width="1"/>
  <circle cx="125" cy="40" r="5" fill="#FEF08A" stroke="#B45309" stroke-width="1"/>
  
  <!-- Central Emblem Banner -->
  <rect x="42" y="74" width="116" height="82" rx="14" fill="#6B1313" stroke="url(#goldGrad)" stroke-width="3"/>
  
  <!-- Monogram R -->
  <path d="M78 88 H104 C113 88 119 93 119 101 C119 107 115 111 109 113 L122 138 H108 L96 115 H89 V138 H78 V88 Z M89 106 H103 C107 106 109 104 109 101 C109 98 107 96 103 96 H89 V106 Z" fill="#FFFFFF" />

  <!-- Stars & Underline -->
  <polygon points="100,145 103,151 109,151 104,155 106,161 100,157 94,161 96,155 91,151 97,151" fill="url(#goldGrad)" />
  <line x1="56" y1="153" x2="90" y2="153" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="110" y1="153" x2="144" y2="153" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round"/>
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
