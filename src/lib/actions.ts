"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  isLibrarian,
  verifyPassword,
} from "@/lib/auth";
import { accruedFine, getMemberActiveLoanCount } from "@/lib/data";
import {
  createOrder,
  isRazorpayConfigured,
  razorpayKeyId,
  verifySignature,
} from "@/lib/razorpay";
import {
  LOAN_PERIOD_DAYS,
  LOAN_STATUS,
  MAX_ACTIVE_LOANS,
  ROLES,
} from "@/lib/constants";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function nextMembershipId(): Promise<string> {
  const count = await prisma.user.count({ where: { role: ROLES.MEMBER } });
  return `LIB-${String(count + 1).padStart(5, "0")}`;
}

// ── Authentication ──────────────────────────────────────────────────────

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Please enter your full name.";
  if (!emailRe.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (password.length < 8)
    fieldErrors.password = "Use at least 8 characters.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return { fieldErrors: { email: "An account with this email exists." } };

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: ROLES.MEMBER,
      membershipId: await nextMembershipId(),
    },
  });

  await createSession(user.id);
  redirect("/account");
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password)
    return { error: "Enter your email and password." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Those credentials don't match our records." };
  }

  await createSession(user.id);
  redirect(user.role === ROLES.LIBRARIAN ? "/admin" : "/account");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

// ── Member circulation ──────────────────────────────────────────────────

export async function borrowAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const bookId = String(formData.get("bookId") ?? "");

  await issueLoan(bookId, user.id);
  revalidatePath(`/catalog/${bookId}`);
  revalidatePath("/account");
}

export async function reserveAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const bookId = String(formData.get("bookId") ?? "");

  const existing = await prisma.reservation.findFirst({
    where: { bookId, userId: user.id, status: "PENDING" },
  });
  if (!existing) {
    await prisma.reservation.create({ data: { bookId, userId: user.id } });
  }
  revalidatePath(`/catalog/${bookId}`);
  revalidatePath("/account");
}

export async function cancelReservationAction(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = String(formData.get("reservationId") ?? "");
  await prisma.reservation.updateMany({
    where: { id, userId: user.id, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/account");
}

export type FineOrder =
  | { status: "settled" }
  | {
      status: "ready";
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
      name: string;
      description: string;
      prefill: { name: string; email: string };
    }
  | { status: "error"; message: string };

/**
 * Opens a Razorpay order (test mode) for a member's fine. When no Razorpay key
 * is configured the fine is settled directly, so the demo still works.
 */
export async function createFineOrder(fineId: string): Promise<FineOrder> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Please sign in again." };

  const fine = await prisma.fine.findFirst({
    where: { id: fineId, userId: user.id, paid: false },
    include: { loan: { include: { book: true } } },
  });
  if (!fine) return { status: "error", message: "Fine not found." };

  if (!isRazorpayConfigured()) {
    await prisma.fine.update({
      where: { id: fine.id },
      data: { paid: true, paidAt: new Date(), paymentMethod: "RAZORPAY" },
    });
    revalidatePath("/account");
    return { status: "settled" };
  }

  const order = await createOrder({
    amount: fine.amount, // already in paise
    receipt: `fine_${fine.id}`.slice(0, 40),
    notes: { fineId: fine.id, userId: user.id },
  });

  return {
    status: "ready",
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: razorpayKeyId(),
    name: "The Library",
    description: `Fine for ${fine.loan.book.title}`,
    prefill: { name: user.name, email: user.email },
  };
}

/** Verifies a Razorpay payment and marks the fine settled. */
export async function settleFinePayment(input: {
  fineId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  if (!verifySignature(input.orderId, input.paymentId, input.signature)) {
    return { ok: false };
  }
  await prisma.fine.updateMany({
    where: { id: input.fineId, userId: user.id },
    data: {
      paid: true,
      paidAt: new Date(),
      paymentMethod: "RAZORPAY",
      razorpayPaymentId: input.paymentId,
    },
  });
  revalidatePath("/account");
  return { ok: true };
}

// ── Shared circulation logic ────────────────────────────────────────────

/** Issues one copy of a book to a member inside a transaction. */
async function issueLoan(bookId: string, userId: string): Promise<void> {
  const activeCount = await getMemberActiveLoanCount(userId);
  if (activeCount >= MAX_ACTIVE_LOANS) {
    throw new Error(`Loan limit of ${MAX_ACTIVE_LOANS} books reached.`);
  }

  await prisma.$transaction(async (tx) => {
    const book = await tx.book.findUnique({ where: { id: bookId } });
    if (!book) throw new Error("Book not found.");
    if (book.availableCopies < 1) throw new Error("No copies available.");

    await tx.book.update({
      where: { id: bookId },
      data: { availableCopies: { decrement: 1 } },
    });
    await tx.loan.create({
      data: {
        bookId,
        userId,
        dueAt: addDays(new Date(), LOAN_PERIOD_DAYS),
      },
    });
    // A member borrowing satisfies their own pending reservation.
    await tx.reservation.updateMany({
      where: { bookId, userId, status: "PENDING" },
      data: { status: "FULFILLED" },
    });
  });
}

// ── Staff operations ────────────────────────────────────────────────────

async function requireLibrarian() {
  const user = await getCurrentUser();
  if (!isLibrarian(user)) redirect("/login");
  return user!;
}

export async function issueLoanAction(formData: FormData): Promise<void> {
  await requireLibrarian();
  const bookId = String(formData.get("bookId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!bookId || !userId) return;
  await issueLoan(bookId, userId);
  revalidatePath("/admin/circulation");
  revalidatePath("/admin");
}

export async function returnLoanAction(formData: FormData): Promise<void> {
  await requireLibrarian();
  const loanId = String(formData.get("loanId") ?? "");

  await prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({ where: { id: loanId } });
    if (!loan || loan.status === LOAN_STATUS.RETURNED) return;

    const now = new Date();
    await tx.loan.update({
      where: { id: loanId },
      data: { status: LOAN_STATUS.RETURNED, returnedAt: now },
    });
    await tx.book.update({
      where: { id: loan.bookId },
      data: { availableCopies: { increment: 1 } },
    });

    const fine = accruedFine(loan.dueAt, now);
    if (fine > 0) {
      await tx.fine.create({
        data: { loanId: loan.id, userId: loan.userId, amount: fine },
      });
    }
    // Hand the returned copy to the next member waiting in line.
    const nextRes = await tx.reservation.findFirst({
      where: { bookId: loan.bookId, status: "PENDING" },
      orderBy: { reservedAt: "asc" },
    });
    if (nextRes) {
      await tx.reservation.update({
        where: { id: nextRes.id },
        data: { status: "FULFILLED" },
      });
    }
  });

  revalidatePath("/admin/circulation");
  revalidatePath("/admin");
}

export async function markFinePaidAction(formData: FormData): Promise<void> {
  await requireLibrarian();
  const id = String(formData.get("fineId") ?? "");
  await prisma.fine.update({
    where: { id },
    data: { paid: true, paidAt: new Date(), paymentMethod: "DESK" },
  });
  revalidatePath("/admin/circulation");
  revalidatePath("/admin/members");
}

// ── Catalogue management ────────────────────────────────────────────────

function parseBookForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const isbn = String(formData.get("isbn") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const publisher = String(formData.get("publisher") ?? "").trim();
  const publishedYear = Number(formData.get("publishedYear")) || null;
  const pageCount = Number(formData.get("pageCount")) || null;
  const totalCopies = Math.max(1, Number(formData.get("totalCopies")) || 1);
  const coverHue = Math.min(
    360,
    Math.max(0, Number(formData.get("coverHue")) || 150),
  );

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Title is required.";
  if (!author) fieldErrors.author = "Author is required.";
  if (!isbn) fieldErrors.isbn = "ISBN is required.";
  if (!category) fieldErrors.category = "Choose a category.";
  if (!description) fieldErrors.description = "Add a short description.";

  return {
    data: {
      title,
      author,
      isbn,
      category,
      description,
      publisher: publisher || null,
      publishedYear,
      pageCount,
      totalCopies,
      coverHue,
    },
    fieldErrors,
  };
}

export async function createBookAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireLibrarian();
  const { data, fieldErrors } = parseBookForm(formData);
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const clash = await prisma.book.findUnique({ where: { isbn: data.isbn } });
  if (clash)
    return { fieldErrors: { isbn: "A book with this ISBN already exists." } };

  await prisma.book.create({
    data: { ...data, availableCopies: data.totalCopies },
  });
  revalidatePath("/admin/books");
  revalidatePath("/catalog");
  redirect("/admin/books?added=1");
}

export async function updateBookAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireLibrarian();
  const id = String(formData.get("id") ?? "");
  const { data, fieldErrors } = parseBookForm(formData);
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const current = await prisma.book.findUnique({ where: { id } });
  if (!current) return { error: "Book not found." };

  // Keep available copies in step with any change to the total.
  const onLoan = current.totalCopies - current.availableCopies;
  const availableCopies = Math.max(0, data.totalCopies - onLoan);

  await prisma.book.update({
    where: { id },
    data: { ...data, availableCopies },
  });
  revalidatePath("/admin/books");
  revalidatePath(`/catalog/${id}`);
  redirect("/admin/books?updated=1");
}

export async function deleteBookAction(formData: FormData): Promise<void> {
  await requireLibrarian();
  const id = String(formData.get("id") ?? "");
  const active = await prisma.loan.count({
    where: { bookId: id, status: LOAN_STATUS.ACTIVE },
  });
  if (active === 0) {
    await prisma.book.delete({ where: { id } });
  }
  revalidatePath("/admin/books");
  revalidatePath("/catalog");
}
