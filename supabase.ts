import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env vars. Check .env for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export const EDGE_FUNCTION_URL = `${supabaseUrl}/functions/v1/kairos-ai`;

export type Profile = {
  hard_skills?: string[];
  soft_skills?: string[];
  experience_years?: number;
  summary?: string;
  gaps?: string[];
  raw?: string;
};

export type QuestionItem = {
  question: string;
  rationale?: string;
  target_skill?: string;
};

export type Questions = {
  behavioral?: QuestionItem[];
  technical?: QuestionItem[];
  raw?: string;
};

export type Session = {
  id: string;
  owner_token: string;
  title: string | null;
  resume_text: string | null;
  job_description: string | null;
  profile: Profile | null;
  questions: Questions | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const OWNER_KEY = "kairos_owner_token";

export function getOwnerToken(): string {
  let t = localStorage.getItem(OWNER_KEY);
  if (!t) {
    t = crypto.randomUUID();
    localStorage.setItem(OWNER_KEY, t);
  }
  return t;
}

export function authHeaders(): Record<string, string> {
  return { "X-Owner-Token": getOwnerToken() };
}
