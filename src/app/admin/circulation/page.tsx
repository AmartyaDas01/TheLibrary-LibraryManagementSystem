import Link from "next/link";
import type { Metadata } from "next";
import { BookPlus, BellRing } from "lucide-react";
import {
  getLoans,
  getMemberOptions,
  getBooks,
  getPendingReservations,
  accruedFine,
} from "@/lib/data";
import {
  issueLoanAction,
  returnLoanAction,
  markFinePaidAction,
} from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, Label } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";
import { formatCurrency, formatDate, relativeDays, daysUntil } from "@/lib/utils";

export const metadata: Metadata = { title: "Circulation" };

type Status = "active" | "overdue" | "returned";
const TABS: { key: Status; label: string }[] = [
  { key: "active", label: "On loan" },
  { key: "overdue", label: "Overdue" },
  { key: "returned", label: "Returned" },
];

export default async function CirculationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = (
    TABS.some((t) => t.key === sp.status) ? sp.status : "active"
  ) as Status;

  const [loans, members, availableBooks, reservations] = await Promise.all([
    getLoans(status),
    getMemberOptions(),
    getBooks({ availability: "available", sort: "title" }),
    getPendingReservations(),
  ]);

  return (
    <div>
      <header>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Circulation desk
        </h1>
        <p className="mt-1 text-muted-foreground">
          Issue and return books, and settle any fines.
        </p>
      </header>

      {/* Issue a book */}
      <Card className="mt-6">
        <CardContent className="p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <BookPlus className="size-4.5 text-primary" />
            Issue a book
          </h2>
          <form
            action={issueLoanAction}
            className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <div>
              <Label htmlFor="userId">Member</Label>
              <Select id="userId" name="userId" required defaultValue="">
                <option value="" disabled>
                  Select a member…
                </option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.membershipId})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="bookId">Book</Label>
              <Select id="bookId" name="bookId" required defaultValue="">
                <option value="" disabled>
                  Select an available book…
                </option>
                {availableBooks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} — {b.availableCopies} left
                  </option>
                ))}
              </Select>
            </div>
            <SubmitButton pendingText="Issuing…">Issue</SubmitButton>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            The book is due back in 14 days. Members may hold up to 5 at a time.
          </p>
        </CardContent>
      </Card>

      {/* Loans */}
      <div className="mt-8 flex items-center gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/circulation?status=${tab.key}`}
            aria-current={status === tab.key ? "page" : undefined}
            className={
              status === tab.key
                ? "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-on-primary"
                : "rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            }
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Book</th>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">
                  {status === "returned" ? "Returned" : "Due"}
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loans.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No loans to show here.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => {
                  const overdue =
                    loan.status === "ACTIVE" && daysUntil(loan.dueAt) < 0;
                  const liveFine = accruedFine(loan.dueAt);
                  return (
                    <tr key={loan.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <Link
                          href={`/catalog/${loan.book.id}`}
                          className="line-clamp-1 font-medium hover:text-primary"
                        >
                          {loan.book.title}
                        </Link>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {loan.book.author}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{loan.user.name}</p>
                        <p className="tabular text-xs text-muted-foreground">
                          {loan.user.membershipId}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="tabular">
                          {loan.status === "RETURNED"
                            ? loan.returnedAt
                              ? formatDate(loan.returnedAt)
                              : "—"
                            : formatDate(loan.dueAt)}
                        </p>
                        {loan.status === "ACTIVE" && (
                          <p className="text-xs text-muted-foreground">
                            {relativeDays(loan.dueAt)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {loan.status === "RETURNED" ? (
                          loan.fine ? (
                            <FineCell
                              amount={loan.fine.amount}
                              paid={loan.fine.paid}
                              id={loan.fine.id}
                            />
                          ) : (
                            <Badge tone="success">Returned</Badge>
                          )
                        ) : overdue ? (
                          <Badge tone="danger">
                            Overdue · {formatCurrency(liveFine)}
                          </Badge>
                        ) : (
                          <Badge tone="info">On time</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {loan.status === "ACTIVE" ? (
                          <form
                            action={returnLoanAction}
                            className="inline-flex"
                          >
                            <input
                              type="hidden"
                              name="loanId"
                              value={loan.id}
                            />
                            <SubmitButton
                              size="sm"
                              variant="outline"
                              pendingText="…"
                            >
                              Mark returned
                            </SubmitButton>
                          </form>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Closed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reservations */}
      <div className="mt-8">
        <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight">
          <BellRing className="size-5 text-accent" />
          Reservation queue
        </h2>
        {reservations.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-border bg-muted/30 px-5 py-8 text-center text-sm text-muted-foreground">
            No one is waiting on a title right now.
          </p>
        ) : (
          <Card className="mt-4">
            <ul className="divide-y divide-border">
              {reservations.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/catalog/${r.book.id}`}
                      className="line-clamp-1 font-medium hover:text-primary"
                    >
                      {r.book.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {r.user.name} · {r.user.membershipId} · since{" "}
                      {formatDate(r.reservedAt)}
                    </p>
                  </div>
                  {r.book.availableCopies > 0 ? (
                    <Badge tone="success">Copy available to issue</Badge>
                  ) : (
                    <Badge tone="warning">Awaiting a return</Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

function FineCell({
  amount,
  paid,
  id,
}: {
  amount: number;
  paid: boolean;
  id: string;
}) {
  if (paid) {
    return <Badge tone="neutral">Fine {formatCurrency(amount)} · paid</Badge>;
  }
  return (
    <form action={markFinePaidAction} className="inline-flex items-center gap-2">
      <input type="hidden" name="fineId" value={id} />
      <Badge tone="warning">Fine {formatCurrency(amount)}</Badge>
      <SubmitButton size="sm" variant="ghost" pendingText="…">
        Mark paid
      </SubmitButton>
    </form>
  );
}
