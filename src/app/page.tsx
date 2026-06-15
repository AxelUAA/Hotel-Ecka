"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import StatCard from "@/components/StatCard";
import ChartBar from "@/components/ChartBar";
import ChartDonut from "@/components/ChartDonut";

/* ── SVG Icons ── */
function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function BedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16" /><path d="M2 8h18a2 2 0 012 2v10" /><path d="M2 17h20" /><path d="M6 8v9" />
    </svg>
  );
}
function BadgeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" /><line x1="7" y1="8" x2="17" y2="8" /><line x1="7" y1="12" x2="13" y2="12" /><line x1="7" y1="16" x2="10" y2="16" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function CardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}
function DollarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

/* ── Types ── */
interface DashboardData {
  counts: {
    clientes: number;
    habitaciones: number;
    empleados: number;
    reservaciones: number;
    pagos: number;
    ingresos: number;
  };
  habitacionesEstado: { estado: string; total: number }[];
  reservacionesEstado: { estado: string; total: number }[];
  ingresosMetodo: { metodo_pago: string; total: number }[];
  topClientes: { cliente: string; total: number }[];
}

const ESTADO_HAB_COLORS: Record<string, string> = {
  Disponible: "#9ece6a",
  Ocupada: "#e0af68",
  Mantenimiento: "#f7768e",
};

const ESTADO_RES_COLORS: Record<string, string> = {
  Activa: "#7aa2f7",
  Finalizada: "#9ece6a",
  Cancelada: "#f7768e",
};

const METODO_COLORS: Record<string, string> = {
  Efectivo: "#9ece6a",
  Tarjeta: "#bb9af7",
  Transferencia: "#73daca",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((json) => setData(json))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const c = data?.counts;

  function fmtCurrency(n: number) {
    return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
          {/* ── Metrics ── */}
          {loading || !c ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-midnight-800 animate-pulse border border-midnight-700" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard label="Clientes" value={c.clientes} icon={<UsersIcon />} color="#7aa2f7" />
              <StatCard label="Habitaciones" value={c.habitaciones} icon={<BedIcon />} color="#9ece6a" />
              <StatCard label="Empleados" value={c.empleados} icon={<BadgeIcon />} color="#bb9af7" />
              <StatCard label="Reservaciones" value={c.reservaciones} icon={<CalendarIcon />} color="#e0af68" />
              <StatCard label="Pagos" value={c.pagos} icon={<CardIcon />} color="#73daca" />
              <StatCard label="Ingresos Totales" value={fmtCurrency(Number(c.ingresos))} icon={<DollarIcon />} color="#d4af6a" />
            </div>
          )}

          {/* ── Charts ── */}
          {data && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-midnight-700 bg-midnight-800 p-5 shadow-card">
                <ChartDonut
                  title="Habitaciones por Estado"
                  data={(data.habitacionesEstado ?? []).map((d) => ({
                    label: d.estado,
                    value: Number(d.total),
                    color: ESTADO_HAB_COLORS[d.estado] ?? "#6f7a93",
                  }))}
                />
              </div>
              <div className="rounded-xl border border-midnight-700 bg-midnight-800 p-5 shadow-card">
                <ChartDonut
                  title="Reservaciones por Estado"
                  data={(data.reservacionesEstado ?? []).map((d) => ({
                    label: d.estado,
                    value: Number(d.total),
                    color: ESTADO_RES_COLORS[d.estado] ?? "#6f7a93",
                  }))}
                />
              </div>
              <div className="rounded-xl border border-midnight-700 bg-midnight-800 p-5 shadow-card">
                <ChartBar
                  title="Ingresos por Método de Pago"
                  data={(data.ingresosMetodo ?? []).map((d) => ({
                    label: d.metodo_pago,
                    value: Number(d.total),
                    color: METODO_COLORS[d.metodo_pago] ?? "#d4af6a",
                  }))}
                />
              </div>
              <div className="rounded-xl border border-midnight-700 bg-midnight-800 p-5 shadow-card">
                <ChartBar
                  title="Top Clientes por Gasto"
                  data={(data.topClientes ?? []).map((d) => ({
                    label: d.cliente,
                    value: Number(d.total),
                    color: "#d4af6a",
                  }))}
                />
              </div>
            </div>
          )}
      </div>
    </AppShell>
  );
}
