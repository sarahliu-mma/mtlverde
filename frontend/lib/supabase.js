import { createClient } from "@supabase/supabase-js";

// Browser Supabase client, used for auth and the bookmarks table. The
// publishable key is safe to ship in client code -- row-level security on the
// bookmarks table is what actually protects each user's data. supabase-js
// persists the session in localStorage, so a signed-in user stays logged in
// across reloads. Only import this from client components.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
