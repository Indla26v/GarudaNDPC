# GARUDA NDPS TPT — Complete Project Documentation

## 1. Executive Summary & Project Purpose

**GARUDA NDPS TPT** (Narcotic Drugs and Psychotropic Substances Tracking & Prevention System for Tirupati Police District) is an enterprise law-enforcement platform designed for intelligence-led policing, digital investigation, and real-time tracking of drug peddling networks under the NDPS Act.

The application equips police officers, Special Task Forces, Sub-Divisional Police Officers (SDPOs), Station House Officers (SHOs), and the Superintendent of Police (SP) with unified operational capabilities:
- **Centralized Offender Registry**: Master database of habitual drug peddlers, interstate suppliers, and repeat offenders.
- **FIR & Case Lifecycle Tracking**: Complete tracking from seizure and FIR registration to charge sheet filing (within 180-day statutory period), bail monitoring, court hearings, and trial outcomes.
- **Field Enforcement Modules**: Mobile-responsive field inspection forms (Lodge checks, Bus stand checks, Drunk driving, Drone surveillance, Courier checks, Village visits, Palle Nidra, Rowdy Sheeter tracking).
- **Technical Surveillance & Cyber Analytics**: Cell tower dump intersection analysis, CDR call correlations, mobile number and IMEI tracking, and social media surveillance.
- **Financial Intelligence & Money Flow**: Automated parsing of bank statements and UPI transactions, flow-map generation, counterparty cross-linking, and suspicious transaction detection.
- **Criminal Network Graphing**: Dynamic node-and-edge network visualization exposing hidden links between peddlers, suppliers, financiers, and shared contacts.
- **Strict Governance & Data Protection**: Hierarchical Jurisdiction-Based Access Control (RBAC), Aadhaar number masking with audited unmasking, multi-tier record deletion approval workflows, and immutable audit logging.

---

## 2. System Architecture & Technology Stack

```
                     ┌───────────────────────────────────────────────┐
                     │          React 18 SPA (Vite + JSX)            │
                     │  - Recharts / Vis.js Graph Visualization       │
                     │  - TailwindCSS / Lucide Icons / Axios         │
                     └───────────────────────┬───────────────────────┘
                                             │ HTTPS / REST / SSE
                     ┌───────────────────────▼───────────────────────┐
                     │     Node.js + Express + TypeScript Backend    │
                     │  - Express Middleware (Auth, Security, CORS)  │
                     │  - Prisma ORM 5.x                             │
                     │  - Rate Limiter / Cookie Parser / Multer      │
                     └───────────────────────┬───────────────────────┘
                                             │ TLS
                     ┌───────────────────────▼───────────────────────┐
                     │   Neon Serverless PostgreSQL Database (v16)   │
                     │  - Full Schema / Foreign Keys / Enums          │
                     └───────────────────────────────────────────────┘
```

### Technology Stack Details

#### Frontend Stack
- **Core**: React 18 (JSX), Vite 8
- **Styling**: Tailwind CSS & Modern Custom CSS Tokens
- **Icons**: Lucide React Icons
- **Data Visualization**: Recharts (Analytics Charts), Vis.js Network (Network Mapping Graph)
- **HTTP Client**: Axios with automated credentials pass-through and token refresh handlers
- **State Management**: React Context API (`AuthContext`), Custom Custom Hooks (`usePermissions`, `useIdleTimeout`, `useSSE`)

#### Backend Stack
- **Runtime**: Node.js v20+, TypeScript 5.x
- **Framework**: Express 5.x
- **ORM & DB Layer**: Prisma ORM 5.22, PostgreSQL Driver (`pg`)
- **Authentication & Security**: JSON Web Tokens (`jsonwebtoken`), `bcrypt` password hashing, `express-rate-limit`, secure HTTP-only cookies
- **File & Document Processing**: `multer` (Upload handling), `xlsx` (Excel statement parsing), `pdfkit` & `pdf-parse` (PDF history sheet generation and extraction)
- **Real-Time Layer**: Server-Sent Events (SSE) broadcast engine for immediate alert notifications

---

## 3. Security, Authorization & Jurisdiction Model

### Hierarchical Jurisdiction-Based Access Control (RBAC)

The system enforces strict data scoping based on user roles and police station assignments:

1. **Superintendent of Police (SP) / Additional SP (ASP)**:
   - **Scope**: District-wide access across all police stations in Tirupati District.
   - **Capabilities**: Complete visibility, settings configuration, final deletion execution approval, user management.
2. **Deputy Superintendent of Police (DSP) / Sub-Divisional Officers (SDPO)**:
   - **Scope**: Sub-divisional police stations.
   - **Capabilities**: Approval of edit requests, escalation of deletion requests, sub-divisional analytics.
3. **Station House Officers (SHO) / Inspectors**:
   - **Scope**: Assigned Police Station only.
   - **Capabilities**: Station-level record management, enforcement check approvals, flagging records for deletion.
4. **Investigating Officers (IO) / Sub-Inspectors (SI) / Constables**:
   - **Scope**: Assigned Police Station data.
   - **Capabilities**: Data entry, case recording, field check submission.
5. **Cyber Analytics & Special Cell (CYBER_ANALYTICS)**:
   - **Scope**: Technical surveillance modules, tower dump analytics, financial intelligence tools.

### PII Protection & Audit Logging
- **Aadhaar Masking**: Aadhaar numbers are stored encrypted and displayed masked (`XXXX-XXXX-1234`). Full unmasking requires explicit authorization and generates an immutable audit log record.
- **Audit Logging**: Every sensitive action (login, logout, data edit, deletion flag, PII reveal, CSV/PDF export) is logged in the `audit_logs` table with IP address, user ID, timestamp, and details.

---

## 4. Module-by-Module Capabilities

### 1. Executive Dashboard
- District-wide real-time KPIs: Active Cases, Registered Offenders, Seizures Value (₹), Absconding Peddlers, Chargesheets Pending (>180 days).
- Interactive filter by Police Station, Date Range, and Contraband Type (Ganja, Heroin, MDMA, Synthetic Drugs).
- Recent case activities feed and Server-Sent Event (SSE) live alert notifications.

### 2. Offender Master Database
- Comprehensive profile management: Personal details, Alias, Aadhaar, Caste, Native location, Known associates, Past criminal history.
- Multiple photo attachments, digital finger-print references, and History Sheet status (Active, Inactive, Absconding, Deceased).
- Automated PDF History Sheet generator formatted for judicial submission.
- Interrogation session records with interrogation statements and officer findings.

### 3. Case Management & Legal Tracking
- Complete FIR registration workflow: Crime Number, Section of Law, Date of Seizure, Contraband Type, Quantity (Kg/Grams), Street Value, Source and Destination locations.
- Accused linking: Primary accused, co-accused, suppliers, and receivers.
- **Statutory Chargesheet Countdown**: Automatic alerting system tracking the statutory 180-day deadline under NDPS Act.
- Court hearing diary, bail condition tracking, and surety record management.

### 4. Field Enforcement Modules
- 14 dedicated field check modules designed for handheld and mobile use by officers on duty:
  - **Village Visit**: Record community intelligence and hotspot monitoring.
  - **Lodge Check**: Track guest registers in hotels and lodges.
  - **Courier Check**: Inspect parcel offices and logistics hubs.
  - **Drunk Driving / Drug Testing**: Log field drug-testing kit results.
  - **Railway & Bus Stand Check**: Transit point surveillance logs.
  - **Drone Surveillance**: Record aerial drone search mission logs.
  - **Rowdy Sheeter & Bound Over**: Verification of court-ordered compliance.
  - **Vehicle & MV Act Check**: Record suspicious vehicle inspections.
  - **Petty Cases & Palle Nidra**: Community policing check logs.

### 5. Technical Surveillance & Cyber Analytics
- **Cell Tower Dump Analysis**: Upload Excel/CSV tower dumps to run automated multi-tower intersection algorithms to isolate common mobile numbers active near crime scenes.
- **CDR Correlation Engine**: Cross-matches call detail records between known peddlers to identify communication frequency and network clusters.
- **Target Registers**: Centralized tracking for monitored Mobile Numbers, IMEI numbers, Social Media handles, and Instant Messaging profiles.

### 6. Financial Intelligence & Money Flow
- Automated parser for multi-bank statements (PDF, XLSX, CSV) extracting UPI IDs, Account Numbers, Transaction Amounts, Counterparties, and Timestamps.
- **Flow Map Visualization**: Visual graph mapping fund flow between drug peddlers, hawala agents, and suppliers.
- **Common Counterparty Detection**: Instantly identifies bank accounts or UPI IDs receiving money from multiple unrelated drug peddlers.
- Suspicious transaction alert rules (High velocity transactions, round-amount transfers, night transactions).

### 7. Criminal Network Graphing
- Interactive Node-and-Edge visual network graph powered by Vis.js.
- Graph Nodes represent Offenders, Cases, Phone Numbers, Vehicles, and Bank Accounts.
- Dynamic filtering by node type, link strength, and community clusters to uncover supply chain kingpins.

### 8. Multi-Tier Workflow & Approvals
- **Edit Request System**: Modifications to sealed or historic records require SHO/SI request and DSP approval.
- **5-Step Record Deletion Workflow**: To prevent unauthorized data deletion:
  1. Officer flags record -> 2. SHO escalates -> 3. SDPO formally requests -> 4. SP approves -> 5. System executes deletion.

---

## 5. Database Schema Architecture

The database is built on PostgreSQL with strict relational integrity, indexed keys, and Prisma ORM mappings:

| Table Name | Description | Key Relationships |
| :--- | :--- | :--- |
| `users` | System user accounts, passwords, roles, and police station assignments. | `police_stations`, `audit_logs` |
| `police_stations` | Master register of police stations in Tirupati District. | `users`, `cases`, `offenders` |
| `offenders` | Master drug offender profiles and history sheet metadata. | `case_accused`, `offender_contacts`, `bank_accounts` |
| `cases` | FIR NDPS case records, contraband details, and legal sections. | `police_stations`, `case_accused`, `seizures`, `charge_sheets` |
| `case_accused` | Junction table linking offenders to specific FIR cases with arrest status. | `cases`, `offenders`, `bail_records` |
| `seizures` | Items and contraband seized under cases (Ganja, cash, property). | `cases` |
| `seized_vehicles` | Vehicles seized in NDPS cases with disposal/auction status. | `cases`, `police_stations` |
| `charge_sheets` | Statutory charge sheet filing records and court tracking details. | `cases` |
| `court_hearings` | Court trial dates, judicial orders, and hearing outcomes. | `cases` |
| `bail_records` | Bail grants, condition descriptions, and expiry dates. | `case_accused` |
| `interrogation_sessions` | Interrogation reports, officer notes, and offender confessions. | `offenders`, `cases` |
| `enforcement_checks` | Field enforcement checks submitted by officers on duty. | `police_stations`, `users` |
| `technical_surveillance` | Cyber surveillance targets, CDR records, and cell tower dumps. | `offenders`, `cases` |
| `bank_statements` | Statement upload batches and metadata. | `users`, `financial_transactions` |
| `financial_transactions` | Parsed financial entries with counterparty details and flags. | `bank_statements`, `offenders` |
| `informers` | Secret intelligence assets, codenames, and ratings. | `police_stations`, `users` |
| `edit_requests` | Workflow records for requesting modifications to locked records. | `users` |
| `deletion_requests` | Multi-tier approval workflow entries for record deletions. | `users` |
| `audit_logs` | Immutable audit log of all system security and data operations. | `users` |

---

## 6. Directory Structure & Organization

```
GarudaNDPS_TPT/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma             # PostgreSQL Database Schema
│   ├── scripts/                      # Utility scripts & database seeds
│   │   ├── update-arrest-status-enum.js
│   │   ├── seed-full.ts
│   │   └── ...
│   ├── src/
│   │   ├── config/                   # Prisma client connection pool
│   │   ├── controllers/              # REST Request handlers (kebab-case)
│   │   │   ├── auth.controller.ts
│   │   │   ├── cases.controller.ts
│   │   │   ├── enforcement.controller.ts
│   │   │   ├── finance.controller.ts
│   │   │   ├── offenders.controller.ts
│   │   │   └── ...
│   │   ├── middleware/               # Auth, RBAC, Upload, and Rate limiters
│   │   ├── routes/                   # Express route definitions
│   │   ├── services/                 # Business logic & parser services
│   │   │   ├── finance-analysis.service.ts
│   │   │   ├── statement-parser.service.ts
│   │   │   ├── surveillance-analysis.service.ts
│   │   │   └── tower-parser.service.ts
│   │   ├── utils/                    # Audit logger, PII masking, scope helper
│   │   └── server.ts                 # Express Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/                      # Axios HTTP client configuration
│   │   ├── components/               # Reusable UI components & forms
│   │   │   └── enforcement/forms/    # 14 field check form components
│   │   ├── context/                  # AuthContext React provider
│   │   ├── hooks/                    # Custom React hooks (usePermissions, useSSE)
│   │   ├── pages/                    # React page views organized by feature
│   │   │   ├── admin/
│   │   │   ├── cases/
│   │   │   ├── databank/
│   │   │   ├── field/
│   │   │   ├── finance/
│   │   │   ├── network/
│   │   │   ├── offenders/
│   │   │   ├── reports/
│   │   │   ├── surveillance/
│   │   │   └── vehicles/
│   │   ├── App.jsx                   # Application router & layout wrapping
│   │   └── main.jsx                  # React DOM root render
│   ├── package.json
│   └── vite.config.js
└── docs/                             # Standardized Markdown Documentation
    ├── api-documentation.md          # Complete REST API Specification
    ├── project-overview.md           # Master System Architecture & Guide
    └── ...
```

---

## 7. Deployment & Environment Setup

### Environment Variables (.env)

#### Backend Configuration
```env
PORT=8081
NODE_ENV=production
DATABASE_URL="postgresql://user:password@neon-db-host/garuda_db?sslmode=require"
JWT_SECRET="your-secure-random-256bit-secret-key"
FRONTEND_URL="https://garudandps-tpt.vercel.app"
```

#### Frontend Configuration
```env
VITE_API_BASE_URL="https://garudandps-tpt.vercel.app/api"
```

### Build & Verification Commands

- **Backend Typecheck**: `cmd /c npx tsc --noEmit` (in `/backend`)
- **Backend Test Suite**: `cmd /c npm test` (in `/backend`)
- **Frontend Production Build**: `cmd /c npm run build` (in `/frontend`)
- **Start Backend Dev Server**: `npm run dev` (in `/backend`)
- **Start Frontend Dev Server**: `npm run dev` (in `/frontend`)
