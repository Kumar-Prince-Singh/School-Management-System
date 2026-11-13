# Deployment & Containerization Guide

**Project:** Cloud Deployment & CI/CD – School Management Platform  
**Candidate:** Prince Kumar (Reg: 12314718)  
**Company:** ALGIONS AI LABS PRIVATE LIMITED  

---

## 1. Prerequisites

Before deploying the platform, ensure the following are installed:
- [Docker](https://docs.docker.com/get-docker/) (v20.10 or later)
- [Docker Compose](https://docs.docker.com/compose/) (v2.0 or later)
- Git (for repository checkout)
- Optional for local dev: Python 3.11+, Node.js 20+

---

## 2. Quick-Start Deployment (Docker Compose)

### Step 1: Clone the Repository & Enter Workspace
```bash
git clone <repository-url>
cd Assignment
```

### Step 2: Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

### Step 3: Launch Containers with Single Command
```bash
docker compose up --build -d
```

### Step 4: Verify Container Status
```bash
docker compose ps
```
Expected output:
```text
NAME                IMAGE                        COMMAND                  SERVICE             STATUS                    PORTS
school_postgres     postgres:15-alpine           "docker-entrypoint.s…"   postgres            Up (healthy)              5432/tcp
school_backend      assignment-backend           "./entrypoint.sh"        backend             Up (healthy)              8000/tcp
school_frontend     assignment-frontend          "/docker-entrypoint.…"   frontend            Up (healthy)              80/tcp
school_nginx        assignment-nginx             "/docker-entrypoint.…"   nginx               Up (healthy)              0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

---

## 3. Accessing the Application

- **Web Dashboard:** [http://localhost](http://localhost) or [https://localhost](https://localhost)
- **API Health Check:** [http://localhost/health](http://localhost/health)
- **Database Readiness:** [http://localhost/ready](http://localhost/ready)
- **Interactive Swagger Docs:** [http://localhost/docs](http://localhost/docs)
- **ReDoc Documentation:** [http://localhost/redoc](http://localhost/redoc)

---

## 4. HTTPS & Local SSL Certificate Configuration

The Nginx container automatically generates a local development self-signed certificate upon container creation.

To generate or renew a custom development certificate manually:

**Linux / macOS:**
```bash
chmod +x nginx/ssl/generate-cert.sh
./nginx/ssl/generate-cert.sh
```

**Windows PowerShell:**
```powershell
.\nginx\ssl\generate-cert.ps1
```

> **Note on Browser Certificate Warning:**  
> When accessing `https://localhost`, web browsers will display a standard self-signed warning (e.g. `NET::ERR_CERT_AUTHORITY_INVALID`). This is expected because development certificates are not signed by a commercial public Certificate Authority. You can safely click **Advanced -> Proceed to localhost (unsafe)** for demonstration.

---

## 5. Stopping and Tearing Down

To stop all services while preserving database volume data:
```bash
docker compose down
```

To stop all services and **delete** all persistent volumes (fresh start):
```bash
docker compose down -v
```

