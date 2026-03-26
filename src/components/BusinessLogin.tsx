import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./BusinessLogin.scss";
import { ChevronsLeft } from 'lucide-react';


const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

const BusinessLogin: React.FC = () => {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ username: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/business/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("business_token",    data.token);
        localStorage.setItem("business_user",     JSON.stringify(data.business));
        navigate("/business/dashboard");
      } else {
        setError(data.message ?? "Invalid username or password.");
      }
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="biz-login">

      {/* Left — brand panel */}
      <aside className="biz-login__panel">
        <div className="biz-login__panel-inner">
          <img src="/images/logo.png" alt="BarkBuddy for business" className="biz-login__brand-icon" />
          <div className="biz-login__brand">
            <h1>BarkBuddy<br /><em>for Business</em></h1>
            <p>Manage your listing, update your details, and connect with dog owners in your area.</p>
            <Link to="/" className="biz-login__home-link"><ChevronsLeft  size={"18"} /> Back to BarkBuddy</Link>
          </div>
        </div>
      </aside>

      {/* Right — form */}
      <main className="biz-login__form-side">
        <div className="biz-login__form-inner">

          <div className="biz-login__form-header">
            <h2>Welcome back</h2>
            <p>Log in with the username sent to you when your listing was approved.</p>
          </div>

          {error && (
            <div className="biz-login__error" role="alert">{error}</div>
          )}

          <form className="biz-login__form" onSubmit={handleSubmit} noValidate>

            <div className="biz-field">
              <label htmlFor="bl-username">Username</label>
              <input
                id="bl-username"
                name="username"
                type="text"
                placeholder="barkbuddy-username-001"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                autoFocus
                spellCheck={false}
                autoCapitalize="none"
              />
              <span className="biz-field__hint">
                Your username was emailed to you when your listing was approved
              </span>
            </div>

            <div className="biz-field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label htmlFor="bl-password">Password</label>
                <Link to="/business/forgot-password" style={{ fontSize: "0.85rem", color: "#7c5cbf", textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="bl-password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="biz-login__submit"
              disabled={loading}
            >
              {loading ? (
                <><span className="biz-login__spinner" />Signing in…</>
              ) : (
                "Sign in to dashboard"
              )}
            </button>

          </form>

          <p className="biz-login__contact">
            Can't find your username?{" "}
            <Link to="/contact">Contact us</Link>
          </p>
          <p className="biz-login_noaccount">Don't have an account yet?{" "}
            <Link to="/register-business" className="biz-login__register-link">
              List your business here
            </Link>
          </p>

        </div>
      </main>

    </div>
  );
};

export default BusinessLogin;