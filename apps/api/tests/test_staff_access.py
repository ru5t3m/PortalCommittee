import unittest
from datetime import datetime, timedelta, timezone
from uuid import uuid4
from unittest.mock import patch

import test_portal as portal
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError

from app.core.config import get_settings
from app.core.security import create_access_token, hash_password
from app.models.entities import (
    Appeal, AuditLog, AuthSession, CandidateApplication, OrganizationalUnit,
    PsychologicalTestResult, RefreshSession, Role, User,
)


class StaffAccessTests(unittest.TestCase):
    setUp = portal.PortalTests.setUp

    def staff(self, role=Role.moderator, scope="central", unit=None, email=None):
        with self.session_factory() as db:
            user = User(email=email or f"{uuid4().hex}@example.kz", full_name="Staff test",
                        hashed_password=hash_password("PortalStaff123!"), role=role,
                        staff_scope=scope if role == Role.moderator else None,
                        organizational_unit_id=unit)
            db.add(user)
            db.flush()
            session = AuthSession(id=str(uuid4()), user_id=user.id,
                                  expires_at=datetime.now(timezone.utc) + timedelta(days=1))
            db.add(session)
            db.commit()
            ordinary = create_access_token(str(user.id), role.value, extra_claims={"sid": session.id})
            service = create_access_token(str(user.id), role.value, extra_claims={"sid": session.id, "admin_session": True})
            return user.id, {"Authorization": f"Bearer {service}"}, {"Authorization": f"Bearer {ordinary}"}, user.email

    def unit(self, code):
        with self.session_factory() as db:
            row = OrganizationalUnit(code=code, name_ru=code, name_kk=code)
            db.add(row)
            db.commit()
            return row.id

    def cases(self, unit=None):
        with self.session_factory() as db:
            user = User(email=f"{uuid4().hex}@example.kz", full_name="Candidate")
            db.add(user)
            db.flush()
            candidate = CandidateApplication(user_id=user.id, tracking_code=uuid4().hex,
                first_name="Candidate", last_name="Test", phone="+77000000000", organizational_unit_id=unit)
            appeal = Appeal(tracking_code=uuid4().hex, full_name="Candidate", email=user.email,
                phone="+77000000000", subject="Test appeal", message="Test appeal message", organizational_unit_id=unit)
            db.add_all([candidate, appeal])
            db.flush()
            result = PsychologicalTestResult(user_id=user.id, candidate_application_id=candidate.id,
                test_slug="primary-selection", test_title="Test", total_questions=130,
                answered_questions=100, duration_seconds=7800, remaining_seconds=0, sections=[], answers={})
            db.add(result)
            db.commit()
            return candidate.id, appeal.id, result.id

    def test_territorial_lists_counters_and_results_are_scoped(self):
        own_unit, other_unit = self.unit("own"), self.unit("other")
        own = self.cases(own_unit)
        self.cases(other_unit)
        self.cases()
        _, headers, _, _ = self.staff(scope="territorial", unit=own_unit)
        for endpoint, expected in (("candidates", own[0]), ("appeals", own[1]), ("psychological-tests/results", own[2])):
            response = self.client.get(f"/api/v1/admin/{endpoint}", headers=headers)
            self.assertEqual(response.status_code, 200, response.text)
            self.assertEqual([row["id"] for row in response.json()], [expected])
        dashboard = self.client.get("/api/v1/admin/dashboard", headers=headers).json()
        self.assertEqual((dashboard["users"], dashboard["candidates"], dashboard["appeals"]), (1, 1, 1))
        self.assertNotIn("users:manage", dashboard["permissions"])
        self.assertNotIn("cases:assign", dashboard["permissions"])

    def test_foreign_and_unassigned_records_cannot_be_read_or_changed_by_id(self):
        own_unit, other_unit = self.unit("own"), self.unit("other")
        _, headers, _, _ = self.staff(scope="territorial", unit=own_unit)
        for unit in (other_unit, None):
            candidate, appeal, _ = self.cases(unit)
            for endpoint, identity, body in (("candidates", candidate, {"status": "approved"}), ("appeals", appeal, {"status": "answered"})):
                path = f"/api/v1/admin/{endpoint}/{identity}"
                self.assertEqual(self.client.get(path, headers=headers).status_code, 404)
                self.assertEqual(self.client.patch(path + "/status", json=body, headers=headers).status_code, 404)
        with self.session_factory() as db:
            self.assertEqual(db.query(AuditLog).count(), 0)

    def test_territorial_staff_can_process_own_cases(self):
        unit = self.unit("own")
        candidate, appeal, _ = self.cases(unit)
        _, headers, _, _ = self.staff(scope="territorial", unit=unit)
        self.assertEqual(self.client.patch(f"/api/v1/admin/candidates/{candidate}/status", json={"status": "in_review", "moderator_comment": "Checked"}, headers=headers).status_code, 200)
        self.assertEqual(self.client.patch(f"/api/v1/admin/appeals/{appeal}/status", json={"status": "in_review"}, headers=headers).status_code, 200)
        with self.session_factory() as db:
            self.assertEqual(db.query(AuditLog).count(), 2)

    def test_central_staff_sees_all_cases_but_cannot_manage_access_or_contacts(self):
        for unit in (self.unit("one"), self.unit("two"), None):
            self.cases(unit)
        _, headers, _, _ = self.staff()
        for endpoint in ("candidates", "appeals", "psychological-tests/results"):
            self.assertEqual(len(self.client.get(f"/api/v1/admin/{endpoint}", headers=headers).json()), 3)
        self.assertEqual(self.client.get("/api/v1/admin/users", headers=headers).status_code, 403)
        self.assertEqual(self.client.patch("/api/v1/admin/users/1/access", json={"role": "admin"}, headers=headers).status_code, 403)
        contact = {"service": "knb", "name_ru": "Test", "name_kk": "Test", "region_ru": "Test", "region_kk": "Test", "phones": ["+77000000000"], "latitude": "43.2", "longitude": "76.9"}
        self.assertEqual(self.client.post("/api/v1/admin/contacts/regions", json=contact, headers=headers).status_code, 403)
        self.assertEqual(self.client.put("/api/v1/admin/contacts/regions/1", json=contact, headers=headers).status_code, 403)
        self.assertEqual(self.client.delete("/api/v1/admin/contacts/regions/1", headers=headers).status_code, 403)

    def test_ordinary_staff_token_cannot_open_staff_api(self):
        _, service, ordinary, _ = self.staff()
        self.assertEqual(self.client.get("/api/v1/admin/dashboard", headers=ordinary).status_code, 401)
        self.assertEqual(self.client.get("/api/v1/auth/me", headers=service).status_code, 401)
        self.assertTrue(self.client.get("/api/v1/auth/me", headers=ordinary).json()["can_access_admin"])

    def test_second_login_is_bound_to_personal_staff_account(self):
        _, _, ordinary, email = self.staff()
        _, _, _, other_email = self.staff()
        response = self.client.post("/api/v1/auth/admin/login", json={"email": other_email, "password": "PortalStaff123!"}, headers=ordinary)
        self.assertEqual(response.status_code, 401)
        response = self.client.post("/api/v1/auth/admin/login", json={"email": email, "password": "PortalStaff123!"}, headers=ordinary)
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(self.client.get("/api/v1/admin/dashboard", headers={"Authorization": "Bearer " + response.json()["access_token"]}).status_code, 200)

    def test_allowlisted_candidate_and_unconfigured_moderator_cannot_get_staff_session(self):
        for role in (Role.candidate, Role.moderator):
            _, service, ordinary, email = self.staff(role=role, scope=None)
            with patch.object(get_settings(), "admin_portal_allowed_user_email", email):
                self.assertFalse(self.client.get("/api/v1/auth/me", headers=ordinary).json()["can_access_admin"])
                self.assertEqual(self.client.get("/api/v1/admin/dashboard", headers=service).status_code, 404)
                self.assertEqual(self.client.post("/api/v1/auth/admin/login", json={"email": email, "password": "PortalStaff123!"}, headers=ordinary).status_code, 404)

    def test_administrator_can_manage_units_and_access_and_changes_are_audited(self):
        actor, headers, _, _ = self.staff(role=Role.admin)
        response = self.client.post("/api/v1/admin/organizational-units", json={"code": "unit-1", "name_ru": "Подразделение", "name_kk": "Бөлімше"}, headers=headers)
        self.assertEqual(response.status_code, 201, response.text)
        unit = response.json()["id"]
        target, service, ordinary, _ = self.staff()
        response = self.client.patch(f"/api/v1/admin/users/{target}/access", json={"role": "moderator", "staff_scope": "territorial", "organizational_unit_id": unit}, headers=headers)
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["organizational_unit_id"], unit)
        self.assertNotIn("hashed_password", response.json())
        self.assertEqual(self.client.get("/api/v1/auth/me", headers=ordinary).status_code, 401)
        self.assertEqual(self.client.get("/api/v1/admin/dashboard", headers=service).status_code, 401)
        with self.session_factory() as db:
            self.assertEqual(db.query(AuditLog).filter_by(actor_id=actor).count(), 2)

    def test_access_change_revokes_refresh_tokens(self):
        _, headers, _, _ = self.staff(role=Role.admin)
        target, _, _, email = self.staff()
        login = self.client.post("/api/v1/auth/password/login", json={"email": email, "password": "PortalStaff123!"})
        self.assertEqual(login.status_code, 200)
        response = self.client.patch(f"/api/v1/admin/users/{target}/access", json={"role": "candidate", "is_blocked": True}, headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.post("/api/v1/auth/refresh").status_code, 401)
        self.assertEqual(self.client.post("/api/v1/auth/password/login", json={"email": email, "password": "PortalStaff123!"}).status_code, 401)

    def test_self_access_changes_are_forbidden(self):
        actor, headers, _, _ = self.staff(role=Role.admin)
        self.assertEqual(self.client.patch(f"/api/v1/admin/users/{actor}/access", json={"role": "candidate"}, headers=headers).status_code, 403)

    def test_invalid_scope_and_unknown_unit_are_rejected(self):
        _, headers, _, _ = self.staff(role=Role.admin)
        target, _, _, _ = self.staff()
        for body in ({"role": "moderator"}, {"role": "moderator", "staff_scope": "territorial"},
                     {"role": "moderator", "staff_scope": "central", "organizational_unit_id": 1},
                     {"role": "candidate", "staff_scope": "central"},
                     {"role": "moderator", "staff_scope": "territorial", "organizational_unit_id": 9999}):
            self.assertEqual(self.client.patch(f"/api/v1/admin/users/{target}/access", json=body, headers=headers).status_code, 422)

    def test_case_transfer_changes_access_to_details_and_results(self):
        first, second = self.unit("first"), self.unit("second")
        candidate, appeal, result = self.cases(first)
        _, central, _, _ = self.staff()
        worker, first_headers, _, _ = self.staff(scope="territorial", unit=first)
        _, second_headers, _, _ = self.staff(scope="territorial", unit=second)
        for endpoint, identity in (("candidates", candidate), ("appeals", appeal)):
            path = f"/api/v1/admin/{endpoint}/{identity}"
            self.assertEqual(self.client.patch(path + "/assignment", json={"organizational_unit_id": second, "assigned_to_id": worker}, headers=central).status_code, 422)
            self.assertEqual(self.client.patch(path + "/assignment", json={"organizational_unit_id": second}, headers=central).status_code, 200)
            self.assertEqual(self.client.get(path, headers=first_headers).status_code, 404)
            self.assertEqual(self.client.get(path, headers=second_headers).status_code, 200)
        self.assertEqual(self.client.get("/api/v1/admin/psychological-tests/results", headers=first_headers).json(), [])
        self.assertEqual([row["id"] for row in self.client.get("/api/v1/admin/psychological-tests/results", headers=second_headers).json()], [result])

    def test_territorial_staff_cannot_transfer_records_or_list_units(self):
        unit = self.unit("own")
        candidate, appeal, _ = self.cases(unit)
        _, headers, _, _ = self.staff(scope="territorial", unit=unit)
        for endpoint, identity in (("candidates", candidate), ("appeals", appeal)):
            self.assertEqual(self.client.patch(f"/api/v1/admin/{endpoint}/{identity}/assignment", json={}, headers=headers).status_code, 403)
        self.assertEqual(self.client.get("/api/v1/admin/organizational-units", headers=headers).status_code, 403)

    def test_legacy_results_without_application_do_not_leak_to_territorial_staff(self):
        unit = self.unit("own")
        candidate, _, result = self.cases(unit)
        _, headers, _, _ = self.staff(scope="territorial", unit=unit)
        with self.session_factory() as db:
            db.get(PsychologicalTestResult, result).candidate_application_id = None
            db.commit()
        self.assertEqual(self.client.get("/api/v1/admin/psychological-tests/results", headers=headers).json(), [])

    def test_invalid_staff_scope_is_rejected_by_database(self):
        identity, _, _, _ = self.staff()
        with self.engine.begin() as connection:
            for invalid in ({"staff_scope": "unknown"}, {"staff_scope": "territorial", "organizational_unit_id": None}, {"role": Role.candidate}):
                with self.assertRaises(IntegrityError):
                    with connection.begin_nested():
                        connection.execute(update(User).where(User.id == identity).values(**invalid))

    def test_database_role_changes_override_old_token_claims(self):
        identity, headers, _, _ = self.staff()
        with self.session_factory() as db:
            user = db.get(User, identity)
            user.role = Role.candidate
            user.staff_scope = None
            db.commit()
        self.assertEqual(self.client.get("/api/v1/admin/dashboard", headers=headers).status_code, 404)

    def test_access_update_does_not_implicitly_unblock_account(self):
        _, headers, _, _ = self.staff(role=Role.admin)
        target, _, _, _ = self.staff()
        with self.session_factory() as db:
            db.get(User, target).is_blocked = True
            db.commit()
        response = self.client.patch(f"/api/v1/admin/users/{target}/access", json={"role": "moderator", "staff_scope": "central"}, headers=headers)
        self.assertEqual(response.status_code, 200, response.text)
        self.assertTrue(response.json()["is_blocked"])

    def test_bootstrap_only_initializes_configured_existing_account(self):
        from app.db.bootstrap_admin import bootstrap
        target, _, _, email = self.staff(role=Role.candidate)
        with patch("app.db.bootstrap_admin.engine", self.engine), patch.object(get_settings(), "admin_portal_allowed_user_email", email):
            with self.assertRaises(RuntimeError):
                bootstrap("other@example.kz")
            bootstrap(email)
            bootstrap(email)
        with self.session_factory() as db:
            self.assertEqual(db.get(User, target).role, Role.admin)
            self.assertEqual(db.query(AuditLog).filter_by(action="bootstrap_admin").count(), 1)
            self.assertIsNotNone(db.query(AuthSession).filter_by(user_id=target).one().revoked_at)

    def test_test_email_domain_is_allowed_only_in_local_environment(self):
        from pydantic import TypeAdapter, ValidationError
        from app.schemas.dto import PortalEmailStr
        adapter = TypeAdapter(PortalEmailStr)
        self.assertEqual(adapter.validate_python("admin.local@example.test"), "admin.local@example.test")
        with patch.object(get_settings(), "environment", "production"):
            with self.assertRaises(ValidationError):
                adapter.validate_python("admin.local@example.test")
        for malformed in ("missing-at.test", "a b@example.test", "a@.test"):
            with self.assertRaises(ValidationError):
                adapter.validate_python(malformed)

    def test_access_management_rechecks_actor_after_waiting_for_lock(self):
        from fastapi import HTTPException, Request
        from app.api.v1.admin import update_user_access
        from app.schemas.dto import StaffAccessUpdate
        actor_id, _, _, _ = self.staff(role=Role.admin)
        target_id, _, _, _ = self.staff()
        with self.session_factory() as stale_db:
            actor = stale_db.get(User, actor_id)
            with self.session_factory() as other_db:
                other_db.get(User, actor_id).role = Role.candidate
                other_db.commit()
            request = Request({"type": "http", "headers": []})
            with self.assertRaises(HTTPException) as error:
                update_user_access(target_id, StaffAccessUpdate(role="candidate"), request, stale_db, actor)
            self.assertEqual(error.exception.status_code, 403)

    def test_access_management_rechecks_session_after_waiting_for_lock(self):
        from fastapi import HTTPException, Request
        from app.api.v1.admin import update_user_access
        from app.schemas.dto import StaffAccessUpdate
        actor_id, _, _, _ = self.staff(role=Role.admin)
        target_id, _, _, _ = self.staff()
        with self.session_factory() as stale_db:
            actor = stale_db.get(User, actor_id)
            request = Request({"type": "http", "headers": []})
            request.state.auth_session_id = stale_db.query(AuthSession).filter_by(user_id=actor_id).one().id
            with self.session_factory() as other_db:
                other_db.query(AuthSession).filter_by(user_id=actor_id).update({"revoked_at": datetime.now(timezone.utc)})
                other_db.commit()
            with self.assertRaises(HTTPException) as error:
                update_user_access(target_id, StaffAccessUpdate(role="candidate"), request, stale_db, actor)
            self.assertEqual(error.exception.status_code, 401)
