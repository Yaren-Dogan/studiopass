import { StrictMode, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Layout } from "./components/Layout";
import { ToastProvider } from "./components/Toast";
import { Skeleton } from "./components/ui";
import { AuthProvider, homeFor, useAuth } from "./lib/auth";
import { matchPath, navigate, usePath } from "./lib/router";
import { ClassDetailPage } from "./pages/ClassDetailPage";
import { ClassesPage } from "./pages/ClassesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { MemberDetailPage } from "./pages/MemberDetailPage";
import { MembersPage } from "./pages/MembersPage";
import { PlansPage } from "./pages/PlansPage";
import { DatabasePage } from "./pages/DatabasePage";
import "./styles/tokens.css";
import "./styles/app.css";

const TITLES: Record<string, string> = { "/": "Özet", "/members": "Üyeler", "/classes": "Dersler", "/plans": "Planlar", "/database": "Veritabanı", "/login": "Giriş" };

function Routes() {
  const path = usePath();
  const { user, loading } = useAuth();
  const prevPath = useRef(path);

  useEffect(() => {
    const base = "/" + (path.split("/")[1] ?? "");
    document.title = `${TITLES[base] ?? "StudioPass"} · StudioPass`;
    // Sayfa değişiminde odağı ana içeriğe taşı (ekran okuyucu kullanıcıları için).
    // İlk yüklemede taşınmaz; aksi halde "İçeriğe geç" bağlantısı atlanır (BUG-012).
    if (prevPath.current === path) return;
    prevPath.current = path;
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [path]);

  useEffect(() => {
    if (loading) return;
    if (!user && path !== "/login") navigate("/login", { replace: true });
    if (user && path === "/login") navigate(homeFor(user.role), { replace: true });
    if (user?.role === "instructor" && path === "/") navigate("/classes", { replace: true });
  }, [user, loading, path]);

  if (loading) return <div className="boot"><Skeleton lines={3} /></div>;
  if (!user) return path === "/login" ? <LoginPage /> : null;

  let page;
  let p: Record<string, string> | null;
  if (path === "/") page = <DashboardPage />;
  else if (path === "/members") page = <MembersPage />;
  else if ((p = matchPath("/members/:id", path))) page = <MemberDetailPage key={p.id} id={p.id} />;
  else if (path === "/classes") page = <ClassesPage />;
  else if ((p = matchPath("/classes/:id", path))) page = <ClassDetailPage key={p.id} id={p.id} />;
  else if (path === "/plans") page = <PlansPage />;
  else if (path === "/database" && user.role === "owner") page = <DatabasePage />;
  else page = <div className="empty"><p className="empty__title">Sayfa bulunamadı</p></div>;

  return <Layout>{page}</Layout>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <Routes />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
);
