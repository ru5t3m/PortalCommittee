import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch
from uuid import uuid4

import test_portal as portal
from app.core.config import get_settings
from app.core.security import hash_password
from app.models.entities import PsychologicalTestAttempt, PsychologicalTestResult
from app.services import test_attempts as service


class AttemptTests(unittest.TestCase):
    setUp = portal.PortalTests.setUp
    register = portal.PortalTests.register

    def start(self, headers, **extra):
        response = self.client.post("/api/v1/psychological-tests/attempts", headers=headers,
                                    json={"test_slug": service.SLUG, **extra})
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def action(self, row, headers, name, expected=200, **extra):
        payload = {"version": row["version"], "event_id": str(uuid4()), **extra}
        response = self.client.post(f"/api/v1/psychological-tests/attempts/{row['id']}/{name}", headers=headers, json=payload)
        self.assertEqual(response.status_code, expected, response.text)
        return response.json()

    def get(self, row, headers):
        response = self.client.get(f"/api/v1/psychological-tests/attempts/{row['id']}", headers=headers)
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def test_attempt_is_private_and_cannot_skip_or_finish_early(self):
        headers = self.register()
        row = self.start(headers)
        self.assertEqual(self.start(headers, restart=True)["id"], row["id"])
        self.action(row, headers, "continue", expected=409)
        self.action(row, headers, "finish", expected=409)
        other = self.register("other@example.kz")
        self.assertEqual(self.client.get(f"/api/v1/psychological-tests/attempts/{row['id']}", headers=other).status_code, 404)
        self.action(row, other, "begin-section", expected=404)

    def test_draft_survives_reload_and_only_current_question_can_change(self):
        headers = self.register()
        row = self.action(self.start(headers), headers, "begin-section")
        deadline = row["question_deadline"]
        row = self.action(row, headers, "draft", question_id="q01", answer="48")
        self.assertEqual(self.start(headers)["current_answer"], "48")
        self.assertEqual(self.get(row, headers)["question_deadline"], deadline)
        row = self.action(row, headers, "answer", question_id="q01", answer="48")
        self.assertEqual(row["current_question"]["id"], "q02")
        self.action(row, headers, "draft", question_id="q01", answer="999", expected=409)
        self.action(row, headers, "draft", question_id="q50", answer="999", expected=409)
        serialized = str(row)
        self.assertNotIn("correctAnswers", serialized)
        self.assertNotIn("answerExplanation", serialized)
        self.assertNotIn("correct_answers", serialized)

    def test_retry_is_idempotent_and_conflicting_events_fail(self):
        headers = self.register()
        row = self.action(self.start(headers), headers, "begin-section")
        payload = {"version": row["version"], "event_id": str(uuid4()), "question_id": "q01", "answer": "48"}
        url = f"/api/v1/psychological-tests/attempts/{row['id']}/answer"
        first = self.client.post(url, json=payload, headers=headers)
        retry = self.client.post(url, json=payload, headers=headers)
        self.assertEqual(first.status_code, 200)
        self.assertEqual(retry.json()["current_question"]["id"], "q02")
        self.assertEqual(retry.json()["version"], first.json()["version"])
        self.assertEqual(self.client.post(url, json={**payload, "answer": "99"}, headers=headers).status_code, 409)
        self.assertEqual(self.client.post(url, json={**payload, "event_id": str(uuid4())}, headers=headers).status_code, 409)

    def test_timeout_is_server_enforced_and_preserves_saved_draft(self):
        headers = self.register()
        start_time = datetime(2026, 10, 8, 12, tzinfo=timezone.utc)
        with patch.object(service, "utcnow", return_value=start_time):
            row = self.action(self.start(headers), headers, "begin-section")
            row = self.action(row, headers, "draft", question_id="q01", answer="48")
        with patch.object(service, "utcnow", return_value=start_time + timedelta(seconds=61)):
            self.action(row, headers, "answer", question_id="q01", answer="999", expected=409)
            row = self.get(row, headers)
            self.assertEqual(row["current_question"]["id"], "q02")
        with self.session_factory() as db:
            saved = db.get(PsychologicalTestAttempt, row["id"])
            self.assertEqual(saved.answers["numeric"]["q01"], "48")
            self.assertEqual(saved.elapsed_milliseconds, 60000)
        with patch.object(service, "utcnow", return_value=start_time + timedelta(minutes=70)):
            row = self.get(row, headers)
            self.assertEqual(row["status"], "sectionComplete")
            self.assertEqual(row["current_section_index"], 0)
            row = self.action(row, headers, "continue")
            self.assertEqual(row["status"], "instructions")
            self.assertIsNone(row["question_deadline"])

    def test_full_attempt_is_graded_on_server_and_finish_is_unique(self):
        headers = self.register()
        row = self.start(headers)
        for index, item in enumerate(service.bank()["sections"]):
            row = self.action(row, headers, "begin-section")
            for q in item["questions"]:
                keys = q.get("correctAnswers", [])
                answer = keys if q.get("answerMode") == "multi" else keys[0] if keys else "Проверочный ответ"
                row = self.action(row, headers, "answer", question_id=q["id"], answer=answer)
            if index < 2:
                self.assertEqual(row["status"], "sectionComplete")
                row = self.action(row, headers, "continue")
        self.assertEqual(row["status"], "ready")
        payload = {"version": row["version"], "event_id": str(uuid4())}
        url = f"/api/v1/psychological-tests/attempts/{row['id']}/finish"
        final = self.client.post(url, headers=headers, json=payload).json()
        self.assertEqual(final["status"], "completed")
        result = final["result"]
        self.assertEqual(result["answered_questions"], 130)
        self.assertEqual([s["correct_answers"] for s in result["sections"]], [50, 50, 0])
        self.assertEqual([s["scored_questions"] for s in result["sections"]], [50, 50, 0])
        self.assertEqual(self.client.post(url, headers=headers, json=payload).json()["result"]["id"], result["id"])
        self.assertEqual(self.start(headers)["result"]["id"], result["id"])
        with self.session_factory() as db:
            self.assertEqual(db.query(PsychologicalTestResult).filter_by(attempt_id=row["id"]).count(), 1)
        self.assertNotEqual(self.start(headers, restart=True)["id"], row["id"])

    def test_close_section_leaves_skipped_questions_empty(self):
        headers = self.register()
        row = self.start(headers)
        for index in range(3):
            row = self.action(row, headers, "begin-section")
            q = row["current_question"]
            row = self.action(row, headers, "close-section", question_id=q["id"], answer="48" if index == 0 else "")
            if index < 2:
                self.action(row, headers, "begin-section", expected=409)
                row = self.action(row, headers, "continue")
        result = self.action(row, headers, "finish")["result"]
        self.assertEqual(result["answered_questions"], 1)
        self.assertEqual(result["sections"][0]["correct_answers"], 1)

    def test_forged_fields_and_invalid_choices_are_rejected(self):
        headers = self.register()
        row = self.action(self.start(headers), headers, "begin-section")
        self.action(row, headers, "answer", question_id="q01", answer="48", score_percent=100, expected=422)
        row = self.action(row, headers, "close-section", question_id="q01", answer="")
        row = self.action(row, headers, "continue")
        row = self.action(row, headers, "begin-section")
        self.action(row, headers, "answer", question_id="v01", answer="999", expected=422)
        self.action(row, headers, "answer", question_id="v01", answer=["4"], expected=422)

    def test_logout_revokes_access_and_rotated_refresh_without_affecting_other_login(self):
        first = self.register()
        first_cookie = self.client.cookies.get("knb_refresh_token")
        refreshed = self.client.post("/api/v1/auth/refresh")
        self.assertEqual(refreshed.status_code, 200)
        rotated = {"Authorization": f"Bearer {refreshed.json()['access_token']}"}
        self.assertEqual(self.client.get("/api/v1/auth/me", headers=first).status_code, 200)
        login = self.client.post("/api/v1/auth/password/login", json={"email": "candidate@example.kz", "password": "PortalTest123!"})
        second = {"Authorization": f"Bearer {login.json()['access_token']}"}
        second_cookie = self.client.cookies.get("knb_refresh_token")
        self.client.cookies.clear()
        self.client.post("/api/v1/auth/logout", headers=first)
        self.assertEqual(self.client.get("/api/v1/auth/me", headers=first).status_code, 401)
        self.assertEqual(self.client.get("/api/v1/auth/me", headers=rotated).status_code, 401)
        self.assertEqual(self.client.get("/api/v1/auth/me", headers=second).status_code, 200)
        self.client.cookies.set("knb_refresh_token", first_cookie)
        self.assertEqual(self.client.post("/api/v1/auth/refresh").status_code, 401)
        self.client.cookies.clear()
        self.client.cookies.set("knb_refresh_token", second_cookie)
        self.assertEqual(self.client.post("/api/v1/auth/refresh").status_code, 200)

    def test_logout_revokes_admin_session_too(self):
        headers = self.register()
        from app.models.entities import User, Role
        with self.session_factory() as db:
            db.query(User).filter_by(email="candidate@example.kz").one().role = Role.admin
            db.commit()
        settings = get_settings()
        with patch.object(settings, "admin_portal_allowed_user_email", "candidate@example.kz"), patch.object(settings, "admin_panel_email", "admin@example.kz"), patch.object(settings, "admin_panel_password_hash", hash_password("AdminTest123!")):
            response = self.client.post("/api/v1/auth/admin/login", headers=headers, json={"email": "admin@example.kz", "password": "AdminTest123!"})
            self.assertEqual(response.status_code, 200, response.text)
            admin = {"Authorization": f"Bearer {response.json()['access_token']}"}
            self.assertEqual(self.client.get("/api/v1/admin/psychological-tests/results", headers=admin).status_code, 200)
            self.client.post("/api/v1/auth/logout")
            self.assertEqual(self.client.get("/api/v1/admin/psychological-tests/results", headers=admin).status_code, 401)
