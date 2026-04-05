import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import "./Register.scss";
import { useDogBreeds } from "./Usedogbreeds";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../api/auth";
import {
  validateStep1, validateStep2, validateStep3, validateStep4, validateStep5,
  type ValidationErrors, isValid,
} from "../utils/validation";
import { getBreedData } from "./breedData";

// Types 
interface FormData {
  email:           string;
  name:            string;
  password:        string;
  confirmPassword: string;
  dogName:         string;
  dogGender:       "male" | "female" | "";
  breed:           string;
  dogDob:          string;
  lifeStage:       "puppy" | "adult" | "senior" | "";
  personality:     string[];
}

// Static Data 
const LIFE_STAGES = [
  { key: "puppy",  label: "Puppy",  icon: "../../images/icons/lifestage/puppy.svg",  age: "0–1 yrs" },
  { key: "adult",  label: "Adult",  icon: "../../images/icons/lifestage/adult.svg",  age: "1–7 yrs" },
  { key: "senior", label: "Senior", icon: "../../images/icons/lifestage/senior.svg", age: "7+ yrs"  },
] as const;

// Personality categories (Butternut Box style) 
interface PersonalityOption   { key: string; label: string; img: string; }
interface PersonalityCategory { 
  id: string; 
  question: (name: string) => string; 
  options: PersonalityOption[]; 
}

const PERSONALITY_CATEGORIES: PersonalityCategory[] = [
  {
    id: "fav_game",
    question: (name: string) => `What's ${name}'s favourite game?`,
    options: [
      { key: "game_fetch", label: "Ball chaser",    img: "../../images/personality/ball.png"    },
      { key: "game_tug",   label: "Tug of war",     img: "../../images/personality/tug.png"     },
      { key: "game_chase", label: "Chasing sticks", img: "../../images/personality/chase.png"   },
      { key: "game_hide",  label: "Hide & seek",    img: "../../images/personality/hide_and_seek.png"    },
      { key: "game_chill", label: "Just chilling",  img: "../../images/personality/chill.png"   },
    ],
  },
  {
    id: "fav_thing",
    question: (name: string) => "What does " + name + " love most?",
    options: [
      { key: "loves_cuddles", label: "Cuddles",           img: "../../images/personality/cuddles.png" },
      { key: "loves_treats",  label: "Tricks for treats", img: "../../images/personality/treats.png"  },
      { key: "loves_walks",   label: "Walkies",           img: "../../images/personality/walks.png"   },
      { key: "loves_friends", label: "Making friends",    img: "../../images/personality/friends.png" },
      { key: "loves_sleep",   label: "Sleeping",          img: "../../images/personality/sleep.png"   },
    ],
  },
  {
    id: "personality",
    question: (name: string) => `How would you describe ${name}?`,
    options: [
      { key: "pers_energetic", label: "High-energy",       img: "../../images/personality/high_energy.png" },
      { key: "pers_gentle",    label: "Gentle",            img: "../../images/personality/gentle.png"    },
      { key: "pers_cuddly",    label: "Cuddly",            img: "../../images/personality/cuddly.png"    },
      { key: "pers_playful",   label: "Playful",           img: "../../images/personality/playful.png"   },
      { key: "pers_stubborn",  label: "A little stubborn", img: "../../images/personality/stubborn.png"  },
    ],
  },
];

const setSelected = (personality: string[], catId: string, key: string): string[] => {
  const cat = PERSONALITY_CATEGORIES.find(c => c.id === catId);
  if (!cat) return personality;
  const catKeys = cat.options.map(o => o.key);
  return [...personality.filter(p => !catKeys.includes(p)), key];
};

// Email Verification API calls
const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const sendVerificationEmail = async (email: string): Promise<void> => {
  const res = await fetch("/api/auth/send-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to send verification email.");
  }
};

const verifyEmailCode = async (email: string, code: string): Promise<boolean> => {
  const res = await fetch("/api/auth/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Verification failed. Please try again.");
  }
  const data = await res.json();
  return data.valid === true;
};

// OTP Input Component
const OtpInput: React.FC<{
  value:    string[];
  onChange: (digits: string[]) => void;
  disabled?: boolean;
  hasError?: boolean;
}> = ({ value, onChange, disabled, hasError }) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const focus = (i: number) => inputsRef.current[i]?.focus();

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next  = [...value];
    next[i]     = digit;
    onChange(next);
    if (digit && i < 5) focus(i + 1);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (value[i]) {
        const next = [...value]; next[i] = ""; onChange(next);
      } else if (i > 0) {
        focus(i - 1);
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      focus(i - 1);
    } else if (e.key === "ArrowRight" && i < 5) {
      focus(i + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    const next   = [...value];
    pasted.forEach((d, idx) => { if (idx < 6) next[idx] = d; });
    onChange(next);
    const lastFilled = Math.min(pasted.length, 5);
    focus(lastFilled);
  };

  return (
    <div className="otp-input-row">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          className={`otp-box ${value[i] ? "filled" : ""} ${hasError ? "error" : ""}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
};

// Step 1.5: Email Verification
const RESEND_COOLDOWN = 60;

const Step1_5: React.FC<{
  email:      string;
  onVerified: () => void;
  onBack:     () => void;
}> = ({ email, onVerified, onBack }) => {
  const [digits,    setDigits]    = useState<string[]>(Array(6).fill(""));
  const [sending,   setSending]   = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified,  setVerified]  = useState(false);
  const [codeError, setCodeError] = useState("");
  const [sendError, setSendError] = useState("");
  const [cooldown,  setCooldown]  = useState(RESEND_COOLDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Send the code on mount
  useEffect(() => {
    doSend();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const doSend = async () => {
    setSending(true);
    setSendError("");
    try {
      await sendVerificationEmail(email);
      startCooldown();
    } catch (err: any) {
      setSendError(err.message || "Couldn't send the code. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleResend = () => {
    if (cooldown > 0 || sending) return;
    setDigits(Array(6).fill(""));
    setCodeError("");
    doSend();
  };

  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length < 6) { setCodeError("Please enter the full 6-digit code."); return; }
    setVerifying(true);
    setCodeError("");
    try {
      const valid = await verifyEmailCode(email, code);
      if (valid) {
        setVerified(true);
        setTimeout(() => onVerified(), 1400);
      } else {
        setCodeError("That code doesn't match. Double-check and try again.");
      }
    } catch (err: any) {
      setCodeError(err.message || "Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const isFull = digits.every(Boolean);

  return (
    <div className="step-content step1-layout">
      <div className={`step1-card verify-card ${verified ? "verify-card--success" : ""}`}>

        {/* Icon */}
        <div className="verify-icon-wrap">
          {verified ? (
            <div className="verify-icon verify-icon--done">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          ) : (
            <div className="verify-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <polyline points="2,4 12,13 22,4" />
              </svg>
            </div>
          )}
        </div>

        {verified ? (
          <>
            <h2 className="verify-title">Email verified!</h2>
            <p className="verify-sub">Taking you to the next step… 🐾</p>
          </>
        ) : (
          <>
            <h2 className="verify-title">Check your inbox</h2>
            <p className="verify-sub">
              We've sent a 6-digit code to<br />
              <strong>{email}</strong>
            </p>

            {sendError && (
              <div className="verify-send-error">⚠️ {sendError}</div>
            )}

            <StepIndicator current={2} total={6} />

            <OtpInput
              value={digits}
              onChange={(d) => { setDigits(d); setCodeError(""); }}
              disabled={verifying || verified}
              hasError={!!codeError}
            />

            {codeError && <p className="verify-code-error">{codeError}</p>}

            <button
              className={`btn-next1 ${!isFull || verifying ? "disabled" : ""}`}
              disabled={!isFull || verifying}
              onClick={handleVerify}
            >
              {verifying ? <><span className="btn-spinner" /> Verifying…</> : "Verify email"}
            </button>

            <div className="verify-resend">
              {cooldown > 0 ? (
                <span className="verify-resend-timer">
                  Resend code in <strong>{cooldown}s</strong>
                </span>
              ) : (
                <button
                  className="verify-resend-btn"
                  onClick={handleResend}
                  disabled={sending}
                >
                  {sending ? "Sending…" : "Resend code"}
                </button>
              )}
            </div>

            <button className="verify-back-link" onClick={onBack}>
              ← Wrong email? Go back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Breed Fun Fact Card 
const BreedFactCard: React.FC<{ breed: string; dogName?: string }> = ({ breed }) => {
  const [dismissed, setDismissed] = useState(false);
  const [imgError,  setImgError]  = useState(false);
  const prevBreed = useRef(breed);
  const data = getBreedData(breed);

  useEffect(() => {
    if (prevBreed.current !== breed) {
      setDismissed(false);
      setImgError(false);
      prevBreed.current = breed;
    }
  }, [breed]);

  if (!data || dismissed) return null;

  const FALLBACK = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80";

  return (
    <div className="breed-fact-wrapper">
      <h3 className="breed-fact-heading">Did you know?</h3>
      <div className="breed-fact-card">
        <div className="breed-fact-photo">
          <img
            src={imgError ? FALLBACK : data.photo}
            alt={breed}
            onError={() => setImgError(true)}
          />
        </div>
        <div className="breed-fact-body">
          <p className="breed-fact-text">{data.fact}</p>
        </div>
        <button
          type="button"
          className="breed-fact-dismiss"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss fact"
        >
          <img src="../../images/icons/close1.svg" alt="close" width="20" height="20" />
        </button>
      </div>
    </div>
  );
};

// Field Error 
const FieldError: React.FC<{ error?: string }> = ({ error }) =>
  error ? <span className="field-error">{error}</span> : null;

// Shared Decorations
const PageDecorations: React.FC = () => (
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

// Step Indicator
const StepIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="step-indicator">
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <div className={`step-dot ${i + 1 === current ? "active" : i + 1 < current ? "done" : ""}`} />
        {i < total - 1 && <div className={`step-line ${i + 1 < current ? "done" : ""}`} />}
      </React.Fragment>
    ))}
  </div>
);

// Eye Toggle 
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

// Step 1: Name, email & password
const Step1: React.FC<{
  data:       FormData;
  errors:     ValidationErrors;
  onChange:   (k: keyof FormData, v: string) => void;
  onContinue: () => void;
  canProceed: boolean;
}> = ({ data, errors, onChange, onContinue, canProceed }) => {
  const [showPw,  setShowPw]  = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  return (
    <div className="step-content step1-layout">
      <div className="step1-card">
        <div className="step1-header">
          <img className="step1-mascot" src="../../images/dog-register.svg" alt="dog mascot" />
          <h1 className="step1-title">Join Our Family</h1>
          <p className="step1-sub">
            4 quick steps: you, your dog's details (obviously),
            <br />then just a few boring approvals.
            <br /><em>Your dog already approves!</em>
          </p>
        </div>

        <div className="field-grid">
          <div className="field-wrap">
            <input className={`field-input ${errors.email ? "error" : ""}`} type="email" placeholder="Your email address" value={data.email} onChange={(e) => onChange("email", e.target.value)} />
            <FieldError error={errors.email} />
          </div>
          <div className="field-wrap">
            <input className={`field-input ${errors.name ? "error" : ""}`} type="text" placeholder="Your name" value={data.name} onChange={(e) => onChange("name", e.target.value)} />
            <FieldError error={errors.name} />
          </div>
          <div className="field-wrap">
            <div className="password-wrap">
              <input className={`field-input ${errors.password ? "error" : ""}`} type={showPw ? "text" : "password"} placeholder="Choose a password" value={data.password} onChange={(e) => onChange("password", e.target.value)} />
              <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}><EyeIcon visible={showPw} /></button>
            </div>
            <FieldError error={errors.password} />
          </div>
          <div className="field-wrap">
            <div className="password-wrap">
              <input className={`field-input ${errors.confirmPassword ? "error" : ""}`} type={showCpw ? "text" : "password"} placeholder="Confirm password" value={data.confirmPassword} onChange={(e) => onChange("confirmPassword", e.target.value)} />
              <button type="button" className="eye-btn" onClick={() => setShowCpw(!showCpw)}><EyeIcon visible={showCpw} /></button>
            </div>
            <FieldError error={errors.confirmPassword} />
          </div>
        </div>

        <button className={`btn-next1 ${!canProceed ? "disabled" : ""}`} disabled={!canProceed} onClick={onContinue}>
          Continue
        </button>

        <div className="step1-footer-note">
          Already have an account? <Link to={"/login"}>Login here</Link>
          <span className="footer-divider"></span>
          Business Owner? <a href="/register/business" className="biz-link">Register here</a>
        </div>
      </div>
    </div>
  );
};

// Step 2: Dog name & breed 
const Step2: React.FC<{
  data:     FormData;
  errors:   ValidationErrors;
  onChange: (k: keyof FormData, v: string) => void;
}> = ({ data, errors, onChange }) => {
  const [search,   setSearch]   = useState(data.breed && data.breed !== "Mixed Breed" ? data.breed : "");
  const [showList, setShowList] = useState(false);
  const [isMixed,  setIsMixed]  = useState(data.breed === "Mixed Breed");
  const { breeds, loading, error, retry } = useDogBreeds();

  const filtered = breeds.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleMixedToggle = () => {
    if (isMixed) {
      setIsMixed(false);
      onChange("breed", "");
      setSearch("");
    } else {
      setIsMixed(true);
      onChange("breed", "Mixed Breed");
      setSearch("");
      setShowList(false);
    }
  };

  return (
    <div className="step-content split-layout">
      <div className="split-image">
        <img src="https://images.unsplash.com/photo-1601979031925-424e53b6caaa?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="fluffy dog" />
        <div className="image-overlay" />
      </div>
      <div className="split-form">
        <StepIndicator current={3} total={6} />
        <h2 className="step-heading">Step 2.</h2>

        <label className="field-label">What's your dog's name?</label>
        <div className="field-wrap">
          <input
            className={`field-input lavender ${errors.dogName ? "error" : ""}`}
            type="text"
            placeholder="e.g. Luna, Cooper, Max…"
            value={data.dogName}
            onChange={(e) => onChange("dogName", e.target.value)}
          />
          <FieldError error={errors.dogName} />
          <p className="anotherdog">Have another dog? Don't worry! You will be able to add all your buddies later in your dashboard!</p>
        </div>

        <label className="field-label" style={{ marginTop: "1.2rem" }}>
          Which breed are we taking care of?
        </label>

        {!isMixed && (
          <>
            <div className="field-wrap" style={{ marginTop: "0.6rem" }}>
              <div className="breed-input-wrap">
                <input
                  className={`field-input lavender ${data.breed ? "has-value" : ""} ${errors.breed ? "error" : ""}`}
                  type="text"
                  placeholder="Search breed…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowList(true);
                    if (data.breed) onChange("breed", "");
                  }}
                  onFocus={() => setShowList(true)}
                  disabled={loading}
                />
                {data.breed && (
                  <button className="breed-clear-btn" onClick={() => { onChange("breed", ""); setSearch(""); setShowList(true); }}>×</button>
                )}
              </div>
              <FieldError error={errors.breed} />
            </div>

            {showList && loading && (
              <div className="breed-state"><div className="breed-spinner" /><span>Loading breeds…</span></div>
            )}
            {showList && !loading && error && (
              <div className="breed-state breed-error">
                <span>⚠️ {error}</span>
                <button className="retry-btn" onClick={retry}>Retry</button>
              </div>
            )}
            {showList && !loading && !error && (
              filtered.length === 0
                ? <div className="breed-state"><span>No breeds match "{search}"</span></div>
                : <div className="breed-list">
                    {filtered.map((b) => (
                      <div
                        key={b.id}
                        className={`breed-item ${data.breed === b.name ? "selected" : ""}`}
                        onClick={() => { onChange("breed", b.name); setSearch(b.name); setShowList(false); }}
                      >
                        <span>{b.name}</span>
                        <span className={`breed-dot ${data.breed === b.name ? "filled" : ""}`} />
                      </div>
                    ))}
                  </div>
            )}
          </>
        )}

        <label className="mixed-breed-toggle" onClick={handleMixedToggle}>
          <div className={`mixed-breed-check ${isMixed ? "checked" : ""}`}>
            {isMixed && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <span className="mixed-breed-label">
            {data.dogName
              ? <><strong>{data.dogName}</strong> has an adorable unknown, mixed breed 🐾</>
              : <>My dog has an adorable unknown, mixed breed 🐾</>
            }
          </span>
        </label>

        {data.breed && data.breed !== "Mixed Breed" && (
          <BreedFactCard breed={data.breed} dogName={data.dogName} />
        )}
      </div>
    </div>
  );
};

// Step 3: DOB, life stage & personality
const Step3: React.FC<{
  data:     FormData;
  errors:   ValidationErrors;
  onChange: (k: keyof FormData, v: string | string[]) => void;
}> = ({ data, errors, onChange }) => {
  const dobRef = React.useRef<HTMLInputElement>(null);
  const [dobUnknown, setDobUnknown] = useState(false);

  const handleDobChange = (dob: string) => {
    onChange("dogDob", dob);
    if (!dob) return;
    const birth = new Date(dob);
    const now   = new Date();
    const ageInMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (ageInMonths < 12)      onChange("lifeStage", "puppy");
    else if (ageInMonths < 84) onChange("lifeStage", "adult");
    else                        onChange("lifeStage", "senior");
  };

  const handleDobUnknown = () => {
    if (!dobUnknown) { setDobUnknown(true); onChange("dogDob", ""); }
    else              { setDobUnknown(false); }
  };

  const selectedCatCount = PERSONALITY_CATEGORIES.filter(cat =>
    cat.options.some(opt => data.personality.includes(opt.key))
  ).length;

  return (
    <div className="step-content split-layout">
      <div className="split-image">
        <img src="https://plus.unsplash.com/premium_photo-1666229410352-c4686b71cea2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="fluffy dog" />
        <div className="image-overlay" />
      </div>
      <div className="split-form">
        <StepIndicator current={4} total={6} />
        <h2 className="step-heading">Step 3.</h2>

        <label className="field-label">
          When was {data.dogName || "your dog"} born?
          <span className="field-hint"> (optional)</span>
        </label>

        <div className="dob-row">
          <div className={`field-wrap dob-field-wrap ${dobUnknown ? "dob-disabled" : ""}`} onClick={() => !dobUnknown && dobRef.current?.showPicker()}>
            <input ref={dobRef} className={`field-input lavender calendar-input ${errors.dogDob ? "error" : ""}`} type="date" value={data.dogDob} disabled={dobUnknown} onChange={(e) => handleDobChange(e.target.value)} />
            <FieldError error={errors.dogDob} />
          </div>
          <button type="button" className={`dob-unknown-btn ${dobUnknown ? "selected" : ""}`} onClick={handleDobUnknown}>
            {dobUnknown ? "↩ Pick a date" : "I'm not sure"}
          </button>
        </div>

        {data.dogDob && !errors.dogDob && !dobUnknown && <p className="dob-hint">✓ Life stage auto-selected based on age</p>}
        {dobUnknown && <p className="dob-hint">No worries - you can set the life stage manually below.</p>}

        <label className="field-label" style={{ marginTop: "1.4rem" }}>Life stage</label>
        {errors.lifeStage && <FieldError error={errors.lifeStage} />}
        <div className="life-stage-grid">
          {LIFE_STAGES.map((s) => (
            <button key={s.key} type="button" className={`life-stage-card ${data.lifeStage === s.key ? "selected" : ""}`} onClick={() => onChange("lifeStage", s.key)}>
              <img src={s.icon} alt={s.label} className="ls-icon" />
              <span className="ls-label">{s.label}</span>
              <span className="ls-age">{s.age}</span>
            </button>
          ))}
        </div>

        <div className="reg-personality-header" style={{ marginTop: "1.4rem" }}>
          <label className="field-label" style={{ margin: 0 }}>
            Personality
          </label>
          {selectedCatCount > 0 && (
            <span className="reg-personality-progress">
              {selectedCatCount}/{PERSONALITY_CATEGORIES.length} done
            </span>
          )}
        </div>
        {errors.personality && <FieldError error={errors.personality} />}

        <div className="reg-personality-section">
          {PERSONALITY_CATEGORIES.map((cat) => {
            const hasSelection = cat.options.some(opt => data.personality.includes(opt.key));
            return (
              <div key={cat.id} className="reg-personality-cat">
                <p className={`reg-personality-question ${hasSelection ? "done" : ""}`}>
                  {hasSelection && (
                    <span className="reg-personality-tick" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                  {cat.question(data.dogName || "Your dog")}
                </p>
                <div className="reg-personality-grid">
                  {cat.options.map((opt) => {
                    const isSel = data.personality.includes(opt.key);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        className={`reg-personality-btn ${isSel ? "selected" : ""}`}
                        onClick={() => onChange("personality", setSelected(data.personality, cat.id, opt.key))}
                      >
                        <img
                          src={opt.img}
                          alt={opt.label}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <span>{opt.label}</span>
                        {isSel && (
                          <div className="reg-personality-check" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Step 4: Gender
const Step4: React.FC<{
  data:     FormData;
  errors:   ValidationErrors;
  onChange: (k: keyof FormData, v: string) => void;
}> = ({ data, errors, onChange }) => {
  return (
    <div className="step-content split-layout">
      <div className="split-image">
        <img src="https://images.unsplash.com/photo-1510771463146-e89e6e86560e?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="dog" />
        <div className="image-overlay" />
      </div>
      <div className="split-form">
        <StepIndicator current={5} total={6} />
        <h2 className="step-heading">Step 4.</h2>

        <label className="field-label">
          <strong>{data.dogName || "Your dog"}</strong> is a good:
        </label>

        <div className="gender-options" style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className={`gender-btn ${data.dogGender === "male" ? "selected" : ""}`}
            onClick={() => onChange("dogGender", "male")}
          >
            <img
              src="../../images/paint/male_icon.png"
              alt="male dog"
              className="gender-icon"
              style={{ pointerEvents: "none" }}
            />
            <span className="gender-label" style={{ pointerEvents: "none" }}>Boy</span>
          </button>
          <button
            type="button"
            className={`gender-btn ${data.dogGender === "female" ? "selected" : ""}`}
            onClick={() => onChange("dogGender", "female")}
          >
            <img
              src="../../images/paint/female_icon.png"
              alt="female dog"
              className="gender-icon"
              style={{ pointerEvents: "none" }}
            />
            <span className="gender-label" style={{ pointerEvents: "none" }}>Girl</span>
          </button>
        </div>
        {errors.dogGender && <FieldError error={errors.dogGender} />}
      </div>
    </div>
  );
};

// Step 5: Accept policies 
const Step5: React.FC<{
  accepted: Record<string, boolean>;
  errors:   ValidationErrors;
  onToggle: (k: string) => void;
}> = ({ accepted, errors, onToggle }) => {
  const policies = [
    { key: "privacy", title: "Privacy Policy",     link: "/privacy",      text: "I agree to the Privacy Policy and understand how my data is collected, used, and protected to provide a safe and personalised experience." },
    { key: "terms",   title: "Terms & Conditions", link: "/terms",        text: "I agree to the Terms & Conditions, including the rules for using the platform and my responsibilities as a member." },
    { key: "forum",   title: "Forum Policy",       link: "/forum-policy", text: "I agree to follow the Forum Policy and commit to respectful, supportive, and responsible participation in the community." },
  ];

  return (
    <div className="step-content split-layout">
      <div className="split-image">
        <img src="https://images.unsplash.com/photo-1662279058026-b16f21310354?q=80&w=734&auto=format&fit=crop" alt="fluffy dog" />
        <div className="image-overlay" />
      </div>
      <div className="split-form">
        <StepIndicator current={6} total={6} />
        <h2 className="step-heading">Step 5 (last!).</h2>
        <p className="step4-intro">Before you finish setting up your account, please review and accept the following:</p>
        <div className="policy-list">
          {policies.map((p) => (
            <div key={p.key}>
              <div className={`policy-item ${accepted[p.key] ? "checked" : ""} ${errors[p.key] ? "policy-error" : ""}`} onClick={() => onToggle(p.key)}>
                <div className="policy-check">
                  {accepted[p.key] && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <div className="policy-body">
                  <h3 className="policy-title">{p.title}</h3>
                  <p className="policy-text">{p.text}{" "}<a href={p.link} className="policy-link" onClick={(e) => e.stopPropagation()}>You can read it here.</a></p>
                </div>
              </div>
              <FieldError error={errors[p.key]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Page 
const RegisterPage: React.FC = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [step,          setStep]          = useState(1);
  const [emailVerified, setEmailVerified] = useState(false);
  const [errors,        setErrors]        = useState<ValidationErrors>({});
  const [apiError,      setApiError]      = useState<string>("");
  const [loading,       setLoading]       = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "", name: "", password: "", confirmPassword: "",
    dogName: "", dogGender: "", breed: "",
    dogDob: "", lifeStage: "", personality: [],
  });

  const [accepted, setAccepted] = useState<Record<string, boolean>>({
    privacy: false, terms: false, forum: false,
  });

  const handleChange = useCallback((key: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const e = { ...prev }; delete e[key]; return e;
    });
  }, []);

  const handleStringChange = useCallback((key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const e = { ...prev }; delete e[key]; return e;
    });
  }, []);

  const togglePolicy = useCallback((key: string) => {
    setAccepted((prev) => ({ ...prev, [key]: !prev[key] }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const e = { ...prev }; delete e[key]; return e;
    });
  }, []);

  const [showVerify, setShowVerify] = useState(false);

  const canProceed = useCallback(() => {
    if (step === 1) return !!(formData.email && formData.name && formData.password && formData.confirmPassword);
    if (step === 2) return !!(formData.dogName && formData.breed);
    if (step === 3) return !!(
      formData.lifeStage &&
      PERSONALITY_CATEGORIES.every(cat =>
        cat.options.some(opt => formData.personality.includes(opt.key))
      )
    );
    if (step === 4) return !!(formData.dogGender);
    return Object.values(accepted).every(Boolean);
  }, [step, formData, accepted]);

  const handleNext = useCallback(() => {
    let stepErrors: ValidationErrors = {};
    if (step === 1) stepErrors = validateStep1(formData);
    if (step === 2) stepErrors = validateStep2(formData);
    if (step === 3) stepErrors = validateStep3({ ...formData });
    if (step === 4) stepErrors = validateStep4({ dogGender: formData.dogGender });
    if (!isValid(stepErrors)) { setErrors(stepErrors); return; }
    setErrors({});
    setApiError("");

    // After step 1, show email verify if not yet verified
    if (step === 1 && !emailVerified) {
      setShowVerify(true);
      return;
    }

    setStep((s) => s + 1);
  }, [step, formData, emailVerified]);

  const handleVerified = useCallback(() => {
    setEmailVerified(true);
    setShowVerify(false);
    setStep(2);
  }, []);

  const handleBackFromVerify = useCallback(() => {
    setShowVerify(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    const stepErrors = validateStep5(accepted);
    if (!isValid(stepErrors)) { setErrors(stepErrors); return; }
    setLoading(true);
    setApiError("");
    try {
      const response = await registerUser({ ...formData, dogGender: formData.dogGender });
      login(response.token, response.user, response.dog);
      navigate("/dashboard");
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
        const errorKeys = Object.keys(err.errors);
        if (errorKeys.some((k) => ["email","name","password","confirmPassword"].includes(k))) { setStep(1); setShowVerify(false); }
        else if (errorKeys.some((k) => ["dogName","breed"].includes(k))) setStep(2);
      } else {
        setApiError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [formData, accepted, login, navigate]);

  useEffect(() => {
    if (showVerify) return; // disable Enter on verify screen
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (!canProceed()) return;
      if (step < 5) handleNext();
      else handleSubmit();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, showVerify, canProceed, handleNext, handleSubmit]);

  // Render
  if (showVerify) {
    return (
      <div className="register-page">
        <PageDecorations />
        <Link to={"/"} className="reg-home-btn" aria-label="Back to home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
            <polyline points="9 21 9 12 15 12 15 21" />
          </svg>
          Home
        </Link>
        <Step1_5
          email={formData.email}
          onVerified={handleVerified}
          onBack={handleBackFromVerify}
        />
      </div>
    );
  }

  return (
    <div className="register-page">
      <PageDecorations />

      <Link to={"/"} className="reg-home-btn" aria-label="Back to home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
          <polyline points="9 21 9 12 15 12 15 21" />
        </svg>
        Home
      </Link>

      {step === 1 && <Step1 data={formData} errors={errors} onChange={(k, v) => handleStringChange(k, v as string)} onContinue={handleNext} canProceed={canProceed()} />}
      {step === 2 && <Step2 data={formData} errors={errors} onChange={(k, v) => handleStringChange(k, v as string)} />}
      {step === 3 && <Step3 data={formData} errors={errors} onChange={handleChange} />}
      {step === 4 && <Step4 data={formData} errors={errors} onChange={handleStringChange} />}
      {step === 5 && <Step5 accepted={accepted} errors={errors} onToggle={togglePolicy} />}

      {apiError && <div className="api-error-banner">⚠️ {apiError}</div>}

      {step > 1 && (
        <div className={`reg-actions ${step === 1 ? "centered" : "split"}`}>
          {step > 1 && (
            <button className="btn-back" onClick={() => {
              // Going back from step 2 re-shows verify if they came through it
              if (step === 2) { setShowVerify(true); setStep(1); return; }
              setStep((s) => s - 1); setErrors({}); setApiError("");
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </button>
          )}
          {step < 5 ? (
            <button className={`btn-next ${!canProceed() ? "disabled" : ""}`} disabled={!canProceed()} onClick={handleNext}>
              {`Step ${step + 1}`}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <polyline points="9 18 15 12 9 6" />
                <polyline points="14 18 20 12 14 6" />
              </svg>
            </button>
          ) : (
            <button className={`btn-next register-btn ${loading || !canProceed() ? "disabled" : ""}`} disabled={loading || !canProceed()} onClick={handleSubmit}>
              {loading ? <><span className="btn-spinner" /> Registering…</> : "Register"}
              {!loading && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <polyline points="9 18 15 12 9 6" />
                  <polyline points="14 18 20 12 14 6" />
                </svg>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RegisterPage;