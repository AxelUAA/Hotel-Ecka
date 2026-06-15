import { NextResponse } from "next/server";
import { query, RowDataPacket } from "@/lib/db";
import { isAuthenticated } from "@/lib/session";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const [counts] = await query<RowDataPacket[]>(`
      SELECT
        (SELECT COUNT(*) FROM Cliente)     AS clientes,
        (SELECT COUNT(*) FROM Habitacion)  AS habitaciones,
        (SELECT COUNT(*) FROM Empleado)    AS empleados,
        (SELECT COUNT(*) FROM Reservacion) AS reservaciones,
        (SELECT COUNT(*) FROM Pago)        AS pagos,
        (SELECT COALESCE(SUM(monto),0) FROM Pago) AS ingresos
    `);

    const habitacionesEstado = await query<RowDataPacket[]>(
      `SELECT estado, COUNT(*) AS total FROM Habitacion GROUP BY estado`
    );
    const reservacionesEstado = await query<RowDataPacket[]>(
      `SELECT estado, COUNT(*) AS total FROM Reservacion GROUP BY estado`
    );
    const ingresosMetodo = await query<RowDataPacket[]>(
      `SELECT metodo_pago, SUM(monto) AS total FROM Pago GROUP BY metodo_pago ORDER BY total DESC`
    );
    const topClientes = await query<RowDataPacket[]>(
      `SELECT c.nombre AS cliente, COALESCE(SUM(p.monto),0) AS total
       FROM Cliente c
       LEFT JOIN Reservacion r ON r.ClienteIdCliente = c.IdCliente
       LEFT JOIN Pago p ON p.ReservacionIdReservacion = r.IdReservacion
       GROUP BY c.IdCliente, c.nombre
       ORDER BY total DESC
       LIMIT 5`
    );

    return NextResponse.json({
      counts: counts ?? {},
      habitacionesEstado,
      reservacionesEstado,
      ingresosMetodo,
      topClientes,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as { sqlMessage?: string }).sqlMessage ?? "Error al cargar el dashboard." },
      { status: 500 }
    );
  }
}
