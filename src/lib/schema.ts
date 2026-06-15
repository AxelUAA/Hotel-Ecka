/**
 * Definicion central de las entidades (tablas) del modelo.
 *
 * Tanto las API como la interfaz se generan a partir de esta configuracion.
 * Los nombres de tablas y columnas SOLO provienen de aqui (lista blanca), por
 * lo que nunca se interpola entrada del usuario como identificador SQL.
 */

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "decimal"
  | "date"
  | "select"
  | "fk";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  fkResource?: string;
  help?: string;
};

export type Resource = {
  key: string; // segmento de URL/API (ej. "clientes")
  table: string; // tabla SQL (ej. "Cliente")
  singular: string;
  plural: string;
  icon: string;
  accent: string; // color del badge/icono
  pk: string[];
  autoId: boolean; // PK autoincremental (surrogate)
  labelColumn: string; // columna para mostrar en relaciones
  allowUpdate: boolean;
  fields: Field[]; // campos editables
  listColumns: { name: string; label: string }[]; // columnas de la tabla
};

export const RESOURCES: Record<string, Resource> = {
  clientes: {
    key: "clientes",
    table: "Cliente",
    singular: "Cliente",
    plural: "Clientes",
    icon: "users",
    accent: "#7aa2f7",
    pk: ["IdCliente"],
    autoId: true,
    labelColumn: "nombre",
    allowUpdate: true,
    fields: [
      { name: "nombre", label: "Nombre completo", type: "text", required: true },
      { name: "correo", label: "Correo", type: "email", required: true, help: "Debe ser unico" },
      { name: "telefono", label: "Telefono", type: "tel" },
      { name: "fecha_registro", label: "Fecha de registro", type: "date" },
    ],
    listColumns: [
      { name: "IdCliente", label: "ID" },
      { name: "nombre", label: "Nombre" },
      { name: "correo", label: "Correo" },
      { name: "telefono", label: "Telefono" },
      { name: "fecha_registro", label: "Registro" },
    ],
  },

  habitaciones: {
    key: "habitaciones",
    table: "Habitacion",
    singular: "Habitacion",
    plural: "Habitaciones",
    icon: "bed",
    accent: "#9ece6a",
    pk: ["IdHabitacion"],
    autoId: true,
    labelColumn: "numero",
    allowUpdate: true,
    fields: [
      { name: "numero", label: "Numero", type: "number", required: true },
      {
        name: "tipo",
        label: "Tipo",
        type: "select",
        required: true,
        options: ["Individual", "Doble", "Suite", "Presidencial"],
      },
      { name: "precio", label: "Precio", type: "decimal", required: true, help: "Debe ser >= 0" },
      {
        name: "estado",
        label: "Estado",
        type: "select",
        required: true,
        options: ["Disponible", "Ocupada", "Mantenimiento"],
      },
    ],
    listColumns: [
      { name: "IdHabitacion", label: "ID" },
      { name: "numero", label: "Numero" },
      { name: "tipo", label: "Tipo" },
      { name: "precio", label: "Precio" },
      { name: "estado", label: "Estado" },
    ],
  },

  empleados: {
    key: "empleados",
    table: "Empleado",
    singular: "Empleado",
    plural: "Empleados",
    icon: "badge",
    accent: "#bb9af7",
    pk: ["IdEmpleado"],
    autoId: true,
    labelColumn: "nombre",
    allowUpdate: true,
    fields: [
      { name: "nombre", label: "Nombre completo", type: "text", required: true },
      { name: "puesto", label: "Puesto", type: "text" },
      { name: "telefono", label: "Telefono", type: "tel" },
      { name: "correo", label: "Correo", type: "email" },
    ],
    listColumns: [
      { name: "IdEmpleado", label: "ID" },
      { name: "nombre", label: "Nombre" },
      { name: "puesto", label: "Puesto" },
      { name: "telefono", label: "Telefono" },
      { name: "correo", label: "Correo" },
    ],
  },

  reservaciones: {
    key: "reservaciones",
    table: "Reservacion",
    singular: "Reservacion",
    plural: "Reservaciones",
    icon: "calendar",
    accent: "#e0af68",
    pk: ["IdReservacion"],
    autoId: true,
    labelColumn: "IdReservacion",
    allowUpdate: true,
    fields: [
      { name: "fecha_entrada", label: "Fecha de entrada", type: "date", required: true },
      {
        name: "fecha_salida",
        label: "Fecha de salida",
        type: "date",
        required: true,
        help: "Debe ser posterior a la entrada",
      },
      {
        name: "estado",
        label: "Estado",
        type: "select",
        required: true,
        options: ["Activa", "Finalizada", "Cancelada"],
      },
      { name: "ClienteIdCliente", label: "Cliente", type: "fk", required: true, fkResource: "clientes" },
      { name: "EmpleadoIdEmpleado", label: "Empleado", type: "fk", required: true, fkResource: "empleados" },
    ],
    listColumns: [
      { name: "IdReservacion", label: "ID" },
      { name: "fecha_entrada", label: "Entrada" },
      { name: "fecha_salida", label: "Salida" },
      { name: "estado", label: "Estado" },
      { name: "ClienteIdCliente", label: "Cliente" },
      { name: "EmpleadoIdEmpleado", label: "Empleado" },
    ],
  },

  pagos: {
    key: "pagos",
    table: "Pago",
    singular: "Pago",
    plural: "Pagos",
    icon: "card",
    accent: "#73daca",
    pk: ["IdPago"],
    autoId: true,
    labelColumn: "IdPago",
    allowUpdate: true,
    fields: [
      { name: "monto", label: "Monto", type: "decimal", required: true, help: "Debe ser >= 0" },
      {
        name: "metodo_pago",
        label: "Metodo de pago",
        type: "select",
        required: true,
        options: ["Efectivo", "Tarjeta", "Transferencia"],
      },
      { name: "fecha_pago", label: "Fecha de pago", type: "date", required: true },
      {
        name: "ReservacionIdReservacion",
        label: "Reservacion",
        type: "fk",
        required: true,
        fkResource: "reservaciones",
      },
    ],
    listColumns: [
      { name: "IdPago", label: "ID" },
      { name: "monto", label: "Monto" },
      { name: "metodo_pago", label: "Metodo" },
      { name: "fecha_pago", label: "Fecha" },
      { name: "ReservacionIdReservacion", label: "Reservacion" },
    ],
  },

  asignaciones: {
    key: "asignaciones",
    table: "asignar",
    singular: "Asignacion",
    plural: "Asignaciones",
    icon: "link",
    accent: "#f7768e",
    pk: ["HabitacionIdHabitacion", "ReservacionIdReservacion"],
    autoId: false,
    labelColumn: "HabitacionIdHabitacion",
    allowUpdate: false, // PK compuesta: solo alta y baja
    fields: [
      {
        name: "HabitacionIdHabitacion",
        label: "Habitacion",
        type: "fk",
        required: true,
        fkResource: "habitaciones",
      },
      {
        name: "ReservacionIdReservacion",
        label: "Reservacion",
        type: "fk",
        required: true,
        fkResource: "reservaciones",
      },
    ],
    listColumns: [
      { name: "HabitacionIdHabitacion", label: "Habitacion" },
      { name: "ReservacionIdReservacion", label: "Reservacion" },
    ],
  },
};

export function getResource(key: string): Resource | undefined {
  return RESOURCES[key];
}

/** Devuelve la lista de columnas validas (lista blanca) de un recurso. */
export function validColumns(resource: Resource): Set<string> {
  return new Set(resource.fields.map((f) => f.name));
}
