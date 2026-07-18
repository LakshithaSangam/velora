import type { CatExpression, CatPose } from "./PersianCat";

// A hamster mascot matching the cat/puppy's body scale and shared brand
// collar, but rounder and stouter, with chubby cheeks, small round ears,
// tiny paws resting by the collar tag, no tail, and caramel-and-cream fur.
export function Hamster({
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
          <rect x="-40" y="10" width="8" height="14" rx="4" fill="#d9a066" stroke="#96703f" strokeWidth="1.5" />
          <rect x="-24" y="12" width="8" height="18" rx="4" fill="#d9a066" stroke="#96703f" strokeWidth="1.5" />
          <rect x="6" y="10" width="8" height="14" rx="4" fill="#d9a066" stroke="#96703f" strokeWidth="1.5" />
          <rect x="18" y="12" width="8" height="18" rx="4" fill="#d9a066" stroke="#96703f" strokeWidth="1.5" />
          <ellipse cx="-4" cy="0" rx="46" ry="26" fill="#d9a066" stroke="#96703f" strokeWidth="2" />
          <ellipse cx="0" cy="12" rx="30" ry="14" fill="#f5ead9" />
          <circle cx="40" cy="-28" r="8" fill="#d9a066" stroke="#96703f" strokeWidth="1.5" />
          <circle cx="40" cy="-27" r="4.5" fill="#f5ead9" />
          <circle cx="42" cy="-14" r="20" fill="#d9a066" stroke="#96703f" strokeWidth="2" />
          <ellipse cx="56" cy="-6" rx="8" ry="7" fill="#f5ead9" stroke="#96703f" strokeWidth="1.5" />
          <ellipse cx="48" cy="-16" rx="3" ry="4" fill="#3a3530" />
          <polygon points="58,-8 62,-6 58,-4" fill="#e8a7a7" />
        </g>
      </svg>
    );
  }

  if (pose === "sleeping") {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
        <g transform="translate(56,66)">
          <ellipse cx="5" cy="10" rx="44" ry="36" fill="#d9a066" stroke="#96703f" strokeWidth="2" />
          <ellipse cx="15" cy="20" rx="20" ry="14" fill="#f5ead9" />
          <circle cx="-28" cy="-6" r="20" fill="#d9a066" stroke="#96703f" strokeWidth="2" />
          <ellipse cx="-38" cy="2" rx="8" ry="6" fill="#f5ead9" stroke="#96703f" strokeWidth="1" />
          <circle cx="-38" cy="-22" r="7" fill="#d9a066" stroke="#96703f" strokeWidth="1.5" />
          <circle cx="-38" cy="-21" r="4" fill="#f5ead9" />
          <path d="M -36 -4 Q -30 0 -24 -4" stroke="#3a3530" strokeWidth="2" fill="none" strokeLinecap="round" />
          <polygon points="-44,-2 -48,0 -44,2" fill="#e8a7a7" />
        </g>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
      <ellipse cx="55" cy="84" rx="38" ry="30" fill="#d9a066" stroke="#96703f" strokeWidth="2" />
      <ellipse cx="55" cy="90" rx="18" ry="13" fill="#f5ead9" />

      <circle cx="35" cy="24" r="9" fill="#d9a066" stroke="#96703f" strokeWidth="2" />
      <circle cx="35" cy="25" r="5" fill="#f5ead9" />
      <circle cx="75" cy="24" r="9" fill="#d9a066" stroke="#96703f" strokeWidth="2" />
      <circle cx="75" cy="25" r="5" fill="#f5ead9" />

      <circle cx="55" cy="46" r="27" fill="#d9a066" stroke="#96703f" strokeWidth="2" />
      <ellipse cx="29" cy="53" rx="11" ry="9" fill="#f5ead9" stroke="#96703f" strokeWidth="1.5" />
      <ellipse cx="81" cy="53" rx="11" ry="9" fill="#f5ead9" stroke="#96703f" strokeWidth="1.5" />

      {expression === "happy" && (
        <>
          <path d="M 39 44 Q 43 40 47 44" stroke="#3a3530" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 63 44 Q 67 40 71 44" stroke="#3a3530" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === "sleepy" && (
        <>
          <line x1="39" y1="46" x2="47" y2="46" stroke="#3a3530" strokeWidth="2" strokeLinecap="round" />
          <line x1="63" y1="46" x2="71" y2="46" stroke="#3a3530" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {expression === "curious" && (
        <>
          <ellipse cx="43" cy="45" rx="5.5" ry="7.5" fill="#3a3530" />
          <ellipse cx="67" cy="45" rx="5.5" ry="7.5" fill="#3a3530" />
          <circle cx="45" cy="42" r="1.3" fill="#f5ead9" />
          <circle cx="69" cy="42" r="1.3" fill="#f5ead9" />
        </>
      )}
      {expression === "startled" && (
        <>
          <ellipse cx="43" cy="45" rx="6.5" ry="9" fill="#3a3530" />
          <ellipse cx="67" cy="45" rx="6.5" ry="9" fill="#3a3530" />
          <circle cx="45" cy="41" r="1.5" fill="#f5ead9" />
          <circle cx="69" cy="41" r="1.5" fill="#f5ead9" />
        </>
      )}
      {expression === "normal" && (
        <>
          <ellipse cx="43" cy="46" rx="4" ry="6" fill="#3a3530" />
          <ellipse cx="67" cy="46" rx="4" ry="6" fill="#3a3530" />
        </>
      )}

      <polygon points="55,55 51,60 59,60" fill="#e8a7a7" />
      <path d="M 49 62 Q 52 66 55 62 Q 58 66 61 62" stroke="#3a3530" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* Same pink Velora collar + tag as the cat and puppy. */}
      <path d="M 33 68 Q 55 78 77 68" stroke="#d68989" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="55" cy="80" r="10" fill="#d68989" stroke="#b3615f" strokeWidth="1.5" />
      <text
        x="52"
        y="84"
        textAnchor="middle"
        fontFamily="Segoe Script, Bradley Hand, Brush Script MT, cursive"
        fontSize="9"
        fill="#f5f0e8"
      >
        Ls
      </text>
      <circle cx="61" cy="76" r="1.4" fill="#f5f0e8" />
      <circle cx="63" cy="79" r="1.2" fill="#f5f0e8" />
      <circle cx="61" cy="82" r="1.2" fill="#f5f0e8" />
      <circle cx="58" cy="79" r="1.2" fill="#f5f0e8" />
      <circle cx="61" cy="79" r="0.8" fill="#5c1f14" />

      {/* Tiny paws, resting in front of (drawn after) the collar tag. */}
      <ellipse cx="38" cy="78" rx="6" ry="8" fill="#d9a066" stroke="#96703f" strokeWidth="1.5" />
      <ellipse cx="38" cy="83" rx="4" ry="3" fill="#f5ead9" />
      <ellipse cx="72" cy="78" rx="6" ry="8" fill="#d9a066" stroke="#96703f" strokeWidth="1.5" />
      <ellipse cx="72" cy="83" rx="4" ry="3" fill="#f5ead9" />
    </svg>
  );
}
