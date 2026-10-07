import { expect, test } from "@playwright/test";

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

test("login preserves the existing presentation session", async ({ page }) => {
  await page.goto("/ru/login");
  await page.getByRole("button", { name: "Email", exact: true }).click();
  await page.locator('input[name="email"]').fill("candidate@example.kz");
  await page.locator('input[name="password"]').fill("PortalTest123!");
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page).toHaveURL(/\/ru\/account$/);
  await expect(page.getByText("Код заявки: DEMO-2026-001", { exact: true })).toBeVisible();
});

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

test("psychological test moves from instructions to answering", async ({ page }) => {
  await page.goto("/ru/psychological-testing/primary-selection");
  await page.getByRole("button", { name: "Начать раздел", exact: true }).click();
  await expect(page.locator("fieldset legend")).toContainText("Вопрос 1");
  const nextQuestion = page.getByRole("button", { name: "Следующий вопрос", exact: true });
  await expect(nextQuestion).toBeDisabled();
  await page.locator("fieldset input").fill("Проверочный ответ");
  await expect(nextQuestion).toBeEnabled();
  await nextQuestion.click();
  await expect(page.locator("fieldset legend")).toContainText("Вопрос 2");
});

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
