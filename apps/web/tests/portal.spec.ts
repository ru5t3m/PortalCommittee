import { expect, test, type Page } from "@playwright/test";
import { primaryPsychologicalSections } from "../lib/primary-psychological-test";
import type { TestAttempt } from "../lib/psychological-tests";

const authenticatedProfile = {
  can_access_admin: false,
  user: { id: 1, email: "candidate@example.kz", full_name: "Тестовый Кандидат", role: "candidate", telegram_username: null, phone: null, phone_verified: false },
  candidate_application: { tracking_code: "CAN-TEST-001", status: "received", first_name: "Тестовый", last_name: "Кандидат", middle_name: null, phone: "+77000000000", region: null, education_level: null, desired_direction: null }
};

async function authenticate(page: Page) {
  await page.addInitScript(() => window.sessionStorage.setItem("knb-access-token", "test-access-token"));
  await page.route("**/api/v1/auth/me", (route) => route.fulfill({ json: authenticatedProfile }));
  await page.route("**/api/v1/psychological-tests/results/me", (route) => route.fulfill({ json: [] }));
  await page.route("**/api/v1/candidate/messages?*", (route) => route.fulfill({ json: { items: [], total: 0, limit: 10, offset: 0 } }));
  await page.route("**/api/v1/psychological-tests/progress/primary-selection", (route) => route.fulfill({ status: 404, json: { detail: "Psychological test progress not found" } }));
}

for (const locale of ["ru", "kk"]) {
  test(`${locale}: public pages, images and client errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const path of ["", "/about", "/education", "/activities", "/careers/admission", "/documents", "/psychological-testing"]) {
      const response = await page.goto(`/${locale}${path}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("main h1").first()).toBeVisible();
      await page.locator("footer").scrollIntoViewIfNeeded();
      await expect.poll(() => page.locator("img").evaluateAll((images) => images.filter((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth === 0).map((image) => image.getAttribute("src")))).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}

test("FAQ loads on demand and keeps the conversation after closing", async ({ page }) => {
  await page.route("**/api/v1/faq-assistant", (route) => route.fulfill({
    json: { answer: "Проверочный ответ FAQ", matched_question: "Как поступить?", source: "FAQ", section: "Служба", confidence: 1, llm_used: false, suggestions: [] }
  }));
  await page.goto("/ru");
  await expect(page.getByRole("region", { name: "FAQ-ассистент", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Открыть FAQ-ассистента" }).click();
  await page.getByLabel("Напишите вопрос...").fill("Как поступить?");
  await page.getByRole("button", { name: "Отправить", exact: true }).click();
  await expect(page.getByText("Проверочный ответ FAQ", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Закрыть FAQ-ассистента" }).click();
  await page.getByRole("button", { name: "Открыть FAQ-ассистента" }).click();
  await expect(page.getByText("Проверочный ответ FAQ", { exact: true })).toBeVisible();
});

test("contacts map and styles load only on the contacts page", async ({ page }) => {
  await page.route("**/api/v1/contacts/regions", (route) => route.fulfill({ json: [] }));
  await page.goto("/ru");
  expect(await page.evaluate(() => [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules].map((rule) => rule.cssText)).some((rule) => rule.includes(".leaflet-container")))).toBe(false);
  await page.goto("/ru/contacts");
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(page.locator(".leaflet-marker-icon").first()).toBeVisible();
  const officeHeading = page.locator(".leaflet-container").locator("..").locator("h2");
  const previousOffice = await officeHeading.textContent();
  await page.locator(".leaflet-marker-icon").nth(1).click();
  await expect(officeHeading).not.toHaveText(previousOffice || "");
});

test("mobile menu, FAQ and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ru");
  await page.getByLabel("Open menu").click();
  await page.locator("header details").getByRole("link", { name: "Контакты", exact: true }).click();
  await expect(page).toHaveURL(/\/ru\/contacts$/);
  await page.getByRole("button", { name: "Открыть FAQ-ассистента" }).click();
  await expect(page.getByLabel("Напишите вопрос...")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

for (const locale of ["ru", "kk"]) {
  for (const mode of ["login", "register"]) {
    test(`${locale}: ${mode} offers email and password only`, async ({ page }) => {
      const unsupportedRequests: string[] = [];
      page.on("request", (request) => {
        if (/\/auth\/(eds|telegram)\//.test(request.url())) unsupportedRequests.push(request.url());
      });
      await page.goto(`/${locale}/${mode}`);
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      if (mode === "login") await expect(page.getByRole("checkbox")).toHaveCount(0);
      await expect(page.locator("main")).not.toContainText(/ЭЦП|ЭЦҚ|NCALayer|Telegram/i);
      await expect(page.getByRole("button", { name: /ЭЦП|ЭЦҚ|Telegram/i })).toHaveCount(0);
      expect(unsupportedRequests).toEqual([]);
    });
  }
}

for (const locale of ["ru", "kk"]) {
test(`${locale}: registration requires consent and sends candidate data`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/v1/candidate/messages?*", (route) => route.fulfill({ json: { items: [], total: 0, limit: 10, offset: 0 } }));
  let registration: unknown;
  await page.route("**/api/v1/auth/password/register", (route) => {
    registration = route.request().postDataJSON();
    return route.fulfill({ status: 201, json: { access_token: "test-access-token", token_type: "bearer", expires_in: 3600 } });
  });
  await page.route("**/api/v1/auth/me", (route) => route.fulfill({ json: authenticatedProfile }));
  await page.route("**/api/v1/psychological-tests/results/me", (route) => route.fulfill({ json: [] }));
  await page.goto(`/${locale}/register`);
  const consent = page.getByRole("checkbox", { name: locale === "ru" ? /Я даю согласие/ : /келісім беремін/ });
  await expect(consent).not.toBeChecked();
  await expect(consent).toHaveAttribute("required", "");
  const law = page.getByRole("link", { name: locale === "ru" ? /О персональных данных и их защите/ : /Дербес деректер және оларды қорғау туралы/ });
  await expect(law).toHaveAttribute("href", `https://adilet.zan.kz/${locale === "kk" ? "kaz" : "rus"}/docs/Z1300000094`);
  await expect(law).toHaveAttribute("target", "_blank");
  await expect(law).toHaveAttribute("rel", "noopener noreferrer");
  await page.locator('input[name="firstName"]').fill("Тестовый");
  await page.locator('input[name="lastName"]').fill("Кандидат");
  await page.locator('input[name="birthDate"]').fill("2000-01-01");
  await page.locator('input[name="phone"]').fill("+77000000000");
  await page.locator('input[name="email"]').fill("candidate@example.kz");
  await page.locator('input[name="password"]').fill("PortalTest123!");
  const submit = page.getByRole("button", { name: locale === "ru" ? "Создать аккаунт" : "Аккаунт жасау", exact: true });
  await submit.click();
  expect(registration).toBeUndefined();
  await expect(page).toHaveURL(new RegExp(`/${locale}/register$`));
  expect(await consent.evaluate((input) => input.matches(":invalid"))).toBe(true);
  await page.locator("main form").evaluate((form) => form.setAttribute("novalidate", ""));
  await submit.click();
  await expect(page.locator("main").getByRole("alert")).toContainText(locale === "ru" ? "необходимо дать согласие" : "келісім беру қажет");
  expect(registration).toBeUndefined();
  await consent.check();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await submit.click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/account$`));
  expect(registration).toEqual({ email: "candidate@example.kz", password: "PortalTest123!", first_name: "Тестовый",
    last_name: "Кандидат", birth_date: "2000-01-01", phone: "+77000000000", personal_data_consent: true, consent_locale: locale });
});
}

test("login sends credentials to the API and displays the real profile", async ({ page }) => {
  let credentials: unknown;
  await page.route("**/api/v1/auth/password/login", (route) => {
    credentials = route.request().postDataJSON();
    return route.fulfill({ json: { access_token: "test-access-token", token_type: "bearer", expires_in: 3600 } });
  });
  await page.route("**/api/v1/auth/me", (route) => route.fulfill({ json: authenticatedProfile }));
  await page.route("**/api/v1/psychological-tests/results/me", (route) => route.fulfill({ json: [] }));
  await page.goto("/ru/login");
  await page.locator('input[name="email"]').fill("candidate@example.kz");
  await page.locator('input[name="password"]').fill("PortalTest123!");
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page).toHaveURL(/\/ru\/account$/);
  await expect(page.getByText("Код заявки: CAN-TEST-001", { exact: true })).toBeVisible();
  expect(credentials).toEqual({ email: "candidate@example.kz", password: "PortalTest123!" });
});

test("invalid credentials do not create a session", async ({ page }) => {
  await page.route("**/api/v1/auth/password/login", (route) => route.fulfill({ status: 401, json: { detail: "Invalid credentials" } }));
  await page.goto("/ru/login");
  await page.locator('input[name="email"]').fill("candidate@example.kz");
  await page.locator('input[name="password"]').fill("WrongPassword123!");
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page.getByText("Invalid credentials", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/ru\/login$/);
  expect(await page.evaluate(() => sessionStorage.getItem("knb-access-token"))).toBeNull();
});

test("a results service failure does not log the candidate out", async ({ page }) => {
  await authenticate(page);
  await page.route("**/api/v1/psychological-tests/results/me", (route) => route.fulfill({ status: 503, json: { detail: "Unavailable" } }));
  await page.goto("/ru/account");
  await expect(page.getByRole("heading", { name: "Личный кабинет", exact: true })).toBeVisible();
  await expect(page.getByText("Не удалось загрузить результаты. Обновите страницу, чтобы повторить попытку.")).toBeVisible();
});

test("logout clears local tokens even when the server is unavailable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await authenticate(page);
  await page.route("**/api/v1/auth/logout", (route) => route.fulfill({ status: 503, json: { detail: "Unavailable" } }));
  await page.goto("/ru/account");
  await page.getByRole("button", { name: "Выйти", exact: true }).click();
  await expect(page).toHaveURL(/\/ru\/login$/);
  expect(await page.evaluate(() => sessionStorage.getItem("knb-access-token"))).toBeNull();
  expect(errors).toEqual([]);
});

test("an expired session is cleared when refresh is rejected", async ({ page }) => {
  await authenticate(page);
  await page.route("**/api/v1/auth/me", (route) => route.fulfill({ status: 401, json: { detail: "Expired token" } }));
  await page.route("**/api/v1/auth/refresh", (route) => route.fulfill({ status: 401, json: { detail: "Expired session" } }));
  await page.goto("/ru/account");
  await expect(page).toHaveURL(/\/ru\/login$/);
  expect(await page.evaluate(() => sessionStorage.getItem("knb-access-token"))).toBeNull();
});

test("an expired admin session returns to the admin login", async ({ page }) => {
  await authenticate(page);
  await page.addInitScript(() => sessionStorage.setItem("knb-admin-access-token", "expired-admin-token"));
  await page.route("**/api/v1/auth/me", (route) => route.fulfill({ json: { ...authenticatedProfile, can_access_admin: true } }));
  await page.route("**/api/v1/admin/**", (route) => route.fulfill({ status: 401, json: { detail: "Expired admin session" } }));
  await page.goto("/ru/admin");
  await expect(page.getByRole("heading", { name: "Вход в админ-панель", exact: true })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem("knb-admin-access-token"))).toBeNull();
});

for (const managesContacts of [false, true]) {
  test(`staff panel contact management permission: ${managesContacts}`, async ({ page }) => {
    await authenticate(page);
    await page.addInitScript(() => sessionStorage.setItem("knb-admin-access-token", "staff-token"));
    await page.route("**/api/v1/auth/me", (route) => route.fulfill({ json: { ...authenticatedProfile, can_access_admin: true } }));
    await page.route("**/api/v1/admin/**", (route) => {
      if (new URL(route.request().url()).pathname.endsWith("/dashboard")) {
        return route.fulfill({ json: { actor: authenticatedProfile.user, users: 0, appeals: 0, candidates: 0, region_offices: 0, permissions: managesContacts ? ["contacts:manage"] : ["cases:read"] } });
      }
      return route.fulfill({ json: new URL(route.request().url()).searchParams.has("paginated") ? { items: [], total: 0, limit: 25, offset: 0 } : [] });
    });
    await page.goto("/ru/admin");
    await expect(page.getByRole("heading", { name: "Панель управления", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Контакты", exact: true })).toHaveCount(managesContacts ? 1 : 0);
  });
}

test("admission links keep the requested stage on a static page", async ({ page }) => {
  await page.goto("/ru/careers/admission?stage=3");
  await expect(page.getByRole("button", { name: /Собеседование/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Заявление Первичное обращение/ }).click();
  await expect(page.getByRole("button", { name: /Заявление Первичное обращение/ })).toHaveAttribute("aria-pressed", "true");
});

test("accessibility preference survives page navigation", async ({ page }) => {
  await page.goto("/ru");
  await page.getByRole("button", { name: "Accessibility mode" }).click();
  await expect(page.locator("body")).toHaveClass(/visually-enhanced/);
  await page.goto("/ru/about");
  await expect(page.getByRole("button", { name: "Accessibility mode" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("body")).toHaveClass(/visually-enhanced/);
});

test("FAQ gives a recoverable error when the service is unavailable", async ({ page }) => {
  await page.route("**/api/v1/faq-assistant", (route) => route.fulfill({ status: 503, json: { detail: "Local FAQ LLM is required but unavailable" } }));
  await page.goto("/ru");
  await page.getByRole("button", { name: "Открыть FAQ-ассистента" }).click();
  await page.getByLabel("Напишите вопрос...").fill("Как поступить?");
  await page.getByRole("button", { name: "Отправить", exact: true }).click();
  await expect(page.getByText("Не удалось получить ответ. Попробуйте еще раз.", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Напишите вопрос...")).toBeEnabled();
});


async function mockAttempt(page: Page, sectionIndex = 0) {
  const sections = primaryPsychologicalSections.map(section => ({
    id: section.id, title: section.title, description: section.description,
    total_questions: section.questions.length, answered_questions: 0
  }));
  let row: TestAttempt = {
    id: "11111111-1111-4111-8111-111111111111", test_slug: "primary-selection", bank_version: "primary-selection.v1",
    status: "instructions", version: 1, sections, current_section_index: sectionIndex, current_question_index: 0,
    current_question: null, current_answer: null, answered_questions: 0, total_questions: 130,
    server_time: new Date().toISOString(), question_deadline: null, result: null
  };
  const answers: Record<string, string | string[]> = {};
  const events = new Map<string, TestAttempt>();
  const controls = { failFinish: false, loseAnswerResponse: false, unavailable: false, finishRequests: 0, answeredRequests: 0 };
  const snapshot = () => ({ ...row, server_time: new Date().toISOString() });
  await page.route("**/api/v1/psychological-tests/attempts**", async route => {
    const path = new URL(route.request().url()).pathname;
    const action = path.split("/").at(-1);
    if (controls.unavailable) return route.abort("connectionfailed");
    if (route.request().method() === "GET" || action === "attempts") return route.fulfill({ json: snapshot() });
    const payload = route.request().postDataJSON();
    if (action === "finish") {
      controls.finishRequests++;
      if (controls.failFinish) return route.fulfill({ status: 503, json: { detail: "Unavailable" } });
    }
    if (events.has(payload.event_id)) return route.fulfill({ json: { ...events.get(payload.event_id), server_time: new Date().toISOString() } });
    const item = primaryPsychologicalSections[row.current_section_index];
    row = { ...row, version: row.version + 1 };
    if (action === "begin-section") row.status = "questions";
    if (action === "continue") {
      row.current_section_index++;
      row.current_question_index = 0;
      row.status = "instructions";
    }
    if (["answer", "draft", "close-section"].includes(action ?? "")) {
      answers[payload.question_id] = payload.answer;
      if (action === "answer") {
        controls.answeredRequests++;
        if (row.current_question_index + 1 < item.questions.length) row.current_question_index++;
        else row.status = row.current_section_index === 2 ? "ready" : "sectionComplete";
      }
      if (action === "close-section") row.status = row.current_section_index === 2 ? "ready" : "sectionComplete";
    }
    row.sections = row.sections.map(section => ({
      ...section, answered_questions: primaryPsychologicalSections.find(item => item.id === section.id)!.questions.filter(q => {
        const value = answers[q.id]; return Array.isArray(value) ? value.length > 0 : Boolean(value?.trim());
      }).length
    }));
    row.answered_questions = row.sections.reduce((sum, section) => sum + section.answered_questions, 0);
    if (action === "finish") {
      row.status = "completed";
      row.result = { id: 1, test_slug: row.test_slug, test_title: "Первичный психологический тест",
        total_questions: 130, answered_questions: row.answered_questions, duration_seconds: 7800, remaining_seconds: 7700,
        sections: row.sections.map(section => ({ ...section, scored_questions: section.id === "verbal" ? 0 : 50, correct_answers: 0, score_percent: 0 })),
        submitted_at: new Date().toISOString()
      };
    }
    const q = primaryPsychologicalSections[row.current_section_index].questions[row.current_question_index];
    row.current_question = row.status === "questions" ? q : null;
    row.current_answer = row.status === "questions" ? answers[q.id] ?? null : null;
    if (action !== "draft") row.question_deadline = row.status === "questions" ? new Date(Date.now() + 60000).toISOString() : null;
    row.server_time = new Date().toISOString();
    events.set(payload.event_id, structuredClone(row));
    if (action === "answer" && controls.loseAnswerResponse) {
      controls.loseAnswerResponse = false;
      return route.abort("connectionfailed");
    }
    return route.fulfill({ json: snapshot() });
  });
  return controls;
}

test("psychological test moves from instructions to answering", async ({ page }) => {
  await authenticate(page);
  await mockAttempt(page);
  await page.goto("/ru/psychological-testing/primary-selection");
  await page.getByRole("button", { name: "Начать раздел", exact: true }).click();
  await expect(page.locator("fieldset legend")).toContainText("Вопрос 1");
  const next = page.getByRole("button", { name: "Следующий вопрос", exact: true });
  await expect(next).toBeDisabled();
  await page.locator("fieldset input").fill("Проверочный ответ");
  await next.click();
  await expect(page.locator("fieldset legend")).toContainText("Вопрос 2");
});

test("a failed attempt load blocks the test and can be retried", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await authenticate(page);
  const controls = await mockAttempt(page);
  controls.unavailable = true;
  await page.goto("/ru/psychological-testing/primary-selection");
  await expect(page.getByRole("button", { name: "Начать раздел", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Не удалось загрузить прогресс", exact: true })).toBeVisible();
  controls.unavailable = false;
  await page.getByRole("button", { name: "Повторить", exact: true }).click();
  await expect(page.getByRole("button", { name: "Начать раздел", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("a saved draft survives reload without restarting the question timer", async ({ page }) => {
  await authenticate(page);
  await mockAttempt(page);
  await page.goto("/ru/psychological-testing/primary-selection");
  await page.getByRole("button", { name: "Начать раздел", exact: true }).click();
  await page.getByRole("textbox").fill("48");
  await page.waitForResponse(response => response.url().endsWith("/draft") && response.status() === 200);
  await page.waitForTimeout(1100);
  await page.reload();
  await expect(page.getByRole("textbox")).toHaveValue("48");
  await expect(page.locator("fieldset legend")).toContainText("Вопрос 1");
  await expect(page.getByText("01:00", { exact: true })).toHaveCount(0);
});

test("a lost answer acknowledgement can be retried without advancing twice", async ({ page }) => {
  await authenticate(page);
  const controls = await mockAttempt(page);
  await page.goto("/ru/psychological-testing/primary-selection");
  await page.getByRole("button", { name: "Начать раздел", exact: true }).click();
  controls.loseAnswerResponse = true;
  await page.getByRole("textbox").fill("48");
  await page.getByRole("button", { name: "Следующий вопрос", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Не удалось" })).toBeVisible();
  await expect(page.getByRole("textbox")).toHaveValue("48");
  await page.getByRole("button", { name: "Повторить", exact: true }).click();
  await expect(page.locator("fieldset legend")).toContainText("Вопрос 2");
  expect(controls.answeredRequests).toBe(1);
});

test("an offline draft stays in the tab and is sent after reconnection", async ({ page }) => {
  await authenticate(page);
  const controls = await mockAttempt(page);
  await page.goto("/ru/psychological-testing/primary-selection");
  await page.getByRole("button", { name: "Начать раздел", exact: true }).click();
  controls.unavailable = true;
  await page.getByRole("textbox").fill("48");
  await expect(page.getByRole("alert").filter({ hasText: "Не удалось" })).toBeVisible();
  controls.unavailable = false;
  await page.getByRole("button", { name: "Повторить", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Не удалось" })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("textbox")).toHaveValue("48");
});

for (const fails of [false, true]) {
  test("finished test uses the server result and supports retry (" + fails + ")", async ({ page }) => {
    await authenticate(page);
    const controls = await mockAttempt(page, 2);
    controls.failFinish = fails;
    await page.goto("/ru/psychological-testing/primary-selection");
    await page.getByRole("button", { name: "Начать раздел", exact: true }).click();
    for (let i = 0; i < 30; i++) {
      await expect(page.locator("fieldset legend")).toContainText("Вопрос " + (i + 1) + " из");
      await page.getByRole("textbox").fill("Проверочный ответ");
      await page.getByRole("button", { name: i === 29 ? "Завершить тестирование" : "Следующий вопрос", exact: true }).click();
    }
    await expect(page.getByRole("heading", { name: "Тестирование завершено", exact: true })).toBeVisible();
    if (fails) {
      await expect(page.getByRole("alert").filter({ hasText: "Не удалось" })).toBeVisible();
      controls.failFinish = false;
      await page.getByRole("button", { name: "Повторить", exact: true }).click();
    }
    await expect(page.getByText("Результат сохранен", { exact: true })).toBeVisible();
    expect(controls.finishRequests).toBe(fails ? 2 : 1);
  });
}

test("private pages are not cached and unknown routes return 404", async ({ request }) => {
  for (const path of ["/ru/login", "/ru/account", "/ru/admin", "/ru/appeals"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["x-nextjs-cache"]).toBeUndefined();
  }
  expect((await request.get("/xx/about")).status()).toBe(404);
  expect((await request.get("/ru/activities/unknown-activity")).status()).toBe(404);
});

test("navigation preloads a page when the visitor points to its link", async ({ page }) => {
  const prefetched: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.searchParams.has("_rsc")) prefetched.push(url.pathname);
  });
  await page.setViewportSize({ width: 1365, height: 768 });
  await page.goto("/ru");
  await expect(page.locator("header")).toBeVisible();
  expect(prefetched).not.toContain("/ru/about");
  const aboutLink = page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "О КНБ РК", exact: true });
  await aboutLink.hover();
  await expect.poll(() => prefetched).toContain("/ru/about");
  await aboutLink.click();
  await expect(page).toHaveURL(/\/ru\/about$/);
  await expect(page.locator("main h1")).toBeVisible();
});
