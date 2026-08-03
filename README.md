# Garuda NDPS — Monitoring & Intelligence Management System

**Client:** Tirupati District Police & Excise Department  
**Project Scope:** Case monitoring, offender tracking, drug distribution analytics, technical surveillance, enforcement checking, and legal tracking (cases from 2016 to 2026).

---

## 1. Project Overview & Features

Garuda is a dedicated web application designed to empower enforcement authorities (Police & Excise Departments) in monitoring NDPS (Narcotic Drugs and Psychotropic Substances) violations in the Tirupati district. The system supports:

- **Interactive Dashboard:** Live KPIs, station-wise data breakdowns, drug seizure analytics, recent alert feeds, date/department filters, and an absconder ticker with real-time Server-Sent Events (SSE) updates.
- **Offender & Consumer Database:** Detailed profile tracking including biometric/identity indicators (e.g., Aadhaar, Voter ID, PAN with secure audit-logged viewing), consumer tagging, case history timelines, interrogation logs, and CSV/Excel data export.
- **South India Data Bank:** Inter-state NDPS offender tracking dataset, multi-column search, and state/station filtering for cross-jurisdictional intelligence sharing.
- **Case Lifecycle Management:** Advanced tracking from case registration (FIR), seizures, accused listing, to charge-sheet filing, court hearings, and bail records.
- **Enforcement Module:** Categorized field checking and reporting featuring 14 distinct check types (Vehicle Check, Lodge Check, Drunk Driving, Courier Check, Railway Check, Bus Stand Check, Rowdy Sheeter inspections, Bound Over tracking, MV Act, Petty Cases, Palle Nidra, Drone Surveillance, Village Visits, and NDPS Verification). Supports dynamic record matching with the offender database and workflow-based officer reviews.
- **Specialized Analysis Modules:** Dedicated interfaces for Technical Surveillance (IMEI and SIM tracking), Financial Analysis (UPI/bank transaction mapping with statement parsers), Network & Chain Analysis (peddler, transporter, and kingpin mapping), and Field Staff entry logs.
- **Bulk Import & Processing Engine:** Admin pipeline allowing bulk imports of historical Daily Progress Reports (DPR), bank statements, tower dump logs, and offender spreadsheets with real-time progress logging and concurrency locking.
- **File Security & Upload Defense:** Multi-layered security utilities including zip-bomb protection, magic-byte file signature validation, EXIF metadata stripping/image sanitization, and strict file extension filtering.
- **Password & Credential Security:** Password strength policy enforcement, password history tracking to prevent reuse, and integration with HaveIBeenPwned API for compromised password checks.
- **Workflows & Governance:** Robust audit-logged workflow authorization chain (Flagged, Escalated, Requested, Approved, Deleted) for record deletions and edits.

---

## 2. Technology Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4, Recharts (for data visualization), React Router DOM 6
- **Backend:** Express 5, TypeScript, tsx (TypeScript execution engine), Server-Sent Events (SSE) for live alerts
- **Service Layer:** SOLID principles decoupled architecture (`src/services/` for business logic, controllers for request/response handling)
- **Security & Upload Utilities:** Sharp (image sanitization & metadata stripping), HaveIBeenPwned API integration, Multer file upload validation with zip-bomb & magic-byte detection
- **ORM:** Prisma 5
- **Database:** PostgreSQL (with seeded Excise and Police stations, teams, and sample data)
- **API Testing:** Postman Collection (`garuda_ndps_tpt.postman_collection.json`) and Environment (`garuda_ndps_tpt.postman_environment.json`)

---

## 3. Directory Structure

```
GarudaNDPS_TPT/
├── backend/                 # Express + TypeScript API
│   ├── prisma/
│   │   ├── schema.prisma   # PostgreSQL database schema (cases, offenders, enforcement, etc.)
│   │   └── migrations/     # Prisma migration scripts
│   ├── scripts/            # Database seeding, maintenance, and migration scripts
│   │   ├── seed-full.ts    # Master seed (Police/Excise stations, teams, roles, test users)
│   │   ├── seed-offenders.ts # Historical offender & consumer data seed
│   │   ├── seed-vehicles.ts  # Seized vehicles dataset seed
│   │   ├── seed-enforcement.ts # Enforcement check records seed
│   │   ├── seed-preventive-modules.ts # 13 preventive field check modules seed
│   │   ├── check-db.ts     # Database connectivity & count inspector
│   │   ├── check-admin.ts  # Admin user state inspector
│   │   ├── clear-offenders.ts # Offender dataset cleanup script
│   │   └── update-arrest-status-enum.js # Schema enum updates
│   ├── src/
│   │   ├── server.ts        # Express application registration and server startup
│   │   ├── config/          # Constants and RBAC permissions matrix
│   │   ├── controllers/     # Controllers (auth, cases, dashboard, enforcement, import, etc.)
│   │   ├── middleware/      # Auth, permission scope, and secure file upload middlewares
│   │   ├── routes/          # Express API route endpoints
│   │   ├── services/        # Decoupled business logic service layer (SOLID pattern)
│   │   │   ├── cases.service.ts
│   │   │   ├── dashboard.service.ts
│   │   │   ├── enforcement.service.ts
│   │   │   ├── finance-analysis.service.ts
│   │   │   ├── intelligence.service.ts
│   │   │   ├── offenders.service.ts
│   │   │   ├── statement-parser.service.ts
│   │   │   ├── surveillance-analysis.service.ts
│   │   │   └── tower-parser.service.ts
│   │   └── utils/           # PII masking, scope filtering, file security, image sanitizer, breached passwords
│   │       ├── audit-logger.ts
│   │       ├── breached-password.ts
│   │       ├── error-handler.ts
│   │       ├── file-security.ts
│   │       ├── image-sanitizer.ts
│   │       ├── password-history.ts
│   │       ├── password-policy.ts
│   │       └── pdf-history-sheet.ts
│   └── src/__tests__/       # Test suites
├── frontend/                # React SPA
│   ├── public/              # Public static assets
│   ├── src/
│   │   ├── components/      # UI components (CustomSelect, CaseLifecyclePanel, Layout)
│   │   │   └── enforcement/ # Field check form components (Vehicle Check, Lodge Check, etc.)
│   │   ├── pages/           # Feature pages by module
│   │   │   ├── admin/       # Admin tools (User Management, Audit Logs, DPR Import)
│   │   │   ├── cases/       # Case management, creation, and details
│   │   │   ├── databank/    # South India Data Bank (inter-state offenders dataset)
│   │   │   ├── field/       # Field staff entry panel
│   │   │   ├── finance/     # Financial analysis portal
│   │   │   ├── network/     # Network mapping & chain analysis
│   │   │   ├── offenders/   # Offender lists, consumer profiles, creation & edit dashboard
│   │   │   ├── reports/     # Monthly abstract & reports generation
│   │   │   ├── surveillance/# Technical surveillance tracking
│   │   │   ├── vehicles/    # Seized vehicles management
│   │   │   ├── workflows/   # Deletion and edit approval workflows
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Enforcement.jsx
│   │   │   └── DistrictAnalytics.jsx
│   │   ├── context/         # React Auth Context
│   │   ├── hooks/           # Custom hooks (e.g., usePermissions, useDashboardData)
│   │   ├── main.jsx         # App router and entrypoint
│   │   └── index.css        # Custom styling system and CSS variables
│   └── vite.config.js       # Vite build and proxy config
├── docs/                    # Technical documentation suite (20 detailed guides & specs)
│   ├── project-overview.md
│   ├── api-documentation.md
│   ├── security-standards.md
│   ├── ndps-implementation-roadmap.md
│   ├── postman.md
│   └── phase1-implementation-plan.md
├── garuda_ndps_tpt.postman_collection.json # Postman API collection
└── garuda_ndps_tpt.postman_environment.json # Postman environment configuration
```

---

## 4. Setup & Running the Application

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **PostgreSQL** (v14 or higher)

### Step 1: Environment Configuration
Create a `.env` file in the `backend/` directory based on `.env.example`. Update the database URL with your local PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/postgres?schema=public"
PORT=8081
JWT_SECRET="YOUR_SECURE_JWT_SECRET"
```

### Step 2: Install Dependencies
Run the installation command in both `backend` and `frontend` folders:
```bash
# In backend/
npm install

# In frontend/
npm install
```
*(Note: If script execution is disabled in PowerShell on Windows, you can prepend commands with `cmd /c`.)*

### Step 3: Run Database Migrations & Seed Data
Initialize your PostgreSQL database schemas and populate master stations, test users, and modular data using the scripts in `backend/scripts/`:
```bash
# In backend/
# 1. Run migrations
npx prisma migrate dev

# 2. Seed core master database (Stations, Teams, Roles, Test Users)
npx tsx scripts/seed-full.ts

# 3. Seed modular data (Offenders, Vehicles, Enforcement, and Preventive checks)
npx tsx scripts/seed-offenders.ts
npx tsx scripts/seed-vehicles.ts
npx tsx scripts/seed-enforcement.ts
npx tsx scripts/seed-preventive-modules.ts

# 4. Check connectivity & database record counts
npx tsx scripts/check-db.ts
```

### Step 3b: Available Utility & Seeding Scripts
In the `backend/` directory, several utility scripts are available under `scripts/`:
- **`scripts/seed-full.ts`**: Seeds master police & excise stations, teams, and default role-based test users.
- **`scripts/seed-offenders.ts`**: Seeds historical offender & consumer profiles, identity documents, and drug profiles.
- **`scripts/seed-vehicles.ts`**: Seeds sample seized vehicles records linked to cases.
- **`scripts/seed-enforcement.ts`**: Seeds initial enforcement check reports.
- **`scripts/seed-preventive-modules.ts`**: Seeds 13 types of preventive field checks distributed across stations and officers.
- **`scripts/check-db.ts`**: Performs database check and displays a summary table of database record counts.
- **`scripts/check-admin.ts`**: Verifies administrator accounts and credentials.
- **`scripts/clear-offenders.ts`**: Clears historical offender profiles for clean re-testing.
- **`scripts/migrate-roles.ts`**: Utility to update user roles schema in database.

### Step 4: Run Application Servers
Start both the backend API and frontend development servers.

**Start the Backend:**
```bash
# In backend/
npm run dev
# The backend will start on http://localhost:8081
```

**Start the Frontend:**
```bash
# In frontend/
npm run dev
# The frontend will start on http://localhost:3000
```
Vite is configured to automatically proxy API requests from `/api/*` to the backend on `http://localhost:8081`.

### Step 5: API Testing with Postman
Import `garuda_ndps_tpt.postman_collection.json` and `garuda_ndps_tpt.postman_environment.json` into Postman to test backend endpoints with pre-configured authentication and sample payloads.

---

## 5. Seeded Test Users & Logins

You can log in to the application using the following test credentials seeded via `scripts/seed-full.ts` (all default passwords are `password123`):

| Role | Username | Password | Department Scope | Station / Division Scope |
|---|---|---|---|---|
| **SP** | `sp` | `password123` | POLICE | District-level Admin (All stations) |
| **ASP** | `asp` | `password123` | POLICE | Narcotics Task Force (District) |
| **SDPO** | `sdpo` | `password123` | POLICE | Renigunta SDPO Division |
| **SHO** | `sho` | `password123` | POLICE | Tirupathi East PS |
| **Constable** | `constable` | `password123` | POLICE | Tirupathi East PS |
| **Cyber SDPO** | `cyber_sdpo` | `password123` | CYBER_ANALYTICS | Cyber Surveillance Unit (Tirupati SDPO Division) |
| **Cyber SHO** | `cyber_sho` | `password123` | CYBER_ANALYTICS | Cyber Surveillance Unit |
| **Excise SHO** | `excise_sho` | `password123` | EXCISE | Excise PS Tirupati Urban |
| **Excise SI** | `excise_si` | `password123` | EXCISE | Excise PS Tirupati Urban |

---

## 6. Architecture, Security & Permissions

### Rank & Department Roles (RBAC)
Permissions are evaluated based on a two-axis matrix defined in `backend/src/config/roles.ts`:
1. **Rank (`user_role`):** `ADMIN`, `SP`, `ASP`, `SDPO` (DSP equivalent), `SHO` (CI equivalent), `CONSTABLE`
2. **Department (`department_type`):** `POLICE` (Standard Operations), `CYBER_ANALYTICS` (Cyber Surveillance Unit), `EXCISE` (Excise Police Stations)

### Row-level Scope Filtering
The system automatically limits data visibility depending on the user's role and assigned jurisdiction:
- **SP/ASP:** Access to all records across the district.
- **SDPO:** Access filtered to cases, offenders, and enforcement checks within their division scope.
- **SHO/Constable:** Access filtered to records within their assigned police or excise station.
- **SI (Case Officers):** Restricted to viewing and editing cases they personally registered.
- **Cyber / Specialty Cells:** Access filtered by department types (e.g., CYBER_ANALYTICS has tech-cell specific views).

### File Security & Validation Infrastructure
File uploads (e.g. DPR imports, bank statements, offender attachments) are protected by `backend/src/utils/file-security.ts` and `image-sanitizer.ts`:
- **Zip-Bomb Protection:** Recursive archive detection and decompression ratio analysis.
- **Magic-Byte Signature Check:** Validates file type headers against declared MIME types.
- **EXIF Sanitization:** Automatically strips sensitive GPS and camera metadata from image uploads using Sharp.
- **Concurrency Locks:** Prevents overlapping import operations from corrupting database state.

### Password Security & Compliance
Account authentication features enhanced security controls in `backend/src/utils/`:
- **Password Strength:** Enforces minimum complexity rules (length, upper/lower, numbers, special characters).
- **Breached Password Checks:** Checks passwords against HaveIBeenPwned API during registration and resets.
- **Password History:** Maintains encrypted password history logs to block password reuse.

---

## 7. Documentation Suite

For deeper architectural, security, and API documentation, refer to the files in the `docs/` directory:
- [project-overview.md](file:///c:/Projects/GarudaNDPS_TPT/docs/project-overview.md) — Comprehensive project architecture overview.
- [api-documentation.md](file:///c:/Projects/GarudaNDPS_TPT/docs/api-documentation.md) — Detailed REST API endpoint specifications.
- [security-standards.md](file:///c:/Projects/GarudaNDPS_TPT/docs/security-standards.md) — System security, PII protection, and upload validation standards.
- [ndps-implementation-roadmap.md](file:///c:/Projects/GarudaNDPS_TPT/docs/ndps-implementation-roadmap.md) — Multi-phase development roadmap.
- [postman.md](file:///c:/Projects/GarudaNDPS_TPT/docs/postman.md) — Postman collection usage and testing guide.

