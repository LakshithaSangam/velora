export type CatExpression = "normal" | "happy" | "curious" | "sleepy" | "startled";
export type CatPose = "sitting" | "walking" | "sleeping";

// A sitting Persian-white cat with rose-pink ears/nose, a pink collar with
// an LS + flower tag (matching the Velora signature), plus two extra poses
// (a walking side-profile and a curled-up sleeping shape, both collar-free —
// the collar didn't read well at that scale/angle) and a few facial
// expressions used to reflect the mascot's current mood.
export function PersianCat({
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
          <path d="M -48 4 Q -68 -10 -60 -32 Q -55 -44 -42 -40" stroke="#f5f0e8" strokeWidth="14" strokeLinecap="round" fill="none" />
          <rect x="-46" y="14" width="9" height="18" rx="4" fill="#f5f0e8" stroke="#c9beac" strokeWidth="1.5" />
          <rect x="-28" y="16" width="9" height="26" rx="4" fill="#f5f0e8" stroke="#c9beac" strokeWidth="1.5" />
          <rect x="4" y="14" width="9" height="18" rx="4" fill="#f5f0e8" stroke="#c9beac" strokeWidth="1.5" />
          <rect x="18" y="16" width="9" height="26" rx="4" fill="#f5f0e8" stroke="#c9beac" strokeWidth="1.5" />
          <path
            d="M -50 8 C -56 -12 -34 -26 -5 -24 C 18 -22 34 -14 40 2 C 44 12 40 20 28 22 C 5 26 -28 25 -46 18 C -52 15 -53 11 -50 8 Z"
            fill="#f5f0e8"
            stroke="#c9beac"
            strokeWidth="2"
          />
          <circle cx="42" cy="-14" r="22" fill="#f5f0e8" stroke="#c9beac" strokeWidth="2" />
          <polygon points="30,-32 34,-48 42,-30" fill="#f5f0e8" stroke="#c9beac" strokeWidth="2" />
          <polygon points="32,-34 35,-44 39,-32" fill="#e8a7a7" />
          <polygon points="46,-32 50,-50 58,-30" fill="#f5f0e8" stroke="#c9beac" strokeWidth="2" />
          <polygon points="48,-34 51,-46 55,-32" fill="#e8a7a7" />
          <ellipse cx="50" cy="-16" rx="3" ry="4" fill="#3a3530" />
          <polygon points="60,-6 66,-3 60,0" fill="#e8a7a7" />
          <path d="M 58 2 Q 62 6 66 2" stroke="#3a3530" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <line x1="56" y1="-8" x2="44" y2="-12" stroke="#c9beac" strokeWidth="1" />
          <line x1="56" y1="-2" x2="44" y2="2" stroke="#c9beac" strokeWidth="1" />
        </g>
      </svg>
    );
  }

  if (pose === "sleeping") {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
        <g transform="translate(56,68)">
          <path d="M 54 20 Q 66 -6 30 -30 Q 4 -42 -18 -30" stroke="#f5f0e8" strokeWidth="16" strokeLinecap="round" fill="none" />
          <ellipse cx="8" cy="14" rx="48" ry="34" fill="#f5f0e8" stroke="#c9beac" strokeWidth="2" />
          <circle cx="-30" cy="-8" r="23" fill="#f5f0e8" stroke="#c9beac" strokeWidth="2" />
          <rect x="-38" y="10" width="14" height="9" rx="4" fill="#f5f0e8" stroke="#c9beac" strokeWidth="1.5" />
          <polygon points="-44,-26 -40,-42 -30,-24" fill="#f5f0e8" stroke="#c9beac" strokeWidth="2" />
          <polygon points="-41,-28 -38,-38 -33,-25" fill="#e8a7a7" />
          <path d="M -42 -6 Q -36 -2 -30 -6" stroke="#3a3530" strokeWidth="2" fill="none" strokeLinecap="round" />
          <polygon points="-46,-2 -52,0 -46,2" fill="#e8a7a7" />
          <path d="M -50 4 Q -46 8 -42 4" stroke="#3a3530" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
      <path
        d="M 85 95 Q 112 90 110 62 Q 108 48 93 53"
        stroke="#f5f0e8"
        strokeWidth="15"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="55" cy="86" rx="36" ry="27" fill="#f5f0e8" stroke="#c9beac" strokeWidth="2" />
      <circle cx="55" cy="45" r="29" fill="#f5f0e8" stroke="#c9beac" strokeWidth="2" />
      <polygon points="30,26 37,2 47,29" fill="#f5f0e8" stroke="#c9beac" strokeWidth="2" />
      <polygon points="34,21 38,9 44,25" fill="#e8a7a7" />
      <polygon points="80,26 73,2 63,29" fill="#f5f0e8" stroke="#c9beac" strokeWidth="2" />
      <polygon points="76,21 72,9 66,25" fill="#e8a7a7" />

      {expression === "happy" && (
        <>
          <path d="M 39 46 Q 43 42 47 46" stroke="#3a3530" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 63 46 Q 67 42 71 46" stroke="#3a3530" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === "sleepy" && (
        <>
          <line x1="39" y1="47" x2="47" y2="47" stroke="#3a3530" strokeWidth="2" strokeLinecap="round" />
          <line x1="63" y1="47" x2="71" y2="47" stroke="#3a3530" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {expression === "curious" && (
        <>
          <ellipse cx="43" cy="45" rx="5.5" ry="7.5" fill="#3a3530" />
          <ellipse cx="67" cy="45" rx="5.5" ry="7.5" fill="#3a3530" />
          <circle cx="45" cy="42" r="1.3" fill="#f5f0e8" />
          <circle cx="69" cy="42" r="1.3" fill="#f5f0e8" />
        </>
      )}
      {expression === "startled" && (
        <>
          <ellipse cx="43" cy="45" rx="6.5" ry="9" fill="#3a3530" />
          <ellipse cx="67" cy="45" rx="6.5" ry="9" fill="#3a3530" />
          <circle cx="45" cy="41" r="1.5" fill="#f5f0e8" />
          <circle cx="69" cy="41" r="1.5" fill="#f5f0e8" />
        </>
      )}
      {expression === "normal" && (
        <>
          <ellipse cx="43" cy="46" rx="4" ry="6" fill="#3a3530" />
          <ellipse cx="67" cy="46" rx="4" ry="6" fill="#3a3530" />
        </>
      )}

      <polygon points="55,55 51,61 59,61" fill="#e8a7a7" />
      {expression === "startled" ? (
        <ellipse cx="55" cy="65" rx="3.5" ry="4.5" fill="#3a3530" />
      ) : (
        <path
          d="M 49 64 Q 52 68 55 64 Q 58 68 61 64"
          stroke="#3a3530"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      )}
      <line x1="18" y1="54" x2="38" y2="52" stroke="#c9beac" strokeWidth="1.5" />
      <line x1="18" y1="62" x2="38" y2="59" stroke="#c9beac" strokeWidth="1.5" />
      <line x1="92" y1="54" x2="72" y2="52" stroke="#c9beac" strokeWidth="1.5" />
      <line x1="92" y1="62" x2="72" y2="59" stroke="#c9beac" strokeWidth="1.5" />

      {/* Collar with an LS + flower tag, matching the Velora signature. Solid
          pink collar/tag, with the mark in cream/dark tones so it contrasts
          against the pink instead of blending into it. */}
      <path d="M 33 68 Q 55 79 77 68" stroke="#d68989" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="55" cy="83" r="10" fill="#d68989" stroke="#b3615f" strokeWidth="1.5" />
      <text
        x="52"
        y="87"
        textAnchor="middle"
        fontFamily="Segoe Script, Bradley Hand, Brush Script MT, cursive"
        fontSize="9"
        fill="#f5f0e8"
      >
        Ls
      </text>
      <circle cx="61" cy="79" r="1.4" fill="#f5f0e8" />
      <circle cx="63" cy="82" r="1.2" fill="#f5f0e8" />
      <circle cx="61" cy="85" r="1.2" fill="#f5f0e8" />
      <circle cx="58" cy="82" r="1.2" fill="#f5f0e8" />
      <circle cx="61" cy="82" r="0.8" fill="#5c1f14" />
    </svg>
  );
}
