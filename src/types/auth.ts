
import { User as SupabaseUser } from "@supabase/supabase-js";

// Extend the Supabase User type with our custom properties
export interface ExtendedUser extends SupabaseUser {
  name?: string;
  photo?: string;
}

// Helper function to ensure type safety
export function asExtendedUser(user: SupabaseUser | null): ExtendedUser | null {
  return user as ExtendedUser | null;
}
