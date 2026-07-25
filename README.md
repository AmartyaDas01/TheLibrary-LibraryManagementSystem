# The Library

A library management system with two sides to it. Members get a public catalogue to
browse, borrow and reserve books. Librarians get a staff desk for circulation, fines,
reservations and the collection itself.

Live demo: https://library-management-system-omega-rosy.vercel.app

Built with the Next.js App Router, Prisma on Postgres, and Tailwind. Book covers are
generated from a stored colour value instead of uploaded images, so the whole app runs
from a single seed with no external assets.

> The demo runs on a free database that sleeps when idle, so the first request after a
> while can take a few seconds to wake up.

## Features

For members:

- Search the catalogue by title, author or ISBN, filter by subject, and see what's on
  the shelf right now
- Borrow available books (up to five at a time, due back in 14 days)
- Reserve a title that's out and join the waiting list
- A personal shelf with current loans, due dates, reservations, fines and past borrows

For staff:

- A dashboard with the day's numbers: titles, active loans, overdue books, reservations
  and unpaid fines
- Issue and return books from the circulation desk
- Overdue fines worked out automatically on return (₹2 per day) and marked paid once settled
- Add, edit and remove catalogue records, with copy counts kept in step with what's on loan
- A members list and a live reservation queue

## Tech stack

- Next.js 16 (App Router, Server Components, Server Actions)
- Prisma 7 with the `pg` driver adapter, talking to Postgres
- Tailwind CSS v4 with a warm, print-inspired theme and light and dark modes
- TypeScript throughout
- Cookie sessions signed with HMAC, passwords hashed with bcrypt

## Getting started

You'll need a Postgres database. A free [Neon](https://neon.tech) project works well, or
run Postgres locally.

```bash
cp .env.example .env   # set DATABASE_URL and SESSION_SECRET
npm install            # also generates the Prisma client
npm run db:push        # create the tables
npm run db:seed        # load the demo catalogue and accounts
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Demo accounts

| Role      | Email                    | Password     |
| --------- | ------------------------ | ------------ |
| Librarian | librarian@thelibrary.app | librarian123 |
| Member    | arjun@example.com        | member123    |

Anyone can also sign up for a member account from the join page.

## Scripts

| Command            | What it does                              |
| ------------------ | ----------------------------------------- |
| `npm run dev`      | Start the dev server                      |
| `npm run build`    | Generate the Prisma client and build      |
| `npm run db:push`  | Sync the schema to the database           |
| `npm run db:seed`  | Load demo data (resets the tables first)  |
| `npm run db:reset` | Wipe, recreate and reseed the database    |

## Project layout

```
prisma/            schema and the seed script
src/app/(site)/    public pages: home, catalogue, book detail, account, auth
src/app/admin/     staff area: dashboard, circulation, catalogue, members
src/lib/           db client, auth, data queries and server actions
src/components/    UI primitives and feature components
```

## Deploying

The app is set up for Vercel with a Postgres database (the demo uses Neon). Set these
environment variables on the project:

- `DATABASE_URL` is the Postgres connection string. Use the pooled one for the app at
  runtime.
- `SESSION_SECRET` signs the session cookies. Generate one with `openssl rand -hex 32`.
  There's a development fallback, so set a real value before going public.

Two things worth knowing if you deploy elsewhere:

- Neon connection strings include `channel_binding=require`, which the `pg` driver can't
  negotiate and will hang on. `src/lib/db.ts` strips that parameter at runtime, so leave
  it in place.
- The catalogue and account pages read live data and the session cookie, so they render
  per request. That's why the build never needs a database connection.

Run `npm run db:push` once against your database to create the tables, then deploy.

## Notes

`.env.example` lists the environment variables. Copy it to `.env` to get going. The seed
script clears the tables before loading, so you can re-run it whenever you want the demo
data back.
