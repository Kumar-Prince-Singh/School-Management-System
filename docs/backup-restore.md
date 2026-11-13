# Backup, Restore and Rollback Operations Manual

**Project:** Cloud Deployment & CI/CD – School Management Platform  
**Candidate:** Prince Kumar (Reg: 12314718)  
**Company:** ALGIONS AI LABS PRIVATE LIMITED  

---

## 1. Automated PostgreSQL Backup

The backup process utilizes `pg_dump` to capture a complete schema and data snapshot into a compressed, timestamped archive stored in `backups/`.

### Linux / macOS / Bash:
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

### Windows PowerShell:
```powershell
.\scripts\backup.ps1
```

### What Happens:
1. Validates that the `school_postgres` container is running and healthy.
2. Creates the `backups/` directory if absent.
3. Runs `pg_dump -U postgres -d school_db --clean --if-exists`.
4. Compresses output via Gzip into `school_db_backup_YYYYMMDD_HHMMSS.sql.gz`.
5. Prints the full path and file size upon success.

---

## 2. Database Restoration Procedure

The restore utility streams a backup file directly to PostgreSQL within the running container.

> [!WARNING]
> Restoring a backup will overwrite the current database contents. Confirmation is strictly required before execution.

### Linux / macOS / Bash:
```bash
chmod +x scripts/restore.sh

# Restore the most recent backup automatically:
./scripts/restore.sh

# Or restore a specific backup file:
./scripts/restore.sh backups/school_db_backup_20261113_190000.sql.gz
```

### Windows PowerShell:
```powershell
.\scripts\restore.ps1 -BackupPath "backups\school_db_backup_20261113_190000.sql"
```

### Verification Step:
Following restoration, the script executes a verification query:
```sql
SELECT COUNT(*) AS total_students FROM students;
```
Ensuring all synthetic student records have been reinstated.

---

## 3. Application Rollback Procedure

When a defect or regression is introduced into production, the rollback script handles rapid recovery to a previously documented stable Git tag or commit SHA.

### Linux / macOS:
```bash
chmod +x scripts/rollback.sh
./scripts/rollback.sh <target-commit-or-tag>
```

### Windows PowerShell:
```powershell
.\scripts\rollback.ps1 -TargetVersion "<target-commit-or-tag>"
```

### Rollback Process:
1. Detects and stashes any uncommitted local changes to protect developer work.
2. Checks out the target Git commit or release tag.
3. Triggers container rebuild and recreation (`docker compose down && docker compose up --build -d`).
4. Awaits health convergence and queries `/health` to verify service readiness.

