import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookCopy,
  ArrowLeftRight,
  Users,
  TriangleAlert,
  IndianRupee,
  BellRing,
  Clock,
} from "lucide-react";
import {
  getAdminStats,
  getLoans,
  getRecentLoans,
  accruedFine,
} from "@/lib/data";
import { returnLoanAction } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";
import { formatCurrency, formatDate, relativeDays, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const [stats, overdue, recent] = await Promise.all([
    getAdminStats(),
    getLoans("overdue"),
    getRecentLoans(6),
  ]);

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Staff desk
          </h1>
          <p className="mt-1 text-muted-foreground">
            The state of the library at a glance.
          </p>
        </div>
        <Link
          href="/admin/books/new"
          className="text-sm font-medium text-primary hover:underline"
        >
          + Add a book
        </Link>
      </header>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat
          icon={<BookCopy />}
          label="Titles"
          value={stats.titles}
          sub={`${stats.copies} copies`}
          href="/admin/books"
        />
        <Stat
          icon={<ArrowLeftRight />}
          label="On loan"
          value={stats.activeLoans}
          sub="active loans"
          href="/admin/circulation"
        />
        <Stat
          icon={<Users />}
          label="Members"
          value={stats.members}
          sub="registered"
          href="/admin/members"
        />
        <Stat
          icon={<TriangleAlert />}
          label="Overdue"
          value={stats.overdue}
          sub="need chasing"
          tone="danger"
          href="/admin/circulation?status=overdue"
        />
        <Stat
          icon={<BellRing />}
          label="Reservations"
          value={stats.pendingReservations}
          sub="waiting"
          tone="accent"
          href="/admin/circulation"
        />
        <Stat
          icon={<IndianRupee />}
          label="Fines due"
          value={formatCurrency(stats.outstandingFines)}
          sub="uncollected"
          tone="warning"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Overdue */}
        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <TriangleAlert className="size-4.5 text-destructive" />
              Overdue books
            </h2>
            <Link
              href="/admin/circulation?status=overdue"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </div>
          {overdue.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              Nothing overdue. The shelves are in good order.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {overdue.slice(0, 5).map((loan) => (
                <li
                  key={loan.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-medium">
                      {loan.book.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {loan.user.name} · due {relativeDays(loan.dueAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="danger">
                      {formatCurrency(accruedFine(loan.dueAt))}
                    </Badge>
                    <form action={returnLoanAction}>
                      <input type="hidden" name="loanId" value={loan.id} />
                      <SubmitButton size="sm" variant="outline" pendingText="…">
                        Return
                      </SubmitButton>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent activity */}
        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <Clock className="size-4.5 text-primary" />
              Recent activity
            </h2>
            <Link
              href="/admin/circulation"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Circulation
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recent.map((loan) => (
              <li key={loan.id} className="flex items-center gap-3 px-5 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                  {initials(loan.user.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm">
                    <span className="font-medium">{loan.user.name}</span>{" "}
                    <span className="text-muted-foreground">
                      {loan.status === "RETURNED" ? "returned" : "borrowed"}
                    </span>{" "}
                    {loan.book.title}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(loan.borrowedAt)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/circulation"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Go to the circulation desk to issue and return books{" "}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  tone = "primary",
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  tone?: "primary" | "danger" | "warning" | "accent";
  href?: string;
}) {
  const toneClass = {
    primary: "text-primary",
    danger: "text-destructive",
    warning: "text-warning",
    accent: "text-accent",
  }[tone];

  const body = (
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex size-9 items-center justify-center rounded bg-muted [&_svg]:size-4.5 ${toneClass}`}
        >
          {icon}
        </span>
        {href && (
          <ArrowRight className="size-4 text-muted-foreground/50" />
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tabular">{value}</p>
      <p className="text-sm text-muted-foreground">
        {label} · {sub}
      </p>
    </CardContent>
  );

  return href ? (
    <Card className="transition-colors hover:border-primary/40">
      <Link href={href}>{body}</Link>
    </Card>
  ) : (
    <Card>{body}</Card>
  );
}
