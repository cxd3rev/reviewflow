/**
 * Capture the live /demo?record=1 walkthrough with Playwright video.
 * Run from repo root after Vite is on http://localhost:5173
 */
import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "client", "public", "demo");
const captureDir = join(outDir, "_capture");
const url = process.env.DEMO_URL || "http://localhost:5173/demo?record=1";
const width = Number(process.env.DEMO_WIDTH || 1920);
const height = Number(process.env.DEMO_HEIGHT || 1080);
const waitMs = Number(process.env.DEMO_WAIT_MS || 300_000);

mkdirSync(captureDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required"],
});

const context = await browser.newContext({
  viewport: { width, height },
  recordVideo: { dir: captureDir, size: { width, height } },
  reducedMotion: "no-preference",
});

const page = await context.newPage();
page.setDefaultTimeout(waitMs + 60_000);

console.log(`Opening ${url} at ${width}x${height}`);
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForSelector(".demo-stage, .demo-start", { timeout: 30_000 });

const startBtn = page.locator("button", { hasText: /start demo/i });
if (await startBtn.count()) {
  await startBtn.first().click();
}

await page.waitForSelector('[data-demo-state="playing"]', { timeout: 30_000 });
console.log("Demo playing — waiting for data-demo-state=done");
await page.waitForSelector('[data-demo-state="done"]', { timeout: waitMs });
await page.waitForTimeout(2500);

const video = page.video();
await context.close();
await browser.close();

const src = video ? await video.path() : "";
if (!src || !existsSync(src)) {
  const files = readdirSync(captureDir).filter((f) => f.endsWith(".webm"));
  if (!files.length) throw new Error("Playwright did not write a video file");
  const fallback = join(captureDir, files[0]);
  const dest = join(outDir, "starywrld-demo.webm");
  renameSync(fallback, dest);
  console.log(`Wrote ${dest}`);
} else {
  const dest = join(outDir, "starywrld-demo.webm");
  renameSync(src, dest);
  console.log(`Wrote ${dest}`);
}
