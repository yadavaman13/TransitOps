# TransitOps

## Team Members & Roles

| Member Name | Role | Core Responsibilities |
| :--- | :--- | :--- |
| **Aman Yadav** | Full Stack | Overall architecture, Backend API |
| **Aryan Patel** | Full Stack | REST API design, route validation, JWT authentication |
| **Iteshkumar Prajapati** | Full Stack | REST API design | client state | 
| **Ankur Singh** | Full Stack | Database migrations, and endpoint testing |

---

## We Selected TransitOps

The system is designed with a React-based client dashboard and an Express/Node.js backend database application using PostgreSQL and Drizzle ORM.

## Project Structure

The project is structured into two main subdirectories:

*   **`client/`**: React single-page application built on Vite, using SASS/SCSS for styling, and React Router for routing.
*   **`server/`**: Node/Express backend that handles user authentication, operational schemas, caching, notifications, and integration with third-party service APIs.

### Directory Layout

```text
TransitOps/
├── client/                     # Frontend client dashboard
│   ├── src/
│   │   ├── features/
│   │   │   ├── admin/          # Admin portal features (e.g. user management)
│   │   │   │   ├── hooks/
│   │   │   │   ├── pages/      # Admin dashboard pages
│   │   │   │   ├── services/   # Admin API integration services
│   │   │   │   └── styles/
│   │   │   ├── auth/           # Authentication features (Login, Register, verification)
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── pages/
│   │   │   │   └── services/
│   │   │   ├── shared/         # Reusable layouts, context providers, and pages
│   │   │   └── template/       # ERP style UI component library & reference implementation
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
│   │   │   └── auth/           # Authentication endpoints, controllers & middlewares
│   │   ├── services/           # Service layer for external APIs (Google, ImageKit)
│   │   ├── utils/              # Helper utility functions & custom error classes
│   │   ├── validators/         # Global request validation helpers
│   │   └── app.js              # Express app setup, logging, cors, rate-limits
│   ├── server.js               # Entrypoint script that starts the API server listener
│   ├── drizzle.config.js       # Drizzle CLI tools configurator
│   └── package.json            # Backend dependency specifications
│
├── DESIGN.md                   # Brand visual specs & layout spacing system
└── README.md                   # Project description, installation steps & team info
```


---

## Tech Stack

### Frontend (`client/`)
*   **Framework**: React 19 + Vite
*   **Routing**: React Router 7
*   **Styling**: Modular SCSS (SASS-embedded)
*   **Icons**: Lucide React
*   **Network Client**: Axios

### Backend (`server/`)
*   **Runtime & Framework**: Node.js & Express 5
*   **Database ORM**: Drizzle ORM
*   **Database Engine**: PostgreSQL (`pg` client)
*   **Cache Store**: Redis (`ioredis`)
*   **Security & Validation**: bcryptjs, JSON Web Tokens (JWT), express-rate-limit, and express-validator
*   **Integrations**: Google OAuth/APIs (Mailer), ImageKit

---

## Prerequisites

Make sure the following are installed locally:
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [PostgreSQL](https://www.postgresql.org/) (or access to a remote database)
*   [Redis](https://redis.io/) (or a cloud Redis instance)

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
npm run dev             # Start development server
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
The frontend implements a unified design system that defines:
*   App tokens, HSL/HEX color variables, typography, and interactive components in [`DESIGN.md`]
*   ERP starter components, layout templates, data tables, and input forms documented in [`client/src/features/template/template-component-docs.md`]
