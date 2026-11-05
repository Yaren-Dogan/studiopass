import { useState } from "react";
import { PageHeader } from "../components/Layout";
import { useToast } from "../components/Toast";
import { Button, ConfirmDialog, Drawer, ErrorState, Select, Skeleton, StatusBadge, TextField } from "../components/ui";
import { api, ApiError, type MemberDetail } from "../lib/api";
import { useAuth } from "../lib/auth";
import { addDays, formatDate, formatKurus, initials } from "../lib/format";
import { useAsync } from "../lib/useAsync";

/** S-05 · US-05, US-10 */
export function MemberDetailPage({ id }: { id: string }) {
  const { can } = useAuth();
  const isStaff = can("owner", "manager");
  const toast = useToast();
  const { data: m, error, loading, reload } = useAsync(() => api.member(id), [id]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggleActive(member: MemberDetail) {
    setBusy(true);
    try {
      if (member.status === "inactive") { await api.activateMember(member.id); toast("success", "Üye yeniden etkinleştirildi"); }
      else { await api.deactivateMember(member.id); toast("success", "Üye pasife alındı"); }
      setConfirmOpen(false);
      reload();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "İşlem başarısız");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading && !m) return <Skeleton lines={6} />;
  if (!m) return null;

  return (
    <>
      <PageHeader
        back={{ to: "/members", label: "Üyeler" }}
        title={`${m.firstName} ${m.lastName}`}
        actions={isStaff && (
          <>
            {m.status !== "inactive" && <Button onClick={() => setAssignOpen(true)}>Plan ata</Button>}
            <Button variant="secondary" onClick={() => (m.status === "inactive" ? toggleActive(m) : setConfirmOpen(true))} loading={busy && !confirmOpen}>
              {m.status === "inactive" ? "Yeniden etkinleştir" : "Üyeliği dondur / pasife al"}
            </Button>
          </>
        )}
      />

      <div className="grid-2">
        <section className="card" aria-labelledby="profile-title">
          <header className="card__header">
            <h2 id="profile-title" className="card__title">Profil</h2>
            <StatusBadge status={m.status} expiringSoon={m.expiringSoon} />
          </header>
          <div className="profile">
            <span className="avatar avatar--lg" aria-hidden="true">{initials(m.firstName, m.lastName)}</span>
            <dl className="dl">
              {isStaff && <><dt>E-posta</dt><dd>{m.email}</dd></>}
              {isStaff && <><dt>Telefon</dt><dd>{m.phone ?? "—"}</dd></>}
              <dt>Güncel plan</dt><dd>{m.plan?.name ?? "Plan yok"}</dd>
              {m.plan && <><dt>Geçerlilik</dt><dd className="tabular">{formatDate(m.plan.startDate)} – {formatDate(m.plan.endDate)}</dd></>}
              {isStaff && m.createdAt && <><dt>Kayıt tarihi</dt><dd className="tabular">{formatDate(m.createdAt)}</dd></>}
            </dl>
          </div>
          {!isStaff && <p className="form-note">İletişim bilgileri KVKK gereği eğitmen rolünde gösterilmez.</p>}
        </section>

        {isStaff && (
          <section className="card" aria-labelledby="history-title">
            <header className="card__header"><h2 id="history-title" className="card__title">Plan geçmişi</h2></header>
            {m.history.length === 0 ? <p className="text-secondary">Bu üyeye henüz plan atanmadı.</p> : (
              <ol className="timeline">
                {m.history.map((h) => (
                  <li key={h.id} className="timeline__item">
                    <p className="timeline__title">{h.planName}</p>
                    <p className="timeline__meta tabular">{formatDate(h.startDate)} – {formatDate(h.endDate)}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}
      </div>

      {isStaff && <AssignPlanDrawer open={assignOpen} memberId={m.id} hasActivePlan={m.status === "active"} onClose={() => setAssignOpen(false)} onDone={() => { setAssignOpen(false); reload(); }} />}

      <ConfirmDialog
        open={confirmOpen}
        title="Üyeyi pasife al"
        confirmLabel="Pasife al"
        loading={busy}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => toggleActive(m)}
        body={<>
          <p><strong>{m.firstName} {m.lastName}</strong> pasife alınacak.</p>
          <ul className="bullet">
            <li>Üye silinmez, geçmiş kayıtları korunur.</li>
            <li>Pasif üye derslere yazılamaz ve plan atanamaz.</li>
            <li>İstediğiniz zaman yeniden etkinleştirebilirsiniz.</li>
          </ul>
        </>}
      />
    </>
  );
}

function AssignPlanDrawer({ open, memberId, hasActivePlan, onClose, onDone }: { open: boolean; memberId: string; hasActivePlan: boolean; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const today = new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);
  const { data } = useAsync(() => api.plans(), []);
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const plans = data?.items.filter((p) => p.isOnSale) ?? [];
  const selected = plans.find((p) => p.id === planId);

  async function save() {
    if (!planId) return setErrors({ planId: "Plan seçin" });
    setSaving(true);
    try {
      await api.assignPlan(memberId, planId, startDate);
      toast("success", "Plan atandı");
      onDone();
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.fields).length) setErrors(e.fields);
      else toast("error", e instanceof Error ? e.message : "Plan atanamadı");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Plan ata" footer={<>
      <Button variant="secondary" onClick={onClose}>Vazgeç</Button>
      <Button onClick={save} loading={saving}>Planı ata</Button>
    </>}>
      <div className="form-grid">
        <Select label="Plan" value={planId} onChange={(e) => { setPlanId(e.target.value); setErrors({}); }} error={errors.planId}>
          <option value="">Plan seçin</option>
          {plans.map((p) => <option key={p.id} value={p.id}>{p.name} · {formatKurus(p.priceKurus)} · {p.durationDays} gün</option>)}
        </Select>
        <TextField label="Başlangıç tarihi" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} error={errors.startDate} />
        {selected && (
          <div className="summary" aria-live="polite">
            <p className="summary__label">Bitiş tarihi</p>
            <p className="summary__value tabular">{formatDate(addDays(startDate, selected.durationDays))}</p>
          </div>
        )}
        {hasActivePlan && <div className="alert alert--warning" role="note"><p>Üyenin aktif bir planı var. Yeni plan atanınca mevcut plan <strong>bugün</strong> sona erer.</p></div>}
      </div>
    </Drawer>
  );
}
