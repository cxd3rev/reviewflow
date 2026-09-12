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

export async function getSupabaseUser() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user || null;
}

export async function ensureSupabaseSession(email, password) {
  if (!supabase) {
    return { ok: false, error: "Supabase browser client is not configured." };
  }

  const { data: signedIn, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (!signInError && signedIn.user) {
    return { ok: true, user: signedIn.user };
  }

  const message = signInError?.message || "Could not sign in to Supabase.";
  const unknownUser = /invalid login credentials/i.test(message);
  if (!unknownUser) {
    return { ok: false, error: message };
  }

  const { data: signedUp, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) {
    return { ok: false, error: signUpError.message };
  }
  if (!signedUp.session || !signedUp.user) {
    return {
      ok: false,
      error: "Confirm your email in the message from Supabase, then log in again.",
    };
  }
  return { ok: true, user: signedUp.user };
}

export async function signOutSupabase() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function requireSignedInUser() {
  if (!supabase) {
    throw new Error("Supabase browser client is not configured.");
  }
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("Please sign in.");
  }
  return data.user;
}
