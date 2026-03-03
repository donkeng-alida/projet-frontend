from .models import AuditEvent


SENSITIVE_KEYS = {"password", "password_confirm", "token", "authorization"}


def _sanitize_payload_keys(payload):
    if not isinstance(payload, dict):
        return []
    return sorted([key for key in payload.keys() if str(key).lower() not in SENSITIVE_KEYS])


def log_audit_event(
    *,
    actor=None,
    event_type,
    method="",
    path="",
    status_code=0,
    message="",
    metadata=None,
):
    safe_metadata = metadata if isinstance(metadata, dict) else {}
    try:
        AuditEvent.objects.create(
            actor=actor if getattr(actor, "is_authenticated", False) else None,
            event_type=str(event_type or "")[:80],
            method=str(method or "")[:10],
            path=str(path or "")[:255],
            status_code=int(status_code or 0),
            message=str(message or "")[:255],
            metadata=safe_metadata,
        )
    except Exception:
        # Never block app behavior (especially login) if audit persistence fails.
        return


def log_api_mutation_event(*, request, response):
    method = str(getattr(request, "method", "")).upper()
    path = str(getattr(request, "path", "") or "")
    if method not in {"POST", "PUT", "PATCH", "DELETE"}:
        return
    if "/api/accounts/login/" in path or "/api/accounts/superuser/login/" in path:
        return

    payload_keys = []
    try:
        payload_keys = _sanitize_payload_keys(getattr(request, "data", {}))
    except Exception:
        payload_keys = []

    remote_addr = (request.META.get("HTTP_X_FORWARDED_FOR") or request.META.get("REMOTE_ADDR") or "").split(",")[0].strip()
    actor = getattr(request, "user", None)
    status_code = int(getattr(response, "status_code", 0) or 0)
    event_type = f"api.{method.lower()}"
    message = f"{method} {path}"

    log_audit_event(
        actor=actor,
        event_type=event_type,
        method=method,
        path=path,
        status_code=status_code,
        message=message,
        metadata={
            "payload_keys": payload_keys,
            "remote_addr": remote_addr,
        },
    )
