"use client";

import React, { useMemo, useState } from "react";

/* ── Types ── */
interface Column {
  name: string;
  label: string;
}

interface DataTableProps {
  columns: Column[];
  rows: Record<string, unknown>[];
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (row: Record<string, unknown>) => void;
  pkColumns: string[];
  allowUpdate?: boolean;
  loading?: boolean;
}

/* ── Badge helper ── */
const BADGE_MAP: Record<string, string> = {
  Disponible: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  Activa: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Finalizada: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  Ocupada: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Mantenimiento: "bg-red-500/15 text-red-400 border-red-500/25",
  Cancelada: "bg-red-500/15 text-red-400 border-red-500/25",
  Efectivo: "bg-green-500/15 text-green-400 border-green-500/25",
  Tarjeta: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  Transferencia: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
};

function formatValue(col: string, val: unknown): React.ReactNode {
  if (val === null || val === undefined) return <span className="text-ink-dim">—</span>;

  const str = String(val);

  // Badge for known status/method values
  const badge = BADGE_MAP[str];
  if (badge) {
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge}`}>
        {str}
      </span>
    );
  }

  // Date formatting.
  // Se construye la fecha en hora LOCAL a partir de año/mes/día para evitar el
  // desfase de un día: `new Date("2025-07-05")` se interpreta como UTC y, al
  // mostrarla en una zona horaria negativa (ej. UTC-6), retrocedía al día 4.
  const dm = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (col.includes("fecha") && dm) {
    const d = new Date(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3]));
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    return str;
  }

  // Decimal / money formatting
  if (col === "monto" || col === "precio" || col === "ingresos") {
    const n = Number(val);
    if (!Number.isNaN(n)) {
      return (
        <span className="tabular-nums">
          ${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      );
    }
  }

  // Numeric ID columns
  if (typeof val === "number") {
    return <span className="tabular-nums">{val}</span>;
  }

  return str;
}

/* ── Pencil Icon ── */
function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

/* ── Trash Icon ── */
function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

/* ── Skeleton row ── */
function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-midnight-700/30">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-midnight-700 animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

/* ── Component ── */
export default function DataTable({ columns, rows, onEdit, onDelete, pkColumns, allowUpdate = true, loading = false }: DataTableProps) {
  const hasActions = !!(onEdit || onDelete);
  const totalCols = columns.length + (hasActions ? 1 : 0);

  /* ── Ordenamiento por columna ── */
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      const na = Number(va);
      const nb = Number(vb);
      let cmp: number;
      if (!Number.isNaN(na) && !Number.isNaN(nb)) {
        cmp = na - nb;
      } else {
        cmp = String(va).localeCompare(String(vb), "es", { numeric: true });
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-xl border border-midnight-700 bg-midnight-900/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-midnight-800">
              {columns.map((c) => (
                <th key={c.name} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  {c.label}
                </th>
              ))}
              {hasActions && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-soft">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} cols={totalCols} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-midnight-700 bg-midnight-900/50 py-16">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-dim mb-3">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        <p className="text-ink-dim">No hay registros</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-midnight-700 bg-midnight-900/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-midnight-800">
            {columns.map((c) => {
              const active = sortKey === c.name;
              return (
                <th
                  key={c.name}
                  aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft whitespace-nowrap"
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(c.name)}
                    className="group inline-flex items-center gap-1.5 transition-colors hover:text-ink"
                    title={`Ordenar por ${c.label}`}
                  >
                    {c.label}
                    <span className={`text-[10px] leading-none ${active ? "text-brass-400" : "text-ink-dim/50 group-hover:text-ink-dim"}`}>
                      {active ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                    </span>
                  </button>
                </th>
              );
            })}
            {hasActions && (
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, ri) => {
            const key = pkColumns.map((pk) => String(row[pk] ?? ri)).join("-");
            return (
              <tr key={key} className="border-b border-midnight-700/50 transition-colors duration-150 hover:bg-midnight-800/50">
                {columns.map((c) => (
                  <td key={c.name} className="px-4 py-3 whitespace-nowrap text-ink">
                    {formatValue(c.name, row[c.name])}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      {allowUpdate && onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="rounded-lg p-2 text-ink-dim transition-colors hover:bg-midnight-700 hover:text-brass-400"
                          title="Editar"
                          aria-label="Editar registro"
                        >
                          <PencilIcon />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="rounded-lg p-2 text-ink-dim transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="Eliminar"
                          aria-label="Eliminar registro"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
