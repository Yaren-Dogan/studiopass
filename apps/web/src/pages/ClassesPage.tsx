import { useState } from "react";
import { PageHeader } from "../components/Layout";
import { Badge, Button, CapacityBar, EmptyState, ErrorState, Skeleton } from "../components/ui";
import { api, type ClassSession } from "../lib/api";
import { useAuth } from "../lib/auth";
import { addDays, formatDate, formatDay, formatTime, istanbulDateKey, mondayOf } from "../lib/format";
import { Link } from "../lib/router";
import { useAsync } from "../lib/useAsync";

const todayKey = () => new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);

/** S-06 · Haftalık ders listesi (Pazartesi başlangıçlı, UT-03) */
export function ClassesPage() {
  const { user } = useAuth();
  const isInstructor = user?.role === "instructor";
  const [week, setWeek] = useState(() => mondayOf(todayKey()));
  const [mine, setMine] = useState(isInstructor);
  const { data, error, loading, reload } = useAsync(() => api.classes({ from: week, to: addDays(week, 7), mine }), [week, mine]);

  const byDay = new Map<string, ClassSession[]>();
  data?.items.forEach((c) => {
    const k = istanbulDateKey(c.startsAt);
    byDay.set(k, [...(byDay.get(k) ?? []), c]);
  });

  return (
    <>
      <PageHeader
        title="Dersler"
        description={`${formatDate(week)} – ${formatDate(addDays(week, 6))}`}
        actions={
          <div className="week-nav" role="group" aria-label="Hafta seçimi">
            <Button variant="secondary" size="sm" icon="chevronLeft" onClick={() => setWeek(addDays(week, -7))}>Önceki hafta</Button>
            <Button variant="ghost" size="sm" onClick={() => setWeek(mondayOf(todayKey()))}>Bu hafta</Button>
            <Button variant="secondary" size="sm" onClick={() => setWeek(addDays(week, 7))}>Sonraki hafta</Button>
          </div>
        }
      />

      {isInstructor && (
        <label className="switch">
          <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} />
          <span>Sadece benim derslerim</span>
        </label>
      )}

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && <Skeleton lines={6} />}
      {data && data.items.length === 0 && <EmptyState title="Bu hafta ders yok" icon="calendar" />}

      {data && data.items.length > 0 && (
        <div className="days">
          {[...byDay.entries()].map(([day, classes]) => (
            <section key={day} className="day" aria-labelledby={`day-${day}`}>
              <h2 id={`day-${day}`} className="day__title">
                {formatDay(classes[0].startsAt)}
                {day === todayKey() && <Badge tone="active">Bugün</Badge>}
              </h2>
              <ul className="class-list">
                {classes.map((c) => (
                  <li key={c.id}>
                    <Link to={`/classes/${c.id}`} className={`class-card ${c.isPast ? "is-past" : ""}`} aria-label={`${formatTime(c.startsAt)} ${c.title}, ${c.instructor?.name ?? ""}, ${c.booked}/${c.capacity}${c.isPast ? ", geçmiş ders" : ""}`}>
                      <span className="class-card__time tabular">{formatTime(c.startsAt)}</span>
                      <span className="class-card__body">
                        <span className="class-card__title">{c.title}</span>
                        <span className="class-card__meta">{c.instructor?.name} · {c.durationMin} dk</span>
                      </span>
                      <span className="class-card__cap"><CapacityBar booked={c.booked} capacity={c.capacity} compact /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
