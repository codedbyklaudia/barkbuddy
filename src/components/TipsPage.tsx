import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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
  { label: "Grooming",  path: "/tips/grooming",  icon: "/images/icons/grooming.svg"  },
  { label: "Health",    path: "/tips/health",    icon: "/images/icons/health.svg"    },
  { label: "Training",  path: "/tips/training",  icon: "/images/icons/training.svg"  },
  { label: "Nutrition", path: "/tips/nutrition", icon: "/images/icons/nutrition.svg" },
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

// Locked screen
const TipsLocked: React.FC<{
  category: TipCategory; title: string; titleAccent: string;
}> = ({ category, title, titleAccent }) => (
  <div className={`tips-locked tips-locked--${category}`}>
    <div className="tips-locked__veil" />
    <div className="tips-locked__panel">
      <span className="tips-locked__paw" aria-hidden="true">🐾</span>
      <h1 className="tips-locked__heading">
        {title} <em>{titleAccent}</em>
      </h1>
      <p className="tips-locked__body">
        Expert dog care tips, free for every BarkBuddy member.
        Log in or create your account to start reading.
      </p>
      <div className="tips-locked__ctas">
        <Link to="/login"    className="tips-locked__cta tips-locked__cta--primary">Log in</Link>
        <Link to="/register" className="tips-locked__cta tips-locked__cta--ghost">Create free account</Link>
      </div>
      <p className="tips-locked__hint">Back to <Link to="/">Home</Link></p>
    </div>
  </div>
);

// Tip modal
const TipModal: React.FC<{
  tip:      Tip;
  category: TipCategory;
  saved:    boolean;
  onSave:   () => void;
  onClose:  () => void;
}> = ({ tip, category, saved, onSave, onClose }) => {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);

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

        {/* Image */}
        {tip.image ? (
          <div className="tip-modal__image">
            <img src={tip.image} alt={tip.title} />
          </div>
        ) : (
          <div className="tip-modal__image tip-modal__image--placeholder">
            <img src={tip.icon} alt="" className="tip-modal__icon-fallback" />
          </div>
        )}

        <div className="tip-modal__body">
          <div className="tip-modal__meta">
            <span className="tip-modal__tag">{category}</span>
            <span className="tip-modal__pts">{tip.points.length} points</span>
          </div>

          <h2 className="tip-modal__title">{tip.title}</h2>
          <p className="tip-modal__summary">{tip.summary}</p>

          <ul className="tip-modal__points">
            {tip.points.map((p, i) => (
              <li key={i} className="tip-modal__point">
                <span className="tip-modal__bullet" />
                <div>
                  <span className="tip-modal__point-text">{p.text}</span>
                  {p.sub && (
                    <ul className="tip-modal__sub">
                      {p.sub.map((s, j) => <li key={j}>{s}</li>)}
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

          <button
            className={`tip-modal__save${saved ? " tip-modal__save--saved" : ""}`}
            onClick={onSave}
          >
            <BookmarkIcon filled={saved} />
            {saved ? "Saved" : "Save tip"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Tip card
const TipCard: React.FC<{
  tip:      Tip;
  category: TipCategory;
  saved:    boolean;
  onSave:   () => void;
  onOpen:   () => void;
  index:    number;
}> = ({ tip, category, saved, onSave, onOpen, index }) => (
  <article
    className="tip-card"
    style={{ animationDelay: `${index * 0.06}s` }}
  >
    {/* Illustration / image */}
    <button className="tip-card__image-wrap" onClick={onOpen} aria-label={`Read tip: ${tip.title}`}>
      {tip.image ? (
        <img src={tip.image} alt={tip.title} className="tip-card__image" />
      ) : (
        <div className="tip-card__image-placeholder">
          <img src={tip.icon} alt="" className="tip-card__icon-fallback" />
        </div>
      )}
    </button>

    {/* Bookmark */}
    <button
      className={`tip-card__bookmark${saved ? " tip-card__bookmark--saved" : ""}`}
      onClick={onSave}
      aria-label={saved ? "Remove bookmark" : "Save tip"}
      aria-pressed={saved}
    >
      <BookmarkIcon filled={saved} />
    </button>

    {/* Body */}
    <div className="tip-card__body">
      <div className="tip-card__meta">
        <span className="tip-card__tag">{category}</span>
      </div>
      <h3 className="tip-card__title">{tip.title}</h3>
      <p className="tip-card__summary">{tip.summary}</p>
      <button className="tip-card__read" onClick={onOpen}>
        Read tip <ArrowIcon />
      </button>
    </div>
  </article>
);

// Main page 
const TipsPage: React.FC<TipsPageProps> = ({
  category, title, titleAccent, subtitle, heroIcon, tips,
}) => {
  const { token }                        = useAuth();
  const { isSaved, toggleTip, tipCount } = useSaved();

  const [query,    setQuery]    = useState("");
  const [openTip,  setOpenTip]  = useState<Tip | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!token) {
    return <TipsLocked category={category} title={title} titleAccent={titleAccent} />;
  }

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

      {/* Modal */}
      {openTip && (
        <TipModal
          tip={openTip}
          category={category}
          saved={isSaved(openTip.id)}
          onSave={() => handleSave(openTip)}
          onClose={() => setOpenTip(null)}
        />
      )}

      {/* Hero banner  */}
      <header className="tips-hero">
        <div className="tips-hero__bg" aria-hidden="true">
          <img src={heroIcon} alt="" className="tips-hero__bg-img" />
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

      {/* Nav + search */}
      <div className="tips-controls">
        <div className="tips-controls__inner">
          <nav className="tips-nav" aria-label="Tip categories">
            {NAV.map(c => (
              <Link key={c.path} to={c.path}
                className={`tips-nav__link${c.path === `/tips/${category}` ? " tips-nav__link--active" : ""}`}>
                <img src={c.icon} alt="" />
                {c.label}
              </Link>
            ))}
          </nav>

          <div className="tips-search">
            <span className="tips-search__icon"><SearchIcon /></span>
            <input
              ref={inputRef}
              type="search"
              className="tips-search__input"
              placeholder={`Search ${category} tips…`}
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

      {/* Card grid */}
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