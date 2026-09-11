import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient, createContextClient, resolveEnv } from "@supabase/server/core";
import { pingSupabaseAuth } from "../server/src/services/supabase.js";
import { createSupabaseStore } from "../server/src/store/supabaseStore.js";

dotenv.config({ path: path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../.env") });
if (!process.env.SUPABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

const report = [];
function check(name, pass, detail) {
  report.push({ name, pass: Boolean(pass), detail });
}

const url = process.env.SUPABASE_URL || "";
const pub = process.env.SUPABASE_PUBLISHABLE_KEY || "";
const secret = process.env.SUPABASE_SECRET_KEY || "";
const jwks = process.env.SUPABASE_JWKS_URL || "";
const viteUrl = process.env.VITE_SUPABASE_URL || "";
const vitePub = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

let urlHost = "missing";
try {
  urlHost = new URL(url).host;
} catch {
  urlHost = "invalid";
}

check("env: SUPABASE_URL loaded", url.includes("supabase.co"), urlHost);
check("env: SUPABASE_PUBLISHABLE_KEY prefix", pub.startsWith("sb_publishable_") && !/your_key/i.test(pub), "prefix only");
check("env: SUPABASE_SECRET_KEY prefix", secret.startsWith("sb_secret_") && !/your_key/i.test(secret), "prefix only");
check(
  "env: SUPABASE_JWKS_URL host matches project",
  Boolean(jwks && urlHost !== "missing" && jwks.includes(urlHost) && jwks.includes("/auth/v1/.well-known/jwks.json")),
  jwks ? "jwks path present" : "missing"
);
check("env: VITE_SUPABASE_URL matches SUPABASE_URL", viteUrl === url, "browser url aligned");
check("env: VITE_SUPABASE_PUBLISHABLE_KEY matches publishable", vitePub === pub, "browser key aligned");
check(
  "env: no VITE_ secret",
  !process.env.VITE_SUPABASE_SECRET_KEY && !process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  "no VITE secret vars"
);
check(
  "env: no legacy ANON/SERVICE_ROLE",
  !process.env.SUPABASE_ANON_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY,
  "new key names only"
);

const resolved = resolveEnv();
check(
  "init: resolveEnv()",
  !resolved.error && Boolean(resolved.data?.url),
  resolved.error?.message || (resolved.data?.url ? new URL(resolved.data.url).host : "fail")
);

let adminOk = false;
let adminErr = null;
try {
  const admin = createAdminClient();
  const { error } = await admin.auth.getSession();
  adminOk = !error;
  adminErr = error?.message || null;
} catch (error) {
  adminErr = error.message;
}
check("init: createAdminClient + auth.getSession", adminOk, adminErr || "session call succeeded");

let anonOk = false;
let anonErr = null;
try {
  const anon = createContextClient();
  const { error } = await anon.auth.getSession();
  anonOk = !error;
  anonErr = error?.message || null;
} catch (error) {
  anonErr = error.message;
}
check("init: createContextClient + auth.getSession", anonOk, anonErr || "session call succeeded");

const viteClient = createClient(viteUrl, vitePub);
const { error: viteAuthErr } = await viteClient.auth.getSession();
check("auth: browser-style supabase-js getSession", !viteAuthErr, viteAuthErr?.message || "ok");

const ping = await pingSupabaseAuth();
check("auth: pingSupabaseAuth()", ping.configured && ping.authOk, ping.error || "configured");

let jwksFetch = false;
let jwksDetail = "";
try {
  const res = await fetch(jwks);
  const body = await res.json();
  jwksFetch = res.ok && Array.isArray(body.keys);
  jwksDetail = res.ok ? `keys=${body.keys?.length ?? 0}` : `HTTP ${res.status}`;
} catch (error) {
  jwksDetail = error.message;
}
check("auth: JWKS endpoint reachable", jwksFetch, jwksDetail);

const store = createSupabaseStore();
const tablesOk = await store.pingTables();
let tableErr = null;
try {
  const admin = createAdminClient();
  const { error } = await admin.from("users").select("id").limit(1);
  tableErr = error ? error.message : null;
} catch (error) {
  tableErr = error.message;
}
check("db health: users select limit 1 (read-only)", tablesOk && !tableErr, tableErr || "query succeeded");

const leaked = [];
function walk(target) {
  const st = fs.statSync(target);
  if (st.isDirectory()) {
    for (const name of fs.readdirSync(target)) {
      if (name === "node_modules") continue;
      walk(path.join(target, name));
    }
    return;
  }
  const text = fs.readFileSync(target, "utf8");
  if (secret && text.includes(secret)) leaked.push(target);
}
for (const root of ["client/src", "client/dist", "docs", "server/src", ".env.example", "README.md"]) {
  if (fs.existsSync(root)) walk(root);
}
check(
  "secrets: secret key not in client/src, dist, docs, server/src, examples",
  leaked.length === 0,
  leaked.length ? leaked.join(", ") : "not found in scanned files"
);

const example = fs.readFileSync(".env.example", "utf8");
check(
  "secrets: .env.example has placeholders only",
  /sb_secret_your_key/.test(example) && (!secret || !example.includes(secret)),
  "placeholder present"
);

console.log(JSON.stringify(report, null, 2));
process.exit(report.some((row) => !row.pass) ? 1 : 0);
