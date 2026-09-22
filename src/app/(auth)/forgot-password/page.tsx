import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center py-16 px-4 flex-1">
      <div className="w-full max-w-[440px] p-8 md:p-11 bg-card border border-border rounded-lg shadow-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
