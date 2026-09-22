import { API_URL, parseApiError } from "@/lib/api";
import { authFetch, TEMPORARY_DEMO_AUTH_ENABLED } from "@/lib/auth";

const DEMO_RESULTS_KEY = "knb-temporary-demo-test-results";
const DEMO_PROGRESS_KEY = "knb-temporary-demo-test-progress";

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

export type PsychologicalTestProgress = {
  id: number;
  test_slug: string;
  test_title: string;
  total_questions: number;
  answered_questions: number;
  current_section_index: number;
  sections: PsychologicalTestSectionResult[];
  answers: Record<string, Record<string, string | string[]>>;
  updated_at: string;
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

export type PsychologicalTestProgressSave = {
  test_slug: string;
  test_title: string;
  total_questions: number;
  answered_questions: number;
  current_section_index: number;
  sections: PsychologicalTestSectionResult[];
  answers: Record<string, Record<string, string | string[]>>;
};

async function readJson<T>(response: Response) {
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as T;
}

function readDemoStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const value = window.sessionStorage.getItem(key);
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function writeDemoStorage(key: string, value: unknown) {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  }
}

const demoResult: PsychologicalTestResult = {
  id: -1,
  test_slug: "primary-selection-demo",
  test_title: "Демонстрационный психологический тест",
  total_questions: 100,
  answered_questions: 92,
  duration_seconds: 3600,
  remaining_seconds: 840,
  sections: [
    { id: "numeric", title: "Числовые закономерности", total_questions: 50, answered_questions: 47, scored_questions: 50, correct_answers: 41, score_percent: 82 },
    { id: "visual", title: "Зрительные закономерности", total_questions: 50, answered_questions: 45, scored_questions: 50, correct_answers: 39, score_percent: 78 }
  ],
  submitted_at: "2026-09-18T10:30:00+05:00"
};

export async function savePsychologicalTestResult(payload: PsychologicalTestResultCreate) {
  if (TEMPORARY_DEMO_AUTH_ENABLED) {
    const result: PsychologicalTestResult = {
      id: Date.now(),
      test_slug: payload.test_slug,
      test_title: payload.test_title,
      total_questions: payload.total_questions,
      answered_questions: payload.answered_questions,
      duration_seconds: payload.duration_seconds,
      remaining_seconds: payload.remaining_seconds,
      sections: payload.sections,
      submitted_at: new Date().toISOString()
    };
    const results = readDemoStorage<PsychologicalTestResult[]>(DEMO_RESULTS_KEY, []);
    writeDemoStorage(DEMO_RESULTS_KEY, [result, ...results]);
    window.sessionStorage.removeItem(DEMO_PROGRESS_KEY);
    return result;
  }

  return readJson<PsychologicalTestResult>(
    await authFetch(`${API_URL}/psychological-tests/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  );
}

export async function getPsychologicalTestProgress(testSlug: string) {
  if (TEMPORARY_DEMO_AUTH_ENABLED) {
    const progress = readDemoStorage<PsychologicalTestProgress | null>(DEMO_PROGRESS_KEY, null);
    return progress?.test_slug === testSlug ? progress : null;
  }

  const response = await authFetch(`${API_URL}/psychological-tests/progress/${testSlug}`);
  if (response.status === 404) return null;
  return readJson<PsychologicalTestProgress>(response);
}

export async function savePsychologicalTestProgress(payload: PsychologicalTestProgressSave) {
  if (TEMPORARY_DEMO_AUTH_ENABLED) {
    const progress: PsychologicalTestProgress = {
      id: Date.now(),
      ...payload,
      updated_at: new Date().toISOString()
    };
    writeDemoStorage(DEMO_PROGRESS_KEY, progress);
    return progress;
  }

  return readJson<PsychologicalTestProgress>(
    await authFetch(`${API_URL}/psychological-tests/progress`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  );
}

export async function deletePsychologicalTestProgress(testSlug: string) {
  if (TEMPORARY_DEMO_AUTH_ENABLED) {
    const progress = readDemoStorage<PsychologicalTestProgress | null>(DEMO_PROGRESS_KEY, null);
    if (progress?.test_slug === testSlug && typeof window !== "undefined") {
      window.sessionStorage.removeItem(DEMO_PROGRESS_KEY);
    }
    return;
  }

  const response = await authFetch(`${API_URL}/psychological-tests/progress/${testSlug}`, {
    method: "DELETE"
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(await parseApiError(response));
  }
}

export async function listMyPsychologicalTestResults() {
  if (TEMPORARY_DEMO_AUTH_ENABLED) {
    return [...readDemoStorage<PsychologicalTestResult[]>(DEMO_RESULTS_KEY, []), demoResult];
  }

  return readJson<PsychologicalTestResult[]>(await authFetch(`${API_URL}/psychological-tests/results/me`));
}
