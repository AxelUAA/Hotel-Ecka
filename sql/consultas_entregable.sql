-- =====================================================================
--  PROYECTO FINAL - BASE DE DATOS - ENTREGA 3
--  Sistema de gestion de Hotel
--  Motor: MySQL / MariaDB (XAMPP)
--
--  Estructura del archivo (igual al orden del entregable):
--    1. Crear la estructura del modelo relacional en SQL
--    2. Altas (A), Bajas (B) y Cambios (C) por tabla
--    3. Consultas:  a) sencillas  b) agrupadas  c) HAVING  d) multitabla
--
-- =====================================================================


-- ============================================================
-- 1. CREAR LA ESTRUCTURA DEL MODELO RELACIONAL EN SQL
-- ============================================================

-- I. Crear y seleccionar la base de datos
CREATE DATABASE IF NOT EXISTS HotelDB;
USE HotelDB;

-- (Opcional) Para volver a ejecutar el script desde cero sin errores,
-- descomenta la siguiente linea. Borra el orden inverso por las llaves foraneas.
-- DROP TABLE IF EXISTS asignar, Pago, Reservacion, Empleado, Habitacion, Cliente;


-- II. Tabla Cliente
-- Almacena la informacion de los clientes del hotel. IdCliente es la llave
-- primaria y se genera automaticamente. El correo es UNIQUE (no se repite);
-- telefono y fecha_registro pueden quedar vacios (NULL).
CREATE TABLE Cliente (
    IdCliente      TINYINT(3)   NOT NULL AUTO_INCREMENT,
    nombre         VARCHAR(100) NOT NULL,
    correo         VARCHAR(100) NOT NULL UNIQUE,
    telefono       VARCHAR(15),
    fecha_registro DATE,
    PRIMARY KEY (IdCliente)
);


-- III. Tabla Habitacion
-- Almacena las habitaciones del hotel. Se aplican dos CHECK: el precio no puede
-- ser negativo y el estado solo acepta 'Disponible', 'Ocupada' o 'Mantenimiento'.
CREATE TABLE Habitacion (
    IdHabitacion TINYINT(3)    NOT NULL AUTO_INCREMENT,
    numero       INT           NOT NULL,
    tipo         VARCHAR(50)   NOT NULL,
    precio       DECIMAL(10,2) NOT NULL,
    estado       VARCHAR(30)   NOT NULL DEFAULT 'Disponible',
    PRIMARY KEY (IdHabitacion),
    CONSTRAINT chk_hab_precio CHECK (precio >= 0),
    CONSTRAINT chk_hab_estado CHECK (estado IN ('Disponible','Ocupada','Mantenimiento'))
);


-- IV. Tabla Empleado
-- Almacena a los empleados que gestionan las reservaciones. Solo el nombre es
-- obligatorio; puesto, telefono y correo pueden quedar vacios (NULL).
CREATE TABLE Empleado (
    IdEmpleado TINYINT(3)   NOT NULL AUTO_INCREMENT,
    nombre     VARCHAR(100) NOT NULL,
    puesto     VARCHAR(50),
    telefono   VARCHAR(15),
    correo     VARCHAR(100),
    PRIMARY KEY (IdEmpleado)
);


-- V. Tabla Reservacion
-- Tabla central del modelo. Contiene dos llaves foraneas: ClienteIdCliente
-- (quien realiza la reservacion) y EmpleadoIdEmpleado (quien la gestiona).
-- CHECK: estado controlado y fecha_salida siempre posterior a fecha_entrada.
CREATE TABLE Reservacion (
    IdReservacion      TINYINT(3)  NOT NULL AUTO_INCREMENT,
    fecha_entrada      DATE        NOT NULL,
    fecha_salida       DATE        NOT NULL,
    estado             VARCHAR(30) NOT NULL DEFAULT 'Activa',
    ClienteIdCliente   TINYINT(3)  NOT NULL,
    EmpleadoIdEmpleado TINYINT(3)  NOT NULL,
    PRIMARY KEY (IdReservacion),
    FOREIGN KEY (ClienteIdCliente) REFERENCES Cliente(IdCliente)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (EmpleadoIdEmpleado) REFERENCES Empleado(IdEmpleado)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_res_estado CHECK (estado IN ('Activa','Finalizada','Cancelada')),
    CONSTRAINT chk_res_fechas CHECK (fecha_salida > fecha_entrada)
);


-- VI. Tabla Pago
-- Almacena los pagos generados por cada reservacion. ReservacionIdReservacion
-- es la llave foranea. CHECK: monto no negativo y metodo de pago controlado.
CREATE TABLE Pago (
    IdPago                   TINYINT(3)    NOT NULL AUTO_INCREMENT,
    monto                    DECIMAL(10,2) NOT NULL,
    metodo_pago              VARCHAR(30)   NOT NULL,
    fecha_pago               DATE          NOT NULL,
    ReservacionIdReservacion TINYINT(3)    NOT NULL,
    PRIMARY KEY (IdPago),
    FOREIGN KEY (ReservacionIdReservacion) REFERENCES Reservacion(IdReservacion)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_pago_monto  CHECK (monto >= 0),
    CONSTRAINT chk_pago_metodo CHECK (metodo_pago IN ('Efectivo','Tarjeta','Transferencia'))
);


-- VII. Tabla asignar  (relacion muchos a muchos entre Habitacion y Reservacion)
-- Resuelve la relacion N:M: una reservacion puede ocupar varias habitaciones y
-- una habitacion puede aparecer en varias reservaciones. Su llave primaria es
-- compuesta por las dos llaves foraneas.
CREATE TABLE asignar (
    HabitacionIdHabitacion   TINYINT(3) NOT NULL,
    ReservacionIdReservacion TINYINT(3) NOT NULL,
    PRIMARY KEY (HabitacionIdHabitacion, ReservacionIdReservacion),
    FOREIGN KEY (HabitacionIdHabitacion) REFERENCES Habitacion(IdHabitacion)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ReservacionIdReservacion) REFERENCES Reservacion(IdReservacion)
        ON DELETE CASCADE ON UPDATE CASCADE
);


-- ============================================================
-- 2. ALTAS (A), BAJAS (B) Y CAMBIOS (C)
-- ============================================================
USE HotelDB;

-- -------------------- I. Cliente --------------------
-- A) Altas: se agregan 5 clientes con INSERT INTO.
INSERT INTO Cliente (nombre, correo, telefono, fecha_registro) VALUES
('Ana Martinez Torres', 'ana.martinez@correo.com', '4491234567', '2025-01-10'),
('Luis Hernandez Diaz', 'luis.hernandez@correo.com', '4497654321', '2025-02-15'),
('Sofia Ramirez Leon',  'sofia.ramirez@correo.com',  '4491122334', '2025-03-05'),
('Diego Flores Cruz',   'diego.flores@correo.com',   '4495566778', '2025-03-20'),
('Carla Nunez Vega',    'carla.nunez@correo.com',    '4499988776', '2025-04-01');
SELECT * FROM Cliente;                                  -- captura: ALTA

-- B) Baja: se elimina el cliente con Id = 5 usando DELETE FROM.
DELETE FROM Cliente WHERE IdCliente = 5;
SELECT * FROM Cliente;                                  -- captura: BAJA

-- C) Cambio: se actualiza el telefono del cliente con Id = 1 usando UPDATE.
UPDATE Cliente SET telefono = '4490000000' WHERE IdCliente = 1;
SELECT * FROM Cliente;                                  -- captura: CAMBIO


-- -------------------- II. Habitacion --------------------
-- A) Altas
INSERT INTO Habitacion (numero, tipo, precio, estado) VALUES
(101, 'Individual', 800.00,  'Disponible'),
(102, 'Doble',      1200.00, 'Disponible'),
(201, 'Suite',      2500.00, 'Ocupada'),
(202, 'Doble',      1300.00, 'Mantenimiento'),
(301, 'Suite',      2700.00, 'Disponible');
SELECT * FROM Habitacion;                               -- captura: ALTA

-- B) Baja
DELETE FROM Habitacion WHERE IdHabitacion = 5;
SELECT * FROM Habitacion;                               -- captura: BAJA

-- C) Cambio: se libera la habitacion 3 cambiando su estado a 'Disponible'.
UPDATE Habitacion SET estado = 'Disponible' WHERE IdHabitacion = 3;
SELECT * FROM Habitacion;                               -- captura: CAMBIO


-- -------------------- III. Empleado --------------------
-- A) Altas
INSERT INTO Empleado (nombre, puesto, telefono, correo) VALUES
('Roberto Aguilar Mena', 'Recepcionista', '4491239876', 'roberto.aguilar@hotel.com'),
('Patricia Soto Gil',    'Gerente',       '4498765123', 'patricia.soto@hotel.com'),
('Miguel Angel Reyes',   'Recepcionista', '4495551234', 'miguel.reyes@hotel.com'),
('Laura Campos Ortiz',   'Conserje',      '4497778899', 'laura.campos@hotel.com');
SELECT * FROM Empleado;                                 -- captura: ALTA

-- B) Baja
DELETE FROM Empleado WHERE IdEmpleado = 4;
SELECT * FROM Empleado;                                 -- captura: BAJA

-- C) Cambio: se promueve al empleado 1 cambiando su puesto.
UPDATE Empleado SET puesto = 'Subgerente' WHERE IdEmpleado = 1;
SELECT * FROM Empleado;                                 -- captura: CAMBIO


-- -------------------- IV. Reservacion --------------------
-- A) Altas (referencian a clientes 1-4 y empleados 1-3, que ya existen)
INSERT INTO Reservacion (fecha_entrada, fecha_salida, estado, ClienteIdCliente, EmpleadoIdEmpleado) VALUES
('2025-05-01', '2025-05-05', 'Activa',    1, 1),
('2025-05-10', '2025-05-12', 'Activa',    2, 1),
('2025-05-15', '2025-05-20', 'Activa',    1, 2),
('2025-05-18', '2025-05-19', 'Cancelada', 3, 2),
('2025-06-01', '2025-06-04', 'Activa',    4, 3),
('2025-06-10', '2025-06-15', 'Activa',    2, 1);
SELECT * FROM Reservacion;                              -- captura: ALTA

-- B) Baja
DELETE FROM Reservacion WHERE IdReservacion = 6;
SELECT * FROM Reservacion;                              -- captura: BAJA

-- C) Cambio: la reservacion 1 ya termino, se marca como 'Finalizada'.
UPDATE Reservacion SET estado = 'Finalizada' WHERE IdReservacion = 1;
SELECT * FROM Reservacion;                              -- captura: CAMBIO


-- -------------------- V. Pago --------------------
-- A) Altas (referencian a reservaciones 1-5)
INSERT INTO Pago (monto, metodo_pago, fecha_pago, ReservacionIdReservacion) VALUES
(3200.00, 'Tarjeta',       '2025-05-05', 1),
(1200.00, 'Efectivo',      '2025-05-12', 2),
(2500.00, 'Tarjeta',       '2025-05-20', 3),
(800.00,  'Efectivo',      '2025-05-05', 1),
(2700.00, 'Transferencia', '2025-06-04', 5),
(1300.00, 'Tarjeta',       '2025-06-04', 4);
SELECT * FROM Pago;                                     -- captura: ALTA

-- B) Baja
DELETE FROM Pago WHERE IdPago = 6;
SELECT * FROM Pago;                                     -- captura: BAJA

-- C) Cambio: se corrige el monto del pago 1.
UPDATE Pago SET monto = 3400.00 WHERE IdPago = 1;
SELECT * FROM Pago;                                     -- captura: CAMBIO


-- -------------------- VI. asignar --------------------
-- A) Altas (asocian habitaciones 1-4 con reservaciones 1-5)
INSERT INTO asignar (HabitacionIdHabitacion, ReservacionIdReservacion) VALUES
(1, 1),
(2, 1),
(3, 2),
(1, 3),
(4, 4),
(2, 5);
SELECT * FROM asignar;                                  -- captura: ALTA

-- B) Baja: se elimina la asignacion de la habitacion 2 a la reservacion 5.
DELETE FROM asignar WHERE HabitacionIdHabitacion = 2 AND ReservacionIdReservacion = 5;
SELECT * FROM asignar;                                  -- captura: BAJA

-- C) Cambio: la reservacion 3 se reubica de la habitacion 1 a la habitacion 4.
UPDATE asignar SET HabitacionIdHabitacion = 4
WHERE HabitacionIdHabitacion = 1 AND ReservacionIdReservacion = 3;
SELECT * FROM asignar;                                  -- captura: CAMBIO


-- ============================================================
-- 3. CONSULTAS EN SQL
-- ============================================================
USE HotelDB;

-- ---------- a) CONSULTAS SENCILLAS ----------

-- [1] Nombre y correo de todos los clientes.
SELECT nombre, correo
FROM Cliente;

-- [2] Habitaciones que estan disponibles.
SELECT IdHabitacion, numero, tipo, precio
FROM Habitacion
WHERE estado = 'Disponible';

-- [3] Reservaciones que siguen activas.
SELECT IdReservacion, fecha_entrada, fecha_salida, estado
FROM Reservacion
WHERE estado = 'Activa';

-- [4] Pagos realizados con tarjeta.
SELECT IdPago, monto, fecha_pago
FROM Pago
WHERE metodo_pago = 'Tarjeta';

-- [5] Habitaciones con precio mayor a 1000.
SELECT numero, tipo, precio
FROM Habitacion
WHERE precio > 1000;


-- ---------- b) CONSULTAS CON CAMPOS AGRUPADOS ----------

-- [1] Total de reservaciones por cliente (LEFT JOIN para incluir a los que no tienen).
SELECT c.nombre, COUNT(r.IdReservacion) AS Total_Reservaciones
FROM Cliente c
LEFT JOIN Reservacion r ON r.ClienteIdCliente = c.IdCliente
GROUP BY c.IdCliente, c.nombre;

-- [2] Monto total pagado por cada reservacion.
SELECT r.IdReservacion, SUM(p.monto) AS Total_Pagado
FROM Reservacion r
JOIN Pago p ON p.ReservacionIdReservacion = r.IdReservacion
GROUP BY r.IdReservacion;

-- [3] Numero de reservaciones gestionadas por cada empleado.
SELECT e.nombre, COUNT(r.IdReservacion) AS Total_Gestionadas
FROM Empleado e
LEFT JOIN Reservacion r ON r.EmpleadoIdEmpleado = e.IdEmpleado
GROUP BY e.IdEmpleado, e.nombre;

-- [4] Cantidad de habitaciones por tipo.
SELECT tipo, COUNT(*) AS Total_Habitaciones
FROM Habitacion
GROUP BY tipo;

-- [5] Precio promedio de habitacion por tipo (redondeado a 2 decimales).
SELECT tipo, ROUND(AVG(precio), 2) AS Precio_Promedio
FROM Habitacion
GROUP BY tipo;


-- ---------- c) CONSULTAS CON HAVING ----------

-- [1] Clientes con mas de 1 reservacion.
SELECT c.nombre, COUNT(r.IdReservacion) AS Total_Reservaciones
FROM Cliente c
JOIN Reservacion r ON r.ClienteIdCliente = c.IdCliente
GROUP BY c.IdCliente, c.nombre
HAVING Total_Reservaciones > 1;

-- [2] Reservaciones cuyo monto total pagado supera los 3000.
SELECT r.IdReservacion, SUM(p.monto) AS Total_Pagado
FROM Reservacion r
JOIN Pago p ON p.ReservacionIdReservacion = r.IdReservacion
GROUP BY r.IdReservacion
HAVING Total_Pagado > 3000;

-- [3] Tipos de habitacion con precio promedio mayor a 1500.
SELECT tipo, ROUND(AVG(precio), 2) AS Precio_Promedio
FROM Habitacion
GROUP BY tipo
HAVING Precio_Promedio > 1500;

-- [4] Empleados que gestionan mas de 1 reservacion.
SELECT e.nombre, COUNT(r.IdReservacion) AS Total_Gestionadas
FROM Empleado e
JOIN Reservacion r ON r.EmpleadoIdEmpleado = e.IdEmpleado
GROUP BY e.IdEmpleado, e.nombre
HAVING Total_Gestionadas > 1;

-- [5] Metodos de pago utilizados mas de una vez.
SELECT metodo_pago, COUNT(*) AS Veces_Utilizado
FROM Pago
GROUP BY metodo_pago
HAVING Veces_Utilizado > 1;



-- ---------- d) CONSULTAS MULTITABLA ----------

-- [1] Cada cliente con los datos de su reservacion.
SELECT c.nombre, r.fecha_entrada, r.fecha_salida, r.estado
FROM Cliente c
JOIN Reservacion r ON r.ClienteIdCliente = c.IdCliente
ORDER BY c.nombre;

-- [2] Detalle de cada reservacion con el cliente y el empleado involucrados.
SELECT r.IdReservacion, c.nombre AS Cliente, e.nombre AS Empleado, r.estado
FROM Reservacion r
JOIN Cliente c  ON c.IdCliente  = r.ClienteIdCliente
JOIN Empleado e ON e.IdEmpleado = r.EmpleadoIdEmpleado;

-- [3] Pagos junto con el nombre del cliente que los realizo.
SELECT p.IdPago, c.nombre AS Cliente, p.monto, p.metodo_pago
FROM Pago p
JOIN Reservacion r ON r.IdReservacion = p.ReservacionIdReservacion
JOIN Cliente c     ON c.IdCliente     = r.ClienteIdCliente;

-- [4] Habitaciones asignadas a cada reservacion con su cliente.
SELECT r.IdReservacion, c.nombre AS Cliente, h.numero AS Habitacion, h.tipo
FROM asignar a
JOIN Habitacion h  ON h.IdHabitacion  = a.HabitacionIdHabitacion
JOIN Reservacion r ON r.IdReservacion = a.ReservacionIdReservacion
JOIN Cliente c     ON c.IdCliente     = r.ClienteIdCliente
ORDER BY r.IdReservacion;

-- [5] Vision completa: reservacion, cliente, empleado, habitacion y pago.
SELECT r.IdReservacion,
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
ORDER BY r.IdReservacion;