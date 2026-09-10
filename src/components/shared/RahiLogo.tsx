import React from 'react';
import rahiLogoImg from '../../assets/images/rahi_hotel_rh_logo_1789045883124.jpg';

interface RahiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'emblem' | 'full' | 'image';
  showTagline?: boolean;
}

export const RahiLogo: React.FC<RahiLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'image',
  showTagline = true,
}) => {
  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  // If variant is image, render the high-res generated asset with styling
  if (variant === 'image') {
    return (
      <div
        className={`relative ${sizeMap[size]} rounded-full overflow-hidden border border-[#D4AF37]/80 bg-[#141413] shadow-md shrink-0 flex items-center justify-center ${className}`}
        title="Hotel Rahi - RH Monogram"
      >
        <img
          src={rahiLogoImg}
          alt="Hotel Rahi Logo - Capital RH"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to vector emblem if image loading fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Pure SVG vector emblem guaranteeing exact Capital RH monogram
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div
        className={`relative ${sizeMap[size]} rounded-full bg-gradient-to-b from-[#1E1E1C] to-[#121210] border-2 border-[#D4AF37] shadow-lg shrink-0 flex items-center justify-center p-1 overflow-hidden`}
      >
        {/* Subtle gold rim highlight */}
        <div className="absolute inset-0 rounded-full border border-[#F3E5AB]/30 pointer-events-none" />
        
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-[#D4AF37]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle */}
          <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />

          {/* Roof gable */}
          <path
            d="M 33 32 L 50 19 L 67 32"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 4-pane roof window */}
          <rect x="47" y="24" width="2.5" height="2.5" fill="currentColor" />
          <rect x="50.5" y="24" width="2.5" height="2.5" fill="currentColor" />
          <rect x="47" y="27.5" width="2.5" height="2.5" fill="currentColor" />
          <rect x="50.5" y="27.5" width="2.5" height="2.5" fill="currentColor" />

          {/* Leaf accent */}
          <path
            d="M 38 52 C 34 50 34 46 38 45 C 40 47 40 50 38 52 Z"
            fill="currentColor"
          />
          <path
            d="M 40 55 C 38 53 38 50 41 49 C 43 51 43 53 40 55 Z"
            fill="currentColor"
          />

          {/* CAPITAL 'R' */}
          {/* Vertical stem of R */}
          <path
            d="M 28 36 L 35 36 L 35 68 L 28 68"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="square"
            fill="currentColor"
          />
          {/* Upper bowl of R */}
          <path
            d="M 35 36 Q 52 36 52 48 Q 52 56 35 56"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Swash / leg of R connecting into crossbar of H */}
          <path
            d="M 40 56 Q 47 62 55 65 Q 63 67 72 52"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* CAPITAL 'H' */}
          {/* Right vertical stem of H */}
          <path
            d="M 66 36 L 73 36 L 73 68 L 66 68"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="square"
            fill="currentColor"
          />
          {/* Horizontal crossbar of H */}
          <path
            d="M 52 52 L 72 52"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {variant === 'full' && (
        <div>
          <div className="font-serif font-bold text-xl tracking-tight text-[#1C1C1A] leading-tight">
            RAHI HOTEL
          </div>
          {showTagline && (
            <div className="text-[9px] uppercase tracking-[0.22em] font-semibold text-[#8A8E71]">
              Stay • Dine • Experience
            </div>
          )}
        </div>
      )}
    </div>
  );
};
