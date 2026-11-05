// NFR-06: Türkçe biçimler. Saf fonksiyonlar; test/format.test.ts ile test edilir.

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 });

/** 125000 → "₺1.250,00" */
export function formatKurus(kurus: number): string {
  return money.format(kurus / 100);
}

/** Formdaki "1.250,00" / "1250" / "1250.5" → 125000 / 125000 / 125050. Geçersizse null. */
export function parseTlToKurus(input: string): number | null {
  const s = input.trim().replace(/[₺\s]/g, "");
  if (!s) return null;
  // Türkçe biçim: nokta binlik, virgül ondalık. Virgül yoksa ve tek nokta + 1-2 hane varsa ondalık kabul edilir.
  let normalized: string;
  if (s.includes(",")) normalized = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d+\.\d{1,2}$/.test(s)) normalized = s;
  else normalized = s.replace(/\./g, "");
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

/** "2026-11-04" → "04.11.2026" */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}

const dayFmt = new Intl.DateTimeFormat("tr-TR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Istanbul" });
const timeFmt = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

/** ISO zaman → "Çarşamba, 4 Kasım" (İstanbul saatiyle) */
export function formatDay(isoDateTime: string): string {
  const s = dayFmt.format(new Date(isoDateTime));
  return s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1);
}

/** ISO zaman → "19:00" */
export function formatTime(isoDateTime: string): string {
  return timeFmt.format(new Date(isoDateTime));
}

/** İstanbul takvim günü ("YYYY-MM-DD") */
export function istanbulDateKey(isoDateTime: string): string {
  return new Date(Date.parse(isoDateTime) + 3 * 3600_000).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function mondayOf(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return addDays(date, -((d.getUTCDay() + 6) % 7));
}

/** Doluluk seviyesi (UT-02): %90 ve üstü "high", tam dolu "full". */
export function occupancyLevel(booked: number, capacity: number): "normal" | "high" | "full" {
  if (capacity <= 0 || booked >= capacity) return "full";
  return booked / capacity >= 0.9 ? "high" : "normal";
}

export function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toLocaleUpperCase("tr-TR");
}
