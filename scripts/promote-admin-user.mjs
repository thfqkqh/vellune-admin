import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2]?.trim().toLowerCase();

if (!url || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

if (!email) {
  console.error("Usage: node scripts/promote-admin-user.mjs <email>");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: listData, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});

if (listError) {
  console.error("FAILED to list users:", listError.message);
  process.exit(1);
}

const user = listData.users.find(
  (item) => item.email?.trim().toLowerCase() === email,
);

if (!user) {
  console.error(`No user found for email: ${email}`);
  process.exit(1);
}

const role = process.argv[3] ?? "super_admin";

const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
  app_metadata: {
    ...user.app_metadata,
    role: "admin",
    admin_role: role,
  },
});

if (error) {
  console.error("FAILED:", error.message);
  process.exit(1);
}

console.log("Promoted to admin:", data.user?.email);
console.log("app_metadata:", JSON.stringify(data.user?.app_metadata));
