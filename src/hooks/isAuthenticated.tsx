import { supabase } from "@/db/supabase";

export default async function isAuthenticated() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Authentication check error:", error);
      return false;
    }

    return !!data.user;
  } catch (error) {
    console.error("Authentication check failed:", error);
    return false;
  }
}
