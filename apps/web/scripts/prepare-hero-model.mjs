import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const source = await fs.readFile(path.join(root, "s.w.a.t._operator-_4k_followers_special_remaster.glb"));
const jsonLength = source.readUInt32LE(12);
const document = JSON.parse(source.subarray(20, 20 + jsonLength).toString());
const binary = source.subarray(28 + jsonLength);
const images = new Map(document.images.map((image) => [image.bufferView, image]));
const chunks = [];
let offset = 0;
for (const [index, view] of document.bufferViews.entries()) {
  let data = binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
  if (images.has(index)) {
    data = await sharp(data).webp({ lossless: true, effort: 6 }).toBuffer();
    images.get(index).mimeType = "image/webp";
  }
  view.byteOffset = offset;
  view.byteLength = data.length;
  const padding = Buffer.alloc((4 - data.length % 4) % 4);
  chunks.push(data, padding);
  offset += data.length + padding.length;
}
for (const texture of document.textures) {
  texture.extensions = { ...texture.extensions, EXT_texture_webp: { source: texture.source } };
  delete texture.source;
}
document.extensionsUsed = [...new Set([...(document.extensionsUsed || []), "EXT_texture_webp"])];
document.extensionsRequired = [...new Set([...(document.extensionsRequired || []), "EXT_texture_webp"])];
document.buffers[0].byteLength = offset;
const json = Buffer.from(JSON.stringify(document));
const paddedJson = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 32)]);
const header = Buffer.alloc(20);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(28 + paddedJson.length + offset, 8);
header.writeUInt32LE(paddedJson.length, 12);
header.writeUInt32LE(0x4e4f534a, 16);
const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(offset, 0);
binHeader.writeUInt32LE(0x004e4942, 4);
const destination = path.join(root, "apps/web/public/media/characters/swat-operator-v1.glb");
await fs.writeFile(destination, Buffer.concat([header, paddedJson, binHeader, ...chunks]));
console.log(`${source.length} → ${28 + paddedJson.length + offset} bytes (lossless textures)`);
