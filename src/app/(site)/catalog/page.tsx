import Link from "next/link";
import { Search, SlidersHorizontal, BookX } from "lucide-react";
import type { Metadata } from "next";
import { getBooks, getCategoryCounts, type BookSort } from "@/lib/data";
import { BookCover } from "@/components/book-cover";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = { title: "Catalogue" };

type SP = Promise<{
  query?: string;
  category?: string;
  availability?: string;
  sort?: string;
}>;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;
  const query = sp.query?.trim() || "";
  const category = sp.category || "";
  const availability = sp.availability === "available" ? "available" : "all";
  const sort = (["title", "recent", "author"].includes(sp.sort ?? "")
    ? sp.sort
    : "title") as BookSort;

  const [books, categories] = await Promise.all([
    getBooks({ query, category, availability, sort }),
    getCategoryCounts(),
  ]);

  function withParam(key: string, value: string) {
    const next = new URLSearchParams();
    if (query) next.set("query", query);
    if (category) next.set("category", category);
    if (availability !== "all") next.set("availability", availability);
    if (sort !== "title") next.set("sort", sort);
    if (value) next.set(key, value);
    else next.delete(key);
    const s = next.toString();
    return s ? `/catalog?${s}` : "/catalog";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">
          The catalogue
        </h1>
        <p className="text-muted-foreground">
          {books.length} {books.length === 1 ? "title" : "titles"}
          {category ? ` in ${category}` : ""}
          {query ? ` matching “${query}”` : ""}.
        </p>
      </div>

      {/* Search + sort */}
      <form className="mt-6 flex flex-col gap-3 sm:flex-row" action="/catalog">
        {category && <input type="hidden" name="category" value={category} />}
        {availability !== "all" && (
          <input type="hidden" name="availability" value={availability} />
        )}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="query"
            defaultValue={query}
            placeholder="Search by title, author or ISBN…"
            aria-label="Search the catalogue"
            className="pl-9"
          />
        </div>
        <Select
          name="sort"
          defaultValue={sort}
          aria-label="Sort order"
          className="sm:w-44"
        >
          <option value="title">Sort: Title A–Z</option>
          <option value="author">Sort: Author A–Z</option>
          <option value="recent">Sort: Recently added</option>
        </Select>
        <Button type="submit" variant="outline">
          <SlidersHorizontal /> Apply
        </Button>
      </form>

      {/* Category chips + availability */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Chip href={withParam("category", "")} active={!category}>
          All subjects
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c.category}
            href={withParam("category", c.category)}
            active={category === c.category}
          >
            {c.category}
          </Chip>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
        <Chip
          href={withParam(
            "availability",
            availability === "available" ? "" : "available",
          )}
          active={availability === "available"}
        >
          Available now
        </Chip>
      </div>

      {/* Grid */}
      {books.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
          <BookX className="size-10 text-muted-foreground" />
          <p className="mt-4 font-serif text-xl">Nothing on this shelf</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            No titles match your search. Try a different term or clear the
            filters.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-5">
            <Link href="/catalog">Clear filters</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/catalog/${book.id}`}
              className="group focus-visible:outline-none"
            >
              <div className="relative transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
                <BookCover
                  title={book.title}
                  author={book.author}
                  hue={book.coverHue}
                />
                <div className="absolute left-2 top-2">
                  {book.availableCopies > 0 ? (
                    <Badge tone="success">Available</Badge>
                  ) : (
                    <Badge tone="warning">On loan</Badge>
                  )}
                </div>
              </div>
              <p className="mt-2.5 line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
                {book.title}
              </p>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {book.author}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-on-primary"
          : "rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      }
    >
      {children}
    </Link>
  );
}
