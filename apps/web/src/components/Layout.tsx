import type { ReactNode } from "react";
import type { Role } from "../lib/api";
import { ROLE_LABEL, useAuth } from "../lib/auth";
import { Link, usePath } from "../lib/router";
import { Icon, type IconName } from "./Icon";

const NAV: Array<{ to: string; label: string; icon: IconName; roles: Role[] }> = [
  { to: "/", label: "Özet", icon: "home", roles: ["owner", "manager"] },
  { to: "/members", label: "Üyeler", icon: "users", roles: ["owner", "manager", "instructor"] },
  { to: "/classes", label: "Dersler", icon: "calendar", roles: ["owner", "manager", "instructor"] },
  { to: "/plans", label: "Planlar", icon: "tag", roles: ["owner", "manager", "instructor"] },
  { to: "/database", label: "Veritabanı", icon: "database", roles: ["owner"] },
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const path = usePath();
  if (!user) return null;
  const items = NAV.filter((n) => n.roles.includes(user.role));
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <div className="shell">
      <a href="#main" className="skip-link">İçeriğe geç</a>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="32" height="32"><rect width="32" height="32" rx="8" fill="currentColor" /><path d="M9 21c2.5 2 11.5 2 14 0M16 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" fill="none" stroke="#F7F5F0" strokeWidth="2.4" strokeLinecap="round" /></svg>
          </span>
          <span className="brand__name">StudioPass</span>
        </div>
        <nav aria-label="Ana menü">
          <ul className="nav">
            {items.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className={`nav__item ${isActive(n.to) ? "is-active" : ""}`} aria-current={isActive(n.to) ? "page" : undefined}>
                  <Icon name={n.icon} />
                  <span className="nav__label">{n.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="me">
          <div className="me__avatar" aria-hidden="true">{user.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</div>
          <div className="me__text">
            <p className="me__name">{user.name}</p>
            <p className="me__role">{ROLE_LABEL[user.role]}</p>
          </div>
          <button className="icon-btn" onClick={logout} aria-label="Çıkış yap" title="Çıkış yap"><Icon name="logout" /></button>
        </div>
      </aside>
      <main id="main" className="main" tabIndex={-1}>{children}</main>
    </div>
  );
}

export function PageHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: { to: string; label: string } }) {
  return (
    <header className="page-header">
      <div>
        {back && <Link to={back.to} className="back-link"><Icon name="arrowLeft" size={16} /> {back.label}</Link>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-desc">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
