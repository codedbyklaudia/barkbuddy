import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./TipsPage.scss";
import Footer from './Footer';

// Types 
export type TipPoint = {
  text: string;
  sub?: string[];
};

export type Tip = {
  id:       string;
  icon:     string;
  title:    string;
  summary:  string;
  points:   TipPoint[];
  callout?: { label: string; text: string };
};

export type TipCategory = "grooming" | "health" | "training" | "nutrition";

export type TipsPageProps = {
  category:      TipCategory;
  title:         string;
  titleAccent:   string;
  subtitle:      string;
  heroIcon:      string;
  tips:          Tip[];
};

// Category nav
const NAV = [
  { label: "Grooming",  path: "/tips/grooming",  icon: "/images/icons/grooming.svg"  },
  { label: "Health",    path: "/tips/health",    icon: "/images/icons/health.svg"    },
  { label: "Training",  path: "/tips/training",  icon: "/images/icons/training.svg"  },
  { label: "Nutrition", path: "/tips/nutrition", icon: "/images/icons/nutrition.svg" },
];

const CATEGORY_LABELS: Record<TipCategory, string> = {
  grooming:  "Grooming",
  health:    "Health",
  training:  "Training",
  nutrition: "Nutrition",
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    width="18" height="18" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    width="16" height="16" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    width="18" height="18" aria-hidden="true" className="tip-card__chevron">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── Single expandable tip card ───────────────────────────────────────────────
const TipCard: React.FC<{ tip: Tip; category: TipCategory; index: number; forceOpen?: boolean }> = ({
  tip, category, index, forceOpen,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const bodyRef                   = useRef<HTMLDivElement>(null);
  const [height, setHeight]       = useState<number>(0);

  const open = forceOpen ?? localOpen;

  useEffect(() => {
    if (bodyRef.current) setHeight(bodyRef.current.scrollHeight);
  }, [open, tip]);

  return (
    <div
      className={`tip-card tip-card--${category} ${open ? "tip-card--open" : ""}`}
      style={{ animationDelay: `${index * 0.045}s` }}
    >
      <button
        className="tip-card__header"
        onClick={() => setLocalOpen(o => !o)}
        aria-expanded={open}
        aria-controls={`tip-body-${tip.id}`}
      >
        <div className="tip-card__icon-wrap">
          <img src={tip.icon} alt="" className="tip-card__icon" />
        </div>
        <div className="tip-card__header-text">
          <h3 className="tip-card__title">{tip.title}</h3>
          {!open && <p className="tip-card__summary">{tip.summary}</p>}
        </div>
        <div className="tip-card__chevron-wrap">
          <ChevronIcon />
        </div>
      </button>

      <div
        id={`tip-body-${tip.id}`}
        className="tip-card__body"
        style={{ maxHeight: open ? `${height}px` : 0 }}
        aria-hidden={!open}
      >
        <div ref={bodyRef} className="tip-card__body-inner">
          <p className="tip-card__body-intro">{tip.summary}</p>
          <ul className="tip-card__points">
            {tip.points.map((p, i) => (
              <li key={i} className="tip-card__point">
                <span className="tip-card__point-text">{p.text}</span>
                {p.sub && (
                  <ul className="tip-card__sub-points">
                    {p.sub.map((s, j) => <li key={j}>{s}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          {tip.callout && (
            <div className="tip-card__callout">
              <span className="tip-card__callout-label">{tip.callout.label}</span>
              <p>{tip.callout.text}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main page component ──────────────────────────────────────────────────────
const TipsPage: React.FC<TipsPageProps> = ({
  category, title, titleAccent, subtitle, heroIcon, tips,
}) => {
  const [query,     setQuery]     = useState("");
  const [expandAll, setExpandAll] = useState(false);
  const inputRef                  = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return tips;
    const q = query.toLowerCase();
    return tips.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.points.some(p => p.text.toLowerCase().includes(q))
    );
  }, [query, tips]);

  return (
    <div className={`tips-page tips-page--${category}`}>

      {/* ── Hero — two-column layout matching TravelPage ─────────────────── */}
      <section className="tips-hero">

        {/* Left — text */}
        <div className="tips-hero__left">
          <div className="tips-hero__heading-block">

            <p className="tips-hero__eyebrow">
              Dog Tips
            </p>

            <h1 className="tips-hero__title">
              <span>{title}</span>
              <span><em>{titleAccent}</em></span>
            </h1>

            <p className="tips-hero__sub">{subtitle}</p>

            <div className="tips-hero__meta">
              <div className="tips-hero__stat">
                <span className="tips-hero__stat-value">{tips.length}</span>
                <span className="tips-hero__stat-label">Tips</span>
              </div>
              <div className="tips-hero__stat">
                <span className="tips-hero__stat-value">Free</span>
                <span className="tips-hero__stat-label">Always</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right — illustration as full-cover image */}
        <div className="tips-hero__right" aria-hidden="true">
          <img
            src={heroIcon}
            alt=""
            className="tips-hero__deco-img"
          />
        </div>

      </section>

      {/* Category nav  */}
      <nav className="tips-nav" aria-label="Tip categories">
        <div className="tips-nav__inner">
          {NAV.map(c => (
            <Link
              key={c.path}
              to={c.path}
              className={`tips-nav__link${c.path === `/tips/${category}` ? " tips-nav__link--active" : ""}`}
            >
              <img src={c.icon} alt="" />
              {c.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Search + controls ────────────────────────────────────────────── */}
      <div className="tips-controls">
        <div className="tips-search">
          <label htmlFor="tips-search-input" className="tips-search__icon">
            <SearchIcon />
          </label>
          <input
            ref={inputRef}
            id="tips-search-input"
            className="tips-search__input"
            type="search"
            placeholder={`Search ${category} tips…`}
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button
              className="tips-search__clear"
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              aria-label="Clear search"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        <div className="tips-controls__right">
          <button
            className="tips-controls__expand"
            onClick={() => setExpandAll(e => !e)}
          >
            {expandAll ? "Collapse all" : "Expand all"}
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {/* ── Tips grid ────────────────────────────────────────────────────── */}
      <div className="tips-body">
        {filtered.length === 0 ? (
          <div className="tips-empty">
            <img src={heroIcon} alt="" />
            <h3>No tips found</h3>
            <p>
              Try a different search term — or{" "}
              <button onClick={() => setQuery("")}>clear the search</button>
            </p>
          </div>
        ) : (
          <>
            <div className="tips-body__label">
              <span>
                {query
                  ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
                  : `${tips.length} ${category} tips`}
              </span>
            </div>
            <div className="tips-grid" key={query}>
              {filtered.map((tip, i) => (
                <TipCard
                  key={tip.id}
                  tip={tip}
                  category={category}
                  index={i}
                  forceOpen={expandAll ? true : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
        <Footer />
    </div>
  );
};

export default TipsPage;