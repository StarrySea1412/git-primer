import { createRequire } from "node:module";
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = dirname(fileURLToPath(import.meta.url)) + "/..";
const shots = join(root, "shots");
await mkdir(shots, { recursive: true });
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".png": "image/png" };
const server = createServer(async (req, res) => {
  try {
    const p = req.url === "/" ? "/index.html" : req.url.split("?")[0];
    const body = await readFile(join(root, p));
    res.writeHead(200, { "content-type": MIME[extname(p)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = "http://127.0.0.1:" + server.address().port + "/";
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

async function shot(sel, name, fn) {
  const el = await page.$(sel);
  if (!el) { errors.push("missing " + sel); return; }
  await el.scrollIntoViewIfNeeded();
  if (fn) await fn();
  await page.waitForTimeout(350);
  const box = await el.boundingBox();
  await page.screenshot({ path: join(shots, name), clip: { x: 0, y: Math.max(0, box.y - 10), width: 1200, height: Math.min(1400, box.height + 20) } });
}
await shot(".hero", "01-hero.png");
await shot("#ch1", "02-ch1.png");
// d1 https flow
await shot("#d1", "03-d1-https.png", async () => {
  await page.click("#d1-hs-push");
  await page.waitForTimeout(400);
  await page.click("#d1-hs-save");
});
// d1 ssh flow
await shot("#d1", "04-d1-ssh.png", async () => {
  await page.click("#d1-m-ssh");
  await page.$eval("#d1-ssh-443", (e) => { e.checked = true; e.dispatchEvent(new Event("change", { bubbles: true })); });
  await page.click("#d1-ssh-test");
  await page.waitForTimeout(4600);
});
// d2 full pipeline
await shot("#d2", "05-d2-pipeline.png", async () => {
  await page.click("#d2-wt-files .d2-chip:nth-child(1)");
  await page.click("#d2-wt-files .d2-chip:nth-child(2)");
  await page.click("#d2-add");
  await page.fill("#d2-msg", "修复 HUD 暗色对比度");
  await page.click("#d2-commit");
  await page.click("#d2-push");
  await page.waitForTimeout(1400);
});
// d3 dual push + fog
await shot("#d3", "06-d3-fog.png", async () => {
  await page.$eval("#d3-fog", (e) => { e.checked = true; e.dispatchEvent(new Event("change", { bubbles: true })); });
  await page.click("#d3-push-all");
  await page.waitForTimeout(2600);
});
// d4 symptom 1
await shot("#d4", "07-d4-tree.png", async () => {
  await page.click("#d4-pick .d4-sym:nth-child(1)");
  await page.waitForTimeout(400);
});
// d5 publish happy path then 404 replay
await shot("#d5", "08-d5-publish.png", async () => {
  await page.click("#d5-push");
  await page.waitForTimeout(3400);
});
await shot("#cheat", "09-cheat.png");
await shot(".finale", "10-finale.png");

// mobile overflow scan
const mp = await browser.newPage({ viewport: { width: 375, height: 720 }, deviceScaleFactor: 2 });
mp.on("pageerror", (e) => errors.push("m-pageerror: " + e.message));
await mp.goto(base, { waitUntil: "networkidle" });
await mp.waitForTimeout(400);
const overflow = await mp.evaluate(() => {
  const dw = document.documentElement.clientWidth;
  const bad = [];
  document.querySelectorAll("body *").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.right > dw + 2 && r.width > 20 && !el.closest(".tbl-wrap") && !el.closest(".term pre")) {
      const cls = (el.className && typeof el.className === "string") ? "." + el.className.split(" ")[0] : "";
      bad.push(el.tagName + cls + " right=" + Math.round(r.right));
    }
  });
  return bad.slice(0, 12);
});
if (overflow.length) errors.push("mobile-overflow: " + overflow.join(" | "));
await mp.screenshot({ path: join(shots, "11-mobile.png"), fullPage: false });

console.log(errors.length ? "ISSUES:\n" + errors.join("\n") : "ALL CLEAN");
await browser.close();
process.exit(0);
