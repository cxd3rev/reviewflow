import { openDatabase } from "../db.js";
import { createSqliteStore } from "./sqliteStore.js";
import { createSupabaseStore } from "./supabaseStore.js";

function supabaseKeysReady() {
  const secret = process.env.SUPABASE_SECRET_KEY || "";
  const url = process.env.SUPABASE_URL || "";
  return Boolean(url.includes("supabase.co") && secret.startsWith("sb_secret_") && !/your_key/i.test(secret));
}

export async function createStore() {
  if (supabaseKeysReady()) {
    const store = createSupabaseStore();
    const tablesOk = await store.pingTables();
    if (!tablesOk) {
      console.error(
        "Supabase is connected, but tables are missing. Open the Supabase SQL editor and run supabase/schema.sql."
      );
    } else {
      console.log("Using Supabase as the database host.");
    }
    return store;
  }

  console.log("Using local SQLite (set SUPABASE_SECRET_KEY to use Supabase).");
  return createSqliteStore(openDatabase());
}
