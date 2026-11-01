import dayjs, { type Dayjs } from 'dayjs';

/** Local Monday 00:00 of the week containing `date`. */
export function startOfWeek(date: Dayjs | Date | string = dayjs()): Dayjs {
  const day = dayjs(date).startOf('day');
  return day.subtract((day.day() + 6) % 7, 'day');
}

/** The seven local days of the week starting at `weekStart`. */
export function weekDays(weekStart: Dayjs): Dayjs[] {
  return Array.from({ length: 7 }, (_, index) => weekStart.add(index, 'day'));
}

/** Local day key, e.g. "2026-10-30". */
export function dayKey(date: Dayjs | Date | string): string {
  return dayjs(date).format('YYYY-MM-DD');
}

/** Buckets items by the local day of their start, keeping their order. */
export function groupByDay<T extends { startsAt: string }>(items: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = dayKey(item.startsAt);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

/** "27 Oct – 2 Nov 2026" */
export function formatWeekRange(weekStart: Dayjs): string {
  const end = weekStart.add(6, 'day');
  const startFormat = weekStart.year() === end.year() ? 'D MMM' : 'D MMM YYYY';
  return `${weekStart.format(startFormat)} – ${end.format('D MMM YYYY')}`;
}
