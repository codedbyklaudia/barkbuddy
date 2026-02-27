import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./VerifyBusinessEmail.scss";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

type Status = "loading" | "success" | "error";

const VerifyBusinessEmail: React.FC = () => {
  const location = useLocation();
  const [status,  setStatus]  = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // With HashRouter, the email link is: /#/business/verify-email?token=...
    // When opened directly from email, query string lives in window.location.hash
    // When navigated internally, it lives in location.search
    // Try both to be safe.
    let token: string | null = null;

    // 1. Try location.search first (internal navigation)
    if (location.search) {
      token = new URLSearchParams(location.search).get("token");
    }

    // 2. Fallback: parse query from the hash itself (direct link from email)
    if (!token) {
      const hash = window.location.hash; // e.g. "#/business/verify-email?token=abc"
      const qIndex = hash.indexOf("?");
      if (qIndex !== -1) {
        token = new URLSearchParams(hash.slice(qIndex)).get("token");
      }
    }

    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link. Please check the email and try again.");
      return;
    }

    fetch(`${API_BASE}/business/verify-email?token=${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(data => {
        if (data.verified) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed. Please contact us.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again or contact website.barkbuddy@gmail.com");
      });
  }, [location.search]);

  return (
    <div className="vbe-page">
      <div className="vbe-card">

        {status === "loading" && (
          <>
            <div className="vbe-spinner" aria-label="Verifying your email…" />
            <h1 className="vbe-title">Verifying your email…</h1>
            <p className="vbe-text">Just a moment, please.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="vbe-icon vbe-icon--success" aria-hidden="true">✅</div>
            <h1 className="vbe-title">Email verified!</h1>
            <p className="vbe-text">{message}</p>
            <Link to="/" className="vbe-btn">Back to BarkBuddy</Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="vbe-icon vbe-icon--error" aria-hidden="true">❌</div>
            <h1 className="vbe-title">Verification failed</h1>
            <p className="vbe-text">{message}</p>
            <a href="mailto:website.barkbuddy@gmail.com" className="vbe-btn vbe-btn--outline">
              Contact support
            </a>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyBusinessEmail;