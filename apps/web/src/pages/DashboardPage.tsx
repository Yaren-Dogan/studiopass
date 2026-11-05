import { PageHeader } from "../components/Layout";
import { ErrorState, Skeleton, StatCard, EmptyState } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate, formatKurus } from "../lib/format";
import { Link } from "../lib/router";
import { useAsync } from "../lib/useAsync";

/** S-02 · US-09 / FR-11 */
export function DashboardPage() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useAsync(() => api.dashboard(), []);
  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <>
      <PageHeader title={`Merhaba ${firstName}`} description={data ? `${formatDate(data.today)} itibarıyla stüdyonuzun durumu` : "Stüdyonuzun durumu"} />
      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && !data && <Skeleton lines={6} />}
      {data && (
        <>
          <div className="stats">
            <StatCard icon="users" label="Aktif üye" value={data.activeMembers} sub={`${data.expiredMembers} üyenin süresi dolmuş`} />
            <StatCard icon="clock" label="Bu ay bitecek" value={data.expiringThisMonth.count} sub="Yenileme için iletişime geçin" />
            <StatCard icon="calendar" label="Bu hafta doluluk" value={`%${data.weekOccupancy.rate}`} sub={`${data.weekOccupancy.classCount} derste ${data.weekOccupancy.booked}/${data.weekOccupancy.capacity} yer`} />
            <StatCard icon="wallet" label="Bu ay satış" value={formatKurus(data.monthlyRevenueKurus)} sub="Bu ay başlayan üyelikler" />
          </div>

          <div className="grid-2">
            <section className="card" aria-labelledby="expiring-title">
              <header className="card__header">
                <h2 id="expiring-title" className="card__title">Bu ay bitecek üyelikler</h2>
                <Link to="/members?status=active" className="text-link">Aktif üyeler</Link>
              </header>
              {data.expiringThisMonth.items.length === 0 ? (
                <EmptyState title="Bu ay biten üyelik yok" icon="check" />
              ) : (
                <ul className="list">
                  {data.expiringThisMonth.items.map((i) => (
                    <li key={i.id} className="list__row">
                      <Link to={`/members/${i.id}`} className="list__main">{i.name}</Link>
                      <span className="list__meta">{formatDate(i.endDate)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card" aria-labelledby="dist-title">
              <header className="card__header">
                <h2 id="dist-title" className="card__title">Aktif üyelerin plan dağılımı</h2>
              </header>
              <ul className="bars">
                {data.planDistribution.map((p) => {
                  const pct = data.activeMembers ? Math.round((p.count / data.activeMembers) * 100) : 0;
                  return (
                    <li key={p.planId} className="bars__row">
                      <div className="bars__label"><span>{p.name}</span><span className="bars__value">{p.count} üye · %{pct}</span></div>
                      <div className="bars__track" aria-hidden="true"><div className="bars__fill" style={{ width: `${pct}%` }} /></div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </>
      )}
    </>
  );
}
