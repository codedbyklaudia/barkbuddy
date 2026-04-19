import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./BusinessLogin.scss";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

const BusinessResetPassword: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const token     = new URLSearchParams(location.search).get("token") ?? "";

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [form,    setForm]    = useState({ password: "", confirmPassword: "" });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    fetch(`${API_BASE}/business/password/verify-token?token=${token}`)
      .then(r => r.json())
      .then(d => setTokenValid(d.valid))
      .catch(() => setTokenValid(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res  = await fetch(`${API_BASE}/business/password/reset`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token, ...form }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { setDone(true); setTimeout(() => navigate("/business/login"), 2500); }
    else { setErrors(data.errors ?? { password: data.message }); }
  };

  return (
    <div className="biz-login">
      <aside className="biz-login__panel">
        <div className="biz-login__panel-inner">
          <div className="biz-login__brand">
            <h1>BarkBuddy<br /><em>for Business</em></h1>
            <p>Set a new password for your business account.</p>
          </div>
          <Link to="/business/login" className="biz-login__home-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg> Back to login</Link>
        </div>
      </aside>

      <main className="biz-login__form-side">
        <div className="biz-login__form-inner">
          {tokenValid === null && (
            <p style={{ color: "rgba(45,31,94,0.4)" }}>Verifying link…</p>
          )}

          {tokenValid === false && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                <img
                  src="../../images/icons/error.svg"
                  alt="Error"
                  style={{ width: "15%", height: "15%" }}
                  loading="lazy"
                  decoding="async"
                  width={1}
                  height={1}
                />
              </div>
              <h2 style={{ fontFamily: "Marcellus, serif", fontWeight: 600, color: "#3a2f51", marginBottom: "3rem" }}>
                Link expired or invalid
              </h2>
              <p style={{ fontFamily: "Fredoka, sans-serif", color: "#3a2f51", fontSize: "1.3rem", marginBottom: "2rem", lineHeight: 1.7 }}>
                This reset link has expired or already been used. Please request a new one.
              </p>
              <Link to="/business/forgot-password" style={{ color: "#927ACF",fontSize: "1.2rem", fontWeight: 700, textDecoration: "none" }}>
                Request new reset link
              </Link>
            </div>
          )}

          {tokenValid === true && !done && (
            <>
              <div className="biz-login__form-header">
                <h2>Set new password</h2>
                <p>At least 8 characters, one uppercase letter, and one number.</p>
              </div>
              {Object.keys(errors).length > 0 && (
                <div className="biz-login__error" role="alert">
                  {Object.values(errors)[0]}
                </div>
              )}
              <form className="biz-login__form" onSubmit={handleSubmit} noValidate>
                <div className="biz-field">
                  <label htmlFor="brp-pw">New password</label>
                  <input
                    id="brp-pw" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    autoFocus
                  />
                  {errors.password && <span className="biz-field__hint" style={{ color: "#dc2626" }}>{errors.password}</span>}
                </div>
                <div className="biz-field">
                  <label htmlFor="brp-confirm">Confirm new password</label>
                  <input
                    id="brp-confirm" type="password" placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  />
                  {errors.confirmPassword && <span className="biz-field__hint" style={{ color: "#dc2626" }}>{errors.confirmPassword}</span>}
                </div>
                <button type="submit" className="biz-login__submit" disabled={loading}>
                  {loading ? <><span className="biz-login__spinner" />Saving…</> : "Set new password"}
                </button>
              </form>
            </>
          )}

          {done && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 400, color: "#2d1f5e", marginBottom: "1rem" }}>
                Password updated!
              </h2>
              <p style={{ color: "rgba(45,31,94,0.5)", lineHeight: 1.7 }}>
                Redirecting you to login…
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BusinessResetPassword;