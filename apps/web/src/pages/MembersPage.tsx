import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/Layout";
import { useToast } from "../components/Toast";
import { Button, Drawer, EmptyState, ErrorState, Select, Skeleton, StatusBadge, TextField } from "../components/ui";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate, initials } from "../lib/format";
import { Link, navigate } from "../lib/router";
import { useAsync } from "../lib/useAsync";

const STATUS_OPTIONS = [
  { value: "all", label: "Tümü" },
  { value: "active", label: "Aktif" },
  { value: "expired", label: "Süresi dolmuş" },
  { value: "none", label: "Plan yok" },
  { value: "inactive", label: "Pasif" },
];

function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

/** S-03 · US-03 / FR-04, FR-13 */
export function MembersPage() {
  const { can } = useAuth();
  const isStaff = can("owner", "manager");
  const params = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [status, setStatus] = useState(params.get("status") ?? "all");
  const [page, setPage] = useState(Number(params.get("page")) || 1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const q = useDebounced(search);

  // Filtre durumu adres çubuğunda tutulur: paylaşılabilir ve geri tuşuyla korunur.
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("search", q);
    if (status !== "all") p.set("status", status);
    if (page > 1) p.set("page", String(page));
    const next = `/members${p.toString() ? `?${p}` : ""}`;
    if (next !== window.location.pathname + window.location.search) window.history.replaceState(null, "", next);
  }, [q, status, page]);

  const { data, error, loading, reload } = useAsync(() => api.members({ search: q, status, page }), [q, status, page]);

  return (
    <>
      <PageHeader
        title="Üyeler"
        description={data ? `${data.total} üye` : undefined}
        actions={isStaff && <Button icon="plus" onClick={() => setDrawerOpen(true)}>Yeni üye</Button>}
      />

      <div className="toolbar" role="search">
        <div className="search">
          <Icon name="search" />
          <label htmlFor="member-search" className="visually-hidden">Üye ara</label>
          <input id="member-search" type="search" className="search__input" placeholder={isStaff ? "Ad, soyad veya e-posta ile ara" : "Ad veya soyad ile ara"} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="toolbar__filter">
          <Select label="Durum" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </div>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && <Skeleton lines={8} />}
      {data && data.items.length === 0 && (
        <EmptyState title={q || status !== "all" ? "Aramanızla eşleşen üye bulunamadı" : "Henüz üye yok"}>
          {(q || status !== "all") && <Button variant="secondary" size="sm" onClick={() => { setSearch(""); setStatus("all"); }}>Filtreleri temizle</Button>}
        </EmptyState>
      )}

      {data && data.items.length > 0 && (
        <div className={`table-wrap ${loading ? "is-loading" : ""}`}>
          <table className="table">
            <caption className="visually-hidden">Üye listesi, {data.total} kayıt, sayfa {data.page}/{data.totalPages}</caption>
            <thead>
              <tr>
                <th scope="col">Üye</th>
                {isStaff && <th scope="col" className="hide-sm">E-posta</th>}
                <th scope="col">Plan</th>
                <th scope="col" className="hide-sm">Bitiş</th>
                <th scope="col">Durum</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((m) => (
                <tr key={m.id} className={m.status === "inactive" ? "is-muted" : ""}>
                  <td>
                    <div className="person">
                      <span className="avatar" aria-hidden="true">{initials(m.firstName, m.lastName)}</span>
                      <Link to={`/members/${m.id}`} className="person__name">{m.firstName} {m.lastName}</Link>
                    </div>
                  </td>
                  {isStaff && <td className="hide-sm text-secondary">{m.email}</td>}
                  <td>{m.plan?.name ?? <span className="text-secondary">—</span>}</td>
                  <td className="hide-sm tabular">{m.plan ? formatDate(m.plan.endDate) : "—"}</td>
                  <td><StatusBadge status={m.status} expiringSoon={m.expiringSoon} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.totalPages > 1 && (
            <nav className="pager" aria-label="Sayfalama">
              <Button variant="secondary" size="sm" icon="chevronLeft" disabled={page <= 1} onClick={() => setPage(page - 1)}>Önceki</Button>
              <span aria-live="polite">Sayfa {data.page} / {data.totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Sonraki</Button>
            </nav>
          )}
        </div>
      )}

      <NewMemberDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onCreated={(id) => { setDrawerOpen(false); navigate(`/members/${id}`); }} />
    </>
  );
}

/** S-04 · US-04 / FR-05 */
function NewMemberDrawer({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const toast = useToast();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { if (open) { setForm({ firstName: "", lastName: "", email: "", phone: "" }); setErrors({}); } }, [open]);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function focusFirstError(errs: Record<string, string>) {
    const first = ["firstName", "lastName", "email", "phone"].find((k) => errs[k]);
    if (first) formRef.current?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "Ad zorunludur";
    if (!form.lastName.trim()) errs.lastName = "Soyad zorunludur";
    if (!form.email.trim()) errs.email = "E-posta zorunludur";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errs.email = "Geçerli bir e-posta adresi girin";
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError(errs);

    setSaving(true);
    try {
      const m = await api.createMember({ ...form, phone: form.phone || undefined });
      toast("success", "Üye eklendi");
      onCreated(m.id);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) { setErrors(err.fields); focusFirstError(err.fields); }
      else toast("error", err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Yeni üye" footer={<>
      <Button variant="secondary" onClick={onClose}>Vazgeç</Button>
      <Button type="submit" form="new-member-form" loading={saving}>Kaydet</Button>
    </>}>
      <form id="new-member-form" ref={formRef} onSubmit={onSubmit} noValidate className="form-grid">
        <p className="form-note"><span aria-hidden="true">*</span> işaretli alanlar zorunludur.</p>
        <TextField label="Ad" name="firstName" required autoComplete="given-name" value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
        <TextField label="Soyad" name="lastName" required autoComplete="family-name" value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
        <TextField label="E-posta" name="email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} />
        <TextField label="Telefon" name="phone" type="tel" autoComplete="tel" inputMode="tel" hint="İsteğe bağlı. Örnek: 0532 111 22 33" value={form.phone} onChange={set("phone")} error={errors.phone} />
      </form>
    </Drawer>
  );
}
