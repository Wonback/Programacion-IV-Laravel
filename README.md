# 🎟️ Sistema de Gestión de Eventos y Entradas

## 👥 Integrantes
- [@jonimende](https://github.com/jonimende) (Jonas Mendelovich)
- [@wonback](https://github.com/Wonback) (Mateo Zaballo)
- [@Knd0](https://github.com/Knd0) (Franco De Iriondo)
- [@NunezGaston](https://github.com/NunezGaston) (Gaston Nuñez)

---

## 📌 Descripción del Proyecto
El **Sistema de Gestión de Eventos y Entradas** es una aplicación web que permite a los usuarios visualizar y comprar entradas para eventos de manera sencilla y segura.

### 🧱 Arquitectura del repositorio
- **Backend** (`/backend`) – API REST construida con **Laravel 12**, autenticación con **Sanctum** y dependencias orientadas a **PHP 8.2**.  
- **Frontend** (`/frontend`) – SPA en **Angular 20** con **Tailwind CSS** y tooling CLI habitual para desarrollo y pruebas.

---

## 🚀 Funcionalidades Clave

### 🔙 Backend
- **Autenticación y cuentas**: registro, login, perfil autenticado y logout con revocación de tokens; bloqueo de usuarios desactivados.  
- **Eventos**: listado paginado con filtros de categoría, fecha y búsqueda. CRUD exclusivo para administradores, asociado a organizador (usuario) con categoría opcional.  
- **Gestión de usuarios**: endpoints admin para alta, actualización, desactivación/eliminación. Paginación con orden cronológico.  
- **Pedidos/entradas**: creación de órdenes calculando total según precio del evento y validando cupos disponibles.  
- **Autorización admin**: middleware que exige rol administrador en rutas sensibles.  
- **Modelado de dominio**: modelos Eloquent con casts y relaciones para eventos, órdenes y usuarios (incluye flag `is_active`).  
- **Mapa de endpoints**: rutas públicas y protegidas bajo middleware Sanctum y reglas de administrador.

### 🖥️ Frontend
- **Autenticación en SPA**: formularios reactivos (registro/login) consumiendo el API, almacenamiento en `localStorage` y redirecciones.  
- **Navegación y rol**: navbar que adapta opciones según rol del usuario; navegación responsive.  
- **Listado y detalle de eventos**: rutas protegidas con token, navegación al detalle.  
- **Gestión de eventos (admins)**: guardia `AdminGuard` y subida opcional de imágenes a **Cloudinary**.  
- **Edición por organizador**: detalle editable/eliminable por el creador, con actualización de imágenes en Cloudinary.

---

## 🛠️ Requisitos Previos
- **Backend**: PHP 8.2+, Composer, MySQL configurado en `.env` (por defecto `appeventos_db`).  
- **Frontend**: Node.js + npm (Angular CLI).  

---

## ⚙️ Puesta en Marcha

### 🔙 Backend
```bash
cd backend
composer iniciar
```

Ejecutar pruebas backend
```bash
php artisan test
```
borra caché de configuración y lanza la suite completa.

### 🧪 Cobertura de pruebas automatizadas

AuthApiTest: valida registro, login/logout, validaciones y revocación de tokens en usuarios desactivados.

EventApiTestCase: cubre listado con filtros, detalle con relaciones, CRUD admin y restricciones a usuarios estándar.

OrderApiTest: garantiza que los cupos se calculan correctamente y se impiden compras que superan la capacidad.

AdminUserIndexTest: comprueba el orden y los campos expuestos al listar usuarios como administrador.

### 🖥️ Frontend

```bash
cd frontend
npm run iniciar
```


La SPA queda disponible en http://localhost:4200, consumiendo la API del backend en http://localhost:8000. Ajusta el endpoint si cambias el host o puerto.

Configuración adicional
La carga de imágenes usa Cloudinary con upload_preset y cloud_name embebidos en el código; modifica esos valores si utilizas otra cuenta/preset.

### 📡 Endpoints principales de la API

| Método                    | Ruta                  | Descripción                              | Protección        |                      |
| ------------------------- | --------------------- | ---------------------------------------- | ----------------- | -------------------- |
| POST                      | `/api/auth/register`  | Registro de usuarios con token inmediato | Pública           |                      |
| POST                      | `/api/auth/login`     | Inicio de sesión y emisión de token      | Pública           |                      |
| GET                       | `/api/auth/me`        | Perfil autenticado                       | Sanctum           |                      |
| POST                      | `/api/auth/logout`    | Revoca el token activo                   | Sanctum           |                      |
| GET                       | `/api/events`         | Listado paginado con filtros             | Pública           |                      |
| GET                       | `/api/events/{event}` | Detalle de evento con organizador        | Pública           |                      |
| POST/PUT/DELETE           | `/api/events`         | CRUD de eventos                          | Sanctum + `admin` |                      |
| GET/POST/PUT/PATCH/DELETE | `/api/admin/users`    | Gestión de usuarios                      | Sanctum + `admin` |                      |
| POST                      | `/api/orders`         | Compra de entradas con control de cupos  | Sanctum           | :codex-file-citation |


---

## 📂 Estructura del Proyecto

### 🖥️ Backend – Laravel

```bash
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── EventController.php
│   │   │   ├── OrderController.php
│   │   │   └── UserController.php
│   │   ├── Middleware/
│   │   │   └── IsAdmin.php
│   │   └── Requests/
│   │       ├── AdminStoreUserRequest.php
│   │       └── AdminUpdateUserRequest.php
│   ├── Models/
│   │   ├── Event.php
│   │   ├── Order.php
│   │   └── User.php
│   └── Providers/
│       └── AppServiceProvider.php
├── database/
│   ├── factories/
│   │   ├── EventFactory.php
│   │   └── UserFactory.php
│   ├── migrations/
│   │   └── … (create_* y add_* tablas/columnas)
│   └── seeders/
│       ├── AdminUserSeeder.php
│       └── DatabaseSeeder.php
├── routes/
│   ├── api.php
│   ├── console.php
│   └── web.php
└── tests/
    ├── Feature/
    │   ├── AdminUserIndexTest.php
    │   ├── AuthApiTest.php
    │   ├── EventApi.php
    │   ├── EventApiTest.php
    │   └── OrderApiTest.php
    ├── CreatesApplication.php
    └── TestCase.php
```

### 🖥️ Frontend – Angular + Typescript

```bash
frontend/
├── src/
│   └── app/
│       ├── app.config.ts
│       ├── app.routes.ts
│       ├── app.ts
│       ├── auth/
│       │   ├── login/
│       │   │   ├── login.html
│       │   │   ├── login.scss
│       │   │   ├── login.spec.ts
│       │   │   └── login.ts
│       │   └── register/
│       │       ├── register.component.html
│       │       ├── register.scss
│       │       ├── register.spec.ts
│       │       └── register.component.ts
│       ├── guards/
│       │   └── admin-guard.ts
│       ├── pages/
│       │   ├── home/
│       │   │   ├── home.html
│       │   │   ├── home.scss
│       │   │   ├── home.spec.ts
│       │   │   └── home.ts
│       │   ├── create-event/
│       │   │   ├── create-event.html
│       │   │   ├── create-event.scss
│       │   │   ├── create-event.spec.ts
│       │   │   └── create-event.ts
│       │   ├── event-detail/
│       │   │   ├── event-detail.html
│       │   │   ├── event-detail.scss
│       │   │   ├── event-detail.spec.ts
│       │   │   └── event-detail.ts
│       │   └── navbar/
│       │       ├── navbar.html
│       │       ├── navbar.scss
│       │       ├── navbar.spec.ts
│       │       └── navbar.ts
│       └── services/
│           ├── auth.service.ts
│           ├── auth.spec.ts
│           └── auth.ts
├── angular.json
├── package.json
└── …
```


