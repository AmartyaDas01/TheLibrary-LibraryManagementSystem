import Link from "next/link";
import { Library } from "lucide-react";
import { getCurrentUser, isLibrarian } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

export async function SiteHeader() {
  const user = await getCurrentUser();

  const links = [
    { href: "/catalog", label: "Catalogue" },
    ...(user ? [{ href: "/account", label: "My shelf" }] : []),
    ...(isLibrarian(user) ? [{ href: "/admin", label: "Staff desk" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded bg-primary text-on-primary">
            <Library className="size-5" />
          </span>
          <span className="font-serif text-2xl font-semibold leading-none tracking-tight">
            The Library
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          <NavLink href="/catalog">Catalogue</NavLink>
          {user && <NavLink href="/account">My shelf</NavLink>}
          {isLibrarian(user) && <NavLink href="/admin">Staff desk</NavLink>}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <MobileNav links={links} />
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              <span
                className="hidden size-9 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent sm:grid"
                title={user.name}
                aria-hidden
              >
                {initials(user.name)}
              </span>
              <form action={logoutAction}>
                <Button variant="outline" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Join</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </Link>
  );
}
