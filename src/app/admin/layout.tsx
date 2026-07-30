import Link from "next/link";
import { redirect } from "next/navigation";
import { Library, LogOut } from "lucide-react";
import { getCurrentUser, isLibrarian } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

// The staff area is authenticated and data-driven; render per request.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isLibrarian(user)) redirect("/account");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8">
      {/* Sidebar */}
      <aside className="lg:w-60 lg:shrink-0">
        <div className="lg:sticky lg:top-6">
          <Link href="/" className="mb-6 hidden items-center gap-2.5 lg:flex">
            <span className="grid size-9 place-items-center rounded bg-primary text-on-primary">
              <Library className="size-5" />
            </span>
            <span className="font-serif text-xl font-semibold leading-none">
              The Library
            </span>
          </Link>

          <div className="flex items-center justify-between gap-2 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded bg-primary text-on-primary">
                <Library className="size-4.5" />
              </span>
              <span className="font-serif text-lg font-semibold">
                Staff desk
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <form action={logoutAction}>
                <Button
                  variant="ghost"
                  size="icon"
                  type="submit"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4.5" />
                </Button>
              </form>
            </div>
          </div>

          <div className="mt-4 lg:mt-0">
            <AdminNav />
          </div>

          <div className="mt-6 hidden items-center justify-between rounded-lg border border-border bg-card p-3 lg:flex">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                {initials(user.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  Librarian
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <form action={logoutAction} className="mt-3 hidden lg:block">
            <Button variant="outline" size="sm" type="submit" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
