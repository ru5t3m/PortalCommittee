import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm.exc import StaleDataError

from app.models.entities import SpecGameProgress

CATALOG = json.loads((Path(__file__).parents[1] / "data" / "specgame-catalog.json").read_text(encoding="utf-8"))
RULES_VERSION = CATALOG["rulesVersion"]
SKILLS = ("trust", "tension", "intel", "analytics", "recon", "speed", "confidence", "decision")


def utcnow():
    return datetime.now(timezone.utc)


def defaults():
    return dict.fromkeys(SKILLS, 50)


def position(node_id):
    node = CATALOG["rules"][node_id]
    scenario = node["scenario"]
    return {"nodeId": node_id, "lineIndex": 0, "currentScenario": scenario,
            "startNodeForCurrent": CATALOG["starts"].get(scenario), "choicesShown": False,
            "timeoutHandled": False, "choiceDeadline": None}


def commit(db):
    try:
        db.commit()
    except (IntegrityError, StaleDataError) as exc:
        db.rollback()
        raise HTTPException(409, "Game changed; reload its state") from exc


def owned_progress(db, user_id):
    row = db.query(SpecGameProgress).filter_by(user_id=user_id).with_for_update().first()
    if row is None:
        row = SpecGameProgress(user_id=user_id, skills=defaults(), game_progress=position("curator_intro"), rules_version=RULES_VERSION)
        db.add(row)
        try:
            db.flush()
        except IntegrityError:
            db.rollback()
            row = db.query(SpecGameProgress).filter_by(user_id=user_id).with_for_update().one()
    if row.rules_version == 0:
        row.legacy_state = {"skills": row.skills, "game_progress": row.game_progress, "version": row.version,
                            "updated_at": row.updated_at.isoformat() if row.updated_at else None}
        row.skills = defaults()
        row.game_progress = position("curator_intro")
        row.rules_version = RULES_VERSION
        row.last_action = None
    if row.rules_version != RULES_VERSION:
        raise HTTPException(409, "Unsupported game rules version")
    return row


def apply_effects(row, effects):
    row.skills = {key: max(0, min(100, row.skills[key] + effects.get(key, 0))) for key in SKILLS}


def permitted(row, choice):
    if choice["disabled"] or choice["scenario"] and choice["scenario"] not in CATALOG["enabledScenarios"]:
        return False
    for key, value in choice["require"].items():
        if key.endswith("Min") and row.skills.get(key[:-3], 0) < value:
            return False
        if key.endswith("Max") and row.skills.get(key[:-3], 0) > value:
            return False
    return choice["next"] in CATALOG["rules"]


def enter(row, node_id):
    if node_id not in CATALOG["rules"]:
        raise HTTPException(400, "Direction is unavailable")
    row.game_progress = position(node_id)
    apply_effects(row, CATALOG["rules"][node_id]["effects"])


def expire(row, now):
    progress = row.game_progress
    deadline = progress.get("choiceDeadline")
    if deadline is None or progress["timeoutHandled"] or now.timestamp() * 1000 < deadline:
        return False
    node = CATALOG["rules"][progress["nodeId"]]
    row.game_progress = {**progress, "timeoutHandled": True, "choiceDeadline": None}
    apply_effects(row, node["timeoutEffects"])
    return True


def state(row, now):
    progress = row.game_progress
    node = CATALOG["rules"][progress["nodeId"]]
    return {"skills": row.skills, "game_progress": progress, "version": row.version,
            "rules_version": row.rules_version, "updated_at": row.updated_at,
            "server_time": now.timestamp() * 1000,
            "choice_duration_ms": node["timeoutMs"],
            "available_choices": [index for index, choice in enumerate(node["choices"]) if permitted(row, choice)] if progress["choicesShown"] else [],
            "last_event_id": row.last_action.get("event_id") if row.last_action else None,
            "legacy_progress_archived": row.legacy_state is not None}


def apply_action(row, payload, now):
    fingerprint = payload.model_dump(mode="json")
    if row.last_action and row.last_action["event_id"] == str(payload.event_id):
        if row.last_action != fingerprint:
            raise HTTPException(409, "Event already used for a different action")
        expire(row, now)
        return
    if expire(row, now):
        return
    if payload.version != row.version or payload.node_id != row.game_progress["nodeId"]:
        raise HTTPException(409, "Game changed; reload its state")
    progress = row.game_progress
    node = CATALOG["rules"][progress["nodeId"]]
    if payload.action != "choice" and payload.choice_index is not None:
        raise HTTPException(400, "Unexpected choice")
    if payload.action == "next":
        if progress["choicesShown"] or node["ending"] and progress["lineIndex"] == node["lines"] - 1:
            raise HTTPException(400, "Cannot advance this scene")
        if progress["lineIndex"] < node["lines"] - 1:
            row.game_progress = {**progress, "lineIndex": progress["lineIndex"] + 1}
        elif node["choices"]:
            deadline = now.timestamp() * 1000 + node["timeoutMs"] if node["scenario"] else None
            row.game_progress = {**progress, "choicesShown": True, "choiceDeadline": deadline}
        elif node["next"]:
            enter(row, node["next"])
        else:
            raise HTTPException(400, "Scene has no next step")
    elif payload.action == "choice":
        if not progress["choicesShown"] or payload.choice_index is None or payload.choice_index >= len(node["choices"]):
            raise HTTPException(400, "Invalid choice for the current scene")
        choice = node["choices"][payload.choice_index]
        if not permitted(row, choice):
            raise HTTPException(403, "Direction or choice is unavailable")
        if choice["scenario"]:
            row.skills = defaults()
        apply_effects(row, choice["effects"])
        enter(row, choice["next"])
    elif payload.action == "menu":
        row.skills = defaults()
        enter(row, "direction_menu")
    elif payload.action == "restart":
        row.skills = defaults()
        enter(row, progress["startNodeForCurrent"] or "curator_intro")
    elif payload.action == "timeout":
        if not progress["choicesShown"] or not progress["timeoutHandled"]:
            raise HTTPException(400, "Choice timer has not expired")
    row.last_action = fingerprint
