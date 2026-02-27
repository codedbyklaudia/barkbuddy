import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Login.scss";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// ─── Decorations ──────────────────────────────────────────────────────────────
const ResetDecorations: React.FC = () => (
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

// ─── Eye Toggle ───────────────────────────────────────────────────────────────
const EyeIcon: React.FC<{ visible: boolean }> = ({ visible }) =>
  visible ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

// ─── Reset Password Page ──────────────────────────────────────────────────────
const ResetPasswordPage: React.FC = () => {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const token           = searchParams.get("token") || "";

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw,          setShowPw]          = useState(false);
  const [showCpw,         setShowCpw]         = useState(false);
  const [errors,          setErrors]          = useState<Record<string, string>>({});
  const [loading,         setLoading]         = useState(false);
  const [success,         setSuccess]         = useState(false);
  const [tokenValid,      setTokenValid]      = useState<boolean | null>(null);

  // ── Verify token is valid on page load ────────────────────────────────────
  useEffect(() => {
    if (!token) { setTokenValid(false); return; }

    fetch(`${BASE}/password/verify-token?token=${token}`)
      .then((r) => r.json())
      .then((d) => setTokenValid(d.valid))
      .catch(() => setTokenValid(false));
  }, [token]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!password)                             e.password        = "Password is required";
    else if (password.length < 8)              e.password        = "Minimum 8 characters";
    else if (!/[A-Z]/.test(password))          e.password        = "Must contain an uppercase letter";
    else if (!/[0-9]/.test(password))          e.password        = "Must contain a number";
    if (!confirmPassword)                      e.confirmPassword = "Please confirm your password";
    else if (confirmPassword !== password)     e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/password/reset`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setErrors({ general: data.message || "Something went wrong" });
        return;
      }
      setSuccess(true);
    } catch {
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = password && confirmPassword;

  // ── Loading token check ───────────────────────────────────────────────────
  if (tokenValid === null) return (
    <div className="register-page">
      <ResetDecorations />
      <div className="step-content step1-layout">
        <div className="step1-card">
          <div className="step1-header">
            <div className="forgot-success-icon">🔐</div>
            <h1 className="step1-title">Verifying link…</h1>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Invalid / expired token ───────────────────────────────────────────────
  if (!tokenValid) return (
    <div className="register-page">
      <ResetDecorations />
      <a href="/" className="reg-home-btn" aria-label="Back to home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
          <polyline points="9 21 9 12 15 12 15 21" />
        </svg>
        Home
      </a>
      <div className="step-content step1-layout">
        <div className="step1-card">
          <div className="forgot-success">
            <div className="forgot-success-icon">⏰</div>
            <h2 className="forgot-success-title">Link Expired</h2>
            <p className="forgot-success-text">
              This password reset link is invalid or has expired.<br />
              Reset links are only valid for <strong>1 hour</strong>.
            </p>
            <button className="forgot-back-btn" onClick={() => navigate("/forgot-password")}>
              Request a new link
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="register-page">
      <ResetDecorations />

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
                <h1 className="step1-title">New Password</h1>
                <p className="step1-sub">
                  Choose a strong password for<br />your BarkBuddy account.
                </p>
              </div>

              {errors.general && <div className="login-api-error">⚠️ {errors.general}</div>}

              <div className="field-grid">
                <div className="field-wrap">
                  <div className="password-wrap">
                    <input
                      className={`field-input ${errors.password ? "error" : ""}`}
                      type={showPw ? "text" : "password"}
                      placeholder="New password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => { const e = {...p}; delete e.password; return e; }); }}
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}>
                      <EyeIcon visible={showPw} />
                    </button>
                  </div>
                  {errors.password && <span className="field-error">{errors.password}</span>}
                  <span className="field-hint">Min 8 chars, one uppercase, one number</span>
                </div>

                <div className="field-wrap">
                  <div className="password-wrap">
                    <input
                      className={`field-input ${errors.confirmPassword ? "error" : ""}`}
                      type={showCpw ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors((p) => { const e = {...p}; delete e.confirmPassword; return e; }); }}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowCpw(!showCpw)}>
                      <EyeIcon visible={showCpw} />
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                </div>
              </div>
            </>
          ) : (
            // ── Success state ──
            <div className="forgot-success">
              <div className="forgot-success-icon">🎉</div>
              <h2 className="forgot-success-title">Password Updated!</h2>
              <p className="forgot-success-text">
                Your password has been reset successfully.<br />
                You can now log in with your new password.
              </p>
              <button className="forgot-back-btn" onClick={() => navigate("/login")}>
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>

      {!success && (
        <div className="reg-actions centered">
          <button
            className={`btn-next register-btn ${!canProceed || loading ? "disabled" : ""}`}
            disabled={!canProceed || loading}
            onClick={handleSubmit}
          >
            {loading
              ? <><span className="btn-spinner" /> Resetting…</>
              : <>
                  Reset Password
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

export default ResetPasswordPage;