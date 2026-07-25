import Link from "next/link";
import type { Metadata } from "next";
import { Pencil, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { getBooks } from "@/lib/data";
import { deleteBookAction } from "@/lib/actions";
import { BookCover } from "@/components/book-cover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Catalogue · Staff" };

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string; updated?: string }>;
}) {
  const sp = await searchParams;
  const books = await getBooks({ sort: "title" });

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Catalogue
          </h1>
          <p className="mt-1 text-muted-foreground">
            {books.length} titles across the collection.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/books/new">
            <Plus /> Add a book
          </Link>
        </Button>
      </header>

      {(sp.added || sp.updated) && (
        <p className="mt-5 flex items-center gap-2 rounded border border-success/30 bg-[color-mix(in_oklab,var(--success)_12%,transparent)] px-3.5 py-2.5 text-sm font-medium text-success">
          <CheckCircle2 className="size-4" />
          {sp.added ? "Book added to the catalogue." : "Book details updated."}
        </p>
      )}

      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium tabular">ISBN</th>
                <th className="px-4 py-3 font-medium">Availability</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {books.map((book) => {
                const onLoan = book.totalCopies - book.availableCopies;
                return (
                  <tr key={book.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 shrink-0">
                          <BookCover
                            title={book.title}
                            author={book.author}
                            hue={book.coverHue}
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/catalog/${book.id}`}
                            className="line-clamp-1 font-medium hover:text-primary"
                          >
                            {book.title}
                          </Link>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {book.author}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {book.category}
                    </td>
                    <td className="px-4 py-3 tabular text-muted-foreground">
                      {book.isbn}
                    </td>
                    <td className="px-4 py-3">
                      {book.availableCopies > 0 ? (
                        <Badge tone="success">
                          {book.availableCopies}/{book.totalCopies} in
                        </Badge>
                      ) : (
                        <Badge tone="warning">All {onLoan} out</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/books/${book.id}/edit`}>
                            <Pencil /> Edit
                          </Link>
                        </Button>
                        <form action={deleteBookAction}>
                          <input type="hidden" name="id" value={book.id} />
                          <SubmitButton
                            variant="ghost"
                            size="sm"
                            pendingText="…"
                            className="text-destructive hover:bg-destructive/10"
                            title={
                              onLoan > 0
                                ? "Can't delete while copies are on loan"
                                : "Delete book"
                            }
                            disabled={onLoan > 0}
                          >
                            <Trash2 />
                          </SubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
