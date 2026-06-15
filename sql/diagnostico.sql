-- =====================================================================
--  DIAGNOSTICO - Hotel Ecka
--  Ejecuta esto en phpMyAdmin (pestania SQL) sobre tu base "hoteldb"
--  para confirmar que el esquema coincide con el que espera la app.
-- =====================================================================
USE hoteldb;

-- 1) Deben aparecer EXACTAMENTE estas 6 tablas:
--    asignar, Cliente, Empleado, Habitacion, Pago, Reservacion
SHOW TABLES;

-- 2) Conteo de registros por tabla (deberia haber datos en todas):
SELECT 'Cliente'     AS tabla, COUNT(*) AS filas FROM Cliente
UNION ALL SELECT 'Habitacion',  COUNT(*) FROM Habitacion
UNION ALL SELECT 'Empleado',    COUNT(*) FROM Empleado
UNION ALL SELECT 'Reservacion', COUNT(*) FROM Reservacion
UNION ALL SELECT 'Pago',        COUNT(*) FROM Pago
UNION ALL SELECT 'asignar',     COUNT(*) FROM asignar;

-- 3) Verifica columnas de cada tabla (los nombres deben coincidir):
DESCRIBE Cliente;
DESCRIBE Habitacion;
DESCRIBE Empleado;
DESCRIBE Reservacion;
DESCRIBE Pago;
DESCRIBE asignar;
