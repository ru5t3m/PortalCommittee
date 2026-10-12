import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const gameRoot = path.join(root, "public/game");
const context = vm.createContext({ window: {} });
const html = fs.readFileSync(path.join(gameRoot, "index.html"), "utf8");
for (const match of html.matchAll(/<script src="\.\/(src\/data\/[^"]+)"/g)) {
  vm.runInContext(fs.readFileSync(path.join(gameRoot, match[1]), "utf8"), context, { timeout: 1000 });
}
const nodes = context.window.ALL_NODES;
const starts = Object.fromEntries(nodes.direction_menu.choices.filter(choice => choice.scenario).map(choice => [choice.scenario, choice.next]));
starts.antiterror ??= "at_intro";
const prefixes = { antiterror: ["at_"], nabat: ["nb_", "nb2_"], corruption: ["cr_"], flashRoyale: ["fr_"], silentChannel: ["sc_"], drugTraffic: ["dt_"], borderGuard: ["bg_"], ntkCase: ["ntk_"] };
const skillNames = ["trust", "tension", "intel", "analytics", "recon", "speed", "confidence", "decision"];
const numericEffects = effects => Object.fromEntries(Object.entries(effects || {}).filter(([key, value]) => skillNames.includes(key) && Number.isFinite(value)));
const catalog = { starts, nodes: {}, rulesVersion: 1, enabledScenarios: ["flashRoyale"], rules: {} };
const activeImages = new Set();
for (const [id, node] of Object.entries(nodes)) {
  if (node.type !== "minigame" && !node.lines?.length) continue;
  catalog.nodes[id] = {
    lines: node.lines?.length || 0,
    choices: Boolean(node.choices?.length),
    scenario: Object.entries(prefixes).find(([, list]) => list.some(prefix => id.startsWith(prefix)))?.[0] || null,
    timeoutMs: Number.isFinite(node.choiceTimeoutMs) && node.choiceTimeoutMs > 0 ? node.choiceTimeoutMs : 30000,
  };
  if (["curator_intro", "direction_menu"].includes(id) || id.startsWith("fr_")) {
    assert.ok(node.lines?.length && node.type !== "minigame", `Unsupported active scene: ${id}`);
    if (node.background) activeImages.add(node.background);
    for (const line of node.lines) {
      const sprite = context.window.CHARACTERS[line.speaker]?.sprite;
      if (sprite) activeImages.add(sprite);
    }
    catalog.rules[id] = {
      lines: node.lines.length,
      scenario: catalog.nodes[id].scenario,
      next: node.next || null,
      ending: Boolean(node.ending),
      timeoutMs: catalog.nodes[id].timeoutMs,
      timeoutEffects: numericEffects(node.timeoutEffects || { trust: -1, tension: 2 }),
      effects: numericEffects(node.effects),
      choices: (node.choices || []).map(choice => ({
        next: choice.next, scenario: choice.scenario || null, disabled: Boolean(choice.disabled),
        effects: numericEffects(choice.effects), require: choice.require || {},
      })),
    };
  }
}
for (const image of activeImages) {
  assert.ok(image.startsWith("assets/") && !image.includes(".."), `Invalid game image: ${image}`);
  let directory = gameRoot;
  for (const component of image.split("/")) {
    assert.ok(fs.readdirSync(directory).includes(component), `Missing image or filename case mismatch: ${image}`);
    directory = path.join(directory, component);
  }
  assert.ok(fs.statSync(directory).isFile(), `Not an image file: ${image}`);
}
for (const [id, node] of Object.entries(catalog.rules)) {
  for (const target of [node.next, ...node.choices.filter(choice => !choice.disabled).map(choice => choice.next)].filter(Boolean)) {
    assert.ok(catalog.rules[target], `Invalid transition: ${id} -> ${target}`);
  }
}
const output = path.resolve(root, "../api/app/data/specgame-catalog.json");
if (process.argv.includes("--check")) {
  assert.ok(isDeepStrictEqual(JSON.parse(fs.readFileSync(output, "utf8")), JSON.parse(JSON.stringify(catalog))), "Run npm run game:catalog after changing game scenes");
} else fs.writeFileSync(output, JSON.stringify(catalog, null, 2) + "\n");
console.log(`Game catalog: ${Object.keys(catalog.nodes).length} scenes and ${activeImages.size} active images verified`);
