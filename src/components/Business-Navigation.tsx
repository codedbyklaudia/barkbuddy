import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Business-Navigation.scss';

const BusinessNavigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu  = () => setIsMenuOpen(false);

  return (
    <nav className="biz-nav">
      <div className="biz-nav__container">

        {/* ── Logo ── */}
        <div className="biz-nav__logo">
          <Link to="/">
            <span className="biz-nav__brand">
              BarkBuddy <br />
              for Business
            </span>
          </Link>
        </div>

        {/* ── Desktop Menu ── */}
        <ul className="biz-nav__menu">

          <li className="biz-nav__menu-item">
            <a href="#why-barkbuddy" className="biz-nav__menu-link">
              <img src="/images/icons/care.svg" alt="" aria-hidden="true" />
              Why BarkBuddy?
            </a>
          </li>

          <li className="biz-nav__menu-item">
            <a href="#how-it-works" className="biz-nav__menu-link">
              <img src="/images/icons/services.svg" alt="" aria-hidden="true" />
              How It Works
            </a>
          </li>

          <li className="biz-nav__menu-item">
            <a href="#contact" className="biz-nav__menu-link">
              <img src="/images/icons/services.svg" alt="" aria-hidden="true" />
              Contact Us
            </a>
          </li>

        </ul>

        {/* ── Desktop CTA ── */}
        <div className="biz-nav__cta">
          <Link to="/business/login" className="biz-nav__btn-login">
            <img src="/images/icons/open.svg" alt="" aria-hidden="true" />
            Log In
          </Link>
          <Link to="/business/register" className="biz-nav__btn-register">
            <img src="/images/icons/open.svg" alt="" aria-hidden="true" />
            List Your Business
          </Link>
        </div>

        {/* ── Hamburger ── */}
        <button
          className="biz-nav__hamburger"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          <img
            src={isMenuOpen ? '/images/icons/close.svg' : '/images/icons/hamburger-menu.svg'}
            alt=""
            aria-hidden="true"
          />
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      <div className={`biz-nav__mobile ${isMenuOpen ? 'biz-nav__mobile--open' : ''}`}>
        <ul>

          <li>
            <a href="#why-barkbuddy" onClick={closeMenu}>
              <img src="/images/icons/care.svg" alt="" aria-hidden="true" />
              Why BarkBuddy?
            </a>
          </li>

          <li>
            <a href="#how-it-works" onClick={closeMenu}>
              <img src="/images/icons/services.svg" alt="" aria-hidden="true" />
              How It Works
            </a>
          </li>

          <li>
            <a href="#pricing" onClick={closeMenu}>
              <img src="/images/icons/care.svg" alt="" aria-hidden="true" />
              Pricing
            </a>
          </li>

          <li>
            <a href="#contact" onClick={closeMenu}>
              <img src="/images/icons/services.svg" alt="" aria-hidden="true" />
              Contact Us
            </a>
          </li>

          {/* Divider */}
          <li className="biz-nav__mobile-divider" aria-hidden="true" />

          {/* Mobile CTAs */}
          <li className="biz-nav__mobile-buttons">
            <Link to="/business/login" className="biz-nav__btn-login" onClick={closeMenu}>
              <img src="/images/icons/open.svg" alt="" aria-hidden="true" />
              Log In
            </Link>
            <Link to="/business/register" className="biz-nav__btn-register" onClick={closeMenu}>
              <img src="/images/icons/open.svg" alt="" aria-hidden="true" />
              List Your Business
            </Link>
          </li>

        </ul>
      </div>
    </nav>
  );
};

export default BusinessNavigation;