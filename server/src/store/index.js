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
    store.supabaseTablesOk = tablesOk;
    if (tablesOk) {
      console.log("Using Supabase as the database host.");
      return store;
    }
    console.error(
      "Supabase is connected, but tables are missing. Run supabase/schema.sql in the SQL editor. Falling back to local SQLite until then."
    );
    const sqlite = createSqliteStore(openDatabase());
    sqlite.supabaseTablesOk = false;
    return sqlite;
  }

  console.log("Using local SQLite (set SUPABASE_SECRET_KEY to use Supabase).");
  const sqlite = createSqliteStore(openDatabase());
  sqlite.supabaseTablesOk = null;
  return sqlite;
}
