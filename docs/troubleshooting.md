# Troubleshooting & Operations Runbook

**Project:** Cloud Deployment & CI/CD – School Management Platform  
**Candidate:** Prince Kumar (Reg: 12314718)  
**Company:** ALGIONS AI LABS PRIVATE LIMITED  

---

## 1. Quick Diagnostic Commands

```bash
# 1. View overall service status and health checks
docker compose ps

# 2. View streaming logs from all services
docker compose logs -f

# 3. View logs for specific containers
docker compose logs backend -f
docker compose logs nginx -f
docker compose logs postgres -f

# 4. Check backend liveness and database readiness probes
curl -i http://localhost/health
curl -i http://localhost/ready

# 5. Access PostgreSQL interactive CLI inside container
docker exec -it school_postgres psql -U postgres -d school_db
```

---

## 2. Common Scenarios & Remediation

### Scenario 1: Port 80 or 443 Conflict
**Symptom:**  
`Error response from daemon: Ports are not available: listen tcp 0.0.0.0:80: bind: address already in use`

**Root Cause:**  
Another web server (e.g., Apache, IIS, Skype, local Nginx) is bound to port 80 or 443 on the host.

**Remediation:**  
1. Find the conflicting process:
   - Windows PowerShell: `Get-NetTCPConnection -LocalPort 80` or `netstat -ano | findstr :80`
   - Linux: `sudo lsof -i :80`
2. Stop the conflicting service (e.g. World Wide Web Publishing Service: `Stop-Service W3SVC` on Windows).
3. Alternatively, map to alternative host ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "8080:80"
     - "8443:443"
   ```

---

### Scenario 2: Database Connection Failure (`psycopg2.OperationalError`)
**Symptom:**  
Backend logs report: `connection to server at "postgres" failed: Connection refused`

**Root Cause:**  
Backend initiated before PostgreSQL had finished initializing the data directory.

**Remediation:**  
- The `docker-compose.yml` is configured with `depends_on: postgres: condition: service_healthy`. Ensure Docker Compose v2 is used.
- Check database container health: `docker inspect --format='{{json .State.Health}}' school_postgres`
- Verify database credentials in `.env` match `POSTGRES_USER` and `POSTGRES_PASSWORD`.

---

### Scenario 3: Database Migration Failure (Alembic)
**Symptom:**  
`alembic.util.exc.CommandError: Can't locate revision identified by '...'`

**Remediation:**  
1. Check current database revision:
   ```bash
   docker exec -it school_backend alembic current
   ```
2. Re-run migration head manually:
   ```bash
   docker exec -it school_backend alembic upgrade head
   ```
3. If database state is corrupted, perform a fresh volume initialization:
   ```bash
   docker compose down -v
   docker compose up --build -d
   ```

---

### Scenario 4: Nginx 502 Bad Gateway
**Symptom:**  
Browser displays `502 Bad Gateway` when accessing `http://localhost`.

**Root Cause:**  
Nginx is running, but the upstream backend or frontend container is either starting up, unhealthy, or crashed.

**Remediation:**  
1. Check backend container status:
   ```bash
   docker compose ps backend
   ```
2. Inspect backend error stacktrace:
   ```bash
   docker compose logs backend --tail=50
   ```
3. Verify internal network connectivity:
   ```bash
   docker exec -it school_nginx ping -c 2 backend
   ```

---

### Scenario 5: CI/CD GitHub Actions Pipeline Failure
**Symptom:**  
The GitHub Actions workflow fails on the test or build step.

**Remediation:**  
1. Run acceptance tests locally using in-memory SQLite:
   ```bash
   pytest backend/tests -v
   ```
2. Verify frontend asset compilation locally:
   ```bash
   npm --prefix frontend run build
   ```
3. Check Python syntax and linting:
   ```bash
   flake8 backend/app --count --select=E9,F63,F7,F82 --show-source
   ```
