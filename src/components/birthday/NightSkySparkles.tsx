interface Star {
  id: number;
  top: string;
  left: string;
  size: number;
  delay: number;
}

const STARS: Star[] = Array.from({ length: 28 }).map((_, i) => ({
  id: i,
  top: `${(i * 17) % 92}%`,
  left: `${(i * 37) % 96}%`,
  size: 2 + (i % 4),
  delay: (i % 10) * 0.3,
}));

/**
 * Lightweight star field for the Birthday page's "Night Garden" background
 * (.bg-night-garden, globals.css). Plain CSS animation (animate-sparkle,
 * defined in tailwind.config.js) rather than framer-motion — this sits
 * behind a lot of other content so it stays cheap.
 */
export default function NightSkySparkles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {STARS.map((s) => (
        <span
          key={s.id}
          className="animate-sparkle absolute rounded-full bg-white"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
