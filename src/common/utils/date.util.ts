/**
 * Number of calendar days in the month containing `date` (leap-year aware).
 * Used to compute an accurate daily proration rate instead of assuming a
 * flat 30-day month.
 */
export function daysInMonth(date: Date): number {
  // Day 0 of "next month" (in UTC) rolls back to the last day of the target
  // month. Built entirely with Date.UTC to avoid local-timezone drift.
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
}

/** Normalizes a date to UTC midnight, discarding any time-of-day component. */
export function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/** Adds `days` calendar days to `date` (UTC-safe, handles month/year rollover). */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Enumerates every calendar day in the half-open interval [start, end),
 * normalized to UTC midnight. Used by the billing calculator to walk a
 * billing period day-by-day so proration and discount-window overlap can
 * both be computed exactly, even across month/year boundaries.
 */
export function enumerateDays(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
  );
  const endUtc = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
  );

  while (cursor < endUtc) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}
