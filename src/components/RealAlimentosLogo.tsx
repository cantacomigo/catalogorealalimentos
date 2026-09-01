import React from 'react';

interface RealAlimentosLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'badge' | 'compact';
  theme?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

/**
 * Official Real Alimentos Logo Component
 * Matches the official branding: Royal Blue typography with the Red & Blue flame/ribbon symbol.
 */
export const RealAlimentosLogo: React.FC<RealAlimentosLogoProps> = ({
  className = '',
  variant = 'full',
  theme = 'light',
  size = 'md',
  showSubtitle = true
}) => {
  // Dimension and scale mappings
  const dimensions = {
    sm: { height: 32, iconSize: 26, textClass: 'text-sm sm:text-base', subText: 'text-[9px]' },
    md: { height: 42, iconSize: 34, textClass: 'text-lg sm:text-xl', subText: 'text-[11px]' },
    lg: { height: 54, iconSize: 44, textClass: 'text-2xl sm:text-3xl', subText: 'text-xs' },
    xl: { height: 72, iconSize: 58, textClass: 'text-3xl sm:text-4xl', subText: 'text-sm' }
  };

  const isDark = theme === 'dark';

  // Crisp SVG of the official Real Alimentos flame / ribbon symbol (Red top petal + Blue lower swoosh)
  const SymbolIcon = ({ sizePx = 36 }: { sizePx?: number }) => (
    <svg 
      viewBox="0 0 100 130" 
      style={{ width: sizePx, height: (sizePx * 1.3) }}
      className="shrink-0 drop-shadow-xs"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Red Petal */}
      <path 
        d="M32 38 C 30 18, 48 4, 64 2 C 78 1, 94 12, 94 28 C 94 42, 80 54, 60 56 C 54 44, 42 38, 32 38 Z" 
        fill="#E30613" 
      />
      {/* Bottom Blue Swoosh / Ribbon */}
      <path 
        d="M48 20 C 34 26, 20 46, 20 68 C 20 96, 42 118, 68 128 C 82 122, 92 108, 92 90 C 92 70, 78 54, 52 46 C 46 36, 46 26, 48 20 Z" 
        fill="#00529B" 
      />
      {/* Subtle blend overlay between red and blue parts */}
      <path 
        d="M48 20 C 44 28, 44 38, 54 46 C 62 46, 72 40, 78 32 C 70 24, 58 20, 48 20 Z" 
        fill="#003366" 
        opacity="0.35"
      />
    </svg>
  );

  // Full Vector Logo (Exact matching layout from company image)
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center p-1 rounded-xl bg-white shadow-sm border border-slate-200/80 ${className}`}>
        <SymbolIcon sizePx={dimensions[size].iconSize} />
      </div>
    );
  }

  // If in dark theme, wrap in a crisp, high-contrast white card or high-visibility pill so colors remain 100% faithful and prominent
  if (isDark) {
    return (
      <div className={`inline-flex items-center gap-3 bg-white px-3.5 py-2 rounded-2xl shadow-md border border-white/20 select-none group transition-transform hover:scale-[1.02] ${className}`}>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            {/* Real Alimentos wordmark in signature official royal blue */}
            <span className={`font-black tracking-tight text-[#00529B] font-sans ${dimensions[size].textClass} leading-none`}>
              Real Alimentos
            </span>
          </div>
          {showSubtitle && (
            <span className={`font-semibold tracking-wider uppercase text-slate-500 mt-1 ${dimensions[size].subText}`}>
              Distribuição & Food Service
            </span>
          )}
        </div>
        <SymbolIcon sizePx={dimensions[size].iconSize} />
      </div>
    );
  }

  // Light / Transparent header display with maximum visibility
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-xl">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-[#00529B] font-sans ${dimensions[size].textClass} leading-none drop-shadow-2xs`}>
              Real Alimentos
            </span>
            <span className="bg-red-50 text-red-700 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border border-red-200">
              Distribuição
            </span>
          </div>
          {showSubtitle && (
            <span className={`font-medium tracking-wide text-slate-500 mt-0.5 ${dimensions[size].subText}`}>
              Distribuindo sabor e qualidade
            </span>
          )}
        </div>
        <SymbolIcon sizePx={dimensions[size].iconSize} />
      </div>
    </div>
  );
};
