import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase =
  url && publishableKey ? createClient(url, publishableKey) : null;

export async function pingSupabase() {
  if (!supabase) {
    return { configured: false, ok: false, error: "VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is missing." };
  }
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return { configured: true, ok: false, error: error.message };
  }
  return { configured: true, ok: true, session: data.session };
}
