import secrets


def make_tracking_code(prefix: str) -> str:
    return f"{prefix}-{secrets.token_hex(4).upper()}"
