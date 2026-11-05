-- StudioPass veritabanı şeması (SQLite)
-- Tablolar docs/01-analiz/gereksinimler.md § 5'teki veri modelinin birebir karşılığıdır.
-- Kısıtlar (CHECK, UNIQUE, FOREIGN KEY) iş kurallarını veritabanı seviyesinde de korur.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'instructor'))
);

CREATE TABLE IF NOT EXISTS members (
  id         TEXT PRIMARY KEY,
  first_name TEXT NOT NULL CHECK (length(first_name) BETWEEN 1 AND 60),
  last_name  TEXT NOT NULL CHECK (length(last_name) BETWEEN 1 AND 60),
  email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone      TEXT,
  is_active  INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plans (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  price_kurus         INTEGER NOT NULL CHECK (price_kurus > 0),          -- BR-02: KDV dahil, kuruş
  duration_days       INTEGER NOT NULL CHECK (duration_days BETWEEN 1 AND 730),
  monthly_class_limit INTEGER CHECK (monthly_class_limit IS NULL OR monthly_class_limit BETWEEN 1 AND 100),
  is_on_sale          INTEGER NOT NULL DEFAULT 1 CHECK (is_on_sale IN (0, 1))  -- BR-04: silinmez
);

CREATE TABLE IF NOT EXISTS memberships (
  id         TEXT PRIMARY KEY,
  member_id  TEXT NOT NULL REFERENCES members(id),
  plan_id    TEXT NOT NULL REFERENCES plans(id),
  start_date TEXT NOT NULL,                       -- YYYY-MM-DD
  end_date   TEXT NOT NULL,                       -- = start_date + plans.duration_days
  CHECK (end_date >= start_date)
);
CREATE INDEX IF NOT EXISTS idx_memberships_member ON memberships(member_id);

CREATE TABLE IF NOT EXISTS class_sessions (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  instructor_id TEXT NOT NULL REFERENCES users(id),
  starts_at     TEXT NOT NULL,                    -- ISO 8601, UTC
  duration_min  INTEGER NOT NULL CHECK (duration_min BETWEEN 15 AND 240),
  capacity      INTEGER NOT NULL CHECK (capacity BETWEEN 1 AND 50)
);
CREATE INDEX IF NOT EXISTS idx_classes_starts_at ON class_sessions(starts_at);

CREATE TABLE IF NOT EXISTS bookings (
  id         TEXT PRIMARY KEY,
  member_id  TEXT NOT NULL REFERENCES members(id),
  class_id   TEXT NOT NULL REFERENCES class_sessions(id),
  created_at TEXT NOT NULL,
  UNIQUE (member_id, class_id)                     -- FR-10: aynı üye aynı derse iki kez yazılamaz
);
CREATE INDEX IF NOT EXISTS idx_bookings_class ON bookings(class_id);

-- Okumayı kolaylaştıran görünüm: üyelerin güncel planı ve durumu
CREATE VIEW IF NOT EXISTS v_member_status AS
SELECT
  m.first_name || ' ' || m.last_name AS uye,
  m.email,
  p.name AS plan,
  ms.end_date AS bitis,
  CASE
    WHEN m.is_active = 0 THEN 'pasif'
    WHEN ms.id IS NULL THEN 'plan yok'
    WHEN ms.end_date >= date('now', '+3 hours') THEN 'aktif'
    ELSE 'süresi dolmuş'
  END AS durum
FROM members m
LEFT JOIN memberships ms ON ms.id = (
  SELECT id FROM memberships x WHERE x.member_id = m.id ORDER BY x.end_date DESC LIMIT 1
)
LEFT JOIN plans p ON p.id = ms.plan_id;

-- Derslerin doluluk görünümü
CREATE VIEW IF NOT EXISTS v_class_occupancy AS
SELECT
  c.title AS ders,
  datetime(c.starts_at, '+3 hours') AS baslangic_istanbul,
  u.name AS egitmen,
  (SELECT count(*) FROM bookings b WHERE b.class_id = c.id) AS kayitli,
  c.capacity AS kapasite
FROM class_sessions c
JOIN users u ON u.id = c.instructor_id
ORDER BY c.starts_at;
