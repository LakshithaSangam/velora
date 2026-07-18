// The Velora wordmark: bold name + a small rose bloom, with a cursive
// "L S" signature tucked underneath — same palette as the flower used on
// the study-notes-extension project (#d68989 family), so both portfolio
// pieces share a signature flourish.
export function VeloraLogo({ scale = 1, className = "" }: { scale?: number; className?: string }) {
  const textPx = 28 * scale;
  const flowerPx = 30 * scale;
  const signaturePx = 15 * scale;

  return (
    <div className={`inline-flex flex-col ${className}`} style={{ gap: 2 * scale }}>
      <div className="flex items-center" style={{ gap: 6 * scale }}>
        <span className="font-bold tracking-tight" style={{ fontSize: textPx }}>
          Velora
        </span>
        <svg viewBox="0 0 40 40" width={flowerPx} height={flowerPx} aria-hidden>
          <g transform="translate(20,20)">
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <ellipse
                key={angle}
                cx="0"
                cy="-11"
                rx="6.5"
                ry="10"
                fill={["#d68989", "#e8a7a7", "#b3615f", "#e8a7a7", "#d68989"][i]}
                transform={`rotate(${angle})`}
              />
            ))}
            <circle cx="0" cy="0" r="5" fill="#5c1f14" />
          </g>
        </svg>
      </div>
      <span
        className="self-end -mt-1"
        style={{
          marginRight: 6 * scale,
          fontFamily: "Segoe Script, Bradley Hand, Brush Script MT, cursive",
          fontSize: signaturePx,
          color: "#d68989",
          transform: "rotate(-4deg)",
        }}
      >
        L S
      </span>
    </div>
  );
}
