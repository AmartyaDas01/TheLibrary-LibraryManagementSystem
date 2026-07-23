import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  BookMarked,
  Building2,
  CalendarDays,
  Check,
  FileText,
  Hash,
  Pencil,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getBookById } from "@/lib/data";
import { getCurrentUser, isLibrarian } from "@/lib/auth";
import { borrowAction, reserveAction } from "@/lib/actions";
import { LOAN_STATUS, MAX_ACTIVE_LOANS } from "@/lib/constants";
import { BookCover } from "@/components/book-cover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id);
  return { title: book ? book.title : "Book not found" };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) notFound();

  const user = await getCurrentUser();

  // What is this member's relationship to the book right now?
  const [alreadyBorrowed, alreadyReserved, activeLoanCount] = user
    ? await Promise.all([
        prisma.loan.findFirst({
          where: { bookId: id, userId: user.id, status: LOAN_STATUS.ACTIVE },
        }),
        prisma.reservation.findFirst({
          where: { bookId: id, userId: user.id, status: "PENDING" },
        }),
        prisma.loan.count({
          where: { userId: user.id, status: LOAN_STATUS.ACTIVE },
        }),
      ])
    : [null, null, 0];

  const available = book.availableCopies > 0;
  const atLimit = activeLoanCount >= MAX_ACTIVE_LOANS;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/catalog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to catalogue
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-[260px_1fr]">
        <div>
          <div className="mx-auto w-52 md:w-full">
            <BookCover
              title={book.title}
              author={book.author}
              hue={book.coverHue}
            />
          </div>
        </div>

        <div>
          <Badge tone="accent">{book.category}</Badge>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight">
            {book.title}
          </h1>
          <p className="mt-1.5 text-lg text-muted-foreground">
            by {book.author}
          </p>

          <div className="mt-5 flex items-center gap-3">
            {available ? (
              <Badge tone="success">
                <Check className="size-3.5" />
                {book.availableCopies} of {book.totalCopies} available
              </Badge>
            ) : (
              <Badge tone="warning">All {book.totalCopies} copies on loan</Badge>
            )}
          </div>

          <p className="mt-5 max-w-prose font-prose text-lg leading-relaxed text-foreground/90">
            {book.description}
          </p>

          {/* Actions */}
          <div className="mt-7">
            {!user ? (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-sm text-muted-foreground">
                  Sign in as a member to borrow or reserve this book.
                </p>
                <Button asChild size="sm">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            ) : isLibrarian(user) ? (
              <Button asChild variant="outline">
                <Link href={`/admin/books/${book.id}/edit`}>
                  <Pencil /> Edit this record
                </Link>
              </Button>
            ) : alreadyBorrowed ? (
              <Badge tone="info">
                <BookMarked className="size-3.5" /> You have this on loan
              </Badge>
            ) : available ? (
              atLimit ? (
                <p className="text-sm text-warning">
                  You've reached the {MAX_ACTIVE_LOANS}-book loan limit. Return a
                  book to borrow another.
                </p>
              ) : (
                <form action={borrowAction}>
                  <input type="hidden" name="bookId" value={book.id} />
                  <SubmitButton size="lg" pendingText="Borrowing…">
                    <BookMarked /> Borrow this book
                  </SubmitButton>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Due back in 14 days. You may hold up to {MAX_ACTIVE_LOANS}{" "}
                    books at a time.
                  </p>
                </form>
              )
            ) : alreadyReserved ? (
              <Badge tone="info">
                <Check className="size-3.5" /> You're on the waiting list
              </Badge>
            ) : (
              <form action={reserveAction}>
                <input type="hidden" name="bookId" value={book.id} />
                <SubmitButton variant="accent" size="lg" pendingText="Reserving…">
                  Reserve — join the waiting list
                </SubmitButton>
                <p className="mt-2 text-xs text-muted-foreground">
                  We'll set this copy aside for you when it's returned.
                </p>
              </form>
            )}
          </div>

          {/* Details */}
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6 text-sm sm:grid-cols-3">
            <Detail icon={<Hash />} label="ISBN" value={book.isbn} />
            {book.publisher && (
              <Detail
                icon={<Building2 />}
                label="Publisher"
                value={book.publisher}
              />
            )}
            {book.publishedYear != null && (
              <Detail
                icon={<CalendarDays />}
                label="Published"
                value={formatYear(book.publishedYear)}
              />
            )}
            {book.pageCount != null && (
              <Detail
                icon={<FileText />}
                label="Pages"
                value={String(book.pageCount)}
              />
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BCE` : String(year);
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground [&_svg]:size-3.5">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 tabular font-medium">{value}</dd>
    </div>
  );
}
