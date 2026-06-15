'use client';

import { useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface ChartDonutProps {
  data: DonutSegment[];
  size?: number;
  title?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ChartDonut({ data, size = 200, title }: ChartDonutProps) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  const arcs = useMemo(() => {
    let cursor = 0;
    return data.map((d) => {
      const fraction = total > 0 ? d.value / total : 0;
      const startAngle = cursor * 360;
      // Clamp to avoid floating point overshoot
      const endAngle = Math.min((cursor + fraction) * 360, 360);
      cursor += fraction;
      return { ...d, startAngle, endAngle, fraction };
    });
  }, [data, total]);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const strokeW = outerR * 0.3;
  const r = outerR - strokeW / 2;

  return (
    <div className="flex flex-col items-center gap-4">
      {title && (
        <h3 className="text-sm font-semibold text-ink-soft">{title}</h3>
      )}

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2540" strokeWidth={strokeW} />

        {arcs.map((arc, i) => {
          if (arc.fraction <= 0) return null;
          // Full circle special case
          if (arc.fraction >= 0.9999) {
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeW}
                className="transition-opacity duration-200 hover:opacity-80"
              />
            );
          }
          return (
            <path
              key={i}
              d={describeArc(cx, cy, r, arc.startAngle, arc.endAngle)}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeW}
              strokeLinecap="butt"
              className="transition-opacity duration-200 hover:opacity-80"
            >
              <title>{`${arc.label}: ${arc.value}`}</title>
            </path>
          );
        })}

        {/* Center label */}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-ink text-lg font-semibold" fontSize="18">
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-ink-dim text-[10px]" fontSize="10">
          Total
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            {d.label} ({d.value})
          </div>
        ))}
      </div>
    </div>
  );
}
