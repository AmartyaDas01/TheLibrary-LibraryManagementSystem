import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  BookMarked,
  Clock,
  History,
  IndianRupee,
  ListChecks,
  Receipt,
  TriangleAlert,
} from "lucide-react";
import { getCurrentUser, isLibrarian } from "@/lib/auth";
import { getMemberOverview, accruedFine } from "@/lib/data";
import { cancelReservationAction } from "@/lib/actions";
import { PayFineButton } from "@/components/pay-fine-button";
import { BookCover } from "@/components/book-cover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";
import { formatCurrency, formatDate, relativeDays, daysUntil } from "@/lib/utils";

export const metadata: Metadata = { title: "My shelf" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (isLibrarian(user)) redirect("/admin");

  const { activeLoans, reservations, fines, history, unpaidFines } =
    await getMemberOverview(user.id);
  const overdueCount = activeLoans.filter(
    (l) => daysUntil(l.dueAt) < 0,
  ).length;
  const outstandingFines = fines.filter((f) => !f.paid);
  const paidFines = fines.filter((f) => f.paid);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Member · <span className="tabular">{user.membershipId}</span>
          </p>
          <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight">
            {user.name}'s shelf
          </h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/catalog">Browse the catalogue</Link>
        </Button>
      </div>

      {/* Summary tiles */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile
          icon={<BookMarked />}
          label="On loan"
          value={activeLoans.length}
        />
        <Tile
          icon={<TriangleAlert />}
          label="Overdue"
          value={overdueCount}
          tone={overdueCount > 0 ? "danger" : "neutral"}
        />
        <Tile
          icon={<ListChecks />}
          label="Reservations"
          value={reservations.length}
        />
        <Tile
          icon={<IndianRupee />}
          label="Fines due"
          value={formatCurrency(unpaidFines)}
          tone={unpaidFines > 0 ? "warning" : "neutral"}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Loans */}
        <section>
          <SectionTitle icon={<BookMarked className="size-5" />}>
            Currently borrowed
          </SectionTitle>
          {activeLoans.length === 0 ? (
            <EmptyCard>
              You have no books out. Head to the{" "}
              <Link href="/catalog" className="text-primary hover:underline">
                catalogue
              </Link>{" "}
              to borrow one.
            </EmptyCard>
          ) : (
            <ul className="mt-4 space-y-3">
              {activeLoans.map((loan) => {
                const overdue = daysUntil(loan.dueAt) < 0;
                const fine = accruedFine(loan.dueAt);
                return (
                  <li key={loan.id}>
                    <Card>
                      <CardContent className="flex gap-4 p-4">
                        <Link
                          href={`/catalog/${loan.book.id}`}
                          className="w-14 shrink-0"
                        >
                          <BookCover
                            title={loan.book.title}
                            author={loan.book.author}
                            hue={loan.book.coverHue}
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/catalog/${loan.book.id}`}
                            className="font-medium hover:text-primary"
                          >
                            {loan.book.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {loan.book.author}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {overdue ? (
                              <Badge tone="danger">
                                <Clock className="size-3.5" /> Overdue ·{" "}
                                {relativeDays(loan.dueAt)}
                              </Badge>
                            ) : (
                              <Badge tone="info">
                                <Clock className="size-3.5" /> Due{" "}
                                {relativeDays(loan.dueAt)}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(loan.dueAt)}
                            </span>
                            {fine > 0 && (
                              <Badge tone="warning">
                                Fine {formatCurrency(fine)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}

          {/* History */}
          <SectionTitle icon={<History className="size-5" />} className="mt-10">
            Reading history
          </SectionTitle>
          {history.length === 0 ? (
            <EmptyCard>Books you return will appear here.</EmptyCard>
          ) : (
            <Card className="mt-4">
              <ul className="divide-y divide-border">
                {history.map((loan) => (
                  <li
                    key={loan.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/catalog/${loan.book.id}`}
                        className="line-clamp-1 text-sm font-medium hover:text-primary"
                      >
                        {loan.book.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {loan.book.author}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      Returned{" "}
                      {loan.returnedAt ? formatDate(loan.returnedAt) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>

        {/* Right column: reservations + fines */}
        <aside className="space-y-8">
          <section>
            <SectionTitle icon={<ListChecks className="size-5" />}>
              Reservations
            </SectionTitle>
            {reservations.length === 0 ? (
              <EmptyCard>No holds right now.</EmptyCard>
            ) : (
              <ul className="mt-4 space-y-3">
                {reservations.map((r) => (
                  <li key={r.id}>
                    <Card>
                      <CardContent className="flex items-center gap-3 p-3">
                        <Link
                          href={`/catalog/${r.book.id}`}
                          className="w-10 shrink-0"
                        >
                          <BookCover
                            title={r.book.title}
                            author={r.book.author}
                            hue={r.book.coverHue}
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/catalog/${r.book.id}`}
                            className="line-clamp-1 text-sm font-medium hover:text-primary"
                          >
                            {r.book.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Reserved {formatDate(r.reservedAt)}
                          </p>
                        </div>
                        <form action={cancelReservationAction}>
                          <input
                            type="hidden"
                            name="reservationId"
                            value={r.id}
                          />
                          <SubmitButton
                            variant="ghost"
                            size="sm"
                            pendingText="…"
                          >
                            Cancel
                          </SubmitButton>
                        </form>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <SectionTitle icon={<IndianRupee className="size-5" />}>
              Fines
            </SectionTitle>
            {outstandingFines.length === 0 ? (
              <EmptyCard>No outstanding fines. Nicely done.</EmptyCard>
            ) : (
              <Card className="mt-4">
                <ul className="divide-y divide-border">
                  {outstandingFines.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-medium">
                          {f.loan.book.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(f.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="tabular text-sm font-semibold">
                          {formatCurrency(f.amount)}
                        </span>
                        <PayFineButton fineId={f.id} />
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            {unpaidFines > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Test mode: pay with card 4111 1111 1111 1111, any future expiry
                and CVV, or UPI id success@razorpay.
              </p>
            )}
          </section>

          <section>
            <SectionTitle icon={<Receipt className="size-5" />}>
              Payment history
            </SectionTitle>
            {paidFines.length === 0 ? (
              <EmptyCard>Paid fines will show up here.</EmptyCard>
            ) : (
              <Card className="mt-4">
                <ul className="divide-y divide-border">
                  {paidFines.map((f) => (
                    <li key={f.id} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-medium">
                            {f.loan.book.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Paid {formatDate(f.paidAt ?? f.createdAt)}
                            {f.paymentMethod === "DESK"
                              ? " · At the desk"
                              : f.paymentMethod === "RAZORPAY"
                                ? " · Card"
                                : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="tabular text-sm font-semibold">
                            {formatCurrency(f.amount)}
                          </span>
                          <Badge tone="success">Paid</Badge>
                        </div>
                      </div>
                      {f.razorpayPaymentId && (
                        <p className="mt-1 truncate text-[0.7rem] text-muted-foreground/70">
                          Ref {f.razorpayPaymentId}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone?: "neutral" | "danger" | "warning";
}) {
  const accent =
    tone === "danger"
      ? "text-destructive"
      : tone === "warning"
        ? "text-warning"
        : "text-primary";
  return (
    <Card>
      <CardContent className="p-4">
        <span
          className={`inline-flex size-9 items-center justify-center rounded bg-muted [&_svg]:size-4.5 ${accent}`}
        >
          {icon}
        </span>
        <p className="mt-3 text-2xl font-semibold tabular">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function SectionTitle({
  icon,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight ${className}`}
    >
      <span className="text-accent">{icon}</span>
      {children}
    </h2>
  );
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 px-5 py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
