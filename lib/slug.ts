// Would collide with routes under /manage.
export const RESERVED_SLUGS = new Set(['new', 'edit', 'access', 'api', 'admin', 'manage', 'events', 'tickets']);

export function slugify(text: string) {
  const slug = String(text ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/g, '');
  return slug || 'event';
}

// "Techember Fest" in 2025 -> "TF25"
export function ticketPrefixFor(name: string, startsAt: string | Date) {
  const initials = String(name ?? '')
    .normalize('NFKD')
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z]/g, '')[0])
    .filter(Boolean)
    .slice(0, 3)
    .join('')
    .toUpperCase();
  const year = String(new Date(startsAt).getUTCFullYear()).slice(-2);
  return `${initials || 'TIX'}${year}`;
}
