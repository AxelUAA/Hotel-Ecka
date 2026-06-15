/**
 * Catalogo de consultas del Entregable III.
 *
 * Contiene las 20 consultas oficiales del script.sql, agrupadas en sus cuatro
 * categorias (sencillas, agrupadas, HAVING y multitabla), mas un grupo de
 * consultas "extra" utiles para la operacion del hotel.
 *
 * Cada consulta es de solo lectura (SELECT) y se ejecuta tal cual contra la
 * base de datos HotelDB.
 */

export type ConsultaItem = {
  id: string;
  titulo: string;
  descripcion: string;
  sql: string;
};

export type ConsultaCategoria = {
  clave: string;
  nombre: string;
  resumen: string;
  consultas: ConsultaItem[];
};

export const CATALOGO_CONSULTAS: ConsultaCategoria[] = [
  {
    clave: "sencillas",
    nombre: "a) Consultas sencillas",
    resumen: "SELECT con WHERE sobre una sola tabla.",
    consultas: [
      {
        id: "s1",
        titulo: "Nombre y correo de todos los clientes",
        descripcion: "Proyeccion simple de dos columnas de la tabla Cliente.",
        sql: `SELECT nombre, correo
FROM Cliente;`,
      },
      {
        id: "s2",
        titulo: "Habitaciones que estan disponibles",
        descripcion: "Filtra las habitaciones por estado = 'Disponible'.",
        sql: `SELECT IdHabitacion, numero, tipo, precio
FROM Habitacion
WHERE estado = 'Disponible';`,
      },
      {
        id: "s3",
        titulo: "Reservaciones que siguen activas",
        descripcion: "Filtra las reservaciones con estado = 'Activa'.",
        sql: `SELECT IdReservacion, fecha_entrada, fecha_salida, estado
FROM Reservacion
WHERE estado = 'Activa';`,
      },
      {
        id: "s4",
        titulo: "Pagos realizados con tarjeta",
        descripcion: "Filtra los pagos por metodo_pago = 'Tarjeta'.",
        sql: `SELECT IdPago, monto, fecha_pago
FROM Pago
WHERE metodo_pago = 'Tarjeta';`,
      },
      {
        id: "s5",
        titulo: "Habitaciones con precio mayor a 1000",
        descripcion: "Filtra las habitaciones por precio > 1000.",
        sql: `SELECT numero, tipo, precio
FROM Habitacion
WHERE precio > 1000;`,
      },
    ],
  },
  {
    clave: "agrupadas",
    nombre: "b) Consultas con campos agrupados",
    resumen: "GROUP BY con funciones de agregacion (COUNT, SUM, AVG).",
    consultas: [
      {
        id: "g1",
        titulo: "Total de reservaciones por cliente",
        descripcion: "LEFT JOIN para incluir tambien a los clientes sin reservaciones.",
        sql: `SELECT c.nombre, COUNT(r.IdReservacion) AS Total_Reservaciones
FROM Cliente c
LEFT JOIN Reservacion r ON r.ClienteIdCliente = c.IdCliente
GROUP BY c.IdCliente, c.nombre;`,
      },
      {
        id: "g2",
        titulo: "Monto total pagado por cada reservacion",
        descripcion: "Suma de los pagos agrupada por reservacion.",
        sql: `SELECT r.IdReservacion, SUM(p.monto) AS Total_Pagado
FROM Reservacion r
JOIN Pago p ON p.ReservacionIdReservacion = r.IdReservacion
GROUP BY r.IdReservacion;`,
      },
      {
        id: "g3",
        titulo: "Reservaciones gestionadas por cada empleado",
        descripcion: "LEFT JOIN para incluir empleados sin reservaciones gestionadas.",
        sql: `SELECT e.nombre, COUNT(r.IdReservacion) AS Total_Gestionadas
FROM Empleado e
LEFT JOIN Reservacion r ON r.EmpleadoIdEmpleado = e.IdEmpleado
GROUP BY e.IdEmpleado, e.nombre;`,
      },
      {
        id: "g4",
        titulo: "Cantidad de habitaciones por tipo",
        descripcion: "Conteo de habitaciones agrupado por tipo.",
        sql: `SELECT tipo, COUNT(*) AS Total_Habitaciones
FROM Habitacion
GROUP BY tipo;`,
      },
      {
        id: "g5",
        titulo: "Precio promedio de habitacion por tipo",
        descripcion: "Promedio de precio redondeado a 2 decimales por tipo.",
        sql: `SELECT tipo, ROUND(AVG(precio), 2) AS Precio_Promedio
FROM Habitacion
GROUP BY tipo;`,
      },
    ],
  },
  {
    clave: "having",
    nombre: "c) Consultas con HAVING",
    resumen: "Filtrado sobre grupos despues de agregar.",
    consultas: [
      {
        id: "h1",
        titulo: "Clientes con mas de 1 reservacion",
        descripcion: "GROUP BY + HAVING sobre el conteo de reservaciones.",
        sql: `SELECT c.nombre, COUNT(r.IdReservacion) AS Total_Reservaciones
FROM Cliente c
JOIN Reservacion r ON r.ClienteIdCliente = c.IdCliente
GROUP BY c.IdCliente, c.nombre
HAVING Total_Reservaciones > 1;`,
      },
      {
        id: "h2",
        titulo: "Reservaciones con pago total superior a 3000",
        descripcion: "HAVING sobre la suma de los pagos por reservacion.",
        sql: `SELECT r.IdReservacion, SUM(p.monto) AS Total_Pagado
FROM Reservacion r
JOIN Pago p ON p.ReservacionIdReservacion = r.IdReservacion
GROUP BY r.IdReservacion
HAVING Total_Pagado > 3000;`,
      },
      {
        id: "h3",
        titulo: "Tipos de habitacion con precio promedio mayor a 1500",
        descripcion: "HAVING sobre el promedio de precio por tipo.",
        sql: `SELECT tipo, ROUND(AVG(precio), 2) AS Precio_Promedio
FROM Habitacion
GROUP BY tipo
HAVING Precio_Promedio > 1500;`,
      },
      {
        id: "h4",
        titulo: "Empleados que gestionan mas de 1 reservacion",
        descripcion: "HAVING sobre el conteo de reservaciones gestionadas.",
        sql: `SELECT e.nombre, COUNT(r.IdReservacion) AS Total_Gestionadas
FROM Empleado e
JOIN Reservacion r ON r.EmpleadoIdEmpleado = e.IdEmpleado
GROUP BY e.IdEmpleado, e.nombre
HAVING Total_Gestionadas > 1;`,
      },
      {
        id: "h5",
        titulo: "Metodos de pago utilizados mas de una vez",
        descripcion: "HAVING sobre el conteo de cada metodo de pago.",
        sql: `SELECT metodo_pago, COUNT(*) AS Veces_Utilizado
FROM Pago
GROUP BY metodo_pago
HAVING Veces_Utilizado > 1;`,
      },
    ],
  },
  {
    clave: "multitabla",
    nombre: "d) Consultas multitabla",
    resumen: "JOIN entre varias tablas del modelo.",
    consultas: [
      {
        id: "m1",
        titulo: "Cada cliente con los datos de su reservacion",
        descripcion: "JOIN Cliente - Reservacion ordenado por nombre.",
        sql: `SELECT c.nombre, r.fecha_entrada, r.fecha_salida, r.estado
FROM Cliente c
JOIN Reservacion r ON r.ClienteIdCliente = c.IdCliente
ORDER BY c.nombre;`,
      },
      {
        id: "m2",
        titulo: "Detalle de reservacion con cliente y empleado",
        descripcion: "JOIN de Reservacion con Cliente y Empleado.",
        sql: `SELECT r.IdReservacion, c.nombre AS Cliente, e.nombre AS Empleado, r.estado
FROM Reservacion r
JOIN Cliente c  ON c.IdCliente  = r.ClienteIdCliente
JOIN Empleado e ON e.IdEmpleado = r.EmpleadoIdEmpleado;`,
      },
      {
        id: "m3",
        titulo: "Pagos junto con el cliente que los realizo",
        descripcion: "JOIN Pago - Reservacion - Cliente.",
        sql: `SELECT p.IdPago, c.nombre AS Cliente, p.monto, p.metodo_pago
FROM Pago p
JOIN Reservacion r ON r.IdReservacion = p.ReservacionIdReservacion
JOIN Cliente c     ON c.IdCliente     = r.ClienteIdCliente;`,
      },
      {
        id: "m4",
        titulo: "Habitaciones asignadas a cada reservacion con su cliente",
        descripcion: "JOIN de la tabla puente asignar con Habitacion, Reservacion y Cliente.",
        sql: `SELECT r.IdReservacion, c.nombre AS Cliente, h.numero AS Habitacion, h.tipo
FROM asignar a
JOIN Habitacion h  ON h.IdHabitacion  = a.HabitacionIdHabitacion
JOIN Reservacion r ON r.IdReservacion = a.ReservacionIdReservacion
JOIN Cliente c     ON c.IdCliente     = r.ClienteIdCliente
ORDER BY r.IdReservacion;`,
      },
      {
        id: "m5",
        titulo: "Vision completa: reservacion, cliente, empleado, habitacion y pago",
        descripcion: "JOIN de las cinco entidades y la relacion asignar.",
        sql: `SELECT r.IdReservacion,
       c.nombre AS Cliente,
       e.nombre AS Empleado,
       h.numero AS Habitacion,
       p.monto,
       p.metodo_pago
FROM Reservacion r
JOIN Cliente c    ON c.IdCliente   = r.ClienteIdCliente
JOIN Empleado e   ON e.IdEmpleado  = r.EmpleadoIdEmpleado
JOIN asignar a    ON a.ReservacionIdReservacion = r.IdReservacion
JOIN Habitacion h ON h.IdHabitacion = a.HabitacionIdHabitacion
JOIN Pago p       ON p.ReservacionIdReservacion = r.IdReservacion
ORDER BY r.IdReservacion;`,
      },
    ],
  },
  {
    clave: "extra",
    nombre: "e) Consultas extra de operacion",
    resumen: "Consultas adicionales utiles para la gestion diaria del hotel.",
    consultas: [
      {
        id: "x1",
        titulo: "Ingresos totales por metodo de pago",
        descripcion: "Suma de montos agrupada por metodo de pago, de mayor a menor.",
        sql: `SELECT metodo_pago, COUNT(*) AS Num_Pagos, SUM(monto) AS Ingreso_Total
FROM Pago
GROUP BY metodo_pago
ORDER BY Ingreso_Total DESC;`,
      },
      {
        id: "x2",
        titulo: "Cliente que mas ha gastado",
        descripcion: "Top de clientes por monto total pagado.",
        sql: `SELECT c.nombre AS Cliente, SUM(p.monto) AS Total_Gastado
FROM Cliente c
JOIN Reservacion r ON r.ClienteIdCliente = c.IdCliente
JOIN Pago p        ON p.ReservacionIdReservacion = r.IdReservacion
GROUP BY c.IdCliente, c.nombre
ORDER BY Total_Gastado DESC;`,
      },
      {
        id: "x3",
        titulo: "Ocupacion de habitaciones por estado",
        descripcion: "Conteo de habitaciones segun su estado actual.",
        sql: `SELECT estado, COUNT(*) AS Total
FROM Habitacion
GROUP BY estado;`,
      },
      {
        id: "x4",
        titulo: "Reservaciones activas con cliente y habitacion asignada",
        descripcion: "Cruce de reservaciones activas con su cliente y habitacion.",
        sql: `SELECT r.IdReservacion, c.nombre AS Cliente, h.numero AS Habitacion,
       r.fecha_entrada, r.fecha_salida
FROM Reservacion r
JOIN Cliente c     ON c.IdCliente = r.ClienteIdCliente
JOIN asignar a     ON a.ReservacionIdReservacion = r.IdReservacion
JOIN Habitacion h  ON h.IdHabitacion = a.HabitacionIdHabitacion
WHERE r.estado = 'Activa'
ORDER BY r.fecha_entrada;`,
      },
      {
        id: "x5",
        titulo: "Noches reservadas por cliente",
        descripcion: "Suma de noches (DATEDIFF) por cliente.",
        sql: `SELECT c.nombre AS Cliente,
       SUM(DATEDIFF(r.fecha_salida, r.fecha_entrada)) AS Total_Noches
FROM Cliente c
JOIN Reservacion r ON r.ClienteIdCliente = c.IdCliente
GROUP BY c.IdCliente, c.nombre
ORDER BY Total_Noches DESC;`,
      },
    ],
  },
];

export function findConsulta(id: string): ConsultaItem | undefined {
  for (const cat of CATALOGO_CONSULTAS) {
    const found = cat.consultas.find((c) => c.id === id);
    if (found) return found;
  }
  return undefined;
}
