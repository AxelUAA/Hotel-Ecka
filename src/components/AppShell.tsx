'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppShellProps {
  title: string;
  children: React.ReactNode;
  /** Si es true, el contenido ocupa todo el alto sin padding (ej. panel de consultas). */
  bare?: boolean;
}

export default function AppShell({ title, children, bare = false }: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-midnight-950">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Overlay para cerrar el drawer en móvil */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="lg:pl-64">
        <Topbar title={title} onMenu={() => setOpen(true)} />

        {bare ? (
          <main id="contenido">{children}</main>
        ) : (
          <main id="contenido" className="mx-auto max-w-7xl animate-fade-in p-4 sm:p-6">
            {children}
          </main>
        )}
      </div>
    </div>
  );
}
