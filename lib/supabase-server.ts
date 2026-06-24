import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client that uses the service-role key.
 * This bypasses Row-Level Security and can write to private buckets.
 *
 * NEVER import this in client components or expose the key to the browser.
 */
export function createServerSupabaseClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/^"|"$/g, "").trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").replace(/^"|"$/g, "").trim();

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not set. Add it to your .env file and restart the dev server."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your .env file and restart the dev server."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
