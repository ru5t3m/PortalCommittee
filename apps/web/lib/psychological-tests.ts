import { API_URL, parseApiError } from "@/lib/api";
import { authFetch } from "@/lib/auth";
import type { PrimaryPsychologicalQuestion } from "@/lib/primary-psychological-test";

export type PsychologicalTestSectionResult = {
  id: string;
  title: string;
  total_questions: number;
  answered_questions: number;
  scored_questions?: number;
  correct_answers?: number;
  score_percent?: number;
};

export type PsychologicalTestResult = {
  id: number;
  test_slug: string;
  test_title: string;
  total_questions: number;
  answered_questions: number;
  duration_seconds: number;
  remaining_seconds: number;
  sections: PsychologicalTestSectionResult[];
  submitted_at: string;
};


export type TestAttempt = {
  id: string;
  test_slug: string;
  bank_version: string;
  status: "instructions" | "questions" | "sectionComplete" | "ready" | "completed";
  version: number;
  sections: (PsychologicalTestSectionResult & { id: "numeric" | "visual" | "verbal"; description: string })[];
  current_section_index: number;
  current_question_index: number;
  current_question: PrimaryPsychologicalQuestion | null;
  current_answer: string | string[] | null;
  answered_questions: number;
  total_questions: number;
  server_time: string;
  question_deadline: string | null;
  result: PsychologicalTestResult | null;
};

export type AttemptActionName = "begin-section" | "continue" | "answer" | "draft" | "close-section" | "finish";
export type AttemptActionPayload = { version: number; event_id: string; question_id?: string; answer?: string | string[] };

export class AttemptApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) throw new AttemptApiError(await parseApiError(response), response.status);
  return response.json() as Promise<T>;
}

export async function startTestAttempt(locale: string, restart = false) {
  return readJson<TestAttempt>(await authFetch(API_URL + "/psychological-tests/attempts", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ test_slug: "primary-selection", locale, restart })
  }));
}

export async function getTestAttempt(id: string) {
  return readJson<TestAttempt>(await authFetch(API_URL + "/psychological-tests/attempts/" + id));
}

export async function changeTestAttempt(id: string, action: AttemptActionName, payload: AttemptActionPayload) {
  return readJson<TestAttempt>(await authFetch(API_URL + "/psychological-tests/attempts/" + id + "/" + action, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
  }));
}

export async function listMyPsychologicalTestResults() {
  return readJson<PsychologicalTestResult[]>(await authFetch(API_URL + "/psychological-tests/results/me"));
}
