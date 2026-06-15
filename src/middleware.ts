import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken, SESSION_COOKIE } from "@/lib/auth";

/**
 * Middleware de autenticación — Edge Runtime.
 *
 * Protege TODAS las rutas excepto las públicas (/login, endpoints de auth,
 * archivos estáticos). Si la cookie de sesión no existe o es inválida:
 *   • Peticiones de navegador → redirige a /login
 *   • Peticiones API          → responde 401 JSON
 */

/** Rutas que no requieren autenticación. */
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isApiRequest(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Rutas públicas: continuar sin verificar ──
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // ── Verificar cookie de sesión ──
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = await validateSessionToken(token);

  if (valid) {
    return NextResponse.next();
  }

  // ── Sesión inválida o ausente ──
  if (isApiRequest(pathname)) {
    return NextResponse.json(
      { error: "No autenticado. Inicie sesión para continuar." },
      { status: 401 }
    );
  }

  // Redirigir al login conservando la URL original como parámetro "from"
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * Matcher: ejecutar el middleware en todas las rutas excepto archivos
 * estáticos internos de Next.js y recursos públicos comunes.
 */
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas EXCEPTO:
     *  - _next/static  (archivos estáticos de Next.js)
     *  - _next/image   (optimización de imágenes)
     *  - favicon.ico    (ícono del sitio)
     *  - Archivos con extensión en public/ (imágenes, fuentes, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)).*)",
  ],
};
