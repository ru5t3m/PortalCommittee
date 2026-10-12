import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";

type Position = { nodeId: string; lineIndex: number; currentScenario: string | null; startNodeForCurrent: string | null; choicesShown: boolean; timeoutHandled: boolean; choiceDeadline: number | null };
type Snapshot = { skills: Record<string, number>; game_progress: Position; version: number; rules_version: number; server_time: number; available_choices: number[]; last_event_id: string | null; choice_duration_ms: number };
type Rule = { lines: number; scenario: string | null; next: string | null; ending: boolean; timeoutMs: number; effects: Record<string, number>; choices: { next: string; scenario: string | null; disabled: boolean; effects: Record<string, number> }[] };
type Action = { action: string; version: number; node_id: string; choice_index: number | null; event_id: string };
const bank = JSON.parse(readFileSync(resolve(__dirname, "../../api/app/data/specgame-catalog.json"), "utf8")) as { rules: Record<string, Rule> };
const profile = { user: { id: 101, email: "game@example.kz", full_name: "Тестовый Игрок", role: "candidate" }, can_access_admin: false, candidate_application: null };
const defaults = () => ({ trust: 50, tension: 50, intel: 50, analytics: 50, recon: 50, speed: 50, confidence: 50, decision: 50 });

function initial(nodeId = "curator_intro", choices = false): Snapshot {
  const node = bank.rules[nodeId];
  return { skills: defaults(), version: 1, rules_version: 1, server_time: Date.now(), choice_duration_ms: 30000,
    game_progress: { nodeId, lineIndex: choices ? node.lines - 1 : 0, currentScenario: node.scenario, startNodeForCurrent: node.scenario ? "fr_a1_intro" : null,
      choicesShown: choices, timeoutHandled: false, choiceDeadline: choices && node.scenario ? Date.now() + 30000 : null },
    available_choices: choices ? node.choices.flatMap((choice, index) => choice.disabled ? [] : [index]) : [], last_event_id: null };
}

async function setup(page: Page, options: { authenticated?: boolean; seed?: Snapshot } = {}) {
  let state = options.seed || initial();
  const control = { offline: false, unavailable: false, expired: false, loseAcknowledgement: false, delay: 0, actions: [] as Action[], commits: 0, logouts: 0, loads: 0 };
  if (options.authenticated !== false) await page.addInitScript(() => {
    if (!sessionStorage.getItem("game-test-signed-out")) sessionStorage.setItem("knb-access-token", "test-access-token");
  });
  await page.route("**/api/v1/auth/me", route => route.fulfill(control.expired ? { status: 401, json: { detail: "Expired" } } : { json: profile }));
  await page.route("**/api/v1/auth/refresh", route => route.fulfill({ status: 401, json: { detail: "No session" } }));
  await page.route("**/api/v1/auth/password/login", route => route.fulfill({ json: { access_token: "test-token", token_type: "bearer", expires_in: 3600 } }));
  await page.route("**/api/v1/auth/logout", route => { control.logouts++; return route.fulfill({ json: { ok: true } }); });
  await page.route("**/api/v1/games/specgame/progress", route => {
    control.loads++;
    return route.fulfill(control.unavailable ? { status: 503, json: { detail: "Restarting" } } : { json: { ...state, server_time: Date.now() } });
  });
  await page.route("**/api/v1/games/specgame/actions", async route => {
    const body = route.request().postDataJSON() as Action;
    control.actions.push(body);
    if (control.offline) return route.abort();
    if (control.expired) return route.fulfill({ status: 401, json: { detail: "Expired" } });
    if (control.unavailable) return route.fulfill({ status: 503, json: { detail: "Restarting" } });
    if (control.delay) await new Promise(resolve => setTimeout(resolve, control.delay));
    if (body.event_id === state.last_event_id) return route.fulfill({ json: state });
    if (body.version !== state.version || body.node_id !== state.game_progress.nodeId) return route.fulfill({ status: 409, json: { detail: "Conflict" } });
    const node = bank.rules[body.node_id];
    const progress = state.game_progress;
    const enter = (id: string, reset = false) => {
      const next = initial(id);
      state = { ...state, game_progress: next.game_progress, available_choices: [], skills: reset ? defaults() : state.skills };
    };
    if (body.action === "menu") enter("direction_menu", true);
    else if (body.action === "restart") enter(progress.startNodeForCurrent || "curator_intro", true);
    else if (body.action === "choice") {
      const choice = node.choices[body.choice_index ?? -1];
      if (!progress.choicesShown || !choice || choice.disabled) return route.fulfill({ status: 403, json: { detail: "Unavailable" } });
      if (choice.scenario) state.skills = defaults();
      for (const [key, value] of Object.entries(choice.effects)) state.skills[key] = Math.max(0, Math.min(100, state.skills[key] + value));
      enter(choice.next);
    } else if (body.action === "next") {
      if (progress.lineIndex < node.lines - 1) state.game_progress = { ...progress, lineIndex: progress.lineIndex + 1 };
      else if (node.choices.length) {
        state.game_progress = { ...progress, choicesShown: true, choiceDeadline: node.scenario ? Date.now() + 30000 : null };
        state.available_choices = node.choices.flatMap((choice, index) => choice.disabled ? [] : [index]);
      } else if (node.next) enter(node.next);
    }
    state = { ...state, version: state.version + 1, server_time: Date.now(), last_event_id: body.event_id };
    control.commits++;
    if (control.loseAcknowledgement) { control.loseAcknowledgement = false; return route.abort(); }
    return route.fulfill({ json: state });
  });
  return { control, state: () => state, setState: (next: Snapshot) => { state = next; } };
}

for (const locale of ["ru", "kk"]) {
  test(`${locale}: portal authentication returns to the game and preserves registration link`, async ({ page }) => {
    await setup(page, { authenticated: false });
    await page.goto(`/${locale}/game`);
    await page.locator("main").getByRole("link", { name: locale === "ru" ? "Войти" : "Кіру", exact: true }).click();
    await page.getByRole("link", { name: locale === "ru" ? "Зарегистрироваться" : "Тіркелу", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/register\\?next=`));
    await page.getByRole("link", { name: locale === "ru" ? "Уже есть аккаунт? Войти" : "Аккаунтыңыз бар ма? Кіру", exact: true }).click();
    await expect(page.locator('input[name="firstName"]')).toHaveCount(0);
    await page.locator('input[name="email"]').fill("game@example.kz");
    await page.locator('input[name="password"]').fill("PortalTest123!");
    await page.getByRole("button", { name: locale === "ru" ? "Войти" : "Кіру", exact: true }).click();
    await expect(page).toHaveURL(`/${locale}/game`);
    await expect(page.frameLocator("iframe").locator("#auth-overlay")).toBeHidden();
  });
}

test("only Flash Royale is enabled in the existing menu", async ({ page }) => {
  const mock = await setup(page);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/ru/game");
  const game = page.frameLocator("iframe");
  await expect(game.locator("#auth-overlay")).toBeHidden();
  for (let i = 0; i < 6; i++) {
    await game.locator("#next-btn").click();
    await expect.poll(() => mock.state().version).toBe(i + 2);
    if (i < 5) await expect(game.locator("#next-btn")).toBeEnabled();
  }
  await expect(game.locator("#choices button")).toHaveCount(7);
  await expect(game.locator("#choices button:enabled")).toHaveCount(1);
  await expect(game.locator("#choices button:enabled")).toContainText("Флэш-рояль");
  await game.locator("#choices button:enabled").click();
  await expect.poll(() => mock.state().game_progress.nodeId).toBe("fr_a1_intro");
  expect(errors).toEqual([]);
});

test("tampering with browser stats and recovery data cannot award points", async ({ page }) => {
  const mock = await setup(page, { seed: initial("fr_a1_micro_menu", true) });
  await page.addInitScript(() => localStorage.setItem("specgame-progress:portal:" + location.origin + ":101", JSON.stringify({ base_version: 1, skills: { trust: 100 }, game_progress: { nodeId: "fr_end_success" }, updated_at: new Date().toISOString() })));
  await page.goto("/ru/game");
  const game = page.frameLocator("iframe");
  await expect(game.locator("#auth-overlay")).toBeHidden();
  await game.locator("body").evaluate(() => {
    const state = (window as unknown as { GAME_STATE: { stats: Record<string, number> } }).GAME_STATE;
    for (const key of Object.keys(state.stats)) state.stats[key] = 100;
  });
  await game.locator("#choices button").first().click();
  await expect.poll(() => mock.control.commits).toBe(1);
  await expect(game.locator("#stat-recon-value")).toHaveText("60");
  expect(mock.state().skills.trust).toBe(50);
  expect(Object.keys(mock.control.actions[0]).sort()).toEqual(["action", "choice_index", "event_id", "node_id", "version"]);
  await page.reload();
  await expect(game.locator("#auth-overlay")).toBeHidden();
  await expect(game.locator("#stat-recon-value")).toHaveText("60");
});

test("offline choice remains unscored and is retried once after reconnection", async ({ page }) => {
  const mock = await setup(page, { seed: initial("fr_a1_micro_menu", true) });
  await page.goto("/ru/game");
  const game = page.frameLocator("iframe");
  await expect(game.locator("#auth-overlay")).toBeHidden();
  mock.control.offline = true;
  await game.locator("#choices button").first().click();
  await expect(game.locator("#progress-label")).toContainText("не подтверждено");
  await expect(game.locator("#stat-recon-value")).toHaveText("50");
  expect(mock.control.commits).toBe(0);
  await game.locator("#logout-btn").click();
  await expect.poll(() => mock.control.actions.length).toBe(2);
  expect(mock.control.logouts).toBe(0);
  mock.control.offline = false;
  await game.locator("body").evaluate(() => window.dispatchEvent(new Event("online")));
  await expect.poll(() => mock.control.commits).toBe(1);
  await expect(game.locator("#stat-recon-value")).toHaveText("60");
  expect(new Set(mock.control.actions.map(action => action.event_id)).size).toBe(1);
});

test("lost acknowledgement and reload do not repeat the scoring decision", async ({ page }) => {
  const mock = await setup(page, { seed: initial("fr_a1_micro_menu", true) });
  await page.goto("/ru/game");
  const game = page.frameLocator("iframe");
  await expect(game.locator("#auth-overlay")).toBeHidden();
  mock.control.loseAcknowledgement = true;
  await game.locator("#choices button").first().click();
  await expect(game.locator("#progress-label")).toContainText("не подтверждено");
  expect(mock.control.commits).toBe(1);
  await page.reload();
  await expect(game.locator("#auth-overlay")).toBeHidden();
  await expect(game.locator("#stat-recon-value")).toHaveText("60");
  expect(mock.control.commits).toBe(1);
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith("specgame-pending-action:")).length)).toBe(0);
});

test("stale tab reloads server state without overwriting points", async ({ page }) => {
  const mock = await setup(page, { seed: initial("fr_a1_micro_menu", true) });
  await page.goto("/ru/game");
  const game = page.frameLocator("iframe");
  await expect(game.locator("#auth-overlay")).toBeHidden();
  await expect(game.locator("#choices button").first()).toBeVisible();
  const latest = initial("fr_a1_choice_1");
  latest.version = 3;
  latest.skills.recon = 60;
  mock.setState(latest);
  await game.locator("#choices button").first().click();
  await expect(game.locator("#progress-label")).toContainText("Загружено состояние с сервера");
  expect(mock.control.commits).toBe(0);
  await expect(game.locator("#stat-recon-value")).toHaveText("60");
});

test("slow responses lock controls; refreshed token keeps scene; logout uses portal session", async ({ page }) => {
  const mock = await setup(page);
  await page.goto("/ru/game");
  const game = page.frameLocator("iframe");
  await expect(game.locator("#auth-overlay")).toBeHidden();
  mock.control.delay = 700;
  await game.locator("#next-btn").click();
  await expect(game.locator("#next-btn")).toBeDisabled();
  await expect.poll(() => mock.state().game_progress.lineIndex).toBe(1);
  await expect(game.locator("#next-btn")).toBeEnabled();
  await game.locator("body").evaluate(() => { document.body.dataset.instance = "original"; });
  await page.evaluate(() => { sessionStorage.setItem("knb-access-token", "refreshed-token"); window.dispatchEvent(new Event("knb-auth-changed")); });
  await expect(game.locator("body")).toHaveAttribute("data-instance", "original");
  await page.evaluate(() => sessionStorage.setItem("game-test-signed-out", "1"));
  await game.locator("#logout-btn").click();
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(mock.control.logouts).toBe(1);
});

test("mobile game keeps original layout and framing restrictions; outer messages are ignored", async ({ page, request }) => {
  const mock = await setup(page, { seed: initial("direction_menu", true) });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ru/game");
  const game = page.frameLocator("iframe");
  await expect(game.locator("#auth-overlay")).toBeHidden();
  await expect(game.locator("#choices button:enabled")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await request.get("/game/index.html")).headers()["x-frame-options"]).toBe("SAMEORIGIN");
  expect((await request.get("/ru/game")).headers()["x-frame-options"]).toBe("DENY");
  await page.evaluate(() => window.postMessage({ type: "specgame:request", id: "forged", method: "action", payload: {} }, location.origin));
  expect(mock.control.commits).toBe(0);
  await page.evaluate(() => { sessionStorage.removeItem("knb-access-token"); window.dispatchEvent(new Event("knb-auth-changed")); });
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("a stalled background never hides the dialogue or blocks continuing", async ({ page }) => {
  const mock = await setup(page, { seed: initial("fr_a1_intro") });
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/game/assets/flash_royale/bg_office_astana_evening.*", async route => {
    await held;
    await route.abort().catch(() => {});
  });
  try {
    await page.goto("/ru/game");
    const game = page.frameLocator("iframe");
    await expect(game.locator("#dialog-text")).toContainText("Контрразведка начинается");
    await expect(game.locator("#dialog-text")).toHaveCSS("opacity", "1");
    await expect(game.locator("#transition-veil")).toHaveCSS("opacity", "0");
    await game.locator("#next-btn").click();
    await expect.poll(() => mock.state().game_progress.nodeId).toBe("fr_a1_mentor_1");
    await expect(game.locator("#dialog-text")).toContainText("Сегодня шумных событий");
  } finally { release(); }
});

test("an unavailable character does not hide the question or its answers", async ({ page }) => {
  await setup(page, { seed: initial("fr_a1_micro_menu", true) });
  await page.route("**/game/assets/flash_royale/mentor_1.*", route => route.abort());
  await page.goto("/ru/game");
  const game = page.frameLocator("iframe");
  await expect(game.locator("#dialog-text")).toHaveText("Что именно настораживает?");
  await expect(game.locator("#transition-veil")).toHaveCSS("opacity", "0");
  await expect(game.locator("#choices button").first()).toBeEnabled();
  await expect(game.locator("#character-sprite")).not.toHaveAttribute("src");
});

test("returning after sleep refreshes the server deadline and penalty without a choice", async ({ page }) => {
  const mock = await setup(page, { seed: initial("fr_a1_micro_menu", true) });
  await page.goto("/ru/game");
  const game = page.frameLocator("iframe");
  await expect(game.locator("#choice-timer")).toBeVisible();
  const expired = structuredClone(mock.state());
  expired.version++;
  expired.skills.trust = 49;
  expired.skills.tension = 52;
  expired.game_progress.timeoutHandled = true;
  expired.game_progress.choiceDeadline = null;
  mock.setState(expired);
  await game.locator("body").evaluate(() => {
    Date.now = () => 0;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(game.locator("#stat-trust-value")).toHaveText("49");
  await expect(game.locator("#choice-timer")).toBeHidden();
  expect(mock.control.commits).toBe(0);
  await game.locator("body").evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect.poll(() => mock.control.loads).toBeGreaterThanOrEqual(3);
  await expect(game.locator("#stat-trust-value")).toHaveText("49");
});

test("a temporary server outage retries the same action without reloading or double scoring", async ({ page }) => {
  const mock = await setup(page, { seed: initial("fr_a1_micro_menu", true) });
  await page.goto("/ru/game");
  const game = page.frameLocator("iframe");
  await expect(game.locator("#choices button").first()).toBeEnabled();
  mock.control.unavailable = true;
  await game.locator("#choices button").first().click();
  await expect(game.locator("#progress-label")).toContainText("не подтверждено");
  mock.control.unavailable = false;
  await expect.poll(() => mock.control.commits, { timeout: 8000 }).toBe(1);
  await expect(game.locator("#stat-recon-value")).toHaveText("60");
  expect(new Set(mock.control.actions.map(action => action.event_id)).size).toBe(1);
});

test("a delayed refresh cannot swallow a click or replace a newer confirmed score", async ({ page }) => {
  const mock = await setup(page, { seed: initial("fr_a1_micro_menu", true) });
  await page.goto("/ru/game");
  const game = page.frameLocator("iframe");
  await expect(game.locator("#choices button").first()).toBeEnabled();
  const older = structuredClone(mock.state());
  let release!: () => void;
  let requested = false;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/v1/games/specgame/progress", async route => {
    requested = true;
    await held;
    await route.fulfill({ json: older });
  });
  try {
    await game.locator("body").evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect.poll(() => requested).toBe(true);
    await game.locator("#choices button").first().click();
    await expect(game.locator("#stat-recon-value")).toHaveText("60");
    release();
    await expect.poll(() => game.locator("body").evaluate(() => (window as unknown as { Auth: { isBusy(): boolean } }).Auth.isBusy())).toBe(false);
    await expect(game.locator("#stat-recon-value")).toHaveText("60");
    await game.locator("#next-btn").click();
    await expect.poll(() => mock.control.commits).toBe(2);
    expect(mock.control.actions[1].version).toBe(2);
  } finally { release(); }
});

test("an expired session stops the game and retains only the unconfirmed action for that account", async ({ page }) => {
  const mock = await setup(page, { seed: initial("fr_a1_micro_menu", true) });
  await page.goto("/ru/game");
  const game = page.frameLocator("iframe");
  await expect(game.locator("#choices button").first()).toBeEnabled();
  mock.control.expired = true;
  await game.locator("#choices button").first().click();
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.locator("main").getByRole("link", { name: "Войти", exact: true })).toHaveAttribute("href", "/ru/login?next=%2Fru%2Fgame");
  expect(mock.control.commits).toBe(0);
  expect(await page.evaluate(() => sessionStorage.getItem("knb-access-token"))).toBeNull();
  expect(await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith("specgame-pending-action:")).length)).toBe(1);
});

for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }]) {
  test(`touch input and all answers remain reachable at ${viewport.width}x${viewport.height}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    try {
      const mock = await setup(page, { seed: initial("fr_a1_micro_menu", true) });
      await page.goto("/ru/game");
      const game = page.frameLocator("iframe");
      const choices = game.locator("#choices button");
      await expect(choices).toHaveCount(4);
      expect(await game.locator("body").evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const choice of await choices.all()) {
        await choice.scrollIntoViewIfNeeded();
        await expect(choice).toBeInViewport();
      }
      await choices.last().tap();
      await expect.poll(() => mock.control.commits).toBe(1);
      await expect(game.locator("#dialog-text")).not.toHaveText("");
    } finally { await context.close(); }
  });
}
