import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const baseURL = process.env.WEB_URL || "http://localhost:3000";
const output = process.argv[2] || ".verification/pages.json";
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || undefined });
const results = [];

try {
  for (const route of ["/ru", "/kk", "/ru/about", "/ru/contacts"]) {
    const samples = [];
    for (let run = 0; run < 3; run++) {
      const context = await browser.newContext({ viewport: { width: 1365, height: 768 } });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.__lcp = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) window.__lcp = entry.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
      });
      const response = await page.goto(`${baseURL}${route}`, { waitUntil: "load" });
      await page.waitForLoadState("networkidle", { timeout: 6000 }).catch(() => {});
      const sample = await page.evaluate(() => {
        const navigation = performance.getEntriesByType("navigation")[0];
        const resources = performance.getEntriesByType("resource");
        const bytes = (filter) => resources.filter(filter).reduce((sum, item) => sum + item.encodedBodySize, 0);
        return {
          ttfbMs: Math.round(navigation.responseStart - navigation.requestStart),
          lcpMs: Math.round(window.__lcp),
          htmlBytes: navigation.encodedBodySize,
          javascriptBytes: bytes((item) => item.initiatorType === "script"),
          cssBytes: bytes((item) => item.name.includes(".css")),
          imageBytes: bytes((item) => item.initiatorType === "img" || item.name.includes("/_next/image") || /\.(webp|jpg|png)/.test(item.name)),
          totalBytes: navigation.encodedBodySize + bytes(() => true),
          requests: resources.length + 1
        };
      });
      samples.push({ ...sample, status: response.status(), cache: response.headers()["x-nextjs-cache"] || null });
      if (run === 0 && route === "/ru") {
        await mkdir(dirname(output), { recursive: true });
        await page.screenshot({ path: output.replace(/\.json$/, "-home.png"), fullPage: false });
      }
      await context.close();
    }
    const median = Object.fromEntries(Object.keys(samples[0]).filter((key) => typeof samples[0][key] === "number").map((key) => [key, samples.map((sample) => sample[key]).sort((a, b) => a - b)[1]]));
    results.push({ route, median, samples });
    console.log(JSON.stringify({ route, ...median }));
  }
} finally {
  await browser.close();
}

await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({ baseURL, viewport: "1365x768", runs: 3, results }, null, 2) + "\n");
