# Production Operations Runbook

**Project:** Cloud Deployment & CI/CD – School Management Platform  
**Candidate:** Prince Kumar (Reg: 12314718)  
**Company:** ALGIONS AI LABS PRIVATE LIMITED  

---

## 1. Routine Operational Workflows

### Daily Health Audit:
Verify the status of liveness and readiness probes:
```bash
curl -s http://localhost/health | jq
curl -s http://localhost/ready | jq
```

### Regular Backup Execution:
Schedule daily automated backups via cron or scheduled task:
```bash
# Add to crontab for daily backup at 02:00 AM
0 2 * * * cd /path/to/Assignment && ./scripts/backup.sh >> /var/log/school_backup.log 2>&1
```

---

## 2. Managing Synthetic User & Student Records

### Adding an Educator:
Connect to PostgreSQL container:
```bash
docker exec -it school_postgres psql -U postgres -d school_db
```
Or use the administrative interface directly in the web dashboard by navigating to the **Classes** or **Students** page.

### Monitoring Structured Audit Logs:
To stream real-time operational audit logs:
```bash
docker compose logs backend -f | grep "\[AUDIT\]"
```
Example Output:
```text
2026-11-13 19:30:15 [INFO] [school_platform.audit] [AUDIT] user=teacher.a action=ATTENDANCE_RECORDED entity=attendance:class_1_2026-11-13_Morning details={"class_id": 1, "total_submitted": 6, "present": 5, "absent": 1}
```

---

## 3. Graceful Shutdown & Maintenance Windows

When updating host configuration or rotating credentials:
1. Notify administrators and users.
2. Trigger an immediate backup: `./scripts/backup.sh`.
3. Stop services gracefully: `docker compose down`.
4. Apply system patches or Docker engine updates.
5. Bring services back up: `docker compose up -d`.
6. Inspect health probes: `curl http://localhost/ready`.
