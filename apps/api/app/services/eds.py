import base64
import binascii
import re
import subprocess
import tempfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from cryptography import x509
from cryptography.x509.oid import NameOID

from app.core.config import get_settings


class EdsVerificationError(Exception):
    pass


@dataclass
class EdsSigner:
    iin: str
    full_name: str
    certificate_serial: str
    certificate_subject: str


def verify_cms_signature(cms_base64: str, expected_content: str) -> EdsSigner:
    try:
        cms_der = base64.b64decode(cms_base64, validate=True)
    except binascii.Error as exc:
        raise EdsVerificationError("Invalid CMS encoding") from exc

    settings = get_settings()
    with tempfile.TemporaryDirectory() as tmp_dir_name:
        tmp_dir = Path(tmp_dir_name)
        cms_path = tmp_dir / "signature.cms"
        content_path = tmp_dir / "content.txt"
        signer_path = tmp_dir / "signer.pem"
        cms_path.write_bytes(cms_der)
        content_path.write_text(expected_content, encoding="utf-8")

        command = [
            "openssl",
            "cms",
            "-verify",
            "-binary",
            "-inform",
            "DER",
            "-in",
            str(cms_path),
            "-content",
            str(content_path),
            "-signer",
            str(signer_path),
            "-out",
            str(tmp_dir / "verified.out"),
        ]
        if settings.eds_trusted_ca_file:
            command.extend(["-CAfile", settings.eds_trusted_ca_file])
        elif settings.eds_allow_untrusted_certificates:
            command.append("-noverify")
        else:
            raise EdsVerificationError("EDS trust store is not configured")

        try:
            subprocess.run(command, check=True, capture_output=True, text=True, timeout=10)
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
            raise EdsVerificationError("CMS signature verification failed") from exc

        if not signer_path.exists() or signer_path.stat().st_size == 0:
            raise EdsVerificationError("Signer certificate not found")

        certificate = x509.load_pem_x509_certificate(signer_path.read_bytes())
        now = datetime.now(timezone.utc)
        if certificate.not_valid_before_utc > now or certificate.not_valid_after_utc < now:
            raise EdsVerificationError("Signer certificate is expired or not yet valid")

        subject = certificate.subject.rfc4514_string()
        iin = extract_iin(subject)
        if not iin:
            raise EdsVerificationError("IIN not found in signer certificate")

        return EdsSigner(
            iin=iin,
            full_name=extract_full_name(certificate) or f"EDS user {iin}",
            certificate_serial=format(certificate.serial_number, "x"),
            certificate_subject=subject,
        )


def extract_iin(subject: str) -> str | None:
    patterns = [
        r"(?:SERIALNUMBER|UID)=IIN(\d{12})",
        r"(?:SERIALNUMBER|UID)=(\d{12})",
        r"IIN(\d{12})",
        r"\b(\d{12})\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, subject)
        if match:
            return match.group(1)
    return None


def extract_full_name(certificate: x509.Certificate) -> str | None:
    parts: list[str] = []
    for oid in [NameOID.SURNAME, NameOID.GIVEN_NAME, NameOID.COMMON_NAME]:
        values = certificate.subject.get_attributes_for_oid(oid)
        for value in values:
            clean = value.value.strip()
            if clean and clean not in parts:
                parts.append(clean)
    if parts:
        return " ".join(parts)[:255]
    return None
