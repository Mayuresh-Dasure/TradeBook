import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Gracefully handle missing env vars — app runs in demo/offline mode
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[BookLoop] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set in .env. ' +
    'The app will run in demo mode — Supabase features (auth, storage, DB) will be disabled. ' +
    'Copy .env.example → .env and fill in your credentials to enable full functionality.'
  );
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : null;
