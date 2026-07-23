import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getBookById } from "@/lib/data";
import { BookForm } from "@/components/admin/book-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Edit book" };

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) notFound();

  return (
    <div>
      <Link
        href="/admin/books"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to catalogue
      </Link>
      <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight">
        Edit “{book.title}”
      </h1>
      <p className="mt-1 text-muted-foreground">
        {book.totalCopies - book.availableCopies} of {book.totalCopies} copies
        are currently on loan.
      </p>

      <Card className="mt-6">
        <CardContent className="p-6">
          <BookForm
            initial={{
              id: book.id,
              title: book.title,
              author: book.author,
              isbn: book.isbn,
              category: book.category,
              description: book.description,
              publisher: book.publisher ?? "",
              publishedYear:
                book.publishedYear != null ? String(book.publishedYear) : "",
              pageCount: book.pageCount != null ? String(book.pageCount) : "",
              totalCopies: String(book.totalCopies),
              coverHue: book.coverHue,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
