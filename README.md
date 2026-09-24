# IoTForge — AI-Powered IoT Project Builder

> **Turn your IoT idea into a complete buildable engineering workspace.**

IoTForge is a production-quality SaaS web application that transforms natural language project descriptions into full hardware and software engineering specifications. It generates electrical schematics, pin-to-pin wiring netlists, SVG CAD blueprints, system architecture graphs, multi-file firmware and backend source code, bill of materials (BOM), step-by-step build guides, automated hardware checklists, and safety validation reports.

---

## 🌟 Key Features

### 1. Natural Language AI Hardware Synthesis
- **Structured 8-Stage Pipeline:** Requirements Analysis → Component Recommendation → Pin Allocation → Circuit Netlist → CAD Blueprint → System Architecture → Firmware & API Code → Build & Test Procedures.
- **Provider Agnostic:** Supports OpenAI (`gpt-4o`), Google Gemini (`gemini-1.5-flash`), Anthropic Claude (`claude-3-5-sonnet`), and an offline deterministic **Rule-Based Engineering Engine** ensuring 100% testable, electrically validated output even without cloud API keys.

### 2. Flagship 11-Tab Engineering Workspace
1. **Overview:** Project metadata, complexity rating, estimated cost & power budget, system architecture summary, and safety advisories.
2. **Components:** Technical datasheets, logic levels, vendor purchase links, pricing, and compatibility flags.
3. **Bill of Materials (BOM):** Itemized procurement table with bulk quantities, unit prices, vendor links, and one-click CSV export.
4. **Wiring Canvas:** Interactive node graph powered by `@xyflow/react` (React Flow) visualizing real hardware pin connections with color-coded signal lines (VCC, GND, I2C, SPI, UART, GPIO, Analog).
5. **Pin Mapping Matrix:** High-density hardware pin assignment table (Microcontroller Pin ↔ Component Pin ↔ Signal ↔ Wire Color ↔ Electrical Notes).
6. **CAD Blueprint:** Authentic dark-mode engineering schematic rendered via SVG with crosshair grid, reference dimensions, power rails, component footprints, and ISO title block.
7. **System Architecture:** Interactive visual graph mapping hardware modules, wireless communications, edge gateways, cloud ingestion pipelines, and client apps.
8. **Infrastructure:** Docker Compose configuration, Mosquitto MQTT broker configuration, and PostgreSQL database schemas for complete IoT deployments.
9. **Monaco Code Studio:** Full embedded VS Code editor (`@monaco-editor/react`) featuring syntax highlighting for C++ (Arduino/ESP-IDF), C# (ASP.NET Core Web API), and SQL (PostgreSQL DDL) with live file switching and one-click code copy.
10. **Build Guide:** Sequential construction procedures with estimated time, required tools, and crucial warnings.
11. **Testing Checklist:** Interactive quality-assurance test matrix (Power checks, I2C discovery, WiFi association, Cloud telemetry) with live pass/fail status toggles.

### 3. Electrical & Safety Review Engine
- **Voltage Logic Mismatch Detection:** Warns when 5V logic sensors are connected to 3.3V GPIO without level shifting.
- **Inductive Load Protection:** Flags direct micro-controller GPIO drive of motors/pumps without flyback diodes or relay isolation.
- **AC Mains Isolation Alert:** Enforces optocoupler/relay barriers when handling AC voltages > 50V.
- **GPIO Conflict Analysis:** Detects overlapping pin reservations and warns when high-speed busses (I2C/SPI) are misconfigured.

### 4. Admin Management Console
- System metrics (Total Users, Active Projects, Component Library count, Generation Pipeline throughput).
- User role management (`Admin`, `Engineer`, `Viewer`).
- Master component catalog CRUD with pin definitions, vendor links, and electrical specs.

---

## 🏗️ Architecture & Technology Stack

### Backend
- **Framework:** ASP.NET Core 10 Web API (Clean Architecture: Domain, Application, Infrastructure, API).
- **ORM & Database:** Entity Framework Core with PostgreSQL 15 & connection pooling.
- **Authentication:** BCrypt password hashing + stateless JWT Bearer token authentication with Role-based authorization.
- **API Documentation:** Swashbuckle OpenAPI / Swagger UI with interactive Bearer auth support.
- **Validation:** FluentValidation rules & Custom Hardware Electrical Rule Checkers.

### Frontend
- **Framework:** React 19 + TypeScript + Vite.
- **Styling:** Tailwind CSS v4 with custom dark engineering theme (`#080B12` base, `#101620` surfaces, `#00E5FF` electric cyan accents, and CAD technical grids).
- **Diagrams & Graphs:** `@xyflow/react` (React Flow) for interactive hardware wiring and architecture graphs.
- **Code Editor:** `@monaco-editor/react` (VS Code engine).
- **Icons & Motion:** `lucide-react` + `framer-motion`.

---

## 🚀 Quick Start

### Option A: Local Development

#### 1. Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) & `npm`
- [PostgreSQL 15+](https://www.postgresql.org/) (Running on port 5432)

#### 2. Start PostgreSQL
Ensure PostgreSQL is running on port 5432 with a database named `iotforge`.

#### 3. Backend Environment Configuration (.env)
Create a `.env` file from the provided template:
```bash
cp backend/.env.example backend/.env
# Or use the root template: cp .env.example .env
```
Key backend environment variables:
- `DATABASE_CONNECTION_STRING` — PostgreSQL ADO.NET connection string
- `JWT_SECRET` — 256-bit signing key for JWT tokens
- `CORS_ORIGINS` — Allowed frontend origins (`http://localhost:5173`)
- `AI_PROVIDER` — `DeterministicHardwareEngine` (default offline mode) or `OpenAI` / `Gemini` / `Anthropic`

#### 4. Start the Backend API
```bash
cd backend/IoTForge.API
dotnet run
```
The API starts on `http://localhost:5000`. Swagger documentation is available at `http://localhost:5000/swagger`.

#### 5. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The React application starts on `http://localhost:5173`.

---

### Option B: Docker Compose Deployment

Run the complete multi-tier system with one command:

```bash
docker compose up --build -d
```

| Service | URL | Internal Port |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:80](http://localhost:80) | 80 |
| **Backend API** | [http://localhost:5000/api](http://localhost:5000/api) | 5000 |
| **Swagger UI** | [http://localhost:5000/swagger](http://localhost:5000/swagger) | 5000 |
| **PostgreSQL** | `localhost:5432` | 5432 |
| **Redis** | `localhost:6379` | 6379 |

---

## 🔑 Demo Credentials

The database seeds automatically on first launch with two demo accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Platform Administrator** | `admin@iotforge.io` | `Admin123!` |
| **Hardware Engineer** | `engineer@iotforge.io` | `Engineer123!` |

*(One-click demo autofill buttons are available on the Login screen).*

---

## 🧪 Running Unit & Integration Tests

The solution includes an automated test suite verifying auth security, structured hardware schema generation, and electrical safety validation rules:

```bash
dotnet test backend/IoTForge.Tests/IoTForge.Tests.csproj
```

### Verified Test Cases:
1. `AuthSecurity_HashPassword_VerifiesCorrectly` — BCrypt hashing validation.
2. `AuthSecurity_GenerateJwtToken_ContainsExpectedClaims` — JWT claims, role, and expiration verification.
3. `RuleBasedEngineeringEngine_GeneratesValidSmartIrrigationProject` — Structured schema synthesis test.
4. `CompatibilityValidator_DirectMotorConnection_ReturnsCriticalSafetyIssue` — High-current flyback safety rule.
5. `CompatibilityValidator_MultipleI2CDevices_ValidatesSharedBus` — I2C shared bus address validation.
6. `CompatibilityValidator_GpioConflict_ReturnsConflictError` — Dedicated pin overlap checker.

---

## 📁 Repository Structure

```
IOT_Project/
├── backend/
│   ├── IoTForge.slnx
│   ├── IoTForge.Domain/           # Entities (Project, Component, Connection, etc.)
│   ├── IoTForge.Application/      # DTOs, Services, FluentValidation, Safety Rules
│   ├── IoTForge.Infrastructure/   # EF Core DbContext, AI Engines, Seed Data
│   ├── IoTForge.API/              # Controllers, Program.cs, Middlewares
│   └── IoTForge.Tests/            # xUnit automated tests
├── frontend/
│   ├── src/
│   │   ├── api/                   # Typed API client & interceptors
│   │   ├── components/            # Common UI, Navbar, AppLayout, CommandPalette
│   │   │   └── workspace/         # 11 workspace tab modules (Wiring, Monaco, etc.)
│   │   ├── context/               # AuthContext & ToastContext
│   │   ├── pages/                 # Landing, Auth, Dashboard, NewProject, Workspace, Admin
│   │   └── types/                 # TypeScript interfaces
│   ├── index.html
│   └── vite.config.ts
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📄 License
MIT License. Built for IoT innovators, hardware engineers, and robotics builders worldwide.
# ProjectHub_2027
