import type { CatExpression, CatPose } from "./PersianCat";

// A golden retriever puppy mascot matching the cat's body/collar
// proportions and brand collar so they read as the same "family" of pets,
// but with species-true honey-gold fur, floppy ears, a snout, and a dark
// nose instead of the cat's cream/rose palette and pink nose.
export function GoldenRetriever({
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
          <path d="M -48 4 Q -68 -10 -60 -32 Q -55 -44 -42 -40" stroke="#eab676" strokeWidth="14" strokeLinecap="round" fill="none" />
          <rect x="-46" y="14" width="9" height="18" rx="4" fill="#eab676" stroke="#a17a4a" strokeWidth="1.5" />
          <rect x="-28" y="16" width="9" height="26" rx="4" fill="#eab676" stroke="#a17a4a" strokeWidth="1.5" />
          <rect x="4" y="14" width="9" height="18" rx="4" fill="#eab676" stroke="#a17a4a" strokeWidth="1.5" />
          <rect x="18" y="16" width="9" height="26" rx="4" fill="#eab676" stroke="#a17a4a" strokeWidth="1.5" />
          <path
            d="M -50 8 C -56 -12 -34 -26 -5 -24 C 18 -22 34 -14 40 2 C 44 12 40 20 28 22 C 5 26 -28 25 -46 18 C -52 15 -53 11 -50 8 Z"
            fill="#eab676"
            stroke="#a17a4a"
            strokeWidth="2"
          />
          <path
            d="M 48,-34 C 56,-32 60,-24 56,-14 C 54,-10 48,-12 50,-18 C 52,-24 50,-30 46,-36 Z"
            fill="#dba25c"
            stroke="#a17a4a"
            strokeWidth="1.5"
          />
          <circle cx="42" cy="-14" r="22" fill="#eab676" stroke="#a17a4a" strokeWidth="2" />
          <path
            d="M 36,-32 C 20,-28 14,-10 20,6 C 24,12 32,8 30,0 C 26,-12 28,-24 40,-34 Z"
            fill="#dba25c"
            stroke="#a17a4a"
            strokeWidth="1.5"
          />
          <ellipse cx="50" cy="-16" rx="3" ry="4" fill="#3a3530" />
          <ellipse cx="63" cy="-4" rx="4.5" ry="3.5" fill="#3a2a1a" />
          <path d="M 58 3 Q 62 7 66 3" stroke="#4a3423" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (pose === "sleeping") {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
        <g transform="translate(56,68)">
          <path d="M 54 20 Q 66 -6 30 -30 Q 4 -42 -18 -30" stroke="#eab676" strokeWidth="16" strokeLinecap="round" fill="none" />
          <ellipse cx="8" cy="14" rx="48" ry="34" fill="#eab676" stroke="#a17a4a" strokeWidth="2" />
          <path
            d="M -36,-28 C -48,-22 -50,-6 -42,6 C -38,10 -32,6 -34,0 C -36,-10 -36,-20 -28,-30 Z"
            fill="#dba25c"
            stroke="#a17a4a"
            strokeWidth="1.5"
          />
          <circle cx="-30" cy="-8" r="23" fill="#eab676" stroke="#a17a4a" strokeWidth="2" />
          <rect x="-38" y="10" width="14" height="9" rx="4" fill="#eab676" stroke="#a17a4a" strokeWidth="1.5" />
          <path d="M -42 -6 Q -36 -2 -30 -6" stroke="#3a3530" strokeWidth="2" fill="none" strokeLinecap="round" />
          <polygon points="-46,-2 -52,0 -46,2" fill="#3a2a1a" />
          <path d="M -50 4 Q -46 8 -42 4" stroke="#4a3423" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M -47 7 Q -45 17 -41 8 Q -44 4 -47 7 Z" fill="#e8a7a7" stroke="#b3615f" strokeWidth="1" />
        </g>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
      <path
        d="M 85 95 Q 112 90 110 62 Q 108 48 93 53"
        stroke="#eab676"
        strokeWidth="15"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="55" cy="86" rx="36" ry="27" fill="#eab676" stroke="#a17a4a" strokeWidth="2" />

      <path
        d="M 32 26 C 14 32 8 55 16 76 C 20 82 30 78 30 70 C 26 55 28 38 38 30 Z"
        fill="#dba25c"
        stroke="#a17a4a"
        strokeWidth="2"
      />
      <path
        d="M 78 26 C 96 32 102 55 94 76 C 90 82 80 78 80 70 C 84 55 82 38 72 30 Z"
        fill="#dba25c"
        stroke="#a17a4a"
        strokeWidth="2"
      />
      <path d="M 28 40 C 20 52 18 62 22 72" stroke="#f5dba8" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 82 40 C 90 52 92 62 88 72" stroke="#f5dba8" strokeWidth="4" fill="none" strokeLinecap="round" />

      <circle cx="55" cy="45" r="29" fill="#eab676" stroke="#a17a4a" strokeWidth="2" />
      <ellipse cx="55" cy="60" rx="15" ry="12" fill="#f5dba8" stroke="#a17a4a" strokeWidth="2" />

      {expression === "happy" && (
        <>
          <path d="M 39 44 Q 43 40 47 44" stroke="#3a3530" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 63 44 Q 67 40 71 44" stroke="#3a3530" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === "sleepy" && (
        <>
          <line x1="39" y1="45" x2="47" y2="45" stroke="#3a3530" strokeWidth="2" strokeLinecap="round" />
          <line x1="63" y1="45" x2="71" y2="45" stroke="#3a3530" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {expression === "curious" && (
        <>
          <ellipse cx="43" cy="43" rx="5.5" ry="7.5" fill="#3a3530" />
          <ellipse cx="67" cy="43" rx="5.5" ry="7.5" fill="#3a3530" />
          <circle cx="45" cy="40" r="1.3" fill="#f5dba8" />
          <circle cx="69" cy="40" r="1.3" fill="#f5dba8" />
        </>
      )}
      {expression === "startled" && (
        <>
          <ellipse cx="43" cy="43" rx="6.5" ry="9" fill="#3a3530" />
          <ellipse cx="67" cy="43" rx="6.5" ry="9" fill="#3a3530" />
          <circle cx="45" cy="39" r="1.5" fill="#f5dba8" />
          <circle cx="69" cy="39" r="1.5" fill="#f5dba8" />
        </>
      )}
      {expression === "normal" && (
        <>
          <ellipse cx="43" cy="44" rx="4" ry="6" fill="#3a3530" />
          <ellipse cx="67" cy="44" rx="4" ry="6" fill="#3a3530" />
        </>
      )}

      <polygon points="49,56 61,56 55,65" fill="#3a2a1a" />
      <path d="M 48 68 Q 55 74 62 68" stroke="#4a3423" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      <line x1="18" y1="58" x2="36" y2="56" stroke="#a17a4a" strokeWidth="1.5" />
      <line x1="18" y1="65" x2="36" y2="62" stroke="#a17a4a" strokeWidth="1.5" />
      <line x1="92" y1="58" x2="74" y2="56" stroke="#a17a4a" strokeWidth="1.5" />
      <line x1="92" y1="65" x2="74" y2="62" stroke="#a17a4a" strokeWidth="1.5" />

      {/* Same pink Velora collar + tag as the cat — the shared signature
          across every pet, regardless of species. */}
      <path d="M 33 72 Q 55 82 77 72" stroke="#d68989" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="55" cy="86" r="10" fill="#d68989" stroke="#b3615f" strokeWidth="1.5" />
      <text
        x="52"
        y="90"
        textAnchor="middle"
        fontFamily="Segoe Script, Bradley Hand, Brush Script MT, cursive"
        fontSize="9"
        fill="#f5f0e8"
      >
        Ls
      </text>
      <circle cx="61" cy="82" r="1.4" fill="#f5f0e8" />
      <circle cx="63" cy="85" r="1.2" fill="#f5f0e8" />
      <circle cx="61" cy="88" r="1.2" fill="#f5f0e8" />
      <circle cx="58" cy="85" r="1.2" fill="#f5f0e8" />
      <circle cx="61" cy="85" r="0.8" fill="#5c1f14" />
    </svg>
  );
}
