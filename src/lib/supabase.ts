
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// The execution environment provides credentials via `process.env`.
// Switched from `import.meta.env` to resolve the runtime error.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = "Supabase URL or Anon Key is missing. Credentials not found in environment.";
  console.error(errorMessage);
  // Display a user-friendly error on the page itself
  const root = document.getElementById('root');
  if (root) {
      root.innerHTML = `<div style="padding: 2rem; text-align: center; color: #ef4444; font-family: 'JetBrains Mono', monospace;">
        <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">[CRITICAL SYSTEM ERROR]</h1>
        <p>${errorMessage}</p>
        <p style="color: #666; font-size: 0.8rem; margin-top: 1rem;">Ensure environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correctly configured.</p>
      </div>`;
  }
  throw new Error(errorMessage);
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
