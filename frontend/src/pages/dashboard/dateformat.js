// All dates are shown in South African time
const TZ = "Africa/Johannesburg";
const fmt = (d, opts) => new Intl.DateTimeFormat("en-ZA", { timeZone: TZ, ...opts }).format(new Date(d));

const day = (d) => fmt(d, { day: "numeric" });
const month = (d) => fmt(d, { month: "short" });
const year = (d) => fmt(d, { year: "numeric" });
const dayMonth = (d) => `${day(d)} ${month(d)}`;
const sameDay = (a, b) => dayMonth(a) === dayMonth(b) && year(a) === year(b);

// "12 Jun 2026" or "13 Jun - 14 Jun 2026"  (tables)
export function dateRangeLong(start, end) {
  if (!end || sameDay(start, end)) return `${dayMonth(start)} ${year(start)}`;
  return `${dayMonth(start)} - ${dayMonth(end)} ${year(end)}`;
}

// "12 Jun" or "13-14 Jun"  (event cards)
export function dateRangeShort(start, end) {
  if (!end || sameDay(start, end)) return dayMonth(start);
  if (month(start) === month(end)) return `${day(start)}-${dayMonth(end)}`;
  return `${dayMonth(start)} - ${dayMonth(end)}`;
}

// "7:00"
export const timeOf = (d) =>
  fmt(d, { hour: "numeric", minute: "2-digit", hourCycle: "h23" }).replace(/^0/, "");