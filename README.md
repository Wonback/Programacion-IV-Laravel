# 🎟️ Sistema de Gestión de Eventos y Entradas

## 👥 Integrantes
- Franco de Iriondo  
- Mateo Zeballos  
- Jonas Mendelovich  
- Gaston Nuñez  
- Nahuel Silvestri  

---

## 📌 Descripción del Proyecto
El **Sistema de Gestión de Eventos y Entradas** es una aplicación web que permite a los usuarios visualizar y comprar entradas para eventos de manera sencilla y segura.  

🧱 Arquitectura del repositorio
Backend (/backend) – API REST construida con Laravel 12, autenticación con Sanctum y dependencias orientadas a PHP 8.2.

Frontend (/frontend) – SPA en Angular 20 con Tailwind y tooling CLI habitual para desarrollo y pruebas.

🚀 Funcionalidades clave
Backend
Autenticación y cuentas: registro, login, perfil autenticado y logout con revocación de tokens; bloquea el acceso a usuarios desactivados.

Eventos: listado paginado con filtros de categoría, fecha y búsqueda, CRUD exclusivo para administradores y asociación al organizador (usuario) con categoría opcional.

Gestión de usuarios: endpoints admin para alta, actualización y desactivación/ eliminación con protecciones contra cambios de rol propios; listado paginado ordenado por fecha.

Pedidos/entradas: crea órdenes calculando el total según el precio del evento y validando la disponibilidad de cupos antes de confirmar la compra.

Autorización admin: alias admin registrado en bootstrap para exigir rol administrador en rutas sensibles.

Modelado de dominio: modelos Eloquent con casts y relaciones para eventos, órdenes y usuarios (incluye flag is_active).

Mapa de endpoints: rutas públicas y protegidas agrupadas bajo middleware Sanctum y reglas admin.

Frontend
Autenticación en la SPA: formularios reactivos para registro y login que consumen el API, almacenan token e ID del usuario en localStorage y redirigen según el flujo.

Navegación y rol: navbar standalone obtiene el usuario autenticado para mostrar opciones según rol y controla navegación responsive.

Listado y detalle: rutas protegidas para home y event/:id, lista eventos con token vigente y permite navegar al detalle del evento.

Gestión de eventos (admins): guardia AdminGuard consulta el perfil y limita el acceso al formulario de creación; el alta incluye subida opcional de imagen a Cloudinary con preset configurable.

Edición por organizador: vista de detalle permite editar o eliminar el evento solo al creador, reutilizando Cloudinary para actualizar imágenes.

🛠️ Requisitos previos
PHP 8.2+, Composer y una base de datos MySQL definida en .env (por defecto appeventos_db).

Node.js + npm (Angular CLI) para levantar la SPA.

⚙️ Puesta en marcha del backend
cd backend

Copia el entorno: cp .env.example .env y ajusta las variables de base de datos si es necesario.

Instala dependencias y genera la clave de la app: composer install && php artisan key:generate.

Ejecuta migraciones: php artisan migrate.

Levanta el servidor: php artisan serve --port=8000.

Todo el flujo anterior está automatizado en el script composer iniciar, que encadena instalación, configuración y arranque.

Ejecutar pruebas backend
php artisan test borra caché de configuración y lanza la suite completa.

🧪 Cobertura de pruebas automatizadas
AuthApiTest: valida registro, login/logout, validaciones y revocación de tokens en usuarios desactivados.

EventApiTestCase: cubre listado con filtros, detalle con relaciones, CRUD admin y restricciones a usuarios estándar.

OrderApiTest: garantiza que los cupos se calculan correctamente y se impiden compras que superan la capacidad.

AdminUserIndexTest: comprueba el orden y los campos expuestos al listar usuarios como administrador.

🖥️ Puesta en marcha del frontend
cd frontend

Instala dependencias: npm install.

Levanta la app: npm run start (o npm run iniciar para instalar y servir en un paso).

La SPA queda disponible en http://localhost:4200, consumiendo la API del backend en http://localhost:8000. Ajusta el endpoint si cambias el host o puerto.

Configuración adicional
La carga de imágenes usa Cloudinary con upload_preset y cloud_name embebidos en el código; modifica esos valores si utilizas otra cuenta/preset.

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

### 🖥️ Backend – Laravel (API REST)

```bash
backend-laravel/
│── artisan
│── composer.json
│── .env
│
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── UserController.php
│   │   │   ├── EventController.php
│   │   │   └── TicketController.php
│   │   ├── Middleware/
│   │   │   ├── Authenticate.php
│   │   │   ├── AdminMiddleware.php   # Verifica rol admin
│   │   │   └── JwtMiddleware.php     # Protege rutas con JWT
│   │   └── Requests/
│   │       ├── RegisterRequest.php
│   │       ├── LoginRequest.php
│   │       └── EventRequest.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Event.php
│   │   └── Ticket.php
│   │
│   ├── Services/
│   │   ├── AuthService.php
│   │   ├── EventService.php
│   │   └── TicketService.php
│   │
│   └── Policies/
│       └── EventPolicy.php
│
├── config/
│   └── jwt.php
│
├── database/
│   ├── migrations/
│   │   ├── 2025_01_01_create_users_table.php
│   │   ├── 2025_01_02_create_events_table.php
│   │   └── 2025_01_03_create_tickets_table.php
│   ├── seeders/
│   │   ├── UserSeeder.php
│   │   └── EventSeeder.php
│   └── factories/
│       ├── UserFactory.php
│       └── EventFactory.php
│
├── routes/
│   ├── api.php
│   └── web.php
│
└── tests/
    ├── Feature/
    └── Unit/


frontend-angular/
│── package.json
│── angular.json
│── tsconfig.json
│
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── admin.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── event.service.ts
│   │   │   │   └── ticket.service.ts
│   │   │   └── models/
│   │   │       ├── user.model.ts
│   │   │       ├── event.model.ts
│   │   │       └── ticket.model.ts
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── logout/
│   │   │   │
│   │   │   ├── events/
│   │   │   │   ├── event-list/
│   │   │   │   ├── event-detail/
│   │   │   │   └── event-form/        # CRUD de eventos
│   │   │   │
│   │   │   ├── tickets/
│   │   │   │   ├── ticket-list/
│   │   │   │   └── ticket-purchase/
│   │   │   │
│   │   │   └── dashboard/
│   │   │       ├── stats/
│   │   │       └── charts/
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── footer/
│   │   │   │   └── event-card/
│   │   │   ├── directives/
│   │   │   └── pipes/
│   │   │
│   │   ├── pages/
│   │   │   ├── home/
│   │   │   ├── about/
│   │   │   └── not-found/
│   │   │
│   │   ├── app-routing.module.ts
│   │   └── app.module.ts
│   │
│   └── assets/
│       ├── images/
│       └── styles/
│           ├── variables.scss
│           └── global.scss
