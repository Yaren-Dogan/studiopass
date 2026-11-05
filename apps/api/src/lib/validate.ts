import { HttpError } from "./http.js";

type Rule = (value: unknown) => string | null;

export const rules = {
  required: (msg = "Bu alan zorunludur"): Rule => (v) =>
    v === undefined || v === null || (typeof v === "string" && v.trim() === "") ? msg : null,
  string: (max = 120): Rule => (v) =>
    v === undefined || v === null ? null : typeof v !== "string" ? "Metin olmalı" : v.length > max ? `En fazla ${max} karakter olmalı` : null,
  email: (): Rule => (v) =>
    v === undefined || v === null || v === "" ? null : typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : "Geçerli bir e-posta adresi girin",
  phone: (): Rule => (v) =>
    v === undefined || v === null || v === "" ? null : typeof v === "string" && /^\+?[0-9 ()-]{10,17}$/.test(v) ? null : "Geçerli bir telefon numarası girin",
  int: (min: number, max: number, msg?: string): Rule => (v) =>
    v === undefined || v === null ? null : Number.isInteger(v) && (v as number) >= min && (v as number) <= max ? null : msg ?? `${min} ile ${max} arasında bir tam sayı olmalı`,
  oneOf: (values: readonly string[]): Rule => (v) =>
    v === undefined || v === null ? null : values.includes(v as string) ? null : "Geçersiz değer",
};

/** Alan bazlı hata toplar; hata varsa 400 VALIDATION_ERROR fırlatır (form hataları arayüzde alanın altında gösterilir). */
export function validate<T extends Record<string, unknown>>(body: unknown, schema: Record<string, Rule[]>): T {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "VALIDATION_ERROR", "İstek gövdesi bir nesne olmalı");
  }
  const obj = body as Record<string, unknown>;
  const errors: Record<string, string> = {};
  for (const [field, fieldRules] of Object.entries(schema)) {
    for (const rule of fieldRules) {
      const err = rule(obj[field]);
      if (err) { errors[field] = err; break; }
    }
  }
  if (Object.keys(errors).length) throw new HttpError(400, "VALIDATION_ERROR", "Formda hatalı alanlar var", errors);
  return obj as T;
}
