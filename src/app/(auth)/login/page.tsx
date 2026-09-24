import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  const adminTimeout = sp.admin === "1";

  return (
    <div className="flex items-center justify-center py-16 px-4 flex-1">
      <div className="w-full max-w-[440px] p-8 md:p-11 bg-card border border-border rounded-lg shadow-sm">
        {adminTimeout && (
          <p role="status" className="mb-5 rounded-md bg-[#FBF3DC] px-3.5 py-2.5 text-sm text-[#7A5B12]">
            For security, admin sessions last 2 hours. Please sign in again to continue.
          </p>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
