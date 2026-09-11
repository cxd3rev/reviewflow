import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });

const url = process.env.SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const schemaPath = path.join(root, "supabase", "schema.sql");

if (!url || !secret?.startsWith("sb_secret_")) {
  console.error("Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env first.");
  process.exit(1);
}

const host = new URL(url).host;
const ref = host.split(".")[0];
const admin = createClient(url, secret);
const { error } = await admin.from("users").select("id").limit(1);

if (!error) {
  console.log("Supabase tables are already set up.");
  process.exit(0);
}

console.log("Tables are not in this Supabase project yet.");
console.log(`Error: ${error.message}`);
console.log("");
console.log("I cannot create them from this computer (no dashboard login / database password).");
console.log("Do this once:");
console.log(`1. Open https://supabase.com/dashboard/project/${ref}/sql/new`);
console.log(`2. Paste the contents of ${schemaPath}`);
console.log("3. Click Run");
console.log("4. Restart npm run dev");
console.log("5. Run npm run check:supabase");
process.exit(1);
