'use client';

import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, password }),
      });

      if (res.ok) {
        window.location.href = '/';
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'Credenciales inválidas. Intente de nuevo.');
      }
    } catch {
      setError('Error de conexión. Verifique su red e intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-midnight-900 px-4 overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[420px] w-[600px] rounded-full bg-brass-500/[0.07] blur-[120px]"
      />

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md animate-fade-in rounded-2xl border border-midnight-700 bg-midnight-800/80 p-8 shadow-glow backdrop-blur-md sm:p-10"
      >
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          {/* Decorative icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-brass-500/30 bg-brass-500/10">
            <svg
              className="h-7 w-7 text-brass-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6M4.5 10.5v8.25A1.5 1.5 0 006 20.25h12a1.5 1.5 0 001.5-1.5V10.5"
              />
            </svg>
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-wide text-ink sm:text-4xl">
            Hotel Ecka
          </h1>

          <p className="mt-2 text-sm font-medium tracking-widest uppercase text-brass-500">
            Sistema de Administración
          </p>

          {/* Gold separator */}
          <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-brass-500/60 to-transparent" />
        </div>

        {/* Error */}
        {error && (
          <div role="alert" aria-live="assertive" className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Username */}
        <div className="mb-4">
          <label
            htmlFor="user"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-soft"
          >
            Usuario
          </label>
          <input
            id="user"
            type="text"
            required
            autoFocus
            autoComplete="username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Ingrese su usuario"
            className="w-full rounded-lg border border-midnight-600 bg-midnight-700 px-4 py-3 text-ink placeholder:text-ink-dim focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500/40 transition-colors"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-soft"
          >
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              className="w-full rounded-lg border border-midnight-600 bg-midnight-700 px-4 py-3 pr-12 text-ink placeholder:text-ink-dim focus:border-brass-500 focus:outline-none focus:ring-1 focus:ring-brass-500/40 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-dim transition-colors hover:text-ink"
            >
              {showPw ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L9.88 9.88" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brass-600 to-brass-500 px-4 py-3 text-sm font-semibold text-midnight-950 shadow-md transition-all hover:from-brass-500 hover:to-brass-400 focus:outline-none focus:ring-2 focus:ring-brass-500/50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && (
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {loading ? 'Iniciando sesión…' : 'Iniciar Sesión'}
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-ink-dim">
          Acceso exclusivo para personal autorizado
        </p>
      </form>
    </div>
  );
}
