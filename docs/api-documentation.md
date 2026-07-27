# GARUDA NDPS TPT — API Documentation

This document provides complete specification for all backend API endpoints of the **Garuda NDPS Application (Tirupati Police District)**.

---

## 1. General Overview & Security

### Base URL
- **Production**: `https://garudandps-tpt.vercel.app/api` (or environment configured URL)
- **Local Development**: `http://localhost:8081/api`

### Authentication & Sessions
- **Authentication**: JWT token sent via `Authorization: Bearer <token>` header or `token` HTTP-only cookie.
- **Session Duration**: Access Token expires in **8 hours**.
- **Rate Limiting**:
  - Auth endpoints (`/api/auth/login`, `/api/auth/refresh`): **20 requests per 15 minutes per IP**.
  - File upload limits: Maximum **50MB** payload size.

### Standard Response Formats

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional operational message"
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": "Error details or validation code"
}
```

---

## 2. Authentication & Profile Endpoints (`/api/auth`)

| Endpoint | Method | Permission / Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates user credentials, sets HTTP-only cookie, returns token & user profile. |
| `/api/auth/refresh` | `POST` | Public | Refreshes active JWT session token. |
| `/api/auth/logout` | `POST` | Authenticated | Clears user session cookie and logs audit logout event. |
| `/api/auth/me` | `GET` | Authenticated | Returns current authenticated user session metadata. |
| `/api/auth/profile` | `PUT` | Authenticated | Updates current user profile (full name, phone, email). |
| `/api/auth/password` | `PUT` | Authenticated | Changes password (requires old password verification & policy compliance). |

---

## 3. Executive Dashboard (`/api/dashboard`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/dashboard/summary` | `GET` | Authenticated | Returns high-level metrics (total cases, offenders, seizures value, absconders, pending charge sheets, recent activity). |

---

## 4. Offender Database Management (`/api/offenders`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/offenders` | `GET` | Scoped by PS | Returns paginated list of registered drug offenders with search & filter options. |
| `/api/offenders/:id` | `GET` | Scoped by PS | Fetches full offender record including criminal history, bank accounts, and linked contacts. |
| `/api/offenders` | `POST` | `EDIT_RECORDS` | Creates a new drug offender profile in the database. |
| `/api/offenders/:id` | `PUT` | `EDIT_RECORDS` | Updates an existing offender record. |
| `/api/offenders/:id/photo` | `POST` | `EDIT_RECORDS` | Uploads offender profile photo image file. |
| `/api/offenders/:id/aadhaar/reveal` | `POST` | `REVEAL_AADHAAR` | Unmasks and reveals full Aadhaar number; creates audit log entry. |
| `/api/offenders/:id/history-sheet-pdf` | `GET` | Authenticated | Generates and downloads standard PDF History Sheet for the offender. |
| `/api/offenders/:id/interrogations` | `GET` | Authenticated | Lists all recorded interrogation sessions for the offender. |
| `/api/offenders/:id/interrogations` | `POST` | `EDIT_RECORDS` | Adds a new interrogation session record with findings and statements. |
| `/api/offenders/:offenderId/imei` | `GET` | Authenticated | Lists all IMEI numbers associated with the offender. |
| `/api/offenders/:offenderId/imei` | `POST` | `TECH_ADD` | Registers a new IMEI record under the offender. |
| `/api/offenders/:offenderId/imei/:imeiId` | `PUT` | `TECH_ADD` | Updates status or tracking details of an IMEI record. |

---

## 5. Case Management (`/api/cases`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/cases` | `GET` | Scoped by PS | Returns list of NDPS cases with stage, police station, and contraband filters. |
| `/api/cases/:id` | `GET` | Scoped by PS | Returns detailed case information, accused list, seizure details, timeline, and hearings. |
| `/api/cases/offender/:offenderId` | `GET` | Authenticated | Returns all cases linked to a specific offender. |
| `/api/cases` | `POST` | `ADD_CASE` | Registers a new NDPS FIR case record. |
| `/api/cases/:id` | `PUT` | `EDIT_RECORDS` | Updates case information, stage, or legal sections. |
| `/api/cases/upload` | `POST` | Authenticated | Uploads case documents/attachments to static file server. |
| `/api/cases/:id/accused` | `POST` | `EDIT_RECORDS` | Adds or updates an accused person linked to the case. |
| `/api/cases/:id/seizures` | `POST` | `EDIT_RECORDS` | Records contraband or property seizure details under the case. |
| `/api/cases/:id/charge-sheet` | `GET` | Authenticated | Fetches charge sheet status, filing date, and court details. |
| `/api/cases/:id/charge-sheet` | `PUT` | `EDIT_RECORDS` | Upserts charge sheet filing details. |
| `/api/cases/:id/court-hearings` | `GET` | Authenticated | Lists court hearing history for the case. |
| `/api/cases/:id/court-hearings` | `POST` | `EDIT_RECORDS` | Records a new court hearing date, judge, and order outcome. |
| `/api/cases/:id/bail-records` | `GET` | Authenticated | Lists bail records and surety conditions for accused in the case. |
| `/api/cases/:id/bail-records` | `POST` | `EDIT_RECORDS` | Adds a new bail record with conditions and expiry dates. |

---

## 6. Field Enforcement Modules (`/api/enforcement`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/enforcement` | `GET` | Authenticated | Returns list of field enforcement checks. |
| `/api/enforcement/summary` | `GET` | Authenticated | Returns enforcement check metrics and totals. |
| `/api/enforcement/user-logs` | `GET` | Authenticated | Returns field check activity logs for the logged-in officer. |
| `/api/enforcement` | `POST` | Authenticated | Creates generic field enforcement check. |
| `/api/enforcement/:id/test-result` | `PUT` | Authenticated | Submits drug testing kit result (positive/negative). |
| `/api/enforcement/search` | `POST` | Authenticated | Real-time field search for suspects by name, mobile, vehicle, or Aadhaar. |
| `/api/enforcement/village-visit` | `POST` | Authenticated | Submits Village Visit inspection report. |
| `/api/enforcement/lodge-check` | `POST` | Authenticated | Submits Lodge/Hotel inspection report. |
| `/api/enforcement/drunk-drive` | `POST` | Authenticated | Submits Drunk Driving check report. |
| `/api/enforcement/courier-check` | `POST` | Authenticated | Submits Courier/Parcel service inspection report. |
| `/api/enforcement/railway-check` | `POST` | Authenticated | Submits Railway Station surveillance check. |
| `/api/enforcement/bus-stand-check` | `POST` | Authenticated | Submits Bus Stand / Transit point inspection report. |
| `/api/enforcement/rowdy-sheeter` | `POST` | Authenticated | Submits Rowdy Sheeter verification check. |
| `/api/enforcement/bound-over` | `POST` | Authenticated | Submits Bound Over compliance verification. |
| `/api/enforcement/vehicle-check` | `POST` | Authenticated | Submits Vehicle Check inspection report. |
| `/api/enforcement/mv-act` | `POST` | Authenticated | Submits Motor Vehicle Act case report. |
| `/api/enforcement/petty-cases` | `POST` | Authenticated | Submits Petty Case enforcement report. |
| `/api/enforcement/palle-nidra` | `POST` | Authenticated | Submits Palle Nidra community policing report. |
| `/api/enforcement/drone-surveillance` | `POST` | Authenticated | Submits Drone Surveillance mission report. |
| `/api/enforcement/pending-review` | `GET` | `ENFORCEMENT_REVIEW` | Lists field check submissions awaiting SHO approval. |
| `/api/enforcement/:id/review` | `PUT` | `ENFORCEMENT_REVIEW` | Approves or rejects a field check submission. |

---

## 7. Technical Surveillance & Cyber Analytics (`/api/surveillance`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/surveillance` | `GET` | `TECH_VIEW_ALL` | Returns technical surveillance records. |
| `/api/surveillance/dashboard` | `GET` | `TECH_VIEW_ALL` | Returns cyber analytics dashboard metrics. |
| `/api/surveillance/mobiles` | `GET` | `TECH_VIEW_ALL` | Lists all monitored mobile numbers and target links. |
| `/api/surveillance/imeis` | `GET` | `TECH_VIEW_ALL` | Lists all monitored IMEI numbers and tower dump links. |
| `/api/surveillance/social` | `GET` | `TECH_VIEW_ALL` | Lists social media handle intelligence records. |
| `/api/surveillance/messaging` | `GET` | `TECH_VIEW_ALL` | Lists messaging app intelligence (WhatsApp/Telegram). |
| `/api/surveillance/map-logs` | `GET` | `TECH_VIEW_ALL` | Returns cell tower location logs for GIS mapping. |
| `/api/surveillance/correlations` | `GET` | `TECH_VIEW_ALL` | Returns cross-call/CDR correlations between targets. |
| `/api/surveillance/tower-intersections` | `GET` | `TECH_VIEW_ALL` | Runs multi-tower dump intersection analysis to spot common numbers. |
| `/api/surveillance/offender/:offenderId` | `GET` | `TECH_VIEW_ALL` | Returns all technical surveillance history for a target offender. |
| `/api/surveillance` | `POST` | `TECH_ADD` | Creates a new technical surveillance entry. |
| `/api/surveillance/:id` | `PUT` | `TECH_ADD` | Updates technical surveillance parameters. |
| `/api/surveillance/mobile` | `POST` | `TECH_ADD` | Adds a mobile number target for monitoring. |
| `/api/surveillance/imei` | `POST` | `TECH_ADD` | Adds an IMEI target for monitoring. |
| `/api/surveillance/social` | `POST` | `TECH_ADD` | Adds social media profile surveillance record. |
| `/api/surveillance/messaging` | `POST` | `TECH_ADD` | Adds messaging platform surveillance record. |
| `/api/surveillance/tower-dump` | `POST` | `TECH_ADD` | Uploads Excel/CSV cell tower dump for analysis. |

---

## 8. Financial Intelligence & Money Flow (`/api/finance`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/finance/upload-statement` | `POST` | `FINANCE_UPLOAD` | Uploads and parses bank/UPI statement (PDF, Excel, CSV). |
| `/api/finance/dashboard` | `GET` | `FINANCE_VIEW` | Returns financial intelligence dashboard analytics. |
| `/api/finance/uploads` | `GET` | `FINANCE_VIEW` | Lists uploaded statement batches and status. |
| `/api/finance/transactions` | `GET` | `FINANCE_VIEW` | Queries parsed financial transactions with filtering. |
| `/api/finance/alerts` | `GET` | `FINANCE_VIEW` | Returns high-value and suspicious transaction alerts. |
| `/api/finance/offender-links` | `GET` | `FINANCE_VIEW` | Identifies accounts shared between multiple drug offenders. |
| `/api/finance/common-counterparties` | `GET` | `FINANCE_VIEW` | Finds counterparties sending/receiving funds across multiple targets. |
| `/api/finance/flow-map/:offenderId` | `GET` | `FINANCE_VIEW` | Generates graph data of money flow for an offender. |
| `/api/finance/analysis/monthly/:offenderId` | `GET` | `FINANCE_VIEW` | Returns monthly income vs expenditure analysis. |
| `/api/finance/transaction/:id` | `PUT` | `FINANCE_VIEW` | Updates transaction notes, labels, or flag status. |
| `/api/finance/rerun-analysis/:batchId` | `POST` | `FINANCE_ANALYZE` | Re-triggers cross-analysis algorithms for a statement batch. |

---

## 9. Criminal Network Mapping & Intelligence (`/api/intelligence`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/intelligence` | `GET` | Authenticated | Returns intelligence feed entries. |
| `/api/intelligence` | `POST` | Authenticated | Submits a new intelligence report. |
| `/api/intelligence/network-graph` | `GET` | Authenticated | Generates graph node & edge data for interactive network mapping. |
| `/api/intelligence/duplicate-contacts` | `GET` | Authenticated | Detects duplicate phone numbers shared across different offenders. |
| `/api/intelligence/predict-risk` | `POST` | Authenticated | Calculates offender recidivism & risk score via algorithm. |
| `/api/intelligence/interstate-routes` | `GET` | Authenticated | Analyzes supply chain origins and interstate drug trafficking routes. |
| `/api/intelligence/consignment-trails` | `GET` | Authenticated | Maps consignment movements from source location to destination. |
| `/api/intelligence/case-linkages` | `GET` | Authenticated | Identifies hidden linkages between separate FIR cases. |

---

## 10. Informers & Secret Assets (`/api/informers`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/informers` | `GET` | `INFORMER_VIEW` | Lists registered informers (identity masked based on access level). |
| `/api/informers` | `POST` | `INFORMER_CREATE` | Registers a secret asset with codename, reliability rating, and handler. |
| `/api/informers/:id` | `PUT` | `INFORMER_CREATE` | Updates informer rating or intelligence notes. |

---

## 11. Seized Vehicles Management (`/api/vehicles`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/vehicles` | `GET` | Authenticated | Lists all vehicles seized under NDPS cases across police stations. |
| `/api/vehicles/:id` | `GET` | Authenticated | Fetches single vehicle details, confiscation status, and court disposal status. |
| `/api/vehicles/:id` | `PUT` | `VEHICLE_EDIT` | Updates vehicle storage location, auction status, or court release status. |

---

## 12. Workflow Requests (Edit & Deletion Approvals)

### Edit Requests (`/api/edit-requests`)
| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/edit-requests` | `GET` | Authenticated | Lists edit requests submitted by officers. |
| `/api/edit-requests` | `POST` | Authenticated | Submits request to modify restricted historical record. |
| `/api/edit-requests/:id/approve` | `POST` | `DSP` | Approves edit request and automatically applies requested modifications. |
| `/api/edit-requests/:id/reject` | `POST` | `DSP` | Rejects edit request with explanation reason. |

### Deletion Requests (`/api/deletion-requests`)
| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/deletion-requests` | `GET` | Authenticated | Lists records flagged or requested for deletion. |
| `/api/deletion-requests/flag` | `POST` | `EDIT_RECORDS` | Step 1: Flags record for deletion. |
| `/api/deletion-requests/:id/escalate` | `POST` | `SHO` | Step 2: SHO escalates flagged record. |
| `/api/deletion-requests/:id/request` | `POST` | `SDPO` | Step 3: SDPO formally requests deletion. |
| `/api/deletion-requests/:id/approve` | `POST` | `SP` | Step 4: SP approves deletion request. |
| `/api/deletion-requests/:id/execute` | `POST` | `SP` | Step 5: SP executes permanent deletion. |
| `/api/deletion-requests/:id/reject` | `POST` | `SDPO` / `SP` | Rejects deletion request at any workflow stage. |

---

## 13. Reports & Analytics (`/api/reports`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/reports/absconder-list` | `GET` | Authenticated | Generates absconder tracking report. |
| `/api/reports/monthly-abstract` | `GET` | Authenticated | Generates monthly crime abstract report. |
| `/api/reports/yearly-comparison` | `GET` | Authenticated | Generates year-over-year NDPS crime comparison. |
| `/api/reports/pending-charge-sheets` | `GET` | Authenticated | Returns cases exceeding 180-day charge sheet statutory limit. |
| `/api/reports/bail-expiry-alerts` | `GET` | Authenticated | Reports upcoming or expired bail condition deadlines. |
| `/api/reports/court-pending` | `GET` | Authenticated | Returns cases pending in trial courts. |
| `/api/reports/drug-seizures` | `GET` | Authenticated | Generates contraband seizure breakdown report by drug type. |
| `/api/reports/top-offenders` | `GET` | Authenticated | Reports top habitual drug peddlers ranked by criminal cases. |
| `/api/reports/dpr-export` | `GET` | Authenticated | Exports Daily Performance Report (DPR) data. |
| `/api/reports/custom` | `GET` | Authenticated | Generates custom filtered analytical report. |
| `/api/reports/court-diary` | `GET` | Authenticated | Returns scheduled court hearing diary. |
| `/api/reports/performance` | `GET` | Authenticated | Calculates performance metrics by police station. |

---

## 14. Administration & System Control (`/api/admin` & `/api/admin/settings`)

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/admin/users` | `GET` | `USER_MANAGEMENT` | Lists all system user accounts. |
| `/api/admin/users/:id` | `GET` | `USER_MANAGEMENT` | Gets user account details. |
| `/api/admin/users` | `POST` | `USER_MANAGEMENT` | Creates a new user account with role & PS assignment. |
| `/api/admin/users/:id` | `PUT` | `USER_MANAGEMENT` | Updates user details, role, or station assignment. |
| `/api/admin/users/:id` | `DELETE` | `USER_MANAGEMENT` | Deactivates user account. |
| `/api/admin/offenders/:id` | `DELETE` | `USER_MANAGEMENT` | Direct administrative deletion of an offender record. |
| `/api/admin/audit-logs` | `GET` | `AUDIT_LOGS` | Queries full system audit log trail. |
| `/api/admin/teams` | `GET` | `TEAM_MANAGEMENT` | Lists special task force teams. |
| `/api/admin/teams` | `POST` | `TEAM_MANAGEMENT` | Creates a new task force team. |
| `/api/admin/teams/:id` | `PUT` | `TEAM_MANAGEMENT` | Updates task force team metadata. |
| `/api/admin/teams/:id/members` | `POST` | `TEAM_MANAGEMENT` | Adds a user to a task force team. |
| `/api/admin/teams/:id/members/:userId` | `DELETE` | `TEAM_MANAGEMENT` | Removes a user from a task force team. |
| `/api/admin/teams/:id` | `DELETE` | `TEAM_MANAGEMENT` | Deletes a task force team. |
| `/api/admin/import/dpr` | `POST` | `IMPORT_DATA` | Uploads and processes DPR Excel file. |
| `/api/admin/import/dpr/preview` | `POST` | `IMPORT_DATA` | Previews DPR Excel import without committing. |
| `/api/admin/import/dpr/confirm` | `POST` | `IMPORT_DATA` | Confirms and commits DPR import records. |
| `/api/admin/settings` | `GET` | `SP` | Returns global system configuration parameters. |
| `/api/admin/settings` | `POST` | `SP` | Updates global system configuration parameters. |
| `/api/admin/system-health` | `GET` | `SP` | Returns system health, database connection pool, and storage status. |

---

## 15. System, Utility & Real-Time Endpoints

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/police-stations` | `GET` | Authenticated | Returns list of all police stations in the district. |
| `/api/police-stations/:id` | `GET` | Authenticated | Gets details of a specific police station. |
| `/api/sse/connect` | `GET` | Authenticated | Opens persistent Server-Sent Events stream for real-time alerts. |
| `/api/sse/status` | `GET` | Public | Returns active SSE connected client count. |
| `/api/wake` | `GET` | Public | Warms database connection pool from cold sleep. |
| `/api/health` | `GET` | Public | Basic HTTP health check endpoint. |
