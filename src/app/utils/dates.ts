// Regles de dates (les mateixes que al backend, a utils/dates.js)
export const APP_START_YEAR = 2026; // l'app es va crear el 2026: no hi ha anys anteriors

export const MONTH_NAMES = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
  'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Data local en format YYYY-MM-DD (no UTC). */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function currentMonth(): string {
  return todayISO().slice(0, 7);
}

export function currentYear(): number {
  return new Date().getFullYear();
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

/** '2026-10' → 'Octubre 2026' */
export function monthLabel(month: string): string {
  const [y, m] = month.split('-');
  return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
}

/** Suma (o resta) mesos a 'YYYY-MM'. */
export function addMonths(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** Les despeses només es poden tocar a l'any en curs; els anteriors són de lectura. */
export function isReadOnlyMonth(month: string): boolean {
  return Number(month.slice(0, 4)) < currentYear();
}

/** 12, '2026-10' → '12 d'octubre de 2026' (amb apòstrof davant de vocal: abril, agost, octubre). */
export function dayLabel(day: number, month: string): string {
  const [y, m] = month.split('-').map(Number);
  const name = MONTH_NAMES[m - 1].toLowerCase();
  const prep = /^[aeiou]/.test(name) ? "d'" : 'de ';
  return `${day} ${prep}${name} de ${y}`;
}
