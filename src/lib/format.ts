/**
 * Formats a timestamp for message display:
 * - Today → time only (e.g. "2:30 PM")
 * - Older (same year) → date + time (e.g. "Jan 15, 2:30 PM")
 * - Previous years → date + year + time (e.g. "Jan 15, 2023, 2:30 PM")
 */
export function formatMessageTimestamp(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const today =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const sameYear = d.getFullYear() === now.getFullYear();

  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (today) {
    return time;
  }
  if (sameYear) {
    return `${d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })}, ${time}`;
  }
  return `${d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}, ${time}`;
}
