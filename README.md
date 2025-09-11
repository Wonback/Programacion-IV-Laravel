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

Para correr el proyecto ingresar a la carpeta "backend" y ejecutar "composer iniciar", y "npm run iniciar" para el front respectivamente.
---

## 🚀 Funcionalidades Principales
1. **Gestión de Usuarios**
   - Registro, login y logout.
   - Roles diferenciados: **Administrador** y **Usuario**.
   - El Administrador puede gestionar usuarios.

2. **Gestión de Eventos**
   - CRUD de eventos (crear, leer, actualizar, eliminar).
   - Datos de cada evento: título, descripción, fecha, hora, lugar y categoría.
   - Posibilidad de subir imágenes representativas.

3. **Gestión de Entradas**
   - CRUD de entradas asociadas a eventos.
   - Control de disponibilidad y cantidad.
   - Compra de entradas con confirmación de reserva.

4. **Dashboard y Estadísticas**
   - Vista para administradores: número de eventos, entradas vendidas y estadísticas.
   - Gráficos dinámicos de ventas por evento y ocupación de entradas.

5. **Seguridad y Autenticación**
   - Autenticación con **JWT**.
   - Protección de rutas con **middlewares** y **guards**.
   - Validación de formularios y manejo de errores.

6. **Interfaz de Usuario (Frontend Angular)**
   - Página principal con lista de eventos.
   - Detalle de evento con opción de compra.
   - Formularios reactivos para gestión de eventos y entradas.
   - Filtros y búsqueda de eventos.

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
