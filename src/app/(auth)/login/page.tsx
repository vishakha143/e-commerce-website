import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | Fashion",
};

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center py-16 px-4 flex-1">
      <div className="w-full max-w-[440px] p-8 md:p-11 bg-card border border-border rounded-lg shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}
