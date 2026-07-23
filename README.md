# The Library

A library management system with two sides to it: a public catalogue where members
browse, borrow and reserve books, and a staff desk where librarians handle circulation,
fines, reservations and the collection itself.

Built with the Next.js App Router, Prisma over SQLite, and Tailwind. Book covers are
generated from a stored hue rather than uploaded, so the whole thing runs from a single
seed with no external assets.

## Features

**For members**
- Browse and search the catalogue by title, author or ISBN, filter by subject, and see
  what's on the shelf right now
- Borrow available books (up to five at a time, due back in 14 days)
- Reserve a title that's out and join the waiting list
- A personal shelf showing current loans, due dates, reservations, fines and reading history

**For staff**
- A dashboard with the day's numbers: titles, active loans, overdue books, reservations
  and uncollected fines
- Issue and return books from the circulation desk
- Overdue fines calculated automatically on return (₹2 per day) and marked paid when settled
- Add, edit and remove catalogue records, with copy counts kept in step with what's on loan
- A members list and a live reservation queue

## Tech stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **Prisma 7** with a better-sqlite3 driver adapter
- **Tailwind CSS v4** with a warm, print-inspired theme and full light/dark support
- **TypeScript** throughout
- Cookie-based sessions signed with HMAC; passwords hashed with bcrypt

## Getting started

```bash
cp .env.example .env  # then set SESSION_SECRET
npm install           # also generates the Prisma client
npm run db:migrate    # create the SQLite database
npm run db:seed       # load the demo catalogue and accounts
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Role      | Email                      | Password      |
| --------- | -------------------------- | ------------- |
| Librarian | librarian@thelibrary.app   | librarian123  |
| Member    | arjun@example.com          | member123     |

New members can also sign up from the join page.

## Scripts

| Command            | What it does                                  |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Start the dev server                          |
| `npm run build`    | Generate the Prisma client and build for prod |
| `npm run db:seed`  | Seed the database with demo data              |
| `npm run db:reset` | Drop, re-migrate and re-seed the database     |

## Project layout

```
prisma/            schema, migrations and the seed script
src/app/(site)/    public pages: home, catalogue, book detail, account, auth
src/app/admin/     staff area: dashboard, circulation, catalogue, members
src/lib/           db client, auth, data queries and server actions
src/components/    UI primitives and feature components
```

## Deploying

Set two environment variables in your host:

- `SESSION_SECRET` — used to sign session cookies. Generate one with `openssl rand -hex 32`.
  A development fallback is used if it isn't set, so a real value matters before going public.
- `DATABASE_URL` — the SQLite connection string. Note that SQLite lives on the local
  filesystem, which is fine for a single instance or a persistent disk. On platforms with
  an ephemeral or read-only filesystem, point this at a hosted database (for example a
  Postgres or libSQL/Turso provider) and switch the Prisma datasource accordingly.

Run `npm run build`, which generates the Prisma client and builds the app, then `npm run start`.

## Notes

- `.env.example` lists the environment variables; copy it to `.env` to get going.
- The seed script (`npm run db:seed`) resets the tables before loading, so it's safe to
  re-run whenever you want the demo data back.
