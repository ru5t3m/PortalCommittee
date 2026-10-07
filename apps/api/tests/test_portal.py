import os
import unittest
from datetime import datetime, timedelta, timezone

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
from app.main import create_app


class PortalTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        Base.metadata.create_all(self.engine)
        session_factory = sessionmaker(bind=self.engine)

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

    def test_progress_updates_and_is_private(self):
        headers = self.register()
        payload = self.progress()
        first = self.client.put("/api/v1/psychological-tests/progress", json=payload, headers=headers)
        self.assertEqual(first.status_code, 200)
        payload["answered_questions"] = 2
        second = self.client.put("/api/v1/psychological-tests/progress", json=payload, headers=headers)
        self.assertEqual(second.json()["id"], first.json()["id"])
        loaded = self.client.get("/api/v1/psychological-tests/progress/primary-selection", headers=headers)
        self.assertEqual(loaded.json()["answered_questions"], 2)
        other_headers = self.register("another@example.kz")
        self.assertEqual(self.client.get("/api/v1/psychological-tests/progress/primary-selection", headers=other_headers).status_code, 404)

    def test_result_persists_and_clears_progress(self):
        headers = self.register()
        payload = self.progress()
        self.client.put("/api/v1/psychological-tests/progress", json=payload, headers=headers)
        payload.pop("current_section_index")
        payload.update(duration_seconds=60, remaining_seconds=20)
        result = self.client.post("/api/v1/psychological-tests/results", json=payload, headers=headers)
        self.assertEqual(result.status_code, 201, result.text)
        self.assertEqual(self.client.get("/api/v1/psychological-tests/progress/primary-selection", headers=headers).status_code, 404)
        self.assertEqual(self.client.get("/api/v1/psychological-tests/results/me", headers=headers).json()[0]["id"], result.json()["id"])
        self.assertEqual(self.client.get("/api/v1/psychological-tests/results/me", headers=self.register("another@example.kz")).json(), [])

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


if __name__ == "__main__":
    unittest.main()
