import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addDays, formatDate, formatKurus, formatTime, mondayOf, occupancyLevel, parseTlToKurus } from "../src/lib/format";

const nbsp = (s: string) => s.replace(/ /g, " ");

describe("Para biçimi (NFR-06, BR-02)", () => {
  it("kuruşu ₺1.250,00 biçiminde gösterir", () => assert.equal(nbsp(formatKurus(125000)), "₺1.250,00"));
  it("küsuratı korur", () => assert.equal(nbsp(formatKurus(125050)), "₺1.250,50"));

  for (const [input, expected] of [["1.250,00", 125000], ["1250", 125000], ["1250,5", 125050], ["1250.50", 125050], ["₺ 1.890,00", 189000], ["12.500", 1250000]] as const) {
    it(`"${input}" → ${expected} kuruş`, () => assert.equal(parseTlToKurus(input), expected));
  }
  for (const bad of ["", "abc", "1,2,3", "12,345"]) {
    it(`"${bad}" geçersizdir`, () => assert.equal(parseTlToKurus(bad), null));
  }
  it("negatif değer ayrıştırılır, doğrulamayı form yapar", () => assert.equal(parseTlToKurus("-5"), -500));
});

describe("Tarih biçimi", () => {
  it("GG.AA.YYYY", () => assert.equal(formatDate("2026-11-04"), "04.11.2026"));
  it("saati İstanbul saat dilimine göre gösterir", () => assert.equal(formatTime("2026-11-04T16:00:00.000Z"), "19:00"));
  it("hafta Pazartesi başlar (UT-03)", () => {
    assert.equal(mondayOf("2026-11-04"), "2026-11-02"); // Çarşamba
    assert.equal(mondayOf("2026-11-08"), "2026-11-02"); // Pazar
    assert.equal(mondayOf("2026-11-02"), "2026-11-02"); // Pazartesi
  });
  it("ay ve yıl geçişinde gün ekler", () => {
    assert.equal(addDays("2026-11-01", 30), "2026-12-01");
    assert.equal(addDays("2026-12-15", 30), "2027-01-14");
  });
});

describe("Doluluk seviyesi (UT-02)", () => {
  it("%90 altı normal", () => assert.equal(occupancyLevel(8, 10), "normal"));
  it("%90 ve üstü high", () => assert.equal(occupancyLevel(9, 10), "high"));
  it("tam dolu full", () => assert.equal(occupancyLevel(10, 10), "full"));
});
