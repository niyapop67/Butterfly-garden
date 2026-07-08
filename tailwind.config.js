/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        tiffany: "#81D8D0",
        "baby-pink": "#F8C8DC",
        "pearl-white": "#FFFDF8",
        "crystal-silver": "#D9D9D9",
        "aurora-lavender": "#C9B6FF",
        "emerald-garden": "#50C878",
        "golden-sunshine": "#FFD966",
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "serif"],
        "display-jp": ["var(--font-display-jp)", "Noto Sans JP", "sans-serif"],
        body: ["var(--font-body)", "Noto Sans JP", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "sans-serif"],
        "message-jp": ["var(--font-message-jp)", "Noto Sans JP", "sans-serif"],
        "letter-jp": ["var(--font-letter-jp)", "serif"],
      },
      borderRadius: {
        crystal: "24px",
      },
      boxShadow: {
        "glass-soft": "0 8px 32px 0 rgba(201, 182, 255, 0.15)",
        "glow-pink": "0 0 24px rgba(248, 200, 220, 0.6)",
        "glow-tiffany": "0 0 24px rgba(129, 216, 208, 0.5)",
      },
      backgroundImage: {
        "day-garden":
          "linear-gradient(135deg, #FFFDF8 0%, #F8C8DC 45%, #81D8D0 100%)",
      },
      keyframes: {
        "gentle-float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(3deg)" },
        },
        "wing-flutter": {
          "0%, 100%": { transform: "scaleX(1)" },
          "50%": { transform: "scaleX(0.85)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
      },
      animation: {
        "gentle-float": "gentle-float 6s ease-in-out infinite",
        "wing-flutter": "wing-flutter 1.8s ease-in-out infinite",
        sparkle: "sparkle 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
