import { NextResponse } from "next/server";
import { credentialsValid, createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  let body: { user?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
  }

  const user = (body.user ?? "").trim();
  const password = body.password ?? "";

  if (!credentialsValid(user, password)) {
    return NextResponse.json({ error: "Usuario o contrasenia incorrectos." }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas
  });
  return res;
}
