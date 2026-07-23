// Domain constants for The Library.

export const ROLES = {
  MEMBER: "MEMBER",
  LIBRARIAN: "LIBRARIAN",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const LOAN_STATUS = {
  ACTIVE: "ACTIVE",
  RETURNED: "RETURNED",
} as const;

export const RESERVATION_STATUS = {
  PENDING: "PENDING",
  FULFILLED: "FULFILLED",
  CANCELLED: "CANCELLED",
} as const;

/** Days a member may keep a book before it is overdue. */
export const LOAN_PERIOD_DAYS = 14;

/** Fine charged per day a book is overdue, in paise (₹2.00 / day). */
export const FINE_PER_DAY_PAISE = 200;

/** Maximum books a single member may have on loan at once. */
export const MAX_ACTIVE_LOANS = 5;

export const CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "History",
  "Philosophy",
  "Poetry",
  "Biography",
  "Children",
  "Reference",
] as const;
export type Category = (typeof CATEGORIES)[number];
