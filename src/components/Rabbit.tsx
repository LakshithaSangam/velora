import type { CatExpression, CatPose } from "./PersianCat";

// A rabbit mascot with a cool gray-lavender coat (deliberately different
// from the cat's warm cream, so they don't read as reskins of each other),
// long upright ears, a cream belly patch, small feet, and a cotton tail —
// same brand collar and body scale as the rest of the family.
export function Rabbit({
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
          <circle cx="-52" cy="8" r="9" fill="#f0eef2" stroke="#8f8b96" strokeWidth="1.5" />
          <rect x="-46" y="14" width="9" height="18" rx="4" fill="#c4c0cc" stroke="#8f8b96" strokeWidth="1.5" />
          <rect x="-28" y="16" width="9" height="26" rx="4" fill="#c4c0cc" stroke="#8f8b96" strokeWidth="1.5" />
          <rect x="4" y="14" width="9" height="18" rx="4" fill="#c4c0cc" stroke="#8f8b96" strokeWidth="1.5" />
          <rect x="18" y="16" width="9" height="26" rx="4" fill="#c4c0cc" stroke="#8f8b96" strokeWidth="1.5" />
          <path
            d="M -50 8 C -56 -12 -34 -26 -5 -24 C 18 -22 34 -14 40 2 C 44 12 40 20 28 22 C 5 26 -28 25 -46 18 C -52 15 -53 11 -50 8 Z"
            fill="#c4c0cc"
            stroke="#8f8b96"
            strokeWidth="2"
          />
          <ellipse cx="0" cy="14" rx="26" ry="12" fill="#f0eef2" />
          <ellipse cx="46" cy="-32" rx="6" ry="20" fill="#c4c0cc" stroke="#8f8b96" strokeWidth="1.5" transform="rotate(-25 46 -32)" />
          <ellipse cx="46" cy="-32" rx="3" ry="13" fill="#e8a7a7" transform="rotate(-25 46 -32)" />
          <circle cx="42" cy="-14" r="20" fill="#c4c0cc" stroke="#8f8b96" strokeWidth="2" />
          <ellipse cx="48" cy="-16" rx="3" ry="4" fill="#3a3530" />
          <polygon points="58,-8 62,-6 58,-4" fill="#e8a7a7" />
          <path d="M 58 -2 Q 62 2 66 -2" stroke="#3a3530" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (pose === "sleeping") {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
        <g transform="translate(56,68)">
          <circle cx="46" cy="26" r="9" fill="#f0eef2" stroke="#8f8b96" strokeWidth="1.5" />
          <ellipse cx="8" cy="14" rx="48" ry="34" fill="#c4c0cc" stroke="#8f8b96" strokeWidth="2" />
          <ellipse cx="15" cy="24" rx="22" ry="14" fill="#f0eef2" />
          <path
            d="M -34,-30 C -46,-24 -48,-6 -38,8 C -34,12 -28,8 -30,0 C -32,-10 -32,-20 -24,-32 Z"
            fill="#c4c0cc"
            stroke="#8f8b96"
            strokeWidth="1.5"
          />
          <ellipse cx="-36" cy="-14" rx="3" ry="10" fill="#e8a7a7" transform="rotate(5 -36 -14)" />
          <circle cx="-30" cy="-8" r="23" fill="#c4c0cc" stroke="#8f8b96" strokeWidth="2" />
          <path d="M -42 -6 Q -36 -2 -30 -6" stroke="#3a3530" strokeWidth="2" fill="none" strokeLinecap="round" />
          <polygon points="-46,-2 -52,0 -46,2" fill="#e8a7a7" />
          <path d="M -50 4 Q -46 8 -42 4" stroke="#3a3530" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
      <ellipse cx="50" cy="60" rx="10" ry="6" fill="#c4c0cc" stroke="#8f8b96" strokeWidth="1.5" />
      <ellipse cx="60" cy="60" rx="10" ry="6" fill="#c4c0cc" stroke="#8f8b96" strokeWidth="1.5" />
      <circle cx="92" cy="86" r="9" fill="#f0eef2" stroke="#8f8b96" strokeWidth="1.5" />
      <ellipse cx="55" cy="82" rx="34" ry="30" fill="#c4c0cc" stroke="#8f8b96" strokeWidth="2" />
      <ellipse cx="55" cy="94" rx="18" ry="14" fill="#f0eef2" />

      <ellipse cx="41" cy="17" rx="7" ry="14" fill="#c4c0cc" stroke="#8f8b96" strokeWidth="2" transform="rotate(-8 41 17)" />
      <ellipse cx="41" cy="17" rx="3.5" ry="9.5" fill="#e8a7a7" transform="rotate(-8 41 17)" />
      <ellipse cx="69" cy="17" rx="7" ry="14" fill="#c4c0cc" stroke="#8f8b96" strokeWidth="2" transform="rotate(8 69 17)" />
      <ellipse cx="69" cy="17" rx="3.5" ry="9.5" fill="#e8a7a7" transform="rotate(8 69 17)" />

      <circle cx="55" cy="42" r="24" fill="#c4c0cc" stroke="#8f8b96" strokeWidth="2" />

      {expression === "happy" && (
        <>
          <path d="M 38 41 Q 42 37 46 41" stroke="#3a3530" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 62 41 Q 66 37 70 41" stroke="#3a3530" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === "sleepy" && (
        <>
          <line x1="38" y1="42" x2="46" y2="42" stroke="#3a3530" strokeWidth="2" strokeLinecap="round" />
          <line x1="62" y1="42" x2="70" y2="42" stroke="#3a3530" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {expression === "curious" && (
        <>
          <ellipse cx="44" cy="41" rx="5" ry="7" fill="#3a3530" />
          <ellipse cx="66" cy="41" rx="5" ry="7" fill="#3a3530" />
          <circle cx="46" cy="38" r="1.2" fill="#f0eef2" />
          <circle cx="68" cy="38" r="1.2" fill="#f0eef2" />
        </>
      )}
      {expression === "startled" && (
        <>
          <ellipse cx="44" cy="41" rx="6" ry="8.5" fill="#3a3530" />
          <ellipse cx="66" cy="41" rx="6" ry="8.5" fill="#3a3530" />
          <circle cx="46" cy="37" r="1.4" fill="#f0eef2" />
          <circle cx="68" cy="37" r="1.4" fill="#f0eef2" />
        </>
      )}
      {expression === "normal" && (
        <>
          <ellipse cx="44" cy="42" rx="3.5" ry="5.5" fill="#3a3530" />
          <ellipse cx="66" cy="42" rx="3.5" ry="5.5" fill="#3a3530" />
        </>
      )}

      <polygon points="55,50 51,55 59,55" fill="#e8a7a7" />
      <path
        d="M 55 55 L 55 58 M 49 58 Q 52 62 55 58 Q 58 62 61 58"
        stroke="#3a3530"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />

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
