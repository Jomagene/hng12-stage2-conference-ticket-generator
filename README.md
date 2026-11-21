# 🎟 Ticz: Event Ticketing for Community Events

Ticz lets **any organizer** create an event in a couple of minutes, share a booking link, and check attendees in at the door. **Attendees** book in three steps with no account and get a personalised ticket with their photo, a unique reference and a QR code.

Built with **Next.js 16 (App Router)**, **React 19**, **Postgres + Drizzle ORM**, **Tailwind CSS**, **react-hook-form + zod** and **Cloudinary**.

## Features

**For organizers**

- **Create unlimited events**, each with its own name, venue, date & time zone, currency (USD, NGN, GHS, KES, XAF, XOF, EUR…), and brand colour.
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
| `npm run check`               | Lint + tests + build; run before pushing                   |
| `npm run format`              | Prettier                                                   |
| `npm run db:generate`         | Create a migration after editing `lib/server/db/schema.js` |
| `npm run db:migrate`          | Apply migrations to `DATABASE_URL`                         |

## Deploying (e.g. Vercel)

1. Create a free Postgres database (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com)) and copy its connection string.
2. Set the environment variables below in your hosting project.
3. Deploy. On Vercel the `vercel-build` script runs `db:migrate` and then `next build`, so the schema is always up to date.

### Environment variables

| Variable                               | Purpose                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `DATABASE_URL`                         | Postgres connection string. **Required in production**; unset = embedded DB |
| `NEXT_PUBLIC_SITE_URL`                 | Public URL, used for Open Graph links                                       |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`    | Cloudinary account for attendee photos                                      |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset (public; sign uploads server-side before launch)     |

## Architecture

```
app/                      Routes (thin server components)
  page.js                   public events list
  events/[slug]/            booking: step 1 (tickets) → details/ (attendee) — themed per event
  tickets/[code]/           a ticket (step 3 after booking)
  my-tickets/               tickets saved on this device
  manage/                   organizer: your events, new/, [slug]/ dashboard, edit/,
                            access/[token] (manage link), attendees.csv (export)
components/
  ui/  layout/  booking/  ticket/  events/  manage/
config/                   Allowed currencies, time zones, colours, limits; site & routes
lib/                      Framework-free logic, unit-tested
  booking-schema.js         per-event booking rules (shared by form + server)
  event-schema.js           organizer form rules (shared by form + server)
  ticket-store.js           device storage: drafts per event + ticket snapshots
  money.js  timezone.js  color.js  slug.js  csv.js  ticket-id.js  upload-avatar.js
  server/
    db/schema.js            tables: events, ticket_tiers, tickets
    db/index.js             Postgres via DATABASE_URL, else embedded PGlite
    events-repo.js          every query; tested against a real (in-memory) Postgres
    actions.js              Server Actions: book, create/update event, check in
    manage-auth.js          manage-link cookie checks
drizzle/                  SQL migrations
```

**Key design points**

- **Overselling is impossible:** a booking reserves seats with one conditional `UPDATE … WHERE sold + n <= capacity`, and the database also enforces a `CHECK (sold <= capacity)` constraint.
- **One schema, two places:** the same zod schema validates the browser form and is re-checked in the server action.
- **Money is stored in integer minor units**, with the right number of decimals per currency (XAF and XOF have none).
- **Dates are stored as UTC instants** and always shown in the event's own time zone.
- **Organizer access** is a 192-bit secret, stored only as a SHA-256 hash. The manage link moves it into an httpOnly cookie and drops it from the URL.

## License

[MIT](LICENSE) © MAGENE Sem Joel
