import mysql, { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";

/**
 * Pool de conexiones MySQL (Railway) reutilizable.
 *
 * En entornos serverless (Vercel) cada invocacion puede reutilizar el mismo
 * proceso, por lo que guardamos el pool en `globalThis` para no abrir una
 * conexion nueva en cada request y agotar el limite del servidor.
 */

declare global {
  // eslint-disable-next-line no-var
  var __hotelEckaPool: Pool | undefined;
}

function buildPool(): Pool {
  const url = process.env.DATABASE_URL;

  if (url) {
    return mysql.createPool(url);
  }

  return mysql.createPool({
    host: process.env.MYSQL_HOST ?? "localhost",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "HotelDB",
    waitForConnections: true,
    connectionLimit: 5,
    namedPlaceholders: true,
  });
}

export function getPool(): Pool {
  if (!global.__hotelEckaPool) {
    global.__hotelEckaPool = buildPool();
  }
  return global.__hotelEckaPool;
}

/** Ejecuta una consulta SELECT y devuelve las filas. */
export async function query<T extends RowDataPacket[]>(
  sql: string,
  params: any[] = []
): Promise<T> {
  const [rows] = await getPool().execute<T>(sql, params);
  return rows;
}

/** Ejecuta INSERT/UPDATE/DELETE y devuelve el resultado (insertId, affectedRows). */
export async function execute(
  sql: string,
  params: any[] = []
): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params);
  return result;
}

export type { RowDataPacket, ResultSetHeader };
