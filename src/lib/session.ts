import { cookies } from "next/headers";
import { SESSION_COOKIE, validateSessionToken } from "./auth";

/** Indica si la peticion actual tiene una sesion valida (uso en server). */
export async function isAuthenticated(): Promise<boolean> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return validateSessionToken(token);
}
