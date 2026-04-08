import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ForumPolicy.scss';
import Footer from "../Footer";

interface Section {
  id: string;
  number: string;
  title: string;
}

const SECTIONS: Section[] = [
  { id: 'intro',        number: '01', title: 'About These Terms' },
  { id: 'eligibility',  number: '02', title: 'Eligibility & Registration' },
  { id: 'platform',     number: '03', title: 'Using BarkBuddy' },
  { id: 'listings',     number: '04', title: 'Business Listings & Services' },
  { id: 'bookings',     number: '05', title: 'Bookings & Payments' },
  { id: 'conduct',      number: '06', title: 'User Conduct' },
  { id: 'content',      number: '07', title: 'User Content & Licence' },
  { id: 'vet',          number: '08', title: 'Veterinary Disclaimer' },
  { id: 'ip',           number: '09', title: 'Intellectual Property' },
  { id: 'privacy',      number: '10', title: 'Privacy & Data Protection' },
  { id: 'liability',    number: '11', title: 'Limitation of Liability' },
  { id: 'termination',  number: '12', title: 'Termination' },
  { id: 'law',          number: '13', title: 'Governing Law' },
  { id: 'changes',      number: '14', title: 'Changes to These Terms' },
  { id: 'contact',      number: '15', title: 'Contact Us' },
];

const Terms: React.FC = () => {
  const [activeSection, setActiveSection] = useState('intro');

  useEffect(() => {
    const handleScroll = () => {
      for (const s of [...SECTIONS].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 140) {
          setActiveSection(s.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="policy-page">

      {/* Hero */}
      <section className="policy-hero">
        <div className="policy-hero__inner">
          <div className="policy-hero__eyebrow">
            <span>Legal Documents</span>
          </div>
          <h1 className="policy-hero__title">
            Terms of<em> Service</em>
          </h1>
          <div className="policy-hero__meta">
            <span className="policy-hero__badge">
              <i className="bi bi-shield-check" />
              UK Compliant
            </span>
            <span className="policy-hero__badge">
              <i className="bi bi-calendar3" />
              Effective: January 2026
            </span>
            <span className="policy-hero__badge">
              <i className="bi bi-arrow-clockwise" />
              Last Updated: March 2026
            </span>
          </div>
        </div>
      </section>

      {/* Date bar */}
      <div className="policy-date-bar">
        <p>Please read these Terms carefully before using BarkBuddy. By accessing our platform, you agree to be bound by them.</p>
        <Link to="/" className="policy-date-bar__back">
          <i className="bi bi-arrow-left" /> Back to Homepage
        </Link>
      </div>

      {/* Layout */}
      <div className="policy-layout">

        {/* Sidebar nav */}
        <nav className="policy-nav" aria-label="Terms sections">
          <p className="policy-nav__label">Contents</p>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`policy-nav__link ${activeSection === s.id ? 'policy-nav__link--active' : ''}`}
              onClick={() => scrollTo(s.id)}
            >
              {s.number} · {s.title}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="policy-content">

          {/* 01 */}
          <section id="intro" className="policy-section">
            <p className="policy-section__number">01</p>
            <h2 className="policy-section__title">About These Terms</h2>
            <div className="policy-section__body">
              <p>Welcome to BarkBuddy. These Terms of Service ("Terms") govern your access to and use of the BarkBuddy platform, operated by <strong>BarkBuddy Ltd</strong> ("we", "us", "our"), a company registered in England and Wales.</p>
              <p>By creating an account or using any part of the Platform, you confirm that you have read, understood, and agree to be bound by these Terms, our <Link to="/privacy-policy" style={{ color: '#927ACF', fontWeight: 700 }}>Privacy Policy</Link>, and our <Link to="/forum-policy" style={{ color: '#927ACF', fontWeight: 700 }}>Forum & Community Policy</Link>.</p>
              <div className="policy-section__callout">
                <p>If you do not agree to these Terms, you must not access or use BarkBuddy.</p>
              </div>
            </div>
          </section>

          {/* 02 */}
          <section id="eligibility" className="policy-section">
            <p className="policy-section__number">02</p>
            <h2 className="policy-section__title">Eligibility &amp; Registration</h2>
            <div className="policy-section__body">
              <p>To use BarkBuddy you must be at least <strong>18 years of age</strong> and resident in the United Kingdom, or accessing the Platform with the intent to use UK-based services.</p>
              <p>When you register an account, you agree to:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span>Provide accurate, current, and complete information about yourself</span></li>
                <li className="policy-list__item"><span>Keep your account details and password secure and confidential</span></li>
                <li className="policy-list__item"><span>Notify us immediately of any unauthorised use of your account</span></li>
                <li className="policy-list__item"><span>Accept responsibility for all activity that occurs under your account</span></li>
              </ul>
              <p>We reserve the right to refuse registration or suspend accounts at our discretion, including where we believe information provided is inaccurate or misleading.</p>
            </div>
          </section>

          {/* 03 */}
          <section id="platform" className="policy-section">
            <p className="policy-section__number">03</p>
            <h2 className="policy-section__title">Using BarkBuddy</h2>
            <div className="policy-section__body">
              <p>BarkBuddy is a platform that connects dog owners with dog care services, dog-friendly places, and a community of fellow dog lovers across the UK.</p>

              <div className="policy-subsection">
                <p className="policy-subsection__title">Service Finder</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Search and discover verified groomers, vets, trainers, pet shops, and more near you</span></li>
                  <li className="policy-list__item"><span>Browse dog-friendly parks, hotels, restaurants, and day care providers</span></li>
                  <li className="policy-list__item"><span>View business profiles, photos, contact details, and user reviews</span></li>
                </ul>
              </div>

              <div className="policy-subsection">
                <p className="policy-subsection__title">Community Forum</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Post questions, share advice, and connect with other dog owners</span></li>
                  <li className="policy-list__item"><span>All Forum use is also governed by our Forum &amp; Community Policy</span></li>
                </ul>
              </div>

              <div className="policy-subsection">
                <p className="policy-subsection__title">Travel Tools</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Plan dog-friendly trips with guided documentation checklists and destination guides</span></li>
                  <li className="policy-list__item"><span>Generate travel preparation documents for your pet</span></li>
                </ul>
              </div>

              <div className="policy-subsection">
                <p className="policy-subsection__title">BarkBuddy Dashboard</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Manage your dog profiles, track health check-ins, and connect with buddies</span></li>
                  <li className="policy-list__item"><span>Register your dog and keep records up to date</span></li>
                </ul>
              </div>
            </div>
          </section>

          {/* 04 */}
          <section id="listings" className="policy-section">
            <p className="policy-section__number">04</p>
            <h2 className="policy-section__title">Business Listings &amp; Services</h2>
            <div className="policy-section__body">
              <p>Businesses may apply to list their services or activities on BarkBuddy. By submitting a listing, business owners agree to the following:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span>All information provided must be accurate, truthful, and kept up to date</span></li>
                <li className="policy-list__item"><span>Businesses must hold all required licences, insurance, and certifications applicable under UK law</span></li>
                <li className="policy-list__item"><span>BarkBuddy reserves the right to approve, reject, or remove any listing at our sole discretion</span></li>
                <li className="policy-list__item"><span>Listings are subject to a review and verification process before appearing on the Platform</span></li>
                <li className="policy-list__item"><span>BarkBuddy acts as a directory and does not directly employ, endorse, or guarantee the services of any listed business</span></li>
              </ul>
              <div className="policy-section__callout--warning policy-section__callout">
                <p>Any contract for services is made directly between the user and the business. BarkBuddy is not a party to that agreement and accepts no liability for service quality, disputes, or outcomes.</p>
              </div>
            </div>
          </section>

          {/* 05 */}
          <section id="bookings" className="policy-section">
            <p className="policy-section__number">05</p>
            <h2 className="policy-section__title">Bookings &amp; Payments</h2>
            <div className="policy-section__body">
              <p>Where BarkBuddy facilitates contact between users and businesses, the following applies:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span>Pricing, availability, and booking terms are set by individual businesses, not BarkBuddy</span></li>
                <li className="policy-list__item"><span>Users should confirm all details - including pricing, cancellation policies, and care standards - directly with the business before proceeding</span></li>
                <li className="policy-list__item"><span>Any payments made directly to a business are between the user and that business</span></li>
                <li className="policy-list__item"><span>BarkBuddy is not responsible for refunds, cancellations, or disputes arising from bookings made through or facilitated by the Platform</span></li>
              </ul>
              <div className="policy-section__callout">
                <p>If you have a dispute with a business, please contact them in the first instance. If you believe a listing is fraudulent or misleading, please report it to us at <strong>paws@barkbuddy.org.uk</strong>.</p>
              </div>
            </div>
          </section>

          {/* 06 */}
          <section id="conduct" className="policy-section">
            <p className="policy-section__number">06</p>
            <h2 className="policy-section__title">User Conduct</h2>
            <div className="policy-section__body">
              <p>You agree to use BarkBuddy lawfully and respectfully at all times. You must not:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span>Use the Platform for any unlawful purpose or in violation of any UK law or regulation</span></li>
                <li className="policy-list__item"><span>Attempt to gain unauthorised access to any part of the Platform or its underlying systems</span></li>
                <li className="policy-list__item"><span>Submit false, misleading, or fraudulent reviews, listings, or information</span></li>
                <li className="policy-list__item"><span>Harass, threaten, or abuse other users or businesses</span></li>
                <li className="policy-list__item"><span>Use automated tools to scrape, crawl, or collect data from the Platform without our consent</span></li>
                <li className="policy-list__item"><span>Impersonate any person, business, or organisation</span></li>
                <li className="policy-list__item"><span>Post spam, unsolicited advertising, or promotional content outside of designated areas</span></li>
                <li className="policy-list__item"><span>Engage in any activity that could damage, disable, or impair the operation of the Platform</span></li>
              </ul>
              <p>Breach of these conduct rules may result in immediate suspension or termination of your account.</p>
            </div>
          </section>

          {/* 07 */}
          <section id="content" className="policy-section">
            <p className="policy-section__number">07</p>
            <h2 className="policy-section__title">User Content &amp; Licence</h2>
            <div className="policy-section__body">
              <p>When you submit content to BarkBuddy, you confirm that:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span>You own the content or have the right to share it</span></li>
                <li className="policy-list__item"><span>The content does not infringe any third-party intellectual property, privacy, or other rights</span></li>
                <li className="policy-list__item"><span>The content complies with these Terms and our Forum &amp; Community Policy</span></li>
              </ul>
              <p>By submitting content, you grant BarkBuddy a <strong>non-exclusive, royalty-free, worldwide, sublicensable licence</strong> to use, reproduce, display, distribute, and adapt that content for the purpose of operating and promoting the Platform.</p>
              <p>BarkBuddy does not claim ownership of your content. You may delete your content at any time, subject to any legal or operational retention obligations.</p>
            </div>
          </section>

          {/* 08 */}
          <section id="vet" className="policy-section">
            <p className="policy-section__number">08</p>
            <h2 className="policy-section__title">Veterinary Disclaimer</h2>
            <div className="policy-section__body">
              <div className="policy-section__callout">
                <p>BarkBuddy does <strong>not</strong> provide veterinary, medical, or professional animal care advice. Nothing on the Platform constitutes professional veterinary advice.</p>
              </div>
              <p>Always consult a qualified veterinary surgeon registered with the <strong>Royal College of Veterinary Surgeons (RCVS)</strong> for any health, medical, or welfare concerns relating to your dog.</p>
              <p>BarkBuddy accepts no liability for any harm, loss, or injury to any animal arising from reliance on content found on the Platform.</p>
            </div>
          </section>

          {/* 09 */}
          <section id="ip" className="policy-section">
            <p className="policy-section__number">09</p>
            <h2 className="policy-section__title">Intellectual Property</h2>
            <div className="policy-section__body">
              <p>All content, design, code, trademarks, logos, and materials on BarkBuddy that are not user-generated are the intellectual property of <strong>BarkBuddy Ltd</strong> or our licensors.</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span>You may not copy, reproduce, distribute, or create derivative works from BarkBuddy's proprietary content without our prior written consent</span></li>
                <li className="policy-list__item"><span>The BarkBuddy name, logo, and brand identity are our registered or unregistered trademarks and may not be used without permission</span></li>
                <li className="policy-list__item"><span>Any feedback or suggestions you provide to us may be used freely by BarkBuddy without obligation to you</span></li>
              </ul>
            </div>
          </section>

          {/* 10 */}
          <section id="privacy" className="policy-section">
            <p className="policy-section__number">10</p>
            <h2 className="policy-section__title">Privacy &amp; Data Protection</h2>
            <div className="policy-section__body">
              <p>We take your privacy seriously. The personal data you provide when using BarkBuddy is processed in accordance with the <strong>Data Protection Act 2018</strong> and the <strong>UK General Data Protection Regulation (UK GDPR)</strong>.</p>
              <p>Our <Link to="/privacy-policy" style={{ color: '#927ACF', fontWeight: 700 }}>Privacy Policy</Link> explains in full what data we collect, how we use it, how long we retain it, and your rights as a data subject.</p>
              <p>By using BarkBuddy, you acknowledge that you have read and understood our Privacy Policy.</p>
            </div>
          </section>

          {/* 11 */}
          <section id="liability" className="policy-section">
            <p className="policy-section__number">11</p>
            <h2 className="policy-section__title">Limitation of Liability</h2>
            <div className="policy-section__body">
              <p>To the fullest extent permitted by UK law, BarkBuddy Ltd shall not be liable for:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span>Any indirect, incidental, special, or consequential loss arising from your use of the Platform</span></li>
                <li className="policy-list__item"><span>Loss of data, revenue, goodwill, or profits, whether or not foreseeable</span></li>
                <li className="policy-list__item"><span>The acts, omissions, or negligence of any business listed on the Platform</span></li>
                <li className="policy-list__item"><span>Any harm, injury, or loss to you or your dog arising from services booked or found through BarkBuddy</span></li>
                <li className="policy-list__item"><span>Temporary unavailability of the Platform due to maintenance, technical issues, or events outside our control</span></li>
              </ul>
              <div className="policy-section__callout">
                <p>Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded under UK law.</p>
              </div>
              <p>Where liability cannot be fully excluded, our total liability to you for any claim shall not exceed the amount you paid to us (if any) in the 12 months preceding the claim.</p>
            </div>
          </section>

          {/* 12 */}
          <section id="termination" className="policy-section">
            <p className="policy-section__number">12</p>
            <h2 className="policy-section__title">Termination</h2>
            <div className="policy-section__body">
              <p>You may close your BarkBuddy account at any time by contacting us or using the account settings within the Platform.</p>
              <p>We reserve the right to suspend or terminate your account without notice if:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span>You breach these Terms or any of our policies</span></li>
                <li className="policy-list__item"><span>We reasonably suspect fraudulent, abusive, or unlawful activity</span></li>
                <li className="policy-list__item"><span>We are required to do so by law or a regulatory authority</span></li>
              </ul>
              <p>Upon termination, your right to access the Platform ceases immediately.</p>
            </div>
          </section>

          {/* 13 */}
          <section id="law" className="policy-section">
            <p className="policy-section__number">13</p>
            <h2 className="policy-section__title">Governing Law</h2>
            <div className="policy-section__body">
              <p>These Terms are governed by and construed in accordance with the laws of <strong>England and Wales</strong>. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
              <p>If you are a consumer, you may also have the right to bring proceedings in the courts of the country where you are domiciled, in accordance with applicable consumer protection law.</p>
            </div>
          </section>

          {/* 14 */}
          <section id="changes" className="policy-section">
            <p className="policy-section__number">14</p>
            <h2 className="policy-section__title">Changes to These Terms</h2>
            <div className="policy-section__body">
              <p>We may update these Terms from time to time. When we make material changes, we will notify you by email or via a prominent notice on the Platform.</p>
              <p>Your continued use of BarkBuddy after the effective date of any updated Terms constitutes your acceptance of those changes. If you do not agree to the updated Terms, you must stop using the Platform and may close your account.</p>
            </div>
          </section>

          {/* 15 */}
          <section id="contact" className="policy-section">
            <p className="policy-section__number">15</p>
            <h2 className="policy-section__title">Contact Us</h2>
            <div className="policy-section__body">
              <p>If you have any questions, concerns, or complaints regarding these Terms or your use of BarkBuddy, please get in touch with us:</p>
              <div className="policy-contact">
                <div className="policy-contact__row">
                  <i className="bi bi-building" />
                  <span><strong>BarkBuddy</strong></span>
                </div>
                <div className="policy-contact__row">
                  <i className="bi bi-geo-alt" />
                  <span>London, United Kingdom</span>
                </div>
                <div className="policy-contact__row">
                  <i className="bi bi-envelope" />
                  <span><a href="mailto:paws@barkbuddy.org.uk">paws@barkbuddy.org.uk</a></span>
                </div>
                <div className="policy-contact__row">
                  <i className="bi bi-globe" />
                  <span><a href="https://www.barkbuddy.org.uk" target="_blank" rel="noopener noreferrer">www.barkbuddy.org.uk</a></span>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;