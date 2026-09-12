import { requireSignedInUser, supabase } from "./supabase.js";

function exampleTable() {
  if (!supabase) {
    throw new Error("Supabase browser client is not configured.");
  }
  return supabase.from("example");
}

export async function listExampleRows() {
  await requireSignedInUser();
  const { data, error } = await exampleTable().select("*");
  if (error) throw new Error(error.message);
  return data || [];
}

export async function insertExampleRow(fields = {}) {
  const user = await requireSignedInUser();
  const { data, error } = await exampleTable()
    .insert({ ...fields, user_id: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateExampleRow(id, patch) {
  await requireSignedInUser();
  const { user_id: _ignored, ...safePatch } = patch || {};
  const { data, error } = await exampleTable().update(safePatch).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteExampleRow(id) {
  await requireSignedInUser();
  const { error } = await exampleTable().delete().eq("id", id);
  if (error) throw new Error(error.message);
}
