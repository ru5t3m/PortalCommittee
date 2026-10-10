import { expect, test, type Page } from "@playwright/test";
import { primaryPsychologicalSections } from "../lib/primary-psychological-test";
import type { TestAttempt } from "../lib/psychological-tests";

type StabilityWindow = Window & { initialLayoutShift: number };

async function waitForPaint(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function observeLayout(page: Page) {
  await page.addInitScript(() => {
    const state = window as unknown as StabilityWindow;
    state.initialLayoutShift = 0;
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
        if (!shift.hadRecentInput) state.initialLayoutShift += shift.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
}

async function expectStableLayout(page: Page) {
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => (window as unknown as StabilityWindow).initialLayoutShift)).toBeLessThan(0.02);
}

const profile = { can_access_admin: true, user: { id: 1, email: "candidate@example.kz", full_name: "Тестовый Кандидат", role: "candidate" }, candidate_application: null };

function fixture(status: "instructions" | "questions" | "completed"): TestAttempt {
  const sections = primaryPsychologicalSections.map(section => ({ id: section.id, title: section.title, description: section.description, total_questions: section.questions.length, answered_questions: 0 }));
  return {
    id: "11111111-1111-4111-8111-111111111111", test_slug: "primary-selection", bank_version: "primary-selection.v1", status, version: 1, sections,
    current_section_index: 0, current_question_index: 0, current_question: status === "questions" ? primaryPsychologicalSections[0].questions[0] : null,
    current_answer: null, answered_questions: 0, total_questions: 130, server_time: new Date().toISOString(),
    question_deadline: status === "questions" ? new Date(Date.now() + 60000).toISOString() : null,
    result: status === "completed" ? { id: 1, test_slug: "primary-selection", test_title: "Первичный психологический тест", total_questions: 130, answered_questions: 0, duration_seconds: 0, remaining_seconds: 0, sections, submitted_at: new Date().toISOString() } : null
  };
}

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  for (const locale of ["ru", "kk"] as const) {
    for (const state of ["instructions", "questions", "completed", "failure", "guest", "pending-answer"] as const) {
      test(`${viewport.width} ${locale}: test loading stays stable (${state})`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await observeLayout(page);
        const row = fixture(state === "questions" || state === "pending-answer" ? "questions" : state === "completed" ? "completed" : "instructions");
        if (state !== "guest") await page.addInitScript(({ pending, row }) => {
          sessionStorage.setItem("knb-access-token", "fixture-token");
          if (pending) sessionStorage.setItem("knb-attempt-pending-1", JSON.stringify({ id: row.id, action: "draft", payload: { version: 1, event_id: "22222222-2222-4222-8222-222222222222", question_id: row.current_question?.id, answer: "42" } }));
        }, { pending: state === "pending-answer", row });
        let release!: () => void;
        let releasePending!: () => void;
        const ready = new Promise<void>(resolve => { release = resolve; });
        const pendingReady = new Promise<void>(resolve => { releasePending = resolve; });
        let attemptRequests = 0;
        await page.route("**/api/v1/auth/me", async route => { await ready; return route.fulfill({ json: profile }); });
        await page.route("**/api/v1/auth/refresh", async route => { await ready; return route.fulfill({ status: 401, json: { detail: "Missing token" } }); });
        await page.route("**/api/v1/psychological-tests/attempts**", async route => {
          attemptRequests++;
          if (state === "failure") return route.fulfill({ status: 503, json: { detail: "Unavailable" } });
          if (new URL(route.request().url()).pathname.endsWith("/draft")) await pendingReady;
          return route.fulfill({ json: row });
        });
        try {
          await page.goto(`/${locale}/psychological-testing/primary-selection`);
          const loading = page.getByRole("status");
          await expect(loading).toContainText(locale === "ru" ? "Проверяем вход" : "Кіру тексерілуде");
          await expect(page.getByRole("button", { name: locale === "ru" ? "Начать раздел" : "Бөлімді бастау", exact: true })).toHaveCount(0);
          await waitForPaint(page);
          const initialBounds = await loading.boundingBox();
          release();
          if (state === "pending-answer") {
            await expect(page.getByText(locale === "ru" ? "Проверяем сохраненный прогресс" : "Сақталған прогресс тексерілуде", { exact: true })).toBeVisible();
            await waitForPaint(page);
            expect(await loading.boundingBox()).toEqual(initialBounds);
            releasePending();
          }
          const heading = state === "guest" ? locale === "ru" ? "Для прохождения теста нужен вход" : "Тесттен өту үшін кіру қажет"
            : state === "failure" ? locale === "ru" ? "Не удалось загрузить прогресс" : "Прогресті жүктеу мүмкін болмады"
            : state === "completed" ? locale === "ru" ? "Тестирование завершено" : "Тестілеу аяқталды"
            : primaryPsychologicalSections[0].title;
          await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
          await expect(loading).toHaveCount(0);
          await expectStableLayout(page);
          expect(attemptRequests).toBe(state === "guest" ? 0 : state === "pending-answer" ? 2 : 1);
        } finally { release(); releasePending(); }
      });
    }
  }

  test(`${viewport.width}: service login stays stable while access is checked`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await observeLayout(page);
    await page.addInitScript(() => sessionStorage.setItem("knb-access-token", "fixture-token"));
    let release!: () => void;
    const ready = new Promise<void>(resolve => { release = resolve; });
    await page.route("**/api/v1/auth/me", async route => { await ready; return route.fulfill({ json: profile }); });
    try {
      await page.goto("/admin");
      await expect(page.getByRole("status")).toHaveText("Проверка доступа");
      await expect(page.locator('input[name="password"]')).toHaveCount(0);
      await waitForPaint(page);
      release();
      await expect(page.getByRole("heading", { name: "Вход в админ-панель", exact: true })).toBeVisible();
      await expectStableLayout(page);
      await expect(page.getByRole("status")).toHaveCount(0);
    } finally { release(); }
  });
}
