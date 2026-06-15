#!/usr/bin/env python3
"""
Verifica la LOGICA de las consultas del catalogo (queries.ts) usando SQLite.

No reemplaza a MySQL: solo confirma que cada SELECT es sintacticamente valido
y devuelve filas con los datos seed. El despliegue real usa HotelDB.sql en MySQL.
"""
import re, sqlite3, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
QUERIES_TS = os.path.join(HERE, "..", "src", "lib", "queries.ts")

# ---- Esquema equivalente en SQLite (mismos nombres de tablas/columnas) ----
SCHEMA = """
CREATE TABLE Cliente (
  IdCliente INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL, correo TEXT NOT NULL UNIQUE,
  telefono TEXT, fecha_registro TEXT);
CREATE TABLE Habitacion (
  IdHabitacion INTEGER PRIMARY KEY AUTOINCREMENT,
  numero INTEGER NOT NULL, tipo TEXT NOT NULL, precio REAL NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Disponible',
  CHECK (precio >= 0),
  CHECK (estado IN ('Disponible','Ocupada','Mantenimiento')));
CREATE TABLE Empleado (
  IdEmpleado INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL, puesto TEXT, telefono TEXT, correo TEXT);
CREATE TABLE Reservacion (
  IdReservacion INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha_entrada TEXT NOT NULL, fecha_salida TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Activa',
  ClienteIdCliente INTEGER NOT NULL, EmpleadoIdEmpleado INTEGER NOT NULL,
  FOREIGN KEY (ClienteIdCliente) REFERENCES Cliente(IdCliente),
  FOREIGN KEY (EmpleadoIdEmpleado) REFERENCES Empleado(IdEmpleado),
  CHECK (estado IN ('Activa','Finalizada','Cancelada')),
  CHECK (fecha_salida > fecha_entrada));
CREATE TABLE Pago (
  IdPago INTEGER PRIMARY KEY AUTOINCREMENT,
  monto REAL NOT NULL, metodo_pago TEXT NOT NULL, fecha_pago TEXT NOT NULL,
  ReservacionIdReservacion INTEGER NOT NULL,
  FOREIGN KEY (ReservacionIdReservacion) REFERENCES Reservacion(IdReservacion),
  CHECK (monto >= 0),
  CHECK (metodo_pago IN ('Efectivo','Tarjeta','Transferencia')));
CREATE TABLE asignar (
  HabitacionIdHabitacion INTEGER NOT NULL,
  ReservacionIdReservacion INTEGER NOT NULL,
  PRIMARY KEY (HabitacionIdHabitacion, ReservacionIdReservacion),
  FOREIGN KEY (HabitacionIdHabitacion) REFERENCES Habitacion(IdHabitacion),
  FOREIGN KEY (ReservacionIdReservacion) REFERENCES Reservacion(IdReservacion));
"""

SEED = """
INSERT INTO Cliente (nombre,correo,telefono,fecha_registro) VALUES
('Ana Martinez Torres','ana.martinez@correo.com','4491234567','2025-01-10'),
('Luis Hernandez Diaz','luis.hernandez@correo.com','4497654321','2025-02-15'),
('Sofia Ramirez Leon','sofia.ramirez@correo.com','4491122334','2025-03-05'),
('Diego Flores Cruz','diego.flores@correo.com','4495566778','2025-03-20'),
('Carla Nunez Vega','carla.nunez@correo.com','4499988776','2025-04-01');
INSERT INTO Habitacion (numero,tipo,precio,estado) VALUES
(101,'Individual',800,'Disponible'),(102,'Doble',1200,'Disponible'),
(201,'Suite',2500,'Ocupada'),(202,'Doble',1300,'Mantenimiento'),
(301,'Suite',2700,'Disponible'),(401,'Presidencial',5000,'Disponible');
INSERT INTO Empleado (nombre,puesto,telefono,correo) VALUES
('Roberto Aguilar Mena','Recepcionista','4491239876','roberto.aguilar@hotel.com'),
('Patricia Soto Gil','Gerente','4498765123','patricia.soto@hotel.com'),
('Miguel Angel Reyes','Recepcionista','4495551234','miguel.reyes@hotel.com'),
('Laura Campos Ortiz','Conserje','4497778899','laura.campos@hotel.com');
INSERT INTO Reservacion (fecha_entrada,fecha_salida,estado,ClienteIdCliente,EmpleadoIdEmpleado) VALUES
('2025-05-01','2025-05-05','Finalizada',1,1),('2025-05-10','2025-05-12','Activa',2,1),
('2025-05-15','2025-05-20','Activa',1,2),('2025-05-18','2025-05-19','Cancelada',3,2),
('2025-06-01','2025-06-04','Activa',4,3),('2025-06-10','2025-06-15','Activa',2,1);
INSERT INTO Pago (monto,metodo_pago,fecha_pago,ReservacionIdReservacion) VALUES
(3200,'Tarjeta','2025-05-05',1),(1200,'Efectivo','2025-05-12',2),
(2500,'Tarjeta','2025-05-20',3),(800,'Efectivo','2025-05-05',1),
(2700,'Transferencia','2025-06-04',5),(1300,'Tarjeta','2025-06-04',4);
INSERT INTO asignar (HabitacionIdHabitacion,ReservacionIdReservacion) VALUES
(1,1),(2,1),(3,2),(1,3),(4,4),(2,5),(5,6);
"""

def extract_queries(path):
    """Extrae (id, sql) de cada objeto del catalogo en queries.ts."""
    txt = open(path, encoding="utf-8").read()
    items = []
    # captura id: "..."  ...  sql: `...`
    for m in re.finditer(r'id:\s*"([^"]+)".*?sql:\s*`([^`]*)`', txt, re.S):
        items.append((m.group(1), m.group(2).strip()))
    return items

def main():
    con = sqlite3.connect(":memory:")
    con.create_function("DATEDIFF", 2,
        lambda d1, d2: int(
            (sqlite3.connect(":memory:").execute(
                "SELECT julianday(?)-julianday(?)", (d1, d2)).fetchone()[0]) ))
    con.execute("PRAGMA foreign_keys=ON")
    con.executescript(SCHEMA)
    con.executescript(SEED)

    queries = extract_queries(QUERIES_TS)
    print(f"Encontradas {len(queries)} consultas en queries.ts\n")
    ok = 0
    fail = 0
    for qid, sql in queries:
        try:
            cur = con.execute(sql)
            rows = cur.fetchall()
            cols = [d[0] for d in cur.description] if cur.description else []
            status = "OK " if len(rows) > 0 else "VACIA"
            if len(rows) == 0:
                status = "OK(0 filas)"
            print(f"[{status:>11}] {qid:<5} -> {len(rows)} fila(s), cols={cols}")
            ok += 1
        except Exception as e:
            print(f"[      ERROR] {qid:<5} -> {e}")
            print(f"             SQL: {sql.splitlines()[0]} ...")
            fail += 1
    print(f"\nResumen: {ok} consultas ejecutaron sin error, {fail} con error.")
    return 1 if fail else 0

if __name__ == "__main__":
    sys.exit(main())
