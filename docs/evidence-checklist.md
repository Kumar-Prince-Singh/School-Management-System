# Reviewer Submission Evidence Checklist

**Project:** Cloud Deployment & CI/CD – School Management Platform  
**Candidate:** Prince Kumar (Reg: 12314718)  
**Company:** ALGIONS AI LABS PRIVATE LIMITED  

---

## 1. Evidence Directory Structure

Please capture real screenshots and command execution outputs when presenting to the ALGIONS AI LABS reviewer and save them into the designated folders below:

```text
evidence/
├── 01_cicd_pipeline/        # GitHub Actions execution screenshots
├── 02_docker_deployment/     # docker compose ps, container logs, and health status
├── 03_api_tests/            # Pytest test execution results (20/20 passed)
├── 04_health_checks/        # Browser and curl output of /health and /ready
└── 05_backup_restore/       # Terminal output of backup.sh and restore.sh execution
```

---

## 2. Step-by-Step Evidence Capture Checklist

### Checklist Item 1: Automated Pytest Suite Execution
- **Command:** `pytest backend/tests -v`
- **What to Capture:** Terminal screenshot showing all 20 tests passed, particularly:
  - `test_1_non_teacher_cannot_record_attendance PASSED`
  - `test_2_unassigned_teacher_cannot_record_attendance PASSED`
  - `test_3_authorized_teacher_can_record_attendance PASSED`
  - `test_4_student_not_in_class_rejected PASSED`
  - `test_5_duplicate_attendance_rejected PASSED`
- **Target Folder:** `evidence/03_api_tests/pytest_acceptance_tests.png`

---

### Checklist Item 2: Docker Containers Running & Healthy
- **Command:** `docker compose ps`
- **What to Capture:** Screenshot showing all 4 containers (`school_postgres`, `school_backend`, `school_frontend`, `school_nginx`) in status `Up (healthy)`.
- **Target Folder:** `evidence/02_docker_deployment/docker_compose_ps.png`

---

### Checklist Item 3: System Health & Readiness Endpoints
- **Actions:**
  1. Open browser to `http://localhost/health`
  2. Open browser to `http://localhost/ready`
  3. Navigate to **System Health** tab in the web dashboard
- **What to Capture:** Screenshots showing JSON responses with uptime, process memory, and PostgreSQL connection confirmation.
- **Target Folder:** `evidence/04_health_checks/health_ready_probes.png`

---

### Checklist Item 4: Web Application Dashboard & RBAC Demonstration
- **Actions:**
  1. Login as **Administrator** (`admin@algions.edu` / `Admin@123`) -> Capture **Overview** with charts and stats.
  2. Navigate to **Students** tab -> Capture student table with pagination.
  3. Navigate to **Attendance** tab as **Teacher B** -> Select **Class 10-A** -> Capture the amber RBAC authorization notice disabling attendance submission.
  4. Select **Class 10-B** as **Teacher B** -> Capture green authorization banner and submit morning attendance.
  5. Attempt submitting the same class again -> Capture the duplicate prevention error notification.
- **Target Folder:** `evidence/02_docker_deployment/dashboard_rbac_proof.png`

---

### Checklist Item 5: Automated Backup & Restore Execution
- **Command:**
  ```bash
  # Execute backup
  ./scripts/backup.sh
  # Execute restore verification
  ./scripts/restore.sh
  ```
- **What to Capture:** Terminal output showing creation of the `.sql.gz` timestamped file, successful decompression, and student count verification query.
- **Target Folder:** `evidence/05_backup_restore/backup_restore_terminal.png`

---

### Checklist Item 6: GitHub Actions CI/CD Pipeline
- **Actions:**
  - Push repository to GitHub.
  - Navigate to **Actions** tab on your repository.
  - Verify that the workflow `CI/CD Pipeline – School Management Platform` passed all 3 stages:
    1. Backend Tests & Quality Checks
    2. Frontend Build & Asset Compilation
    3. Container Build & Docker Compose Verification
- **What to Capture:** Screenshot of the green checkmark pipeline summary.
- **Target Folder:** `evidence/01_cicd_pipeline/github_actions_green.png`

