import sharp from "sharp";
import { mkdir, readdir, rename, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

const publicRoot = join(process.cwd(), "public");
const sourceRoot = join(process.cwd(), "assets", "source-media");
const sources = new Map();

async function discover(root, directory = root) {
  for (const entry of await readdir(directory, { withFileTypes: true }).catch(() => [])) {
    const filename = join(directory, entry.name);
    const path = relative(root, filename).replaceAll("\\", "/");
    if (path.startsWith("psychological-tests/")) continue;
    if (entry.isDirectory()) await discover(root, filename);
    else if (/\.(jpe?g|png)$/i.test(entry.name)) sources.set(path, filename);
  }
}

await discover(sourceRoot);
await discover(publicRoot);
const images = [];

for (const [path, filename] of sources) {
  const metadata = await sharp(filename).metadata();
  const maxSize = path.startsWith("about/leadership/") ? 640 : 1920;
  const outputPath = path.replace(/\.(jpe?g|png)$/i, ".webp");
  const output = join(publicRoot, outputPath);
  await mkdir(dirname(output), { recursive: true });
  await sharp(filename).rotate().resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true }).webp({ quality: metadata.hasAlpha ? 90 : 82 }).toFile(output);
  const originalBytes = (await stat(filename)).size;
  const optimizedBytes = (await stat(output)).size;
  if (filename.startsWith(publicRoot)) {
    const preserved = join(sourceRoot, path);
    await mkdir(dirname(preserved), { recursive: true });
    await rename(filename, preserved);
  }
  images.push({ original: `/${path}`, optimized: `/${outputPath}`, originalBytes, optimizedBytes });
}

await mkdir(sourceRoot, { recursive: true });
await writeFile(join(sourceRoot, "manifest.json"), JSON.stringify(images, null, 2) + "\n");
const originalBytes = images.reduce((sum, image) => sum + image.originalBytes, 0);
const optimizedBytes = images.reduce((sum, image) => sum + image.optimizedBytes, 0);
console.log(JSON.stringify({ images: images.length, originalBytes, optimizedBytes, reductionPercent: Math.round((1 - optimizedBytes / originalBytes) * 100) }));
