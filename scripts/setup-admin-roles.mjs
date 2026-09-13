import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.argv[2];

const accounts = [
  { email: "admin1@naver.com", admin_role: "super_admin", label: "admin1 (all tabs)" },
  { email: "admin2@naver.com", admin_role: "inquiries_admin", label: "admin2 (inquiries)" },
  { email: "admin3@naver.com", admin_role: "board_admin", label: "admin3 (board)" },
];

if (!url || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

if (!password || password.length < 6) {
  console.error("Usage: node scripts/setup-admin-roles.mjs <password-min-6-chars>");
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
  console.error("Failed to list users:", listError.message);
  process.exit(1);
}

const usersByEmail = new Map(
  listData.users
    .filter((user) => user.email)
    .map((user) => [user.email.toLowerCase(), user]),
);

for (const account of accounts) {
  const email = account.email.toLowerCase();
  const existing = usersByEmail.get(email);

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      app_metadata: {
        ...existing.app_metadata,
        admin_role: account.admin_role,
        role: "admin",
      },
    });

    if (error) {
      console.error(`UPDATE FAIL ${account.label}:`, error.message);
      continue;
    }

    console.log(`UPDATED ${account.label}: ${account.email}`);
    continue;
  }

  const { error } = await supabase.auth.admin.createUser({
    email: account.email,
    password,
    email_confirm: true,
    app_metadata: {
      admin_role: account.admin_role,
      role: "admin",
    },
  });

  if (error) {
    console.error(`CREATE FAIL ${account.label}:`, error.message);
    continue;
  }

  console.log(`CREATED ${account.label}: ${account.email}`);
}

console.log("\nDone. Login emails:");
for (const account of accounts) {
  console.log(`- ${account.email} (${account.admin_role})`);
}
