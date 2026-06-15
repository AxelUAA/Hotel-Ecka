'use client';

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string; // Tailwind bg color class, e.g. 'bg-emerald-500/15'
}

export default function StatCard({ label, value, icon, color }: StatCardProps) {
  const isHex = typeof color === 'string' && color.startsWith('#');
  const accent = isHex ? (color as string) : '#d4af6a';

  return (
    <div
      className="
        group relative overflow-hidden rounded-xl border border-midnight-700
        bg-midnight-800 p-5 transition-all duration-200
        hover:scale-[1.02] hover:shadow-glow
        animate-fade-in
      "
    >
      {/* Icon circle */}
      <div
        className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full ${
          isHex ? '' : color ?? 'bg-brass-500/15'
        }`}
        style={isHex ? { backgroundColor: `${accent}26` } : undefined}
      >
        <span style={isHex ? { color: accent } : undefined} className={isHex ? '' : 'text-ink-soft'}>
          {icon}
        </span>
      </div>

      {/* Value */}
      <p className="mt-1 text-3xl font-bold tabular-nums text-ink">{value}</p>

      {/* Label */}
      <p className="mt-1.5 text-sm text-ink-soft">{label}</p>
    </div>
  );
}
