// Convert between datetime-local values in the event's zone and UTC instants.

export function isValidTimeZone(timeZone: unknown): timeZone is string {
  if (!timeZone || typeof timeZone !== 'string') return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

function partsInZone(date: Date, timeZone: string): Record<string, string> {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
}

function zoneOffset(date: Date, timeZone: string) {
  const p = partsInZone(date, timeZone);
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

export function zonedLocalToUtc(local: string | undefined, timeZone: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local ?? '');
  if (!match) throw new RangeError(`Invalid local date-time: ${local}`);
  const [, y, m, d, h, min] = match.map(Number);
  const wallAsUtc = Date.UTC(y, m - 1, d, h, min);
  // Second pass fixes the offset when the first guess crosses a DST change.
  let instant = wallAsUtc - zoneOffset(new Date(wallAsUtc), timeZone);
  instant = wallAsUtc - zoneOffset(new Date(instant), timeZone);
  return new Date(instant);
}

export function utcToZonedLocal(value: string | Date, timeZone: string) {
  const p = partsInZone(new Date(value), timeZone);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
