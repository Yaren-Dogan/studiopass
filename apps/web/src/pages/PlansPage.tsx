import { useEffect, useState, type FormEvent } from "react";
import { PageHeader } from "../components/Layout";
import { useToast } from "../components/Toast";
import { Badge, Button, Drawer, ErrorState, Skeleton, TextField } from "../components/ui";
import { api, ApiError, type Plan } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatKurus, parseTlToKurus } from "../lib/format";
import { useAsync } from "../lib/useAsync";

/** S-08 · US-06 / FR-08 */
export function PlansPage() {
  const { can } = useAuth();
  const isOwner = can("owner");
  const toast = useToast();
  const { data, error, loading, reload } = useAsync(() => api.plans(), []);
  const [open, setOpen] = useState(false);

  async function toggleSale(p: Plan) {
    try {
      await api.updatePlan(p.id, { isOnSale: !p.isOnSale });
      toast("success", p.isOnSale ? `${p.name} satıştan kaldırıldı` : `${p.name} yeniden satışta`);
      reload();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Güncellenemedi");
    }
  }

  return (
    <>
      <PageHeader title="Abonelik planları" description="Fiyatlar KDV dahildir." actions={isOwner && <Button icon="plus" onClick={() => setOpen(true)}>Yeni plan</Button>} />
      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && <Skeleton lines={4} />}
      {data && (
        <ul className="plans">
          {data.items.map((p) => (
            <li key={p.id} className={`plan ${p.isOnSale ? "" : "is-muted"}`}>
              <div className="plan__head">
                <h2 className="plan__name">{p.name}</h2>
                {!p.isOnSale && <Badge tone="neutral" icon="pause">Satışta değil</Badge>}
              </div>
              <p className="plan__price tabular">{formatKurus(p.priceKurus)}</p>
              <p className="plan__meta">{p.durationDays} gün · {p.monthlyClassLimit ? `Ayda ${p.monthlyClassLimit} ders` : "Sınırsız ders"}</p>
              <p className="plan__count">{p.activeMemberCount} aktif üye</p>
              {isOwner && (
                <Button variant="ghost" size="sm" onClick={() => toggleSale(p)}>{p.isOnSale ? "Satıştan kaldır" : "Yeniden satışa al"}</Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {isOwner && <NewPlanDrawer open={open} onClose={() => setOpen(false)} onCreated={() => { setOpen(false); reload(); }} />}
    </>
  );
}

function NewPlanDrawer({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", price: "", durationDays: "30", limit: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) { setForm({ name: "", price: "", durationDays: "30", limit: "" }); setErrors({}); } }, [open]);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const priceKurus = parseTlToKurus(form.price);
    if (!form.name.trim()) errs.name = "Plan adı zorunludur";
    if (priceKurus === null) errs.price = "Geçerli bir fiyat girin (ör. 1.250,00)";
    else if (priceKurus <= 0) errs.price = "Fiyat 0'dan büyük olmalı";
    const days = Number(form.durationDays);
    if (!Number.isInteger(days) || days < 1 || days > 730) errs.durationDays = "Süre 1 ile 730 gün arasında olmalı";
    const limit = form.limit ? Number(form.limit) : null;
    if (limit !== null && (!Number.isInteger(limit) || limit < 1 || limit > 100)) errs.limit = "Ders hakkı 1 ile 100 arasında olmalı";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      await api.createPlan({ name: form.name.trim(), priceKurus: priceKurus!, durationDays: days, monthlyClassLimit: limit });
      toast("success", "Plan oluşturuldu");
      onCreated();
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) {
        const f = err.fields;
        setErrors({ name: f.name, price: f.priceKurus, durationDays: f.durationDays, limit: f.monthlyClassLimit });
      } else toast("error", err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Yeni plan" footer={<>
      <Button variant="secondary" onClick={onClose}>Vazgeç</Button>
      <Button type="submit" form="new-plan-form" loading={saving}>Kaydet</Button>
    </>}>
      <form id="new-plan-form" onSubmit={onSubmit} noValidate className="form-grid">
        <TextField label="Plan adı" name="name" required value={form.name} onChange={set("name")} error={errors.name} />
        <TextField label="Fiyat (₺, KDV dahil)" name="price" required inputMode="decimal" placeholder="1.250,00" value={form.price} onChange={set("price")} error={errors.price} />
        <TextField label="Süre (gün)" name="durationDays" required type="number" min={1} max={730} value={form.durationDays} onChange={set("durationDays")} error={errors.durationDays} />
        <TextField label="Aylık ders hakkı" name="limit" type="number" min={1} max={100} hint="Boş bırakılırsa sınırsız" value={form.limit} onChange={set("limit")} error={errors.limit} />
      </form>
    </Drawer>
  );
}
