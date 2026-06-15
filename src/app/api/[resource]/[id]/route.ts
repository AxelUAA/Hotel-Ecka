import { NextResponse } from "next/server";
import { getResource } from "@/lib/schema";
import { updateRow, deleteRow } from "@/lib/crud";
import { isAuthenticated } from "@/lib/session";

type Ctx = { params: { resource: string; id: string } };

/** Construye los valores de PK simple a partir del segmento [id]. */
function singlePk(resource: ReturnType<typeof getResource>, id: string) {
  if (!resource || resource.pk.length !== 1) return null;
  return { [resource.pk[0]]: id };
}

export async function PUT(req: Request, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const resource = getResource(params.resource);
  if (!resource) return NextResponse.json({ error: "Recurso no encontrado." }, { status: 404 });

  const pkValues = singlePk(resource, params.id);
  if (!pkValues) {
    return NextResponse.json({ error: "Este recurso no admite edicion por ID." }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await updateRow(resource, pkValues, body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error.message }, { status: result.error.status });
  }
  return NextResponse.json({ ok: true, affectedRows: result.affectedRows });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const resource = getResource(params.resource);
  if (!resource) return NextResponse.json({ error: "Recurso no encontrado." }, { status: 404 });

  const pkValues = singlePk(resource, params.id);
  if (!pkValues) {
    return NextResponse.json({ error: "Usa la coleccion para eliminar este recurso." }, { status: 400 });
  }

  const result = await deleteRow(resource, pkValues);
  if ("error" in result) {
    return NextResponse.json({ error: result.error.message }, { status: result.error.status });
  }
  return NextResponse.json({ ok: true, affectedRows: result.affectedRows });
}
