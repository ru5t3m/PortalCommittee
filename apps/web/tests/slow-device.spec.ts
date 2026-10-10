import { expect, test, type Page } from "@playwright/test";
import { primaryPsychologicalSections } from "../lib/primary-psychological-test";
import { primaryTestImageSizes } from "../lib/psychological-test-images";
import sharp from "sharp";
import { join } from "node:path";

async function slowDevice(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750, connectionType: "cellular4g" });
  await client.send("Emulation.setCPUThrottlingRate", { rate: 6 });
}

for (const locale of ["ru", "kk"] as const) {
for (const mode of ["login", "register"] as const) {
test(`${locale} ${mode} stays locked while the account page is loading over a slow connection`, async ({ page }) => {
  await slowDevice(page);
  let submissions = 0;
  let navigating = false;
  let release!: () => void;
  const ready = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/v1/auth/refresh", route => route.fulfill({ status: 401, json: { detail: "Missing token" } }));
  await page.route(`**/api/v1/auth/password/${mode}`, route => {
    submissions++;
    return route.fulfill({ json: { access_token: "test-token", token_type: "bearer", expires_in: 3600 } });
  });
  await page.route("**/api/v1/auth/me", route => route.fulfill({ json: { can_access_admin: false, user: { id: 1, email: "candidate@example.kz", full_name: "Тестовый Кандидат", role: "candidate" }, candidate_application: null } }));
  await page.route("**/api/v1/psychological-tests/results/me", route => route.fulfill({ json: [] }));
  await page.route("**/api/v1/candidate/messages?*", route => route.fulfill({ json: { items: [], total: 0, limit: 10, offset: 0 } }));
  await page.route(`**/${locale}/account?*`, async route => { navigating = true; await ready; return route.continue(); });
  try {
    await page.goto(`/${locale}/${mode}`);
    await expect(page.locator('header a[hreflang="ru"]').first()).toBeAttached();
    await page.locator('input[name="email"]').fill("candidate@example.kz");
    await page.locator('input[name="password"]').fill("LocalTest123!");
    if (mode === "register") {
      await page.locator('input[name="firstName"]').fill("Тестовый");
      await page.locator('input[name="lastName"]').fill("Кандидат");
      await page.locator('input[name="birthDate"]').fill("2000-01-01");
      await page.locator('input[name="phone"]').fill("+77000000000");
      await page.getByRole("checkbox").check();
    }
    const submit = page.locator('main form button[type="submit"]');
    await submit.click();
    await expect.poll(() => navigating).toBe(true);
    await expect(submit).toBeDisabled();
    await page.locator("main form").evaluate(form => { if (form instanceof HTMLFormElement) form.requestSubmit(); });
    expect(submissions).toBe(1);
  } finally { release(); }
  await expect(page.getByRole("heading", { name: locale === "ru" ? "Личный кабинет" : "Жеке кабинет", exact: true })).toBeVisible();
  expect(submissions).toBe(1);
});
}
}

test("the contact map starts at the selected office without downloading an unused zoom", async ({ page }) => {
  await slowDevice(page);
  const tileZooms: number[] = [];
  await page.route("**/api/v1/contacts/regions", route => route.fulfill({ json: [] }));
  await page.route("https://*.tile.openstreetmap.org/**", route => {
    tileZooms.push(Number(new URL(route.request().url()).pathname.split("/")[1]));
    return route.fulfill({ contentType: "image/png", body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAlsAAAAASUVORK5CYII=", "base64") });
  });
  await page.goto("/ru/contacts");
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(20);
  await page.waitForLoadState("networkidle");
  expect(tileZooms.length).toBeGreaterThan(0);
  expect(new Set(tileZooms)).toEqual(new Set([6]));
  const officeHeading = page.locator(".leaflet-container").locator("..").locator("h2");
  await expect(officeHeading).toHaveText("ДКНБ по г. Астана");
  await page.getByRole("button", { name: "Пограничная служба", exact: true }).click();
  await expect(officeHeading).toHaveText("ДПС по г. Алматы");
  await page.getByRole("button", { name: "КНБ", exact: true }).click();
  await expect(officeHeading).toHaveText("ДКНБ по г. Астана");
});

test("unopened sections do not compete with the home page and form on a slow connection", async ({ page }) => {
  await slowDevice(page);
  const prefetched: string[] = [];
  page.on("request", request => { const url = new URL(request.url()); if (url.searchParams.has("_rsc")) prefetched.push(url.pathname); });
  for (const route of ["/ru", "/ru/login"]) {
    await page.goto(route);
    await expect(page.locator('header a[hreflang="ru"]').first()).toBeAttached();
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.waitForLoadState("networkidle");
    expect(prefetched).toEqual([]);
  }
});

test("question image dimensions match the actual test assets", async () => {
  for (const question of primaryPsychologicalSections.flatMap(section => section.questions)) {
    if (!question.image) continue;
    const actual = await sharp(join(process.cwd(), "public", question.image)).metadata();
    expect(primaryTestImageSizes[question.image], question.id).toEqual({ width: actual.width, height: actual.height });
  }
});

for (const width of [1440, 390]) {
  for (const image of ["q02.jpeg", "v05.jpeg"]) {
    test(`${width} ${image}: a delayed test image does not move the answer controls`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await slowDevice(page);
      await page.addInitScript(() => sessionStorage.setItem("knb-access-token", "test-token"));
      await page.route("**/api/v1/auth/me", route => route.fulfill({ json: { can_access_admin: false, user: { id: 1, email: "candidate@example.kz", full_name: "Тестовый Кандидат", role: "candidate" }, candidate_application: null } }));
      const sectionIndex = image.startsWith("q") ? 0 : 1;
      const section = primaryPsychologicalSections[sectionIndex];
      const questionIndex = section.questions.findIndex(question => question.image?.endsWith(image));
      await page.route("**/api/v1/psychological-tests/attempts**", route => route.fulfill({ json: {
        id: "11111111-1111-4111-8111-111111111111", test_slug: "primary-selection", bank_version: "primary-selection.v1", status: "questions", version: 1,
        sections: primaryPsychologicalSections.map(section => ({ id: section.id, title: section.title, description: section.description, total_questions: section.questions.length, answered_questions: 0 })),
        current_section_index: sectionIndex, current_question_index: questionIndex, current_question: section.questions[questionIndex], current_answer: null,
        answered_questions: 0, total_questions: 130, server_time: new Date().toISOString(), question_deadline: null, result: null
      } }));
      let release!: () => void;
      const ready = new Promise<void>(resolve => { release = resolve; });
      await page.route(`**/psychological-tests/primary-selection/${image}`, async route => { await ready; return route.continue(); });
      try {
        await page.goto("/ru/psychological-testing/primary-selection", { waitUntil: "domcontentloaded" });
        const next = page.getByRole("button", { name: "Следующий вопрос", exact: true });
        await expect(next).toBeVisible();
        const picture = page.locator(`img[src$="/${image}"]`);
        await expect(picture).toBeVisible();
        expect(await picture.evaluate(img => img instanceof HTMLImageElement && img.complete)).toBe(false);
        const bounds = await next.boundingBox();
        const pictureBounds = await picture.boundingBox();
        release();
        await expect.poll(() => picture.evaluate(img => img instanceof HTMLImageElement ? img.naturalWidth : 0)).toBeGreaterThan(0);
        await picture.evaluate(async img => { if (img instanceof HTMLImageElement) await img.decode(); });
        await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
        expect(await next.boundingBox()).toEqual(bounds);
        expect(await picture.boundingBox()).toEqual(pictureBounds);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      } finally { release(); }
    });
  }
}
