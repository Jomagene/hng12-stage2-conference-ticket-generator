import { getDb } from '@/lib/server/db';
import { listAttendees } from '@/lib/server/events-repo';
import { getManagedEvent } from '@/lib/server/manage-auth';
import { toCsv } from '@/lib/csv';
import { fromMinorUnits } from '@/lib/money';

export async function GET(_request, { params }) {
  const { slug } = await params;
  const db = await getDb();
  const event = await getManagedEvent(db, slug);
  if (!event) return new Response('Open your manage link first.', { status: 403 });

  const attendees = await listAttendees(db, event.id);
  const header = [
    'Ticket code',
    'Name',
    'Email',
    'Ticket type',
    'Quantity',
    `Unit price (${event.currency})`,
    'Booked at (UTC)',
    'Checked in at (UTC)',
  ];
  if (event.extraQuestion) header.push(event.extraQuestion);

  const rows = attendees.map((a) => {
    const row = [
      a.code,
      a.name,
      a.email,
      a.tierName,
      a.quantity,
      fromMinorUnits(a.unitPriceMinor, event.currency),
      a.bookedAt,
      a.checkedInAt ?? '',
    ];
    if (event.extraQuestion) row.push(a.extraAnswer);
    return row;
  });

  // BOM so Excel opens the file as UTF-8.
  return new Response(`\uFEFF${toCsv(header, rows)}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}-attendees.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
