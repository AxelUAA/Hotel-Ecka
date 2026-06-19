import { query, execute, RowDataPacket } from "./db";
import { Resource } from "./schema";

/** Resultado de error uniforme para las operaciones CRUD. */
export type CrudError = { error: { status: number; message: string } };
export type CreateResult = { insertId: number } | CrudError;
export type MutateResult = { affectedRows: number } | CrudError;

/** Convierte un error de MySQL en un mensaje claro en espaniol. */
export function describeDbError(err: unknown): { status: number; message: string } {
  const e = err as { code?: string; errno?: number; sqlMessage?: string };
  switch (e?.code) {
    case "ER_DUP_ENTRY":
      return { status: 409, message: "Ya existe un registro con ese valor unico (por ejemplo, el correo o la llave ya esta en uso)." };
    case "ER_CHECK_CONSTRAINT_VIOLATED":
      return { status: 422, message: "Un valor no cumple una restriccion CHECK (revisa estado, metodo de pago, montos >= 0 o que la fecha de salida sea posterior a la de entrada)." };
    case "ER_NO_REFERENCED_ROW":
    case "ER_NO_REFERENCED_ROW_2":
      return { status: 422, message: "La referencia indicada (llave foranea) no existe. Selecciona un registro valido." };
    case "ER_ROW_IS_REFERENCED":
    case "ER_ROW_IS_REFERENCED_2":
      return { status: 409, message: "No se puede eliminar: hay registros relacionados que dependen de este." };
    case "ER_BAD_NULL_ERROR":
      return { status: 422, message: "Falta un campo obligatorio." };
    default:
      return { status: 500, message: e?.sqlMessage ?? "Error de base de datos." };
  }
}

/** Normaliza el valor de un campo: cadenas vacias opcionales -> NULL. */
function normalize(resource: Resource, name: string, raw: unknown): unknown {
  const field = resource.fields.find((f) => f.name === name);
  if (!field) return raw;
  if (raw === undefined || raw === null || raw === "") {
    return field.required ? raw : null;
  }
  if (field.type === "number" || field.type === "fk") {
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  if (field.type === "decimal") {
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  return raw;
}

/** Valida que los campos obligatorios vengan presentes. */
function missingRequired(resource: Resource, body: Record<string, unknown>): string | null {
  for (const f of resource.fields) {
    if (!f.required) continue;
    const v = body[f.name];
    if (v === undefined || v === null || v === "") return f.label;
  }
  return null;
}

/**
 * Lista todos los registros de un recurso, ordenados por su PK.
 *
 * Si el recurso define `listSelect`/`listFrom` (cláusulas de confianza fijadas
 * en schema.ts) se usan para enriquecer el listado con JOINs; de lo contrario
 * se construye el SELECT por defecto a partir de `listColumns`.
 */
export async function listRows(resource: Resource): Promise<RowDataPacket[]> {
  const cols =
    resource.listSelect ?? resource.listColumns.map((c) => `\`${c.name}\``).join(", ");
  const from = resource.listFrom ?? `\`${resource.table}\``;
  const orderBy = resource.listOrderBy ?? resource.pk.map((c) => `\`${c}\``).join(", ");
  return query<RowDataPacket[]>(`SELECT ${cols} FROM ${from} ORDER BY ${orderBy}`);
}

/** Inserta un nuevo registro. */
export async function createRow(
  resource: Resource,
  body: Record<string, unknown>
): Promise<CreateResult> {
  const missing = missingRequired(resource, body);
  if (missing) {
    return { error: { status: 422, message: `El campo "${missing}" es obligatorio.` } };
  }
  const names = resource.fields.map((f) => f.name);
  const cols = names.map((n) => `\`${n}\``).join(", ");
  const placeholders = names.map(() => "?").join(", ");
  const values = names.map((n) => normalize(resource, n, body[n]));
  try {
    const result = await execute(
      `INSERT INTO \`${resource.table}\` (${cols}) VALUES (${placeholders})`,
      values
    );
    return { insertId: result.insertId };
  } catch (err) {
    return { error: describeDbError(err) };
  }
}

/** Actualiza un registro identificado por su PK (recurso con PK simple). */
export async function updateRow(
  resource: Resource,
  pkValues: Record<string, unknown>,
  body: Record<string, unknown>
): Promise<MutateResult> {
  if (!resource.allowUpdate) {
    return { error: { status: 405, message: "Este recurso no admite edicion." } };
  }
  const missing = missingRequired(resource, body);
  if (missing) {
    return { error: { status: 422, message: `El campo "${missing}" es obligatorio.` } };
  }
  const names = resource.fields.map((f) => f.name);
  const setClause = names.map((n) => `\`${n}\` = ?`).join(", ");
  const setValues = names.map((n) => normalize(resource, n, body[n]));
  const whereClause = resource.pk.map((c) => `\`${c}\` = ?`).join(" AND ");
  const whereValues = resource.pk.map((c) => pkValues[c]);
  try {
    const result = await execute(
      `UPDATE \`${resource.table}\` SET ${setClause} WHERE ${whereClause}`,
      [...setValues, ...whereValues]
    );
    return { affectedRows: result.affectedRows };
  } catch (err) {
    return { error: describeDbError(err) };
  }
}

/** Elimina un registro por su PK (simple o compuesta). */
export async function deleteRow(
  resource: Resource,
  pkValues: Record<string, unknown>
): Promise<MutateResult> {
  for (const c of resource.pk) {
    if (pkValues[c] === undefined || pkValues[c] === null || pkValues[c] === "") {
      return { error: { status: 400, message: `Falta la llave "${c}".` } };
    }
  }
  const whereClause = resource.pk.map((c) => `\`${c}\` = ?`).join(" AND ");
  const whereValues = resource.pk.map((c) => pkValues[c]);
  try {
    const result = await execute(
      `DELETE FROM \`${resource.table}\` WHERE ${whereClause}`,
      whereValues
    );
    return { affectedRows: result.affectedRows };
  } catch (err) {
    return { error: describeDbError(err) };
  }
}
