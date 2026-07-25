import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Library,
  Search,
  Sparkles,
} from "lucide-react";
import { getBooks, getCategoryCounts, getAdminStats } from "@/lib/data";
import { BookCover } from "@/components/book-cover";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const [recent, categories, stats] = await Promise.all([
    getBooks({ sort: "recent" }),
    getCategoryCounts(),
    getAdminStats(),
  ]);
  const featured = recent.slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="paper-texture border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-accent" />
              {stats.titles} titles · {stats.copies} copies on the shelves
            </span>
            <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Every reader deserves the right book.
            </h1>
            <p className="mt-6 max-w-xl font-prose text-lg leading-relaxed text-muted-foreground">
              Find a book, borrow it in a tap, and see what you owe and when it's
              due. The Library puts the reading room and the front desk on the
              same screen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/catalog">
                  Browse the catalogue <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/register">Become a member</Link>
              </Button>
            </div>
          </div>

          {/* Stacked cover motif */}
          <div className="relative hidden lg:block" aria-hidden>
            <div className="absolute right-6 top-4 w-40 rotate-6">
              {featured[1] && (
                <BookCover
                  title={featured[1].title}
                  author={featured[1].author}
                  hue={featured[1].coverHue}
                />
              )}
            </div>
            <div className="absolute left-10 top-16 w-44 -rotate-6">
              {featured[2] && (
                <BookCover
                  title={featured[2].title}
                  author={featured[2].author}
                  hue={featured[2].coverHue}
                />
              )}
            </div>
            <div className="absolute left-1/2 top-2 w-48 -translate-x-1/2">
              {featured[0] && (
                <BookCover
                  title={featured[0].title}
                  author={featured[0].author}
                  hue={featured[0].coverHue}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured shelf */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-tight">
              New on the shelves
            </h2>
            <p className="mt-1 text-muted-foreground">
              Freshly catalogued and ready to borrow.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
            <Link href="/catalog">
              See all <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {featured.map((book) => (
            <Link
              key={book.id}
              href={`/catalog/${book.id}`}
              className="group focus-visible:outline-none"
            >
              <div className="transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
                <BookCover
                  title={book.title}
                  author={book.author}
                  hue={book.coverHue}
                />
              </div>
              <p className="mt-2 line-clamp-1 text-sm font-medium group-hover:text-primary">
                {book.title}
              </p>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {book.author}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-serif text-3xl font-semibold tracking-tight">
            Wander by subject
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c.category}
                href={`/catalog?category=${encodeURIComponent(c.category)}`}
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                {c.category}
                <span className="tabular rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground group-hover:bg-accent-soft group-hover:text-accent">
                  {c.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <HowStep
            icon={<Search className="size-5" />}
            title="Find it"
            body="Search the whole collection by title, author or ISBN, and filter down to what's on the shelf right now."
          />
          <HowStep
            icon={<BookOpen className="size-5" />}
            title="Borrow it"
            body="Members borrow in one tap, or reserve a title that's out so you're first in line when it returns."
          />
          <HowStep
            icon={<CalendarClock className="size-5" />}
            title="Keep track"
            body="Your shelf shows what you're holding, when each book is due, and any fines you owe, so nothing's a surprise at the desk."
          />
        </div>

        <div className="mt-12 overflow-hidden rounded-xl border border-border bg-primary text-on-primary">
          <div className="flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded bg-white/15">
                <Library className="size-6" />
              </span>
              <div>
                <h3 className="font-serif text-2xl font-semibold">
                  Everything the front desk needs
                </h3>
                <p className="mt-1 max-w-lg text-on-primary/80">
                  Staff manage the catalogue, issue and return books, and track
                  fines and reservations from a single dashboard.
                </p>
              </div>
            </div>
            <Button
              asChild
              size="lg"
              variant="accent"
              className="shrink-0"
            >
              <Link href="/login">Staff sign-in</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function HowStep({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <span className="grid size-11 place-items-center rounded bg-accent-soft text-accent">
        {icon}
      </span>
      <h3 className="mt-4 font-serif text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}
