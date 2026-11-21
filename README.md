# 🎟 Ticz: Event Ticketing for Community Events

Ticz lets **any organizer** create an event in a couple of minutes, share a booking link, and check attendees in at the door. **Attendees** book in three steps with no account and get a personalised ticket with their photo, a unique reference and a QR code.

Built with **Next.js 16 (App Router)**, **React 19**, **Postgres + Drizzle ORM**, **Tailwind CSS**, **react-hook-form + zod** and **Cloudinary**.

## Features

**For organizers**

- **Create unlimited events**, each with its own name, venue, date & time zone, currency (USD, NGN, GHS, KES, XAF, XOF, EUR…), and brand color.
- **Ticket types**: up to 6 per event, free or paid, each with its own capacity. Booked seats are protected when editing.
- **Booking options**: require a photo (anti-resale) or not, ask a custom question, limit tickets per booking.
- **No accounts:** you get a public booking link plus a private manage link. Open the manage link on any device to unlock the dashboard.
- **Dashboard**: live seat counts per ticket type, an attendee list with search, **door check-in** (shows the attendee's photo, flags reused tickets), and CSV export.
- **Visibility**: list the event publicly or keep it link-only, and open or close bookings.

**For attendees**

- Browse upcoming events, or open an organizer's link.
- Never lose progress: choices are saved on the device as you type.
- Photo upload with drag & drop, validated and resized in the browser.
- Tickets are issued by the server, so **spots left are real and can't be oversold**.
- 3× PNG download; **My Tickets** keeps every ticket on the device, offline too.

## Getting started

Requires Node.js 22.12+. **No database to install**: locally the app uses an embedded Postgres (PGlite) in `.data/`, migrated and seeded with two demo events on first start.

```bash
npm install
npm run dev        # http://localhost:3000
```

On first start the terminal prints the **organizer links** for the demo events (also saved in `.data/demo-manage-links.txt`). Open one to see the dashboard, or create your own event at `/manage/new`.

> The embedded database allows one process at a time. Stop `npm run dev` before running `npm start` (and vice versa). To reset local data, delete `.data/`.

| Script                        | What it does                                               |
| ----------------------------- | ---------------------------------------------------------- |
| `npm run dev`                 | Development server                                         |
| `npm run build` / `npm start` | Production build / serve                                   |
| `npm run lint`                | ESLint (Next core-web-vitals + React Compiler rules)       |
| `npm test`                    | Unit + database tests (Vitest, in-memory Postgres)         |
| `npm run test:e2e`            | Browser tests (Playwright); run `npm run build` first      |
| `npm run check`               | Lint + tests + build; run before pushing                   |
| `npm run format`              | Prettier                                                   |
| `npm run db:generate`         | Create a migration after editing `lib/server/db/schema.js` |
| `npm run db:migrate`          | Apply migrations to `DATABASE_URL`                         |

First time running the browser tests: `npx playwright install chromium` (or set `PLAYWRIGHT_CHROMIUM_PATH` to an installed Chromium). CI (`.github/workflows/ci.yml`) runs lint, unit tests, build and browser tests on every pull request.

## Deploying (Vercel + Supabase)

1. Create a Supabase project and copy two connection strings from **Connect**: the **Transaction pooler** (port 6543) and the **Session pooler** (port 5432). Add `?sslmode=require` to both.
2. In Vercel, set `DATABASE_URL` (transaction pooler) and `DATABASE_DIRECT_URL` (session pooler) for Production and Preview, plus `NEXT_PUBLIC_SITE_URL`.
3. Deploy. The `vercel-build` script runs `db:migrate` (over the session pooler) and then `next build`.

Any other Postgres works too (Neon, RDS…): set `DATABASE_URL`, and `DATABASE_DIRECT_URL` only if your provider uses a pooler.

Tables have Row Level Security enabled with no policies. The app connects as the table owner and isn't affected; Supabase's auto-generated REST API gets no access.

### Environment variables

Public defaults live in the committed `.env`. Secrets go in `.env.local` locally (see `.env.example`) and in your hosting provider's settings.

| Variable                               | Purpose                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                         | Postgres connection string used by the app. **Required in production**; unset = embedded DB |
| `DATABASE_DIRECT_URL`                  | Connection used by migrations (Supabase session pooler). Defaults to `DATABASE_URL`         |
| `NEXT_PUBLIC_SITE_URL`                 | Public URL, used for Open Graph links                                                       |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`    | Cloudinary account for attendee photos                                                      |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset (public; sign uploads server-side before launch)                     |

## Architecture

```
app/                      Routes (thin server components)
  page.js                   public events list
  events/[slug]/            booking: step 1 (tickets) → details/ (attendee), themed per event
  tickets/[code]/           a ticket (step 3 after booking)
  my-tickets/               tickets saved on this device
  manage/                   organizer: your events, new/, [slug]/ dashboard, edit/,
                            access/[token] (manage link), attendees.csv (export)
components/
  ui/                       primitives and form fields (TextField, SelectField, CheckboxField…)
  layout/  booking/  ticket/  events/  manage/
config/                   event options, site routes, upload settings, theme.cjs (palette)
lib/                      Framework-free logic, unit-tested
  booking-schema.js         per-event booking rules (shared by form + server)
  event-schema.js           organizer form rules (shared by form + server)
  events.js                 seat totals, tier selection, price summary, availability
  ticket-store.js           device storage: drafts per event + ticket snapshots
  money.js  timezone.js  color.js  slug.js  csv.js  ticket-id.js  upload-avatar.js
  server/
    db/                     schema, connection (Postgres or embedded PGlite), demo seed
    repo/                   all queries: events, bookings, check-in, mappers, tokens
    actions.js              Server Actions: book, create/update event, check in
    manage-auth.js          manage-link cookie checks
drizzle/                  SQL migrations
e2e/                      Playwright browser tests
```

**Key design points**

- **Overselling is impossible:** a booking reserves seats with one conditional `UPDATE … WHERE sold + n <= capacity`, and the database also enforces a `CHECK (sold <= capacity)` constraint.
- **One schema, two places:** the same zod schema validates the browser form and is re-checked in the server action.
- **Money is stored in integer minor units**, with the right number of decimals per currency (XAF and XOF have none).
- **Dates are stored as UTC instants** and always shown in the event's own time zone.
- **Organizer access** is a 192-bit secret, stored only as a SHA-256 hash. The manage link moves it into an httpOnly cookie and drops it from the URL.

## License

[MIT](LICENSE) © MAGENE Sem Joel
