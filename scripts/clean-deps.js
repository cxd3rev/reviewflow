import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const targets = [
  "node_modules",
  "client/node_modules",
  "server/node_modules",
  "client/dist",
  "server/database",
];

for (const relative of targets) {
  const full = path.join(root, relative);
  if (!fs.existsSync(full)) continue;
  fs.rmSync(full, { recursive: true, force: true });
  console.log("Removed", relative);
}

console.log("Done. client and server are now small enough to upload to GitHub.");
console.log("Do not upload any node_modules folder. After uploading, run: npm install");
