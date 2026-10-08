import hashlib
import json
import math
import re
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from pathlib import Path

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.entities import CandidateApplication, PsychologicalTestAttempt, PsychologicalTestResult

SLUG = "primary-selection"
BANK_VERSION = "primary-selection.v1"
QUESTION_SECONDS = 60


def utcnow():
    return datetime.now(timezone.utc)


def as_utc(value):
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


@lru_cache
def bank(version=BANK_VERSION):
    if version != BANK_VERSION:
        raise HTTPException(409, "Unknown question bank version")
    return json.loads((Path(__file__).parents[1] / "data" / f"{version}.json").read_text(encoding="utf-8"))


def section(attempt):
    return bank(attempt.bank_version)["sections"][attempt.section_index]


def question(attempt):
    return section(attempt)["questions"][attempt.question_index]


def has_answer(answer):
    return bool(answer.strip()) if isinstance(answer, str) else bool(answer)


def normalize(value):
    value = re.sub(r"[.,;]+", " ", value.lower().replace("ё", "е"))
    value = re.sub(r"\s+и\s+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def correct(q, answer):
    keys = q.get("correctAnswers", [])
    if not keys or not has_answer(answer):
        return False
    if isinstance(answer, list):
        return sorted(map(normalize, answer)) == sorted(map(normalize, keys))
    return normalize(answer) in [normalize(key) for key in keys]


def summaries(attempt, scored=False):
    rows = []
    for item in bank(attempt.bank_version)["sections"]:
        answers = attempt.answers.get(item["id"], {})
        row = {"id": item["id"], "title": item["title"], "description": item["description"],
               "total_questions": len(item["questions"]),
               "answered_questions": sum(has_answer(answers.get(q["id"])) for q in item["questions"])}
        if scored:
            total = sum(bool(q.get("correctAnswers")) for q in item["questions"])
            count = sum(correct(q, answers.get(q["id"])) for q in item["questions"])
            row.update(scored_questions=total, correct_answers=count, score_percent=math.floor(count * 100 / total + .5) if total else 0)
        rows.append(row)
    return rows


def validate_answer(q, answer):
    mode = q.get("answerMode", "text")
    if mode == "multi":
        if not isinstance(answer, list) or len(answer) != len(set(answer)) or any(value not in q["choices"] for value in answer):
            raise HTTPException(422, "Invalid answer choices")
    elif not isinstance(answer, str) or len(answer) > 1000:
        raise HTTPException(422, "Invalid answer")
    elif q.get("choices") and answer and answer not in q["choices"]:
        raise HTTPException(422, "Invalid answer choice")


def store_answer(attempt, answer):
    q = question(attempt)
    validate_answer(q, answer)
    answers = {key: dict(values) for key, values in attempt.answers.items()}
    answers.setdefault(section(attempt)["id"], {})[q["id"]] = answer
    attempt.answers = answers


def advance(attempt, started_at):
    if attempt.question_index + 1 < len(section(attempt)["questions"]):
        attempt.question_index += 1
        attempt.question_started_at = started_at
    else:
        attempt.status = "ready" if attempt.section_index == len(bank(attempt.bank_version)["sections"]) - 1 else "sectionComplete"
        attempt.question_started_at = None


def expire(attempt, now):
    while attempt.status == "questions" and as_utc(attempt.question_started_at) + timedelta(seconds=QUESTION_SECONDS) <= now:
        deadline = as_utc(attempt.question_started_at) + timedelta(seconds=QUESTION_SECONDS)
        attempt.elapsed_milliseconds += QUESTION_SECONDS * 1000
        advance(attempt, deadline)


def state(attempt, db, now):
    rows = summaries(attempt)
    deadline = as_utc(attempt.question_started_at) + timedelta(seconds=QUESTION_SECONDS) if attempt.status == "questions" else None
    current = question(attempt) if deadline else None
    result = db.query(PsychologicalTestResult).filter_by(attempt_id=attempt.id).first() if attempt.status == "completed" else None
    return {"id": attempt.id, "test_slug": attempt.test_slug, "bank_version": attempt.bank_version,
            "status": attempt.status, "version": attempt.version, "sections": rows,
            "current_section_index": attempt.section_index, "current_question_index": attempt.question_index,
            "current_question": {key: value for key, value in current.items() if key not in ("correctAnswers", "answerExplanation")} if current else None,
            "current_answer": attempt.answers.get(section(attempt)["id"], {}).get(current["id"]) if current else None,
            "answered_questions": sum(row["answered_questions"] for row in rows),
            "total_questions": sum(row["total_questions"] for row in rows),
            "server_time": now, "question_deadline": deadline,
            "result": result_state(result) if result else None}


def result_state(result):
    return {key: getattr(result, key) for key in ("id", "test_slug", "test_title", "total_questions", "answered_questions", "duration_seconds", "remaining_seconds", "sections", "submitted_at")}


def finish(attempt, db):
    rows = summaries(attempt, scored=True)
    total = sum(row["total_questions"] for row in rows)
    application = db.query(CandidateApplication).filter_by(user_id=attempt.user_id).first()
    db.add(PsychologicalTestResult(
        attempt_id=attempt.id, user_id=attempt.user_id,
        candidate_application_id=application.id if application else None,
        test_slug=attempt.test_slug, test_title=bank(attempt.bank_version)["title"],
        total_questions=total, answered_questions=sum(row["answered_questions"] for row in rows),
        duration_seconds=total * QUESTION_SECONDS,
        remaining_seconds=max(0, total * QUESTION_SECONDS - math.ceil(attempt.elapsed_milliseconds / 1000)),
        sections=rows, answers=attempt.answers))
    attempt.status = "completed"
    attempt.active_key = None


def apply_action(attempt, action, payload, db: Session, now):
    digest = hashlib.sha256(json.dumps({"action": action, **payload.model_dump(mode="json")}, sort_keys=True).encode()).hexdigest()
    if attempt.last_event_id == str(payload.event_id):
        if attempt.last_event_digest != digest:
            raise HTTPException(409, "Event already used with another payload")
        return
    if action == "finish" and attempt.status == "completed":
        return
    if attempt.version != payload.version:
        raise HTTPException(409, "Attempt changed; reload its state")
    if action == "begin-section" and attempt.status == "instructions":
        attempt.status = "questions"
        attempt.question_started_at = now
    elif action == "continue" and attempt.status == "sectionComplete":
        attempt.section_index += 1
        attempt.question_index = 0
        attempt.status = "instructions"
    elif action in ("draft", "answer", "close-section") and attempt.status == "questions":
        if payload.question_id != question(attempt)["id"]:
            raise HTTPException(409, "Only the current question may be answered")
        store_answer(attempt, payload.answer)
        if action != "draft":
            attempt.elapsed_milliseconds += min(60000, max(0, math.floor((now - as_utc(attempt.question_started_at)).total_seconds() * 1000)))
            if action == "answer":
                advance(attempt, now)
            else:
                attempt.status = "ready" if attempt.section_index == len(bank(attempt.bank_version)["sections"]) - 1 else "sectionComplete"
                attempt.question_started_at = None
    elif action == "finish" and attempt.status == "ready":
        finish(attempt, db)
    else:
        raise HTTPException(409, "Action is not allowed at this stage")
    attempt.last_event_id = str(payload.event_id)
    attempt.last_event_digest = digest
