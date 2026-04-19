import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ForumPolicy.scss';
import Footer from "../Footer";
import {
  ShieldCheck, Calendar, RefreshCw, ArrowLeft,
  Building2, MapPin, Mail, Globe, Phone,
} from 'lucide-react';

interface Section {
  id: string;
  number: string;
  title: string;
}

const SECTIONS: Section[] = [
  { id: 'intro',        number: '01', title: 'Who We Are' },
  { id: 'collect',      number: '02', title: 'Data We Collect' },
  { id: 'how',          number: '03', title: 'How We Collect Your Data' },
  { id: 'use',          number: '04', title: 'How We Use Your Data' },
  { id: 'lawful',       number: '05', title: 'Lawful Basis for Processing' },
  { id: 'sharing',      number: '06', title: 'Sharing Your Data' },
  { id: 'retention',    number: '07', title: 'How Long We Keep Your Data' },
  { id: 'cookies',      number: '08', title: 'Cookies & Tracking' },
  { id: 'rights',       number: '09', title: 'Your Rights' },
  { id: 'children',     number: '10', title: 'Children\'s Privacy' },
  { id: 'transfers',    number: '11', title: 'International Transfers' },
  { id: 'security',     number: '12', title: 'Security' },
  { id: 'changes',      number: '13', title: 'Changes to This Policy' },
  { id: 'contact',      number: '14', title: 'Contact & Complaints' },
];

const PrivacyPolicy: React.FC = () => {
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
            Privacy<em> Policy</em>
          </h1>
          <div className="policy-hero__meta">
            <span className="policy-hero__badge">
              <ShieldCheck size={13} />
              UK GDPR Compliant
            </span>
            <span className="policy-hero__badge">
              <Calendar size={13} />
              Effective: January 2026
            </span>
            <span className="policy-hero__badge">
              <RefreshCw size={13} />
              Last Updated: March 2026
            </span>
          </div>
        </div>
      </section>

      {/* Date bar */}
      <div className="policy-date-bar">
        <p>Your privacy matters to us. This policy explains exactly what data we collect, why, and how you can control it.</p>
        <Link to="/" className="policy-date-bar__back">
          <ArrowLeft size={14} /> Back to Homepage
        </Link>
      </div>

      {/* Layout */}
      <div className="policy-layout">

        {/* Sidebar nav */}
        <nav className="policy-nav" aria-label="Privacy policy sections">
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

          <section id="intro" className="policy-section">
            <p className="policy-section__number">01</p>
            <h2 className="policy-section__title">Who We Are</h2>
            <div className="policy-section__body">
              <p>This Privacy Policy is issued by <strong>BarkBuddy Ltd</strong> ("BarkBuddy", "we", "us", "our"), a company registered in England and Wales. We operate the BarkBuddy platform - including our website, mobile application, service finder, community forum, and travel tools (together, the "Platform").</p>
              <p>BarkBuddy Ltd is the <strong>data controller</strong> for the personal data processed through the Platform. This means we determine the purposes and means by which your personal data is processed.</p>
              <div className="policy-section__callout">
                <p>This policy applies to all users of the Platform, including dog owners, registered members, business owners, and visitors. It is written in plain English and complies with the <strong>UK General Data Protection Regulation (UK GDPR)</strong> and the <strong>Data Protection Act 2018</strong>.</p>
              </div>
            </div>
          </section>

          <section id="collect" className="policy-section">
            <p className="policy-section__number">02</p>
            <h2 className="policy-section__title">Data We Collect</h2>
            <div className="policy-section__body">
              <p>We collect different categories of personal data depending on how you use BarkBuddy. Here is a clear breakdown:</p>
              <div className="policy-subsection">
                <p className="policy-subsection__title">Account & Profile Data</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Your name, email address, and password (stored securely, hashed)</span></li>
                  <li className="policy-list__item"><span>Profile photo, bio, and location (city or postcode area)</span></li>
                  <li className="policy-list__item"><span>Dog profiles: name, breed, age, weight, and health notes you choose to add</span></li>
                  <li className="policy-list__item"><span>Preferences and notification settings</span></li>
                </ul>
              </div>
              <div className="policy-subsection">
                <p className="policy-subsection__title">Usage & Activity Data</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Pages visited, searches performed, and listings viewed</span></li>
                  <li className="policy-list__item"><span>Forum posts, comments, and reactions</span></li>
                  <li className="policy-list__item"><span>Check-ins, buddy connections, and dashboard activity</span></li>
                  <li className="policy-list__item"><span>Travel documents generated through the Platform</span></li>
                </ul>
              </div>
              <div className="policy-subsection">
                <p className="policy-subsection__title">Location Data</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Postcode or city you enter manually when searching for services</span></li>
                  <li className="policy-list__item"><span>GPS location, only if you explicitly grant permission via your browser or device</span></li>
                  <li className="policy-list__item"><span>We do not track your location in the background at any time</span></li>
                </ul>
              </div>
              <div className="policy-subsection">
                <p className="policy-subsection__title">Business Owner Data</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Business name, address, contact details, and registration documents</span></li>
                  <li className="policy-list__item"><span>Photos, service descriptions, and pricing information submitted for listings</span></li>
                  <li className="policy-list__item"><span>Correspondence with BarkBuddy relating to your listing</span></li>
                </ul>
              </div>
              <div className="policy-subsection">
                <p className="policy-subsection__title">Technical Data</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>IP address, browser type, device type, and operating system</span></li>
                  <li className="policy-list__item"><span>Cookies and similar tracking technologies (see Section 08)</span></li>
                  <li className="policy-list__item"><span>Log data including timestamps and error reports</span></li>
                </ul>
              </div>
            </div>
          </section>

          <section id="how" className="policy-section">
            <p className="policy-section__number">03</p>
            <h2 className="policy-section__title">How We Collect Your Data</h2>
            <div className="policy-section__body">
              <p>We collect your personal data through the following means:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span><strong>Directly from you</strong> - when you register an account, complete your profile, submit a listing, post in the forum, or contact us</span></li>
                <li className="policy-list__item"><span><strong>Automatically</strong> - through cookies, log files, and analytics tools as you browse and use the Platform</span></li>
                <li className="policy-list__item"><span><strong>From your device</strong> - location data, only when you explicitly grant permission</span></li>
                <li className="policy-list__item"><span><strong>From third parties</strong> - such as Google Maps (for location search) or authentication providers if you use social login in future</span></li>
              </ul>
              <p>We will always be transparent with you about the data we collect and why.</p>
            </div>
          </section>

          <section id="use" className="policy-section">
            <p className="policy-section__number">04</p>
            <h2 className="policy-section__title">How We Use Your Data</h2>
            <div className="policy-section__body">
              <p>We use your personal data only for the purposes set out below. We do not sell your data to third parties.</p>
              <div className="policy-subsection">
                <p className="policy-subsection__title">To Operate the Platform</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Create and manage your account and dog profiles</span></li>
                  <li className="policy-list__item"><span>Display relevant service and activity listings based on your location</span></li>
                  <li className="policy-list__item"><span>Enable community forum participation and buddy connections</span></li>
                  <li className="policy-list__item"><span>Generate and store travel documents on your behalf</span></li>
                </ul>
              </div>
              <div className="policy-subsection">
                <p className="policy-subsection__title">To Improve BarkBuddy</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Analyse usage patterns to improve features and fix issues</span></li>
                  <li className="policy-list__item"><span>Conduct internal research and development</span></li>
                  <li className="policy-list__item"><span>Monitor Platform performance and security</span></li>
                </ul>
              </div>
              <div className="policy-subsection">
                <p className="policy-subsection__title">To Communicate With You</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Send account-related notifications (e.g. registration confirmation, password resets)</span></li>
                  <li className="policy-list__item"><span>Notify you of updates to our policies or Terms</span></li>
                  <li className="policy-list__item"><span>Send marketing emails, only where you have opted in - you can unsubscribe at any time</span></li>
                  <li className="policy-list__item"><span>Respond to enquiries or support requests</span></li>
                </ul>
              </div>
              <div className="policy-subsection">
                <p className="policy-subsection__title">To Comply With Legal Obligations</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Retain records as required by UK law</span></li>
                  <li className="policy-list__item"><span>Respond to lawful requests from law enforcement or regulatory authorities</span></li>
                  <li className="policy-list__item"><span>Enforce our Terms of Service and policies</span></li>
                </ul>
              </div>
            </div>
          </section>

          <section id="lawful" className="policy-section">
            <p className="policy-section__number">05</p>
            <h2 className="policy-section__title">Lawful Basis for Processing</h2>
            <div className="policy-section__body">
              <p>Under UK GDPR, we must have a lawful basis for processing your personal data. We rely on the following bases:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span><strong>Contract</strong> - processing necessary to provide the services you have signed up for</span></li>
                <li className="policy-list__item"><span><strong>Legitimate Interests</strong> - to improve the Platform, prevent fraud, ensure security, and conduct analytics</span></li>
                <li className="policy-list__item"><span><strong>Consent</strong> - for marketing communications and non-essential cookies; you may withdraw consent at any time</span></li>
                <li className="policy-list__item"><span><strong>Legal Obligation</strong> - where processing is necessary to comply with UK law</span></li>
              </ul>
              <div className="policy-section__callout">
                <p>Where we rely on consent, you have the right to withdraw it at any time without affecting the lawfulness of processing carried out before withdrawal.</p>
              </div>
            </div>
          </section>

          <section id="sharing" className="policy-section">
            <p className="policy-section__number">06</p>
            <h2 className="policy-section__title">Sharing Your Data</h2>
            <div className="policy-section__body">
              <p>We do not sell, rent, or trade your personal data. We may share it in the following limited circumstances:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span><strong>Service Providers</strong> - trusted third-party providers who assist us in operating the Platform</span></li>
                <li className="policy-list__item"><span><strong>Google Maps</strong> - we use the Google Maps API to enable location-based search</span></li>
                <li className="policy-list__item"><span><strong>Legal Authorities</strong> - where required by law, court order, or to protect rights and safety</span></li>
                <li className="policy-list__item"><span><strong>Business Transfers</strong> - in the event of a merger, acquisition, or sale of assets</span></li>
              </ul>
            </div>
          </section>

          <section id="retention" className="policy-section">
            <p className="policy-section__number">07</p>
            <h2 className="policy-section__title">How Long We Keep Your Data</h2>
            <div className="policy-section__body">
              <ul className="policy-list">
                <li className="policy-list__item"><span><strong>Account data</strong> - retained for the duration of your account, plus up to 2 years after closure</span></li>
                <li className="policy-list__item"><span><strong>Forum posts and user content</strong> - retained while your account is active</span></li>
                <li className="policy-list__item"><span><strong>Business listing data</strong> - retained while active, plus 12 months after removal</span></li>
                <li className="policy-list__item"><span><strong>Technical and log data</strong> - typically retained for up to 12 months</span></li>
                <li className="policy-list__item"><span><strong>Marketing consent records</strong> - retained for 3 years from consent or last interaction</span></li>
              </ul>
            </div>
          </section>

          <section id="cookies" className="policy-section">
            <p className="policy-section__number">08</p>
            <h2 className="policy-section__title">Cookies &amp; Tracking</h2>
            <div className="policy-section__body">
              <p>BarkBuddy uses cookies and similar technologies to make the Platform work effectively and to understand how it is used.</p>
              <div className="policy-subsection">
                <p className="policy-subsection__title">Essential Cookies</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Required for the Platform to function - including keeping you logged in and remembering your session</span></li>
                  <li className="policy-list__item"><span>These cannot be disabled without affecting Platform functionality</span></li>
                </ul>
              </div>
              <div className="policy-subsection">
                <p className="policy-subsection__title">Analytics Cookies</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Help us understand how users interact with the Platform so we can improve it</span></li>
                  <li className="policy-list__item"><span>Only set with your consent</span></li>
                </ul>
              </div>
              <div className="policy-subsection">
                <p className="policy-subsection__title">Preference Cookies</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Remember your settings and preferences across sessions</span></li>
                  <li className="policy-list__item"><span>Only set with your consent</span></li>
                </ul>
              </div>
            </div>
          </section>

          <section id="rights" className="policy-section">
            <p className="policy-section__number">09</p>
            <h2 className="policy-section__title">Your Rights</h2>
            <div className="policy-section__body">
              <p>Under UK GDPR, you have the following rights. Contact us at <strong>paws@barkbuddy.org.uk</strong> to exercise them:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span><strong>Right of Access</strong> - request a copy of the personal data we hold about you</span></li>
                <li className="policy-list__item"><span><strong>Right to Rectification</strong> - ask us to correct inaccurate or incomplete data</span></li>
                <li className="policy-list__item"><span><strong>Right to Erasure</strong> - request deletion of your data</span></li>
                <li className="policy-list__item"><span><strong>Right to Restrict Processing</strong> - ask us to pause processing in certain circumstances</span></li>
                <li className="policy-list__item"><span><strong>Right to Data Portability</strong> - receive your data in a structured, commonly used format</span></li>
                <li className="policy-list__item"><span><strong>Right to Object</strong> - object to processing based on legitimate interests or for direct marketing</span></li>
                <li className="policy-list__item"><span><strong>Right to Withdraw Consent</strong> - withdraw consent at any time without affecting prior processing</span></li>
              </ul>
              <div className="policy-section__callout">
                <p>We will respond to all valid requests within <strong>one calendar month</strong>.</p>
              </div>
            </div>
          </section>

          <section id="children" className="policy-section">
            <p className="policy-section__number">10</p>
            <h2 className="policy-section__title">Children's Privacy</h2>
            <div className="policy-section__body">
              <p>BarkBuddy is intended for users who are <strong>18 years of age or older</strong>. We do not knowingly collect personal data from anyone under 18. Contact us at <strong>paws@barkbuddy.org.uk</strong> if you believe a child has provided data without parental consent.</p>
            </div>
          </section>

          <section id="transfers" className="policy-section">
            <p className="policy-section__number">11</p>
            <h2 className="policy-section__title">International Transfers</h2>
            <div className="policy-section__body">
              <p>We aim to store and process your data within the UK and EEA. Where third-party providers process data outside the UK or EEA, we ensure appropriate safeguards including Standard Contractual Clauses approved by the ICO.</p>
            </div>
          </section>

          <section id="security" className="policy-section">
            <p className="policy-section__number">12</p>
            <h2 className="policy-section__title">Security</h2>
            <div className="policy-section__body">
              <ul className="policy-list">
                <li className="policy-list__item"><span>Encryption of data in transit using HTTPS/TLS</span></li>
                <li className="policy-list__item"><span>Secure, hashed storage of passwords</span></li>
                <li className="policy-list__item"><span>Access controls limiting who can access personal data</span></li>
                <li className="policy-list__item"><span>Regular security reviews and infrastructure updates</span></li>
              </ul>
              <div className="policy-section__callout--warning policy-section__callout">
                <p>No method of transmission over the internet is completely secure. If you suspect unauthorised access to your account, please contact us immediately.</p>
              </div>
            </div>
          </section>

          <section id="changes" className="policy-section">
            <p className="policy-section__number">13</p>
            <h2 className="policy-section__title">Changes to This Policy</h2>
            <div className="policy-section__body">
              <p>We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or via a prominent notice on the Platform. Your continued use of BarkBuddy after any changes constitutes acceptance.</p>
            </div>
          </section>

          <section id="contact" className="policy-section">
            <p className="policy-section__number">14</p>
            <h2 className="policy-section__title">Contact &amp; Complaints</h2>
            <div className="policy-section__body">
              <p>If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us:</p>
              <div className="policy-contact">
                <div className="policy-contact__row"><Building2 size={15} /><span><strong>BarkBuddy</strong></span></div>
                <div className="policy-contact__row"><MapPin size={15} /><span>London, United Kingdom</span></div>
                <div className="policy-contact__row"><Mail size={15} /><span><a href="mailto:paws@barkbuddy.org.uk">paws@barkbuddy.org.uk</a></span></div>
              </div>
              <p>If you are unhappy with how we have handled your personal data, you have the right to lodge a complaint with the <strong>Information Commissioner's Office (ICO)</strong>:</p>
              <div className="policy-contact">
                <div className="policy-contact__row"><ShieldCheck size={15} /><span><strong>Information Commissioner's Office (ICO)</strong></span></div>
                <div className="policy-contact__row"><Globe size={15} /><span><a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer">www.ico.org.uk</a></span></div>
                <div className="policy-contact__row"><Phone size={15} /><span>0303 123 1113</span></div>
              </div>
            </div>
          </section>

        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;