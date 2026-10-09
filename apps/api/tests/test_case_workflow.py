import unittest
from datetime import datetime, timezone

import test_portal as portal
import test_staff_access as staff_tests
from app.models.entities import Appeal, CandidateApplication, CaseComment, Role, User


class CaseWorkflowTests(unittest.TestCase):
    setUp = portal.PortalTests.setUp
    staff = staff_tests.StaffAccessTests.staff
    unit = staff_tests.StaffAccessTests.unit
    cases = staff_tests.StaffAccessTests.cases
    register = portal.PortalTests.register

    def test_pagination_search_and_filters_cover_records_beyond_old_limit(self):
        own, other = self.unit("own"), self.unit("other")
        worker, headers, _, _ = self.staff(scope="territorial", unit=own)
        with self.session_factory() as db:
            for index in range(207):
                db.add(Appeal(tracking_code=f"APL-{index:04}", full_name="Name", email="candidate@example.kz", phone="+77000000000", subject="Literal_%" if index == 205 else "Example", message="Message", organizational_unit_id=own if index < 206 else other, assigned_to_id=worker if index == 205 else None))
            db.commit()
        path = "/api/v1/admin/appeals"
        first = self.client.get(path, params={"paginated": True, "limit": 100}, headers=headers).json()
        second = self.client.get(path, params={"paginated": True, "limit": 100, "offset": 100}, headers=headers).json()
        last = self.client.get(path, params={"paginated": True, "limit": 100, "offset": 200}, headers=headers).json()
        self.assertEqual((first["total"], len(first["items"]), len(second["items"]), len(last["items"])), (206, 100, 100, 6))
        ids = [row["id"] for batch in (first, second, last) for row in batch["items"]]
        self.assertEqual(len(set(ids)), 206)
        for params, count in (({"q": "_%"}, 1), ({"assigned_to_id": worker}, 1), ({"unassigned": True}, 205), ({"organizational_unit_id": other}, 0), ({"status": "answered"}, 0)):
            response = self.client.get(path, params={"paginated": True, **params}, headers=headers)
            self.assertEqual(response.status_code, 200, response.text)
            self.assertEqual(response.json()["total"], count)
        for params in ({"limit": 101}, {"offset": -1}, {"status": "not-a-status"}):
            self.assertEqual(self.client.get(path, params=params, headers=headers).status_code, 422)

    def test_candidate_and_result_search_and_counts_are_scoped(self):
        unit = self.unit("own")
        candidate, _, result = self.cases(unit)
        self.cases()
        _, headers, _, _ = self.staff(scope="territorial", unit=unit)
        response = self.client.get("/api/v1/admin/candidates", params={"paginated": True, "q": "Test Candidate"}, headers=headers)
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual([row["id"] for row in response.json()["items"]], [candidate])
        response = self.client.get("/api/v1/admin/psychological-tests/results", params={"paginated": True, "q": "Test"}, headers=headers)
        self.assertEqual(response.json()["total"], 1)
        self.assertEqual(response.json()["items"][0]["id"], result)
        dashboard = self.client.get("/api/v1/admin/dashboard", headers=headers).json()
        self.assertEqual(dashboard["candidate_status_counts"], {"submitted": 1})

    def test_candidate_receives_only_public_messages_and_no_staff_identity(self):
        owner = self.register()
        stranger = self.register("stranger@example.kz")
        _, staff, _, _ = self.staff()
        with self.session_factory() as db:
            candidate = db.query(CandidateApplication).join(User, CandidateApplication.user_id == User.id).filter(User.email == "candidate@example.kz").one()
            candidate.moderator_comment = "Existing private note"
            identity = candidate.id
            db.commit()
        path = f"/api/v1/admin/candidates/{identity}/comments"
        for visibility, text in (("internal", "Private staff note"), ("candidate", "Public candidate message")):
            response = self.client.post(path, json={"visibility": visibility, "text": text}, headers=staff)
            self.assertEqual(response.status_code, 201, response.text)
        self.assertEqual(self.client.get(path, headers=staff).json()["total"], 2)
        response = self.client.get("/api/v1/candidate/messages", headers=owner)
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["total"], 1)
        self.assertEqual(response.json()["items"][0]["text"], "Public candidate message")
        self.assertEqual(set(response.json()["items"][0]), {"id", "text", "created_at"})
        self.assertEqual(self.client.get("/api/v1/candidate/messages", headers=stranger).json()["total"], 0)
        self.assertNotIn("private", self.client.get("/api/v1/auth/me", headers=owner).text.lower())
        self.assertEqual(self.client.get(path, headers=owner).status_code, 401)
        self.assertEqual(self.client.get("/api/v1/candidate/messages").status_code, 401)

    def test_appeal_messages_require_verified_owner_and_code_reveals_only_status(self):
        owner = self.register()
        stranger = self.register("stranger@example.kz")
        _, staff, _, _ = self.staff()
        payload = {"full_name": "Candidate", "email": "someone-else@example.kz", "phone": "+77000000000", "subject": "Question", "message": "Long enough appeal message"}
        response = self.client.post("/api/v1/appeals", json=payload, headers=owner)
        self.assertEqual(response.status_code, 201, response.text)
        code = response.json()["tracking_code"]
        with self.session_factory() as db:
            identity = db.query(Appeal).filter_by(tracking_code=code).one().id
        path = f"/api/v1/admin/appeals/{identity}/comments"
        for visibility in ("internal", "candidate"):
            self.assertEqual(self.client.post(path, json={"visibility": visibility, "text": visibility + " note"}, headers=staff).status_code, 201)
        self.assertEqual(set(self.client.get(f"/api/v1/appeals/{code}").json()), {"tracking_code", "status"})
        messages = f"/api/v1/appeals/{code}/messages"
        self.assertEqual(self.client.get(messages, headers=owner).json()["total"], 1)
        self.assertEqual(self.client.get(messages, headers=stranger).status_code, 404)
        self.assertEqual(self.client.get(messages).status_code, 401)
        _, legacy, _ = self.cases()
        self.assertEqual(self.client.post(f"/api/v1/admin/appeals/{legacy}/comments", json={"visibility": "candidate", "text": "Message"}, headers=staff).status_code, 422)

    def test_foreign_comment_and_history_endpoints_are_scoped(self):
        own, other = self.unit("own"), self.unit("other")
        _, headers, _, _ = self.staff(scope="territorial", unit=own)
        candidate, appeal, _ = self.cases(other)
        for kind, identity in (("candidates", candidate), ("appeals", appeal)):
            for suffix in ("comments", "history"):
                self.assertEqual(self.client.get(f"/api/v1/admin/{kind}/{identity}/{suffix}", headers=headers).status_code, 404)
            self.assertEqual(self.client.post(f"/api/v1/admin/{kind}/{identity}/comments", json={"visibility": "internal", "text": "Private note"}, headers=headers).status_code, 404)

    def test_history_records_actor_before_after_and_keeps_legacy_note(self):
        _, headers, _, _ = self.staff()
        candidate, _, _ = self.cases()
        unit = self.unit("own")
        path = f"/api/v1/admin/candidates/{candidate}"
        self.assertEqual(self.client.patch(path + "/status", json={"status": "in_review", "moderator_comment": "Private note"}, headers=headers).status_code, 200)
        response = self.client.patch(path + "/status", json={"status": "approved"}, headers=headers)
        self.assertEqual(response.json()["moderator_comment"], "Private note")
        self.assertEqual(self.client.patch(path + "/assignment", json={"organizational_unit_id": unit}, headers=headers).status_code, 200)
        response = self.client.get(path + "/history?limit=1", headers=headers)
        self.assertEqual(response.json()["total"], 3)
        item = response.json()["items"][0]
        self.assertEqual(item["actor_name"], "Staff test")
        self.assertEqual(item["details"]["organizational_unit_id"], {"before": None, "after": unit})
        previous = self.client.get(path + "/history?offset=1", headers=headers).json()["items"][0]
        self.assertEqual(previous["details"]["status"], {"before": "in_review", "after": "approved"})

    def test_invalid_comments_rejected_and_order_is_stable(self):
        _, headers, _, _ = self.staff()
        candidate, _, _ = self.cases()
        path = f"/api/v1/admin/candidates/{candidate}/comments"
        for body in ({"visibility": "internal", "text": "   "}, {"visibility": "everyone", "text": "Hello"}, {"visibility": "internal", "text": "a" * 4001}):
            self.assertEqual(self.client.post(path, json=body, headers=headers).status_code, 422)
        for index in range(3):
            self.assertEqual(self.client.post(path, json={"visibility": "internal", "text": f"Note {index}"}, headers=headers).status_code, 201)
        with self.session_factory() as db:
            for row in db.query(CaseComment).all():
                row.created_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
            db.commit()
        first = self.client.get(path + "?limit=2", headers=headers).json()
        last = self.client.get(path + "?limit=2&offset=2", headers=headers).json()
        self.assertEqual([row["text"] for row in first["items"] + last["items"]], ["Note 2", "Note 1", "Note 0"])

    def test_units_can_be_edited_only_by_admin_and_duplicates_are_safe(self):
        _, admin, _, _ = self.staff(role=Role.admin)
        _, central, _, _ = self.staff()
        first, second = self.unit("first"), self.unit("second")
        path = f"/api/v1/admin/organizational-units/{first}"
        payload = {"code": "renamed", "name_ru": "Новое название", "name_kk": "Жаңа атауы"}
        self.assertEqual(self.client.put(path, json=payload, headers=central).status_code, 403)
        self.assertEqual(self.client.put(path, json=payload, headers=admin).status_code, 200)
        self.assertEqual(self.client.put(path, json={**payload, "code": "second"}, headers=admin).status_code, 409)
        units = self.client.get("/api/v1/admin/organizational-units", headers=admin).json()
        self.assertEqual(next(row for row in units if row["id"] == first)["code"], "renamed")

    def test_assignee_directory_hides_candidate_accounts_and_secrets(self):
        target, headers, _, _ = self.staff()
        self.staff(scope=None)
        self.staff(role=Role.candidate)
        inactive, _, _, _ = self.staff()
        with self.session_factory() as db:
            db.get(User, inactive).is_blocked = True
            db.commit()
        response = self.client.get("/api/v1/admin/assignees?paginated=true", headers=headers)
        self.assertEqual(response.json()["total"], 1)
        row = response.json()["items"][0]
        self.assertEqual(row["id"], target)
        self.assertEqual(set(row), {"id", "full_name", "staff_scope", "organizational_unit_id"})

    def test_user_search_and_role_filter_are_admin_only(self):
        _, admin, _, _ = self.staff(role=Role.admin)
        target, central, _, email = self.staff()
        response = self.client.get("/api/v1/admin/users", params={"paginated": True, "q": email, "role": "moderator"}, headers=admin)
        self.assertEqual(response.json()["total"], 1)
        self.assertEqual(response.json()["items"][0]["id"], target)
        self.assertEqual(self.client.get("/api/v1/admin/users?paginated=true", headers=central).status_code, 403)

    def test_territorial_assignee_directory_is_limited_to_own_unit(self):
        own, other = self.unit("own"), self.unit("other")
        identity, headers, _, _ = self.staff(scope="territorial", unit=own)
        self.staff(scope="territorial", unit=other)
        self.staff()
        self.staff(role=Role.admin)
        response = self.client.get("/api/v1/admin/assignees?paginated=true", headers=headers)
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual([row["id"] for row in response.json()["items"]], [identity])
