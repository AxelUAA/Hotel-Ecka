'use client';

import { useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface BarSegment {
  label: string;
  value: number;
  color?: string;
}

interface ChartBarProps {
  data: BarSegment[];
  height?: number;
  title?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ChartBar({ data, height = 260, title }: ChartBarProps) {
  const maxVal = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  const defaultColors = ['#7aa2f7', '#9ece6a', '#e0af68', '#f7768e', '#bb9af7', '#73daca', '#ff9e64', '#7dcfff'];

  return (
    <div className="flex flex-col gap-3">
      {title && (
        <h3 className="text-sm font-semibold text-ink-soft">{title}</h3>
      )}

      <div className="space-y-2.5" style={{ minHeight: height }}>
        {data.map((d, i) => {
          const pct = (d.value / maxVal) * 100;
          const color = d.color || defaultColors[i % defaultColors.length];

          return (
            <div key={i} className="group flex items-center gap-3" title={`${d.label}: ${d.value}`}>
              {/* Label */}
              <span className="w-28 shrink-0 truncate text-right text-xs text-ink-soft">
                {d.label}
              </span>

              {/* Bar track */}
              <div className="relative flex-1 h-6 rounded bg-midnight-700/50">
                <div
                  className="h-full rounded transition-all duration-500 ease-out group-hover:brightness-110"
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    backgroundColor: color,
                    opacity: 0.85,
                  }}
                />
              </div>

              {/* Value */}
              <span className="w-16 shrink-0 text-right text-xs font-medium tabular-nums text-ink">
                {typeof d.value === 'number' && d.value >= 1000
                  ? `$${d.value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : d.value}
              </span>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-ink-dim">
            Sin datos disponibles
          </div>
        )}
      </div>
    </div>
  );
}
