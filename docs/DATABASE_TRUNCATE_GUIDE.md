# 🛡️ GARUDA NDPS Monitoring System — Database Truncation & Pre-Deployment Guide

This document provides complete instructions for clearing all test, dummy data, and dummy user accounts from the PostgreSQL database prior to production deployment, ensuring you have a clean slate while preserving all essential master data (police stations, divisions, districts, teams, and settings).

---

## 📋 Table of Contents
1. [Data Classification (What gets deleted vs. What is preserved)](#1-data-classification)
2. [Step 0: Pre-Truncation Safety Backup](#2-step-0-pre-truncation-safety-backup)
3. [Method 1: Automated Node.js Script (Recommended)](#3-method-1-automated-nodejs-script-recommended)
4. [Method 2: Direct SQL Query (pgAdmin / DBeaver / psql / Neon)](#4-method-2-direct-sql-query)
5. [Storage & Uploads Directory Cleanup](#5-storage--uploads-directory-cleanup)
6. [Post-Truncation Verification](#6-post-truncation-verification)
7. [Creating the Production SP Administrator Account](#7-creating-the-production-sp-administrator-account)
8. [Cleanup of Dummy Seed, Test & Development Files](#8-cleanup-of-dummy-seed-test--development-files)
9. [Pre-Deployment Checklist](#9-pre-deployment-checklist)

---

## 1. Data Classification

### 🔴 Operational & Dummy Tables (TO BE TRUNCATED / WIPED)
These tables hold transactional data, dummy offender profiles, test field logs, and dummy test users created during development. All will be wiped clean and their auto-increment ID counters reset to `1`.

| Category | Table Names | Description |
| :--- | :--- | :--- |
| **Dummy Users & Auth** | `users`<br>`password_history`<br>`refresh_tokens` | All test accounts (`sp`, `asp`, `sho`, `constable`, etc. with dummy `password123`) and past login tokens. |
| **Case Management & Legal** | `charge_sheets`<br>`court_hearings`<br>`bail_records`<br>`seized_vehicles`<br>`seizures`<br>`case_accused`<br>`cases` | All FIRs, NDPS case files, seized vehicles/contraband, court proceedings, and bail details. |
| **Offender Intelligence** | `offender_contacts`<br>`offender_identity_docs`<br>`offender_drug_profile`<br>`offender_financials`<br>`supply_chain_links`<br>`surveillance_records`<br>`interrogation_sessions`<br>`imei_records`<br>`intelligence_inputs`<br>`informers`<br>`offenders` | Offender dossiers, aliases, Aadhaar/Voter IDs, phone/social accounts, supplier-peddler links, and physical surveillance logs. |
| **Technical Surveillance & Finance** | `tower_match_logs`<br>`social_media_intel`<br>`messaging_intel`<br>`transaction_records`<br>`finance_upload_batches` | Tower dump CDR matches, Telegram/WhatsApp tip-offs, and parsed bank/UPI statement transactions. |
| **Field Enforcement Modules** | `enforcement_checks`<br>`village_visits`<br>`lodge_checks`<br>`drunk_drive_checks`<br>`courier_checks`<br>`railway_checks`<br>`bus_stand_checks`<br>`rowdy_sheeter_checks`<br>`bound_over_checks`<br>`vehicle_checks`<br>`mv_act_checks`<br>`petty_cases_checks`<br>`palle_nidra_checks`<br>`drone_surveillance_checks` | Field officer check logs, mobile spot tests, vehicle inspections, drone sweeps, and village night visits. |
| **Audit & Approval Workflows** | `deletion_requests`<br>`edit_requests`<br>`audit_logs` | Approval chain records and development audit trails. |

---

### 🟢 Master & Reference Tables (PRESERVED)
These master tables MUST NOT be deleted because the application structure relies on them for routing, jurisdiction mapping, and team assignments.

| Table Name | Purpose |
| :--- | :--- |
| `police_stations` | Master directory of 40+ Police & 12 Excise Stations across Tirupati district. |
| `divisions` | Sub-Divisional Police Office (SDPO) jurisdictions (Urban, Rural, Srikalahasti, etc.). |
| `districts` | Master district definitions. |
| `teams` | Organizational units (*Narcotics Task Force*, *Cyber Surveillance Unit*, *Excise Unit*). |
| `system_settings` | System-wide configuration key-values. |
| `flyway_schema_history` | Database migration version tracking table. |

---

## 2. Step 0: Pre-Truncation Safety Backup

Before executing any truncate command, always take a database snapshot:

### Using `pg_dump` (PostgreSQL Local / Neon):
```bash
# Windows Command Prompt / PowerShell
pg_dump -U postgres -h 127.0.0.1 -p 5432 -d garuda_db -F c -b -v -f "garuda_backup_pre_deploy.dump"

# Or plain SQL format:
pg_dump -U postgres -h 127.0.0.1 -p 5432 -d garuda_db -f "garuda_backup_pre_deploy.sql"
```

---

## 3. Method 1: Automated Node.js Script (Recommended)

An automated script has been prepared at [`backend/scripts/truncate-dummy-data.ts`](file:///c:/Projects/GarudaNDPS_TPT/backend/scripts/truncate-dummy-data.ts) that:
1. Safely truncates all 37+ operational tables (including dummy users) using PostgreSQL `RESTART IDENTITY CASCADE`.
2. Automatically removes dummy uploaded documents/images from `backend/uploads/`.
3. Runs a post-truncate verification and prints record counts.

### Execution Command:
Open a terminal in the `backend` folder and run:
```bash
cd backend
npm run truncate:dummy
```
*(or `npx tsx scripts/truncate-dummy-data.ts`)*

---

## 4. Method 2: Direct SQL Query

If you prefer executing SQL directly through **pgAdmin**, **DBeaver**, **psql**, or the **Neon Web Console**, run the following transaction:

```sql
BEGIN;

-- 1. TRUNCATE AUDIT, AUTH & DUMMY USERS
TRUNCATE TABLE 
    refresh_tokens,
    password_history,
    deletion_requests,
    edit_requests,
    audit_logs,
    users
RESTART IDENTITY CASCADE;

-- 2. TRUNCATE CASE MANAGEMENT & SEIZURES
TRUNCATE TABLE 
    charge_sheets,
    court_hearings,
    bail_records,
    seized_vehicles,
    seizures,
    case_accused,
    cases
RESTART IDENTITY CASCADE;

-- 3. TRUNCATE TECHNICAL SURVEILLANCE & FINANCE INTELLIGENCE
TRUNCATE TABLE 
    tower_match_logs,
    social_media_intel,
    messaging_intel,
    transaction_records,
    finance_upload_batches
RESTART IDENTITY CASCADE;

-- 4. TRUNCATE PREVENTIVE & FIELD ENFORCEMENT MODULES
TRUNCATE TABLE 
    enforcement_checks,
    village_visits,
    lodge_checks,
    drunk_drive_checks,
    courier_checks,
    railway_checks,
    bus_stand_checks,
    rowdy_sheeter_checks,
    bound_over_checks,
    vehicle_checks,
    mv_act_checks,
    petty_cases_checks,
    palle_nidra_checks,
    drone_surveillance_checks
RESTART IDENTITY CASCADE;

-- 5. TRUNCATE OFFENDER PROFILES & INTELLIGENCE INPUTS
TRUNCATE TABLE 
    offender_contacts,
    offender_identity_docs,
    offender_drug_profile,
    offender_financials,
    supply_chain_links,
    surveillance_records,
    interrogation_sessions,
    imei_records,
    intelligence_inputs,
    informers,
    offenders
RESTART IDENTITY CASCADE;

COMMIT;
```

---

## 5. Storage & Uploads Directory Cleanup

During testing, case PDF files, offender photos, and seized vehicle pictures were saved locally in `backend/uploads/`.

To delete these files manually (if not using Method 1):
```powershell
# PowerShell (from project root)
Remove-Item -Path "backend\uploads\*" -Exclude ".gitkeep",".gitignore" -Force
```

---

## 6. Post-Truncation Verification

Run this SQL query in your database tool to confirm that operational tables and users are empty (`0` rows) and master tables remain intact:

```sql
SELECT 
    relname AS table_name, 
    n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE relname IN (
    'offenders', 'cases', 'enforcement_checks', 'seizures', 
    'users', 'police_stations', 'divisions', 'teams'
)
ORDER BY relname;
```

### Expected Results:
* `offenders`: **0**
* `cases`: **0**
* `enforcement_checks`: **0**
* `seizures`: **0**
* `users`: **0** *(Wiped clean)*
* `police_stations`: **50+** *(Preserved)*
* `divisions`: **8** *(Preserved)*
* `teams`: **3** *(Preserved)*

---

## 7. Creating the Production SP Administrator Account

After truncating dummy users, you need **one official administrator account (SP)** to log in and begin creating official station accounts:

### Interactive Setup Command:
```bash
cd backend
npm run create:admin
```
*(or `npx tsx scripts/create-prod-admin.ts`)*

You will be prompted for:
1. **Username**: (e.g. `sp_tirupati` or your designated admin handle)
2. **Password**: (Enter a strong production password)
3. **Full Name**: (e.g. `Superintendent of Police, Tirupati`)

### What happens next?
1. The SP administrator logs in to the web app.
2. From the **Admin Panel → User Management** UI, the SP can create authorized officer accounts (SDPOs, SHOs, Constables) and assign them to their respective Police Stations.

---

## 8. Cleanup of Dummy Seed, Test & Development Files

Before deploying to production, delete or exclude the following redundant test files:

### 🔴 Files Recommended for Removal / Exclusion

| Location | File Name | Purpose / Reason for Removal |
| :--- | :--- | :--- |
| `backend/scripts/` | `seed-offenders.ts` | Seeds dummy offender dossiers, contacts, financials, and identity docs. |
| `backend/scripts/` | `seed-enforcement.ts` | Seeds dummy spot test enforcement records. |
| `backend/scripts/` | `seed-preventive-modules.ts` | Seeds dummy village visits, lodge checks, etc. |
| `backend/scripts/` | `seed-vehicles.ts` | Seeds dummy seized vehicles and vehicle check logs. |
| `backend/scripts/` | `seed-test-users.ts` | Seeds old test users with plain dummy passwords. |
| `backend/scripts/` | `seed-ps.ts` | Redundant partial station seeder (superseded by `seed-full.ts`). |
| `backend/scripts/` | `test.ts`<br>`test-db.ts`<br>`test-dash.ts` | Temporary scratch test scripts. |
| `backend/scripts/` | `clear-offenders.ts` | Obsolete partial deletion script (superseded by `truncate-dummy-data.ts`). |
| `backend/scripts/` | `dump-users.ts`<br>`check-db.ts`<br>`check-admin.ts`<br>`update-admin.ts` | Ad-hoc console inspection scripts. |
| `backend/scripts/` | `batch-update-types.ts`<br>`update-controllers.js`<br>`update-enum.js`<br>`migrate-roles.ts` | One-off historical schema migration helper scripts. |
| `backend/src/scripts/` | `delete-excise-stations.ts` | One-off station deletion script. |
| `backend/` | `delete-excise-stations.js`<br>`delete-excise-users.js` | One-off root cleanup scripts. |
| `backend/` | `neon_dump.sql` | 430KB local/Neon database dump containing old test dummy records. |
| `backend/` | `.env.test` | Test environment configuration. |
| Root | `.env.neon` | Raw Neon connection string backup. |

---

### 🟢 Essential Files to KEEP (DO NOT DELETE)

| Location | File Name | Why It Must Be Kept |
| :--- | :--- | :--- |
| `backend/scripts/` | `update-arrest-status-enum.js` | **CRITICAL:** Executed automatically during `npm run build` and `postinstall` to align Prisma enum mappings. |
| `backend/scripts/` | `seed-full.ts` | **REFERENCE:** Seeder for all 52 official Police & Excise stations, 8 SDPO divisions, and 3 teams. |
| `backend/scripts/` | `create-prod-admin.ts` | **SETUP:** Initializes the official SP Administrator account. |
| `backend/scripts/` | `truncate-dummy-data.ts`<br>`truncate-dummy-data.sql` | **MAINTENANCE:** Production pre-deploy truncate utility. |

---

### 🧹 One-Command Script Cleanup (PowerShell)

```powershell
# Run from project root in PowerShell:
cd backend

# Remove dummy seeders and scratch scripts:
Remove-Item scripts\seed-offenders.ts, scripts\seed-enforcement.ts, scripts\seed-preventive-modules.ts, scripts\seed-vehicles.ts, scripts\seed-test-users.ts, scripts\seed-ps.ts, scripts\test.ts, scripts\test-db.ts, scripts\test-dash.ts, scripts\clear-offenders.ts, scripts\dump-users.ts, scripts\check-db.ts, scripts\check-admin.ts, scripts\update-admin.ts, scripts\batch-update-types.ts, scripts\update-controllers.js, scripts\update-enum.js, scripts\migrate-roles.ts, src\scripts\delete-excise-stations.ts, delete-excise-stations.js, delete-excise-users.js, neon_dump.sql, .env.test -Force -ErrorAction SilentlyContinue

Write-Host "✅ Redundant development scripts and test dumps removed."
```

---

## 9. Pre-Deployment Checklist

- [ ] Run full database backup (`pg_dump`).
- [ ] Run `npm run truncate:dummy` (wipes all dummy data, uploads, and dummy users).
- [ ] Run `npm run create:admin` to create the real production SP Administrator credentials.
- [ ] Remove obsolete seed and scratch scripts (Section 8).
- [ ] Verify production `.env` variables (`DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`).
- [ ] Ensure CORS origin is locked to the production frontend domain in `backend/src/app.ts`.
- [ ] Log in with the new SP Admin account and create official SHO/SDPO station accounts.
