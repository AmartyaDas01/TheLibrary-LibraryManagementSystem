import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser, isLibrarian } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Join the library" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(isLibrarian(user) ? "/admin" : "/account");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">
        Join the library
      </h1>
      <p className="mt-2 text-muted-foreground">
        Create a free membership to borrow and reserve books.
      </p>

      <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
        <RegisterForm />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
