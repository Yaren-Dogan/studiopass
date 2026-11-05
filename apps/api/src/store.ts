import { randomUUID } from "node:crypto";
import { hashPassword, type Role } from "./lib/auth.js";
import { addDays, startOfWeek, today, type IsoDate } from "./lib/dates.js";

export interface User { id: string; name: string; email: string; passwordHash: string; role: Role }
export interface Member { id: string; firstName: string; lastName: string; email: string; phone: string | null; isActive: boolean; createdAt: string }
export interface Plan { id: string; name: string; priceKurus: number; durationDays: number; monthlyClassLimit: number | null; isOnSale: boolean }
export interface Membership { id: string; memberId: string; planId: string; startDate: IsoDate; endDate: IsoDate }
export interface ClassSession { id: string; title: string; instructorId: string; startsAt: string; durationMin: number; capacity: number }
export interface Booking { id: string; memberId: string; classId: string; createdAt: string }

export interface Db {
  users: User[];
  members: Member[];
  plans: Plan[];
  memberships: Membership[];
  classes: ClassSession[];
  bookings: Booking[];
}

export const newId = () => randomUUID();

/** Demo şifresi tüm kullanıcılar için aynıdır; sadece yerel geliştirme ve test ortamı içindir. */
export const DEMO_PASSWORD = "Studio123!";

export const DEMO_USERS = {
  owner: { email: "elif@studiopass.dev", name: "Elif Arslan", role: "owner" as Role },
  manager: { email: "mert@studiopass.dev", name: "Mert Kaya", role: "manager" as Role },
  instructor: { email: "deniz@studiopass.dev", name: "Deniz Aydın", role: "instructor" as Role },
  instructor2: { email: "selin@studiopass.dev", name: "Selin Öztürk", role: "instructor" as Role },
};

const MEMBER_SEED: Array<[string, string, string | null, number | null, number]> = [
  // ad, soyad, telefon, plan sırası (null = plansız), bitişe kalan gün (negatif = süresi dolmuş)
  ["Ayşe", "Yılmaz", "0532 111 22 33", 0, 18],
  ["Şule", "Demir", "0533 222 33 44", 1, 4],
  ["İlker", "Çelik", "0534 333 44 55", 0, -3],
  ["Işıl", "Güneş", null, 2, 52],
  ["Burak", "Şahin", "0535 444 55 66", 0, 25],
  ["Zeynep", "Koç", "0536 555 66 77", 3, 150],
  ["Emre", "Aksoy", "0537 666 77 88", 1, 2],
  ["Gökçe", "Erdoğan", null, 0, -12],
  ["Cem", "Öztürk", "0538 777 88 99", 2, 33],
  ["Ece", "Kılıç", "0539 888 99 00", 0, 9],
  ["Onur", "Aslan", null, null, 0],
  ["Derya", "Polat", "0541 111 00 22", 0, 21],
  ["Kaan", "Doğan", "0542 222 11 33", 1, 15],
  ["Melis", "Yıldız", "0543 333 22 44", 3, 300],
  ["Hakan", "Özdemir", null, 0, -30],
  ["Nil", "Arıkan", "0544 444 33 55", 2, 40],
  ["Tolga", "Kurt", "0545 555 44 66", 0, 27],
  ["Pınar", "Çakır", "0546 666 55 77", 1, 6],
  ["Barış", "Ünal", null, 0, 12],
  ["Selin", "Taş", "0547 777 66 88", 0, 1],
  ["Ozan", "Bulut", "0548 888 77 99", 2, -1],
  ["Dilara", "Yavuz", "0549 999 88 00", 0, 19],
  ["Umut", "Kara", null, 3, 200],
  ["Ceren", "Akın", "0551 123 45 67", 1, 11],
];

export function createSeedDb(): Db {
  const t = today();
  const pw = hashPassword(DEMO_PASSWORD);
  // Kullanıcı kimlikleri sabittir: veri sıfırlansa da açık oturumlar geçerli kalır.
  const users: User[] = Object.entries(DEMO_USERS).map(([key, u]) => ({ id: `usr_${key}`, ...u, passwordHash: pw }));
  const [, , deniz, selin] = users;

  const plans: Plan[] = [
    { id: newId(), name: "Aylık Sınırsız", priceKurus: 189_000, durationDays: 30, monthlyClassLimit: null, isOnSale: true },
    { id: newId(), name: "8 Ders Paketi", priceKurus: 125_000, durationDays: 30, monthlyClassLimit: 8, isOnSale: true },
    { id: newId(), name: "3 Aylık Sınırsız", priceKurus: 499_000, durationDays: 90, monthlyClassLimit: null, isOnSale: true },
    { id: newId(), name: "Yıllık Sınırsız", priceKurus: 1_590_000, durationDays: 365, monthlyClassLimit: null, isOnSale: true },
    { id: newId(), name: "Yaz Kampanyası", priceKurus: 149_000, durationDays: 30, monthlyClassLimit: null, isOnSale: false },
  ];

  const members: Member[] = [];
  const memberships: Membership[] = [];
  MEMBER_SEED.forEach(([firstName, lastName, phone, planIdx, daysLeft], i) => {
    const ascii = (s: string) => s.toLocaleLowerCase("tr-TR").replace(/[çğıöşü]/g, (c) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[c] as string);
    const m: Member = {
      id: newId(), firstName, lastName, phone, isActive: i !== 18,
      email: `${ascii(firstName)}.${ascii(lastName)}@ornek.com`,
      createdAt: `${addDays(t, -200 + i * 7)}T10:00:00.000Z`,
    };
    members.push(m);
    if (planIdx !== null) {
      const plan = plans[planIdx];
      const endDate = addDays(t, daysLeft);
      memberships.push({ id: newId(), memberId: m.id, planId: plan.id, startDate: addDays(endDate, -plan.durationDays), endDate });
    }
  });

  const monday = startOfWeek(t);
  const slots: Array<[number, string, string, User, number, number]> = [
    // gün (Pzt=0), saat, ad, eğitmen, kapasite, rezervasyon sayısı
    [0, "07:30", "Sabah Vinyasa", deniz, 12, 9],
    [0, "19:00", "Reformer Pilates", selin, 8, 8],
    [1, "18:30", "Hatha Yoga", deniz, 14, 6],
    [2, "07:30", "Sabah Vinyasa", deniz, 12, 11],
    [2, "19:00", "Reformer Pilates", selin, 8, 5],
    [3, "18:30", "Yin Yoga", deniz, 14, 3],
    [4, "19:00", "Reformer Pilates", selin, 8, 7],
    [5, "10:00", "Hafta Sonu Akışı", deniz, 16, 10],
    [6, "11:00", "Mat Pilates", selin, 12, 4],
    // Gelecek hafta
    [7, "07:30", "Sabah Vinyasa", deniz, 12, 2],
    [8, "19:00", "Reformer Pilates", selin, 8, 1],
  ];
  const activeMemberIds = members.filter((m) => m.isActive && memberships.some((ms) => ms.memberId === m.id && ms.endDate >= t)).map((m) => m.id);
  const classes: ClassSession[] = [];
  const bookings: Booking[] = [];
  for (const [day, time, title, instructor, capacity, count] of slots) {
    const date = addDays(monday, day);
    // İstanbul saati (UTC+3) → UTC
    const [h, min] = time.split(":").map(Number);
    const startsAt = new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10), h - 3, min)).toISOString();
    const c: ClassSession = { id: newId(), title, instructorId: instructor.id, startsAt, durationMin: 60, capacity };
    classes.push(c);
    for (let k = 0; k < count && k < activeMemberIds.length; k++) {
      bookings.push({ id: newId(), memberId: activeMemberIds[(k + day * 3) % activeMemberIds.length], classId: c.id, createdAt: new Date().toISOString() });
    }
  }

  return { users, members, plans, memberships, classes, bookings };
}

export let db: Db = createSeedDb();
export function resetDb() { db = createSeedDb(); }
