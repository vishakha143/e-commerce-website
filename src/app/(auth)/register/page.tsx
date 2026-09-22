import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center py-16 px-4 flex-1">
      <div className="w-full max-w-[440px] p-8 md:p-11 bg-card border border-border rounded-lg shadow-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
