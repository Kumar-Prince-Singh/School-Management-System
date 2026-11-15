# Deploying School Management Platform: Render (Backend + DB) & Vercel (Frontend)

This guide provides step-by-step instructions to deploy the **School Management Platform** to production with:
- **Database:** Managed PostgreSQL on **Render** (or Neon / Supabase)
- **Backend:** FastAPI REST API on **Render Web Services**
- **Frontend:** React (Vite + Tailwind CSS) Single Page App on **Vercel**

---

## 🏛 Architecture & Communication Flow

```text
[ Browser Client ]
       │
       ▼ (1. Loads Static Assets: HTML/CSS/JS)
  [ Vercel (Frontend SPA) ] 
       │
       ▼ (2. Axios REST API Requests with JWT + CORS)
  [ Render (FastAPI Backend) ]
       │
       ▼ (3. SQLAlchemy Connection Pool with SSL)
  [ Render PostgreSQL Database ]
```

---

## 📋 Prerequisites

1. A **GitHub** account with this repository pushed to your personal repository.
2. A free account on **[Render.com](https://render.com)**.
3. A free account on **[Vercel.com](https://vercel.com)**.

---

## 🗄 Step 1: Provision PostgreSQL Database on Render

1. Log in to your **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** in the top navigation and select **PostgreSQL**.
3. Fill in the database details:
   - **Name:** `school-postgres`
   - **Database:** `school_db`
   - **User:** `postgres` (or keep default generated)
   - **Region:** Choose the region closest to you (e.g., *Oregon (US West)* or *Frankfurt (EU Central)*)
   - **Instance Type:** **Free**
4. Click **Create Database**.
5. Wait for status to show **Available**.
6. Under **Connections**, copy the **Internal Database URL** (if deploying backend on the same Render account) or **External Database URL** (starts with `postgres://` or `postgresql://`).

> **Automatic Fix Included:** Render PostgreSQL connection strings typically start with `postgres://`. SQLAlchemy 2.0 requires `postgresql+psycopg2://`. The backend code has been configured to automatically normalize `postgres://` into `postgresql+psycopg2://` on startup, preventing `NoSuchModuleError`.

---

## 🚀 Step 2: Deploy Backend to Render

You can deploy the backend using either **Method A (Render Blueprint - Recommended)** or **Method B (Manual Web Service)**.

### Method A: 1-Click Render Blueprint (Recommended)
This repository includes a `render.yaml` file that automatically provisions both the PostgreSQL database and the FastAPI Web Service:
1. In Render Dashboard, click **New +** -> **Blueprint**.
2. Connect your GitHub repository.
3. Render will detect `render.yaml` and configure:
   - PostgreSQL Database: `school-postgres`
   - Web Service: `school-backend` (with auto-seed enabled)
4. Click **Apply**. Render will provision and launch both services automatically.

---

### Method B: Manual Web Service Deployment

1. In Render Dashboard, click **New +** and select **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name:** `school-backend`
   - **Region:** Same region as your PostgreSQL database
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command:**
     ```bash
     python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
     *(This automatically creates database tables, seeds initial demo accounts, and starts Uvicorn on Render's assigned port).*
   - **Instance Type:** **Free**

4. Scroll down to **Environment Variables** and add:
   | Key | Value | Description |
   |---|---|---|
   | `DATABASE_URL` | `<Your Render PostgreSQL Connection URL>` | Internal or External DB URL from Step 1 |
   | `SECRET_KEY` | `your-secure-random-secret-key-min-32-chars` | Secure key for signing JWT tokens |
   | `ENVIRONMENT` | `production` | Deployment environment mode |
   | `LOG_LEVEL` | `INFO` | Application log level |
   | `CORS_ORIGIN_REGEX` | `^https:\/\/.*\.vercel\.app$` | Automatically permits any Vercel domain |
   | `CORS_ORIGINS` | `https://your-frontend.vercel.app` | (Optional) Explicit production domain |

5. Click **Create Web Service**.
6. Wait for the build and deployment logs to display:
   ```text
   Starting synthetic database seeding...
   Synthetic database seeding completed successfully!
   Application startup complete.
   Uvicorn running on http://0.0.0.0:10000
   ```
7. Copy your backend live URL:
   `https://school-backend-xxxx.onrender.com`

8. Test the live backend:
   - Visit: `https://school-backend-xxxx.onrender.com/health` (should return `{"status":"healthy",...}`)
   - Visit: `https://school-backend-xxxx.onrender.com/docs` (Swagger UI)

---

## ⚡ Step 3: Deploy Frontend to Vercel

1. Log in to your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. In the **Configure Project** screen:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and select **`frontend`** (Click **Continue**).
   - **Build and Output Settings:** Leave default:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`
5. Expand **Environment Variables** and add:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://school-backend-xxxx.onrender.com` | **Your exact Render backend URL** (without trailing slash) |

6. Click **Deploy**.
7. In ~30–45 seconds, your site will be live at:
   `https://school-frontend-xxxx.vercel.app`

---

## 🔒 Step 4: Ensuring Effective Communication & Resolving CORS

Cross-Origin Resource Sharing (CORS) is the #1 point of failure when connecting separate frontend (Vercel) and backend (Render) domains. The codebase has been pre-configured to ensure seamless communication:

### 1. Dynamic Origin Regex in Backend
In `backend/app/config.py` and `backend/app/main.py`:
- `CORS_ORIGIN_REGEX=r"^https:\/\/.*\.vercel\.app$"`: Matches any domain ending in `.vercel.app`. This guarantees that your primary Vercel deployment **and** all branch/preview deployments pass CORS without manual intervention.
- `CORS_ORIGINS`: Accepts comma-separated URLs if you attach a custom domain (e.g., `https://school.mydomain.com`).

### 2. Preventing Double Slashes in Axios
In `frontend/src/api/client.js`:
- Trailing slashes in `VITE_API_URL` are sanitized automatically so `/api/auth/login` never resolves to `...com//api/auth/login`.

### 3. Client-Side Routing Rewrites (SPA 404 Prevention)
In `frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This ensures refreshing on deep routes like `/dashboard`, `/attendance`, or `/classes` routes properly to `index.html` instead of displaying Vercel's `404: NOT_FOUND`.

---

## 🔑 Step 5: Verify the Deployment with Demo Accounts

Open your Vercel deployment URL (`https://your-frontend.vercel.app`). Test logging in using the seeded accounts:

| Role | Username / Email | Password | Allowed Operations |
|---|---|---|---|
| **Administrator** | `admin@algions.edu` | `Admin@123` | Full control across all classes & audit logs |
| **Teacher A** | `teacher.a@algions.edu` | `Teacher@123` | Authorized **only** for Class 10-A |
| **Teacher B** | `teacher.b@algions.edu` | `Teacher@123` | Authorized **only** for Class 10-B |
| **Staff / Viewer** | `staff@algions.edu` | `Staff@123` | Read-only; attendance creation returns HTTP 403 |

> **Tip:** You can also use the **1-Click Quick Role Switcher** on the login page to immediately sign in as any of the roles.

---

## 🛠 Troubleshooting & Common Questions

### 1. Render Free Tier Cold Starts
* **Symptom:** First request after 15 minutes of inactivity takes 40-50 seconds to respond.
* **Explanation:** Render free tier spins down instances when idle. Once the first request hits, it wakes up and subsequent requests are fast (< 100ms).
* **Fix:** Use a free uptime monitor (like [UptimeRobot](https://uptimerobot.com)) to ping your backend's `/health` endpoint every 10 minutes to keep it awake.

### 2. CORS Error: "No 'Access-Control-Allow-Origin' header is present"
* **Check 1:** Ensure `VITE_API_URL` on Vercel is set to `https://...` (Render enforces HTTPS; requesting `http://` causes a 301 redirect which drops CORS headers).
* **Check 2:** In Render backend Environment Variables, verify `CORS_ORIGIN_REGEX` is set to `^https:\/\/.*\.vercel\.app$`.
* **Check 3:** If using a custom domain on Vercel (e.g. `https://school.yourdomain.com`), add it to Render's `CORS_ORIGINS` environment variable.

### 3. 404 Not Found on Page Refresh in Vercel
* Ensure `vercel.json` is present in the `frontend` folder with the rewrite rule pointing to `/index.html`.

### 4. Database Connection Refused or SSL Error
* Render PostgreSQL requires SSL mode. If connecting externally from another provider, ensure your `DATABASE_URL` includes `?sslmode=require`. Render internal connections handle this automatically.
