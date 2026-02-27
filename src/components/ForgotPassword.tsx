import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.scss";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// ─── Decorations ──────────────────────────────────────────────────────────────
const ForgotDecorations: React.FC = () => (
  <>
    <div className="s0-rings" aria-hidden="true">
      <span className="s0-ring s0-ring-1" />
      <span className="s0-ring s0-ring-2" />
      <span className="s0-ring s0-ring-3" />
    </div>
    <div className="reg-corner-dots top-left" aria-hidden="true">
      {Array.from({ length: 16 }).map((_, i) => <span key={i} />)}
    </div>
    <div className="reg-corner-dots bottom-right" aria-hidden="true">
      {Array.from({ length: 16 }).map((_, i) => <span key={i} />)}
    </div>
    <div className="reg-deco-line left"  aria-hidden="true" />
    <div className="reg-deco-line right" aria-hidden="true" />
  </>
);

// ─── Forgot Password Page ─────────────────────────────────────────────────────
const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim())                                  { setError("Email is required"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))     { setError("Please enter a valid email"); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${BASE}/password/forgot`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <ForgotDecorations />

      <a href="/" className="reg-home-btn" aria-label="Back to home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
          <polyline points="9 21 9 12 15 12 15 21" />
        </svg>
        Home
      </a>

      <div className="step-content step1-layout">
        <div className="step1-card">
          {!success ? (
            <>
              <div className="step1-header">
                <img className="step1-mascot" src="../../images/dog-register.svg" alt="dog mascot" />
                <h1 className="step1-title">Forgot Password?</h1>
                <p className="step1-sub">
                  No worries! Enter your email below and<br />
                  we'll send you a reset link.
                </p>
              </div>

              <div className="field-grid">
                <div className="field-wrap">
                  <input
                    className={`field-input ${error ? "error" : ""}`}
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  {error && <span className="field-error">{error}</span>}
                </div>
              </div>

              <div className="step1-footer-note">
                Remember your password?{" "}
                <a href="/login">Log in here</a>
              </div>
            </>
          ) : (
            // ── Success state ──
            <div className="forgot-success">
              <div className="forgot-success-icon">📬</div>
              <h2 className="forgot-success-title">Check your inbox!</h2>
              <p className="forgot-success-text">
                If an account exists for <strong>{email}</strong>, we've sent
                a password reset link. It expires in <strong>1 hour</strong>.
              </p>
              <p className="forgot-success-sub">
                Didn't receive it? Check your spam folder or{" "}
                <button className="forgot-resend-btn" onClick={() => setSuccess(false)}>
                  try again
                </button>.
              </p>
              <button className="forgot-back-btn" onClick={() => navigate("/login")}>
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>

      {!success && (
        <div className="reg-actions centered">
          <button
            className={`btn-next register-btn ${!email || loading ? "disabled" : ""}`}
            disabled={!email || loading}
            onClick={handleSubmit}
          >
            {loading
              ? <><span className="btn-spinner" /> Sending…</>
              : <>
                  Send Reset Link
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                    <polyline points="9 18 15 12 9 6" />
                    <polyline points="14 18 20 12 14 6" />
                  </svg>
                </>
            }
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;