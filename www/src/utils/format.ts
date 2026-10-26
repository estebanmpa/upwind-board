import type { PersonSummary } from '@/types/api';

const dateFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' });
const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
});
const timeFormatter = new Intl.DateTimeFormat('en-GB', { timeStyle: 'short' });
const numberFormatter = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 });

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

export function formatDateTime(isoDate: string): string {
  return dateTimeFormatter.format(new Date(isoDate));
}

export function formatTime(isoDate: string): string {
  return timeFormatter.format(new Date(isoDate));
}

/** "2 h", "45 min", "1 h 30 min" */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function formatHours(hours: number): string {
  return `${numberFormatter.format(hours)} h`;
}

export function fullName(person: Pick<PersonSummary, 'firstName' | 'lastName'>): string {
  return `${person.firstName} ${person.lastName}`;
}

export function initials(person: Pick<PersonSummary, 'firstName' | 'lastName'>): string {
  return `${person.firstName.charAt(0)}${person.lastName.charAt(0)}`.toUpperCase();
}

/** Age in whole years for a YYYY-MM-DD birth date. */
export function calculateAge(birthDate: string, today = new Date()): number {
  const [year, month, day] = birthDate.split('-').map(Number);
  let age = today.getFullYear() - year;
  const birthdayPassed =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!birthdayPassed) age -= 1;
  return age;
}

/** "NW · 14–18 kn", "18 kn", "" when nothing was logged. */
export function formatWind(lesson: {
  windDirection: string | null;
  windMinKnots: number | null;
  windMaxKnots: number | null;
}): string {
  const { windDirection, windMinKnots, windMaxKnots } = lesson;
  const knots =
    windMinKnots !== null && windMaxKnots !== null && windMinKnots !== windMaxKnots
      ? `${windMinKnots}–${windMaxKnots} kn`
      : windMinKnots !== null || windMaxKnots !== null
        ? `${windMinKnots ?? windMaxKnots} kn`
        : '';
  return [windDirection, knots].filter(Boolean).join(' · ');
}

const AVATAR_COLORS = ['brand', 'teal', 'cyan', 'indigo', 'grape', 'orange', 'pink'];

/** Stable avatar color derived from an id. */
export function avatarColor(id: string): string {
  const hash = [...id].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
