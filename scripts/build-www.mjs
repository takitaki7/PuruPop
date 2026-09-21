#!/usr/bin/env node
/* Assemble www/ — the exact set of files that ship inside the native app.
   The repo root doubles as the web root, so it also holds node_modules,
   the native project, README screenshots and other things that must not
   be bundled into the binary. This copies only what the game needs. */
import { cp, mkdir, rm, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "www");

// Everything the running game loads, and nothing else.
const FILES = [
  "index.html",
  "style.css",
  "game.js",
  "ads.js",
  "analytics.js",
  "native.js",
  "manifest.webmanifest",
  "favicon.svg",
  "favicon-32.png",
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "og-image.png",
  "terms.html",
  "privacy.html",
  "tokushoho.html",
];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const f of FILES) await cp(join(root, f), join(out, f));

// The web build leaves the ad provider unset so a browser falls back to
// the simulated ad. A native build is the one place AdMob can actually
// serve, so switch it on here rather than keeping two copies of the page.
const htmlPath = join(out, "index.html");
const html = await readFile(htmlPath, "utf8");
const patched = html.replace(
  /provider: "",(\s*\/\/[^\n]*)?/,
  'provider: "admob", // set by scripts/build-www.mjs for the native build'
);
if (patched === html) {
  console.error("build-www: could not switch the ad provider to admob — check index.html's config block");
  process.exit(1);
}
await writeFile(htmlPath, patched);

console.log(`build-www: wrote ${FILES.length} files to www/ (ad provider: admob)`);
