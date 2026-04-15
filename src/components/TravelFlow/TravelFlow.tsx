import React, { useState, useMemo } from 'react';
import {
  STEPS, CONTINENTS,
  type StepId, type TravelDirection, type Continent, type Country, type ContentCard,
} from './types';
import { COUNTRIES, getCountryContent } from './TravelData';
import './TravelFlow.scss';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

// Icons
const ChevronLeft: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronRight: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronDown: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronUp: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SearchIcon: React.FC = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="m21 21-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const CheckIcon: React.FC = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const DownloadIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 3v13M7 11l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const LockIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── MobileStepBar ────────────────────────────────────────────────────────────
interface MobileStepBarProps {
  currentStep: StepId;
  selectedContinent?: string;
  selectedCountry?: string;
  hideContinent?: boolean;
}
const MobileStepBar: React.FC<MobileStepBarProps> = ({
  currentStep, selectedContinent, selectedCountry, hideContinent = false,
}) => {
  const [open, setOpen] = useState(false);
  const visibleSteps = hideContinent ? STEPS.filter(s => s.id !== 'continent') : STEPS;
  const currentIdx = visibleSteps.findIndex(s => s.id === currentStep);
  const progress = Math.round(((currentIdx + 1) / visibleSteps.length) * 100);

  const getStatus = (stepId: StepId, idx: number) => {
    if (stepId === currentStep) return 'active';
    if (idx < currentIdx) return 'done';
    return 'upcoming';
  };

  return (
    <div className="mobile-step-bar">
      <button
        className="mobile-step-bar__trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        type="button"
      >
        <div className="mobile-step-bar__info">
          <span className="mobile-step-bar__count">Step {currentIdx + 1} of {visibleSteps.length}</span>
          <span className="mobile-step-bar__label">{visibleSteps[currentIdx]?.label}</span>
        </div>
        <div className="mobile-step-bar__right">
          <div className="mobile-step-bar__ring" aria-hidden="true">
            <svg viewBox="0 0 36 36" className="mobile-step-bar__svg">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(222,214,240,0.15)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke="currentColor" strokeWidth="3"
                strokeDasharray={`${progress * 0.942} 94.2`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
            </svg>
            <span className="mobile-step-bar__pct">{progress}%</span>
          </div>
          {open ? <ChevronUp /> : <ChevronDown />}
        </div>
      </button>

      <div className="mobile-step-bar__track" aria-hidden="true">
        <div className="mobile-step-bar__fill" style={{ width: `${progress}%` }} />
      </div>

      {open && (
        <ol className="mobile-step-bar__list" aria-label="All steps">
          {visibleSteps.map((step, idx) => {
            const status = getStatus(step.id, idx);
            return (
              <li
                key={step.id}
                className={`mobile-step-bar__step mobile-step-bar__step--${status}`}
                aria-current={status === 'active' ? 'step' : undefined}
              >
                <span className="mobile-step-bar__dot">
                  {status === 'done' ? <CheckIcon /> : <span>{idx + 1}</span>}
                </span>
                <span className="mobile-step-bar__step-label">{step.label}</span>
                {step.id === 'continent' && selectedContinent && (
                  <span className="mobile-step-bar__step-sub">{selectedContinent}</span>
                )}
                {step.id === 'country' && selectedCountry && (
                  <span className="mobile-step-bar__step-sub">{selectedCountry}</span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

// ─── IllustrationCard ─────────────────────────────────────────────────────────
interface IllustrationCardProps {
  name: string;
  image: string;
  selected?: boolean;
  onClick: () => void;
}
const IllustrationCard: React.FC<IllustrationCardProps> = ({ name, image, selected = false, onClick }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <button
      className={`illus-card${selected ? ' illus-card--selected' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={name}
      type="button"
    >
      <span className="illus-card__label">{name}</span>
      <div className="illus-card__img-wrap">
        {!imgError ? (
          <img
            src={image}
            alt={name}
            className="illus-card__img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="illus-card__placeholder" aria-hidden="true">
            <span className="illus-card__placeholder-initial">{name.charAt(0)}</span>
          </div>
        )}
      </div>
    </button>
  );
};

// ─── Step SVG icons ───────────────────────────────────────────────────────────
const IconRequirements: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <rect x="9" y="3" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const IconDocumentation: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const IconTips: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6L15 17H9l-.7-2C6.3 13.7 5 11.5 5 9a7 7 0 0 1 7-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 21h6M10 17v4M14 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// ─── Step metadata ────────────────────────────────────────────────────────────
const STEP_META: Record<string, { icon: React.ReactNode; accent: string }> = {
  Requirements:  { icon: <IconRequirements />,  accent: 'requirements'  },
  Documentation: { icon: <IconDocumentation />, accent: 'documentation' },
  Tips:          { icon: <IconTips />,          accent: 'tips'          },
};

// ─── ContentCardCarousel ──────────────────────────────────────────────────────
interface ContentCardCarouselProps {
  cards: ContentCard[];
  stepLabel: string;
  country: Country;
  intro: string;
}
const ContentCardCarousel: React.FC<ContentCardCarouselProps> = ({
  cards, stepLabel, country, intro,
}) => {
  const [idx, setIdx]       = useState(0);
  const [dir, setDir]       = useState<'left' | 'right'>('right');
  const [animKey, setAnimKey] = useState(0);
  const [imgError, setImgError] = useState(false);
  const touchStartX = React.useRef<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const total = cards?.length ?? 0;

  React.useEffect(() => {
    if (!total) { setIdx(0); return; }
    setIdx(prev => (prev >= total ? total - 1 : prev));
  }, [total]);

  React.useEffect(() => {
    containerRef.current?.focus({ preventScroll: true });
  }, []);

  const go = (next: number, direction: 'left' | 'right') => {
    if (next < 0 || next >= total) return;
    setDir(direction);
    setAnimKey(k => k + 1);
    setIdx(next);
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1, 'right'); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(idx - 1, 'left');  }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [idx, total]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) go(idx + (delta > 0 ? 1 : -1), delta > 0 ? 'right' : 'left');
    touchStartX.current = null;
  };

  if (!cards || total === 0) return null;
  const card = cards[idx];
  if (!card) return null;

  const meta = STEP_META[stepLabel] ?? { icon: <IconRequirements />, accent: 'default' };

  const paragraphs = card.body
    ? card.body.split(/(?<=\.)\s{2,}|(?<=\.)\n/).filter(Boolean)
    : [];

  return (
    <div
      ref={containerRef}
      className={`content-step content-step--${meta.accent}`}
      tabIndex={0}
      aria-label="Card carousel, use arrow keys to navigate"
    >
      <div className="content-step__header">
        <div className="content-step__badge">
          <span className="content-step__badge-icon">{meta.icon}</span>
          <span className="content-step__badge-label">{stepLabel}</span>
        </div>
        <div className="content-step__header-right">
          <span className="content-step__counter" aria-live="polite">
            {idx + 1} / {total}
          </span>
          {/* Flag — shown on tablet, hidden on desktop via CSS */}
          <div className="content-step__flag">
            {!imgError ? (
              <img
                src={country.image}
                alt={country.name}
                className="content-step__flag-img"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="content-step__flag-fallback">{country.name.charAt(0)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="content-step__titles">
        <h2 className="content-step__heading">
          {stepLabel} for{' '}
          <span className="content-step__country-name">{country.name}</span>
        </h2>
        <p className="content-step__intro">{intro}</p>
      </div>

      <div className="content-step__track" aria-hidden="true">
        <div
          className="content-step__track-fill"
          style={{ width: `${((idx + 1) / total) * 100}%` }}
        />
      </div>

      <div className="content-step__row" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button
          className="content-step__arrow content-step__arrow--prev"
          onClick={() => go(idx - 1, 'left')}
          disabled={idx === 0}
          aria-label="Previous card"
          type="button"
        >
          <ChevronLeft />
        </button>

        <div className={`content-step__card content-step__card--${dir}`} key={animKey}>
          <div className="content-step__card-stripe" aria-hidden="true" />
          <div className="content-step__card-num" aria-hidden="true">
            {String(idx + 1).padStart(2, '0')}
          </div>
          <h3 className="content-step__card-title">{card.title}</h3>
          <div className="content-step__card-body">
            {paragraphs.length > 1
              ? paragraphs.map((p, i) => <p key={i}>{p.trim()}</p>)
              : <p>{card.body}</p>
            }
          </div>
          <div className="content-step__swipe-hint" aria-hidden="true">
            <ChevronLeft /><span>swipe</span><ChevronRight />
          </div>
        </div>

        <button
          className="content-step__arrow content-step__arrow--next"
          onClick={() => go(idx + 1, 'right')}
          disabled={idx === total - 1}
          aria-label="Next card"
          type="button"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="content-step__dots" role="tablist" aria-label="Cards">
        {cards.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === idx}
            aria-label={`Card ${i + 1}`}
            className={`content-step__dot${i === idx ? ' content-step__dot--active' : ''}`}
            onClick={() => go(i, i > idx ? 'right' : 'left')}
            type="button"
          />
        ))}
      </div>
    </div>
  );
};

// ─── DownloadStep ─────────────────────────────────────────────────────────────
interface DownloadStepProps {
  country: Country | null;
  continent: Continent | null;
  isLoggedIn: boolean;
  onDownload: () => void;
}
const DownloadStep: React.FC<DownloadStepProps> = ({ country, continent, isLoggedIn, onDownload }) => (
  <div className="content-step content-step--download">
    <div className="content-step__header">
      {country && (
        <div className="content-step__destination">
          <span className="content-step__destination-segment">{continent?.name}</span>
          <ChevronRight />
          <span className="content-step__destination-country">{country.name}</span>
        </div>
      )}
    </div>

    <div className="content-step__titles">
      <h2 className="content-step__heading">Your checklist is ready</h2>
      <p className="content-step__intro">
        Everything you need in one PDF file<br /> - requirements, documents and tips.
      </p>
    </div>

    <div className="content-step__download-card">
      <div className="content-step__download-card-glow" aria-hidden="true" />
      <div className="content-step__download-card-inner">
        <ul className="content-step__checklist-preview">
          {['Entry requirements', 'Required documents', 'Vet & health tips', 'Travel route advice'].map(item => (
            <li key={item} className="content-step__checklist-item">
              <span className="content-step__checklist-check" aria-hidden="true">
                <CheckIcon />
              </span>
              {item}
            </li>
          ))}
        </ul>

        {isLoggedIn ? (
          <button className="btn btn--download-cta" onClick={onDownload} type="button">
            <DownloadIcon />
            Download PDF - {country?.name}
          </button>
        ) : (
          <div className="content-step__login-gate">
            <div className="content-step__login-gate-icon"><LockIcon /></div>
            <div className="content-step__login-gate-text">
              <strong>Log in to download</strong>
              <span>Your checklist is ready - just sign in to grab it.</span>
            </div>
            <div className="content-step__login-actions">
              <Link to="/login" className="btn btn--primary">Log in</Link>
              <Link to="/register" className="btn btn--primary">Create account</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ─── StepSidebar ──────────────────────────────────────────────────────────────
interface StepSidebarProps {
  currentStep: StepId;
  selectedContinent?: string;
  selectedCountry?: string;
  onBack?: () => void;
  onNext: () => void;
  nextDisabled: boolean;
  nextLabel: string;
  isFirst: boolean;
  hideContinent?: boolean;
}
const StepSidebar: React.FC<StepSidebarProps> = ({
  currentStep, selectedContinent, selectedCountry,
  onBack, onNext, nextDisabled, nextLabel, isFirst, hideContinent = false,
}) => {
  const visibleSteps = hideContinent ? STEPS.filter(s => s.id !== 'continent') : STEPS;
  const currentIdx  = visibleSteps.findIndex(s => s.id === currentStep);

  const getStatus = (stepId: StepId, idx: number) => {
    if (stepId === currentStep) return 'active';
    if (idx < currentIdx) return 'done';
    return 'upcoming';
  };

  const getSubLabel = (stepId: StepId) => {
    if (stepId === 'continent' && selectedContinent) return selectedContinent;
    if (stepId === 'country'   && selectedCountry)   return selectedCountry;
    return undefined;
  };

  return (
    <aside className="travel-sidebar">
      {/* Logo links home */}
      <Link to="/" className="travel-sidebar__logo" aria-label="Go to BarkBuddy home">
        <img src="/images/logo.png" alt="BarkBuddy" className="travel-sidebar__logo-img" />
      </Link>

      <p className="travel-sidebar__tagline">
        Choose, read and download<br />so you do not miss a thing!
      </p>

      <ol className="step-list" aria-label="Progress steps">
        {visibleSteps.map((step, idx) => {
          const status = getStatus(step.id, idx);
          const sub    = getSubLabel(step.id);
          const isLast = idx === visibleSteps.length - 1;
          return (
            <li
              key={step.id}
              className={`step-list__item step-list__item--${status}`}
              aria-current={status === 'active' ? 'step' : undefined}
            >
              <span className="step-list__dot" aria-hidden="true">
                {status === 'done'
                  ? <CheckIcon />
                  : <span className="step-list__dot-num">{idx + 1}</span>
                }
              </span>
              {!isLast && <span className="step-list__connector" aria-hidden="true" />}
              <span className="step-list__text">
                <span className="step-list__label">{step.label}</span>
                {sub && <span className="step-list__sub">{sub}</span>}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="travel-sidebar__nav">
        {!isFirst ? (
          <button className="btn btn--ghost" onClick={onBack} type="button" aria-label="Go back">
            <ChevronLeft /> Back
          </button>
        ) : (
          <span />
        )}
        <button
          className="btn btn--primary"
          onClick={onNext}
          disabled={nextDisabled}
          type="button"
          aria-label={nextLabel}
        >
          {nextLabel} <ChevronRight />
        </button>
      </div>
    </aside>
  );
};

// ─── ContinentStep ────────────────────────────────────────────────────────────
interface ContinentStepProps {
  selected: Continent | null;
  onSelect: (c: Continent) => void;
}
const ContinentStep: React.FC<ContinentStepProps> = ({ selected, onSelect }) => (
  <div className="flow-step">
    <h2 className="flow-step__heading">Which continent are you going to?</h2>
    <div className="flow-step__grid">
      {CONTINENTS.map(c => (
        <IllustrationCard
          key={c.id}
          name={c.name}
          image={c.image}
          selected={selected?.id === c.id}
          onClick={() => onSelect(c)}
        />
      ))}
    </div>
  </div>
);

// ─── CountryStep ──────────────────────────────────────────────────────────────
interface CountryStepProps {
  continent: Continent;
  selected: Country | null;
  onSelect: (c: Country) => void;
  hideSearch?: boolean;
}
const CountryStep: React.FC<CountryStepProps> = ({
  continent, selected, onSelect, hideSearch = false,
}) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const base = COUNTRIES.filter(c => c.continentId === continent.id);
    if (!search.trim()) return base.slice(0, 6);
    return base.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [continent.id, search]);

  return (
    <div className="flow-step">
      <h2 className="flow-step__heading">
        {continent.id === 'uk-ireland'
          ? 'Where are you travelling to?'
          : `Which country in ${continent.name}?`}
      </h2>

      {!hideSearch && (
        <div className="country-search">
          <span className="country-search__icon-wrap" aria-hidden="true">
            <SearchIcon />
          </span>
          <div className="country-search__input-wrap">
            <input
              className="country-search__input"
              type="text"
              placeholder={`Search in ${continent.name}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search countries"
              autoComplete="off"
            />
          </div>
          {search && (
            <button
              className="country-search__search-btn"
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch('')}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {filtered.length > 0 ? (
        <>
          {search.trim() && (
            <p className="flow-step__results-label">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
            </p>
          )}
          <div className="flow-step__grid">
            {filtered.map(c => (
              <IllustrationCard
                key={c.id}
                name={c.name}
                image={c.image}
                selected={selected?.id === c.id}
                onClick={() => onSelect(c)}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="flow-step__empty">No countries found for "{search}"</p>
      )}
    </div>
  );
};

// ─── TravelFlow — main ────────────────────────────────────────────────────────
interface TravelFlowProps {
  direction: TravelDirection;
  onClose: () => void;
  isLoggedIn?: boolean;
}
const TravelFlow: React.FC<TravelFlowProps> = ({
  direction,
  onClose,
  isLoggedIn: isLoggedInProp,
}) => {
  const { token } = useAuth();
  const isLoggedIn = isLoggedInProp ?? !!token;
  const isToUK = direction === 'to-uk';

  const ukIrelandContinent: Continent = {
    id: 'uk-ireland',
    name: 'UK & Ireland',
    image: '../../../images/travel/uk_ireland.png',
  };

  const firstStep = isToUK ? 1 : 0;

  const [stepIdx, setStepIdx] = useState(firstStep);
  const [selectedContinent, setSelectedContinent] = useState<Continent | null>(
    isToUK ? ukIrelandContinent : null,
  );
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const currentStep = STEPS[stepIdx];
  const isLastStep  = stepIdx === STEPS.length - 1;

  const countryContent = useMemo(
    () => (selectedCountry ? getCountryContent(selectedCountry.id) : null),
    [selectedCountry],
  );

  React.useEffect(() => {
    try { window.history.pushState({ travelStep: firstStep }, ''); } catch (_) {}

    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as { travelStep?: number } | null;
      if (state?.travelStep !== undefined) {
        setStepIdx(state.travelStep);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  React.useEffect(() => {
    try { window.history.replaceState({ travelStep: stepIdx }, ''); } catch (_) {}
  }, [stepIdx]);

  const canProceed = () => {
    if (currentStep.id === 'continent') return !!selectedContinent;
    if (currentStep.id === 'country')   return !!selectedCountry;
    return true;
  };

  const goNext = () => {
    if (isLastStep) { onClose(); return; }
    setStepIdx(prev => prev + 1);
  };

  const goBack = () => {
    if (stepIdx > firstStep) {
      // go directly to previous step — no history.back() to avoid loops
      const prev = stepIdx - 1;
      window.history.replaceState({ travelStep: prev }, '');
      setStepIdx(prev);
    } else {
      // on first step — exit the flow back to travel page
      onClose();
    }
  };

  const handleContinentSelect = (c: Continent) => {
    setSelectedContinent(c);
    setSelectedCountry(null);
    setStepIdx(1); // no setTimeout — causes state timing issues on iOS 16 Safari
  };

  const handleCountrySelect = (c: Country) => {
    setSelectedCountry(c);
    setStepIdx(prev => prev + 1); // no setTimeout
  };

  const handleDownload = async () => {
    if (!isLoggedIn || !selectedCountry || !countryContent) return;
    const { generateTravelChecklist } = await import('./pdfGenerator');
    generateTravelChecklist({
      country: selectedCountry,
      continent: selectedContinent,
      content: countryContent,
    });
  };

  const renderStep = () => {
    switch (currentStep.id) {
      case 'continent':
        return <ContinentStep selected={selectedContinent} onSelect={handleContinentSelect} />;

      case 'country':
        return selectedContinent ? (
          <CountryStep
            continent={selectedContinent}
            selected={selectedCountry}
            onSelect={handleCountrySelect}
            hideSearch={isToUK}
          />
        ) : (
          // Should never happen but guard against blank screen
          <div className="flow-step">
            <p className="flow-step__empty">Something went wrong. Please go back and try again.</p>
          </div>
        );

      case 'requirements':
      case 'documentation':
      case 'tips': {
        if (!countryContent || !selectedCountry) {
          return (
            <div className="flow-step">
              <p className="flow-step__empty">Loading country info… please go back and reselect your country.</p>
            </div>
          );
        }

        const stepLabel =
          currentStep.id === 'requirements'  ? 'Requirements'  :
          currentStep.id === 'documentation' ? 'Documentation' : 'Useful tips';

        const cards =
          currentStep.id === 'requirements'  ? countryContent.requirements  :
          currentStep.id === 'documentation' ? countryContent.documentation : countryContent.tips;

        if (!cards || cards.length === 0) {
          return (
            <div className="flow-step">
              <p className="flow-step__empty">No {stepLabel.toLowerCase()} info available for {selectedCountry.name} yet.</p>
            </div>
          );
        }

        return (
          <ContentCardCarousel
            cards={cards}
            stepLabel={stepLabel}
            country={selectedCountry}
            intro={countryContent.intro}
          />
        );
      }

      case 'download':
        return (
          <DownloadStep
            country={selectedCountry}
            continent={selectedContinent}
            isLoggedIn={isLoggedIn}
            onDownload={handleDownload}
          />
        );

      default:
        return (
          <div className="flow-step">
            <p className="flow-step__empty">Something went wrong. Please go back.</p>
          </div>
        );
    }
  };

  return (
    <div className="travel-flow">
      <MobileStepBar
        currentStep={currentStep.id}
        selectedContinent={selectedContinent?.name}
        selectedCountry={selectedCountry?.name}
        hideContinent={isToUK}
      />

      <main className="travel-flow__main" aria-label="Travel flow content">
        {/* Back button — previous step, or exits to travel page on first step */}
        <button className="travel-flow__back" onClick={goBack} type="button">
          <ChevronLeft /> Back
        </button>

        <div className="travel-flow__content">{renderStep()}</div>
      </main>

      <div className="mobile-nav-bar">
        {stepIdx > firstStep ? (
          <button className="btn btn--ghost" onClick={goBack} type="button">
            <ChevronLeft /> Back
          </button>
        ) : (
          <span />
        )}
        <button
          className="btn btn--primary"
          onClick={goNext}
          disabled={!canProceed()}
          type="button"
        >
          {isLastStep ? 'Done' : 'Next Step'} <ChevronRight />
        </button>
      </div>

      <StepSidebar
        currentStep={currentStep.id}
        selectedContinent={isToUK ? undefined : selectedContinent?.name}
        selectedCountry={selectedCountry?.name}
        onBack={goBack}
        onNext={goNext}
        nextDisabled={!canProceed()}
        nextLabel={isLastStep ? 'Done' : 'Next Step'}
        isFirst={stepIdx === firstStep}
        hideContinent={isToUK}
      />
    </div>
  );
};

export default TravelFlow;