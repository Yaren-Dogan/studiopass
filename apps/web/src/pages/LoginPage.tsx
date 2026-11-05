import { useRef, useState, type FormEvent } from "react";
import { Icon } from "../components/Icon";
import { Button, TextField } from "../components/ui";
import { ApiError } from "../lib/api";
import { homeFor, useAuth } from "../lib/auth";
import { navigate } from "../lib/router";

/** S-01 · US-01 */
export function LoginPage() {
  const { login, sessionExpired } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const errs: typeof fieldErrors = {};
    if (!email.trim()) errs.email = "E-posta zorunludur";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) errs.email = "Geçerli bir e-posta adresi girin";
    if (!password) errs.password = "Şifre zorunludur";
    setFieldErrors(errs);
    if (errs.email) return emailRef.current?.focus();
    if (errs.password) return passwordRef.current?.focus();

    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      navigate(homeFor(user.role), { replace: true });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Beklenmeyen bir hata oluştu");
      passwordRef.current?.select();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__art" aria-hidden="true">
        <div className="auth__circle auth__circle--1" />
        <div className="auth__circle auth__circle--2" />
        <p className="auth__quote">Üyelik, ders ve kapasite — <em>tek panelde, sakin.</em></p>
      </div>
      <div className="auth__panel">
        <form className="auth__form" onSubmit={onSubmit} noValidate>
          <div className="brand brand--lg">
            <span className="brand__mark" aria-hidden="true"><svg viewBox="0 0 32 32" width="40" height="40"><rect width="32" height="32" rx="8" fill="currentColor" /><path d="M9 21c2.5 2 11.5 2 14 0M16 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" fill="none" stroke="#F7F5F0" strokeWidth="2.4" strokeLinecap="round" /></svg></span>
            <span className="brand__name">StudioPass</span>
          </div>
          <h1 className="auth__title">Tekrar hoş geldiniz</h1>
          <p className="auth__lead">Stüdyo panelinize giriş yapın.</p>

          {sessionExpired && !formError && (
            <div className="alert alert--warning" role="status"><Icon name="clock" /><p>Oturumunuzun süresi doldu, lütfen tekrar giriş yapın.</p></div>
          )}
          {formError && (
            <div className="alert alert--danger" role="alert"><Icon name="alert" /><p>{formError}</p></div>
          )}

          <TextField ref={emailRef} label="E-posta" type="email" name="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} error={fieldErrors.email} />
          <TextField ref={passwordRef} label="Şifre" type="password" name="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} error={fieldErrors.password} />
          <Button type="submit" loading={loading} className="btn--block">Giriş yap</Button>

          <details className="demo">
            <summary>Demo hesapları</summary>
            <p>Şifre: <code>Studio123!</code></p>
            <ul>
              <li><code>elif@studiopass.dev</code> — Stüdyo sahibi</li>
              <li><code>mert@studiopass.dev</code> — Yönetici</li>
              <li><code>deniz@studiopass.dev</code> — Eğitmen</li>
            </ul>
          </details>
        </form>
      </div>
    </div>
  );
}
