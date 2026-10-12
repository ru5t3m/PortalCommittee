import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gameRoot = path.join(webRoot, "public/game");
const backupRoot = path.resolve(webRoot, "../../.verification/game-media-originals");
const context = vm.createContext({ window: {} });
const html = await fs.readFile(path.join(gameRoot, "index.html"), "utf8");
const sources = [];
for (const match of html.matchAll(/<script src="\.\/(src\/data\/[^"]+)"/g)) {
  sources.push(path.join(gameRoot, match[1]));
  vm.runInContext(await fs.readFile(sources.at(-1), "utf8"), context);
}
const images = new Set();
for (const [id, node] of Object.entries(context.window.ALL_NODES)) {
  if (!["curator_intro", "direction_menu"].includes(id) && !id.startsWith("fr_")) continue;
  if (node.background) images.add(node.background);
  for (const line of node.lines || []) {
    const sprite = context.window.CHARACTERS[line.speaker]?.sprite;
    if (sprite) images.add(sprite);
  }
}
sources.push(path.join(gameRoot, "src/core/engine.js"));
const converted = [];
const manifestFile = path.join(backupRoot, "manifest.json");
const previous = JSON.parse(await fs.readFile(manifestFile, "utf8").catch(() => "[]"));
function visiblePixels(data) {
  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] === 0) data.fill(0, index, index + 3);
  }
  return data;
}
for (const image of images) {
  if (!image.endsWith(".png")) continue;
  const original = path.resolve(gameRoot, image);
  assert.ok(original.startsWith(gameRoot + path.sep));
  const replacement = image.replace(/\.png$/, ".webp");
  const output = path.join(gameRoot, replacement);
  if (await fs.stat(output).then(() => true, () => false)) continue;
  const input = await fs.readFile(original);
  const buffer = await sharp(input).webp({ lossless: true, effort: 5 }).toBuffer();
  if (buffer.length >= input.length) continue;
  const before = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const after = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.deepEqual(after.info, before.info, image);
  assert.ok(visiblePixels(before.data).equals(visiblePixels(after.data)), `Visible pixels differ: ${image}`);
  const backup = path.join(backupRoot, image);
  await fs.mkdir(path.dirname(backup), { recursive: true });
  await fs.writeFile(backup, input, { flag: "wx" }).catch(error => { if (error.code !== "EEXIST") throw error; });
  assert.ok(input.equals(await fs.readFile(backup)), `Original backup differs: ${image}`);
  await fs.writeFile(output, buffer);
  for (const source of sources) {
    const text = await fs.readFile(source, "utf8");
    if (text.includes(image)) await fs.writeFile(source, text.replaceAll(image, replacement));
  }
  await fs.unlink(original);
  converted.push({ original: image, optimized: replacement, originalBytes: input.length, optimizedBytes: buffer.length });
  await fs.writeFile(manifestFile, JSON.stringify([...previous, ...converted], null, 2) + "\n");
  console.log(`${image}: ${input.length} -> ${buffer.length} bytes; identical visible pixels`);
}
await fs.mkdir(backupRoot, { recursive: true });
await fs.writeFile(manifestFile, JSON.stringify([...previous, ...converted], null, 2) + "\n");
console.log(JSON.stringify({ converted: converted.length, originalBytes: converted.reduce((sum, item) => sum + item.originalBytes, 0), optimizedBytes: converted.reduce((sum, item) => sum + item.optimizedBytes, 0) }));
