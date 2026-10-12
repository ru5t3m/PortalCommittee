import copy
from collections import deque
from uuid import uuid4
from unittest.mock import patch

import test_portal as portal
from app.models.entities import AuthSession, SpecGameProgress, User
from app.services import specgame as service


class GameTests(portal.unittest.TestCase):
    register = portal.PortalTests.register
    url = "/api/v1/games/specgame/progress"
    actions = "/api/v1/games/specgame/actions"

    def setUp(self):
        portal.PortalTests.setUp(self)
        self.now = portal.datetime.now(portal.timezone.utc)
        clock = patch.object(service, "utcnow", side_effect=lambda: self.now)
        clock.start()
        self.addCleanup(clock.stop)

    def load(self, headers):
        response = self.client.get(self.url, headers=headers)
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def payload(self, state, action="next", choice=None):
        return {"action": action, "choice_index": choice, "version": state["version"],
                "node_id": state["game_progress"]["nodeId"], "event_id": str(uuid4())}

    def step(self, headers, state, action="next", choice=None):
        response = self.client.post(self.actions, headers=headers, json=self.payload(state, action, choice))
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def start(self, headers):
        state = self.step(headers, self.load(headers), "menu")
        state = self.step(headers, state)
        self.assertEqual(state["available_choices"], [1])
        return self.step(headers, state, "choice", 1)

    def first_choice(self, headers):
        state = self.start(headers)
        for _ in range(20):
            if state["game_progress"]["choicesShown"]:
                self.assertEqual(state["game_progress"]["nodeId"], "fr_a1_micro_menu")
                return state
            state = self.step(headers, state)
        self.fail("Could not reach first choice")

    def test_requires_active_portal_session(self):
        self.assertEqual(self.client.get(self.url).status_code, 401)
        self.assertEqual(self.client.post(self.actions, json={}).status_code, 401)
        headers = self.register()
        with self.session_factory() as db:
            db.query(AuthSession).update({"revoked_at": self.now})
            db.commit()
        self.assertEqual(self.client.get(self.url, headers=headers).status_code, 401)
        self.assertEqual(self.client.post(self.actions, headers=headers, json=self.payload({"version": 1, "game_progress": {"nodeId": "curator_intro"}})).status_code, 401)

    def test_private_progress_and_errors_are_never_cacheable(self):
        unauthorized = self.client.get(self.url)
        self.assertEqual(unauthorized.headers["cache-control"], "private, no-store")
        headers = self.register()
        loaded = self.client.get(self.url, headers=headers)
        self.assertEqual(loaded.headers["cache-control"], "private, no-store")
        action = self.client.post(self.actions, headers=headers, json=self.payload(loaded.json()))
        self.assertEqual(action.headers["cache-control"], "private, no-store")
        rejected = self.client.put(self.url, headers=headers, json={})
        self.assertEqual(rejected.headers["cache-control"], "private, no-store")

    def test_blocked_account_is_denied(self):
        headers = self.register()
        with self.session_factory() as db:
            db.query(User).update({"is_blocked": True})
            db.commit()
        self.assertEqual(self.client.get(self.url, headers=headers).status_code, 401)

    def test_scores_are_calculated_by_server_and_private(self):
        headers = self.register("first@example.kz")
        state = self.first_choice(headers)
        state = self.step(headers, state, "choice", 0)
        self.assertEqual(state["skills"], {**service.defaults(), "recon": 60, "intel": 60, "analytics": 60})
        other = self.register("second@example.kz")
        self.assertEqual(self.load(other)["skills"], service.defaults())
        login = self.client.post("/api/v1/auth/password/login", json={"email": "first@example.kz", "password": "PortalTest123!"})
        restored = self.load({"Authorization": "Bearer " + login.json()["access_token"]})
        self.assertEqual(restored["skills"], state["skills"])
        self.assertEqual(restored["game_progress"], state["game_progress"])

    def test_direct_score_and_position_write_is_removed(self):
        headers = self.register()
        before = self.load(headers)
        body = {"skills": {"trust": 100}, "game_progress": {"nodeId": "fr_end_success", "lineIndex": 0}, "version": before["version"]}
        self.assertEqual(self.client.put(self.url, headers=headers, json=body).status_code, 405)
        for name, value in [("skills", {"trust": 100}), ("effects", {"trust": 50}), ("game_progress", body["game_progress"]),
                            ("user_id", 999), ("next", "fr_end_success"), ("choiceDeadline", 4102444800000)]:
            with self.subTest(name=name):
                forged = {**self.payload(before), name: value}
                self.assertEqual(self.client.post(self.actions, headers=headers, json=forged).status_code, 422)
        self.assertEqual(self.load(headers)["version"], before["version"])

    def test_scene_skip_and_answer_before_choices_are_rejected(self):
        headers = self.register()
        before = self.load(headers)
        forged = self.payload(before)
        forged["node_id"] = "fr_end_success"
        self.assertEqual(self.client.post(self.actions, headers=headers, json=forged).status_code, 409)
        self.assertEqual(self.client.post(self.actions, headers=headers, json=self.payload(before, "choice", 0)).status_code, 400)
        self.assertEqual(self.load(headers)["game_progress"], before["game_progress"])

    def test_all_other_directions_are_disabled_on_server(self):
        headers = self.register()
        state = self.step(headers, self.load(headers), "menu")
        state = self.step(headers, state)
        for index in (0, 2, 3, 4, 5, 6):
            with self.subTest(index=index):
                self.assertEqual(self.client.post(self.actions, headers=headers, json=self.payload(state, "choice", index)).status_code, 403)
        for node_id in ("nb_intro", "ntk_s1_e1", "cr_kapremont_prologue", "at_intro"):
            forged = self.payload(state)
            forged["node_id"] = node_id
            self.assertEqual(self.client.post(self.actions, headers=headers, json=forged).status_code, 409)
        self.assertEqual(self.load(headers)["version"], state["version"])

    def test_duplicate_delivery_and_double_click_do_not_award_twice(self):
        headers = self.register()
        before = self.first_choice(headers)
        body = self.payload(before, "choice", 0)
        first = self.client.post(self.actions, headers=headers, json=body).json()
        repeated = self.client.post(self.actions, headers=headers, json=body)
        self.assertEqual(repeated.status_code, 200)
        self.assertEqual(repeated.json()["version"], first["version"])
        self.assertEqual(repeated.json()["skills"], first["skills"])
        modified = {**body, "choice_index": 1}
        self.assertEqual(self.client.post(self.actions, headers=headers, json=modified).status_code, 409)
        modified = {**body, "event_id": str(uuid4())}
        self.assertEqual(self.client.post(self.actions, headers=headers, json=modified).status_code, 409)
        later = self.step(headers, first)
        self.assertEqual(self.client.post(self.actions, headers=headers, json=body).status_code, 409)
        self.assertEqual(self.load(headers)["skills"], later["skills"])

    def test_invalid_action_types_and_indices_are_rejected(self):
        headers = self.register()
        state = self.first_choice(headers)
        for changes, status in [({"choice_index": -1}, 422), ({"choice_index": True}, 422), ({"choice_index": "0"}, 422),
                                ({"choice_index": 99}, 400), ({"choice_index": None}, 400), ({"version": "1"}, 422),
                                ({"version": False}, 422), ({"event_id": "wrong"}, 422), ({"action": "finish"}, 422)]:
            body = {**self.payload(state, "choice", 0), **changes}
            with self.subTest(changes=changes):
                self.assertEqual(self.client.post(self.actions, headers=headers, json=body).status_code, status)
        self.assertEqual(self.load(headers)["skills"], service.defaults())

    def test_server_timeout_cannot_be_faked_or_extended_and_applies_once(self):
        headers = self.register()
        before = self.first_choice(headers)
        self.assertEqual(before["game_progress"]["choiceDeadline"], self.now.timestamp() * 1000 + 30000)
        self.assertEqual(self.client.post(self.actions, headers=headers, json=self.payload(before, "timeout")).status_code, 400)
        self.now += portal.timedelta(seconds=31)
        late = self.step(headers, before, "choice", 0)
        self.assertTrue(late["game_progress"]["timeoutHandled"])
        self.assertIsNone(late["game_progress"]["choiceDeadline"])
        self.assertEqual(late["skills"], {**service.defaults(), "trust": 49, "tension": 52})
        reloaded = self.load(headers)
        self.assertEqual(reloaded["version"], late["version"])
        self.assertEqual(reloaded["skills"], late["skills"])
        after = self.step(headers, reloaded, "choice", 0)
        self.assertEqual(after["skills"], {**late["skills"], "recon": 60, "intel": 60, "analytics": 60})

    def test_loading_after_closed_tab_applies_timeout_without_browser(self):
        headers = self.register()
        state = self.first_choice(headers)
        self.now += portal.timedelta(days=1)
        restored = self.load(headers)
        self.assertEqual(restored["version"], state["version"] + 1)
        self.assertEqual(restored["skills"]["trust"], 49)
        self.assertEqual(self.load(headers)["skills"]["trust"], 49)

    def test_legacy_browser_scores_are_archived_without_becoming_trusted(self):
        headers = self.register()
        legacy = {"nodeId": "fr_end_success", "lineIndex": 0}
        with self.session_factory() as db:
            db.add(SpecGameProgress(user_id=db.query(User).one().id, skills=dict.fromkeys(service.SKILLS, 100), game_progress=legacy, version=15))
            db.commit()
        state = self.load(headers)
        self.assertEqual(state["skills"], service.defaults())
        self.assertEqual(state["game_progress"]["nodeId"], "curator_intro")
        self.assertTrue(state["legacy_progress_archived"])
        with self.session_factory() as db:
            row = db.query(SpecGameProgress).one()
            self.assertEqual(row.legacy_state["skills"]["trust"], 100)
            self.assertEqual(row.legacy_state["game_progress"], legacy)
            archive = copy.deepcopy(row.legacy_state)
        self.step(headers, state)
        with self.session_factory() as db:
            self.assertEqual(db.query(SpecGameProgress).one().legacy_state, archive)

    def path_to(self, target):
        queue = deque([("fr_a1_intro", [])])
        seen = set()
        while queue:
            node_id, plan = queue.popleft()
            if node_id == target:
                return plan
            if node_id in seen:
                continue
            seen.add(node_id)
            node = service.CATALOG["rules"][node_id]
            for index, choice in enumerate(node["choices"]):
                if not choice["disabled"]:
                    queue.append((choice["next"], [*plan, (node_id, index)]))
            if node["next"]:
                queue.append((node["next"], [*plan, (node_id, None)]))
        self.fail("Unreachable ending: " + target)

    def test_complete_success_neutral_and_failed_routes_and_restart(self):
        for ending in ("fr_end_success", "fr_end_neutral", "fr_end_fail", "fr_a2_entry_hard"):
            with self.subTest(ending=ending):
                headers = self.register(ending + "@example.kz")
                state = self.start(headers)
                for node_id, choice_index in self.path_to(ending):
                    self.assertEqual(state["game_progress"]["nodeId"], node_id)
                    node = service.CATALOG["rules"][node_id]
                    for _ in range(node["lines"] - 1):
                        state = self.step(headers, state)
                    state = self.step(headers, state)
                    if choice_index is not None:
                        state = self.step(headers, state, "choice", choice_index)
                self.assertEqual(state["game_progress"]["nodeId"], ending)
                for _ in range(service.CATALOG["rules"][ending]["lines"] - 1):
                    state = self.step(headers, state)
                self.assertEqual(self.client.post(self.actions, headers=headers, json=self.payload(state)).status_code, 400)
                restarted = self.step(headers, state, "restart")
                self.assertEqual(restarted["game_progress"]["nodeId"], "fr_a1_intro")
                self.assertEqual(restarted["skills"], service.defaults())

    def test_only_server_generated_skills_stay_in_range(self):
        row = SpecGameProgress(skills=service.defaults())
        service.apply_effects(row, {"trust": 1000, "recon": -1000})
        self.assertEqual(row.skills["trust"], 100)
        self.assertEqual(row.skills["recon"], 0)
