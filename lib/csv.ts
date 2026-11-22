// Prefix = + - @ with ' so spreadsheets don't evaluate attendee input as formulas.
type Cell = string | number | null | undefined;

function escapeCell(value: Cell) {
  let text = value == null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(header: Cell[], rows: Cell[][]) {
  return [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');
}
