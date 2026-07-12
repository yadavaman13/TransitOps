# We Selected TransitOps

It features a React-based single-page application client and an Express/Node.js backend API using PostgreSQL and Drizzle ORM.

## Table of Contents
1. [Team Members & Roles](#team-members--roles)
2. [Project Structure](#project-structure)
3. [Core Modules & Features](#core-modules--features)
4. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
5. [Frontend Routes](#frontend-routes)
6. [API Endpoint Reference](#api-endpoint-reference)
7. [Tech Stack](#tech-stack)
8. [Prerequisites](#prerequisites)
9. [Getting Started](#getting-started)
10. [UI Components & Design System](#ui-components--design-system)
11. [Verification & Testing](#verification--testing)

---

## Team Members & Roles

| Member Name | Role | Core Responsibilities |
| :--- | :--- | :--- |
| **Aman Yadav** | Full Stack | Overall architecture, Backend API |
| **Aryan Patel** | Full Stack | REST API design, route validation, JWT authentication |
| **Iteshkumar Prajapati** | Full Stack | REST API design, client state |
| **Ankur Singh** | Full Stack | Database migrations, and endpoint testing |

---

## Project Structure

The project is structured into two main subdirectories:
* **`client/`**: React single-page application built on Vite, using SASS/SCSS for styling, and React Router for routing.
* **`server/`**: Node/Express backend that handles user authentication, operational schemas, caching, notifications, and integration with third-party service APIs.

### Directory Layout

```text
TransitOps/
├── client/                     # Frontend client dashboard
│   ├── src/
│   │   ├── features/
│   │   │   ├── admin/          # Admin portal — user management & role control
│   │   │   │   ├── AdminContext.jsx   # React context for admin state
│   │   │   │   ├── hooks/             # useAdmin hook (CRUD, role update)
│   │   │   │   ├── pages/             # AdminDashboardPage
│   │   │   │   ├── services/          # Admin API integration
│   │   │   │   └── styles/            # admin.scss
│   │   │   ├── auth/           # Authentication features (Login, Register, verification)
│   │   │   │   ├── components/        # ProtectedRoute, FormGroup, PasswordMeter
│   │   │   │   ├── hooks/             # useAuth hook
│   │   │   │   ├── pages/             # Login, Register, VerifyEmail, ForgotPassword
│   │   │   │   └── services/          # Auth API calls
│   │   │   ├── driver/         # Driver-role portal
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── page/              # DriverDashboard
│   │   │   │   ├── service/
│   │   │   │   └── styles/
│   │   │   ├── finance/        # Shared financial pages (Fleet Manager & Financial Analyst)
│   │   │   │   ├── components/
│   │   │   │   ├── pages/             # FinanceDashboardPage, FinanceExpensesPage,
│   │   │   │   │                      # FinanceFuelPage, FinanceReportsPage
│   │   │   │   ├── services/
│   │   │   │   └── styles/
│   │   │   ├── financial-analyst/     # Financial Analyst portal
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── page/              # FinancialAnalystDashboard
│   │   │   │   ├── service/
│   │   │   │   └── styles/
│   │   │   ├── fleet-manager/  # Fleet Manager portal
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── page/              # FleetManagerDashboard, VehiclesPage, DriversPage,
│   │   │   │   │                      # TripsPage, MaintenancePage, FuelExpensesPage,
│   │   │   │   │                      # ReportsPage, UsersPage, SettingsPage
│   │   │   │   ├── service/
│   │   │   │   └── styles/
│   │   │   ├── safety-officer/ # Safety Officer portal
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── page/              # SafetyOfficerDashboard, SafetyDriversPage,
│   │   │   │   │                      # SafetyVehiclesPage, SafetyMaintenancePage,
│   │   │   │   │                      # SafetyReportsPage
│   │   │   │   ├── service/
│   │   │   │   └── styles/
│   │   │   ├── shared/         # Reusable layouts, context providers, and pages
│   │   │   │   ├── components/        # Sidebar.jsx, NotificationsBell.jsx
│   │   │   │   ├── layouts/           # RoleDashboardLayout.jsx (universal role wrapper)
│   │   │   │   ├── pages/
│   │   │   │   └── styles/
│   │   │   └── template/       # ERP-style UI component library & reference implementation
│   │   │       ├── components/
│   │   │       │   ├── dashboard/     # KPI cards, activity feeds
│   │   │       │   ├── data-display/  # Tables, lists, badges
│   │   │       │   ├── feedback/      # Toast, loaders, alerts
│   │   │       │   ├── forms/         # Input, select, checkbox components
│   │   │       │   ├── layout/        # AppLayout, Sidebar, TopNavbar
│   │   │       │   ├── navigation/    # Nav links, breadcrumbs
│   │   │       │   ├── overlays/      # Modals, drawers, popovers
│   │   │       │   └── ui/            # Buttons, tags, dividers
│   │   │       ├── pages/             # DashboardTemplatePage, CrudTemplatePage
│   │   │       ├── index.js           # Component library public exports
│   │   │       └── template-component-docs.md
│   │   ├── App.jsx             # Main App layout entrypoint
│   │   ├── app.routes.jsx      # React Router route configuration
│   │   ├── index.scss          # Core/global styling & CSS variables
│   │   └── main.jsx            # SPA DOM insertion point
│   ├── vite.config.js          # Vite build config
│   └── package.json            # Frontend dependency specifications
│
├── server/                     # Backend server API
│   ├── drizzle/                # Generated SQL migration files & schema snapshots
│   ├── src/
│   │   ├── config/             # App configs (database, environment parameters, Redis)
│   │   ├── dao/                # Data Access Objects for low-level DB queries
│   │   ├── db/                 # Drizzle schemas (users, config entities) & migrate script
│   │   │   ├── schema/         # Database table definitions
│   │   │   ├── migrate.js      # Script to run schema migrations
│   │   │   └── seed.js         # Script to seed database records
│   │   ├── modules/            # Domain-driven backend modules
│   │   │   ├── auth/           # Authentication & User Management
│   │   │   ├── dashboard/      # Dashboard Overview & KPIs
│   │   │   ├── vehicle/        # Fleet registration & status tracking
│   │   │   ├── driver/         # Driver licensing & safety scores
│   │   │   ├── trip/           # Trip scheduling, cargo, & state transitions
│   │   │   ├── fuel-log/       # Fuel intake monitoring & efficiency logs
│   │   │   ├── maintenance/    # Scheduled & reactive vehicle servicing
│   │   │   ├── expense/        # Tolls, maintenance, fuel, and custom costs
│   │   │   ├── finance/        # Aggregated financial portal (expenses + fuel + reports)
│   │   │   ├── report/         # Analytical reports, PDF/CSV generation
│   │   │   ├── analytics/      # Utilization, performance, and ROI trend charts
│   │   │   ├── notifications/  # Actionable system alerts & email reminders
│   │   │   ├── upload/         # File upload handling
│   │   │   ├── vehicle-documents/ # Document uploads & storage
│   │   │   ├── settings/       # System customizer & compliance parameters
│   │   │   └── search/         # Fuzzy search across vehicles, drivers, and trips
│   │   ├── services/           # Service layer for external APIs (Google Workspace, ImageKit)
│   │   ├── utils/              # Helper utility functions & test verification scripts
│   │   ├── validators/         # Global request validation helpers
│   │   └── app.js              # Express app setup, logging, cors, rate-limits
│   ├── server.js               # Entrypoint script that starts the API server listener
│   ├── drizzle.config.js       # Drizzle CLI tools configurator
│   └── package.json            # Backend dependency specifications
│
├── docs/                       # Project documentation
│   ├── AUTH_UI_CHANGES.md      # Auth page UI design changelog
│   └── DESIGN.md               # Design system reference
│
└── README.md                   # Project description, installation steps & team info
```

- Main App Routing: [app.routes.jsx](client/src/app.routes.jsx)
- Root Layout entrypoint: [App.jsx](client/src/App.jsx)
- Shared Role Layout: [RoleDashboardLayout.jsx](client/src/features/shared/layouts/RoleDashboardLayout.jsx)
- Main Stylesheet: [index.scss](client/src/index.scss)
- DB Migrations script: [migrate.js](server/src/db/migrate.js)
- DB Seed script: [seed.js](server/src/db/seed.js)
- Database schema aggregator: [schema.js](server/src/db/schema/schema.js)
- Server App config: [app.js](server/src/app.js)
- Server Entrypoint: [server.js](server/server.js)

---

## Core Modules & Features

TransitOps contains fully-integrated modules designed to map real-world logistics activities:
1. **Authentication & RBAC**: Multi-tenant environment protecting endpoints based on 5 precise roles (`FLEET_MANAGER`, `DRIVER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`, and `ADMIN`). Supports registration with email OTP verification, secure password resets, and JWT-based cookie sessions.
2. **Driver Management**: Registers driver details, emergency contacts, licenses, experience, and safety scores. Includes active state machines for driver availability and automatic license expiry reminders.
3. **Vehicle Management**: Registers trucks/vehicles, tracks current statuses (`AVAILABLE`, `IN_MAINTENANCE`, `ON_TRIP`, `RETIRED`), manages active odometers, and integrates with maintenance logs.
4. **Trip Management**: Connects drivers and vehicles to schedule, dispatch, cancel, start, and complete deliveries. Computes active trip timelines and records cargo and distance data.
5. **Fuel Management**: Monitors diesel/gasoline intake per vehicle, logs fuel stations, and calculates average consumption metrics.
6. **Maintenance Management**: Automates creation of service orders (upcoming, active, closed, or cancelled) to ensure vehicle uptime and compliance.
7. **Expense Management**: Records operational costs across categories (fuel, maintenance, toll, miscellaneous) mapped to vehicles and trips.
8. **Finance Portal**: Dedicated aggregated financial view combining expenses, fuel logs, and analytical reports. Accessible to both `FLEET_MANAGER` and `FINANCIAL_ANALYST` roles via `/api/finance/*` endpoints.
9. **Dashboard & KPIs**: Provides real-world aggregated indicators (total active trips, vehicles in maintenance, expiring licenses, recent activities).
10. **Analytical Reports**: Generates detailed records on fleet utilization, expenses, drivers, and operational costs. Supports exporting as standard CSV or PDF.
11. **Analytics Engine**: Evaluates fuel efficiency, ROI on vehicles, driver performance over time, and monthly expense trends.
12. **Notifications Module**: Distributes actionable alerts to personnel, sending reminder notifications when licenses or inspections are nearing expiration. Includes a real-time `NotificationsBell` component in the top navigation bar.
13. **Admin Panel**: Full user administration interface (`AdminDashboardPage`) allowing `FLEET_MANAGER` users to view all platform users, update roles, and soft-delete accounts, backed by `AdminContext` and `useAdmin` hook.
14. **Safety Officer Dashboard**: Dedicated read-only portal for `SAFETY_OFFICER` role with overview metrics, driver safety scores, vehicle inspection status, maintenance tracking, and compliance reports across 5 sub-pages.
15. **File Upload Module**: Dedicated `/api/upload` endpoint for handling image and document uploads via the `upload` module.
16. **Vehicle Documents**: Stores vehicle registrations, insurance forms, and PUC certificates safely using secure storage integrations (e.g., ImageKit).
17. **Settings**: Configures system configurations, theme adjustments, compliance limits, and notifications settings.
18. **Global Search**: Provides fuzzy search capabilities across all vehicles, drivers, and trips directly.

---

## Role-Based Access Control (RBAC)

TransitOps enforces role limits on both frontend routes and backend APIs:

* **FLEET_MANAGER**: Full administrative control over logistics. Can add/modify vehicles, drivers, trips, maintenance orders, configure settings, and access the Admin Users panel and Finance Portal.
* **DRIVER**: Restricted access to view and update their own assigned trips and log fuel inputs or trip expenses. Cannot view administrative dashboards or modify settings.
* **SAFETY_OFFICER**: Read-only oversight of driver profiles, licenses, safety metrics, and vehicle inspection documents. Authorized to update safety scores and toggle driver suspensions.
* **FINANCIAL_ANALYST**: Read-only access to operational logs, but has read/write privileges over expense logs and financial reports. Has a dedicated finance portal with dashboard, expenses, fuel logs, and reports.
* **ADMIN**: Absolute control over the system, including user role updates and complete DB operations.

---

## Frontend Routes

All authenticated routes are wrapped in `ProtectedRoute` and rendered inside `RoleDashboardLayout`, which provides the role-specific sidebar navigation, top navbar, and toast notification system.

### Authentication (Public)

| Path | Component | Description |
| :--- | :--- | :--- |
| `/login` | `Login` | User login page |
| `/register` | `Register` | New user registration with OTP email verification |
| `/verify-email` | `VerifyEmail` | Email OTP confirmation page |
| `/forgot-password` | `ForgotPassword` | Password recovery via email OTP |

### Fleet Manager Portal (`/fleet-manager`)

| Path | Component | Description |
| :--- | :--- | :--- |
| `/fleet-manager` | `FleetManagerDashboard` | Fleet overview & KPIs |
| `/fleet-manager/vehicles` | `VehiclesPage` | Vehicle fleet management |
| `/fleet-manager/drivers` | `DriversPage` | Driver records & status |
| `/fleet-manager/trips` | `TripsPage` | Trip scheduling & dispatch |
| `/fleet-manager/maintenance` | `MaintenancePage` | Maintenance order management |
| `/fleet-manager/fuel-expenses` | `FuelExpensesPage` | Fuel & expense logs |
| `/fleet-manager/reports` | `ReportsPage` | Reports & analytics |
| `/fleet-manager/users` | `UsersPage` | Users list view |
| `/fleet-manager/settings` | `SettingsPage` | System settings |
| `/fleet-manager/admin/users` | `AdminDashboardPage` | Admin user management panel |
| `/fleet-manager/finance/dashboard` | `FinanceDashboardPage` | Financial overview |
| `/fleet-manager/finance/expenses` | `FinanceExpensesPage` | Expenses management |
| `/fleet-manager/finance/fuel` | `FinanceFuelPage` | Fuel log finance view |
| `/fleet-manager/finance/reports` | `FinanceReportsPage` | Financial reports & analytics |

### Driver Portal (`/driver`)

| Path | Component | Description |
| :--- | :--- | :--- |
| `/driver` | `DriverDashboard` | Driver personal dashboard |

### Safety Officer Portal (`/safety-officer`)

| Path | Component | Description |
| :--- | :--- | :--- |
| `/safety-officer` | `SafetyOfficerDashboard` | Safety overview & compliance KPIs |
| `/safety-officer/drivers` | `SafetyDriversPage` | Driver safety scores & license status |
| `/safety-officer/vehicles` | `SafetyVehiclesPage` | Vehicle inspection & status overview |
| `/safety-officer/maintenance` | `SafetyMaintenancePage` | Maintenance records (read-only) |
| `/safety-officer/reports` | `SafetyReportsPage` | Safety compliance reports |

### Financial Analyst Portal (`/financial-analyst`)

| Path | Component | Description |
| :--- | :--- | :--- |
| `/financial-analyst` | `FinanceDashboardPage` | Financial analytics dashboard |
| `/financial-analyst/expenses` | `FinanceExpensesPage` | Expense records & categories |
| `/financial-analyst/fuel` | `FinanceFuelPage` | Fuel log analytics |
| `/financial-analyst/reports` | `FinanceReportsPage` | Financial reports & exports |

### Demo / Template (Development Reference)

| Path | Component | Description |
| :--- | :--- | :--- |
| `/demo/dashboard` | `DashboardTemplatePage` | Template dashboard reference |
| `/demo/crud` | `CrudTemplatePage` | Template CRUD reference |

---

## API Endpoint Reference

All endpoints are prefix-routed through `/api` and require a valid auth cookie or JWT header via the [auth.routes.js](server/src/modules/auth/routes/auth.routes.js) middleware.

### Authentication & Users
- Router: [auth.routes.js](server/src/modules/auth/routes/auth.routes.js), [user.routes.js](server/src/modules/auth/routes/user.routes.js)

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Login user, issues JWT cookie | Public |
| `POST` | `/api/auth/logout` | Invalidate current JWT session | Public |
| `POST` | `/api/auth/forgot-password`| Send recovery email | Public |
| `POST` | `/api/auth/reset-password` | Set new password with email OTP | Public |
| `POST` | `/api/auth/verify-email` | Verify registration email OTP | Public |
| `GET` | `/api/auth/me` | Fetch authenticated session profile | Authenticated |
| `PATCH` | `/api/users/profile` | Update user metadata | Authenticated |
| `PATCH` | `/api/users/change-password` | Update current account password | Authenticated |
| `GET` | `/api/users` | List all users (Paginated) | `ADMIN` |
| `PATCH` | `/api/users/:id/role` | Update user roles | `ADMIN` |
| `DELETE`| `/api/users/:id` | Delete user account | `ADMIN` |

### Dashboard
- Router: [dashboard.routes.js](server/src/modules/dashboard/routes/dashboard.routes.js)

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Main summary payload | Authenticated |
| `GET` | `/api/dashboard/kpis` | Key performance indicators | Authenticated |
| `GET` | `/api/dashboard/recent-activities` | System-wide activity logs | Authenticated |

### Driver Management
- Router: [driver.routes.js](server/src/modules/driver/routes/driver.routes.js)

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/drivers` | List drivers | `FLEET_MANAGER`, `SAFETY_OFFICER`, `ADMIN` |
| `GET` | `/api/drivers/available` | List drivers ready for trip assignments | `FLEET_MANAGER`, `ADMIN` |
| `GET` | `/api/drivers/expiring-license`| Drivers with expiring licenses | `FLEET_MANAGER`, `SAFETY_OFFICER`, `ADMIN` |
| `POST` | `/api/drivers` | Register new driver | `FLEET_MANAGER`, `ADMIN` |
| `GET` | `/api/drivers/:id` | Detailed driver profile | Reader Roles, or assigned `DRIVER` |
| `PATCH` | `/api/drivers/:id` | Update driver details | `FLEET_MANAGER`, `ADMIN` |
| `PATCH` | `/api/drivers/:id/status` | Update driver work status | `FLEET_MANAGER`, `ADMIN` |
| `PATCH` | `/api/drivers/:id/safety-score`| Adjust driver safety rating | `FLEET_MANAGER`, `SAFETY_OFFICER`, `ADMIN` |
| `PATCH` | `/api/drivers/:id/suspend` | Suspend driver for compliance issues | `FLEET_MANAGER`, `SAFETY_OFFICER`, `ADMIN` |

### Vehicle Management
- Router: [vehicle.routes.js](server/src/modules/vehicle/routes/vehicle.routes.js)

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/vehicles` | List fleet vehicles | `FLEET_MANAGER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`, `ADMIN` |
| `GET` | `/api/vehicles/available` | Vehicles ready for trip assignment | `FLEET_MANAGER`, `ADMIN` |
| `POST` | `/api/vehicles` | Register new vehicle | `FLEET_MANAGER`, `ADMIN` |
| `GET` | `/api/vehicles/:id` | Vehicle information details | Reader Roles |
| `PATCH` | `/api/vehicles/:id` | Update vehicle metadata | `FLEET_MANAGER`, `ADMIN` |
| `PATCH` | `/api/vehicles/:id/status`| Update operational status | `FLEET_MANAGER`, `ADMIN` |
| `PATCH` | `/api/vehicles/:id/retire`| Flag vehicle as permanently retired | `FLEET_MANAGER`, `ADMIN` |

### Trip Management
- Router: [trip.routes.js](server/src/modules/trip/routes/trip.routes.js)

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/trips` | List all system trips | Reader Roles, or assigned `DRIVER` |
| `POST` | `/api/trips` | Schedule a new trip | `FLEET_MANAGER`, `ADMIN` |
| `GET` | `/api/trips/:id` | Trip information details | Reader Roles, or assigned `DRIVER` |
| `PATCH` | `/api/trips/:id` | Modify trip data | `FLEET_MANAGER`, `ADMIN` |
| `POST` | `/api/trips/:id/dispatch`| Transition trip to active dispatch | `FLEET_MANAGER`, `ADMIN` |
| `POST` | `/api/trips/:id/start` | Driver marks trip as started | `FLEET_MANAGER`, `ADMIN`, assigned `DRIVER` |
| `POST` | `/api/trips/:id/complete`| Driver marks trip as completed | `FLEET_MANAGER`, `ADMIN`, assigned `DRIVER` |
| `POST` | `/api/trips/:id/cancel` | Cancel scheduled trip | `FLEET_MANAGER`, `ADMIN` |

### Fuel Logs
- Router: [fuelLog.routes.js](server/src/modules/fuel-log/routes/fuelLog.routes.js)

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/fuel-logs` | List fuel records | Reader Roles, or logged-in `DRIVER` |
| `POST` | `/api/fuel-logs` | Log new fuel intake | `FLEET_MANAGER`, `ADMIN`, `DRIVER` |
| `GET` | `/api/fuel-logs/summary` | Aggregate fuel efficiency & cost metrics | `FLEET_MANAGER`, `FINANCIAL_ANALYST`, `ADMIN` |
| `GET` | `/api/fuel-logs/vehicle/:vehicleId`| Vehicle-specific fuel list | Reader Roles |
| `PATCH` | `/api/fuel-logs/:id` | Edit fuel record details | `FLEET_MANAGER`, `ADMIN` |
| `DELETE`| `/api/fuel-logs/:id` | Remove fuel log | `FLEET_MANAGER`, `ADMIN` |

### Maintenance
- Router: [maintenance.routes.js](server/src/modules/maintenance/routes/maintenance.routes.js)

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/maintenance` | List maintenance log | Reader Roles |
| `GET` | `/api/maintenance/active` | Active maintenance records | Reader Roles |
| `POST` | `/api/maintenance` | Schedule new servicing order | `FLEET_MANAGER`, `ADMIN` |
| `PATCH` | `/api/maintenance/:id` | Update maintenance progress | `FLEET_MANAGER`, `ADMIN` |
| `POST` | `/api/maintenance/:id/close`| Complete service, release vehicle | `FLEET_MANAGER`, `ADMIN` |
| `POST` | `/api/maintenance/:id/cancel`| Cancel scheduled servicing | `FLEET_MANAGER`, `ADMIN` |

### Expense Management
- Router: [expense.routes.js](server/src/modules/expense/routes/expense.routes.js)

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/expenses` | List logged expenses | Reader Roles, or logged-in `DRIVER` |
| `POST` | `/api/expenses` | Add new operational expense | `FLEET_MANAGER`, `DRIVER`, `ADMIN` |
| `GET` | `/api/expenses/summary` | Aggregate category-wise expenses | `FLEET_MANAGER`, `FINANCIAL_ANALYST`, `ADMIN` |
| `PATCH` | `/api/expenses/:id` | Update expense record | `FLEET_MANAGER`, `ADMIN` |
| `DELETE`| `/api/expenses/:id` | Remove expense record | `FLEET_MANAGER`, `ADMIN` |

### Finance Portal
- Router: [finance.routes.js](server/src/modules/finance/routes/finance.routes.js)

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/finance/dashboard` | Aggregated financial overview | `FLEET_MANAGER`, `FINANCIAL_ANALYST` |
| `GET` | `/api/finance/expenses` | Finance-scoped expense list | `FLEET_MANAGER`, `FINANCIAL_ANALYST` |
| `POST` | `/api/finance/expenses` | Create new finance expense | `FLEET_MANAGER`, `FINANCIAL_ANALYST` |
| `GET` | `/api/finance/fuel` | Finance-scoped fuel log list | `FLEET_MANAGER`, `FINANCIAL_ANALYST` |
| `GET` | `/api/finance/reports` | Financial reports & analytics | `FLEET_MANAGER`, `FINANCIAL_ANALYST` |

### Reports, Analytics, Notifications, Documents
- Router: [report.routes.js](server/src/modules/report/routes/report.routes.js), [analytics.routes.js](server/src/modules/analytics/routes/analytics.routes.js), [notification.routes.js](server/src/modules/notifications/routes/notification.routes.js), [vehicleDocument.routes.js](server/src/modules/vehicle-documents/routes/vehicleDocument.routes.js), [settings.routes.js](server/src/modules/settings/routes/settings.routes.js), [search.routes.js](server/src/modules/search/routes/search.routes.js)

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/fleet` | Fetch overall fleet operations report | `FLEET_MANAGER`, `FINANCIAL_ANALYST`, `ADMIN` |
| `GET` | `/api/reports/export/pdf` | Export selected report to PDF | `FLEET_MANAGER`, `FINANCIAL_ANALYST`, `ADMIN` |
| `GET` | `/api/reports/export/csv` | Export selected report to CSV | `FLEET_MANAGER`, `FINANCIAL_ANALYST`, `ADMIN` |
| `GET` | `/api/analytics/fuel-efficiency` | Monthly fleet utilization ROI/KPIs | `FLEET_MANAGER`, `FINANCIAL_ANALYST`, `ADMIN` |
| `GET` | `/api/notifications` | Fetch current active user alerts | Authenticated |
| `PATCH`| `/api/notifications/read-all` | Mark all alerts as read | Authenticated |
| `POST` | `/api/notifications/license-reminder` | Manually run driver license check reminders | `FLEET_MANAGER`, `ADMIN` |
| `POST` | `/api/upload` | Upload a file (image/document) | Authenticated |
| `POST` | `/api/vehicle-documents` | Upload registration/PUC/insurance file | `FLEET_MANAGER`, `ADMIN` |
| `GET` | `/api/vehicle-documents/:vehicleId` | List documents for a vehicle | Authenticated |
| `PATCH`| `/api/settings/fleet-rules` | Configure compliance thresholds | `FLEET_MANAGER`, `ADMIN` |
| `GET` | `/api/search` | Full-text global system query | Authenticated |

---

## Tech Stack

### Frontend (`client/`)
* **Framework**: React 19 + Vite
* **Routing**: React Router 7
* **Styling**: Modular SCSS (SASS-embedded)
* **Icons**: Lucide React + Remix Icons (`ri-*`)
* **Network Client**: Axios

### Backend (`server/`)
* **Runtime & Framework**: Node.js & Express 5
* **Database ORM**: Drizzle ORM
* **Database Engine**: PostgreSQL (`pg` client)
* **Cache Store**: Redis (`ioredis`)
* **Security & Validation**: bcryptjs, JSON Web Tokens (JWT), express-rate-limit, and express-validator
* **Integrations**: Google APIs / Nodemailer (Mailer), ImageKit for document hosting

---

## Prerequisites

Make sure the following are installed locally:
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [PostgreSQL](https://www.postgresql.org/) (or access to a remote database)
* [Redis](https://redis.io/) (or a cloud Redis instance)

---

## Getting Started

### 1. Environment Setup

Configure environment variables for both the client and server.

#### Server Configuration (`server/.env`)
Create a `.env` file inside the `server/` directory:

```env
SERVER_PORT=3000
SERVER_URL=http://localhost:3000
CLIENT_ORIGINS=http://localhost:5173
NODE_ENV=development

JWT_SECRET=your_jwt_secret

REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_SENDER_EMAIL=your_sender_email

IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key

DATABASE_URL=postgresql://username:password@localhost:5432/transitops
```

#### Client Configuration (`client/.env`)
Create a `.env` file inside the `client/` directory:

```env
VITE_API_URL=http://localhost:3000
```

### 2. Dependency Installation & Startup

#### Run Backend Server
Open a terminal in the root directory and run:

```bash
cd server
npm install
node src/db/migrate.js  # Apply database migrations
node src/db/seed.js     # Seed initial lookup records & user roles
npm run dev             # Start development server via nodemon
```

#### Run Frontend Client
Open another terminal in the root directory and run:

```bash
cd client
npm install
npm run dev             # Start development server (defaults to http://localhost:5173)
```

---

## UI Components & Design System

The frontend implements a unified design system that defines ERP starter components, layout templates, data tables, and input forms documented in [template-component-docs.md](client/src/features/template/template-component-docs.md).

### Key Shared Components

| Component | Location | Purpose |
| :--- | :--- | :--- |
| `RoleDashboardLayout` | `shared/layouts/` | Universal wrapper for all role portals — provides `AppLayout`, `Sidebar`, `TopNavbar`, and `ToastProvider` |
| `Sidebar` | `shared/components/` | Role-aware navigation sidebar with collapsible sub-menus |
| `NotificationsBell` | `shared/components/` | Real-time notification indicator in the top navbar |
| `ProtectedRoute` | `auth/components/` | Route guard enforcing authentication and role restrictions |
| `PasswordMeter` | `auth/components/` | Visual password strength indicator on register/reset forms |

### Auth UI
The authentication pages (`Login`, `Register`, `VerifyEmail`, `ForgotPassword`) were redesigned with a modern, premium aesthetic. See [AUTH_UI_CHANGES.md](docs/AUTH_UI_CHANGES.md) for a full changelog of the visual improvements.

---

## Verification & Testing

TransitOps comes equipped with a suite of automated JavaScript test runner scripts to verify service layers, DAO integrations, and routing flows in isolation.

To run verification scripts, navigate to the `server` folder and execute any of the following node scripts:

* **Fuel Logs Integration Verification:**
  ```bash
  node src/utils/test-fuel-logs.js
  ```
* **Maintenance Flow Verification:**
  ```bash
  node src/utils/test-maintenance.js
  ```
* **Expense Logging Verification:**
  ```bash
  node src/utils/test-expenses.js
  ```
* **Analytical Reports Verification:**
  ```bash
  node src/utils/test-reports.js
  ```
* **Metrics & Analytics Trend Verification:**
  ```bash
  node src/utils/test-analytics.js
  ```
