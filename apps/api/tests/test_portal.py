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
from app.models.entities import User, TelegramLoginChallenge, PsychologicalTestProgress


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

    def register(self, email="candidate@example.kz"):
        response = self.client.post("/api/v1/auth/password/register", json={
            "email": email, "password": "PortalTest123!", "first_name": "Тестовый",
            "last_name": "Кандидат", "phone": "+77000000000",
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
        })
        self.assertEqual(response.status_code, 409)
        with self.session_factory() as db:
            user = db.query(User).filter_by(email="existing@example.kz").one()
            self.assertIsNone(user.hashed_password)
            self.assertEqual(user.full_name, "Existing user")

    def test_tokens_require_expiration(self):
        self.register()
        token = jwt.encode({"sub": "1"}, get_settings().jwt_secret, algorithm="HS256")
        self.assertEqual(self.client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}).status_code, 401)

    def test_refresh_and_logout_reject_untrusted_browser_origins(self):
        self.register()
        for endpoint in ("refresh", "logout"):
            self.assertEqual(self.client.post(f"/api/v1/auth/{endpoint}", headers={"Origin": "https://untrusted.example"}).status_code, 403)
        self.assertEqual(self.client.post("/api/v1/auth/refresh", headers={"Origin": "http://localhost:3000"}).status_code, 200)

    def test_telegram_webhook_requires_configured_secret(self):
        settings = get_settings()
        with patch.object(settings, "telegram_webhook_secret", ""):
            self.assertEqual(self.client.post("/api/v1/auth/telegram/webhook", json={"update_id": 1}).status_code, 503)
        with patch.object(settings, "telegram_webhook_secret", "webhook-test-secret"):
            self.assertEqual(self.client.post("/api/v1/auth/telegram/webhook", json={"update_id": 1}).status_code, 401)
            self.assertEqual(self.client.post("/api/v1/auth/telegram/webhook", json={"update_id": 1}, headers={"X-Telegram-Bot-Api-Secret-Token": "webhook-test-secret"}).status_code, 200)

    def test_telegram_consumed_challenge_cannot_be_reopened(self):
        nonce = "challenge-nonce-that-is-long-enough"
        with self.session_factory() as db:
            db.add(TelegramLoginChallenge(nonce=nonce, status="consumed", consumed_at=datetime.now(timezone.utc), expires_at=datetime.now(timezone.utc) + timedelta(minutes=5)))
            db.commit()
        with patch.object(get_settings(), "telegram_webhook_secret", "webhook-test-secret"), patch("app.api.v1.auth.telegram_api_call"):
            response = self.client.post("/api/v1/auth/telegram/webhook", headers={"X-Telegram-Bot-Api-Secret-Token": "webhook-test-secret"}, json={"message": {"chat": {"id": 1}, "from": {"id": 1}, "text": f"/start {nonce}"}})
        self.assertEqual(response.status_code, 200)
        with self.session_factory() as db:
            self.assertEqual(db.query(TelegramLoginChallenge).one().status, "consumed")

    def test_admin_access_flag_uses_server_configuration(self):
        headers = self.register()
        with patch.object(get_settings(), "admin_portal_allowed_user_email", "candidate@example.kz"):
            self.assertTrue(self.client.get("/api/v1/auth/me", headers=headers).json()["can_access_admin"])
        with patch.object(get_settings(), "admin_portal_allowed_user_email", "someone-else@example.kz"):
            self.assertFalse(self.client.get("/api/v1/auth/me", headers=headers).json()["can_access_admin"])

    def test_invalid_profile_and_section_data_are_rejected(self):
        payload = {"email": "candidate@example.kz", "password": "PortalTest123!", "first_name": "  ", "last_name": "Кандидат", "phone": "+77000000000", "birth_date": "2999-01-01"}
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
