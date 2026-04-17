"use client";

import { Segment } from "@/types/roulette";

interface RouletteWheelProps {
  segments: Segment[];
  rotation: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function buildArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export default function RouletteWheel({ segments, rotation }: RouletteWheelProps) {
  const cx = 250;
  const cy = 250;
  const r = 230;
  const segAngle = 360 / segments.length;
  // SVG 0° is 3 o'clock. Offset -90° so first segment starts at 12 o'clock.
  const offset = -90;

  return (
    <div className="relative w-full max-w-[520px] mx-auto select-none">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 flex flex-col items-center">
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "14px solid transparent",
            borderRight: "14px solid transparent",
            borderTop: "36px solid #FFFFFF",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))",
          }}
        />
      </div>

      {/* Wheel SVG */}
      <svg
        viewBox="0 0 500 500"
        className="w-full drop-shadow-2xl"
        style={{ transform: `rotate(${rotation}deg)`, transition: "none" }}
      >
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="rgba(0,0,0,0.5)" />
          </filter>
        </defs>

        {/* Outer glow ring */}
        <circle cx={cx} cy={cy} r={r + 12} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="20" />
        <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />

        {/* Segments */}
        <g filter="url(#shadow)">
          {segments.map((seg, i) => {
            const startAngle = offset + i * segAngle;
            const endAngle = offset + (i + 1) * segAngle;
            const midAngle = (startAngle + endAngle) / 2;
            const textPos = polarToCartesian(cx, cy, r * 0.62, midAngle);
            const path = buildArcPath(cx, cy, r, startAngle, endAngle);

            return (
              <g key={seg.id}>
                <path
                  d={path}
                  fill={seg.color}
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="1.5"
                />
                {/* Subtle inner highlight */}
                <path
                  d={buildArcPath(cx, cy, r * 0.98, startAngle, endAngle)}
                  fill="rgba(255,255,255,0.06)"
                  stroke="none"
                />
                <text
                  x={textPos.x}
                  y={textPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${midAngle + 90}, ${textPos.x}, ${textPos.y})`}
                  fontSize={seg.label.length > 8 ? "13" : "15"}
                  fontWeight="700"
                  fill="rgba(0,0,0,0.75)"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  {seg.label}
                </text>
              </g>
            );
          })}
        </g>

        {/* Center circle */}
        <circle cx={cx} cy={cy} r={28} fill="#1a1a2e" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
        <circle cx={cx} cy={cy} r={16} fill="rgba(255,255,255,0.15)" />
        <circle cx={cx} cy={cy} r={6} fill="white" />
      </svg>
    </div>
  );
}
