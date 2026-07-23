import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

type SeedBook = {
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  publisher: string;
  publishedYear: number;
  pageCount: number;
  coverHue: number;
  totalCopies: number;
};

const books: SeedBook[] = [
  {
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    isbn: "9780756404741",
    category: "Fiction",
    description:
      "The tale of Kvothe, a magically gifted young man who grows to be the most notorious wizard his world has ever seen, told in his own words.",
    publisher: "DAW Books",
    publishedYear: 2007,
    pageCount: 662,
    coverHue: 205,
    totalCopies: 4,
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    isbn: "9780062316097",
    category: "Non-Fiction",
    description:
      "A sweeping account of how an unremarkable ape came to rule the planet, from the cognitive revolution to the age of artificial intelligence.",
    publisher: "Harper",
    publishedYear: 2011,
    pageCount: 443,
    coverHue: 32,
    totalCopies: 3,
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "9780553380163",
    category: "Science",
    description:
      "From the Big Bang to black holes, a landmark exploration of the deepest questions about the origin and fate of the universe.",
    publisher: "Bantam",
    publishedYear: 1988,
    pageCount: 212,
    coverHue: 250,
    totalCopies: 2,
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt & David Thomas",
    isbn: "9780135957059",
    category: "Technology",
    description:
      "Timeless advice on the craft of software: pragmatic thinking, deliberate practice, and the habits that separate good coders from great ones.",
    publisher: "Addison-Wesley",
    publishedYear: 2019,
    pageCount: 352,
    coverHue: 150,
    totalCopies: 5,
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "9780132350884",
    category: "Technology",
    description:
      "A handbook of agile software craftsmanship that argues good code is a form of professional respect for those who read it next.",
    publisher: "Prentice Hall",
    publishedYear: 2008,
    pageCount: 464,
    coverHue: 8,
    totalCopies: 4,
  },
  {
    title: "Guns, Germs, and Steel",
    author: "Jared Diamond",
    isbn: "9780393317558",
    category: "History",
    description:
      "Why did history unfold so differently on different continents? A bold synthesis of geography, biology, and human society.",
    publisher: "W. W. Norton",
    publishedYear: 1997,
    pageCount: 480,
    coverHue: 40,
    totalCopies: 2,
  },
  {
    title: "Meditations",
    author: "Marcus Aurelius",
    isbn: "9780140449334",
    category: "Philosophy",
    description:
      "The private notebook of a Roman emperor, and one of the most enduring works of Stoic thought ever set down.",
    publisher: "Penguin Classics",
    publishedYear: 180,
    pageCount: 254,
    coverHue: 275,
    totalCopies: 3,
  },
  {
    title: "The Waste Land and Other Poems",
    author: "T. S. Eliot",
    isbn: "9780571097159",
    category: "Poetry",
    description:
      "The fragmented, allusive masterpiece that reshaped modern poetry, collected here with Eliot's other early work.",
    publisher: "Faber & Faber",
    publishedYear: 1922,
    pageCount: 88,
    coverHue: 320,
    totalCopies: 2,
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    isbn: "9781451648539",
    category: "Biography",
    description:
      "The definitive portrait of Apple's founder, drawn from more than forty interviews with a restless, brilliant, maddening visionary.",
    publisher: "Simon & Schuster",
    publishedYear: 2011,
    pageCount: 656,
    coverHue: 200,
    totalCopies: 3,
  },
  {
    title: "Where the Wild Things Are",
    author: "Maurice Sendak",
    isbn: "9780060254926",
    category: "Children",
    description:
      "Max sails off to the land of the Wild Things and is crowned their king, in one of the best-loved picture books ever made.",
    publisher: "Harper & Row",
    publishedYear: 1963,
    pageCount: 48,
    coverHue: 100,
    totalCopies: 5,
  },
  {
    title: "The Oxford English Dictionary (Concise)",
    author: "Oxford University Press",
    isbn: "9780199601080",
    category: "Reference",
    description:
      "The trusted single-volume reference to English words, meanings, and usage, revised for the modern reader.",
    publisher: "Oxford University Press",
    publishedYear: 2011,
    pageCount: 1728,
    coverHue: 220,
    totalCopies: 1,
  },
  {
    title: "Cosmos",
    author: "Carl Sagan",
    isbn: "9780345539434",
    category: "Science",
    description:
      "A luminous tour of the universe and our place within it, from the author who taught a generation to look up in wonder.",
    publisher: "Ballantine Books",
    publishedYear: 1980,
    pageCount: 396,
    coverHue: 235,
    totalCopies: 3,
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    isbn: "9780374533557",
    category: "Non-Fiction",
    description:
      "A Nobel laureate maps the two systems that drive the way we think — one fast and intuitive, the other slow and deliberate.",
    publisher: "Farrar, Straus and Giroux",
    publishedYear: 2011,
    pageCount: 499,
    coverHue: 18,
    totalCopies: 2,
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    isbn: "9780441013593",
    category: "Fiction",
    description:
      "On the desert planet Arrakis, a boy becomes the fulcrum of empire, prophecy, and ecology in the greatest of all science-fiction epics.",
    publisher: "Ace",
    publishedYear: 1965,
    pageCount: 688,
    coverHue: 34,
    totalCopies: 4,
  },
  {
    title: "The Republic",
    author: "Plato",
    isbn: "9780140455113",
    category: "Philosophy",
    description:
      "Plato's dialogue on justice, the ideal city, and the education of the soul — foundational to all of Western philosophy.",
    publisher: "Penguin Classics",
    publishedYear: -380,
    pageCount: 416,
    coverHue: 285,
    totalCopies: 2,
  },
  {
    title: "Introduction to Algorithms",
    author: "Cormen, Leiserson, Rivest & Stein",
    isbn: "9780262046305",
    category: "Technology",
    description:
      "The comprehensive, rigorous reference on algorithms used in classrooms and interviews the world over.",
    publisher: "MIT Press",
    publishedYear: 2022,
    pageCount: 1312,
    coverHue: 160,
    totalCopies: 3,
  },
  {
    title: "The Diary of a Young Girl",
    author: "Anne Frank",
    isbn: "9780553577129",
    category: "Biography",
    description:
      "The diary Anne Frank kept in hiding from 1942 to 1944 — a testament to hope written in the shadow of the Holocaust.",
    publisher: "Bantam",
    publishedYear: 1947,
    pageCount: 283,
    coverHue: 130,
    totalCopies: 3,
  },
  {
    title: "A People's History of the United States",
    author: "Howard Zinn",
    isbn: "9780062397348",
    category: "History",
    description:
      "American history told from the bottom up — through the eyes of workers, women, and the marginalised rather than presidents and generals.",
    publisher: "Harper Perennial",
    publishedYear: 1980,
    pageCount: 784,
    coverHue: 12,
    totalCopies: 2,
  },
  {
    title: "Leaves of Grass",
    author: "Walt Whitman",
    isbn: "9780140421996",
    category: "Poetry",
    description:
      "Whitman's expansive, ecstatic celebration of the self, democracy, and the American landscape.",
    publisher: "Penguin Classics",
    publishedYear: 1855,
    pageCount: 852,
    coverHue: 96,
    totalCopies: 2,
  },
  {
    title: "The Very Hungry Caterpillar",
    author: "Eric Carle",
    isbn: "9780399226908",
    category: "Children",
    description:
      "A tiny caterpillar eats its way through the week and into a beautiful surprise, in Eric Carle's collage-bright classic.",
    publisher: "Philomel Books",
    publishedYear: 1969,
    pageCount: 32,
    coverHue: 78,
    totalCopies: 6,
  },
  {
    title: "Educated",
    author: "Tara Westover",
    isbn: "9780399590504",
    category: "Non-Fiction",
    description:
      "A memoir of a girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge.",
    publisher: "Random House",
    publishedYear: 2018,
    pageCount: 334,
    coverHue: 210,
    totalCopies: 3,
  },
  {
    title: "The Selfish Gene",
    author: "Richard Dawkins",
    isbn: "9780198788607",
    category: "Science",
    description:
      "The book that reframed evolution around the gene, and gave the world the idea of the meme.",
    publisher: "Oxford University Press",
    publishedYear: 1976,
    pageCount: 496,
    coverHue: 172,
    totalCopies: 2,
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    category: "Fiction",
    description:
      "In a world of perpetual surveillance and rewritten history, one man dares to think for himself. Orwell's warning has never felt closer.",
    publisher: "Signet Classic",
    publishedYear: 1949,
    pageCount: 328,
    coverHue: 4,
    totalCopies: 4,
  },
  {
    title: "Merriam-Webster's Collegiate Dictionary",
    author: "Merriam-Webster",
    isbn: "9780877798095",
    category: "Reference",
    description:
      "The best-selling desk dictionary in America, with concise definitions, pronunciations, and word histories.",
    publisher: "Merriam-Webster",
    publishedYear: 2003,
    pageCount: 1664,
    coverHue: 8,
    totalCopies: 1,
  },
];

async function main() {
  console.log("Seeding The Library…");

  // Start from a clean slate so re-seeding is deterministic.
  await prisma.fine.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  const librarian = await prisma.user.create({
    data: {
      name: "Eleanor Vance",
      email: "librarian@thelibrary.app",
      passwordHash: await bcrypt.hash("librarian123", 10),
      role: "LIBRARIAN",
      membershipId: "STAFF-0001",
    },
  });

  const memberSeeds = [
    { name: "Arjun Mehta", email: "arjun@example.com" },
    { name: "Priya Nair", email: "priya@example.com" },
    { name: "Sam Whitfield", email: "sam@example.com" },
    { name: "Lena Fischer", email: "lena@example.com" },
  ];

  const members = [];
  for (let i = 0; i < memberSeeds.length; i++) {
    const m = memberSeeds[i]!;
    members.push(
      await prisma.user.create({
        data: {
          name: m.name,
          email: m.email,
          passwordHash: await bcrypt.hash("member123", 10),
          role: "MEMBER",
          membershipId: `LIB-${String(i + 1).padStart(5, "0")}`,
        },
      }),
    );
  }

  const createdBooks = [];
  for (const b of books) {
    createdBooks.push(
      await prisma.book.create({
        data: { ...b, availableCopies: b.totalCopies },
      }),
    );
  }

  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();

  // A healthy on-time loan.
  await lend(createdBooks[0]!.id, members[0]!.id, now - 3 * day, now + 11 * day);
  // An overdue loan (fine accruing).
  await lend(createdBooks[4]!.id, members[1]!.id, now - 20 * day, now - 6 * day);
  // Another active loan due soon.
  await lend(createdBooks[13]!.id, members[2]!.id, now - 12 * day, now + 2 * day);
  // A returned loan that came back late — leaves a paid fine on record.
  const late = await lend(
    createdBooks[3]!.id,
    members[0]!.id,
    now - 30 * day,
    now - 16 * day,
  );
  await prisma.loan.update({
    where: { id: late.id },
    data: { status: "RETURNED", returnedAt: new Date(now - 12 * day) },
  });
  await prisma.book.update({
    where: { id: createdBooks[3]!.id },
    data: { availableCopies: { increment: 1 } },
  });
  await prisma.fine.create({
    data: {
      loanId: late.id,
      userId: members[0]!.id,
      amount: 4 * 200,
      paid: true,
    },
  });

  // A couple of members waiting on titles.
  await prisma.reservation.create({
    data: { bookId: createdBooks[2]!.id, userId: members[3]!.id },
  });
  await prisma.reservation.create({
    data: { bookId: createdBooks[13]!.id, userId: members[1]!.id },
  });

  console.log(
    `Done. ${createdBooks.length} titles, ${members.length} members, 1 librarian.`,
  );
  console.log("Staff login:  librarian@thelibrary.app / librarian123");
  console.log("Member login: arjun@example.com / member123");

  async function lend(
    bookId: string,
    userId: string,
    borrowedAt: number,
    dueAt: number,
  ) {
    const loan = await prisma.loan.create({
      data: {
        bookId,
        userId,
        borrowedAt: new Date(borrowedAt),
        dueAt: new Date(dueAt),
      },
    });
    await prisma.book.update({
      where: { id: bookId },
      data: { availableCopies: { decrement: 1 } },
    });
    return loan;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
