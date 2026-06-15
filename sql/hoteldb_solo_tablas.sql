-- =====================================================================
--  HOTEL ECKA - solo TABLAS + datos (no borra la base de datos)
--
--  Pensado para correrse DENTRO de tu base "hoteldb" ya existente
--  (por ejemplo, desde la extension de base de datos de Cursor:
--   abre este archivo y ejecutalo sobre la conexion de hoteldb).
--
--  Recrea las 6 tablas del modelo y las puebla. Solo afecta a estas
--  tablas; el resto de tu servidor (escuela, restaurant, etc.) no se toca.
-- =====================================================================

USE hoteldb;

-- Borra las tablas en orden inverso a las llaves foraneas
DROP TABLE IF EXISTS asignar;
DROP TABLE IF EXISTS Pago;
DROP TABLE IF EXISTS Reservacion;
DROP TABLE IF EXISTS Empleado;
DROP TABLE IF EXISTS Habitacion;
DROP TABLE IF EXISTS Cliente;

-- ---------- Estructura ----------
CREATE TABLE Cliente (
    IdCliente      TINYINT(3)   NOT NULL AUTO_INCREMENT,
    nombre         VARCHAR(100) NOT NULL,
    correo         VARCHAR(100) NOT NULL UNIQUE,
    telefono       VARCHAR(15),
    fecha_registro DATE,
    PRIMARY KEY (IdCliente)
);

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

CREATE TABLE Empleado (
    IdEmpleado TINYINT(3)   NOT NULL AUTO_INCREMENT,
    nombre     VARCHAR(100) NOT NULL,
    puesto     VARCHAR(50),
    telefono   VARCHAR(15),
    correo     VARCHAR(100),
    PRIMARY KEY (IdEmpleado)
);

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

CREATE TABLE asignar (
    HabitacionIdHabitacion   TINYINT(3) NOT NULL,
    ReservacionIdReservacion TINYINT(3) NOT NULL,
    PRIMARY KEY (HabitacionIdHabitacion, ReservacionIdReservacion),
    FOREIGN KEY (HabitacionIdHabitacion) REFERENCES Habitacion(IdHabitacion)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ReservacionIdReservacion) REFERENCES Reservacion(IdReservacion)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ---------- Datos de ejemplo ----------
INSERT INTO Cliente (nombre, correo, telefono, fecha_registro) VALUES
('Ana Martinez Torres', 'ana.martinez@correo.com', '4491234567', '2025-01-10'),
('Luis Hernandez Diaz', 'luis.hernandez@correo.com', '4497654321', '2025-02-15'),
('Sofia Ramirez Leon',  'sofia.ramirez@correo.com',  '4491122334', '2025-03-05'),
('Diego Flores Cruz',   'diego.flores@correo.com',   '4495566778', '2025-03-20'),
('Carla Nunez Vega',    'carla.nunez@correo.com',    '4499988776', '2025-04-01');

INSERT INTO Habitacion (numero, tipo, precio, estado) VALUES
(101, 'Individual',   800.00,  'Disponible'),
(102, 'Doble',        1200.00, 'Disponible'),
(201, 'Suite',        2500.00, 'Ocupada'),
(202, 'Doble',        1300.00, 'Mantenimiento'),
(301, 'Suite',        2700.00, 'Disponible'),
(401, 'Presidencial', 5000.00, 'Disponible');

INSERT INTO Empleado (nombre, puesto, telefono, correo) VALUES
('Roberto Aguilar Mena', 'Recepcionista', '4491239876', 'roberto.aguilar@hotel.com'),
('Patricia Soto Gil',    'Gerente',       '4498765123', 'patricia.soto@hotel.com'),
('Miguel Angel Reyes',   'Recepcionista', '4495551234', 'miguel.reyes@hotel.com'),
('Laura Campos Ortiz',   'Conserje',      '4497778899', 'laura.campos@hotel.com');

INSERT INTO Reservacion (fecha_entrada, fecha_salida, estado, ClienteIdCliente, EmpleadoIdEmpleado) VALUES
('2025-05-01', '2025-05-05', 'Finalizada', 1, 1),
('2025-05-10', '2025-05-12', 'Activa',     2, 1),
('2025-05-15', '2025-05-20', 'Activa',     1, 2),
('2025-05-18', '2025-05-19', 'Cancelada',  3, 2),
('2025-06-01', '2025-06-04', 'Activa',     4, 3),
('2025-06-10', '2025-06-15', 'Activa',     2, 1);

INSERT INTO Pago (monto, metodo_pago, fecha_pago, ReservacionIdReservacion) VALUES
(3200.00, 'Tarjeta',       '2025-05-05', 1),
(1200.00, 'Efectivo',      '2025-05-12', 2),
(2500.00, 'Tarjeta',       '2025-05-20', 3),
(800.00,  'Efectivo',      '2025-05-05', 1),
(2700.00, 'Transferencia', '2025-06-04', 5),
(1300.00, 'Tarjeta',       '2025-06-04', 4);

INSERT INTO asignar (HabitacionIdHabitacion, ReservacionIdReservacion) VALUES
(1, 1), (2, 1), (3, 2), (1, 3), (4, 4), (2, 5), (5, 6);
