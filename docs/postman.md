# Walkthrough - Postman API Collection

I have successfully generated a complete, production-ready Postman Collection and associated Environment for the entire **Garuda NDPS & Seizure Tracking Platform** API.

These files have been generated at the root of your workspace:
*   **Postman Collection JSON**: [garuda_ndps_tpt.postman_collection.json](file:///c:/Projects/GarudaNDPS_TPT/garuda_ndps_tpt.postman_collection.json)
*   **Postman Environment JSON**: [garuda_ndps_tpt.postman_environment.json](file:///c:/Projects/GarudaNDPS_TPT/garuda_ndps_tpt.postman_environment.json)

---

## 🚀 How to Import and Use in Postman

1.  **Open Postman** (Desktop app or Web client).
2.  Click the **Import** button in the top left workspace panel.
3.  Select both generated files from your workspace directory:
    *   `garuda_ndps_tpt.postman_collection.json`
    *   `garuda_ndps_tpt.postman_environment.json`
4.  Once imported, select the **Garuda NDPS TPT - Local Dev** environment from the top-right environment selector dropdown.
5.  Run the **Login** request inside `01. Authentication` folder:
    *   Update the credentials body if necessary (default is set to `admin1`).
    *   Click **Send**.
6.  The **Login** request has a pre-configured **Test Script** that automatically parses the JSON response and sets the dynamic environment variable `authToken` to the JWT token returned.
7.  **Authentication Inheritance**: Every other request in the collection inherits collection-level Bearer token authorization using `{{authToken}}`. You can start querying all other endpoints immediately without manually copy-pasting tokens!

---

## 📂 Collection Structure Overview

The collection contains the following folders and endpoints:

1.  **01. Authentication**
    *   `POST /login` (With automatic script to store token in `authToken` variable)
    *   `POST /refresh` (Refreshes the session using `refreshToken`)
    *   `GET /me` (Get details of current logged-in user)
    *   `POST /logout` (Ends current session)
2.  **02. Dashboard**
    *   `GET /summary` (Consolidated dashboard metrics)
3.  **03. Offenders & IMEI**
    *   CRUD operations for offender profiles (`GET /`, `GET /:id`, `POST /`, `PUT /:id`)
    *   Dossier exports & CSV dumps (`GET /export`, `POST /upload` for mugshots)
    *   Excel data imports (`POST /import` for DPR xlsx)
    *   IMEI records management (`GET`, `POST`, `PUT` routes)
4.  **04. Cases & Life Cycle**
    *   NDPS seizure case CRUD (`GET /`, `POST /`, `PUT /:id`)
    *   Accused & Seizure mapping updates
    *   Document attachments upload
    *   Case legal workflow: Charge Sheets, Court Hearings, and Bail Records
5.  **05. Field Enforcement**
    *   Checkpoint inspections list & summary logs
    *   Chemical drug test result submission
    *   Specialized Field check forms: Lodge checks, Drunk driving, Courier drives, Rail/Bus stands, Rowdy sheeters, Bound overs, and Drone operations
    *   SHO reviews (`GET /pending-review`, `PUT /:id/review`)
6.  **06. Deletion Workflow**
    *   Compliance track from SI/CI flagging → SHO escalation → SDPO request → SP approval → final permanent database purge.
7.  **07. Edit Requests**
    *   SI/CI proposed modifications to locked records & DSP review endpoints.
8.  **08. Cyber Surveillance**
    *   Tracker management for targeted phone numbers, SIM swaps, and IMEIs.
    *   Social Media and messaging app intelligence logs.
    *   Cell tower dump CSV uploads and geospatial intersection calculations.
9.  **09. Financial Intelligence**
    *   Bank statement statement parser upload.
    *   Transaction tables, suspicious alert lists, and offender connection mapping.
    *   Flow maps (`GET /flow-map/:offenderId`) showing laundering routes.
10. **10. Informers**
    *   Covert informant registration and rating logs.
11. **11. Reports**
    *   Downloadable report sheets: Absconders, Court pending list, Yearly comparison matrix, Drug classifications, and Court diary.
12. **12. Admin & System Settings**
    *   User account provisioning, task force teams, global system parameters, audit log reviewer, and server health states.
