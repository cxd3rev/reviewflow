import { createAdminClient, createContextClient, resolveEnv } from "@supabase/server/core";

export function supabaseEnvStatus() {
  const { data, error } = resolveEnv();
  if (error || !data?.url) {
    return { configured: false, url: null, error: error?.message || "Supabase env is not set." };
  }
  return { configured: true, url: data.url, error: null };
}

export function getSupabaseAdmin() {
  const status = supabaseEnvStatus();
  if (!status.configured) return null;
  return createAdminClient();
}

export function getSupabaseAnon(token) {
  const status = supabaseEnvStatus();
  if (!status.configured) return null;
  if (token) return createContextClient({ auth: { token } });
  return createContextClient();
}

export function attachSupabase(req, _res, next) {
  try {
    req.supabaseAdmin = getSupabaseAdmin();
    req.supabase = getSupabaseAnon();
  } catch (error) {
    console.error("Supabase client failed:", error.message);
    req.supabaseAdmin = null;
    req.supabase = null;
  }
  next();
}
