import unittest
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy import insert, update
from sqlalchemy.exc import IntegrityError

import test_portal as portal
from app.api.v1.auth import REFRESH_COOKIE_NAME
from app.models.entities import (
    AuthSession, EdsLoginChallenge, PsychologicalTestAttempt,
    PsychologicalTestProgress, PsychologicalTestResult, RefreshSession, User,
)


class DatabaseIntegrityTests(unittest.TestCase):
    setUp = portal.PortalTests.setUp
    register = portal.PortalTests.register

    def user_id(self):
        with self.session_factory() as db:
            user = User(email="integrity@example.kz", full_name="Integrity test")
            db.add(user)
            db.commit()
            return user.id

    def assert_rejected(self, statement):
        with self.engine.begin() as connection:
            with self.assertRaises(IntegrityError):
                with connection.begin_nested():
                    connection.execute(statement)

    def test_result_count_and_time_bounds_reject_direct_writes(self):
        values = dict(user_id=self.user_id(), test_slug="primary-selection", test_title="Test",
                      total_questions=130, answered_questions=100, duration_seconds=7800,
                      remaining_seconds=0, sections=[], answers={})
        for invalid in ({"total_questions": 0}, {"answered_questions": -1},
                        {"answered_questions": 131}, {"duration_seconds": -1},
                        {"remaining_seconds": -1}, {"remaining_seconds": 7801}):
            with self.subTest(invalid=invalid):
                self.assert_rejected(insert(PsychologicalTestResult).values(**{**values, **invalid}))
        with self.engine.begin() as connection:
            connection.execute(insert(PsychologicalTestResult).values(**values))
        self.assert_rejected(update(PsychologicalTestResult).values(answered_questions=131))

    def test_progress_bounds_reject_direct_writes(self):
        values = dict(user_id=self.user_id(), test_slug="primary-selection", test_title="Test",
                      total_questions=130, answered_questions=0, current_section_index=0,
                      sections=[], answers={})
        for invalid in ({"total_questions": 0}, {"answered_questions": -1},
                        {"answered_questions": 131}, {"current_section_index": -1}):
            with self.subTest(invalid=invalid):
                self.assert_rejected(insert(PsychologicalTestProgress).values(**{**values, **invalid}))

    def test_attempt_state_invariants_reject_direct_writes(self):
        user_id = self.user_id()
        values = dict(id=str(uuid4()), user_id=user_id, test_slug="primary-selection",
                      bank_version="primary-selection.v1", locale="ru", status="instructions",
                      active_key=f"{user_id}:primary-selection", section_index=0, question_index=0,
                      elapsed_milliseconds=0, version=1, answers={})
        for invalid in (
            {"status": "unknown"}, {"locale": "en"}, {"section_index": -1},
            {"section_index": 3}, {"question_index": -1}, {"question_index": 1},
            {"elapsed_milliseconds": -1}, {"elapsed_milliseconds": 7800001}, {"version": 0},
            {"active_key": None}, {"active_key": "another-user:primary-selection"},
            {"status": "questions"}, {"question_started_at": datetime.now(timezone.utc)},
            {"status": "ready"}, {"status": "completed", "section_index": 2},
            {"status": "sectionComplete", "section_index": 2},
            {"status": "sectionComplete", "question_index": 50},
            {"status": "ready", "section_index": 2, "question_index": 30},
        ):
            with self.subTest(invalid=invalid):
                self.assert_rejected(insert(PsychologicalTestAttempt).values(**{**values, **invalid}))
        with self.engine.begin() as connection:
            connection.execute(insert(PsychologicalTestAttempt).values(**values))
        self.assert_rejected(update(PsychologicalTestAttempt).values(active_key=None))

    def test_only_one_unrevoked_refresh_per_session(self):
        user_id = self.user_id()
        now = datetime.now(timezone.utc)
        session_id = str(uuid4())
        with self.engine.begin() as connection:
            connection.execute(insert(AuthSession).values(id=session_id, user_id=user_id,
                                                         expires_at=now + timedelta(days=1)))
            connection.execute(insert(RefreshSession).values(user_id=user_id,
                               auth_session_id=session_id, token_hash="first", expires_at=now + timedelta(days=1)))
        self.assert_rejected(insert(RefreshSession).values(user_id=user_id, auth_session_id=session_id,
                             token_hash="duplicate", expires_at=now + timedelta(days=1)))
        with self.engine.begin() as connection:
            connection.execute(update(RefreshSession).values(revoked_at=now))
            connection.execute(insert(RefreshSession).values(user_id=user_id, auth_session_id=session_id,
                               token_hash="replacement", expires_at=now + timedelta(days=1)))
            for token in ("legacy-first", "legacy-second"):
                connection.execute(insert(RefreshSession).values(user_id=user_id, auth_session_id=None,
                                   token_hash=token, expires_at=now + timedelta(days=1)))

    def test_repeated_rotation_revokes_old_tokens_and_preserves_session(self):
        headers = self.register()
        cookies = []
        for _ in range(3):
            cookies.append(self.client.cookies.get(REFRESH_COOKIE_NAME))
            response = self.client.post("/api/v1/auth/refresh")
            self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(self.client.get("/api/v1/auth/me", headers=headers).status_code, 200)
        with self.session_factory() as db:
            self.assertEqual(db.query(AuthSession).count(), 1)
            self.assertEqual(db.query(RefreshSession).count(), 4)
            self.assertEqual(db.query(RefreshSession).filter(RefreshSession.revoked_at.is_(None)).count(), 1)
        for cookie in cookies:
            self.client.cookies.set(REFRESH_COOKIE_NAME, cookie, domain="testserver.local", path="/api/v1/auth")
            self.assertEqual(self.client.post("/api/v1/auth/refresh").status_code, 401)

    def test_eds_nonce_remains_unique(self):
        values = dict(nonce="unique-nonce", challenge_text="test", expires_at=datetime.now(timezone.utc))
        with self.engine.begin() as connection:
            connection.execute(insert(EdsLoginChallenge).values(**values))
        self.assert_rejected(insert(EdsLoginChallenge).values(**values))
