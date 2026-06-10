import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./TipsPage.scss";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";
import { useSaved } from "../context/SavedContext";

export type TipPoint = { text: string; sub?: string[] };

export type Tip = {
  id:           string;
  icon:         string;
  image?:       string;
  title:        string;
  summary:      string;
  points:       TipPoint[];
  callout?:     { label: string; text: string };
};

export type TipCategory = "grooming" | "health" | "training" | "nutrition";

export type TipsPageProps = {
  category:    TipCategory;
  title:       string;
  titleAccent: string;
  subtitle:    string;
  heroIcon:    string;
  tips:        Tip[];
};

const NAV = [
  { label: "Grooming",  path: "/tips/grooming"  },
  { label: "Health",    path: "/tips/health"    },
  { label: "Training",  path: "/tips/training"  },
  { label: "Nutrition", path: "/tips/nutrition" },
];

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    width="13" height="13" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12"
    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

// ─── Tip Modal ────────────────────────────────────────────────────────────────
const TipModal: React.FC<{
  tip:        Tip;
  category:   TipCategory;
  saved:      boolean;
  isLoggedIn: boolean;
  onSave:     () => void;
  onClose:    () => void;
  onLoginPrompt: () => void;
}> = ({ tip, category, saved, isLoggedIn, onSave, onClose, onLoginPrompt }) => {
  const [showLoginMsg, setShowLoginMsg] = useState(false);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleSave = () => {
    if (!isLoggedIn) {
      setShowLoginMsg(true);
      setTimeout(() => setShowLoginMsg(false), 3000);
      return;
    }
    onSave();
  };

  return (
    <div
      className="tip-modal-backdrop"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog" aria-modal="true"
    >
      <div className="tip-modal">
        <button className="tip-modal__close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        {tip.image ? (
          <div className="tip-modal__image">
            <img
              src={tip.image}
              alt={tip.title}
              loading="lazy"
              decoding="async"
              width={16}
              height={9}
            />
          </div>
        ) : (
          <div className="tip-modal__image tip-modal__image--placeholder">
            <img
              src={tip.icon}
              alt=""
              className="tip-modal__icon-fallback"
              loading="lazy"
              decoding="async"
              width={1}
              height={1}
            />
          </div>
        )}

        <div className="tip-modal__body">
          <div className="tip-modal__meta">
            <span className="tip-modal__tag">{category}</span>
          </div>

          <h2 className="tip-modal__title">{tip.title}</h2>
          <p className="tip-modal__summary">{tip.summary}</p>

          <ul className="tip-modal__points">
            {tip.points.map((p, i) => (
              <li key={i} className="tip-modal__point">
                <span className="tip-modal__bullet" aria-hidden="true" />
                <div className="tip-modal__point-content">
                  <span className="tip-modal__point-text">{p.text}</span>
                  {p.sub && (
                    <ul className="tip-modal__sub">
                      {p.sub.map((s, j) => (
                        <li key={j}>
                          <span className="tip-modal__sub-bullet" aria-hidden="true" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {tip.callout && (
            <aside className="tip-modal__callout">
              <span className="tip-modal__callout-label">{tip.callout.label}</span>
              <p>{tip.callout.text}</p>
            </aside>
          )}

          <div className="tip-modal__save-wrap">
            <button
              className={`tip-modal__save${saved ? " tip-modal__save--saved" : ""}`}
              onClick={handleSave}
            >
              <BookmarkIcon filled={saved} />
              {saved ? "Saved" : "Save tip"}
            </button>
            {showLoginMsg && (
              <p className="tip-modal__login-msg">
                <LockIcon /> Please log in to save tips
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Tip Card ─────────────────────────────────────────────────────────────────
const TipCard: React.FC<{
  tip:        Tip;
  category:   TipCategory;
  saved:      boolean;
  isLoggedIn: boolean;
  onSave:     () => void;
  onOpen:     () => void;
  index:      number;
}> = ({ tip, category, saved, isLoggedIn, onSave, onOpen, index }) => {
  const [showLoginMsg, setShowLoginMsg] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't open modal when clicking bookmark
    if (!isLoggedIn) {
      setShowLoginMsg(true);
      setTimeout(() => setShowLoginMsg(false), 3000);
      return;
    }
    onSave();
  };

  return (
    <article
      className="tip-card"
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && onOpen()}
      aria-label={`Read tip: ${tip.title}`}
    >
      <div className="tip-card__image-wrap">
        {tip.image ? (
          <img
            src={tip.image}
            alt={tip.title}
            className="tip-card__image"
            loading="lazy"
            decoding="async"
            width={16}
            height={9}
          />
        ) : (
          <div className="tip-card__image-placeholder">
            <img
              src={tip.icon}
              alt=""
              className="tip-card__icon-fallback"
              loading="lazy"
              decoding="async"
              width={1}
              height={1}
            />
          </div>
        )}
      </div>

      {/* Bookmark — stops propagation so it doesn't open modal */}
      <div className="tip-card__bookmark-wrap">
        <button
          className={`tip-card__bookmark${saved ? " tip-card__bookmark--saved" : ""}`}
          onClick={handleSave}
          aria-label={saved ? "Remove bookmark" : "Save tip"}
          aria-pressed={saved}
        >
          <BookmarkIcon filled={saved} />
        </button>
        {showLoginMsg && (
          <p className="tip-card__login-msg">
            <LockIcon /> Log in to save
          </p>
        )}
      </div>

      <div className="tip-card__body">
        <div className="tip-card__meta">
          <span className="tip-card__tag">{category}</span>
        </div>
        <h3 className="tip-card__title">{tip.title}</h3>
        <p className="tip-card__summary">{tip.summary}</p>
        <span className="tip-card__read">
          Read tip <ArrowIcon />
        </span>
      </div>
    </article>
  );
};

// Main Page 
const TipsPage: React.FC<TipsPageProps> = ({
  category, title, titleAccent, subtitle, heroIcon, tips,
}) => {
  const { token }                        = useAuth();
  const { isSaved, toggleTip, tipCount } = useSaved();
  const navigate                         = useNavigate();

  const isLoggedIn = !!token;

  const [query,    setQuery]    = useState("");
  const [openTip,  setOpenTip]  = useState<Tip | null>(null);
  const [navOpen,  setNavOpen]  = useState(false);
  const inputRef    = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentNav = NAV.find(c => c.path === `/tips/${category}`);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return tips;
    const q = query.toLowerCase();
    return tips.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.points.some(p => p.text.toLowerCase().includes(q))
    );
  }, [query, tips]);

  const handleSave = useCallback((tip: Tip) => {
    toggleTip({ itemId: tip.id, id: tip.id, title: tip.title, summary: tip.summary, category, icon: tip.icon });
  }, [tips, category, toggleTip]);

  return (
    <div className={`tips-page tips-page--${category}`}>

      {openTip && (
        <TipModal
          tip={openTip}
          category={category}
          saved={isSaved(openTip.id)}
          isLoggedIn={isLoggedIn}
          onSave={() => handleSave(openTip)}
          onClose={() => setOpenTip(null)}
          onLoginPrompt={() => navigate('/login')}
        />
      )}

      <header className="tips-hero">
        <div className="tips-hero__bg" aria-hidden="true">
          <img
            src={heroIcon}
            alt=""
            className="tips-hero__bg-img"
            loading="eager"
            decoding="sync"
            width={16}
            height={9}
          />
          <div className="tips-hero__bg-veil" />
        </div>
        <div className="tips-hero__inner">
          <div className="tips-hero__text">
            <p className="tips-hero__eyebrow">Dog Tips</p>
            <h1 className="tips-hero__title">
              {title}<br /><em>{titleAccent}</em>
            </h1>
            <p className="tips-hero__sub">{subtitle}</p>
          </div>
          <div className="tips-hero__stats">
            <div className="tips-hero__stat">
              <strong>{tips.length}</strong>
              <span>Tips</span>
            </div>
            {tipCount > 0 && (
              <div className="tips-hero__stat tips-hero__stat--accent">
                <strong>{tipCount}</strong>
                <span>Saved</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="tips-controls">
        <div className="tips-controls__inner">

          <nav className="tips-nav" aria-label="Tip categories">
            {/* Mobile dropdown */}
            <div className="tips-nav__dropdown" ref={dropdownRef}>
              <button
                className="tips-nav__dropdown-trigger"
                onClick={(e) => { e.stopPropagation(); setNavOpen(v => !v); }}
                aria-expanded={navOpen}
                aria-haspopup="listbox"
              >
                <span>{currentNav?.label ?? "Categories"}</span>
                <ChevronIcon open={navOpen} />
              </button>
              {navOpen && (
                <div className="tips-nav__dropdown-menu" role="listbox">
                  {NAV.map(c => (
                    <Link
                      key={c.path}
                      to={c.path}
                      role="option"
                      aria-selected={c.path === `/tips/${category}`}
                      className={`tips-nav__dropdown-item${c.path === `/tips/${category}` ? " active" : ""}`}
                      onClick={() => setNavOpen(false)}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop tabs */}
            <div className="tips-nav__tabs">
              {NAV.map(c => (
                <Link key={c.path} to={c.path}
                  className={`tips-nav__link${c.path === `/tips/${category}` ? " tips-nav__link--active" : ""}`}>
                  {c.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="tips-search">
            <span className="tips-search__icon"><SearchIcon /></span>
            <input
              ref={inputRef}
              type="search"
              className="tips-search__input"
              placeholder="Search…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query && (
              <button className="tips-search__clear"
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}>
                <CloseIcon />
              </button>
            )}
          </div>

          <p className="tips-count">
            {query
              ? <><strong>{filtered.length}</strong> result{filtered.length !== 1 ? "s" : ""}</>
              : <><strong>{tips.length}</strong> {category} tips</>}
          </p>
        </div>
      </div>

      <main className="tips-body">
        {filtered.length === 0 ? (
          <div className="tips-empty">
            <p className="tips-empty__title">No tips found</p>
            <p className="tips-empty__sub">
              Try a different search or{" "}
              <button onClick={() => setQuery("")}>clear</button>
            </p>
          </div>
        ) : (
          <div className="tips-grid">
            {filtered.map((tip, i) => (
              <TipCard
                key={tip.id}
                tip={tip}
                index={i}
                category={category}
                saved={isSaved(tip.id)}
                isLoggedIn={isLoggedIn}
                onSave={() => handleSave(tip)}
                onOpen={() => setOpenTip(tip)}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TipsPage;