from __future__ import annotations

import json
import math
import re
import urllib.error
import urllib.request
from collections import Counter
from functools import lru_cache
from pathlib import Path
from typing import TypedDict

from app.core.config import get_settings


class FaqItem(TypedDict):
    id: str
    section: str
    question: str
    answer: str


class FaqMatch(TypedDict):
    item: FaqItem | None
    confidence: float
    suggestions: list[FaqItem]
    llm_used: bool


class LocalLlmUnavailable(RuntimeError):
    pass


DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "faq_assistant_ru.json"
MIN_CONFIDENCE = 0.22

STOP_WORDS = {
    "что",
    "как",
    "куда",
    "когда",
    "какие",
    "какой",
    "какая",
    "каким",
    "можно",
    "нужно",
    "надо",
    "если",
    "для",
    "при",
    "или",
    "она",
    "они",
    "оно",
    "его",
    "мне",
    "меня",
    "мой",
    "моя",
    "ли",
    "на",
    "в",
    "во",
    "по",
    "из",
    "за",
    "с",
    "со",
    "и",
    "а",
    "о",
    "об",
    "у",
    "к",
    "же",
    "это",
    "есть",
}


def _normalize(text: str) -> str:
    return text.lower().replace("ё", "е")


def _tokens(text: str) -> list[str]:
    normalized = _normalize(text)
    tokens = re.findall(r"[a-zа-я0-9]+", normalized)
    return [token for token in tokens if len(token) > 2 and token not in STOP_WORDS]


def _expanded_query_tokens(text: str) -> list[str]:
    tokens = _tokens(text)
    token_set = set(tokens)
    expanded = list(tokens)

    wants_employment = any(token.startswith(("сотруд", "работ", "устро", "стать", "служ")) for token in token_set)
    mentions_knb = any(token in {"кнб", "онб"} for token in token_set)
    if wants_employment and mentions_knb:
        expanded.extend(["службу", "служба", "поступления", "зачисления", "условия", "кандидат"])

    wants_admission = any(token.startswith(("поступ", "зачисл", "прием", "принят")) for token in token_set)
    if wants_admission and any(token.startswith(("служ", "сотруд", "работ")) for token in token_set):
        expanded.extend(["службу", "условия", "кандидат", "документы", "отбор"])

    if any(token.startswith(("зарплат", "оклад", "довольств", "денеж")) for token in token_set):
        expanded.extend(["заработной", "платы", "денежное", "содержание"])

    if any(token.startswith(("документ", "бумаг", "справк")) for token in token_set):
        expanded.extend(["документы", "предоставить", "заявление"])

    return expanded


def _char_grams(text: str) -> Counter[str]:
    compact = re.sub(r"\s+", " ", _normalize(text)).strip()
    if len(compact) < 4:
        return Counter()
    return Counter(compact[index : index + 4] for index in range(len(compact) - 3))


def _cosine(left: Counter[str], right: Counter[str]) -> float:
    if not left or not right:
        return 0.0
    numerator = sum(left[key] * right.get(key, 0) for key in left)
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))
    if not left_norm or not right_norm:
        return 0.0
    return numerator / (left_norm * right_norm)


def _token_score(query_tokens: list[str], item_tokens: list[str]) -> float:
    if not query_tokens or not item_tokens:
        return 0.0
    query = set(query_tokens)
    item = set(item_tokens)
    overlap = len(query & item)
    if not overlap:
        return 0.0
    recall = overlap / len(query)
    precision = overlap / len(item)
    return (0.78 * recall) + (0.22 * precision)


def _score_faq_items(question: str) -> list[tuple[float, FaqItem]]:
    query_tokens = _expanded_query_tokens(question)
    query_grams = _char_grams(question)
    normalized_question = _normalize(question)
    scored: list[tuple[float, FaqItem]] = []

    for indexed in _indexed_items():
        item = indexed["item"]
        question_score = _token_score(query_tokens, indexed["question_tokens"])
        combined_score = _token_score(query_tokens, indexed["combined_tokens"])
        gram_score = _cosine(query_grams, indexed["question_grams"])
        substring_boost = 0.15 if normalized_question and normalized_question in _normalize(item["question"]) else 0.0
        score = min(1.0, (0.58 * question_score) + (0.22 * combined_score) + (0.20 * gram_score) + substring_boost)
        scored.append((score, item))

    scored.sort(key=lambda pair: pair[0], reverse=True)
    return scored


@lru_cache(maxsize=1)
def _faq_payload() -> dict:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def _indexed_items() -> list[dict]:
    items = _faq_payload()["items"]
    indexed = []
    for item in items:
        question_tokens = _tokens(item["question"])
        answer_tokens = _tokens(item["answer"])
        indexed.append(
            {
                "item": item,
                "question_tokens": question_tokens,
                "combined_tokens": question_tokens + answer_tokens[:80],
                "question_grams": _char_grams(item["question"]),
            }
        )
    return indexed


def faq_source_name() -> str:
    return _faq_payload()["source"]


def _extract_json_object(text: str) -> dict | None:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None
    try:
        parsed = json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None
    return parsed if isinstance(parsed, dict) else None


def _select_with_local_llm(question: str, candidates: list[FaqItem]) -> str | None:
    settings = get_settings()
    if not settings.faq_llm_enabled:
        raise LocalLlmUnavailable("FAQ LLM is disabled")

    candidate_text = "\n".join(
        f"{item['id']}. Раздел: {item['section']}\nВопрос: {item['question']}\nФрагмент ответа: {item['answer'][:320]}"
        for item in candidates
    )
    system_prompt = (
        "Ты классификатор FAQ для официального портала. "
        "Нельзя отвечать на вопрос пользователя. Нужно только выбрать id одного FAQ, "
        "который лучше всего соответствует смыслу вопроса. Если среди кандидатов нет ответа, выбери NONE. "
        "Верни только JSON вида {\"faq_id\":\"faq-001\"} или {\"faq_id\":\"NONE\"}."
    )
    user_prompt = f"Вопрос пользователя:\n{question}\n\nКандидаты FAQ:\n{candidate_text}"
    payload = {
        "model": settings.faq_llm_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0,
        "max_tokens": 24,
        "stream": False,
    }
    request = urllib.request.Request(
        f"{settings.faq_llm_base_url.rstrip('/')}/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=settings.faq_llm_timeout_seconds) as response:
            response_payload = json.loads(response.read().decode("utf-8"))
    except (OSError, urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise LocalLlmUnavailable("Local FAQ LLM server is unavailable") from exc

    content = response_payload.get("choices", [{}])[0].get("message", {}).get("content", "")
    parsed = _extract_json_object(content)
    faq_id = parsed.get("faq_id") if parsed else None
    if not isinstance(faq_id, str):
        raise LocalLlmUnavailable("Local FAQ LLM returned an invalid response")
    if faq_id == "NONE":
        return "__NONE__"
    candidate_ids = {item["id"] for item in candidates}
    return faq_id if faq_id in candidate_ids else None


def find_faq_answer(question: str) -> FaqMatch:
    scored = _score_faq_items(question)
    suggestions = [item for score, item in scored[:3] if score >= 0.12]
    best_score, best_item = scored[0]
    second_score = scored[1][0] if len(scored) > 1 else 0.0
    llm_candidates = [item for _, item in scored[:5]]
    llm_selected_id = _select_with_local_llm(question, llm_candidates)
    if llm_selected_id == "__NONE__":
        if best_score >= 0.65 or (best_score >= 0.30 and best_score - second_score >= 0.12):
            return {"item": best_item, "confidence": round(best_score, 3), "suggestions": suggestions, "llm_used": True}
        return {"item": None, "confidence": round(best_score, 3), "suggestions": suggestions, "llm_used": True}
    if llm_selected_id:
        selected = next((item for item in llm_candidates if item["id"] == llm_selected_id), None)
        if selected:
            selected_score = next((score for score, item in scored if item["id"] == selected["id"]), best_score)
            if best_score >= 0.65 and selected_score < best_score - 0.10:
                return {"item": best_item, "confidence": round(best_score, 3), "suggestions": suggestions, "llm_used": True}
            return {"item": selected, "confidence": round(max(selected_score, MIN_CONFIDENCE), 3), "suggestions": suggestions, "llm_used": True}

    return {"item": None, "confidence": round(best_score, 3), "suggestions": suggestions, "llm_used": True}
