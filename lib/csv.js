// Prefix = + - @ with ' so spreadsheets don't evaluate attendee input as formulas.
function escapeCell(value) {
  let text = value == null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(header, rows) {
  return [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');
}
