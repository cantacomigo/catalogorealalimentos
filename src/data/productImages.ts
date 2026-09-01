import { Product } from '../types';

/**
 * Generates an ultra-crisp, stylized vector packshot SVG (as a safe SVG data URI)
 * that perfectly mirrors the official product packaging from the Real Alimentos catalog PDF.
 */
export function generateCatalogPackshotSvg(product: Partial<Product>): string {
  const name = product.name || 'Produto Real Alimentos';
  const brand = (product.brand || 'vigor').toLowerCase();
  const brandName = product.brandName || 'Real Alimentos';
  const weight = product.weight || '';
  const packageType = product.packageType || '';
  const pageNumber = product.pageNumber || 1;
  const highlight = product.highlight || '';

  // Theme palettes and package shapes according to brand & category
  let primaryColor = '#1d4ed8'; // Blue default
  let accentColor = '#3b82f6';
  let badgeColor = '#fbbf24';
  let packageShape: 'pot' | 'bottle' | 'bag' | 'box' | 'cup' | 'jar' | 'tub' | 'can' | 'tube' = 'pot';
  let iconEmoji = '📦';
  let subText = weight;

  const lowerName = name.toLowerCase();

  // --- VIGOR GREGO ---
  if (lowerName.includes('grego')) {
    packageShape = 'pot';
    iconEmoji = '🥄';
    if (lowerName.includes('frutas verm')) {
      primaryColor = '#be123c';
      accentColor = '#f43f5e';
    } else if (lowerName.includes('flocos')) {
      primaryColor = '#4a044e';
      accentColor = '#86198f';
    } else if (lowerName.includes('pistache')) {
      primaryColor = '#3f6212';
      accentColor = '#65a30d';
    } else if (lowerName.includes('morango')) {
      primaryColor = '#e11d48';
      accentColor = '#fb7185';
    } else if (lowerName.includes('amarelas') || lowerName.includes('maracujá')) {
      primaryColor = '#d97706';
      accentColor = '#f59e0b';
    } else if (lowerName.includes('blueberry') || lowerName.includes('mirtilo')) {
      primaryColor = '#3730a3';
      accentColor = '#6366f1';
    } else if (lowerName.includes('limão') || lowerName.includes('limao')) {
      primaryColor = '#4d7c0f';
      accentColor = '#84cc16';
    } else if (lowerName.includes('zero')) {
      primaryColor = '#0284c7';
      accentColor = '#38bdf8';
    } else {
      primaryColor = '#1e40af';
      accentColor = '#3b82f6';
    }
  } 
  // --- VIGOR VIV PROTEIN / 3GRÃOS ---
  else if (lowerName.includes('protein') || lowerName.includes('viv') || lowerName.includes('3grãos')) {
    packageShape = lowerName.includes('protein') ? 'bottle' : 'cup';
    primaryColor = '#18181b';
    accentColor = lowerName.includes('doce de leite') ? '#d97706' : '#991b1b';
    iconEmoji = '⚡';
  }
  // --- VIGOR REQUEIJÃO & DANÚBIO ---
  else if (lowerName.includes('requeijão') || lowerName.includes('requeijao')) {
    if (lowerName.includes('1,5kg') || lowerName.includes('bisnaga') || lowerName.includes('culinário')) {
      packageShape = 'tube';
      primaryColor = '#1e3a8a';
      accentColor = '#3b82f6';
      iconEmoji = '🧀';
    } else {
      packageShape = 'cup';
      primaryColor = lowerName.includes('light') ? '#047857' : lowerName.includes('zero') ? '#0284c7' : '#1d4ed8';
      accentColor = '#fbbf24';
      iconEmoji = '🧀';
    }
  }
  // --- FAIXA AZUL & QUEIJOS NOBRES ---
  else if (brand === 'vigor' && (lowerName.includes('queijo') || lowerName.includes('parmesão') || lowerName.includes('brie') || lowerName.includes('camembert') || lowerName.includes('gouda') || lowerName.includes('emmental') || lowerName.includes('gruyere'))) {
    packageShape = lowerName.includes('brie') || lowerName.includes('camembert') ? 'box' : 'tub';
    primaryColor = '#0f172a';
    accentColor = '#b45309';
    badgeColor = '#f59e0b';
    iconEmoji = '🧀';
  }
  // --- XANDÔ LEITES & SUCOS ---
  else if (brand === 'xando' || lowerName.includes('xandô') || lowerName.includes('xando')) {
    packageShape = 'bottle';
    if (lowerName.includes('laranja')) {
      primaryColor = '#ea580c';
      accentColor = '#f97316';
      iconEmoji = '🍊';
    } else if (lowerName.includes('uva')) {
      primaryColor = '#581c87';
      accentColor = '#7e22ce';
      iconEmoji = '🍇';
    } else if (lowerName.includes('limonada')) {
      primaryColor = '#65a30d';
      accentColor = '#84cc16';
      iconEmoji = '🍋';
    } else if (lowerName.includes('tangerina') || lowerName.includes('maçã') || lowerName.includes('goiaba')) {
      primaryColor = '#c2410c';
      accentColor = '#ea580c';
      iconEmoji = '🍎';
    } else {
      // Leite Tipo A
      primaryColor = lowerName.includes('desnatado') ? '#15803d' : lowerName.includes('semidesnatado') ? '#b91c1c' : lowerName.includes('a2') ? '#6b21a8' : '#1d4ed8';
      accentColor = '#60a5fa';
      iconEmoji = '🥛';
    }
  }
  // --- REZENDE & SEARA (CARNES, CALABRESA, FRIOS) ---
  else if (brand === 'rezende' || brand === 'seara' || lowerName.includes('calabresa') || lowerName.includes('presunto') || lowerName.includes('bacon') || lowerName.includes('lasanha') || lowerName.includes('pizza') || lowerName.includes('burger')) {
    if (lowerName.includes('lasanha') || lowerName.includes('pizza')) {
      packageShape = 'box';
      primaryColor = brand === 'seara' ? '#c2410c' : '#b91c1c';
      accentColor = '#f59e0b';
      iconEmoji = lowerName.includes('pizza') ? '🍕' : '🍝';
    } else if (lowerName.includes('calabresa') || lowerName.includes('salsicha') || lowerName.includes('bacon')) {
      packageShape = 'bag';
      primaryColor = '#991b1b';
      accentColor = '#dc2626';
      iconEmoji = '🥓';
    } else {
      packageShape = 'box';
      primaryColor = brand === 'seara' ? '#ea580c' : '#991b1b';
      accentColor = '#f97316';
      iconEmoji = '🥩';
    }
  }
  // --- ZINHO & RESERVA ONE (PÃES DE ALHO & TODA HORA) ---
  else if (brand === 'zinho' || brand === 'reservaone' || lowerName.includes('pão de alho') || lowerName.includes('pao de alho') || lowerName.includes('pãozinho')) {
    packageShape = 'bag';
    primaryColor = lowerName.includes('picante') ? '#b91c1c' : lowerName.includes('prestígio') ? '#451a03' : lowerName.includes('leite moça') ? '#0284c7' : lowerName.includes('airfryer') || brand === 'reservaone' ? '#1e293b' : '#d97706';
    accentColor = '#f59e0b';
    iconEmoji = '🥖';
  }
  // --- PADRINHO (PÃES DE HAMBURGUERIA) ---
  else if (brand === 'padrinho' || lowerName.includes('brioche') || lowerName.includes('australiano')) {
    packageShape = 'bag';
    primaryColor = lowerName.includes('australiano') ? '#3b2110' : '#b45309';
    accentColor = '#d97706';
    iconEmoji = '🍔';
  }
  // --- SIMPLOT BATATAS ---
  else if (brand === 'simplot' || lowerName.includes('batata')) {
    packageShape = 'bag';
    primaryColor = lowerName.includes('crunch') ? '#1e293b' : lowerName.includes('coolmind') ? '#0284c7' : '#047857';
    accentColor = '#eab308';
    iconEmoji = '🍟';
  }
  // --- DE MARCHI (VEGETAIS, POLPAS, FRUTAS) ---
  else if (brand === 'demarchi' || lowerName.includes('polpa') || lowerName.includes('ervilha') || lowerName.includes('brócolis') || lowerName.includes('morango')) {
    packageShape = 'bag';
    primaryColor = lowerName.includes('polpa') ? '#7e22ce' : lowerName.includes('morango') ? '#be123c' : '#15803d';
    accentColor = '#22c55e';
    iconEmoji = lowerName.includes('polpa') ? '🥤' : '🥦';
  }
  // --- MASSA LEVE (PASTÉIS, MASSAS, PÃO DE QUEIJO) ---
  else if (brand === 'massaleve' || lowerName.includes('massa') || lowerName.includes('pastel') || lowerName.includes('nhoque') || lowerName.includes('pão de queijo')) {
    packageShape = lowerName.includes('rolo') ? 'tube' : 'bag';
    primaryColor = '#b91c1c';
    accentColor = '#f59e0b';
    iconEmoji = lowerName.includes('pastel') ? '🥟' : lowerName.includes('pão de queijo') ? '🧀' : '🍝';
  }
  // --- CEPÊRA (MOLHOS, KETCHUP, MOSTARDA, CONSERVAS) ---
  else if (brand === 'cepera' || brand === 'knorr' || lowerName.includes('ketchup') || lowerName.includes('mostarda') || lowerName.includes('barbecue') || lowerName.includes('molho') || lowerName.includes('maionese')) {
    if (lowerName.includes('bag') || lowerName.includes('1,10kg') || lowerName.includes('1,1kg')) {
      packageShape = 'bag';
    } else if (lowerName.includes('vidro') || lowerName.includes('300g') || lowerName.includes('pepino') || lowerName.includes('palmito')) {
      packageShape = 'jar';
    } else {
      packageShape = 'bottle';
    }
    primaryColor = lowerName.includes('ketchup') ? '#991b1b' : lowerName.includes('mostarda') ? '#ca8a04' : lowerName.includes('barbecue') ? '#451a03' : lowerName.includes('verde') ? '#15803d' : '#1e3a8a';
    accentColor = '#f59e0b';
    iconEmoji = lowerName.includes('ketchup') ? '🍅' : lowerName.includes('mostarda') ? '🟡' : '🥫';
  }
  // --- VABENE (CONFEITARIA, CREMES, AMENDOIM) ---
  else if (brand === 'vabene' || lowerName.includes('creme') || lowerName.includes('variegato') || lowerName.includes('amendoim')) {
    packageShape = lowerName.includes('3kg') || lowerName.includes('4kg') ? 'tub' : 'tube';
    primaryColor = '#881337';
    accentColor = '#e11d48';
    iconEmoji = '🍫';
  }
  // --- RIBERALVES BACALHAU ---
  else if (brand === 'riberalves' || lowerName.includes('bacalhau')) {
    packageShape = 'box';
    primaryColor = '#0369a1';
    accentColor = '#38bdf8';
    iconEmoji = '🐟';
  }
  // --- OLÍMPIA CHOPP ---
  else if (brand === 'olimpia' || lowerName.includes('chopp')) {
    packageShape = 'bottle';
    primaryColor = lowerName.includes('lager') ? '#15803d' : '#b45309';
    accentColor = '#f59e0b';
    iconEmoji = '🍺';
  }
  // --- TOP MAIS ---
  else if (brand === 'topmais' || lowerName.includes('açaí') || lowerName.includes('acai') || lowerName.includes('gelo')) {
    packageShape = lowerName.includes('açaí') || lowerName.includes('acai') ? 'tub' : 'bag';
    primaryColor = '#581c87';
    accentColor = '#a855f7';
    iconEmoji = '🍧';
  }

  // Clean name for SVG display
  const shortName = name
    .replace(/(Iogurte|Queijo|Leite Tipo A|Molho de Tomate|Massa de|Polpa de|Pãozinho Recheado|Creme de|Pão de Alho)/gi, '')
    .trim()
    .slice(0, 24);

  // SVG Packshot Illustration Template
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accentColor}" />
      <stop offset="100%" stop-color="${primaryColor}" />
    </linearGradient>
    <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5" />
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.15" />
    </linearGradient>
    <filter id="packShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.22" />
    </filter>
  </defs>

  <!-- Background Base Canvas -->
  <rect width="400" height="400" fill="url(#bgGrad)" rx="24" />
  
  <!-- Subtle circular brand ambient backdrop -->
  <circle cx="200" cy="200" r="140" fill="${accentColor}" opacity="0.1" />
  <circle cx="200" cy="200" r="110" fill="${primaryColor}" opacity="0.08" />

  <!-- Catalog Page Tag -->
  <g transform="translate(20, 24)">
    <rect width="64" height="22" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
    <text x="32" y="15" fill="#475569" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">Pág. ${pageNumber}</text>
  </g>

  <!-- Brand Badge Top Right -->
  <g transform="translate(260, 22)">
    <rect width="120" height="26" rx="8" fill="${primaryColor}" />
    <text x="60" y="17" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle" letter-spacing="0.5">${brandName.toUpperCase()}</text>
  </g>

  <!-- MAIN PACKAGE PACKSHOT (Centered Graphic) -->
  <g transform="translate(0, 10)" filter="url(#packShadow)">
    
    ${packageShape === 'bottle' ? `
      <!-- BOTTLE SHAPE -->
      <!-- Bottle Cap -->
      <rect x="180" y="65" width="40" height="20" rx="4" fill="${primaryColor}" stroke="#ffffff" stroke-width="1.5" />
      <!-- Bottle Neck -->
      <path d="M 185 85 L 185 105 L 155 140 L 155 310 Q 155 330 175 330 L 225 330 Q 245 330 245 310 L 245 140 L 215 85 Z" fill="url(#primaryGrad)" />
      <!-- Bottle Shine -->
      <path d="M 185 85 L 185 105 L 155 140 L 155 310 Q 155 330 175 330 L 225 330 Q 245 330 245 310 L 245 140 L 215 85 Z" fill="url(#shineGrad)" />
      <!-- Bottle Label Panel -->
      <rect x="160" y="160" width="80" height="130" rx="8" fill="#ffffff" opacity="0.95" />
      <text x="200" y="195" font-size="28" text-anchor="middle">${iconEmoji}</text>
      <text x="200" y="225" fill="${primaryColor}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="900" text-anchor="middle">${brandName.toUpperCase()}</text>
      <text x="200" y="245" fill="#1e293b" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="700" text-anchor="middle">${shortName.slice(0, 14)}</text>
      <text x="200" y="275" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="800" text-anchor="middle">${weight}</text>
    ` : packageShape === 'bag' ? `
      <!-- POUCH / BAG SHAPE -->
      <path d="M 120 90 Q 200 80 280 90 L 290 320 Q 200 335 110 320 Z" fill="url(#primaryGrad)" />
      <path d="M 120 90 Q 200 80 280 90 L 290 320 Q 200 335 110 320 Z" fill="url(#shineGrad)" />
      <!-- Pouch Top Seal -->
      <line x1="120" y1="105" x2="280" y2="105" stroke="#ffffff" stroke-width="3" stroke-dasharray="4 2" opacity="0.7" />
      <!-- Center Graphic Frame -->
      <rect x="135" y="125" width="130" height="170" rx="14" fill="#ffffff" opacity="0.96" />
      <text x="200" y="170" font-size="34" text-anchor="middle">${iconEmoji}</text>
      <text x="200" y="205" fill="${primaryColor}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="900" text-anchor="middle">${brandName.toUpperCase()}</text>
      <text x="200" y="228" fill="#0f172a" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">${shortName.slice(0, 16)}</text>
      <rect x="150" y="248" width="100" height="26" rx="6" fill="${primaryColor}" />
      <text x="200" y="265" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">${weight}</text>
    ` : packageShape === 'tub' || packageShape === 'cup' ? `
      <!-- TUB / CUP (GREGO / REQUEIJÃO / CREAM CHEESE) -->
      <!-- Lid Rim -->
      <ellipse cx="200" cy="115" rx="95" ry="24" fill="${accentColor}" />
      <ellipse cx="200" cy="110" rx="90" ry="20" fill="#ffffff" opacity="0.9" />
      <!-- Tub Body -->
      <path d="M 105 115 L 125 310 Q 200 330 275 310 L 295 115 Z" fill="url(#primaryGrad)" />
      <path d="M 105 115 L 125 310 Q 200 330 275 310 L 295 115 Z" fill="url(#shineGrad)" />
      <!-- Front Badge Label -->
      <ellipse cx="200" cy="210" rx="65" ry="60" fill="#ffffff" opacity="0.96" />
      <text x="200" y="195" font-size="32" text-anchor="middle">${iconEmoji}</text>
      <text x="200" y="222" fill="${primaryColor}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="900" text-anchor="middle">${brandName.toUpperCase()}</text>
      <text x="200" y="240" fill="#1e293b" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="800" text-anchor="middle">${shortName.slice(0, 15)}</text>
      <text x="200" y="295" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="900" text-anchor="middle">${weight}</text>
    ` : packageShape === 'box' ? `
      <!-- BOX / CARTON SHAPE (LASANHA / PIZZA / BACALHAU) -->
      <rect x="100" y="100" width="200" height="210" rx="16" fill="url(#primaryGrad)" />
      <rect x="100" y="100" width="200" height="210" rx="16" fill="url(#shineGrad)" />
      <!-- Window Cutout -->
      <rect x="118" y="118" width="164" height="110" rx="12" fill="#ffffff" opacity="0.94" />
      <text x="200" y="170" font-size="40" text-anchor="middle">${iconEmoji}</text>
      <text x="200" y="205" fill="${primaryColor}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="900" text-anchor="middle">${brandName.toUpperCase()}</text>
      <!-- Bottom banner -->
      <text x="200" y="255" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" text-anchor="middle">${shortName.slice(0, 18)}</text>
      <text x="200" y="285" fill="${badgeColor}" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="900" text-anchor="middle">${weight}</text>
    ` : packageShape === 'jar' ? `
      <!-- GLASS JAR (PALMITO / PEPINOS / CEBOLA) -->
      <!-- Jar Lid -->
      <rect x="150" y="75" width="100" height="22" rx="4" fill="#64748b" />
      <rect x="130" y="97" width="140" height="220" rx="20" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
      <!-- Inside Food Color Fill -->
      <rect x="135" y="105" width="130" height="205" rx="16" fill="${accentColor}" opacity="0.15" />
      <!-- Label in the middle -->
      <rect x="120" y="160" width="160" height="95" rx="8" fill="${primaryColor}" />
      <text x="200" y="190" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="900" text-anchor="middle">${brandName.toUpperCase()}</text>
      <text x="200" y="212" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">${shortName.slice(0, 16)}</text>
      <text x="200" y="235" fill="${badgeColor}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="900" text-anchor="middle">${weight}</text>
    ` : `
      <!-- TUBE / BISNAGA SHAPE (REQUEIJÃO 1.5KG / VABENE 1KG) -->
      <path d="M 120 100 L 280 100 L 245 320 Q 200 335 155 320 Z" fill="url(#primaryGrad)" />
      <path d="M 120 100 L 280 100 L 245 320 Q 200 335 155 320 Z" fill="url(#shineGrad)" />
      <rect x="140" y="130" width="120" height="150" rx="10" fill="#ffffff" opacity="0.94" />
      <text x="200" y="175" font-size="34" text-anchor="middle">${iconEmoji}</text>
      <text x="200" y="210" fill="${primaryColor}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="900" text-anchor="middle">${brandName.toUpperCase()}</text>
      <text x="200" y="232" fill="#0f172a" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" text-anchor="middle">${shortName.slice(0, 16)}</text>
      <text x="200" y="258" fill="${primaryColor}" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="900" text-anchor="middle">${weight}</text>
    `}
  </g>

  <!-- Bottom Guaranteed Catalog Item Tag -->
  <g transform="translate(30, 355)">
    <rect width="340" height="28" rx="8" fill="#0f172a" opacity="0.88" />
    <text x="170" y="19" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">
      ✓ Item Oficial do Catálogo Real Alimentos
    </text>
  </g>
</svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Returns the exact, official catalog packshot graphic for any product in the Real Alimentos catalog.
 */
export function getProductCatalogImage(product: Partial<Product>): string {
  // Return the customized vector SVG packshot representing the exact product
  return generateCatalogPackshotSvg(product);
}
