import type { CatExpression, CatPose } from "./PersianCat";

// A koala mascot with large round fluffy ears, a big dark nose, and a
// cream muzzle patch against soft gray fur — deliberately slow-moving to
// match the real animal's sedentary reputation. Same brand collar as the
// rest of the family, no tail.
export function Koala({
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
          <rect x="-46" y="14" width="9" height="16" rx="4" fill="#b0a89e" stroke="#7d7469" strokeWidth="1.5" />
          <rect x="-28" y="16" width="9" height="22" rx="4" fill="#b0a89e" stroke="#7d7469" strokeWidth="1.5" />
          <rect x="4" y="14" width="9" height="16" rx="4" fill="#b0a89e" stroke="#7d7469" strokeWidth="1.5" />
          <rect x="18" y="16" width="9" height="22" rx="4" fill="#b0a89e" stroke="#7d7469" strokeWidth="1.5" />
          <ellipse cx="-4" cy="0" rx="46" ry="26" fill="#b0a89e" stroke="#7d7469" strokeWidth="2" />
          <circle cx="40" cy="-30" r="15" fill="#b0a89e" stroke="#7d7469" strokeWidth="1.5" />
          <circle cx="40" cy="-30" r="9" fill="#c9c2b8" />
          <circle cx="42" cy="-14" r="22" fill="#b0a89e" stroke="#7d7469" strokeWidth="2" />
          <ellipse cx="56" cy="-4" rx="12" ry="9" fill="#e8e0d0" />
          <ellipse cx="48" cy="-18" rx="3" ry="4" fill="#3a3530" />
          <ellipse cx="62" cy="-4" rx="7" ry="5" fill="#3a3530" />
        </g>
      </svg>
    );
  }

  if (pose === "sleeping") {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
        <g transform="translate(56,68)">
          <ellipse cx="8" cy="14" rx="48" ry="34" fill="#b0a89e" stroke="#7d7469" strokeWidth="2" />
          <circle cx="-40" cy="-24" r="14" fill="#b0a89e" stroke="#7d7469" strokeWidth="1.5" />
          <circle cx="-40" cy="-24" r="8" fill="#c9c2b8" />
          <circle cx="-30" cy="-8" r="23" fill="#b0a89e" stroke="#7d7469" strokeWidth="2" />
          <ellipse cx="-20" cy="2" rx="13" ry="10" fill="#e8e0d0" />
          <path d="M -42 -6 Q -36 -2 -30 -6" stroke="#3a3530" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="-16" cy="4" rx="6" ry="4.5" fill="#3a3530" />
        </g>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
      <ellipse cx="55" cy="86" rx="38" ry="28" fill="#b0a89e" stroke="#7d7469" strokeWidth="2" />

      <circle cx="24" cy="36" r="17" fill="#b0a89e" stroke="#7d7469" strokeWidth="2" />
      <circle cx="24" cy="36" r="10" fill="#c9c2b8" />
      <circle cx="86" cy="36" r="17" fill="#b0a89e" stroke="#7d7469" strokeWidth="2" />
      <circle cx="86" cy="36" r="10" fill="#c9c2b8" />

      <circle cx="55" cy="48" r="26" fill="#b0a89e" stroke="#7d7469" strokeWidth="2" />
      <ellipse cx="55" cy="66" rx="17" ry="11" fill="#e8e0d0" />

      {expression === "happy" && (
        <>
          <path d="M 38 44 Q 42 40 46 44" stroke="#3a3530" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 64 44 Q 68 40 72 44" stroke="#3a3530" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === "sleepy" && (
        <>
          <line x1="38" y1="45" x2="46" y2="45" stroke="#3a3530" strokeWidth="2" strokeLinecap="round" />
          <line x1="64" y1="45" x2="72" y2="45" stroke="#3a3530" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {expression === "curious" && (
        <>
          <ellipse cx="42" cy="44" rx="4.5" ry="6.5" fill="#3a3530" />
          <ellipse cx="68" cy="44" rx="4.5" ry="6.5" fill="#3a3530" />
          <circle cx="44" cy="41" r="1.2" fill="#e8e0d0" />
          <circle cx="70" cy="41" r="1.2" fill="#e8e0d0" />
        </>
      )}
      {expression === "startled" && (
        <>
          <ellipse cx="42" cy="44" rx="5.5" ry="8" fill="#3a3530" />
          <ellipse cx="68" cy="44" rx="5.5" ry="8" fill="#3a3530" />
          <circle cx="44" cy="40" r="1.4" fill="#e8e0d0" />
          <circle cx="70" cy="40" r="1.4" fill="#e8e0d0" />
        </>
      )}
      {expression === "normal" && (
        <>
          <ellipse cx="42" cy="45" rx="4" ry="5" fill="#3a3530" />
          <ellipse cx="68" cy="45" rx="4" ry="5" fill="#3a3530" />
        </>
      )}

      <ellipse cx="55" cy="60" rx="10" ry="7" fill="#3a3530" />

      <path d="M 33 70 Q 55 80 77 70" stroke="#d68989" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="55" cy="82" r="10" fill="#d68989" stroke="#b3615f" strokeWidth="1.5" />
      <text
        x="52"
        y="86"
        textAnchor="middle"
        fontFamily="Segoe Script, Bradley Hand, Brush Script MT, cursive"
        fontSize="9"
        fill="#f5f0e8"
      >
        Ls
      </text>
      <circle cx="61" cy="78" r="1.4" fill="#f5f0e8" />
      <circle cx="63" cy="81" r="1.2" fill="#f5f0e8" />
      <circle cx="61" cy="84" r="1.2" fill="#f5f0e8" />
      <circle cx="58" cy="81" r="1.2" fill="#f5f0e8" />
      <circle cx="61" cy="81" r="0.8" fill="#5c1f14" />
    </svg>
  );
}
