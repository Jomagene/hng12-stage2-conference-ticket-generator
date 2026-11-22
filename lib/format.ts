// Always format in the event's time zone so server and client output match.
export function formatEventDate(value: string | Date, timeZone: string) {
  const date = new Date(value);
  const day = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone }).format(
    date,
  );
  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone }).format(date);
  return `${day} | ${time}`;
}

export function formatShortDateTime(value: string | Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(
    new Date(value),
  );
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count.toLocaleString('en-US')} ${count === 1 ? singular : plural}`;
}
