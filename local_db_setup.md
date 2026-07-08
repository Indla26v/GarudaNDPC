# Local Database Setup & Server Execution Guide

This guide describes how to run the **GARUDA NDPS** database and application servers locally on your machine.

---

## 1. Database Status & Configuration

The entire Neon database has been successfully migrated to your local system:
- **Port:** `5432` (standard PostgreSQL port)
- **Local Database Name:** `garuda_db`
- **Superuser Username:** `postgres`
- **Authentication Method:** `trust` (password-less authentication for local connections)
- **Database Schema & Data:** All 48 tables and data records have been successfully cloned.

The application configuration files (`backend/.env` and `backend/.env.test`) have been updated to connect to this local instance:
```env
DATABASE_URL="postgresql://postgres@localhost:5432/garuda_db?schema=public"
```

---

## 2. How to Start the Local Database

Since PowerShell/system restrictions might prevent automatic service startup, you can start or stop the PostgreSQL database manually.

### Option A: Manual Command Line (Recommended)
Open a standard command prompt/PowerShell terminal and run the following command:

**Start the Database Server:**
```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" start -D "C:\Program Files\PostgreSQL\18\data"
```

**Stop the Database Server:**
```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" stop -D "C:\Program Files\PostgreSQL\18\data"
```

---

### Option B: Windows Services Manager
If you prefer running it as a background service:
1. Press `Win + R`, type `services.msc`, and press **Enter**.
2. Locate the service named `postgresql-x64-18`.
3. Right-click on it and choose **Start** (requires Administrator privileges).

---

## 3. How to Run the Application

Once your database is running, follow these steps to start the application.

### Step 1: Start the Backend Server
Navigate to the `backend` folder and start the server:
1. Open a terminal in the `backend` directory.
2. Run:
   ```cmd
   npm run dev
   ```
   *Note: If your system blocks PowerShell scripts, launch via Command Prompt (`cmd.exe`) or run `node ./node_modules/tsx/dist/cli.js watch src/server.ts`.*

The backend will start and listen on port `8081`.

### Step 2: Start the Frontend Server
Navigate to the `frontend` folder and start the client application:
1. Open a terminal in the `frontend` directory.
2. Run:
   ```cmd
   npm run dev
   ```

The frontend will compile and start. Typically, it will be available at `http://localhost:5173`. Open this URL in your web browser.

---

## 4. Connecting via pgAdmin 4 or Client Tools
If you want to view, edit, or manage the tables using pgAdmin 4 or DBeaver:
- **Host Name/Address:** `localhost` or `127.0.0.1`
- **Port:** `5432`
- **Database:** `garuda_db`
- **Username:** `postgres`
- **Password:** *Leave empty* (if connecting from localhost due to `trust` auth)
