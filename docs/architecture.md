# System Architecture Document

**Project:** Cloud Deployment & CI/CD – School Management Platform  
**Candidate:** Prince Kumar  
**Registration Number:** 12314718  
**Company:** ALGIONS AI LABS PRIVATE LIMITED  
**Role:** DevOps & Cloud Engineering  

---

## 1. High-Level Architecture Overview

The platform uses a secure, containerized micro-tier architecture composed of:
1. **Nginx Reverse Proxy**: Single entry point handling TLS termination (HTTPS:443), HTTP:80, reverse proxy routing, rate limiting, and HTTP security headers.
2. **React SPA Frontend**: Vite-bundled Single Page Application with Tailwind CSS, React Router DOM, and Recharts, served via Nginx with client-side route fallback.
3. **FastAPI Backend**: Asynchronous REST API providing business logic, JWT authentication, role-based access control (RBAC), Pydantic v2 data validation, and structured logging.
4. **PostgreSQL 15 Database**: Relational storage engine with ACID compliance, relational integrity constraints (foreign keys and unique constraints), and Alembic schema migrations.

```mermaid
graph TD
    User([Browser Client]) -->|HTTPS:443 / HTTP:80| Nginx[Nginx Reverse Proxy]
    
    subgraph Docker Internal Bridge Network [school_network]
        Nginx -->|/ & static assets| Frontend[React Vite Frontend Container]
        Nginx -->|/api/*, /health, /ready, /docs| Backend[FastAPI Backend Container]
        
        Backend -->|SQLAlchemy 2.0 Pool :5432| Postgres[(PostgreSQL 15 Container)]
        Postgres -->|Named Volume| Storage[Persistent Volume: school_postgres_data]
    end

    subgraph CI/CD & Operations
        Git[GitHub Repository] -->|Push / PR to main| GHA[GitHub Actions CI/CD]
        GHA -->|1. Test| Pytest[Pytest Test Suite]
        GHA -->|2. Build| ViteBuild[Frontend Build]
        GHA -->|3. Containerize| DockerBuild[Docker Multi-Arch Images]
        
        BackupScript[backup.sh] -->|pg_dump| BackupFiles[(Timestamped Backups)]
        RestoreScript[restore.sh] -->|psql stream| Postgres
    end
```

---

## 2. Security Architecture & RBAC Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Teacher / Admin / Staff
    participant FE as React Frontend
    participant Nginx as Nginx Proxy
    participant BE as FastAPI Backend
    participant DB as PostgreSQL DB

    User->>FE: Enter Credentials
    FE->>Nginx: POST /api/auth/login
    Nginx->>BE: Forward to Backend
    BE->>DB: Query User & Verify Bcrypt Hash
    DB-->>BE: User Record
    BE-->>FE: Return JWT Token (role, user_id, expiry)
    
    Note over User, FE: User navigates to Attendance Tab
    User->>FE: Submit Attendance for Class 10-A
    FE->>Nginx: POST /api/attendance (Bearer Token)
    Nginx->>BE: Validate Token & Claims
    
    rect rgb(240, 248, 255)
        Note over BE: Business Rules Verification
        BE->>BE: 1. Check Role != Staff (403 if staff)
        BE->>BE: 2. Check Teacher is Assigned to Class (403 if unassigned)
        BE->>BE: 3. Verify Students Belong to Class (400 if invalid)
        BE->>BE: 4. Check for Duplicate Attendance (409 if conflict)
    end
    
    BE->>DB: Insert Attendance Records & Audit Log Entry
    DB-->>BE: Commit Success
    BE-->>FE: HTTP 201 Created
    FE-->>User: Success Toast Notification
```

---

## 3. Network Topology & Container Isolation

- **External Interface:** Port `80` (HTTP) and Port `443` (HTTPS with TLS) exposed on Nginx.
- **Internal Network:** Isolated Docker bridge network named `school_network`. The database (port 5432) and backend (port 8000) are intentionally **NOT** exposed directly to the public internet. All traffic must ingress through the Nginx reverse proxy.
- **Persistent Storage:** Docker named volume `school_postgres_data` mapped to `/var/lib/postgresql/data` ensuring synthetic student and attendance records persist across container restarts and host reboots.

