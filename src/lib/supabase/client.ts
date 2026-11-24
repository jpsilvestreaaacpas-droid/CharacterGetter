import { createClient } from "@supabase/supabase-js";

// Client for browser environments using publishable / anon keys
// In Vite, use import.meta.env.VITE_* instead of process.env.NEXT_PUBLIC_*
const supabaseUrl =
  (import.meta.env as Record<string, string>)["VITE_SUPABASE_URL"] ??
  "https://placeholder-project.supabase.co";
const supabaseAnonKey =
  (import.meta.env as Record<string, string>)["VITE_SUPABASE_ANON_KEY"] ??
  "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function isSupabaseConfigured(): boolean {
  const url = (import.meta.env as Record<string, string>)["VITE_SUPABASE_URL"];
  return Boolean(url) && url !== "https://placeholder-project.supabase.co";
}
