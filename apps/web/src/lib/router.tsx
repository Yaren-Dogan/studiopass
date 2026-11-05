import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from "react";

// Küçük, bağımlılıksız bir istemci yönlendiricisi (ADR-003).

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  window.addEventListener("popstate", fn);
  return () => { listeners.delete(fn); window.removeEventListener("popstate", fn); };
};
const getPath = () => window.location.pathname;

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (opts.replace) window.history.replaceState(null, "", to);
  else window.history.pushState(null, "", to);
  listeners.forEach((fn) => fn());
  window.scrollTo(0, 0);
}

export function usePath() {
  return useSyncExternalStore(subscribe, getPath, () => "/");
}

/** "/members/:id" desenini yola uygular. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const keys: string[] = [];
  const re = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, k: string) => { keys.push(k); return "([^/]+)"; })}/?$`);
  const m = re.exec(path);
  if (!m) return null;
  return Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
}

export function Link({ to, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to);
  };
  return <a href={to} onClick={handle} {...rest} />;
}
