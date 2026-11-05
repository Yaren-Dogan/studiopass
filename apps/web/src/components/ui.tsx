import { forwardRef, useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import type { MemberStatus } from "../lib/api";
import { occupancyLevel } from "../lib/format";
import { Icon } from "./Icon";

// Figma bileşen adlarıyla birebir eşleşir: Button, TextField, Select, Badge, CapacityBar, StatCard, Drawer, Toast, EmptyState

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
  icon?: Parameters<typeof Icon>[0]["name"];
};

export function Button({ variant = "primary", size = "md", loading, icon, children, disabled, className = "", ...rest }: ButtonProps) {
  return (
    <button className={`btn btn--${variant} btn--${size} ${className}`} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="spinner" aria-hidden="true" /> : icon ? <Icon name={icon} /> : null}
      <span>{children}</span>
    </button>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string };

export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField({ label, error, hint, id, required, ...rest }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = [error ? `${inputId}-error` : "", hint ? `${inputId}-hint` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      <label htmlFor={inputId} className="field__label">
        {label}
        {required && <span className="field__req" aria-hidden="true"> *</span>}
      </label>
      <input ref={ref} id={inputId} className="field__control" aria-invalid={!!error || undefined} aria-describedby={describedBy} aria-required={required || undefined} {...rest} />
      {hint && !error && <p id={`${inputId}-hint`} className="field__hint">{hint}</p>}
      {error && (
        <p id={`${inputId}-error`} className="field__error">
          <Icon name="alert" /> {error}
        </p>
      )}
    </div>
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; children: ReactNode };

export function Select({ label, error, id, children, ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className={`field ${error ? "field--error" : ""}`}>
      <label htmlFor={selectId} className="field__label">{label}</label>
      <select id={selectId} className="field__control field__control--select" aria-invalid={!!error || undefined} aria-describedby={error ? `${selectId}-error` : undefined} {...rest}>
        {children}
      </select>
      {error && <p id={`${selectId}-error`} className="field__error"><Icon name="alert" /> {error}</p>}
    </div>
  );
}

const STATUS: Record<MemberStatus, { label: string; tone: "active" | "danger" | "neutral"; icon: Parameters<typeof Icon>[0]["name"] }> = {
  active: { label: "Aktif", tone: "active", icon: "check" },
  expired: { label: "Süresi dolmuş", tone: "danger", icon: "alert" },
  none: { label: "Plan yok", tone: "neutral", icon: "minus" },
  inactive: { label: "Pasif", tone: "neutral", icon: "pause" },
};

/** UT-05: durum her zaman ikon + metin + renk ile anlatılır. */
export function StatusBadge({ status, expiringSoon }: { status: MemberStatus; expiringSoon?: boolean }) {
  if (status === "active" && expiringSoon) return <Badge tone="warning" icon="clock">Bitmek üzere</Badge>;
  const s = STATUS[status];
  return <Badge tone={s.tone} icon={s.icon}>{s.label}</Badge>;
}

export function Badge({ tone, icon, children }: { tone: "active" | "warning" | "danger" | "neutral"; icon?: Parameters<typeof Icon>[0]["name"]; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{icon && <Icon name={icon} />}{children}</span>;
}

export function CapacityBar({ booked, capacity, compact }: { booked: number; capacity: number; compact?: boolean }) {
  const level = occupancyLevel(booked, capacity);
  const pct = Math.min(100, Math.round((booked / Math.max(1, capacity)) * 100));
  const label = level === "full" ? "Dolu" : `${capacity - booked} yer kaldı`;
  return (
    <div className={`capacity capacity--${level} ${compact ? "capacity--compact" : ""}`}>
      <div className="capacity__row">
        <span className="capacity__count">{booked}/{capacity}</span>
        <span className="capacity__label">{level === "full" && <Icon name="lock" />}{label}</span>
      </div>
      <div className="capacity__track" role="progressbar" aria-label="Doluluk" aria-valuemin={0} aria-valuemax={capacity} aria-valuenow={booked} aria-valuetext={`${capacity} kişilik derste ${booked} kişi kayıtlı`}>
        <div className="capacity__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function StatCard({ label, value, sub, icon }: { label: string; value: ReactNode; sub?: ReactNode; icon: Parameters<typeof Icon>[0]["name"] }) {
  return (
    <section className="stat" aria-label={label}>
      <div className="stat__icon" aria-hidden="true"><Icon name={icon} /></div>
      <p className="stat__label">{label}</p>
      <p className="stat__value">{value}</p>
      {sub && <p className="stat__sub">{sub}</p>}
    </section>
  );
}

export function EmptyState({ title, children, icon = "search" }: { title: string; children?: ReactNode; icon?: Parameters<typeof Icon>[0]["name"] }) {
  return (
    <div className="empty" role="status">
      <div className="empty__icon" aria-hidden="true"><Icon name={icon} /></div>
      <p className="empty__title">{title}</p>
      {children && <div className="empty__body">{children}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="alert alert--danger" role="alert">
      <Icon name="alert" />
      <div>
        <p className="alert__title">Veriler yüklenemedi</p>
        <p>{error.message}</p>
      </div>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Tekrar dene</Button>}
    </div>
  );
}

export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Yükleniyor">
      {Array.from({ length: lines }, (_, i) => <div key={i} className="skeleton__line" />)}
    </div>
  );
}

/** Sağdan açılan yan panel. role=dialog, Esc ile kapanır, odak içeride tutulur ve kapanınca açan öğeye döner. */
export function Drawer({ title, open, onClose, children, footer }: { title: string; open: boolean; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const panel = panelRef.current!;
    const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute("disabled"));
    (panel.querySelector<HTMLElement>("input, select, textarea") ?? focusables()[0])?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key === "Tab") {
        const list = focusables();
        if (!list.length) return;
        const first = list[0], last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; opener?.focus(); };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panelRef} className="drawer" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="drawer__header">
          <h2 id={titleId} className="drawer__title">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Kapat"><Icon name="x" /></button>
        </header>
        <div className="drawer__body">{children}</div>
        {footer && <footer className="drawer__footer">{footer}</footer>}
      </div>
    </div>
  );
}

/** Onay penceresi (UT-01: geri alınabilir ama dikkat isteyen işlemler için). */
export function ConfirmDialog({ open, title, body, confirmLabel, tone = "danger", onConfirm, onCancel, loading }: {
  open: boolean; title: string; body: ReactNode; confirmLabel: string; tone?: "danger" | "primary"; onConfirm: () => void; onCancel: () => void; loading?: boolean;
}) {
  return (
    <Drawer open={open} title={title} onClose={onCancel} footer={<>
      <Button variant="secondary" onClick={onCancel}>Vazgeç</Button>
      <Button variant={tone} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
    </>}>
      {body}
    </Drawer>
  );
}
