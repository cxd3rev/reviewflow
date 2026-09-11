import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(root, ".env") });

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

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

console.log(`Supabase Auth ping ok (${new URL(url).host}). No tables were queried.`);
