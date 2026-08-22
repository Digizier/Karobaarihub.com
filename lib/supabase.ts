import { createClient, SupabaseClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-anon-key";

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  const cleaned = url.trim().replace(/^["']|["']$/g, "");
  return (
    (cleaned.startsWith("http://") || cleaned.startsWith("https://")) &&
    !cleaned.includes("your-project.supabase.co") &&
    key.length > 20 &&
    !key.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
  );
};

export const supabase: SupabaseClient = createClient(rawUrl.trim(), rawKey.trim(), {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return supabase;
};