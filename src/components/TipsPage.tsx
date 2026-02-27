import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./TipsPage.scss";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Search icon ──────────────────────────────────────────────────────────────
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

// ─── Single expandable tip card ───────────────────────────────────────────────
const TipCard: React.FC<{ tip: Tip; category: TipCategory; index: number }> = ({
  tip, category, index,
}) => {
  const [open, setOpen]       = useState(false);
  const bodyRef               = useRef<HTMLDivElement>(null);
  const [height, setHeight]   = useState<number>(0);

  // Measure content height for smooth CSS transition
  useEffect(() => {
    if (bodyRef.current) setHeight(bodyRef.current.scrollHeight);
  }, [open, tip]);

  return (
    <div
      className={`tip-card tip-card--${category} ${open ? "tip-card--open" : ""}`}
      style={{ animationDelay: `${index * 0.045}s` }}
    >
      {/* Header — always visible */}
      <button
        className="tip-card__header"
        onClick={() => setOpen(o => !o)}
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

      {/* Expandable body */}
      <div
        id={`tip-body-${tip.id}`}
        className="tip-card__body"
        style={{ maxHeight: open ? `${height}px` : 0 }}
        aria-hidden={!open}
      >
        <div ref={bodyRef} className="tip-card__body-inner">
          {/* Summary paragraph at top of expanded */}
          <p className="tip-card__body-intro">{tip.summary}</p>

          {/* Points */}
          <ul className="tip-card__points">
            {tip.points.map((p, i) => (
              <li key={i} className="tip-card__point">
                <span className="tip-card__point-text">{p.text}</span>
                {p.sub && (
                  <ul className="tip-card__sub-points">
                    {p.sub.map((s, j) => (
                      <li key={j}>{s}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {/* Callout box */}
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

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="tips-hero">
        <div className="tips-hero__inner">
          <div className="tips-hero__eyebrow">
            <img src={heroIcon} alt="" className="tips-hero__eyebrow-icon" />
            Dog Tips
          </div>
          <h1 className="tips-hero__title">
            {title}<br /><em>{titleAccent}</em>
          </h1>
          <p className="tips-hero__sub">{subtitle}</p>
          <div className="tips-hero__meta">
            <span className="tips-hero__count">
              <strong>{tips.length}</strong> tips
            </span>
          </div>
        </div>

        {/* Large decorative icon */}
        <div className="tips-hero__deco" aria-hidden="true">
          <img src={heroIcon} alt="" />
        </div>
      </section>

      {/* ── Category nav ─────────────────────────────────────────────────── */}
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

      {/* ── Search + controls ─────────────────────────────────────────────── */}
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
          {query && (
            <span className="tips-controls__count">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
          <button
            className="tips-controls__expand"
            onClick={() => setExpandAll(e => !e)}
          >
            {expandAll ? "Collapse all" : "Expand all"}
          </button>
        </div>
      </div>

      {/* ── Tips grid ─────────────────────────────────────────────────────── */}
      <div className="tips-body">
        {filtered.length === 0 ? (
          <div className="tips-empty">
            <img src={heroIcon} alt="" />
            <h3>No tips found</h3>
            <p>Try a different search term — or <button onClick={() => setQuery("")}>clear the search</button></p>
          </div>
        ) : (
          <div className="tips-grid" key={query /* re-mount on search to reset open states */}>
            {filtered.map((tip, i) => (
              <TipCard
                key={tip.id}
                tip={tip}
                category={category}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default TipsPage;