"use client";

/**
 * Last-resort error boundary — catches errors in the root layout itself
 * (very rare; e.g. a crash before GlassCard/CrystalButton even render).
 * Per Next.js convention this must render its own <html>/<body> and stays
 * intentionally dependency-free so it has the best chance of rendering
 * even when something fundamental is broken.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #fffdf8, #ffe9f2)",
          fontFamily: "sans-serif",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ fontSize: 28, marginBottom: 8 }}>🦋</p>
          <p style={{ color: "#5a4f6e", marginBottom: 16 }}>
            少しだけ、つまずいてしまいました。もう一度お試しください。
          </p>
          <button
            onClick={reset}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "10px 24px",
              background: "#ff9ec7",
              color: "#fff",
              fontSize: 14,
            }}
          >
            もう一度試す
          </button>
        </div>
      </body>
    </html>
  );
}
