"use client";

import { useState } from "react";

export type PastAttempt = {
  id: string;
  testId: string;
  score: number;
  maxScore: number;
  submittedAt: string;
  testTitle: string;
  questionStyle: string;
  requestedQuestionCount: number;
};

const WIDTH = 600;
const HEIGHT = 220;
const PAD_LEFT = 36;
const PAD_RIGHT = 16;
const PAD_TOP = 20;
const PAD_BOTTOM = 28;

function scoreToY(pct: number) {
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  return PAD_TOP + plotHeight * (1 - pct / 100);
}

export function TestScoreChart({ pastAttempts }: { pastAttempts: PastAttempt[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Oldest -> newest for a left-to-right trend line.
  const chronological = [...pastAttempts].reverse();
  const points = chronological.map((a, i) => ({
    ...a,
    pct: a.maxScore > 0 ? Math.round((a.score / a.maxScore) * 100) : 0,
    index: i,
  }));

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const xFor = (i: number) => (points.length <= 1 ? PAD_LEFT + plotWidth / 2 : PAD_LEFT + (plotWidth * i) / (points.length - 1));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${scoreToY(p.pct)}`).join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${xFor(points.length - 1)} ${scoreToY(0)} L ${xFor(0)} ${scoreToY(0)} Z`
      : "";

  // Trend: compare average of the first half vs the second half.
  let trend: { label: string; icon: string; tone: "good" | "critical" | "muted" } | null = null;
  if (points.length >= 2) {
    const mid = Math.ceil(points.length / 2);
    const firstAvg = points.slice(0, mid).reduce((s, p) => s + p.pct, 0) / mid;
    const secondAvg = points.slice(mid).reduce((s, p) => s + p.pct, 0) / (points.length - mid || 1);
    const delta = secondAvg - firstAvg;
    if (delta >= 5) trend = { label: "Improving", icon: "↑", tone: "good" };
    else if (delta <= -5) trend = { label: "Declining", icon: "↓", tone: "critical" };
    else trend = { label: "Steady", icon: "→", tone: "muted" };
  }

  const latest = points[points.length - 1];
  const best = points.reduce((max, p) => (p.pct > max.pct ? p : max), points[0]);
  const average = points.length > 0 ? Math.round(points.reduce((s, p) => s + p.pct, 0) / points.length) : 0;

  const toneClasses = {
    good: "text-[#0ca30c]",
    critical: "text-[#d03b3b]",
    muted: "text-gray-500 dark:text-gray-400",
  } as const;

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <div className="text-2xl font-semibold">{latest?.pct ?? 0}%</div>
          <div className="text-xs text-gray-500">Latest score</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{best?.pct ?? 0}%</div>
          <div className="text-xs text-gray-500">Best score</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{average}%</div>
          <div className="text-xs text-gray-500">Average</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">{points.length}</div>
          <div className="text-xs text-gray-500">Attempts</div>
        </div>
        {trend && (
          <div className={`ml-auto flex items-center gap-1 text-sm font-medium ${toneClasses[trend.tone]}`}>
            <span aria-hidden>{trend.icon}</span>
            <span>{trend.label}</span>
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Score trend over attempts">
        {[0, 50, 100].map((tick) => (
          <g key={tick}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={scoreToY(tick)}
              y2={scoreToY(tick)}
              className="stroke-[#e1e0d9] dark:stroke-[#2c2c2a]"
              strokeWidth={1}
            />
            <text
              x={PAD_LEFT - 8}
              y={scoreToY(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-[#898781] text-[10px]"
            >
              {tick}%
            </text>
          </g>
        ))}

        {areaPath && <path d={areaPath} className="fill-[#2a78d6] dark:fill-[#3987e5]" fillOpacity={0.1} />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            className="stroke-[#2a78d6] dark:stroke-[#3987e5]"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((p, i) => (
          <g key={p.id}>
            {hoverIndex === i && (
              <line
                x1={xFor(i)}
                x2={xFor(i)}
                y1={PAD_TOP}
                y2={HEIGHT - PAD_BOTTOM}
                className="stroke-[#c3c2b7] dark:stroke-[#383835]"
                strokeWidth={1}
              />
            )}
            <circle
              cx={xFor(i)}
              cy={scoreToY(p.pct)}
              r={5}
              className="fill-[#2a78d6] stroke-[#fcfcfb] dark:fill-[#3987e5] dark:stroke-[#1a1a19]"
              strokeWidth={2}
              tabIndex={0}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              onFocus={() => setHoverIndex(i)}
              onBlur={() => setHoverIndex(null)}
            />
            {i === points.length - 1 && (
              <text
                x={xFor(i)}
                y={scoreToY(p.pct) - 12}
                textAnchor="middle"
                className="fill-[#0b0b0b] text-[11px] font-medium dark:fill-white"
              >
                {p.pct}%
              </text>
            )}
          </g>
        ))}
      </svg>

      {hoverIndex !== null && points[hoverIndex] && (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="font-medium">{points[hoverIndex].testTitle}</span> ·{" "}
          {points[hoverIndex].questionStyle} · {points[hoverIndex].requestedQuestionCount} questions ·{" "}
          {new Date(points[hoverIndex].submittedAt).toLocaleDateString("en-US")} ·{" "}
          <span className="font-semibold">
            {Math.round(points[hoverIndex].score * 10) / 10}/{points[hoverIndex].maxScore} ({points[hoverIndex].pct}%)
          </span>
        </div>
      )}
    </div>
  );
}
