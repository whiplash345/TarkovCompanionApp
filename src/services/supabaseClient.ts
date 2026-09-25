import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let client: ReturnType<typeof createClient> | undefined;

export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch {
    throw new Error("EXPO_PUBLIC_SUPABASE_URL must be the Supabase project URL, such as https://<project-ref>.supabase.co.");
  }

  if (parsedUrl.protocol !== "https:" || parsedUrl.pathname !== "/" || parsedUrl.search || parsedUrl.hash) {
    throw new Error(
      "EXPO_PUBLIC_SUPABASE_URL must contain only the Supabase project origin (https://<project-ref>.supabase.co), without /rest/v1, /functions/v1, or other paths."
    );
  }

  client ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

export async function getSupabaseFunctionError(error: {
  message: string;
  context?: unknown;
}): Promise<string> {
  const context = error.context as Response | undefined;
  if (!context || typeof context.clone !== "function") return error.message;

  try {
    const response = context.clone();
    const body = await response.text();
    if (!body) return `${response.status}: ${error.message}`;

    try {
      const payload = JSON.parse(body) as Record<string, unknown>;
      const detail = payload.error ?? payload.message ?? payload.msg;
      return `${response.status}: ${typeof detail === "string" ? detail : body}`;
    } catch {
      return `${response.status}: ${body}`;
    }
  } catch {
    return error.message;
  }
}