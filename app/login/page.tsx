import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border border-black/10 bg-white p-8 shadow-sm">
        <p className="text-xs tracking-[0.35em] text-muted">VELLUNE ADMIN</p>
        <h1 className="mt-2 text-2xl font-medium">Sign in to manage inquiries</h1>
        <p className="mt-2 text-sm text-muted">
          Google Sheets에 저장된 인바운드 문의를 관리합니다.
        </p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
