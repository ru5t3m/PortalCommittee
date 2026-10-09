import { expect, test, type Page } from "@playwright/test";

const actor = { id: 1, email: "admin@example.kz", full_name: "Главный администратор", role: "admin", telegram_username: null, phone: null, phone_verified: false };
const profile = { user: actor, candidate_application: null, can_access_admin: true };
const pageData = (items: unknown[], limit = 25, offset = 0, total = items.length) => ({ items, total, limit, offset });
const unit = { id: 1, code: "region", name_ru: "Региональное управление", name_kk: "Өңірлік басқарма" };
const employee = { ...actor, id: 2, full_name: "Новый сотрудник", email: "worker@example.kz", role: "candidate", staff_scope: null, organizational_unit_id: null, is_active: true, is_blocked: false };
const appeal = (id: number) => ({ id, tracking_code: `APL-${id}`, full_name: "Кандидат", iin: null, email: "candidate@example.kz", phone: "+77000000000", subject: `Заявка ${id}`, message: "Сообщение с контактными данными", status: "received", created_at: "2026-10-10T10:00:00Z", updated_at: "2026-10-10T10:00:00Z", organizational_unit_id: null, assigned_to_id: null });

async function staffSession(page: Page) {
  await page.addInitScript(() => { sessionStorage.setItem("knb-access-token", "ordinary"); sessionStorage.setItem("knb-admin-access-token", "staff"); });
  await page.route("**/api/v1/auth/me", route => route.fulfill({ json: profile }));
}

test("staff rights and organizational units can be managed from the panel", async ({ page }) => {
  await staffSession(page);
  let access: unknown;
  let savedUnit: unknown;
  await page.route("**/api/v1/admin/**", route => {
    const url = new URL(route.request().url()); const path = url.pathname;
    if (path.endsWith("/dashboard")) return route.fulfill({ json: { actor, users: 2, appeals: 0, candidates: 0, region_offices: 0, candidate_status_counts: {}, permissions: ["users:manage", "units:manage", "cases:assign"] } });
    if (path.endsWith("/users/2/access")) { access = route.request().postDataJSON(); return route.fulfill({ json: { ...employee, ...(access as object) } }); }
    if (path.endsWith("/organizational-units") && route.request().method() === "POST") { savedUnit = route.request().postDataJSON(); return route.fulfill({ status: 201, json: { id: 2, ...(savedUnit as object) } }); }
    if (path.endsWith("/organizational-units")) return route.fulfill({ json: [unit] });
    if (path.endsWith("/users")) return route.fulfill({ json: pageData([employee]) });
    return route.fulfill({ json: url.searchParams.has("paginated") ? pageData([]) : [] });
  });
  await page.goto("/ru/admin");
  await page.getByRole("button", { name: "Сотрудники и подразделения", exact: true }).click();
  await page.getByRole("combobox", { name: "Роль", exact: true }).selectOption("moderator");
  await page.getByRole("combobox", { name: "Область доступа", exact: true }).selectOption("territorial");
  await page.getByRole("combobox", { name: "Подразделение сотрудника", exact: true }).selectOption("1");
  await page.getByRole("button", { name: "Сохранить права", exact: true }).click();
  await expect.poll(() => access).toEqual({ role: "moderator", staff_scope: "territorial", organizational_unit_id: 1, is_active: true, is_blocked: false });
  await page.getByLabel("Код подразделения", { exact: true }).fill("new-region");
  await page.getByLabel("Название на русском", { exact: true }).fill("Новое управление");
  await page.getByLabel("Название на казахском", { exact: true }).fill("Жаңа басқарма");
  await page.getByRole("button", { name: "Сохранить подразделение", exact: true }).click();
  await expect.poll(() => savedUnit).toEqual({ code: "new-region", name_ru: "Новое управление", name_kk: "Жаңа басқарма" });
});

test("case pagination, assignment, messages and history work from the panel", async ({ page }) => {
  await staffSession(page);
  const cases = Array.from({ length: 27 }, (_, index) => appeal(index + 1));
  const comments: Array<{ id: number; author_name: string; text: string; visibility: string; created_at: string }> = [];
  let assignment: unknown;
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  await page.route("**/api/v1/admin/**", route => {
    const url = new URL(route.request().url()); const path = url.pathname;
    if (path.endsWith("/dashboard")) return route.fulfill({ json: { actor, users: 2, appeals: 27, candidates: 0, region_offices: 0, candidate_status_counts: {}, permissions: ["cases:assign", "users:manage"] } });
    if (path.endsWith("/organizational-units")) return route.fulfill({ json: [unit] });
    if (path.endsWith("/assignees")) return route.fulfill({ json: pageData([{ id: 2, full_name: "Сотрудник региона", staff_scope: "territorial", organizational_unit_id: 1 }]) });
    if (path.endsWith("/assignment")) { assignment = route.request().postDataJSON(); Object.assign(cases[0], assignment); return route.fulfill({ json: cases[0] }); }
    if (path.endsWith("/status")) { Object.assign(cases[0], route.request().postDataJSON()); return route.fulfill({ json: cases[0] }); }
    if (path.endsWith("/comments")) {
      if (route.request().method() === "POST") { const comment = { id: comments.length + 1, author_name: actor.full_name, created_at: "2026-10-10T11:00:00Z", ...route.request().postDataJSON() }; comments.unshift(comment); return route.fulfill({ status: 201, json: comment }); }
      return route.fulfill({ json: pageData(comments, 10) });
    }
    if (path.endsWith("/history")) return route.fulfill({ json: pageData([{ id: 1, actor_name: actor.full_name, created_at: "2026-10-10T11:00:00Z", action: "update_status", details: { status: { before: "received", after: "in_review" } } }], 10) });
    if (path.endsWith("/appeals")) {
      const offset = Number(url.searchParams.get("offset") ?? 0); const q = url.searchParams.get("q"); const filtered = q ? cases.filter(item => item.subject.includes(q)) : cases;
      return route.fulfill({ json: url.searchParams.has("paginated") ? pageData(filtered.slice(offset, offset + 25), 25, offset, filtered.length) : filtered });
    }
    return route.fulfill({ json: url.searchParams.has("paginated") ? pageData([]) : [] });
  });
  await page.goto("/ru/admin");
  await expect(page.getByRole("heading", { name: "Заявка 1", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Далее", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Заявка 26", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Назад", exact: true }).first().click();
  await page.getByRole("combobox", { name: "Подразделение", exact: true }).selectOption("1");
  await page.getByRole("combobox", { name: "Ответственный", exact: true }).selectOption("2");
  await page.getByRole("button", { name: "Сохранить назначение", exact: true }).click();
  await expect.poll(() => assignment).toEqual({ organizational_unit_id: 1, assigned_to_id: 2 });
  await page.getByRole("textbox", { name: "Новый комментарий", exact: true }).fill("Черновик при обновлении статуса");
  await page.getByRole("combobox", { name: "Статус", exact: true }).selectOption("in_review");
  const refreshed = page.waitForResponse(response => response.url().includes("/admin/appeals?") && response.request().method() === "GET");
  await page.getByRole("button", { name: "Сохранить статус", exact: true }).click();
  await refreshed;
  await expect(page.getByRole("textbox", { name: "Новый комментарий", exact: true })).toHaveValue("Черновик при обновлении статуса");
  await expect(page.getByRole("combobox", { name: "Статус", exact: true })).toHaveValue("in_review");
  await page.getByRole("textbox", { name: "Новый комментарий", exact: true }).fill("Закрытая служебная заметка");
  await page.getByRole("button", { name: "Добавить комментарий", exact: true }).click();
  await expect(page.getByText("Закрытая служебная заметка", { exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Новый комментарий", exact: true }).fill("Пожалуйста, дополните анкету");
  await page.getByRole("combobox", { name: "Кому видно", exact: true }).selectOption("candidate");
  await page.getByRole("button", { name: "Добавить комментарий", exact: true }).click();
  await expect(page.getByText("Пожалуйста, дополните анкету", { exact: true })).toBeVisible();
  await expect(page.getByText("Изменён статус", { exact: true })).toBeVisible();
  await page.getByLabel("Поиск заявок", { exact: true }).fill("Заявка 27");
  await page.getByRole("button", { name: "Найти", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Заявка 27", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

for (const locale of ["ru", "kk"]) {
  test(`${locale}: anonymous status tracking handles a valid and unknown code`, async ({ page }) => {
    await page.route("**/api/v1/appeals/APL-*", route => route.request().url().endsWith("APL-KNOWN") ? route.fulfill({ json: { tracking_code: "APL-KNOWN", status: "in_review" } }) : route.fulfill({ status: 404, json: { detail: "Appeal not found" } }));
    await page.goto(`/${locale}/appeals`);
    const input = page.getByLabel(locale === "ru" ? "Код заявки" : "Өтінім коды", { exact: true });
    await input.fill(" apl-known ");
    await page.getByRole("button", { name: locale === "ru" ? "Проверить статус" : "Мәртебені тексеру", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(locale === "ru" ? "На рассмотрении" : "Қаралуда");
    await input.fill("APL-UNKNOWN");
    await page.getByRole("button", { name: locale === "ru" ? "Проверить статус" : "Мәртебені тексеру", exact: true }).click();
    await expect(page.getByRole("alert").filter({ hasText: locale === "ru" ? "Заявка не найдена" : "Өтінім табылмады" })).toContainText(locale === "ru" ? "Заявка не найдена" : "Өтінім табылмады");
    await expect(page.getByRole("status")).toHaveCount(0);
  });
}
