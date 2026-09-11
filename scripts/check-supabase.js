import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !publishableKey) {
  console.error("Missing SUPABASE_URL / VITE_SUPABASE_URL or publishable key in .env");
  process.exit(1);
}

const supabase = createClient(url, publishableKey);
const { error } = await supabase.auth.getSession();

if (error) {
  console.error("Supabase Auth ping failed:", error.message);
  process.exit(1);
}

console.log(`Supabase Auth ping ok (${new URL(url).host}).`);

if (!secretKey || !secretKey.startsWith("sb_secret_")) {
  console.log("No SUPABASE_SECRET_KEY — skipped table check.");
  process.exit(0);
}

const admin = createClient(url, secretKey);
const { error: tableError } = await admin.from("users").select("id").limit(1);
if (tableError) {
  console.error("Tables are missing or not readable:", tableError.message);
  console.error("Open the Supabase SQL editor and run supabase/schema.sql once.");
  process.exit(1);
}

console.log("Supabase tables are reachable (users).");
