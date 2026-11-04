/** Opening hours: Tue–Sun 11:30–21:30, closed Monday. Local time (America/Toronto). */
export const OPEN_MIN = 11 * 60 + 30;
export const CLOSE_MIN = 21 * 60 + 30;
export const CLOSED_DOW = 1; // Monday
export const MIN_LEAD_MINUTES = 30;

export function isOpenAt(d: Date) {
  if (d.getDay() === CLOSED_DOW) return false;
  const m = d.getHours() * 60 + d.getMinutes();
  return m >= OPEN_MIN && m <= CLOSE_MIN;
}
