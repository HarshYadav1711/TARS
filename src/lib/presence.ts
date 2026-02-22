/** Consider user online if last activity was within this many milliseconds. */
export const ONLINE_THRESHOLD_MS = 90_000;

export function isOnline(lastSeenAt: number | undefined): boolean {
  if (lastSeenAt == null) return false;
  return Date.now() - lastSeenAt < ONLINE_THRESHOLD_MS;
}
