"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { CATALOGO_CONSULTAS, type ConsultaItem } from "@/lib/queries";

/* ── Category accent colors ── */
const CAT_COLORS: Record<string, string> = {
  sencillas: "#7aa2f7",
  agrupadas: "#9ece6a",
  having: "#e0af68",
  multitabla: "#bb9af7",
  extra: "#d4af6a",
};

/* ── SQL Syntax Highlighter ── */
function highlightSQL(sql: string) {
  const keywords = /\b(SELECT|FROM|WHERE|JOIN|LEFT JOIN|INNER JOIN|RIGHT JOIN|ON|AND|OR|NOT|IN|AS|ORDER BY|GROUP BY|HAVING|LIMIT|BETWEEN|LIKE|DISTINCT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|IS|NULL|COUNT|SUM|AVG|MIN|MAX|ROUND|COALESCE|DATEDIFF|DEFAULT|DESC|ASC)\b/gi;
  const tables = /\b(Cliente|Habitacion|Empleado|Reservacion|Pago|asignar)\b/g;
  const strings = /('(?:[^'\\]|\\.)*')/g;
  const numbers = /\b(\d+(?:\.\d+)?)\b/g;

  let result = sql
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  result = result.replace(strings, '<span class="text-emerald-400">$1</span>');
  result = result.replace(keywords, '<span class="text-brass-400 font-semibold">$&</span>');
  result = result.replace(tables, '<span class="text-blue-400">$1</span>');
  result = result.replace(numbers, '<span class="text-amber-300">$1</span>');

  return result;
}

/* ── Result types ── */
interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  total: number;
}

export default function ConsultasPage() {
  const [selectedQuery, setSelectedQuery] = useState<ConsultaItem | null>(null);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["sencillas"]));

  function toggleCategory(clave: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(clave)) next.delete(clave);
      else next.add(clave);
      return next;
    });
  }

  async function executeQuery(query: ConsultaItem) {
    setSelectedQuery(query);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/consultas?id=${query.id}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Error al ejecutar la consulta.");
        return;
      }

      setResult({
        columns: json.columns ?? [],
        rows: json.rows ?? [],
        total: json.total ?? 0,
      });
    } catch {
      setError("Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  }

  function formatResultValue(val: unknown): string {
    if (val === null || val === undefined) return "—";
    if (typeof val === "number") {
      if (Number.isInteger(val)) return val.toString();
      return val.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    const str = String(val);
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      try {
        return new Date(str).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });
      } catch {
        return str;
      }
    }
    return str;
  }

  return (
    <AppShell title="Consultas SQL" bare>
        <div className="flex animate-fade-in flex-col md:h-[calc(100dvh-4rem)] md:flex-row">
          {/* ── Left Panel: Query Catalog ── */}
          <aside className="w-full flex-shrink-0 border-b border-midnight-700 bg-midnight-900/50 md:max-h-none md:w-80 md:overflow-y-auto md:border-b-0 md:border-r">
            <div className="p-4 border-b border-midnight-700">
              <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wider">Catálogo de Consultas</h2>
              <p className="text-xs text-ink-dim mt-1">25 consultas en 5 categorías</p>
            </div>

            {CATALOGO_CONSULTAS.map((cat) => {
              const isExpanded = expandedCategories.has(cat.clave);
              const accentColor = CAT_COLORS[cat.clave] ?? "#d4af6a";

              return (
                <div key={cat.clave} className="border-b border-midnight-700/50">
                  <button
                    onClick={() => toggleCategory(cat.clave)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-midnight-800/50"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
                      <span className="text-sm font-medium text-ink">{cat.nombre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-dim bg-midnight-700 px-1.5 py-0.5 rounded">{cat.consultas.length}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`text-ink-dim transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="pb-1">
                      {cat.consultas.map((q) => {
                        const isSelected = selectedQuery?.id === q.id;
                        return (
                          <button
                            key={q.id}
                            onClick={() => executeQuery(q)}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-all duration-150 ${
                              isSelected
                                ? "bg-midnight-700 text-brass-400 border-l-2 border-brass-500"
                                : "text-ink-soft hover:text-ink hover:bg-midnight-800/50 border-l-2 border-transparent"
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 opacity-50">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            <span className="line-clamp-2">{q.titulo}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </aside>

          {/* ── Right Panel: Results ── */}
          <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
            {!selectedQuery ? (
              <div className="flex flex-col items-center justify-center h-full text-ink-dim">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 text-ink-dim/50">
                  <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
                <p className="text-lg font-serif">Selecciona una consulta</p>
                <p className="text-sm mt-1">Elige una consulta del panel izquierdo para ejecutarla</p>
              </div>
            ) : (
              <>
                {/* Query Info */}
                <div>
                  <h2 className="text-xl font-serif text-ink mb-1">{selectedQuery.titulo}</h2>
                  <p className="text-sm text-ink-soft">{selectedQuery.descripcion}</p>
                </div>

                {/* SQL Code Block */}
                <div className="rounded-xl border border-midnight-700 bg-midnight-950 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-midnight-700 bg-midnight-900/50">
                    <span className="text-xs text-ink-dim font-mono uppercase tracking-wider">SQL</span>
                    <button
                      onClick={() => executeQuery(selectedQuery)}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brass-600 to-brass-500 px-3 py-1.5 text-xs font-semibold text-midnight-950 transition-all hover:from-brass-500 hover:to-brass-400 disabled:opacity-50"
                    >
                      {loading ? (
                        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      )}
                      Ejecutar
                    </button>
                  </div>
                  <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto">
                    <code dangerouslySetInnerHTML={{ __html: highlightSQL(selectedQuery.sql) }} />
                  </pre>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                  <div className="rounded-xl border border-midnight-700 bg-midnight-900/50 p-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-8 rounded bg-midnight-700 animate-pulse" style={{ width: `${70 + Math.random() * 25}%` }} />
                    ))}
                  </div>
                )}

                {/* Results Table */}
                {result && !loading && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-ink-soft">
                        <span className="font-semibold text-ink tabular-nums">{result.total}</span> fila{result.total !== 1 ? "s" : ""} encontrada{result.total !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-midnight-700 bg-midnight-900/50">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-midnight-800">
                            {result.columns.map((col) => (
                              <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-midnight-700/50 transition-colors hover:bg-midnight-800/50">
                              {result.columns.map((col) => {
                                const val = row[col];
                                const isNum = typeof val === "number";
                                return (
                                  <td
                                    key={col}
                                    className={`px-4 py-3 whitespace-nowrap text-ink ${isNum ? "text-right tabular-nums" : ""}`}
                                  >
                                    {formatResultValue(val)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
    </AppShell>
  );
}
