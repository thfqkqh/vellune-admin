import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.argv[2];

const targets = [
  { email: "admin1@naver.com", admin_role: "super_admin" },
  { email: "admin2@naver.com", admin_role: "inquiries_admin" },
  { email: "admin3@naver.com", admin_role: "board_admin" },
  { email: "admin@naver.com", admin_role: "super_admin" },
];

if (!url || !serviceRoleKey || !password || password.length < 6) {
  console.error("Usage: node scripts/reset-admin-passwords.mjs <password-min-6-chars>");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (error) {
  console.error(error.message);
  process.exit(1);
}

const byEmail = new Map(
  data.users.filter((u) => u.email).map((u) => [u.email.toLowerCase(), u]),
);

for (const target of targets) {
  const user = byEmail.get(target.email.toLowerCase());
  if (!user) {
    console.log("SKIP (not found):", target.email);
    continue;
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password,
    app_metadata: {
      ...user.app_metadata,
      role: "admin",
      admin_role: target.admin_role,
    },
  });

  if (updateError) {
    console.error("FAIL:", target.email, updateError.message);
  } else {
    console.log("RESET OK:", target.email, `(${target.admin_role})`);
  }
}
