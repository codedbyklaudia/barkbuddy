import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.scss';
import { Hand, SunDim, Ligature, LogIn, ArrowDownFromLine, MousePointer2, UserRoundPlus } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getProfile } from '../api/users';

const GroomingIcon  = () => <img src='../../images/icons/grooming.svg'  alt="Grooming"  className="menu-icon" />;
const NutritionIcon = () => <img src='../../images/icons/nutrition.svg' alt="Nutrition" className="menu-icon" />;
const TrainingIcon  = () => <img src='../../images/icons/training.svg'  alt="Training"  className="menu-icon" />;
const HealthIcon    = () => <img src='../../images/icons/health.svg'    alt="Health"    className="menu-icon" />;

// ─── Types ────────────────────────────────────────────────────────────────────

interface A11ySettings {
  fontSize:      'normal' | 'large' | 'xl';
  highContrast:  boolean;
  reducedMotion: boolean;
  dyslexiaFont:  boolean;
  lineSpacing:   boolean;
  cursorLarge:   boolean;
}

const A11Y_DEFAULTS: A11ySettings = {
  fontSize:      'normal',
  highContrast:  false,
  reducedMotion: false,
  dyslexiaFont:  false,
  lineSpacing:   false,
  cursorLarge:   false,
};

function loadA11y(): A11ySettings {
  try {
    const saved = localStorage.getItem('bb_a11y');
    return saved ? { ...A11Y_DEFAULTS, ...JSON.parse(saved) } : A11Y_DEFAULTS;
  } catch { return A11Y_DEFAULTS; }
}

function applyA11y(s: A11ySettings) {
  const root = document.documentElement;
  root.style.setProperty('--a11y-font-size', { normal: '16px', large: '19px', xl: '22px' }[s.fontSize]);
  root.classList.toggle('a11y-high-contrast',  s.highContrast);
  root.classList.toggle('a11y-reduced-motion', s.reducedMotion);
  root.classList.toggle('a11y-dyslexia-font',  s.dyslexiaFont);
  root.classList.toggle('a11y-line-spacing',   s.lineSpacing);
  root.classList.toggle('a11y-large-cursor',   s.cursorLarge);
  try { localStorage.setItem('bb_a11y', JSON.stringify(s)); } catch {}
}

// ─── NavAvatar ────────────────────────────────────────────────────────────────

interface NavAvatarProps {
  src?:      string;
  initials?: string;
  alt?:      string;
  size?:     'sm' | 'md' | 'lg' | 'xl' | 'trigger' | 'mobile';
}

const NavAvatar: React.FC<NavAvatarProps> = ({ src, initials = '?', alt = 'User avatar', size = 'md' }) => (
  <div className={`nav-avatar nav-avatar--${size}`} aria-hidden="true">
    {src ? <img src={src} alt={alt} /> : <span>{initials}</span>}
  </div>
);

// ─── Accessibility Panel ──────────────────────────────────────────────────────
// Accepts an `onClose` and renders its own backdrop when `isMobile` is true.
// On desktop it stays as a positioned dropdown; on mobile it's a fixed overlay.

interface A11yPanelProps {
  onClose:  () => void;
  isMobile?: boolean;
}

const AccessibilityPanel: React.FC<A11yPanelProps> = ({ onClose, isMobile = false }) => {
  const [settings, setSettings] = useState<A11ySettings>(loadA11y);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [onClose]);

  // On desktop close on outside click; on mobile the backdrop button handles it
  useEffect(() => {
    if (isMobile) return;
    const click = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', click);
    return () => document.removeEventListener('mousedown', click);
  }, [onClose, isMobile]);

  const update = useCallback((patch: Partial<A11ySettings>) => {
    setSettings(prev => { const next = { ...prev, ...patch }; applyA11y(next); return next; });
  }, []);

  const reset = () => { const d = { ...A11Y_DEFAULTS }; setSettings(d); applyA11y(d); };

  const toggleRows = [
    { key: 'highContrast',  icon: <SunDim />,           label: 'High contrast',          sub: 'Sharper colour differences'        },
    { key: 'reducedMotion', icon: <Hand />,              label: 'Reduce motion',          sub: 'Fewer animations & transitions'   },
    { key: 'dyslexiaFont',  icon: <Ligature />,          label: 'Dyslexia-friendly font', sub: 'OpenDyslexic typeface'            },
    { key: 'lineSpacing',   icon: <ArrowDownFromLine />, label: 'Increased line spacing', sub: 'More breathing room'              },
    { key: 'cursorLarge',   icon: <MousePointer2 />,     label: 'Large cursor',           sub: 'Easier to spot on screen'         },
  ];

  const panel = (
    <div
      className={`a11y-panel ${isMobile ? 'a11y-panel--mobile' : ''}`}
      ref={ref}
      role="dialog"
      aria-label="Accessibility settings"
      aria-modal="true">

      {/* Header */}
      <div className="a11y-panel-header">
        <div className="a11y-panel-title">
          <span className="a11y-panel-badge" aria-hidden="true"><Hand /></span>
          <div>
            <h2 className="a11y-panel-heading">Accessibility</h2>
            <p className="a11y-panel-sub">Customise your experience</p>
          </div>
        </div>
        <button className="a11y-panel-close" onClick={onClose} aria-label="Close accessibility panel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Text size */}
      <div className="a11y-section">
        <p className="a11y-section-label">Text size</p>
        <div className="a11y-font-row" role="group" aria-label="Text size">
          {(['normal', 'large', 'xl'] as const).map(size => (
            <button
              key={size}
              className={`a11y-font-btn ${settings.fontSize === size ? 'a11y-font-btn--active' : ''}`}
              onClick={() => update({ fontSize: size })}
              aria-pressed={settings.fontSize === size}>
              <span className={`a11y-font-preview a11y-font-preview--${size}`}>Aa</span>
              <span>{size === 'normal' ? 'Default' : size === 'large' ? 'Large' : 'Extra large'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="a11y-divider" />

      {/* Visual toggles */}
      <div className="a11y-section">
        <p className="a11y-section-label">Visual preferences</p>
        {toggleRows.map(({ key, icon, label, sub }) => {
          const checked = settings[key as keyof A11ySettings] as boolean;
          return (
            <div key={key} className={`a11y-toggle-row ${checked ? 'a11y-toggle-row--on' : ''}`}>
              <span className="a11y-toggle-icon" aria-hidden="true">{icon}</span>
              <div className="a11y-toggle-text">
                <span className="a11y-toggle-label">{label}</span>
                <span className="a11y-toggle-sub">{sub}</span>
              </div>
              <button
                className={`a11y-switch ${checked ? 'a11y-switch--on' : ''}`}
                onClick={() => update({ [key]: !checked } as Partial<A11ySettings>)}
                role="switch" aria-checked={checked} aria-label={label}>
                <span className="a11y-switch-thumb" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="a11y-panel-footer">
        <button className="a11y-reset-btn" onClick={reset}>↺ Reset to defaults</button>
      </div>
    </div>
  );

  // Mobile: wrap in a dimmed full-screen backdrop
  if (isMobile) {
    return (
      <div className="a11y-backdrop" aria-hidden="false">
        {/* Clicking the backdrop closes the panel */}
        <button className="a11y-backdrop__dismiss" onClick={onClose} aria-label="Close accessibility panel" tabIndex={-1} />
        {panel}
      </div>
    );
  }

  return panel;
};

// ─── Accessibility Button (desktop) ──────────────────────────────────────────

const AccessibilityButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => { applyA11y(loadA11y()); }, []);

  return (
    <div className="navigation__a11y-wrap">
      <button
        className={`navigation__a11y-btn ${open ? 'navigation__a11y-btn--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Accessibility settings"
        aria-expanded={open}
        title="Accessibility">
        <Hand />
        <span className="a11y-btn-label">Accessibility</span>
      </button>
      {/* Desktop: dropdown positioned below button */}
      {open && <AccessibilityPanel onClose={() => setOpen(false)} isMobile={false} />}
    </div>
  );
};

// ─── User Menu (desktop) ──────────────────────────────────────────────────────

const UserMenu: React.FC = () => {
  const { user: authUser, token, logout } = useAuth();
  const navigate = useNavigate();
  const [open,      setOpen]      = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [name,      setName]      = useState<string>(authUser?.name || '');
  const [email,     setEmail]     = useState<string>(authUser?.email || '');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    getProfile(token)
      .then(({ user }) => { setAvatarUrl(user.avatarUrl); setName(user.name || ''); setEmail(user.email || ''); })
      .catch(() => { setAvatarUrl(authUser?.avatarUrl); setName(authUser?.name || ''); setEmail(authUser?.email || ''); });
  }, [token]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); setOpen(false); navigate('/'); };
  const initials = name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div className="navigation__user-menu" ref={ref}>
      <button
        className={`navigation__user-trigger ${open ? 'navigation__user-trigger--open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-haspopup="true" aria-expanded={open} aria-label="User menu">
        <NavAvatar src={avatarUrl} initials={initials} alt={name || 'User'} size="trigger" />
        <span className="navigation__user-trigger-name">{name.split(' ')[0] || 'Account'}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
          className={`dropdown-arrow ${open ? 'dropdown-arrow--open' : ''}`} aria-hidden="true">
          <path d="M6 8L2 4h8L6 8z"/>
        </svg>
      </button>

      {open && (
        <div className="navigation__user-dropdown">
          <div className="navigation__user-info">
            <NavAvatar src={avatarUrl} initials={initials} alt={name || 'User'} size="lg" />
            <div className="navigation__user-info-text">
              <p className="navigation__user-name">{name || 'Dog Lover'}</p>
              <p className="navigation__user-email">{email}</p>
            </div>
          </div>
          <div className="navigation__user-divider" />
          <Link to="/dashboard" className="navigation__user-item" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Dashboard
          </Link>
          <Link to="/dashboard" state={{ tab: 'settings' }} className="navigation__user-item" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Settings
          </Link>
          <Link to="/forum-page" className="navigation__user-item" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Forum
          </Link>
          <div className="navigation__user-divider" />
          <button className="navigation__user-item navigation__user-item--logout" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Mobile User Menu ─────────────────────────────────────────────────────────

const MobileUserMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user: authUser, token, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [name,      setName]      = useState<string>(authUser?.name || '');
  const [email,     setEmail]     = useState<string>(authUser?.email || '');

  useEffect(() => {
    if (!token) return;
    getProfile(token)
      .then(({ user }) => { setAvatarUrl(user.avatarUrl); setName(user.name || ''); setEmail(user.email || ''); })
      .catch(() => { setAvatarUrl(authUser?.avatarUrl); setName(authUser?.name || ''); setEmail(authUser?.email || ''); });
  }, [token]);

  const initials = name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  const handleLogout = () => { logout(); onClose(); navigate('/'); };

  return (
    <li className="navigation__mobile-user">
      <div className="navigation__mobile-user-info">
        <NavAvatar src={avatarUrl} initials={initials} alt={name || 'User'} size="mobile" />
        <div className="navigation__mobile-user-text">
          <p className="navigation__user-name">{name || 'Dog Lover'}</p>
          <p className="navigation__user-email">{email}</p>
        </div>
      </div>
      <Link to="/dashboard" className="navigation__mobile-user-link" onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        Dashboard
      </Link>
      <Link to="/dashboard" state={{ tab: 'settings' }} className="navigation__mobile-user-link" onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        Settings
      </Link>
      <button className="navigation__mobile-user-link navigation__mobile-user-link--logout" onClick={handleLogout}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Log Out
      </button>
    </li>
  );
};

// ─── Main Navigation ──────────────────────────────────────────────────────────

const Navigation: React.FC = () => {
  const { token, isLoading } = useAuth();
  const isAuthenticated = !!token;
  const [isMenuOpen,      setIsMenuOpen]      = useState(false);
  const [activeDropdown,  setActiveDropdown]  = useState<string | null>(null);
  const [closeTimer,      setCloseTimer]      = useState<ReturnType<typeof setTimeout> | null>(null);
  const [scrolled,        setScrolled]        = useState(false);
  // Mobile a11y panel lives at nav root so it never gets clipped by the menu list
  const [mobileA11yOpen,  setMobileA11yOpen]  = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const toggleMenu          = () => setIsMenuOpen(v => !v);
  const handleDropdownClick = (menu: string) => setActiveDropdown(activeDropdown === menu ? null : menu);
  const handleMouseEnter    = (menu: string) => { if (closeTimer) { clearTimeout(closeTimer); setCloseTimer(null); } setActiveDropdown(menu); };
  const handleMouseLeave    = () => { const t = setTimeout(() => setActiveDropdown(null), 400); setCloseTimer(t); };
  const handleDropdownEnter = () => { if (closeTimer) { clearTimeout(closeTimer); setCloseTimer(null); } };
  const handleDropdownLeave = () => { const t = setTimeout(() => setActiveDropdown(null), 200); setCloseTimer(t); };
  useEffect(() => { return () => { if (closeTimer) clearTimeout(closeTimer); }; }, [closeTimer]);

  const careMenuItems = [
    { icon: <GroomingIcon />,  label: 'Grooming',  to: '/tips/grooming'  },
    { icon: <NutritionIcon />, label: 'Nutrition', to: '/tips/nutrition' },
    { icon: <TrainingIcon />,  label: 'Training',  to: '/tips/training'  },
    { icon: <HealthIcon />,    label: 'Health',    to: '/tips/health'    },
  ];

  return (
    <nav className={`navigation ${scrolled ? 'navigation--scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <a href="#main-content" className="navigation__skip-link">Skip to main content</a>

      <div className="navigation__container">
        {/* Logo */}
        <div className="navigation__logo">
          <Link to="/" aria-label="BarkBuddy — go to homepage">
            <img src="../images/logo.png" alt="BarkBuddy" className="navigation__logo-img" />
          </Link>
        </div>

        {/* Desktop menu */}
        <ul className="navigation__menu" role="menubar">
          <li className="navigation__menu-item" role="none"
            onMouseEnter={() => handleMouseEnter('care')} onMouseLeave={handleMouseLeave}>
            <a href="#care-tips" className="navigation__menu-link" role="menuitem"
              aria-haspopup="true" aria-expanded={activeDropdown === 'care'}>
              <i className="bi bi-suit-heart" aria-hidden="true" /> Dog Care
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="dropdown-arrow" aria-hidden="true"><path d="M6 8L2 4h8L6 8z"/></svg>
            </a>
            {activeDropdown === 'care' && (
              <div className="navigation__mega-dropdown" role="menu" onMouseEnter={handleDropdownEnter} onMouseLeave={handleDropdownLeave}>
                <div className="navigation__mega-grid">
                  {careMenuItems.map(item => (
                    <Link key={item.to} to={item.to} className="navigation__mega-item" role="menuitem">
                      <div className="navigation__mega-icon">{item.icon}</div>
                      <span className="navigation__mega-label">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </li>

          <li className="navigation__menu-item" role="none">
            <Link to="/service-finder" className="navigation__menu-link" role="menuitem">
              <i className="bi bi-shop" aria-hidden="true" /> BarkBuddy Discover
            </Link>
          </li>

          <li className="navigation__menu-item" role="none">
            <Link to="/travel-page" className="navigation__menu-link" role="menuitem">
              <i className="bi bi-airplane" aria-hidden="true" /> Travel
            </Link>
          </li>

          <li className="navigation__menu-item" role="none"
            onMouseEnter={() => handleMouseEnter('more')} onMouseLeave={handleMouseLeave}>
            <a href="#more" className="navigation__menu-link" role="menuitem"
              aria-haspopup="true" aria-expanded={activeDropdown === 'more'}>
              <i className="bi bi-grid" aria-hidden="true" /> More
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="dropdown-arrow" aria-hidden="true"><path d="M6 8L2 4h8L6 8z"/></svg>
            </a>
            {activeDropdown === 'more' && (
              <div className="navigation__dropdown" role="menu" onMouseEnter={handleDropdownEnter} onMouseLeave={handleDropdownLeave}>
                <a href="#about" role="menuitem"><i className="bi bi-bookmark-heart-fill" aria-hidden="true" /> About BarkBuddy</a>
                <a href="#contact" role="menuitem"><i className="bi bi-telephone" aria-hidden="true" /> Contact BarkBuddy</a>
                <Link to="/register-business" className="navigation__secondary-highlight" role="menuitem">
                  <i className="bi bi-briefcase" aria-hidden="true" /> BarkBuddy for Business
                </Link>
              </div>
            )}
          </li>
        </ul>

        {/* Desktop CTA */}
        <div className="navigation__cta">
          <AccessibilityButton />
          <span className="navigation__cta-divider" aria-hidden="true" />
          {isLoading ? (
            <div className="navigation__auth-placeholder" aria-hidden="true" />
          ) : isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Link to="/login"    className="btn--nav btn-login"><LogIn /> Log In</Link>
              <Link to="/register" className="btn--nav btn-register"><UserRoundPlus /> Register</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`navigation__hamburger ${isMenuOpen ? 'navigation__hamburger--open' : ''}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen} aria-controls="mobile-menu">
          <img src={isMenuOpen ? '../../images/icons/close.svg' : '../../images/icons/hamburger-menu.svg'} alt="" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile menu */}
      <div id="mobile-menu"
        className={`navigation__mobile ${isMenuOpen ? 'navigation__mobile--open' : ''}`}
        aria-hidden={!isMenuOpen}>
        <ul role="menu">
          {/* Dog Care */}
          <li role="none">
            <button className="navigation__mobile-toggle"
              onClick={() => handleDropdownClick('care-mobile')}
              aria-haspopup="true" aria-expanded={activeDropdown === 'care-mobile'}>
              <i className="bi bi-suit-heart" aria-hidden="true" /> Dog Care
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                className={`dropdown-arrow ${activeDropdown === 'care-mobile' ? 'dropdown-arrow--open' : ''}`}
                aria-hidden="true"><path d="M6 8L2 4h8L6 8z"/></svg>
            </button>
            {activeDropdown === 'care-mobile' && (
              <div className="navigation__mobile-submenu" role="menu">
                {careMenuItems.map(item => (
                  <Link key={item.to} to={item.to} onClick={toggleMenu} className="navigation__mobile-icon-item" role="menuitem">
                    <div className="navigation__mobile-icon-wrapper">{item.icon}</div>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </li>

          <li role="none"><Link to="/service-finder" onClick={toggleMenu} role="menuitem"><i className="bi bi-shop" aria-hidden="true" /> BarkBuddy Discover</Link></li>
          <li role="none"><Link to="/travel-page"    onClick={toggleMenu} role="menuitem"><i className="bi bi-airplane" aria-hidden="true" /> Travel</Link></li>

          {/* More */}
          <li role="none">
            <button className="navigation__mobile-toggle"
              onClick={() => handleDropdownClick('more-mobile')}
              aria-haspopup="true" aria-expanded={activeDropdown === 'more-mobile'}>
              <i className="bi bi-grid" aria-hidden="true" /> More
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                className={`dropdown-arrow ${activeDropdown === 'more-mobile' ? 'dropdown-arrow--open' : ''}`}
                aria-hidden="true"><path d="M6 8L2 4h8L6 8z"/></svg>
            </button>
            {activeDropdown === 'more-mobile' && (
              <div className="navigation__mobile-submenu" role="menu">
                <Link to="/about"             onClick={toggleMenu} role="menuitem"><i className="bi bi-bookmark-heart-fill" aria-hidden="true" /> About BarkBuddy</Link>
                <Link to="/contact"           onClick={toggleMenu} role="menuitem"><i className="bi bi-telephone" aria-hidden="true" /> Contact BarkBuddy</Link>
                <Link to="/register-business" onClick={toggleMenu} role="menuitem" className="navigation__mobile-highlight">
                  <i className="bi bi-briefcase" aria-hidden="true" /> BarkBuddy for Business
                </Link>
              </div>
            )}
          </li>

          <li className="navigation__mobile-divider" role="none" />

          {/* Mobile a11y row — button only, panel is rendered at nav root */}
          <li className="navigation__mobile-a11y-row" role="none">
            <button
              className={`navigation__mobile-a11y-btn ${mobileA11yOpen ? 'navigation__mobile-a11y-btn--open' : ''}`}
              onClick={() => setMobileA11yOpen(o => !o)}
              aria-label="Accessibility settings"
              aria-expanded={mobileA11yOpen}>
              <span className="navigation__mobile-a11y-icon" aria-hidden="true"><Hand /></span>
              <span>Accessibility settings</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                className={`dropdown-arrow ${mobileA11yOpen ? 'dropdown-arrow--open' : ''}`}
                aria-hidden="true"><path d="M6 8L2 4h8L6 8z"/></svg>
            </button>
          </li>

          <li className="navigation__mobile-divider" role="none" />

          {/* Auth */}
          {!isLoading && (
            isAuthenticated ? (
              <MobileUserMenu onClose={toggleMenu} />
            ) : (
              <li className="navigation__mobile-buttons" role="none">
                <Link to="/login"    className="btn--nav btn-login"    onClick={toggleMenu}><LogIn /> Login</Link>
                <Link to="/register" className="btn--nav btn-register" onClick={toggleMenu}><UserRoundPlus /> Register</Link>
              </li>
            )
          )}
        </ul>
      </div>

      {/* Mobile a11y panel — rendered here at nav root, above everything */}
      {mobileA11yOpen && (
        <AccessibilityPanel
          onClose={() => setMobileA11yOpen(false)}
          isMobile={true}
        />
      )}
    </nav>
  );
};

export default Navigation;