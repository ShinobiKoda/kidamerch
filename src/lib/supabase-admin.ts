import { createClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "@/lib/get-required-env";

const SUPABASE_URL = getRequiredEnv("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

export const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
