/** Tarihler `YYYY-MM-DD` (yerel takvim günü) olarak tutulur; saat dilimi kaymalarını önlemek için UTC ile hesaplanır. */
export type IsoDate = string;

/** Testlerde ve demo ortamında "bugün"ü sabitlemek için STUDIOPASS_TODAY kullanılabilir. */
export function today(): IsoDate {
  const fixed = process.env.STUDIOPASS_TODAY;
  if (fixed) return fixed;
  const now = new Date();
  // Europe/Istanbul (UTC+3) takvim günü
  const tr = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  return tr.toISOString().slice(0, 10);
}

/** Şu anki zaman (ms). STUDIOPASS_TODAY verilmişse o günün 12:00'si (İstanbul) kabul edilir. */
export function nowMs(): number {
  const fixed = process.env.STUDIOPASS_TODAY;
  return fixed ? Date.parse(`${fixed}T09:00:00Z`) : Date.now();
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function endOfMonth(date: IsoDate): IsoDate {
  const d = new Date(`${date}T00:00:00Z`);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);
}

/** Pazartesi başlangıçlı hafta (UT-03). */
export function startOfWeek(date: IsoDate): IsoDate {
  const d = new Date(`${date}T00:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7; // Pzt=0
  return addDays(date, -dow);
}
