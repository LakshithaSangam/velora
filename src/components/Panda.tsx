import type { CatExpression, CatPose } from "./PersianCat";

// A panda mascot — the one clearly black-and-white companion in the
// family, with round black ears, black eye patches, black "arm" patches
// peeking past the body, and a slow, calm amble. No tail.
export function Panda({
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
          <rect x="-46" y="14" width="9" height="18" rx="4" fill="#2b2b2b" />
          <rect x="-28" y="16" width="9" height="26" rx="4" fill="#2b2b2b" />
          <rect x="4" y="14" width="9" height="18" rx="4" fill="#2b2b2b" />
          <rect x="18" y="16" width="9" height="26" rx="4" fill="#2b2b2b" />
          <path
            d="M -50 8 C -56 -12 -34 -26 -5 -24 C 18 -22 34 -14 40 2 C 44 12 40 20 28 22 C 5 26 -28 25 -46 18 C -52 15 -53 11 -50 8 Z"
            fill="#faf8f5"
            stroke="#3a3530"
            strokeWidth="2"
          />
          <circle cx="42" cy="-34" r="10" fill="#2b2b2b" />
          <circle cx="42" cy="-14" r="22" fill="#faf8f5" stroke="#3a3530" strokeWidth="2" />
          <ellipse cx="50" cy="-14" rx="9" ry="11" fill="#2b2b2b" />
          <circle cx="52" cy="-14" r="3.5" fill="#faf8f5" />
          <circle cx="53" cy="-15" r="1.5" fill="#2b2b2b" />
          <ellipse cx="63" cy="-4" rx="5" ry="4" fill="#2b2b2b" />
        </g>
      </svg>
    );
  }

  if (pose === "sleeping") {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
        <g transform="translate(56,68)">
          <ellipse cx="8" cy="14" rx="48" ry="34" fill="#faf8f5" stroke="#3a3530" strokeWidth="2" />
          <ellipse cx="42" cy="30" rx="10" ry="16" fill="#2b2b2b" />
          <circle cx="-36" cy="-26" r="12" fill="#2b2b2b" />
          <circle cx="-30" cy="-8" r="23" fill="#faf8f5" stroke="#3a3530" strokeWidth="2" />
          <ellipse cx="-24" cy="-8" rx="9" ry="11" fill="#2b2b2b" />
          <path d="M -28 -8 Q -24 -5 -20 -8" stroke="#faf8f5" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <ellipse cx="-14" cy="2" rx="5" ry="4" fill="#2b2b2b" />
        </g>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-hidden>
      <ellipse cx="26" cy="82" rx="9" ry="16" fill="#2b2b2b" />
      <ellipse cx="84" cy="82" rx="9" ry="16" fill="#2b2b2b" />
      <ellipse cx="55" cy="86" rx="36" ry="27" fill="#faf8f5" stroke="#3a3530" strokeWidth="2" />

      <circle cx="34" cy="24" r="11" fill="#2b2b2b" />
      <circle cx="76" cy="24" r="11" fill="#2b2b2b" />

      <circle cx="55" cy="48" r="27" fill="#faf8f5" stroke="#3a3530" strokeWidth="2" />
      <path d="M 34 42 Q 30 50 36 56 Q 42 58 44 52 Q 44 44 40 40 Q 36 39 34 42 Z" fill="#2b2b2b" />
      <path d="M 76 42 Q 80 50 74 56 Q 68 58 66 52 Q 66 44 70 40 Q 74 39 76 42 Z" fill="#2b2b2b" />

      {expression === "happy" && (
        <>
          <path d="M 35 50 Q 39 54 43 50" stroke="#faf8f5" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M 67 50 Q 71 54 75 50" stroke="#faf8f5" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === "sleepy" && (
        <>
          <line x1="35" y1="49" x2="43" y2="49" stroke="#faf8f5" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="67" y1="49" x2="75" y2="49" stroke="#faf8f5" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
      {expression === "curious" && (
        <>
          <circle cx="38" cy="47" r="2.2" fill="#faf8f5" />
          <circle cx="74" cy="47" r="2.2" fill="#faf8f5" />
        </>
      )}
      {expression === "startled" && (
        <>
          <circle cx="38" cy="47" r="2.8" fill="#faf8f5" />
          <circle cx="74" cy="47" r="2.8" fill="#faf8f5" />
        </>
      )}
      {expression === "normal" && (
        <>
          <circle cx="37" cy="46" r="1.4" fill="#faf8f5" />
          <circle cx="73" cy="46" r="1.4" fill="#faf8f5" />
        </>
      )}

      <ellipse cx="55" cy="58" rx="5" ry="4" fill="#2b2b2b" />
      <path d="M 49 64 Q 52 68 55 64 Q 58 68 61 64" stroke="#3a3530" strokeWidth="1.6" fill="none" strokeLinecap="round" />

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
