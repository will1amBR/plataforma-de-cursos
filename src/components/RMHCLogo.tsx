import React from 'react'

interface RMHCLogoProps {
  className?: string
  variant?: 'full' | 'icon' | 'white' | 'horizontal'
  subtitle?: string
}

export const RMHCLogo: React.FC<RMHCLogoProps> = ({
  className = '',
  variant = 'full',
  subtitle = 'Plataforma de Capacitação EAD',
}) => {
  if (variant === 'icon') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* House Outline */}
          <path
            d="M50 14 L86 42 V86 H14 V42 Z"
            stroke="#DA291C"
            strokeWidth="5"
            strokeLinejoin="round"
            fill="#FFFFFF"
          />
          {/* Heart at the top/chimney */}
          <path
            d="M50 28 C46 20 38 20 34 25 C30 30 33 37 50 49 C67 37 70 30 66 25 C62 20 54 20 50 28 Z"
            fill="#DA291C"
          />
          {/* Welcoming Hands (yellow & red stripes) */}
          <path
            d="M32 64 C36 58 44 58 50 63 C56 68 64 68 68 62"
            stroke="#FFC72C"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M36 74 C40 70 46 70 50 73 C54 76 60 76 64 72"
            stroke="#005A9E"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Emblem */}
      <div className="w-10 h-10 shrink-0 relative flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 14 L86 42 V86 H14 V42 Z"
            stroke="#DA291C"
            strokeWidth="5"
            strokeLinejoin="round"
            fill="#FFFFFF"
          />
          {/* Heart */}
          <path
            d="M50 28 C46 20 38 20 34 25 C30 30 33 37 50 49 C67 37 70 30 66 25 C62 20 54 20 50 28 Z"
            fill="#DA291C"
          />
          {/* Hands */}
          <path
            d="M32 64 C36 58 44 58 50 63 C56 68 64 68 68 62"
            stroke="#FFC72C"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M36 74 C40 70 46 70 50 73 C54 76 60 76 64 72"
            stroke="#005A9E"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black text-lg tracking-tight font-raleway ${
              variant === 'white' ? 'text-white' : 'text-[#DA291C]'
            }`}
          >
            RMHC
          </span>
          <span
            className={`text-xs font-bold font-raleway tracking-tight ${
              variant === 'white' ? 'text-white/90' : 'text-[#005A9E] dark:text-blue-400'
            }`}
          >
            Brasil
          </span>
        </div>
        <span
          className={`text-[10px] font-semibold tracking-wider font-raleway truncate ${
            variant === 'white' ? 'text-neutral-200' : 'text-neutral-600 dark:text-neutral-300'
          }`}
        >
          {subtitle}
        </span>
      </div>
    </div>
  )
}
