import { useState } from "react";
import { PageHeader } from "../components/Layout";
import { Badge, Button, ErrorState, Skeleton } from "../components/ui";
import { api, type DbObject } from "../lib/api";
import { useAsync } from "../lib/useAsync";

const DESCRIPTIONS: Record<string, string> = {
  users: "Panel kullanıcıları: sahip, yönetici, eğitmen",
  members: "Stüdyo üyeleri",
  plans: "Abonelik planları (fiyat kuruş cinsinden)",
  memberships: "Üyeye atanan planlar, geçmiş dahil",
  class_sessions: "Dersler (saatler UTC saklanır)",
  bookings: "Rezervasyonlar: üye ↔ ders",
  v_member_status: "Görünüm: üyelerin güncel planı ve durumu",
  v_class_occupancy: "Görünüm: derslerin doluluğu",
};

function Cell({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <span className="db-null">NULL</span>;
  return <>{String(value)}</>;
}

/** Yalnız stüdyo sahibi · SQLite veritabanının tabloları ve görünümleri, doğrudan SQL ile okunur. */
export function DatabasePage() {
  const { data, error, loading, reload } = useAsync(() => api.database(), []);
  const [active, setActive] = useState("members");
  const current: DbObject | undefined = data?.items.find((i) => i.name === active) ?? data?.items[0];

  return (
    <>
      <PageHeader
        title="Veritabanı"
        description={data ? `${data.engine} · ${data.file}` : "SQLite"}
        actions={<Button variant="secondary" onClick={reload} loading={loading && !!data}>Yenile</Button>}
      />
      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && <Skeleton lines={8} />}
      {data && current && (
        <div className="db">
          <nav className="db-tabs" aria-label="Tablolar ve görünümler">
            {data.items.map((o) => (
              <button key={o.name} className={`db-tab ${o.name === current.name ? "is-active" : ""}`} aria-label={`${o.name}, ${o.kind === "view" ? "görünüm" : "tablo"}, ${o.total} kayıt`} aria-pressed={o.name === current.name} onClick={() => setActive(o.name)}>
                <span className="db-tab__name">{o.name}</span>
                <span className="db-tab__meta">{o.kind === "view" ? "görünüm" : "tablo"} · {o.total}</span>
              </button>
            ))}
          </nav>

          <section className="card" aria-labelledby="db-title">
            <header className="card__header">
              <div>
                <h2 id="db-title" className="card__title"><code>{current.name}</code></h2>
                <p className="text-secondary">{DESCRIPTIONS[current.name] ?? ""}</p>
              </div>
              <Badge tone="neutral">{current.total} kayıt</Badge>
            </header>

            <div className="db-schema">
              {current.columns.map((c) => (
                <span key={c.name} className="db-col">
                  <b>{c.name}</b> <span className="text-secondary">{c.type}</span>
                  {c.primaryKey && <Badge tone="active">PK</Badge>}
                  {current.foreignKeys.filter((f) => f.column === c.name).map((f) => <Badge key={f.references} tone="warning">FK → {f.references}</Badge>)}
                </span>
              ))}
            </div>

            <div className="db-table-wrap" tabIndex={0} role="region" aria-label={`${current.name} satırları`}>
              <table className="table db-table">
                <thead><tr>{current.columns.map((c) => <th key={c.name} scope="col">{c.name}</th>)}</tr></thead>
                <tbody>
                  {current.rows.map((r, i) => (
                    <tr key={i}>{current.columns.map((c) => <td key={c.name}><Cell value={r[c.name]} /></td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            {current.total > current.rows.length && <p className="form-note">İlk {current.rows.length} kayıt gösteriliyor.</p>}
          </section>
        </div>
      )}
    </>
  );
}
