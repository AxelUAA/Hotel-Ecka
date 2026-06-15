'use client';

interface TopbarProps {
  title: string;
  onMenu?: () => void;
}

export default function Topbar({ title, onMenu }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-midnight-700 bg-midnight-900/80 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        {/* Botón de menú (solo móvil) */}
        <button
          type="button"
          onClick={onMenu}
          aria-label="Abrir menú de navegación"
          className="-ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-midnight-800 hover:text-ink lg:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>

        {/* Page title */}
        <h1 className="truncate font-serif text-lg font-semibold text-ink sm:text-xl">{title}</h1>
      </div>

      {/* Brand badge */}
      <div className="flex items-center gap-2 rounded-full border border-brass-700/40 bg-brass-500/10 px-4 py-1.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-brass-500"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2L2 12l10 10 10-10L12 2Zm0 3.414L19.586 12 12 19.586 4.414 12 12 5.414Z" />
          <path d="M12 7.5 7.5 12 12 16.5 16.5 12 12 7.5Z" />
        </svg>
        <span className="text-sm font-medium text-brass-500">Hotel Ecka</span>
      </div>
    </header>
  );
}
