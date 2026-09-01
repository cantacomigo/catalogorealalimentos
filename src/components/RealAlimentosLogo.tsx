import React from 'react';

interface RealAlimentosLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'horizontal';
  theme?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const RealAlimentosLogo: React.FC<RealAlimentosLogoProps> = ({
  className = '',
  variant = 'full',
  theme = 'light',
  size = 'md'
}) => {
  // Dimension scales
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: { title: 'text-base', sub: 'text-[9px]', badge: 'text-[8px] px-1 py-0.2' },
    md: { title: 'text-xl', sub: 'text-[11px]', badge: 'text-[9px] px-1.5 py-0.5' },
    lg: { title: 'text-2xl', sub: 'text-xs', badge: 'text-[10px] px-2 py-0.5' },
    xl: { title: 'text-3xl', sub: 'text-sm', badge: 'text-xs px-2.5 py-1' }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* High-Definition Crisp Vector Emblem Icon */}
      <div 
        className={`${iconSizes[size]} shrink-0 rounded-xl overflow-hidden shadow-sm flex items-center justify-center relative transition-transform group-hover:scale-105`}
        style={{
          background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 60%, #7F1D1D 100%)',
          border: '1.5px solid #F59E0B'
        }}
      >
        {/* Subtle radial inner glow */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(circle at 50% 20%, #FDE047 0%, transparent 60%)'
          }}
        />

        {/* Vector SVG Crown + Monogram Logo */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full p-1 drop-shadow-md z-10"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Decorative Outer Ring */}
          <circle cx="50" cy="50" r="44" stroke="#FDE047" strokeWidth="2.5" strokeDasharray="3 2" opacity="0.8" />
          
          {/* Royal Crown on Top */}
          <path 
            d="M32 36L38 24L50 32L62 24L68 36H32Z" 
            fill="#FBBF24" 
            stroke="#D97706" 
            strokeWidth="1.5" 
          />
          <circle cx="38" cy="23" r="2.5" fill="#FEF08A" />
          <circle cx="50" cy="30" r="2.5" fill="#FEF08A" />
          <circle cx="62" cy="23" r="2.5" fill="#FEF08A" />
          
          {/* Center Ribbon / Plate */}
          <rect x="22" y="38" width="56" height="42" rx="6" fill="#7F1D1D" stroke="#F59E0B" strokeWidth="2" />
          
          {/* Crisp Bold Letter R */}
          <path 
            d="M40 45H52C56.4 45 59 47.2 59 50.8C59 53.6 57.2 55.4 54.5 56L61 68H54.5L48.8 57H45.5V68H40V45ZM45.5 52.8H51.5C53.2 52.8 54.2 52 54.2 50.8C54.2 49.6 53.2 48.8 51.5 48.8H45.5V52.8Z" 
            fill="#FFFFFF" 
          />

          {/* Underline Star/Diamond Flourish */}
          <path d="M50 72L52 74.5L50 77L48 74.5Z" fill="#FDE047" />
          <line x1="32" y1="74.5" x2="46" y2="74.5" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="54" y1="74.5" x2="68" y2="74.5" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Brand Typography & Tagline */}
      {variant !== 'icon' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span 
              className={`font-black font-serif tracking-tight leading-none ${textSizes[size].title} ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <span className="text-red-600 dark:text-red-500">Real</span>{' '}
              <span className={isDark ? 'text-white' : 'text-slate-900'}>Alimentos</span>
            </span>

            <span 
              className={`font-extrabold uppercase tracking-wider rounded-md font-sans shrink-0 shadow-2xs ${textSizes[size].badge} ${
                isDark 
                  ? 'bg-red-950 text-red-300 border border-red-800/80' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              Distribuição
            </span>
          </div>

          <span 
            className={`font-medium tracking-wide leading-tight mt-0.5 ${textSizes[size].sub} ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Alimentos Selecionados & Food Service
          </span>
        </div>
      )}
    </div>
  );
};
