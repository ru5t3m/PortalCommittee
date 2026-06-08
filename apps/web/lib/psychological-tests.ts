import { API_URL, parseApiError } from "@/lib/api";
import { authFetch } from "@/lib/auth";

export type PsychologicalTestSectionResult = {
  id: string;
  title: string;
  total_questions: number;
  answered_questions: number;
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

export type PsychologicalTestResultCreate = {
  test_slug: string;
  test_title: string;
  total_questions: number;
  answered_questions: number;
  duration_seconds: number;
  remaining_seconds: number;
  sections: PsychologicalTestSectionResult[];
  answers: Record<string, Record<string, string | string[]>>;
};

async function readJson<T>(response: Response) {
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as T;
}

export async function savePsychologicalTestResult(payload: PsychologicalTestResultCreate) {
  return readJson<PsychologicalTestResult>(
    await authFetch(`${API_URL}/psychological-tests/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  );
}

export async function listMyPsychologicalTestResults() {
  return readJson<PsychologicalTestResult[]>(await authFetch(`${API_URL}/psychological-tests/results/me`));
}
