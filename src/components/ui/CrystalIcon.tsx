interface CrystalIconProps {
  size?: number;
  className?: string;
}

export default function CrystalIcon({ size = 20, className = "" }: CrystalIconProps) {
  return (
    <svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 64 56"
      className={className}
      style={{ filter: "drop-shadow(0 1px 3px rgba(255,111,168,0.45))" }}
    >
      <defs>
        <linearGradient id="wingGradL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd9e8" />
          <stop offset="55%" stopColor="#ff9ec7" />
          <stop offset="100%" stopColor="#c9a8e0" />
        </linearGradient>
        <linearGradient id="wingGradR" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cdf2ec" />
          <stop offset="55%" stopColor="#81d8d0" />
          <stop offset="100%" stopColor="#ff9ec7" />
        </linearGradient>
      </defs>
      <path d="M32 28 C24 6 2 2 1 13 C0 24 14 33 32 28 Z" fill="url(#wingGradL)" />
      <path d="M32 28 C40 6 62 2 63 13 C64 24 50 33 32 28 Z" fill="url(#wingGradR)" />
      <path d="M32 29 C26 41 10 47 9 40 C8 33 18 29 32 29 Z" fill="url(#wingGradL)" opacity="0.85" />
      <path d="M32 29 C38 41 54 47 55 40 C56 33 46 29 32 29 Z" fill="url(#wingGradR)" opacity="0.85" />
      <path d="M22 12 L26 18 M42 12 L38 18 M16 30 L22 32 M48 30 L42 32" stroke="#fff" strokeWidth="0.8" opacity="0.55" strokeLinecap="round" />
      <rect x="30.5" y="13" width="3" height="29" rx="1.5" fill="#5a4f6e" />
      <circle cx="32" cy="12" r="2.4" fill="#5a4f6e" />
    </svg>
  );
}
