import { NextResponse } from "next/server";
import { getResource } from "@/lib/schema";
import { listRows, createRow, deleteRow } from "@/lib/crud";
import { isAuthenticated } from "@/lib/session";

type Ctx = { params: { resource: string } };

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const resource = getResource(params.resource);
  if (!resource) return NextResponse.json({ error: "Recurso no encontrado." }, { status: 404 });

  try {
    const rows = await listRows(resource);
    return NextResponse.json({ data: rows });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Error al listar." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const resource = getResource(params.resource);
  if (!resource) return NextResponse.json({ error: "Recurso no encontrado." }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await createRow(resource, body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error.message }, { status: result.error.status });
  }
  return NextResponse.json({ ok: true, insertId: result.insertId }, { status: 201 });
}

/**
 * DELETE en la coleccion: se usa para recursos con PK compuesta (asignar),
 * donde la llave se envia en el cuerpo de la peticion.
 */
export async function DELETE(req: Request, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const resource = getResource(params.resource);
  if (!resource) return NextResponse.json({ error: "Recurso no encontrado." }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const pkValues: Record<string, unknown> = {};
  for (const c of resource.pk) pkValues[c] = body[c];

  const result = await deleteRow(resource, pkValues);
  if ("error" in result) {
    return NextResponse.json({ error: result.error.message }, { status: result.error.status });
  }
  return NextResponse.json({ ok: true, affectedRows: result.affectedRows });
}
