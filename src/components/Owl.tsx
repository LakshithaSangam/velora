import type { CatExpression, CatPose } from "./PersianCat";

// An owl mascot — no ears at all (unlike every other mascot in the
// family), a small hooked beak instead of a nose/mouth, and big
// concentric eyes as the dominant feature. Warm brown-and-cream feather
// coloring, no tail. Fits the "study partner" theme.
export function Owl({
  size = 140,
  pose = "sitting",
  expression = "normal",
  className = "",
}: {
  size?: number;
  pose?: CatPose;
  expression?: CatExpression;
  className?: string;
}) {
  if (pose === "walking") {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
        <g transform="translate(62,66) scale(0.85)">
          <rect x="-42" y="14" width="9" height="14" rx="4" fill="#b0805a" stroke="#7a5638" strokeWidth="1.5" />
          <rect x="14" y="14" width="9" height="14" rx="4" fill="#b0805a" stroke="#7a5638" strokeWidth="1.5" />
          <ellipse cx="-4" cy="0" rx="46" ry="26" fill="#b0805a" stroke="#7a5638" strokeWidth="2" />
          <ellipse cx="-8" cy="10" rx="26" ry="14" fill="#f0e4d0" />
          <circle cx="42" cy="-14" r="23" fill="#b0805a" stroke="#7a5638" strokeWidth="2" />
          <circle cx="46" cy="-16" r="11" fill="#f0e4d0" stroke="#7a5638" strokeWidth="1.5" />
          <circle cx="47" cy="-16" r="5" fill="#3a3530" />
          <circle cx="49" cy="-19" r="1.3" fill="#f0e4d0" />
          <polygon points="60,-10 68,-6 60,-2" fill="#e0a860" stroke="#7a5638" strokeWidth="1" />
        </g>
      </svg>
    );
  }

  if (pose === "sleeping") {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
        <g transform="translate(56,68)">
          <ellipse cx="8" cy="14" rx="48" ry="34" fill="#b0805a" stroke="#7a5638" strokeWidth="2" />
          <ellipse cx="4" cy="24" rx="24" ry="15" fill="#f0e4d0" />
          <circle cx="-28" cy="-8" r="24" fill="#b0805a" stroke="#7a5638" strokeWidth="2" />
          <path d="M -40 -8 Q -34 -4 -28 -8" stroke="#3a3530" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <polygon points="-16,-4 -8,0 -16,4" fill="#e0a860" stroke="#7a5638" strokeWidth="1" />
        </g>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
      <ellipse cx="55" cy="80" rx="38" ry="34" fill="#b0805a" stroke="#7a5638" strokeWidth="2" />
      <ellipse cx="55" cy="90" rx="20" ry="16" fill="#f0e4d0" />

      <polygon points="34,22 30,2 42,18" fill="#b0805a" stroke="#7a5638" strokeWidth="2" />
      <polygon points="76,22 80,2 68,18" fill="#b0805a" stroke="#7a5638" strokeWidth="2" />
      <circle cx="55" cy="46" r="30" fill="#b0805a" stroke="#7a5638" strokeWidth="2" />
      <circle cx="41" cy="44" r="13" fill="#f0e4d0" stroke="#7a5638" strokeWidth="1.5" />
      <circle cx="69" cy="44" r="13" fill="#f0e4d0" stroke="#7a5638" strokeWidth="1.5" />

      {expression === "happy" && (
        <>
          <path d="M 30 43 Q 41 35 52 43" stroke="#3a3530" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 58 43 Q 69 35 80 43" stroke="#3a3530" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === "sleepy" && (
        <>
          <line x1="31" y1="44" x2="51" y2="44" stroke="#3a3530" strokeWidth="3" strokeLinecap="round" />
          <line x1="59" y1="44" x2="79" y2="44" stroke="#3a3530" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {expression === "curious" && (
        <>
          <circle cx="41" cy="44" r="7" fill="#3a3530" />
          <circle cx="69" cy="44" r="7" fill="#3a3530" />
          <circle cx="43" cy="41" r="1.6" fill="#f0e4d0" />
          <circle cx="71" cy="41" r="1.6" fill="#f0e4d0" />
        </>
      )}
      {expression === "startled" && (
        <>
          <circle cx="41" cy="44" r="9" fill="#3a3530" />
          <circle cx="69" cy="44" r="9" fill="#3a3530" />
          <circle cx="43" cy="41" r="1.8" fill="#f0e4d0" />
          <circle cx="71" cy="41" r="1.8" fill="#f0e4d0" />
        </>
      )}
      {expression === "normal" && (
        <>
          <circle cx="41" cy="44" r="6" fill="#3a3530" />
          <circle cx="69" cy="44" r="6" fill="#3a3530" />
          <circle cx="43" cy="42" r="1.6" fill="#f0e4d0" />
          <circle cx="71" cy="42" r="1.6" fill="#f0e4d0" />
        </>
      )}

      <polygon points="55,54 50,62 60,62" fill="#e0a860" stroke="#7a5638" strokeWidth="1" />

      <path d="M 33 66 Q 55 76 77 66" stroke="#d68989" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="55" cy="78" r="10" fill="#d68989" stroke="#b3615f" strokeWidth="1.5" />
      <text
        x="52"
        y="82"
        textAnchor="middle"
        fontFamily="Segoe Script, Bradley Hand, Brush Script MT, cursive"
        fontSize="9"
        fill="#f5f0e8"
      >
        Ls
      </text>
      <circle cx="61" cy="74" r="1.4" fill="#f5f0e8" />
      <circle cx="63" cy="77" r="1.2" fill="#f5f0e8" />
      <circle cx="61" cy="80" r="1.2" fill="#f5f0e8" />
      <circle cx="58" cy="77" r="1.2" fill="#f5f0e8" />
      <circle cx="61" cy="77" r="0.8" fill="#5c1f14" />
    </svg>
  );
}
