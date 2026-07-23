import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { BookForm } from "@/components/admin/book-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Add a book" };

export default function NewBookPage() {
  return (
    <div>
      <Link
        href="/admin/books"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to catalogue
      </Link>
      <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight">
        Add a book
      </h1>
      <p className="mt-1 text-muted-foreground">
        Catalogue a new title and set how many copies the library holds.
      </p>

      <Card className="mt-6">
        <CardContent className="p-6">
          <BookForm />
        </CardContent>
      </Card>
    </div>
  );
}
