# EVIDENCIA — Base de Datos Avanzado

## Información del Proyecto

- **Proyecto:** PowerGym Admin — Sistema de Administración de Gimnasio
- **Alumno:** Angel Fernando Sandoval Rodriguez
- **Materia:** Base de Datos Avanzado
- **Institución:** UADEO
- **Fecha:** Junio 2026
- **URL pública:** https://powergym-admin.vercel.app
- **Repositorio:** https://github.com/Naenndo/powergym-admin
- **Credenciales demo:** demo@demo.com / Demo1234

---

## 1. Descripción del Proyecto

PowerGym Admin es un sistema web de administración para gimnasios desarrollado con:

- **Frontend y Backend:** Next.js 16 (App Router) con TypeScript
- **Base de datos:** MongoDB 7.0.x (MongoDB Atlas) a través de Mongoose 9.6.3
- **Estilos:** Tailwind CSS + shadcn/ui
- **Despliegue:** Vercel

El sistema permite gestionar socios, planes de membresía, pagos y asistencia del gimnasio, con autenticación de usuarios y persistencia real en MongoDB Atlas.

---

## 2. Esquema de la Base de Datos

### Colección: Users (Usuarios del sistema)

| Campo      | Tipo    | Descripción                        |
|------------|---------|------------------------------------|
| email      | String  | Email del usuario (único, requerido) |
| password   | String  | Contraseña hasheada con bcrypt     |
| name       | String  | Nombre completo (requerido)        |
| role       | String  | Rol: "admin" o "user"              |
| createdAt  | Date    | Fecha de creación automática       |
| updatedAt  | Date    | Fecha de actualización automática  |

### Colección: Members (Socios del gimnasio)

| Campo     | Tipo     | Descripción                              |
|-----------|----------|------------------------------------------|
| firstName | String   | Nombre(s) del socio (requerido)          |
| lastName  | String   | Apellido(s) del socio (requerido)        |
| email     | String   | Correo electrónico (requerido)           |
| phone     | String   | Número de teléfono (requerido)           |
| dni       | String   | Documento de identidad (único, requerido)|
| birthDate | Date     | Fecha de nacimiento (requerido)          |
| gender    | String   | Género: "male", "female", "other"        |
| plan      | ObjectId | Referencia al plan contratado            |
| startDate | Date     | Fecha de inicio de membresía             |
| endDate   | Date     | Fecha de vencimiento de membresía        |
| status    | String   | Estado: "active", "inactive", "suspended"|
| notes     | String   | Notas adicionales                        |
| createdAt | Date     | Fecha de creación automática             |
| updatedAt | Date     | Fecha de actualización automática        |

### Colección: Plans (Planes de membresía)

| Campo        | Tipo     | Descripción                           |
|--------------|----------|---------------------------------------|
| name         | String   | Nombre del plan (requerido)           |
| description  | String   | Descripción del plan (requerido)      |
| price        | Number   | Precio mensual (requerido, min: 0)    |
| duration     | Number   | Duración (requerido, min: 1)          |
| durationType | String   | Tipo: "days" o "months"               |
| features     | [String] | Lista de beneficios incluidos         |
| active       | Boolean  | Si el plan está disponible            |
| createdAt    | Date     | Fecha de creación automática          |
| updatedAt    | Date     | Fecha de actualización automática     |

### Colección: Payments (Pagos)

| Campo     | Tipo     | Descripción                              |
|-----------|----------|------------------------------------------|
| member    | ObjectId | Referencia al socio que pagó             |
| amount    | Number   | Monto del pago (requerido, min: 0)       |
| method    | String   | Método: "cash", "card", "transfer", "other" |
| concept   | String   | Concepto/descripción del pago            |
| date      | Date     | Fecha del pago (requerido)               |
| status    | String   | Estado: "paid", "pending", "overdue"     |
| notes     | String   | Notas adicionales                        |
| createdAt | Date     | Fecha de creación automática             |
| updatedAt | Date     | Fecha de actualización automática        |

### Colección: Attendances (Asistencias)

| Campo     | Tipo     | Descripción                        |
|-----------|----------|------------------------------------|
| member    | ObjectId | Referencia al socio                |
| checkIn   | Date     | Hora de entrada (requerido)        |
| checkOut  | Date     | Hora de salida (puede ser null)    |
| createdAt | Date     | Fecha de creación automática       |
| updatedAt | Date     | Fecha de actualización automática  |

---

## 3. Relación entre Entidades

### Members → Plans (Muchos a Uno — Referencia)

Cada socio tiene asignado un plan mediante un campo `plan` de tipo ObjectId que referencia a la colección Plans. Se eligió **referencia** (y no documento embebido) por las siguientes razones:

1. **Independencia de datos:** Los planes existen de forma independiente. Si se actualiza el precio de un plan, todos los socios con ese plan reflejan el cambio automáticamente al hacer `populate`.
2. **Reutilización:** Un mismo plan es compartido por muchos socios. Embeber los datos del plan en cada socio generaría duplicación innecesaria.
3. **Consultas flexibles:** Permite consultar todos los socios de un plan específico con `Member.find({ plan: planId })`.

### Payments → Members (Muchos a Uno — Referencia)

Cada pago pertenece a un socio. La relación es por referencia porque:
- Un socio puede tener múltiples pagos a lo largo del tiempo.
- Se necesita consultar el historial de pagos de un socio específico.
- Se evita duplicar los datos del socio en cada registro de pago.

### Attendances → Members (Muchos a Uno — Referencia)

Cada registro de asistencia pertenece a un socio. Se usa referencia porque:
- Un socio genera múltiples registros de asistencia (uno por día).
- Permite filtrar asistencias por socio y por fecha.
- La relación es simple y no requiere datos embebidos.

---

## 4. CRUD Detallado — Gestión de Socios (Members)

### Crear (CREATE)

**Endpoint:** `POST /api/members`

El formulario del frontend envía los datos del socio (nombre, apellido, email, teléfono, DNI, plan, etc.) al endpoint. Mongoose valida que los campos requeridos estén presentes y que el DNI sea único. El documento se crea directamente en MongoDB Atlas con `Member.create(body)`.

```typescript
const member = await Member.create(body);
const populated = await member.populate("plan");
return Response.json(populated, { status: 201 });
```

### Leer (READ)

**Endpoint:** `GET /api/members`

Se consultan todos los socios con `Member.find(filter)`, con soporte para filtrar por estado y buscar por nombre, email o DNI usando expresiones regulares. Se hace `populate("plan")` para incluir los datos completos del plan.

```typescript
const members = await Member.find(filter)
  .populate("plan")
  .sort({ createdAt: -1 });
```

### Actualizar (UPDATE)

**Endpoint:** `PUT /api/members/[id]`

Se usa `findOneAndUpdate` para modificar el documento existente, devolviendo el documento actualizado. Los campos se actualizan con `$set`.

```typescript
const result = await db.collection("Members").findOneAndUpdate(
  { _id: id },
  { $set: body },
  { returnDocument: "after" }
);
```

### Eliminar (DELETE)

**Endpoint:** `DELETE /api/members/[id]`

Se usa `findOneAndDelete` para eliminar el documento por su ID.

```typescript
const result = await db.collection("Members").findOneAndDelete({ _id: id });
```

### Persistencia

Todas las operaciones CRUD se realizan directamente sobre MongoDB Atlas. Los datos NO se almacenan en memoria ni en arrays locales. Al recargar la página, los datos se consultan nuevamente desde la base de datos, garantizando persistencia real.

---

## 5. Autenticación

### Registro de usuarios

Los usuarios se registran mediante `POST /api/auth/register`. La contraseña se hashea con **bcrypt** (12 rounds de salt) antes de almacenarla en la colección Users.

```typescript
const hashedPassword = await bcrypt.hash(password, 12);
await User.create({ email, password: hashedPassword, name });
```

### Login

El login (`POST /api/auth/login`) verifica las credenciales comparando el hash con `bcrypt.compare()`. Si son correctas, genera un **JWT (JSON Web Token)** que se almacena en una cookie HttpOnly.

```typescript
const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
```

### Protección de rutas

Un **middleware** (`middleware.ts`) verifica la existencia del token JWT en las cookies antes de permitir el acceso a cualquier ruta. Si no hay token, redirige al login.

### Logout

El logout (`POST /api/auth/logout`) elimina la cookie del token estableciendo `Max-Age=0`.

---

## 6. Índices Declarados

Se declararon los siguientes índices en los modelos Mongoose para optimizar las consultas:

- **Members:** `email` (ascendente), `status` (ascendente), `plan` (ascendente), `dni` (único)
- **Payments:** `member + date` (compuesto), `status` (ascendente)
- **Attendances:** `member + checkIn` (compuesto), `checkIn` (ascendente)
- **Plans:** `active` (ascendente), `price` (ascendente)
- **Users:** `email` (único)

---

## 7. Capturas

> **NOTA:** Agregar las siguientes capturas antes de entregar:

1. **MongoDB Atlas mostrando versión 7.0.x** — Pantalla del cluster en Atlas donde se ve la versión.
2. **Colecciones con datos** — Atlas > Database > Browse Collections mostrando Users, Members, Plans, Payments con documentos.
3. **Persistencia antes/después** — Captura de la app mostrando socios, luego recargar la página y mostrar que los datos persisten.
4. **Login funcional** — Captura de la página de login y del dashboard después de autenticarse.

---

## 8. Script de Seed

El proyecto incluye un script de semilla (`scripts/seed.ts`) que:

1. Limpia todas las colecciones existentes
2. Crea el usuario demo: **demo@demo.com / Demo1234**
3. Crea 3 planes de membresía (Básico, Premium, VIP)
4. Crea 3 socios de ejemplo con diferentes planes
5. Crea 3 pagos de ejemplo
6. Crea 2 registros de asistencia

Para ejecutar: `npm run seed`

---

## 9. Stack Tecnológico Completo

| Capa          | Tecnología           |
|---------------|----------------------|
| Framework     | Next.js 16           |
| Lenguaje      | TypeScript           |
| Base de datos | MongoDB 7.0.x Atlas  |
| ODM           | Mongoose 9.6.3       |
| Autenticación | bcryptjs + JWT       |
| Estilos       | Tailwind CSS v4      |
| Componentes   | shadcn/ui + Lucide   |
| Despliegue    | Vercel               |
