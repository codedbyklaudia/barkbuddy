import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSaved } from "../../context/SavedContext";
import type { SavedItem, SavedTip, SavedService } from "../../context/SavedContext";
import "./SavedView.scss";

// Icons 
const Ico = {
  bookmark: (f = true) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={f ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  x: (s = 12) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  chevronDown: (cls = "") => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  arrowRight: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  trash: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  tip: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  service: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  chevronRight: (s = 14) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  paw: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="6" cy="7" rx="2" ry="2.5"/>
      <ellipse cx="18" cy="7" rx="2" ry="2.5"/>
      <ellipse cx="10" cy="4" rx="2" ry="2.5"/>
      <ellipse cx="14" cy="4" rx="2" ry="2.5"/>
      <path d="M12 10c-3.5 0-6 2.5-6 5.5 0 1.5.5 2.5 1.5 3.5H16.5c1-.5 1.5-2 1.5-3.5C18 12.5 15.5 10 12 10z"/>
    </svg>
  ),
};

// Helpers

const CAT_CONFIG: Record<string, { bg: string; accent: string; text: string; label: string }> = {
  grooming:  { bg: "#F0EEFF", accent: "#7F77DD", text: "#3C3489", label: "Grooming"  },
  health:    { bg: "#E6F9F2", accent: "#1D9E75", text: "#085041", label: "Health"    },
  training:  { bg: "#FFF4E0", accent: "#EF9F27", text: "#633806", label: "Training"  },
  nutrition: { bg: "#E6F3FF", accent: "#378ADD", text: "#0C447C", label: "Nutrition" },
  service:   { bg: "#FFF0F5", accent: "#D4537E", text: "#72243E", label: "Service"   },
  default:   { bg: "#F4F3F0", accent: "#888780", text: "#444441", label: "Saved"     },
};

function getCat(item: SavedItem) {
  if (item.type === "service") return CAT_CONFIG.service;
  const k = (item as SavedTip).category?.toLowerCase() ?? "";
  return CAT_CONFIG[k] ?? CAT_CONFIG.default;
}

function ago(ms: number): string {
  const d = Date.now() - ms, m = Math.floor(d / 6e4);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const dy = Math.floor(h / 24);
  if (dy < 7) return `${dy}d ago`;
  return new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

type Tab = "all" | "tip" | "service";

// Tip Card — rich expandable 
const TipCard: React.FC<{
  item: SavedTip; onRemove: (id: string) => void; delay: number;
}> = ({ item, onRemove, delay }) => {
  const navigate       = useNavigate();
  const [open, setOpen] = useState(false);
  const bodyRef        = useRef<HTMLDivElement>(null);
  const [h, setH]      = useState(0);
  const cat            = getCat(item);
  const path           = `/tips/${item.category?.toLowerCase() ?? "grooming"}`;

  useEffect(() => { if (bodyRef.current) setH(bodyRef.current.scrollHeight); }, [open, item]);

  return (
    <article
      className={`sv-card sv-card--tip${open ? " sv-card--open" : ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Accent bar */}
      <div className="sv-card__bar" style={{ background: cat.accent }} />

      {/* Header button */}
      <button className="sv-card__header" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        {/* Icon */}
        <div className="sv-card__icon" style={{ background: cat.bg, color: cat.accent }}>
          {item.icon
            ? <img src={item.icon} alt="" className="sv-card__icon-img" />
            : Ico.tip(20)}
        </div>

        {/* Text */}
        <div className="sv-card__copy">
          <h3 className="sv-card__title">{item.title}</h3>
          <p className="sv-card__sub">{item.summary}</p>
        </div>

        {/* Meta cluster */}
        <div className="sv-card__meta-cluster">
          <span className="sv-card__chip" style={{ background: cat.bg, color: cat.text }}>
            {cat.label}
          </span>
          <span className="sv-card__time">{ago(item.savedAt)}</span>
          <span className={`sv-card__chevron${open ? " sv-card__chevron--open" : ""}`}>
            {Ico.chevronDown()}
          </span>
        </div>
      </button>

      {/* Expand panel */}
      <div className="sv-card__expand" style={{ maxHeight: open ? `${h}px` : 0 }} aria-hidden={!open}>
        <div ref={bodyRef} className="sv-card__expand-inner">
          <div className="sv-card__actions">
            <button className="sv-card__go" onClick={() => navigate(path)}
              style={{ background: cat.accent }}>
              Read full tip {Ico.arrowRight()}
            </button>
            <button className="sv-card__remove" onClick={() => onRemove(item.id)}>
              {Ico.trash(13)} Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

// Service Card
const ServiceCard: React.FC<{
  item: SavedService; onRemove: (id: string) => void; delay: number;
}> = ({ item, onRemove, delay }) => {
  const navigate        = useNavigate();
  const [open, setOpen] = useState(false);
  const bodyRef         = useRef<HTMLDivElement>(null);
  const [h, setH]       = useState(0);
  const cat             = getCat(item);
  const path            = `/activity/${item.itemId}`;


  useEffect(() => { if (bodyRef.current) setH(bodyRef.current.scrollHeight); }, [open]);

  return (
    <article className={`sv-card sv-card--service${open ? " sv-card--open" : ""}`}
      style={{ animationDelay: `${delay}s` }}>
      <div className="sv-card__bar" style={{ background: cat.accent }} />

      {/* Header — clickable to expand */}
      <button className="sv-card__header" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <div className="sv-card__icon" style={{ background: cat.bg, color: cat.accent }}>
          {Ico.service(20)}
        </div>

        <div className="sv-card__copy">
          <h3 className="sv-card__title">{item.title}</h3>
          <p className="sv-card__sub">
            {[item.address, item.distance, item.rating ? `★ ${Number(item.rating).toFixed(1)}` : null]
              .filter(Boolean).join(" · ")}
          </p>
        </div>

        <div className="sv-card__meta-cluster">
          <span className="sv-card__chip" style={{ background: cat.bg, color: cat.text }}>
            {item.category || "Service"}
          </span>
          <span className="sv-card__time">{ago(item.savedAt)}</span>
          <span className={`sv-card__chevron${open ? " sv-card__chevron--open" : ""}`}>
            {Ico.chevronDown()}
          </span>
        </div>
      </button>

      {/* Expand panel with link to listing */}
      <div className="sv-card__expand" style={{ maxHeight: open ? `${h}px` : 0 }} aria-hidden={!open}>
        <div ref={bodyRef} className="sv-card__expand-inner">
          <div className="sv-card__actions">
            <button
              className="sv-card__go"
              onClick={() => navigate(path)}
              style={{ background: cat.accent }}
            >
              View listing {Ico.arrowRight()}
            </button>
            <button className="sv-card__remove" onClick={() => onRemove(item.id)}>
              {Ico.trash(13)} Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

// Hero banner 
const HeroBanner: React.FC<{ tipCount: number; serviceCount: number }> = ({
  tipCount, serviceCount,
}) => (
  <div className="sv-hero">
    <div className="sv-hero__left">
      <div className="sv-hero__icon-wrap">{Ico.bookmark()}</div>
      <div className="sv-hero__text">
        <h2 className="sv-hero__title">Favourites</h2>
      </div>
    </div>
    <div className="sv-hero__stats">
      <div className="sv-hero__stat">
        <span className="sv-hero__stat-val">{tipCount}</span>
        <span className="sv-hero__stat-lbl">tip{tipCount !== 1 ? "s" : ""}</span>
      </div>
      {serviceCount > 0 && (
        <>
          <div className="sv-hero__divider" />
          <div className="sv-hero__stat">
            <span className="sv-hero__stat-val">{serviceCount}</span>
            <span className="sv-hero__stat-lbl">service{serviceCount !== 1 ? "s" : ""}</span>
          </div>
        </>
      )}
    </div>
  </div>
);

// Empty state 
const Empty: React.FC<{ tab: Tab; query: string; onNav?: (t: string) => void }> = ({
  tab, query, onNav,
}) => {
  const msgs: Record<Tab, { title: string; body: string; cta?: string; nav?: string }> = {
    all:     { title: query ? `No results for "${query}"` : "Nothing saved yet",
               body:  query ? "Try a different search." : "Bookmark tips and services as you explore - they all appear here." },
    tip:     { title: query ? `No tips match "${query}"` : "No saved tips",
               body:  "Open any tip and tap the bookmark to save it here.",
               cta: "Browse tips", nav: "tips" },
    service: { title: query ? `No services match "${query}"` : "No saved services",
               body:  "Find a groomer, vet or park and tap Save to bookmark it.",
               cta: "Find services", nav: "services" },
  };
  const m = msgs[tab];

  return (
    <div className="sv-empty">
      <div className="sv-empty__paw">{Ico.paw()}</div>
      <h3 className="sv-empty__title">{m.title}</h3>
      <p className="sv-empty__body">{m.body}</p>
      {m.cta && onNav && !query && (
        <button className="sv-empty__cta" onClick={() => onNav(m.nav!)}>
          {m.cta} {Ico.chevronRight(13)}
        </button>
      )}
    </div>
  );
};

// Main 
const SavedView: React.FC<{ onNav?: (tab: string) => void }> = ({ onNav }) => {
  const { savedItems, removeSaved, clearAll, totalCount, tipCount, serviceCount } = useSaved();
  const [tab,    setTab]    = useState<Tab>("all");
  const [query,  setQuery]  = useState("");
  const [confirm, setConfirm] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo<SavedItem[]>(() => {
    let items = tab === "all" ? savedItems : savedItems.filter(i => i.type === tab);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        (i.type === "tip"     && (i as SavedTip).category?.toLowerCase().includes(q)) ||
        (i.type === "service" && (i as SavedService).address?.toLowerCase().includes(q))
      );
    }
    return items;
  }, [savedItems, tab, query]);

  const handleClear = () => {
    if (confirm) { clearAll(); setConfirm(false); }
    else { setConfirm(true); setTimeout(() => setConfirm(false), 3000); }
  };

  return (
    <div className="sv-root">

      {/* Hero */}
      {totalCount > 0 && <HeroBanner tipCount={tipCount} serviceCount={serviceCount} />}

      {/* Search */}
      {totalCount > 0 && (
        <div className="sv-search">
          <span className="sv-search__icon">{Ico.search()}</span>
          <input
            ref={searchRef}
            type="search"
            className="sv-search__input"
            placeholder="Search saved items…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className="sv-search__clear"
              onClick={() => { setQuery(""); searchRef.current?.focus(); }}>
              {Ico.x()}
            </button>
          )}
        </div>
      )}

      {/* Tab pills */}
      {totalCount > 0 && (
        <div className="sv-tabs">
          {(["all", "tip", "service"] as Tab[]).map(t => (
            <button
              key={t}
              className={`sv-tab${tab === t ? " sv-tab--active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "all"
                ? `All · ${totalCount}`
                : t === "tip"
                ? `Tips · ${tipCount}`
                : `Services · ${serviceCount}`}
            </button>
          ))}

          {totalCount > 0 && (
            <button
              className={`sv-clear${confirm ? " sv-clear--danger" : ""}`}
              onClick={handleClear}
            >
              {confirm ? "Sure?" : "Clear all"}
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {filtered.length > 0 && (
        <p className="sv-count">
          {query
            ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${query}"`
            : `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Cards */}
      {filtered.length === 0 ? (
        <Empty tab={tab} query={query} onNav={onNav} />
      ) : (
        <div className="sv-list">
          {filtered.map((item, i) =>
            item.type === "tip"
              ? <TipCard    key={item.id} item={item as SavedTip}     onRemove={removeSaved} delay={i * 0.04} />
              : <ServiceCard key={item.id} item={item as SavedService} onRemove={removeSaved} delay={i * 0.04} />
          )}
        </div>
      )}

      {/* Services teaser */}
      {tab !== "tip" && serviceCount === 0 && !query && totalCount > 0 && (
        <div className="sv-teaser">
          <div className="sv-teaser__dot" />
          <p>Save services from the Service Finder — they'll appear here alongside your tips.</p>
        </div>
      )}

    </div>
  );
};

export default SavedView;