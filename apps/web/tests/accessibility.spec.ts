import { expect, test } from "@playwright/test";
import { primaryPsychologicalSections } from "../lib/primary-psychological-test";

for (const locale of ["ru", "kk"]) {
  test(`${locale}: document language is correct even without JavaScript`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await context.newPage();
    for (const route of ["", "/login", "/contacts"]) {
      await page.goto(`/${locale}${route}`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("main h1").first()).toBeVisible();
    }
    await context.close();
  });

  test(`${locale}: skip link and registration fields follow keyboard order`, async ({ page }) => {
    await page.goto(`/${locale}/register`);
    await page.keyboard.press("Tab");
    await expect(page.locator(".skip-link")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
    for (const name of ["firstName", "lastName"]) {
      await page.keyboard.press("Tab");
      await expect(page.locator(`input[name="${name}"]`)).toBeFocused();
    }
    await page.locator('input[name="phone"]').focus();
    for (const name of ["email", "password", "personalDataConsent"]) {
      await page.keyboard.press("Tab");
      await expect(page.locator(`input[name="${name}"]`)).toBeFocused();
    }
    await page.locator('main button[type="submit"]').click();
    await expect(page.locator('input[name="firstName"]')).toBeFocused();
    await expect(page.locator('input[name="firstName"]')).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator('input[name="firstName"]')).toHaveCSS("outline-style", "solid");
  });
}

test("accessible mode changes actual text size, survives reload and can be disabled", async ({ page }) => {
  await page.goto("/ru/login");
  const font = () => page.locator('input[name="email"]').evaluate(e => parseFloat(getComputedStyle(e).fontSize));
  const normal = await font();
  const toggle = page.getByRole("button", { name: "Версия для слабовидящих" });
  await toggle.click();
  expect(await font()).toBe(normal * 1.25);
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator('input[name="email"]')).toHaveCSS("color", "rgb(17, 17, 17)");
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  expect(await font()).toBe(normal * 1.25);
  await toggle.click();
  expect(await font()).toBe(normal);
  await expect(page.locator("html")).not.toHaveClass(/visually-enhanced/);
});

test("accessible mode remains usable when localStorage is unavailable", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Blocked", "SecurityError"); } }));
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/ru");
  const toggle = page.getByRole("button", { name: "Версия для слабовидящих" });
  await toggle.click();
  await expect(page.locator("html")).toHaveClass(/visually-enhanced/);
  await toggle.click();
  await expect(page.locator("html")).not.toHaveClass(/visually-enhanced/);
  expect(errors).toEqual([]);
});

test("login announces loading and focuses a server error without clearing input", async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/v1/auth/password/login", async route => { await pending; return route.fulfill({ status: 401, json: { detail: "Неверный email или пароль" } }); });
  await page.goto("/ru/login");
  await page.getByLabel("Email", { exact: true }).fill("candidate@example.test");
  await page.getByLabel("Пароль", { exact: true }).fill("Incorrect123!");
  try {
    await page.getByRole("button", { name: "Войти", exact: true }).click();
    await expect(page.locator("form")).toHaveAttribute("aria-busy", "true");
    await expect(page.getByRole("status")).toContainText("Проверяем данные");
  } finally { release(); }
  await expect(page.locator("#auth-error")).toBeFocused();
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("candidate@example.test");
  await expect(page.locator("form")).toHaveAttribute("aria-busy", "false");
});

test("FAQ opens from the keyboard, announces replies and returns focus on Escape", async ({ page }) => {
  await page.route("**/api/v1/faq-assistant", route => route.fulfill({ json: { answer: "Ответ для проверки", matched_question: null, source: "FAQ", suggestions: [] } }));
  await page.goto("/ru");
  const launcher = page.getByRole("button", { name: "Открыть FAQ-ассистента" });
  await launcher.focus(); await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "FAQ-ассистент" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Напишите вопрос..." })).toBeFocused();
  await page.getByRole("textbox", { name: "Напишите вопрос..." }).fill("Как поступить?");
  await page.getByRole("button", { name: "Отправить", exact: true }).click();
  await expect(page.getByRole("log")).toContainText("Ответ для проверки");
  await page.keyboard.press("Escape");
  await expect(launcher).toBeFocused();
});

test("mobile menu closes on Escape and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ru");
  const menu = page.getByLabel("Меню", { exact: true });
  await menu.focus(); await page.keyboard.press("Enter");
  await page.locator("header details").getByRole("link", { name: "Контакты", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(page.locator("header details")).not.toHaveAttribute("open");
});

test("map offices support Enter and Space; phone links are separate controls", async ({ page }) => {
  await page.route("**/api/v1/contacts/regions", route => route.fulfill({ json: [] }));
  await page.goto("/ru/contacts");
  const map = page.getByRole("region", { name: "Карта подразделений" });
  await expect(map.locator(".leaflet-marker-icon")).toHaveCount(20);
  const almaty = map.getByRole("button", { name: "ДКНБ по г. Алматы", exact: true });
  await almaty.focus(); await page.keyboard.press("Enter");
  await expect(almaty).toHaveAttribute("aria-pressed", "true");
  const astana = map.getByRole("button", { name: "ДКНБ по г. Астана", exact: true });
  await astana.focus(); await page.keyboard.press("Space");
  await expect(astana).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('button a, a button, [tabindex]:not([tabindex="-1"]):not([tabindex="0"])')).toHaveCount(0);
  const office = page.getByRole("button", { name: "ДКНБ по г. Алматы Алматы", exact: true });
  await office.focus(); await page.keyboard.press("Space");
  await expect(office).toHaveAttribute("aria-pressed", "true");
});

test("the test exit dialog keeps keyboard focus inside and Escape returns it", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("knb-access-token", "test-token"));
  await page.route("**/api/v1/auth/me", route => route.fulfill({ json: { can_access_admin: false, user: { id: 1, full_name: "Кандидат", role: "candidate" }, candidate_application: null } }));
  const section = primaryPsychologicalSections[0];
  await page.route("**/api/v1/psychological-tests/attempts**", route => route.fulfill({ json: {
    id: "11111111-1111-4111-8111-111111111111", test_slug: "primary-selection", bank_version: "primary-selection.v1", status: "questions", version: 1,
    sections: primaryPsychologicalSections.map(s => ({ id: s.id, title: s.title, description: s.description, total_questions: s.questions.length, answered_questions: 0 })),
    current_section_index: 0, current_question_index: 0, current_question: section.questions[0], current_answer: null,
    answered_questions: 0, total_questions: 130, server_time: new Date().toISOString(), question_deadline: new Date(Date.now() + 60000).toISOString(), result: null
  } }));
  await page.goto("/ru/psychological-testing/primary-selection");
  const exit = page.getByRole("button", { name: "Сохранить и выйти", exact: true });
  await exit.focus(); await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Сохранить и выйти" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Остаться в тесте" })).toBeFocused();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate(e => e.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(exit).toBeFocused();
});

test("staff login announces progress and focuses rejected credentials", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("knb-access-token", "test-token"));
  await page.route("**/api/v1/auth/me", route => route.fulfill({ json: { can_access_admin: true, user: { id: 1, full_name: "Сотрудник", role: "admin" }, candidate_application: null } }));
  await page.route("**/api/v1/auth/admin/login", route => route.fulfill({ status: 401, json: { detail: "Неверный пароль" } }));
  await page.goto("/admin");
  await page.getByLabel("Email для служебного входа").fill("staff@example.test");
  await page.getByLabel("Пароль для служебного входа").fill("Incorrect123!");
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Неверный пароль" })).toBeFocused();
});

for (const width of [390, 1440]) {
  test(`accessible mode remains within the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/ru/login");
    await page.getByRole("button", { name: "Версия для слабовидящих" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole("button", { name: "Войти", exact: true })).toBeVisible();
    for (const route of ["/ru", "/ru/contacts"]) {
      await page.goto(route);
      await expect(page.locator("html")).toHaveClass(/visually-enhanced/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator("h1").first().evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
    }
  });
}
