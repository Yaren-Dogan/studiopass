import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/Layout";
import { useToast } from "../components/Toast";
import { Badge, Button, CapacityBar, Drawer, EmptyState, ErrorState, Skeleton, StatusBadge } from "../components/ui";
import { api, ApiError, type Member } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDay, formatTime, initials } from "../lib/format";
import { Link } from "../lib/router";
import { useAsync } from "../lib/useAsync";

/** S-07 · US-08 / FR-10 */
export function ClassDetailPage({ id }: { id: string }) {
  const { user, can } = useAuth();
  const toast = useToast();
  const { data: c, error, loading, reload } = useAsync(() => api.classDetail(id), [id]);
  const [addOpen, setAddOpen] = useState(false);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !c) return <Skeleton lines={6} />;
  if (!c) return null;

  const isOwnClass = c.instructor?.id === user?.id;
  const canBook = !c.isPast && (can("owner", "manager") || isOwnClass);
  const canCancel = !c.isPast && can("owner", "manager");

  async function cancel(bookingId: string, name: string) {
    try {
      await api.cancelBooking(c!.id, bookingId);
      toast("success", `${name} dersten çıkarıldı`);
      reload();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "İptal edilemedi");
    }
  }

  return (
    <>
      <PageHeader
        back={{ to: "/classes", label: "Dersler" }}
        title={c.title}
        description={`${formatDay(c.startsAt)} · ${formatTime(c.startsAt)} · ${c.durationMin} dk · ${c.instructor?.name ?? ""}`}
        actions={canBook && <Button icon="plus" disabled={c.isFull} onClick={() => setAddOpen(true)} aria-describedby={c.isFull ? "full-note" : undefined}>Katılımcı ekle</Button>}
      />

      <section className="card" aria-labelledby="att-title">
        <header className="card__header">
          <h2 id="att-title" className="card__title">Katılımcılar</h2>
          {c.isPast && <Badge tone="neutral" icon="clock">Geçmiş ders</Badge>}
        </header>
        <CapacityBar booked={c.booked} capacity={c.capacity} />
        {c.isFull && !c.isPast && <p id="full-note" className="form-note">Ders kapasitesi dolu. Yeni katılımcı eklemek için önce bir rezervasyonu iptal edin.</p>}

        {c.attendees.length === 0 ? <EmptyState title="Bu derse henüz kimse yazılmadı" icon="users" /> : (
          <ul className="list">
            {c.attendees.map(({ bookingId, member }) => (
              <li key={bookingId} className="list__row">
                <div className="person">
                  <span className="avatar" aria-hidden="true">{initials(member.firstName, member.lastName)}</span>
                  <Link to={`/members/${member.id}`} className="person__name">{member.firstName} {member.lastName}</Link>
                </div>
                <span className="list__meta">{member.plan?.name}</span>
                {canCancel && (
                  <button className="icon-btn" onClick={() => cancel(bookingId, `${member.firstName} ${member.lastName}`)} aria-label={`${member.firstName} ${member.lastName} rezervasyonunu iptal et`}>
                    <Icon name="trash" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <AddAttendeeDrawer open={addOpen} classId={c.id} bookedIds={c.attendees.map((a) => a.member.id)} onClose={() => setAddOpen(false)} onBooked={(name) => { toast("success", `${name} derse yazıldı`); setAddOpen(false); reload(); }} />
    </>
  );
}

/** Akış 1: Üye ara → seç. Hata mesajları API'den gelir (kurallar sunucuda uygulanır). */
function AddAttendeeDrawer({ open, classId, bookedIds, onClose, onBooked }: { open: boolean; classId: string; bookedIds: string[]; onClose: () => void; onBooked: (name: string) => void }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Member[]>([]);
  const [error, setError] = useState<{ memberId: string; message: string } | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => { if (open) { setSearch(""); setError(null); } }, [open]);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => api.members({ search, page: 1 }).then((r) => setResults(r.items)).catch(() => setResults([])), 200);
    return () => clearTimeout(t);
  }, [search, open]);

  async function book(m: Member) {
    setSavingId(m.id);
    setError(null);
    try {
      await api.book(classId, m.id);
      onBooked(`${m.firstName} ${m.lastName}`);
    } catch (e) {
      setError({ memberId: m.id, message: e instanceof ApiError ? e.message : "Rezervasyon yapılamadı" });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Katılımcı ekle">
      <div className="search search--block">
        <Icon name="search" />
        <label htmlFor="attendee-search" className="visually-hidden">Üye ara</label>
        <input id="attendee-search" type="search" className="search__input" placeholder="Üye adı" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <ul className="pick-list" aria-label="Arama sonuçları">
        {results.map((m) => {
          const already = bookedIds.includes(m.id);
          return (
            <li key={m.id} className="pick">
              <div className="pick__row">
                <div className="person">
                  <span className="avatar" aria-hidden="true">{initials(m.firstName, m.lastName)}</span>
                  <span className="person__name">{m.firstName} {m.lastName}</span>
                </div>
                <StatusBadge status={m.status} expiringSoon={m.expiringSoon} />
                <Button size="sm" variant={already ? "ghost" : "secondary"} disabled={already} loading={savingId === m.id} onClick={() => book(m)} aria-label={already ? `${m.firstName} ${m.lastName} zaten kayıtlı` : `${m.firstName} ${m.lastName} kişisini ekle`}>
                  {already ? "Kayıtlı" : "Ekle"}
                </Button>
              </div>
              {error?.memberId === m.id && (
                <p className="field__error" role="alert"><Icon name="alert" /> {error.message}{m.status === "expired" || m.status === "none" ? <> · <Link to={`/members/${m.id}`} className="text-link">Plan ata</Link></> : null}</p>
              )}
            </li>
          );
        })}
      </ul>
    </Drawer>
  );
}
