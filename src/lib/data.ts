import "server-only";
import { prisma } from "@/lib/db";
import { FINE_PER_DAY_PAISE, LOAN_STATUS } from "@/lib/constants";

export type BookSort = "title" | "recent" | "author";

export interface CatalogFilters {
  query?: string;
  category?: string;
  availability?: "all" | "available";
  sort?: BookSort;
}

export async function getBooks(filters: CatalogFilters = {}) {
  const { query, category, availability, sort = "title" } = filters;

  const orderBy =
    sort === "recent"
      ? { createdAt: "desc" as const }
      : sort === "author"
        ? { author: "asc" as const }
        : { title: "asc" as const };

  return prisma.book.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(availability === "available" ? { availableCopies: { gt: 0 } } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { author: { contains: query } },
              { isbn: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy,
  });
}

export function getBookById(id: string) {
  return prisma.book.findUnique({ where: { id } });
}

export async function getCategoryCounts() {
  const grouped = await prisma.book.groupBy({
    by: ["category"],
    _count: { _all: true },
  });
  return grouped
    .map((g) => ({ category: g.category, count: g._count._all }))
    .sort((a, b) => b.count - a.count);
}

/** Fine that has accrued so far on a still-open loan. */
export function accruedFine(dueAt: Date, now = new Date()): number {
  const overdueMs = now.getTime() - new Date(dueAt).getTime();
  if (overdueMs <= 0) return 0;
  const days = Math.ceil(overdueMs / (1000 * 60 * 60 * 24));
  return days * FINE_PER_DAY_PAISE;
}

export async function getMemberOverview(userId: string) {
  const [activeLoans, reservations, fines] = await Promise.all([
    prisma.loan.findMany({
      where: { userId, status: LOAN_STATUS.ACTIVE },
      include: { book: true },
      orderBy: { dueAt: "asc" },
    }),
    prisma.reservation.findMany({
      where: { userId, status: "PENDING" },
      include: { book: true },
      orderBy: { reservedAt: "desc" },
    }),
    prisma.fine.findMany({
      where: { userId },
      include: { loan: { include: { book: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const history = await prisma.loan.findMany({
    where: { userId, status: LOAN_STATUS.RETURNED },
    include: { book: true },
    orderBy: { returnedAt: "desc" },
    take: 12,
  });

  const unpaidFines = fines
    .filter((f) => !f.paid)
    .reduce((sum, f) => sum + f.amount, 0);

  return { activeLoans, reservations, fines, history, unpaidFines };
}

export async function getMemberActiveLoanCount(userId: string) {
  return prisma.loan.count({
    where: { userId, status: LOAN_STATUS.ACTIVE },
  });
}

export async function getAdminStats() {
  const now = new Date();
  const [books, copies, members, activeLoans, overdue, fineAgg, pendingRes] =
    await Promise.all([
      prisma.book.count(),
      prisma.book.aggregate({ _sum: { totalCopies: true } }),
      prisma.user.count({ where: { role: "MEMBER" } }),
      prisma.loan.count({ where: { status: LOAN_STATUS.ACTIVE } }),
      prisma.loan.count({
        where: { status: LOAN_STATUS.ACTIVE, dueAt: { lt: now } },
      }),
      prisma.fine.aggregate({
        where: { paid: false },
        _sum: { amount: true },
      }),
      prisma.reservation.count({ where: { status: "PENDING" } }),
    ]);

  return {
    titles: books,
    copies: copies._sum.totalCopies ?? 0,
    members,
    activeLoans,
    overdue,
    outstandingFines: fineAgg._sum.amount ?? 0,
    pendingReservations: pendingRes,
  };
}

export async function getRecentLoans(limit = 8) {
  return prisma.loan.findMany({
    include: { book: true, user: true },
    orderBy: { borrowedAt: "desc" },
    take: limit,
  });
}

export async function getLoans(status?: "active" | "overdue" | "returned") {
  const now = new Date();
  const where =
    status === "active"
      ? { status: LOAN_STATUS.ACTIVE }
      : status === "overdue"
        ? { status: LOAN_STATUS.ACTIVE, dueAt: { lt: now } }
        : status === "returned"
          ? { status: LOAN_STATUS.RETURNED }
          : {};
  return prisma.loan.findMany({
    where,
    include: { book: true, user: true, fine: true },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }],
  });
}

export async function getMembers() {
  return prisma.user.findMany({
    where: { role: "MEMBER" },
    include: {
      _count: { select: { loans: true } },
      loans: { where: { status: LOAN_STATUS.ACTIVE }, select: { id: true } },
      fines: { where: { paid: false }, select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingReservations() {
  return prisma.reservation.findMany({
    where: { status: "PENDING" },
    include: { book: true, user: true },
    orderBy: { reservedAt: "asc" },
  });
}

/** Members for the "issue a book" picker on the staff desk. */
export async function getMemberOptions() {
  return prisma.user.findMany({
    where: { role: "MEMBER" },
    select: { id: true, name: true, membershipId: true },
    orderBy: { name: "asc" },
  });
}
