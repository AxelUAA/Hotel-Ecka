/**
 * Autenticacion ligera basada en cookie firmada (HMAC-SHA256).
 *
 * Usa Web Crypto (crypto.subtle), disponible tanto en el runtime de Node
 * como en el Edge runtime del middleware de Next.js.
 */

export const SESSION_COOKIE = "ecka_session";

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

function getSecret(): string {
  return process.env.SESSION_SECRET ?? "ecka-dev-secret-change-me";
}

function getUser(): string {
  return process.env.APP_USER ?? "admin";
}

function getPassword(): string {
  return process.env.APP_PASSWORD ?? "ecka2026";
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toHex(signature);
}

/** Comprueba las credenciales del formulario de login contra las variables de entorno. */
export function credentialsValid(user: string, password: string): boolean {
  return user === getUser() && password === getPassword();
}

/** Genera el token de sesion que se guarda en la cookie. */
export async function createSessionToken(): Promise<string> {
  return hmac(`${getUser()}|hotel-ecka`);
}

/** Valida el token recibido en la cookie. */
export async function validateSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await createSessionToken();
  // Comparacion de longitud constante simple.
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
