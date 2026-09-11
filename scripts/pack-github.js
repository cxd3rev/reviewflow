import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "upload");

const skip = new Set(["node_modules", "dist", "database", "upload", ".git"]);

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    if (entry.name.endsWith(".sqlite") || entry.name.endsWith(".sqlite-wal") || entry.name.endsWith(".sqlite-shm")) continue;
    const src = path.join(from, entry.name);
    const out = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, out);
    else fs.copyFileSync(src, out);
  }
}

if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest);

copyDir(path.join(root, "client"), path.join(dest, "client"));
copyDir(path.join(root, "server"), path.join(dest, "server"));
copyDir(path.join(root, "scripts"), path.join(dest, "scripts"));
if (fs.existsSync(path.join(root, "supabase"))) {
  copyDir(path.join(root, "supabase"), path.join(dest, "supabase"));
}
if (fs.existsSync(path.join(root, "docs"))) {
  copyDir(path.join(root, "docs"), path.join(dest, "docs"));
}
if (fs.existsSync(path.join(root, ".github"))) {
  copyDir(path.join(root, ".github"), path.join(dest, ".github"));
}

for (const file of [
  "package.json",
  "package-lock.json",
  "README.md",
  ".gitignore",
  ".env.example",
  "index.html",
  "Dockerfile",
  ".dockerignore",
  "render.yaml",
]) {
  const src = path.join(root, file);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dest, file));
}

console.log("Created the upload/ folder with source files only (no node_modules).");
console.log("On GitHub, upload the folders inside upload/ — not the main client/ or server/ folders.");
