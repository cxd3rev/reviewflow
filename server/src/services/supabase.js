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

export async function pingSupabaseAuth() {
  const status = supabaseEnvStatus();
  if (!status.configured) {
    return { configured: false, url: null, authOk: false, error: status.error };
  }
  try {
    const client = getSupabaseAnon();
    if (!client) {
      return { configured: true, url: status.url, authOk: false, error: "Could not create a publishable Supabase client." };
    }
    const { error } = await client.auth.getSession();
    if (error) {
      return { configured: true, url: status.url, authOk: false, error: error.message };
    }
    return { configured: true, url: status.url, authOk: true, error: null };
  } catch (error) {
    return { configured: true, url: status.url, authOk: false, error: error.message };
  }
}
