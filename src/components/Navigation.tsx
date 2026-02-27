import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.scss';
import { useAuth } from '../context/AuthContext';

const GroomingIcon  = () => <img src='../../images/icons/grooming.svg'  alt="Grooming"   className="menu-icon" />;
const NutritionIcon = () => <img src='../../images/icons/nutrition.svg' alt="Nutrition"  className="menu-icon" />;
const TrainingIcon  = () => <img src='../../images/icons/training.svg'  alt="Training"   className="menu-icon" />;
const HealthIcon    = () => <img src='../../images/icons/health.svg'    alt="Health"     className="menu-icon" />;

// ─── Avatar User Menu ─────────────────────────────────────────────────────────
const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  // Derive initials or use avatar image
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="navigation__user-menu" ref={ref}>
      <button
        className="navigation__user-trigger"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="User menu"
      >
        <div className="navigation__avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name || 'User avatar'} />
          ) : (
            <span className="navigation__avatar-initials">{initials}</span>
          )}
        </div>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
          className={`dropdown-arrow ${open ? 'dropdown-arrow--open' : ''}`}
        >
          <path d="M6 8L2 4h8L6 8z"/>
        </svg>
      </button>

      {open && (
        <div className="navigation__user-dropdown">
          {/* User info header */}
          <div className="navigation__user-info">
            <div className="navigation__avatar navigation__avatar--lg">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name || 'User'} />
              ) : (
                <span className="navigation__avatar-initials">{initials}</span>
              )}
            </div>
            <div>
              <p className="navigation__user-name">{user?.name || 'Dog Lover'}</p>
              <p className="navigation__user-email">{user?.email || ''}</p>
            </div>
          </div>

          <div className="navigation__user-divider" />

          <Link to="/dashboard" className="navigation__user-item" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            Dashboard
          </Link>

          <Link to="/settings" className="navigation__user-item" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Settings
          </Link>
          <Link to="/forum" className="navigation__user-item" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Forum
          </Link>

          <div className="navigation__user-divider" />

          <button className="navigation__user-item navigation__user-item--logout" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

//  Navigation
const Navigation: React.FC = () => {
  const { token, isLoading } = useAuth();
  const isAuthenticated = !!token;
  const [isMenuOpen,     setIsMenuOpen]     = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [closeTimer,     setCloseTimer]     = useState<NodeJS.Timeout | null>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleDropdownClick = (menu: string) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const handleMouseEnter = (menu: string) => {
    if (closeTimer) { clearTimeout(closeTimer); setCloseTimer(null); }
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    const timer = setTimeout(() => setActiveDropdown(null), 400);
    setCloseTimer(timer);
  };

  const handleDropdownEnter = () => {
    if (closeTimer) { clearTimeout(closeTimer); setCloseTimer(null); }
  };

  const handleDropdownLeave = () => {
    const timer = setTimeout(() => setActiveDropdown(null), 200);
    setCloseTimer(timer);
  };

  React.useEffect(() => {
    return () => { if (closeTimer) clearTimeout(closeTimer); };
  }, [closeTimer]);

  const careMenuItems = [
    { icon: <GroomingIcon />,  label: 'Grooming',  to: '/tips/grooming'  },
    { icon: <NutritionIcon />, label: 'Nutrition', to: '/tips/nutrition' },
    { icon: <TrainingIcon />,  label: 'Training',  to: '/tips/training'  },
    { icon: <HealthIcon />,    label: 'Health',    to: '/tips/health'    },
  ];

  return (
    <nav className="navigation">
      <div className="navigation__container">

        {/* Logo */}
        <div className="navigation__logo">
          <Link to="/">
            <span className="navigation__brand">BarkBuddy</span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <ul className="navigation__menu">

          {/* Care Tips Dropdown */}
          <li
            className="navigation__menu-item"
            onMouseEnter={() => handleMouseEnter('care')}
            onMouseLeave={handleMouseLeave}
          >
            <a href="#care-tips" className="navigation__menu-link">
              <img src="../../images/icons/care.svg" alt="Dog-Care" />
              Dog Care
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="dropdown-arrow">
                <path d="M6 8L2 4h8L6 8z"/>
              </svg>
            </a>
            {activeDropdown === 'care' && (
              <div
                className="navigation__mega-dropdown"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <div className="navigation__mega-grid">
                  {careMenuItems.map((item) => (
                    <Link key={item.to} to={item.to} className="navigation__mega-item">
                      <div className="navigation__mega-icon">{item.icon}</div>
                      <span className="navigation__mega-label">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </li>

          {/* Service Finder */}
          <li className="navigation__menu-item">
            <Link to="/service-finder" className="navigation__menu-link">
              <img src="../../images/icons/services.svg" alt="Services Icon" />
              Service finder
            </Link>
          </li>

          {/* Travel */}
          <li className="navigation__menu-item">
            <Link to="/travel-page" className="navigation__menu-link">
              <img src="../../images/icons/plane.svg" alt="Travel" />
              Travel
            </Link>
          </li>

          {/* Dog-Friendly */}
          <li className="navigation__menu-item">
            <a href="#dog-friendly" className="navigation__menu-link">
              <img src="../../images/icons/dog-friendly.svg" alt="Dog-Friendly" />
              Dog-Friendly
            </a>
          </li>



          {/* More Dropdown */}
          <li
            className="navigation__menu-item"
            onMouseEnter={() => handleMouseEnter('more')}
            onMouseLeave={handleMouseLeave}
          >
            <a href="#more" className="navigation__menu-link">
              <img src="../../images/icons/more.svg" alt="More" />
              More
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="dropdown-arrow">
                <path d="M6 8L2 4h8L6 8z"/>
              </svg>
            </a>
            {activeDropdown === 'more' && (
              <div
                className="navigation__dropdown"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <a href="#about">About BarkBuddy</a>
                <a href="#contact">Contact BarkBuddy</a>
                <Link to="/register-business" className="navigation__secondary-highlight">
                  <img src="../../images/icons/services.svg" alt="Business" />
                  BarkBuddy for Business
                </Link>
              </div>
            )}
          </li>
        </ul>

        {/* CTA — Login/Register OR Avatar menu */}
        <div className="navigation__cta">
          {isLoading ? (
            <div className="navigation__auth-placeholder" />
          ) : isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Link to="/login" className="btn--nav btn-login">
                <img src="../../images/icons/open.svg" alt="Login to BarkBuddy" />
                Login
              </Link>
              <Link to="/register" className="btn--nav btn-register">
                <img src="../../images/icons/open.svg" alt="Register to BarkBuddy" />
                Register
              </Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`navigation__hamburger ${isMenuOpen ? 'navigation__hamburger--open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <img
            src={isMenuOpen ? "../../images/icons/close.svg" : "../../images/icons/hamburger-menu.svg"}
            alt={isMenuOpen ? "Close" : "Menu"}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navigation__mobile ${isMenuOpen ? 'navigation__mobile--open' : ''}`}>
        <ul>

          {/* Care Tips Mobile */}
          <li>
            <button
              className="navigation__mobile-toggle"
              onClick={() => handleDropdownClick('care-mobile')}
            >
              Dog Care
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                className={`dropdown-arrow ${activeDropdown === 'care-mobile' ? 'dropdown-arrow--open' : ''}`}
              >
                <path d="M6 8L2 4h8L6 8z"/>
              </svg>
            </button>
            {activeDropdown === 'care-mobile' && (
              <div className="navigation__mobile-submenu">
                {careMenuItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={toggleMenu}
                    className="navigation__mobile-icon-item"
                  >
                    <div className="navigation__mobile-icon-wrapper">{item.icon}</div>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </li>

          {/* Service Finder Mobile */}
          <li>
            <Link to="/service-finder" onClick={toggleMenu}>Service finder</Link>
          </li>

          {/* Travel Mobile */}
          <li>
            <Link to="/travel-page" onClick={toggleMenu}>Travel</Link>
          </li>

          {/* Dog-Friendly Mobile */}
          <li>
            <a href="#dog-friendly" onClick={toggleMenu}>Dog-Friendly</a>
          </li>

          {/* Forum Mobile */}
          <li>
            <Link to="/forum" onClick={toggleMenu}>Forum</Link>
          </li>

          {/* More Mobile */}
          <li>
            <button
              className="navigation__mobile-toggle"
              onClick={() => handleDropdownClick('more-mobile')}
            >
              More
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                className={`dropdown-arrow ${activeDropdown === 'more-mobile' ? 'dropdown-arrow--open' : ''}`}
              >
                <path d="M6 8L2 4h8L6 8z"/>
              </svg>
            </button>
            {activeDropdown === 'more-mobile' && (
              <div className="navigation__mobile-submenu">
                <a href="#about" onClick={toggleMenu}>About BarkBuddy</a>
                <a href="#contact" onClick={toggleMenu}>Contact BarkBuddy</a>
                <Link to="/register-business" onClick={toggleMenu} className="navigation__mobile-highlight">
                  <img src="../../images/icons/shop.svg" alt="Business" />
                  BarkBuddy for Business 
                </Link>
              </div>
            )}
          </li>

          {/* Divider */}
          <li className="navigation__mobile-divider" />

          {/* Mobile Auth CTA */}
          {!isLoading && (
            isAuthenticated ? (
              <MobileUserMenu onClose={toggleMenu} />
            ) : (
              <li className="navigation__mobile-buttons">
                <Link to="/login" className="btn--nav btn-login" onClick={toggleMenu}>
                  <img src="../../images/icons/open.svg" alt="Login to BarkBuddy" />
                  Login
                </Link>
                <Link to="/register" className="btn--nav btn-register" onClick={toggleMenu}>
                  <img src="../../images/icons/open.svg" alt="Register to BarkBuddy" />
                  Register
                </Link>
              </li>
            )
          )}

        </ul>
      </div>
    </nav>
  );
};

// ─── Mobile User Menu ─────────────────────────────────────────────────────────
const MobileUserMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <li className="navigation__mobile-user">
      <div className="navigation__mobile-user-info">
        <div className="navigation__avatar navigation__avatar--md">
          {user?.avatar ? (
            <img src={user.avatar} alt={user?.name || 'User'} />
          ) : (
            <span className="navigation__avatar-initials">{initials}</span>
          )}
        </div>
        <div>
          <p className="navigation__user-name">{user?.name || 'Dog Lover'}</p>
          <p className="navigation__user-email">{user?.email || ''}</p>
        </div>
      </div>

      <Link to="/dashboard" className="navigation__mobile-user-link" onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        Dashboard
      </Link>

      <Link to="/settings" className="navigation__mobile-user-link" onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        Settings
      </Link>

      <button className="navigation__mobile-user-link navigation__mobile-user-link--logout" onClick={handleLogout}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Log Out
      </button>
    </li>
  );
};

export default Navigation;