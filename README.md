# Hotel Ecka — Sistema de Administración

Aplicación web para la administración del **Hotel Ecka**, desarrollada como proyecto final de Base de Datos. Lo central del proyecto es la base de datos `HotelDB`: el modelo relacional respeta exactamente los nombres de tablas, columnas, llaves y restricciones del entregable, y todas las consultas del entregable se ejecutan desde la propia aplicación.

Construida con **Next.js 14 (App Router) + TypeScript**, **Tailwind CSS** y **MySQL** (driver `mysql2`). Funciona igual con MySQL local de **XAMPP** o con **MySQL en Railway**, y se despliega en **Vercel**.

## Qué incluye

- **Login** con sesión por cookie firmada.
- **Dashboard** con métricas (clientes, habitaciones, empleados, reservaciones, pagos, ingresos) y gráficas (habitaciones/reservaciones por estado, ingresos por método, top clientes).
- **CRUD (Altas / Bajas / Cambios)** de las 6 entidades: Clientes, Habitaciones, Empleados, Reservaciones, Pagos y Asignaciones. Las llaves foráneas se eligen con menús desplegables y las violaciones de restricción (UNIQUE, CHECK, FK) muestran mensajes claros.
- **Panel de Consultas** que ejecuta y muestra las **25 consultas** del catálogo: 5 sencillas, 5 agrupadas, 5 con HAVING, 5 multitabla y 5 extra de operación.

## Base de datos

El archivo `sql/HotelDB.sql` crea la base `HotelDB` con sus 6 tablas (`Cliente`, `Habitacion`, `Empleado`, `Reservacion`, `Pago`, `asignar`), todas las restricciones (PK, FK con CASCADE, UNIQUE, CHECK) y datos de ejemplo. El archivo `sql/consultas_entregable.sql` conserva el script original del entregable (estructura + ABC + consultas) como referencia.

> En Windows/XAMPP los nombres de base no distinguen mayúsculas, por lo que `HotelDB` y `hoteldb` son la misma base. Al importar `HotelDB.sql` se **reemplaza** el contenido de esa base con el esquema y los datos correctos.

Para revisar una base ya existente, ejecuta `sql/diagnostico.sql` en phpMyAdmin.

---

## Opción A — Local con XAMPP

1. **Inicia** Apache y MySQL en el panel de XAMPP.
2. **Importa la base:** abre `http://localhost/phpmyadmin` → pestaña *Importar* → selecciona `sql/HotelDB.sql` → *Continuar*. (Crea la base `HotelDB`/`hoteldb` con datos.)
3. **Instala dependencias** (necesitas [Node.js 18+](https://nodejs.org)). Si existe una carpeta `node_modules` incompleta, bórrala primero:

   ```bash
   npm install
   ```

4. **Configura el entorno:** copia `.env.example` a `.env.local`. El valor por defecto ya apunta a XAMPP:

   ```env
   DATABASE_URL="mysql://root@localhost:3306/hoteldb"
   APP_USER="admin"
   APP_PASSWORD="ecka2026"
   SESSION_SECRET="pon-aqui-un-secreto-largo"
   ```

5. **Arranca** la app:

   ```bash
   npm run dev
   ```

6. Abre `http://localhost:3000`, inicia sesión con **admin / ecka2026** y listo.

---

## Opción B — Despliegue en Vercel + Railway

1. **Railway:** crea un proyecto → *New* → *Database* → *MySQL*. En la pestaña *Variables* copia la *Connection URL*. Conéctate con un cliente (o la consola de Railway) e importa `sql/HotelDB.sql` para crear las tablas y los datos.
2. **GitHub:** sube este proyecto a un repositorio.
3. **Vercel:** *Add New Project* → importa el repo (framework detectado: Next.js).
4. En *Settings → Environment Variables* de Vercel agrega:
   - `DATABASE_URL` → la Connection URL de Railway.
   - `APP_USER`, `APP_PASSWORD`, `SESSION_SECRET`.
5. *Deploy*. Vercel compila (`next build`) y publica la app.

> En Railway/Linux los nombres de tabla **sí** distinguen mayúsculas; por eso el SQL y el código usan exactamente `Cliente`, `Habitacion`, etc.

---

## Estructura

```
sql/
  HotelDB.sql              Esquema + datos (importar en MySQL)
  consultas_entregable.sql Script original del entregable (referencia)
  diagnostico.sql          Verifica una base existente
  verify_queries.py        Prueba la lógica de las 25 consultas con SQLite
src/
  lib/        db, auth, session, schema, crud, queries
  middleware.ts            Protege las rutas (redirige a /login)
  app/
    login/                 Pantalla de acceso
    page.tsx               Dashboard
    clientes|habitaciones|empleados|reservaciones|pagos|asignaciones/
    consultas/             Panel de consultas SQL
    api/                   Endpoints (auth, [resource], consultas, dashboard)
  components/  Sidebar, Topbar, DataTable, Modal, FormField, ConfirmDialog,
               StatCard, ChartBar, ChartDonut
```

## Notas técnicas

- **Login** por defecto: `admin` / `ecka2026` (cámbialo con `APP_USER` / `APP_PASSWORD`).
- Las consultas del panel son **solo lectura** y predefinidas: nunca se ejecuta SQL arbitrario del cliente.
- Los CHECK del modelo requieren **MariaDB 10.2+ / MySQL 8.0.16+** (XAMPP reciente ya los cumple).
- Si `npm install` falla por un `node_modules` previo incompleto, elimina la carpeta y vuelve a instalar.
