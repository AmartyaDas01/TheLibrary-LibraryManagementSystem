import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-serif text-base text-foreground">
            The Library
            <span className="ml-2 font-sans text-xs text-muted-foreground">
              A place for every reader.
            </span>
          </p>
          <nav className="flex gap-5">
            <Link href="/catalog" className="hover:text-foreground">
              Catalogue
            </Link>
            <Link href="/account" className="hover:text-foreground">
              My shelf
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Staff sign-in
            </Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
