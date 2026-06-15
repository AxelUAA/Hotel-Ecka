import { NextResponse } from "next/server";
import { getPool, RowDataPacket } from "@/lib/db";
import { findConsulta } from "@/lib/queries";
import { isAuthenticated } from "@/lib/session";

/**
 * Ejecuta UNA consulta del catalogo, identificada por su id.
 * Nunca se ejecuta SQL arbitrario enviado por el cliente: solo consultas
 * predefinidas y de solo lectura del Entregable III.
 */
export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id") ?? "";
  const consulta = findConsulta(id);
  if (!consulta) {
    return NextResponse.json({ error: "Consulta no encontrada." }, { status: 404 });
  }

  try {
    const [rows, fields] = await getPool().query<RowDataPacket[]>(consulta.sql);
    const columns = (fields ?? []).map((f) => f.name);
    return NextResponse.json({
      id: consulta.id,
      titulo: consulta.titulo,
      sql: consulta.sql,
      columns,
      rows,
      total: rows.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as { sqlMessage?: string }).sqlMessage ?? "Error al ejecutar la consulta." },
      { status: 500 }
    );
  }
}
