import logging
import json
from typing import Optional, Any
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.user import User

logger = logging.getLogger("school_platform.audit")


def log_audit(
    db: Session,
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    user: Optional[User] = None,
    details: Optional[Any] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Records an audit log entry to database and emits a structured log."""
    details_str = None
    if details is not None:
        if isinstance(details, (dict, list)):
            details_str = json.dumps(details, default=str)
        else:
            details_str = str(details)

    username = user.username if user else "system"
    user_id = user.id if user else None

    audit_entry = AuditLog(
        user_id=user_id,
        username=username,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details_str,
        ip_address=ip_address,
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)

    logger.info(
        f"[AUDIT] user={username} action={action} entity={entity_type}:{entity_id} "
        f"details={details_str}"
    )

    return audit_entry
