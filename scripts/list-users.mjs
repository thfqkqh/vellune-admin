import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });

if (error) {
  console.error(error.message);
  process.exit(1);
}

for (const user of data.users) {
  console.log(
    user.email,
    "| role:",
    user.app_metadata?.role ?? "-",
    "| confirmed:",
    !!user.email_confirmed_at,
  );
}
