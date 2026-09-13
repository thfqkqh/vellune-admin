import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-xs tracking-[0.35em] text-muted">VELLUNE ADMIN</p>
        <h1 className="mt-2 text-2xl font-medium">Admin Sign In</h1>
        <p className="mt-2 text-sm text-muted">
          admin1@naver.com / admin2@naver.com / admin3@naver.com 으로 로그인합니다.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
