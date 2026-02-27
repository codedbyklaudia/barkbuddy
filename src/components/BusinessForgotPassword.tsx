import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./BusinessLogin.scss"; // reuse same styles

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

const BusinessForgotPassword: React.FC = () => {
  const [email,   setEmail]   = useState("");
  const [status,  setStatus]  = useState<"idle"|"sent"|"error">("idle");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/business/password/forgot`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      if (res.ok) { setStatus("sent"); }
      else { const d = await res.json(); setError(d.message ?? "Something went wrong."); }
    } catch { setError("Could not connect. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="biz-login">
      <aside className="biz-login__panel">
        <div className="biz-login__panel-inner">
          <div className="biz-login__brand">
            <h1>BarkBuddy<br /><em>for Business</em></h1>
            <p>We'll send a reset link to your registered email address.</p>
          </div>
          <Link to="/business/login" className="biz-login__home-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg> Back to login</Link>
        </div>
      </aside>

      <main className="biz-login__form-side">
        <div className="biz-login__form-inner">
          {status === "sent" ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}><img style={{ width: "15%", height: "15%" }} src="../images/icons/sent.svg"></img>
              </div>
              <h2 className="biz-login__form-header" style={{ color: "#3a2f51", marginBottom: "4rem" }}>Check your inbox</h2>
              <p style={{ color: "#3a2f51", fontSize: "1.4rem", lineHeight: 1.7, marginBottom: "2rem" }}>
                If an approved account exists with that email, we've sent a reset link. It expires in 1 hour.
              </p>
              <Link to="/business/login" style={{ color: "#927ACF", fontSize: "1.3rem", fontWeight: 700, textDecoration: "none" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg> Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="biz-login__form-header">
                <h2>Forgot your password?</h2>
                <p>Enter the email address on your business account and we'll send a reset link.</p>
              </div>
              {error && <div className="biz-login__error" role="alert">{error}</div>}
              <form className="biz-login__form" onSubmit={handleSubmit} noValidate>
                <div className="biz-field">
                  <label htmlFor="bfp-email">Email address</label>
                  <input
                    id="bfp-email" type="email" placeholder="you@yourbusiness.com"
                    value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                    autoComplete="email" autoFocus
                  />
                </div>
                <button type="submit" className="biz-login__submit" disabled={loading}>
                  {loading ? <><span className="biz-login__spinner" />Sending…</> : "Send reset link"}
                </button>
              </form>
              <p className="biz-login__contact">
                <Link to="/business/login"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg> Back to login</Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default BusinessForgotPassword;