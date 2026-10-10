import os
import json
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch
from passlib.hash import bcrypt

import jwt

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["ALLOWED_HOSTS"] = '["testserver"]'
os.environ["ENVIRONMENT"] = "development"
os.environ["JWT_SECRET"] = "portal-integration-tests-secret-at-least-32-characters"

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.core.config import get_settings
from app.core.config import Settings
from app.core.security import hash_password, verify_password
from app.main import create_app
from app.models.entities import AuditLog, AuthSession, CandidateApplication, EdsLoginChallenge, RefreshSession, User, TelegramLoginChallenge, PsychologicalTestProgress


class PortalTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        Base.metadata.create_all(self.engine)
        session_factory = sessionmaker(bind=self.engine)
        self.session_factory = session_factory

        def test_db():
            with session_factory() as session:
                yield session

        app = create_app()
        app.dependency_overrides[get_db] = test_db
        self.client = TestClient(app)
        self.addCleanup(self.client.close)
        self.addCleanup(self.engine.dispose)

    def register(self, email="candidate@example.kz", consent_locale="ru"):
        response = self.client.post("/api/v1/auth/password/register", json={
            "email": email, "password": "PortalTest123!", "first_name": "Тестовый",
            "last_name": "Кандидат", "phone": "+77000000000",
            "personal_data_consent": True, "consent_locale": consent_locale,
        })
        self.assertEqual(response.status_code, 201, response.text)
        return {"Authorization": f"Bearer {response.json()['access_token']}"}

    def progress(self):
        return {
            "test_slug": "primary-selection", "test_title": "Проверочный тест",
            "total_questions": 2, "answered_questions": 1, "current_section_index": 0,
            "sections": [{"id": "one", "title": "Раздел", "total_questions": 2, "answered_questions": 1}],
            "answers": {"one": {"question-1": "A"}},
        }

    def test_registration_login_refresh_logout(self):
        headers = self.register()
        profile = self.client.get("/api/v1/auth/me", headers=headers)
        self.assertEqual(profile.status_code, 200)
        self.assertEqual(profile.json()["user"]["email"], "candidate@example.kz")
        self.assertIsNotNone(profile.json()["candidate_application"])
        login = self.client.post("/api/v1/auth/password/login", json={"email": "candidate@example.kz", "password": "PortalTest123!"})
        self.assertEqual(login.status_code, 200)
        self.assertIn("HttpOnly", login.headers["set-cookie"])
        self.assertEqual(self.client.post("/api/v1/auth/refresh").status_code, 200)
        self.assertEqual(self.client.post("/api/v1/auth/logout").status_code, 200)
        self.assertEqual(self.client.post("/api/v1/auth/refresh").status_code, 401)

    def test_registration_requires_explicit_boolean_consent_without_side_effects(self):
        payload = {"email": "candidate@example.kz", "password": "PortalTest123!", "first_name": "Тестовый",
                   "last_name": "Кандидат", "phone": "+77000000000"}
        for consent in ("missing", False, None, "true", "false", 1, 0):
            with self.subTest(consent=consent):
                body = dict(payload)
                if consent != "missing":
                    body["personal_data_consent"] = consent
                response = self.client.post("/api/v1/auth/password/register", json=body)
                self.assertEqual(response.status_code, 422, response.text)
                self.assertTrue(any(error["loc"][-1] == "personal_data_consent" for error in response.json()["detail"]))
                self.assertNotIn("set-cookie", response.headers)
                with self.session_factory() as db:
                    for model in (User, CandidateApplication, AuthSession, RefreshSession, AuditLog):
                        self.assertEqual(db.query(model).count(), 0)

    def test_registration_records_consent_text_language_and_server_time(self):
        from app.api.v1.auth import PERSONAL_DATA_CONSENT_TEXT, PERSONAL_DATA_CONSENT_VERSION

        for locale in ("ru", "kk"):
            with self.subTest(locale=locale):
                before = datetime.now(timezone.utc).replace(tzinfo=None)
                self.register(email=f"{locale}@example.kz", consent_locale=locale)
                with self.session_factory() as db:
                    user = db.query(User).filter_by(email=f"{locale}@example.kz").one()
                    consent = db.query(AuditLog).filter_by(actor_id=user.id, action="personal_data_consent.accepted").one()
                    self.assertEqual(consent.entity, "user")
                    self.assertEqual(consent.entity_id, str(user.id))
                    self.assertEqual(consent.actor_name, user.full_name)
                    self.assertEqual(consent.details, {
                        "accepted": True, "version": PERSONAL_DATA_CONSENT_VERSION, "locale": locale,
                        "text": PERSONAL_DATA_CONSENT_TEXT[locale],
                        "law_url": f"https://adilet.zan.kz/{'kaz' if locale == 'kk' else 'rus'}/docs/Z1300000094",
                        "source": "password_registration",
                    })
                    self.assertGreaterEqual(consent.created_at.replace(tzinfo=None), before)
                    self.assertLessEqual(consent.created_at.replace(tzinfo=None), datetime.now(timezone.utc).replace(tzinfo=None))

    def test_appeal_requires_login_and_returns_tracking_status(self):
        payload = {"full_name": "Тестовый Кандидат", "email": "candidate@example.kz", "phone": "+77000000000", "subject": "Проверочное обращение", "message": "Проверяем создание и получение статуса обращения."}
        self.assertEqual(self.client.post("/api/v1/appeals", json=payload).status_code, 401)
        response = self.client.post("/api/v1/appeals", json=payload, headers=self.register())
        self.assertEqual(response.status_code, 201)
        status = self.client.get(f"/api/v1/appeals/{response.json()['tracking_code']}")
        self.assertEqual(status.json(), response.json())
        self.assertEqual(self.client.get("/api/v1/appeals/UNKNOWN").status_code, 404)

    def test_legacy_progress_cannot_skip_sections(self):
        headers = self.register()
        self.assertEqual(self.client.put("/api/v1/psychological-tests/progress", json=self.progress(), headers=headers).status_code, 410)
        self.assertEqual(self.client.delete("/api/v1/psychological-tests/progress/primary-selection", headers=headers).status_code, 410)

    def test_legacy_result_cannot_supply_its_own_score(self):
        headers = self.register()
        payload = self.progress()
        payload.pop("current_section_index")
        payload.update(duration_seconds=60, remaining_seconds=20)
        self.assertEqual(self.client.post("/api/v1/psychological-tests/results", json=payload, headers=headers).status_code, 410)
        self.assertEqual(self.client.get("/api/v1/psychological-tests/results/me", headers=headers).json(), [])

    def test_invalid_counts_and_unauthorized_admin_access(self):
        headers = self.register()
        payload = self.progress()
        payload["answered_questions"] = 3
        self.assertEqual(self.client.put("/api/v1/psychological-tests/progress", json=payload, headers=headers).status_code, 422)
        self.assertEqual(self.client.get("/api/v1/admin/psychological-tests/results", headers=headers).status_code, 401)

    def test_invalid_expired_and_unsigned_tokens_are_rejected(self):
        self.register()
        settings = get_settings()
        expired = jwt.encode({"sub": "1", "exp": datetime.now(timezone.utc) - timedelta(minutes=1)}, settings.jwt_secret, algorithm="HS256")
        unsigned = jwt.encode({"sub": "1"}, key="", algorithm="none")
        forged = jwt.encode({"sub": "1"}, "different-secret-for-integration-tests-only", algorithm="HS256")
        for token in (expired, unsigned, forged, "invalid-token"):
            with self.subTest(token=token):
                self.assertEqual(self.client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}).status_code, 401)

    def test_comma_separated_environment_lists(self):
        with patch.dict(os.environ, {"ALLOWED_HOSTS": "localhost,api.example.com", "CORS_ORIGINS": "http://localhost:3000,https://web.example.com"}):
            settings = Settings(_env_file=None)
        self.assertEqual(settings.allowed_hosts, ["localhost", "api.example.com"])
        self.assertEqual([str(origin).rstrip("/") for origin in settings.cors_origins], ["http://localhost:3000", "https://web.example.com"])

    def test_password_suffix_is_not_ignored(self):
        prefix = "Ab1" + "x" * 69
        encoded = hash_password(prefix + "first")
        self.assertTrue(verify_password(prefix + "first", encoded))
        self.assertFalse(verify_password(prefix + "second", encoded))
        legacy = bcrypt.hash("PortalTest123!")
        self.assertTrue(verify_password("PortalTest123!", legacy))

    def test_existing_passwordless_account_cannot_be_claimed_by_registration(self):
        with self.session_factory() as db:
            db.add(User(email="existing@example.kz", full_name="Existing user", hashed_password=None))
            db.commit()
        response = self.client.post("/api/v1/auth/password/register", json={
            "email": "existing@example.kz", "password": "PortalTest123!", "first_name": "Тестовый",
            "last_name": "Кандидат", "phone": "+77000000000",
            "personal_data_consent": True,
        })
        self.assertEqual(response.status_code, 409)
        with self.session_factory() as db:
            user = db.query(User).filter_by(email="existing@example.kz").one()
            self.assertIsNone(user.hashed_password)
            self.assertEqual(user.full_name, "Existing user")
            self.assertEqual(db.query(AuditLog).filter_by(action="personal_data_consent.accepted").count(), 0)

    def test_tokens_require_expiration(self):
        self.register()
        token = jwt.encode({"sub": "1"}, get_settings().jwt_secret, algorithm="HS256")
        self.assertEqual(self.client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}).status_code, 401)

    def test_refresh_and_logout_reject_untrusted_browser_origins(self):
        self.register()
        for endpoint in ("refresh", "logout"):
            self.assertEqual(self.client.post(f"/api/v1/auth/{endpoint}", headers={"Origin": "https://untrusted.example"}).status_code, 403)
        self.assertEqual(self.client.post("/api/v1/auth/refresh", headers={"Origin": "http://localhost:3000"}).status_code, 200)

    def test_removed_login_providers_cannot_create_sessions(self):
        now = datetime.now(timezone.utc)
        with self.session_factory() as db:
            db.add(User(email=None, full_name="Legacy account", telegram_id="123", iin="000000000001"))
            db.add(TelegramLoginChallenge(nonce="legacy-telegram-nonce", status="verified", telegram_id="123",
                                         phone="+77000000000", expires_at=now + timedelta(minutes=5)))
            db.add(EdsLoginChallenge(nonce="legacy-eds-nonce", challenge_text="legacy-challenge",
                                    expires_at=now + timedelta(minutes=5)))
            db.commit()
        endpoints = (
            ("post", "/api/v1/auth/telegram/start"),
            ("get", "/api/v1/auth/telegram/status/1"),
            ("post", "/api/v1/auth/telegram/complete"),
            ("post", "/api/v1/auth/telegram/webhook"),
            ("post", "/api/v1/auth/eds/start"),
            ("post", "/api/v1/auth/eds/complete"),
        )
        for method, endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                kwargs = {"json": {"challenge_id": 1, "nonce": "legacy-telegram-nonce"}} if method == "post" else {}
                self.assertEqual(getattr(self.client, method)(endpoint, **kwargs).status_code, 404)
        with self.session_factory() as db:
            self.assertEqual(db.query(User).count(), 1)
            self.assertEqual(db.query(AuthSession).count(), 0)
            self.assertEqual(db.query(TelegramLoginChallenge).one().status, "verified")
            self.assertEqual(db.query(EdsLoginChallenge).one().challenge_text, "legacy-challenge")

    def test_api_schema_exposes_only_supported_login_providers(self):
        schema = self.client.get("/openapi.json").json()
        self.assertFalse(any(path.startswith(("/api/v1/auth/telegram", "/api/v1/auth/eds")) for path in schema["paths"]))
        self.assertEqual(schema["components"]["securitySchemes"]["OAuth2PasswordBearer"]["flows"]["password"]["tokenUrl"],
                         "/api/v1/auth/password/login")

    def test_production_startup_requires_no_telegram_or_eds_configuration(self):
        settings = Settings(_env_file=None, environment="production", jwt_secret="production-test-secret-of-at-least-32-characters",
                            allowed_hosts=["portal.example.kz"], cors_origins=["https://portal.example.kz"])
        settings.validate_for_startup()
        settings.jwt_secret = "short"
        with self.assertRaisesRegex(RuntimeError, "JWT_SECRET"):
            settings.validate_for_startup()

    def test_allowlisted_email_does_not_grant_administrator_role(self):
        headers = self.register()
        with patch.object(get_settings(), "admin_portal_allowed_user_email", "candidate@example.kz"):
            self.assertFalse(self.client.get("/api/v1/auth/me", headers=headers).json()["can_access_admin"])
        with patch.object(get_settings(), "admin_portal_allowed_user_email", "someone-else@example.kz"):
            self.assertFalse(self.client.get("/api/v1/auth/me", headers=headers).json()["can_access_admin"])

    def test_invalid_profile_and_section_data_are_rejected(self):
        payload = {"email": "candidate@example.kz", "password": "PortalTest123!", "first_name": "  ", "last_name": "Кандидат", "phone": "+77000000000", "birth_date": "2999-01-01", "personal_data_consent": True}
        self.assertEqual(self.client.post("/api/v1/auth/password/register", json=payload).status_code, 422)
        payload = self.progress()
        payload["sections"][0].update(scored_questions=1, correct_answers=2)
        self.assertEqual(self.client.put("/api/v1/psychological-tests/progress", json=payload, headers=self.register()).status_code, 422)

    def test_existing_progress_remains_readable_after_validation_changes(self):
        headers = self.register()
        payload = self.progress()
        payload["answered_questions"] = 2
        with self.session_factory() as db:
            user = db.query(User).filter_by(email="candidate@example.kz").one()
            db.add(PsychologicalTestProgress(user_id=user.id, **payload))
            db.commit()
        self.assertEqual(self.client.get("/api/v1/psychological-tests/progress/primary-selection", headers=headers).status_code, 200)

    def test_malformed_llm_responses_return_service_error(self):
        responses = [[], {}, {"choices": []}, {"choices": None}, {"choices": [None]}, {"choices": [{"message": None}]}, {"choices": [{"message": {"content": None}}]}]
        for payload in responses:
            with self.subTest(payload=payload):
                response = MagicMock()
                response.__enter__.return_value.read.return_value = json.dumps(payload).encode()
                with patch("app.services.faq_assistant.urllib.request.urlopen", return_value=response):
                    result = self.client.post("/api/v1/faq-assistant", json={"question": "Как поступить на службу?"})
                self.assertEqual(result.status_code, 503)


if __name__ == "__main__":
    unittest.main()
