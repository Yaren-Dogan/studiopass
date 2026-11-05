const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };

/**
 * Türkçe duyarsız arama için metni normalleştirir (BUG-007 düzeltmesi).
 * "AYŞE", "Ayşe", "ayse" → "ayse" · "İLKER" → "ilker" · "Işıl" → "isil"
 * Not: `toLowerCase()` "İ" harfini "i̇" (i + birleşik nokta) yapar; bu yüzden tr-TR yereli kullanılır
 * ve kalan birleşik işaretler temizlenir.
 */
export function normalizeTr(input: string): string {
  return input
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (ch) => TR_MAP[ch])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}
