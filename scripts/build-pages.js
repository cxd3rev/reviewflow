import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "client", "dist");
const docs = path.join(root, "docs");

const env = {
  ...process.env,
  VITE_PAGES: "true",
  VITE_BASE: "./",
};

const result = spawnSync("npm", ["run", "build", "-w", "starywrld-client"], {
  cwd: root,
  env,
  stdio: "inherit",
  shell: true,
});

if (result.status !== 0) process.exit(result.status ?? 1);

if (fs.existsSync(docs)) fs.rmSync(docs, { recursive: true, force: true });
fs.cpSync(dist, docs, { recursive: true });
fs.copyFileSync(path.join(docs, "index.html"), path.join(docs, "404.html"));
fs.writeFileSync(path.join(docs, ".nojekyll"), "");
console.log("GitHub Pages site written to docs/");
