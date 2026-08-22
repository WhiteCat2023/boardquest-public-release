import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Explicitly load .env from apps/api/.env or workspace root
const cwd = process.cwd();
const possiblePaths = [
  path.resolve(cwd, ".env"),
  path.resolve(cwd, "apps/api/.env"),
  path.resolve(cwd, "../.env"),
  path.resolve(cwd, "../../.env"),
];

for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}
dotenv.config();

export const getSupabaseUrl = (): string => {
  const raw =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_PROJECT_URL ||
    "";
  return raw.replace(/['";]/g, "").trim();
};

export const getSupabaseKey = (): string => {
  const raw =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";
  return raw.replace(/['";]/g, "").trim();
};

export const getStorageBucket = (): string => {
  const raw = process.env.SUPABASE_STORAGE_BUCKET!;
  return raw.replace(/['";]/g, "").trim();
};

export const DEFAULT_STORAGE_BUCKET = getStorageBucket();

export const getSupabaseClient = (): SupabaseClient => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!url || !key) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        "[Supabase Config] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables."
      );
    }
  }

  return createClient(
    url || "https://placeholder.supabase.co",
    key || "placeholder-key",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
};

// Dynamic proxy so calls to supabaseClient always read current environment variables
export const supabaseClient: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const val = (client as any)[prop];
    if (typeof val === "function") {
      return val.bind(client);
    }
    return val;
  },
});

export default supabaseClient;
