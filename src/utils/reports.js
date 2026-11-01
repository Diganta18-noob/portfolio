export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function enquiriesCsv(rows) {
  return '\uFEFF' + [['Created (UTC)', 'Name', 'Email', 'Message', 'Read'], ...rows.map(r => [r.created_at, r.name, r.email, r.message, r.is_read ? 'Yes' : 'No'])].map(row => row.map(csvCell).join(',')).join('\r\n');
}
