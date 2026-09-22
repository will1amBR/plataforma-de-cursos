import React from 'react'

export interface RMHCLogoProps {
  /**
   * Layout orientation:
   * - 'horizontal': iconic house on the left, typography on the right
   * - 'vertical': iconic house on top, typography centered below
   * - 'mark-only': only the official iconic house mark
   */
  variant?: 'horizontal' | 'vertical' | 'mark-only'
  /**
   * Color theme:
   * - 'standard': Red house (#DA291C) + Gold heart (#FFC72C) + dark text (for light backgrounds)
   * - 'white': Red house (#DA291C) + Gold heart (#FFC72C) + pure white text (for dark/red backgrounds)
   * - 'monochrome-white': All white vectors (house, heart, typography) for solid contrast
   */
  theme?: 'standard' | 'white' | 'monochrome-white'
  /**
   * Additional css classes for wrapper container
   */
  className?: string
  /**
   * Size multiplier or explicit height style
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /**
   * Subtitle text below the primary branding (e.g. 'Educação a Distância' or 'Brasil')
   */
  subtext?: string
}

/**
 * Official RMHC Iconic House Mark
 * Features:
 * - Precise architectural gable roof and chimney on the right
 * - Slanted roofline matching RMHC brand geometry
 * - Heart child motif in RMHC Yellow (#FFC72C) sheltered inside the roofline
 * - Protective hand sheltering motif
 * Official brand colors: Red (#DA291C), Yellow/Gold (#FFC72C)
 */
export const RMHCIconMark: React.FC<{
  className?: string
  isMonochromeWhite?: boolean
  sizePx?: number
}> = ({ className = 'w-10 h-10', isMonochromeWhite = false, sizePx }) => {
  const redColor = isMonochromeWhite ? '#FFFFFF' : '#DA291C'
  const yellowColor = isMonochromeWhite ? '#FFFFFF' : '#FFC72C'

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={sizePx ? { width: sizePx, height: sizePx } : undefined}
      aria-label="Símbolo Oficial Ronald McDonald House Charities"
    >
      {/* House Silhouette & Chimney in Official Red */}
      {/* Chimney on top right */}
      <rect x="68" y="16" width="10" height="20" rx="1.5" fill={redColor} />

      {/* Main House Base and Gable Roof */}
      <path
        d="M 50 12 L 14 44 L 20 44 L 20 86 C 20 87.5 21 88.5 22.5 88.5 L 77.5 88.5 C 79 88.5 80 87.5 80 86 L 80 44 L 86 44 Z"
        fill={redColor}
      />

      {/* Roof eave highlight / clean geometry line */}
      <path d="M 50 8.5 L 10 44 L 17 44 L 50 15 L 83 44 L 90 44 Z" fill={redColor} />

      {/* Inner Heart in Official RMHC Yellow/Gold (#FFC72C) sheltered under the roof */}
      <path
        d="M 50 36 
           C 47.5 30, 39 29, 36 34.5 
           C 32.5 40.5, 36 47.5, 50 59 
           C 64 47.5, 67.5 40.5, 64 34.5 
           C 61 29, 52.5 30, 50 36 Z"
        fill={yellowColor}
      />

      {/* Protective caring child-and-parent sheltering hands silhouette in white */}
      {/* Left caring hand */}
      <path
        d="M 33 66 
           C 33 66, 37 60, 43 62 
           C 47 63.5, 49 67, 46 72 
           C 43.5 75.5, 37 77, 34 76 
           C 32 75.3, 31 72, 33 66 Z"
        fill="#FFFFFF"
        opacity="0.96"
      />
      {/* Right welcoming hand embracing */}
      <path
        d="M 67 66 
           C 67 66, 63 60, 57 62 
           C 53 63.5, 51 67, 54 72 
           C 56.5 75.5, 63 77, 66 76 
           C 68 75.3, 69 72, 67 66 Z"
        fill="#FFFFFF"
        opacity="0.96"
      />

      {/* Central heart-spark dot connecting hands & family care */}
      <circle cx="50" cy="70" r="3.2" fill={yellowColor} />
    </svg>
  )
}

export const RMHCLogo: React.FC<RMHCLogoProps> = ({
  variant = 'horizontal',
  theme = 'standard',
  className = '',
  size = 'md',
  subtext = 'Educação a Distância',
}) => {
  const isWhite = theme === 'white'
  const isMonochrome = theme === 'monochrome-white'

  // Dimensions
  const sizeMap = {
    sm: { icon: 'w-7 h-7', textTitle: 'text-xs', textSub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', textTitle: 'text-sm', textSub: 'text-[10px]' },
    lg: { icon: 'w-12 h-12', textTitle: 'text-base', textSub: 'text-xs' },
    xl: { icon: 'w-16 h-16', textTitle: 'text-xl', textSub: 'text-sm' },
  }

  const { icon, textTitle, textSub } = sizeMap[size]

  if (variant === 'mark-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <RMHCIconMark className={icon} isMonochromeWhite={isMonochrome} />
      </div>
    )
  }

  if (variant === 'vertical') {
    return (
      <div className={`inline-flex flex-col items-center text-center gap-2 ${className}`}>
        <RMHCIconMark className={icon} isMonochromeWhite={isMonochrome} />
        <div className="flex flex-col items-center">
          <span
            className={`font-black tracking-tight leading-tight uppercase font-raleway ${textTitle} ${
              isWhite || isMonochrome ? 'text-white' : 'text-neutral-900 dark:text-white'
            }`}
          >
            Instituto Ronald McDonald
          </span>
          <span
            className={`font-semibold tracking-wide uppercase ${textSub} ${
              isWhite || isMonochrome ? 'text-red-100' : 'text-[#DA291C] dark:text-[#ff6b5e]'
            }`}
          >
            {subtext}
          </span>
        </div>
      </div>
    )
  }

  // Horizontal (Default for Header & Navbar)
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <RMHCIconMark className={`${icon} shrink-0`} isMonochromeWhite={isMonochrome} />
      <div className="flex flex-col text-left leading-tight">
        <span
          className={`font-extrabold tracking-tight uppercase font-raleway text-xs sm:text-sm ${
            isWhite || isMonochrome ? 'text-white' : 'text-neutral-900 dark:text-white'
          }`}
        >
          Instituto Ronald McDonald
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={`font-bold tracking-wider text-[9px] sm:text-[10px] uppercase ${
              isWhite || isMonochrome ? 'text-[#FFC72C]' : 'text-[#DA291C] dark:text-[#ff786c]'
            }`}
          >
            {subtext}
          </span>
          <span
            className={`text-[8px] font-medium hidden sm:inline px-1 py-0.2 rounded ${
              isWhite || isMonochrome ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            RMHC Brasil
          </span>
        </div>
      </div>
    </div>
  )
}

export default RMHCLogo
