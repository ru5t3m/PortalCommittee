import { expect, test } from "@playwright/test";

const profile = {
  can_access_admin: false,
  user: { id: 1, email: "candidate@example.kz", full_name: "Тестовый Кандидат", role: "candidate", telegram_username: null, phone: null, phone_verified: false },
  candidate_application: { tracking_code: "CAN-TEST-001", status: "received", first_name: "Тестовый", last_name: "Кандидат", middle_name: null, phone: "+77000000000", region: null, education_level: null, desired_direction: null }
};

test("a guest needs only one session check and no anonymous profile request", async ({ page }) => {
  let refreshes = 0;
  let profiles = 0;
  await page.route("**/api/v1/auth/refresh", route => { refreshes++; return route.fulfill({ status: 401, json: { detail: "Missing refresh token" } }); });
  await page.route("**/api/v1/auth/me", route => { profiles++; return route.fulfill({ status: 401, json: { detail: "Not authenticated" } }); });
  await page.goto("/ru");
  await page.waitForLoadState("networkidle");
  expect(refreshes).toBe(1);
  expect(profiles).toBe(0);
});

test("the account shares the profile request and opens while results are pending", async ({ page }) => {
  let profiles = 0;
  let resultsStarted = false;
  let releaseResults!: () => void;
  const resultsReady = new Promise<void>(resolve => { releaseResults = resolve; });
  await page.addInitScript(() => sessionStorage.setItem("knb-access-token", "candidate-token"));
  await page.route("**/api/v1/auth/me", async route => {
    profiles++;
    await new Promise(resolve => setTimeout(resolve, 100));
    return route.fulfill({ json: profile });
  });
  await page.route("**/api/v1/psychological-tests/results/me", async route => {
    resultsStarted = true;
    await resultsReady;
    return route.fulfill({ json: [] });
  });
  await page.route("**/api/v1/candidate/messages?*", route => route.fulfill({ json: { items: [], total: 0, limit: 10, offset: 0 } }));
  try {
    await page.goto("/ru/account");
    await expect.poll(() => resultsStarted).toBe(true);
    await expect(page.getByRole("heading", { name: "Личный кабинет", exact: true })).toBeVisible();
    await expect(page.locator("main").getByRole("status")).toHaveText("Загрузка результатов…");
    expect(profiles).toBe(1);
  } finally { releaseResults(); }
  await expect(page.getByText("Пока нет результатов", { exact: true })).toBeVisible();
});

test("a late profile reply from an old session cannot overwrite a new login", async ({ page }) => {
  let oldStarted = false;
  let releaseOld!: () => void;
  const oldReady = new Promise<void>(resolve => { releaseOld = resolve; });
  await page.addInitScript(() => sessionStorage.setItem("knb-access-token", "old-token"));
  await page.route("**/api/v1/auth/me", async route => {
    if (route.request().headers().authorization === "Bearer old-token") {
      oldStarted = true;
      await oldReady;
      return route.fulfill({ json: { ...profile, user: { ...profile.user, full_name: "Старый пользователь" }, candidate_application: null } });
    }
    return route.fulfill({ json: profile });
  });
  await page.route("**/api/v1/auth/password/login", route => route.fulfill({ json: { access_token: "new-token", token_type: "bearer", expires_in: 3600 } }));
  await page.route("**/api/v1/psychological-tests/results/me", route => route.fulfill({ json: [] }));
  await page.route("**/api/v1/candidate/messages?*", route => route.fulfill({ json: { items: [], total: 0, limit: 10, offset: 0 } }));
  try {
    await page.goto("/ru/login");
    await expect.poll(() => oldStarted).toBe(true);
    await page.locator('input[name="email"]').fill("candidate@example.kz");
    await page.locator('input[name="password"]').fill("PortalTest123!");
    await page.getByRole("button", { name: "Войти", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Личный кабинет", exact: true })).toBeVisible();
  } finally { releaseOld(); }
  await page.waitForLoadState("networkidle");
  await expect(page.locator("header").getByRole("link", { name: "Тестовый Кандидат", exact: true })).toBeVisible();
  await expect(page.locator("header")).not.toContainText("Старый пользователь");
  expect(await page.evaluate(() => sessionStorage.getItem("knb-access-token"))).toBe("new-token");
});

test("a refresh reply arriving after logout cannot restore the session", async ({ page }) => {
  let expire = false;
  let refreshing = false;
  let releaseRefresh!: () => void;
  const refreshReady = new Promise<void>(resolve => { releaseRefresh = resolve; });
  await page.addInitScript(() => sessionStorage.setItem("knb-access-token", "candidate-token"));
  await page.route("**/api/v1/auth/me", route => route.fulfill(expire ? { status: 401, json: { detail: "Expired token" } } : { json: profile }));
  await page.route("**/api/v1/auth/refresh", async route => {
    refreshing = true;
    await refreshReady;
    return route.fulfill({ json: { access_token: "late-token", token_type: "bearer", expires_in: 3600 } });
  });
  await page.route("**/api/v1/auth/logout", route => route.fulfill({ json: { ok: true } }));
  await page.route("**/api/v1/psychological-tests/results/me", route => route.fulfill({ json: [] }));
  await page.route("**/api/v1/candidate/messages?*", route => route.fulfill({ json: { items: [], total: 0, limit: 10, offset: 0 } }));
  try {
    await page.goto("/ru/account");
    await expect(page.getByRole("heading", { name: "Личный кабинет", exact: true })).toBeVisible();
    expire = true;
    await page.evaluate(() => window.dispatchEvent(new Event("storage")));
    await expect.poll(() => refreshing).toBe(true);
    await page.getByRole("button", { name: "Выйти", exact: true }).click();
    await expect(page).toHaveURL(/\/ru\/login$/);
  } finally { releaseRefresh(); }
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => sessionStorage.getItem("knb-access-token"))).toBeNull();
});

test("staff directories load only when their tab is opened", async ({ page }) => {
  const requests: string[] = [];
  await page.addInitScript(() => { sessionStorage.setItem("knb-access-token", "ordinary"); sessionStorage.setItem("knb-admin-access-token", "staff"); });
  await page.route("**/api/v1/auth/me", route => route.fulfill({ json: { ...profile, can_access_admin: true } }));
  await page.route("**/api/v1/admin/**", route => {
    const path = new URL(route.request().url()).pathname;
    requests.push(path);
    if (path.endsWith("/dashboard")) return route.fulfill({ json: { actor: profile.user, users: 0, appeals: 0, candidates: 0, region_offices: 0, candidate_status_counts: {}, permissions: ["contacts:manage", "users:manage"] } });
    return route.fulfill({ json: new URL(route.request().url()).searchParams.has("paginated") ? { items: [], total: 0, limit: 25, offset: 0 } : [] });
  });
  await page.goto("/ru/admin");
  await expect(page.getByRole("heading", { name: "Панель управления", exact: true })).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(requests).not.toContain("/api/v1/admin/contacts/regions");
  expect(requests).not.toContain("/api/v1/admin/candidates");
  expect(requests).not.toContain("/api/v1/admin/users");
  await page.getByRole("button", { name: "Контакты", exact: true }).click();
  await expect.poll(() => requests.filter(path => path.endsWith("/contacts/regions")).length).toBe(1);
  await page.getByLabel("Название RU", { exact: true }).fill("Черновик контакта");
  await page.getByRole("button", { name: "Dashboard", exact: true }).click();
  await expect.poll(() => requests.filter(path => path.endsWith("/candidates")).length).toBe(1);
  await page.getByRole("button", { name: "Контакты", exact: true }).click();
  await expect(page.getByLabel("Название RU", { exact: true })).toHaveValue("Черновик контакта");
  expect(requests.filter(path => path.endsWith("/contacts/regions")).length).toBe(1);
});

test("the home video starts on demand without an initial media download", async ({ page }) => {
  let mediaRequests = 0;
  page.on("request", request => { if (new URL(request.url()).pathname.endsWith("/admission-and-service.mp4")) mediaRequests++; });
  await page.goto("/ru");
  await page.waitForLoadState("networkidle");
  expect(mediaRequests).toBe(0);
  const video = page.locator("video");
  await video.scrollIntoViewIfNeeded();
  await video.evaluate(async element => { if (element instanceof HTMLVideoElement) { element.muted = true; await element.play(); } });
  await expect.poll(() => video.evaluate(element => element instanceof HTMLVideoElement ? element.currentTime : 0)).toBeGreaterThan(0);
  expect(mediaRequests).toBeGreaterThan(0);
});
