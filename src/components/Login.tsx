import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import "./Login.scss";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/auth";

interface LoginFormData {
  email:    string;
  password: string;
}

// decorative background elements
const LoginDecorations: React.FC = () => (
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

// eye toggle icon
const LoginEyeIcon: React.FC<{ visible: boolean }> = ({ visible }) =>
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

const LoginForm: React.FC<{
  data:       LoginFormData;
  errors:     Record<string, string>;
  onChange:   (k: keyof LoginFormData, v: string) => void;
  onSubmit:   () => void;
  loading:    boolean;
  apiError:   string;
  canProceed: boolean;
}> = ({ data, errors, onChange, onSubmit, loading, apiError, canProceed }) => {
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="step-content login-layout">
      <div className="login-mascot-mobile" aria-hidden="true">
        <img
          src="../../images/dog-register.svg"
          alt=""
          loading="eager"
          decoding="sync"
          width={1}
          height={1}
        />
      </div>

      <div className="login-card">
        <div className="login-header">
          {/* desktop mascot: absolute top-right */}
          <img
            className="login-mascot"
            src="../../images/dog-register.svg"
            alt="dog mascot"
            loading="eager"
            decoding="sync"
            width={1}
            height={1}
          />
          <h1 className="login-title">Log In</h1>
          <p className="login-sub">
            Ohh, good to see you again.<br />
            Let's get back to dog life.
          </p>
        </div>

        <div className="field-grid">
          <div className="field-wrap">
            <input
              className={`field-input ${errors.email ? "error" : ""}`}
              type="email"
              placeholder="Your email address"
              value={data.email}
              onChange={(e) => onChange("email", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field-wrap">
            <div className="password-wrap">
              <input
                className={`field-input ${errors.password ? "error" : ""}`}
                type={showPw ? "text" : "password"}
                placeholder="Your password"
                value={data.password}
                onChange={(e) => onChange("password", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                <LoginEyeIcon visible={showPw} />
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
        </div>

        <div className="login-forgot">
          <Link to={"/forgot-password"}>Forgot password?</Link>
        </div>

        {apiError && <div className="api-error-banner">⚠️ {apiError}</div>}

        <div className="log-actions centered">
          <button
            className={`btn-next login-btn ${!canProceed || loading ? "disabled" : ""}`}
            disabled={!canProceed || loading}
            onClick={onSubmit}
            style={{ background: '#3b2067', color: '#ede8f5' }}
          >
            {loading
              ? <><span className="btn-spinner" /> Logging in…</>
              : <>
                  Login
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                    <polyline points="9 18 15 12 9 6" />
                    <polyline points="14 18 20 12 14 6" />
                  </svg>
                </>
            }
          </button>
        </div>

        {/* 2 lines, each a plain paragraph - immune to flex cascade issues */}
        <div className="login-footer-note">
          <p>Don't have an account? <Link to={"/register"}>Register here</Link></p>
          <p>Business Owner? <Link to={"/business/login"} className="biz-link">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

const LoginPage: React.FC = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleChange = (key: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
    if (apiError)    setApiError("");
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.email)    e.email    = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Please enter a valid email";
    if (!formData.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const res = await loginUser({ email: formData.email, password: formData.password });
      login(res.token, res.user, res.dog);
      navigate("/dashboard");
    } catch (err: any) {
      if (err.errors) setErrors(err.errors);
      else setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = !!formData.email && !!formData.password;

  return (
    <div className="login-page">
      <LoginDecorations />

      <Link to={"/"} className="reg-home-btn" aria-label="Back to home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
          <polyline points="9 21 9 12 15 12 15 21" />
        </svg>
        Home
      </Link>

      <LoginForm
        data={formData}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        loading={loading}
        apiError={apiError}
        canProceed={canProceed}
      />
    </div>
  );
};

export default LoginPage;