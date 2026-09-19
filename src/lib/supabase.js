
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fdgtqaftxmbtfcnydzil.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_gLp6SUvuc1YQ-7KYuKom_w_5nVwOAmi";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);