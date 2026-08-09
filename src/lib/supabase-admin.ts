import { createClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "@/lib/get-required-env";
import type { Database } from "@/types/database.types";

const SUPABASE_URL = getRequiredEnv("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

export const supabaseAdmin = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);