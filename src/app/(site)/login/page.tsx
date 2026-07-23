import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser, isLibrarian } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(isLibrarian(user) ? "/admin" : "/account");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">
        Welcome back
      </h1>
      <p className="mt-2 text-muted-foreground">
        Sign in to borrow books and manage your shelf.
      </p>

      <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create a membership
        </Link>
      </p>

      <div className="mt-8 rounded border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Demo accounts</p>
        <p className="mt-1.5">
          Staff — librarian@thelibrary.app · librarian123
        </p>
        <p>Member — arjun@example.com · member123</p>
      </div>
    </div>
  );
}
