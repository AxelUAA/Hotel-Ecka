'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  open: boolean;
  onClose: () => void;
  /** Tiempo en ms antes de auto-cerrar (0 = no auto-cerrar). */
  duration?: number;
}

export default function Toast({ message, type = 'success', open, onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    if (!open || duration <= 0) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose, message]);

  if (!open) return null;

  const isSuccess = type === 'success';

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-toast fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-xl border bg-midnight-800 px-4 py-3 shadow-2xl"
      style={{
        borderColor: isSuccess ? 'rgba(158,206,106,0.35)' : 'rgba(247,118,142,0.35)',
      }}
    >
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: isSuccess ? 'rgba(158,206,106,0.18)' : 'rgba(247,118,142,0.18)' }}
      >
        {isSuccess ? (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="#9ece6a" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="#f7768e" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        )}
      </span>

      <p className="pt-0.5 text-sm text-ink">{message}</p>

      <button
        onClick={onClose}
        aria-label="Cerrar notificación"
        className="-mr-1 ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-ink-dim transition-colors hover:text-ink"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
