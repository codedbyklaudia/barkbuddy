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
              <i className="bi bi-shield-lock" />
              UK GDPR Compliant
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
        <p>Your privacy matters to us. This policy explains exactly what data we collect, why, and how you can control it.</p>
        <Link to="/" className="policy-date-bar__back">
          <i className="bi bi-arrow-left" /> Back to Homepage
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

          {/* 01 */}
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

          {/* 02 */}
          <section id="collect" className="policy-section">
            <p className="policy-section__number">02</p>
            <h2 className="policy-section__title">Data We Collect</h2>
            <div className="policy-section__body">
              <p>We collect different categories of personal data depending on how you use BarkBuddy. Here is a clear breakdown:</p>

              <div className="policy-subsection">
                <p className="policy-subsection__title">Account & Profile Data</p>
                <ul className="policy-list">
                  <li className="policy-list__item">Your name, email address, and password (stored securely, hashed)</li>
                  <li className="policy-list__item">Profile photo, bio, and location (city or postcode area)</li>
                  <li className="policy-list__item">Dog profiles: name, breed, age, weight, and health notes you choose to add</li>
                  <li className="policy-list__item">Preferences and notification settings</li>
                </ul>
              </div>

              <div className="policy-subsection">
                <p className="policy-subsection__title">Usage & Activity Data</p>
                <ul className="policy-list">
                  <li className="policy-list__item">Pages visited, searches performed, and listings viewed</li>
                  <li className="policy-list__item">Forum posts, comments, and reactions</li>
                  <li className="policy-list__item">Check-ins, buddy connections, and dashboard activity</li>
                  <li className="policy-list__item">Travel documents generated through the Platform</li>
                </ul>
              </div>

              <div className="policy-subsection">
                <p className="policy-subsection__title">Location Data</p>
                <ul className="policy-list">
                  <li className="policy-list__item">Postcode or city you enter manually when searching for services</li>
                  <li className="policy-list__item">GPS location, only if you explicitly grant permission via your browser or device</li>
                  <li className="policy-list__item">We do not track your location in the background at any time</li>
                </ul>
              </div>

              <div className="policy-subsection">
                <p className="policy-subsection__title">Business Owner Data</p>
                <ul className="policy-list">
                  <li className="policy-list__item">Business name, address, contact details, and registration documents</li>
                  <li className="policy-list__item">Photos, service descriptions, and pricing information submitted for listings</li>
                  <li className="policy-list__item">Correspondence with BarkBuddy relating to your listing</li>
                </ul>
              </div>

              <div className="policy-subsection">
                <p className="policy-subsection__title">Technical Data</p>
                <ul className="policy-list">
                  <li className="policy-list__item">IP address, browser type, device type, and operating system</li>
                  <li className="policy-list__item">Cookies and similar tracking technologies (see Section 08)</li>
                  <li className="policy-list__item">Log data including timestamps and error reports</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 03 */}
          <section id="how" className="policy-section">
            <p className="policy-section__number">03</p>
            <h2 className="policy-section__title">How We Collect Your Data</h2>
            <div className="policy-section__body">
              <p>We collect your personal data through the following means:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><strong>Directly from you</strong> - when you register an account, complete your profile, submit a listing, post in the forum, or contact us</li>
                <li className="policy-list__item"><strong>Automatically</strong> - through cookies, log files, and analytics tools as you browse and use the Platform</li>
                <li className="policy-list__item"><strong>From your device</strong> - location data, only when you explicitly grant permission</li>
                <li className="policy-list__item"><strong>From third parties</strong> - such as Google Maps (for location search) or authentication providers if you use social login in future</li>
              </ul>
              <p>We will always be transparent with you about the data we collect and why.</p>
            </div>
          </section>

          {/* 04 */}
          <section id="use" className="policy-section">
            <p className="policy-section__number">04</p>
            <h2 className="policy-section__title">How We Use Your Data</h2>
            <div className="policy-section__body">
              <p>We use your personal data only for the purposes set out below. We do not sell your data to third parties.</p>

              <div className="policy-subsection">
                <p className="policy-subsection__title">To Operate the Platform</p>
                <ul className="policy-list">
                  <li className="policy-list__item">Create and manage your account and dog profiles</li>
                  <li className="policy-list__item">Display relevant service and activity listings based on your location</li>
                  <li className="policy-list__item">Enable community forum participation and buddy connections</li>
                  <li className="policy-list__item">Generate and store travel documents on your behalf</li>
                </ul>
              </div>

              <div className="policy-subsection">
                <p className="policy-subsection__title">To Improve BarkBuddy</p>
                <ul className="policy-list">
                  <li className="policy-list__item">Analyse usage patterns to improve features and fix issues</li>
                  <li className="policy-list__item">Conduct internal research and development</li>
                  <li className="policy-list__item">Monitor Platform performance and security</li>
                </ul>
              </div>

              <div className="policy-subsection">
                <p className="policy-subsection__title">To Communicate With You</p>
                <ul className="policy-list">
                  <li className="policy-list__item">Send account-related notifications (e.g. registration confirmation, password resets)</li>
                  <li className="policy-list__item">Notify you of updates to our policies or Terms</li>
                  <li className="policy-list__item">Send marketing emails, only where you have opted in - you can unsubscribe at any time</li>
                  <li className="policy-list__item">Respond to enquiries or support requests</li>
                </ul>
              </div>

              <div className="policy-subsection">
                <p className="policy-subsection__title">To Comply With Legal Obligations</p>
                <ul className="policy-list">
                  <li className="policy-list__item">Retain records as required by UK law</li>
                  <li className="policy-list__item">Respond to lawful requests from law enforcement or regulatory authorities</li>
                  <li className="policy-list__item">Enforce our Terms of Service and policies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 05 */}
          <section id="lawful" className="policy-section">
            <p className="policy-section__number">05</p>
            <h2 className="policy-section__title">Lawful Basis for Processing</h2>
            <div className="policy-section__body">
              <p>Under UK GDPR, we must have a lawful basis for processing your personal data. We rely on the following bases:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><strong>Contract</strong> - processing necessary to provide the services you have signed up for, including account management and platform functionality</li>
                <li className="policy-list__item"><strong>Legitimate Interests</strong> - to improve the Platform, prevent fraud, ensure security, and conduct analytics, where our interests do not override your rights</li>
                <li className="policy-list__item"><strong>Consent</strong> - for marketing communications and non-essential cookies; you may withdraw consent at any time</li>
                <li className="policy-list__item"><strong>Legal Obligation</strong> - where processing is necessary to comply with UK law</li>
              </ul>
              <div className="policy-section__callout">
                <p>Where we rely on consent, you have the right to withdraw it at any time without affecting the lawfulness of processing carried out before withdrawal.</p>
              </div>
            </div>
          </section>

          {/* 06 */}
          <section id="sharing" className="policy-section">
            <p className="policy-section__number">06</p>
            <h2 className="policy-section__title">Sharing Your Data</h2>
            <div className="policy-section__body">
              <p>We do not sell, rent, or trade your personal data. We may share it in the following limited circumstances:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><strong>Service Providers</strong> - trusted third-party providers who assist us in operating the Platform (e.g. cloud hosting, email delivery, analytics). These providers are bound by data processing agreements and may only use your data as instructed by us</li>
                <li className="policy-list__item"><strong>Google Maps</strong> - we use the Google Maps API to enable location-based search. Your location data may be shared with Google when you use this feature, subject to Google's own Privacy Policy</li>
                <li className="policy-list__item"><strong>Legal Authorities</strong> - where required by law, court order, or to protect the rights, safety, or property of BarkBuddy, our users, or others</li>
                <li className="policy-list__item"><strong>Business Transfers</strong> - in the event of a merger, acquisition, or sale of assets, your data may be transferred to the successor entity, subject to equivalent privacy protections</li>
              </ul>
              <p>Any business listings you submit, and reviews you post, will be publicly visible to other users. Please only share information you are comfortable with being public.</p>
            </div>
          </section>

          {/* 07 */}
          <section id="retention" className="policy-section">
            <p className="policy-section__number">07</p>
            <h2 className="policy-section__title">How Long We Keep Your Data</h2>
            <div className="policy-section__body">
              <p>We retain your personal data only for as long as necessary for the purposes it was collected, or as required by law. Our general retention periods are:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><strong>Account data</strong> - retained for the duration of your account, plus up to 2 years after closure for legal and operational purposes</li>
                <li className="policy-list__item"><strong>Forum posts and user content</strong> - retained while your account is active; you may request deletion at any time</li>
                <li className="policy-list__item"><strong>Business listing data</strong> - retained while the listing is active, plus 12 months after removal</li>
                <li className="policy-list__item"><strong>Technical and log data</strong> - typically retained for up to 12 months</li>
                <li className="policy-list__item"><strong>Marketing consent records</strong> - retained for 3 years from the date of consent or last interaction</li>
              </ul>
              <p>When data is no longer required, it is securely deleted or anonymised.</p>
            </div>
          </section>

          {/* 08 */}
          <section id="cookies" className="policy-section">
            <p className="policy-section__number">08</p>
            <h2 className="policy-section__title">Cookies &amp; Tracking</h2>
            <div className="policy-section__body">
              <p>BarkBuddy uses cookies and similar technologies to make the Platform work effectively and to understand how it is used. We use the following types of cookies:</p>

              <div className="policy-subsection">
                <p className="policy-subsection__title">Essential Cookies</p>
                <ul className="policy-list">
                  <li className="policy-list__item">Required for the Platform to function - including keeping you logged in and remembering your session</li>
                  <li className="policy-list__item">These cannot be disabled without affecting Platform functionality</li>
                </ul>
              </div>

              <div className="policy-subsection">
                <p className="policy-subsection__title">Analytics Cookies</p>
                <ul className="policy-list">
                  <li className="policy-list__item">Help us understand how users interact with the Platform so we can improve it</li>
                  <li className="policy-list__item">We may use tools such as Google Analytics; data collected is aggregated and anonymised where possible</li>
                  <li className="policy-list__item">Only set with your consent</li>
                </ul>
              </div>

              <div className="policy-subsection">
                <p className="policy-subsection__title">Preference Cookies</p>
                <ul className="policy-list">
                  <li className="policy-list__item">Remember your settings and preferences across sessions (e.g. location, display preferences)</li>
                  <li className="policy-list__item">Only set with your consent</li>
                </ul>
              </div>

              <p>You can manage your cookie preferences at any time via your browser settings or our cookie consent tool. Note that disabling certain cookies may affect your experience of the Platform.</p>
            </div>
          </section>

          {/* 09 */}
          <section id="rights" className="policy-section">
            <p className="policy-section__number">09</p>
            <h2 className="policy-section__title">Your Rights</h2>
            <div className="policy-section__body">
              <p>Under UK GDPR, you have the following rights in relation to your personal data. You may exercise any of these rights by contacting us at <strong>paws@barkbuddy.co.uk</strong>:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><strong>Right of Access</strong> - request a copy of the personal data we hold about you (a Subject Access Request)</li>
                <li className="policy-list__item"><strong>Right to Rectification</strong> - ask us to correct inaccurate or incomplete data</li>
                <li className="policy-list__item"><strong>Right to Erasure</strong> - request deletion of your data where it is no longer necessary, or where you withdraw consent</li>
                <li className="policy-list__item"><strong>Right to Restrict Processing</strong> - ask us to pause processing of your data in certain circumstances</li>
                <li className="policy-list__item"><strong>Right to Data Portability</strong> - receive your data in a structured, commonly used format and transfer it to another controller</li>
                <li className="policy-list__item"><strong>Right to Object</strong> - object to processing based on legitimate interests or for direct marketing purposes</li>
                <li className="policy-list__item"><strong>Right to Withdraw Consent</strong> - where processing is based on consent, withdraw it at any time without affecting prior processing</li>
              </ul>
              <div className="policy-section__callout">
                <p>We will respond to all valid requests within <strong>one calendar month</strong>. We may need to verify your identity before processing your request. There is no charge for exercising your rights in most circumstances.</p>
              </div>
            </div>
          </section>

          {/* 10 */}
          <section id="children" className="policy-section">
            <p className="policy-section__number">10</p>
            <h2 className="policy-section__title">Children's Privacy</h2>
            <div className="policy-section__body">
              <p>BarkBuddy is intended for users who are <strong>18 years of age or older</strong>. We do not knowingly collect personal data from anyone under the age of 18.</p>
              <p>If you believe a child has provided us with personal data without parental consent, please contact us immediately at <strong>paws@barkbuddy.co.uk</strong> and we will take steps to delete that data as soon as reasonably practicable.</p>
            </div>
          </section>

          {/* 11 */}
          <section id="transfers" className="policy-section">
            <p className="policy-section__number">11</p>
            <h2 className="policy-section__title">International Transfers</h2>
            <div className="policy-section__body">
              <p>BarkBuddy is based in the United Kingdom and we aim to store and process your data within the UK and European Economic Area (EEA) wherever possible.</p>
              <p>Some of our third-party service providers (such as cloud hosting or analytics providers) may process data outside the UK or EEA. Where this occurs, we ensure appropriate safeguards are in place, including:</p>
              <ul className="policy-list">
                <li className="policy-list__item">UK adequacy regulations recognising the destination country's data protection standards</li>
                <li className="policy-list__item">Standard Contractual Clauses (SCCs) approved by the UK Information Commissioner's Office (ICO)</li>
                <li className="policy-list__item">Other lawful transfer mechanisms as permitted under UK GDPR</li>
              </ul>
            </div>
          </section>

          {/* 12 */}
          <section id="security" className="policy-section">
            <p className="policy-section__number">12</p>
            <h2 className="policy-section__title">Security</h2>
            <div className="policy-section__body">
              <p>We take the security of your personal data seriously and implement appropriate technical and organisational measures to protect it from unauthorised access, loss, alteration, or disclosure. These include:</p>
              <ul className="policy-list">
                <li className="policy-list__item">Encryption of data in transit using HTTPS/TLS</li>
                <li className="policy-list__item">Secure, hashed storage of passwords - we never store your password in plain text</li>
                <li className="policy-list__item">Access controls limiting who within BarkBuddy can access personal data</li>
                <li className="policy-list__item">Regular security reviews and updates to our infrastructure</li>
              </ul>
              <div className="policy-section__callout--warning policy-section__callout">
                <p>No method of transmission over the internet is completely secure. While we take every reasonable precaution, we cannot guarantee absolute security. If you suspect unauthorised access to your account, please contact us immediately.</p>
              </div>
            </div>
          </section>

          {/* 13 */}
          <section id="changes" className="policy-section">
            <p className="policy-section__number">13</p>
            <h2 className="policy-section__title">Changes to This Policy</h2>
            <div className="policy-section__body">
              <p>We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email or via a prominent notice on the Platform, and update the "Last Updated" date at the top of this page.</p>
              <p>We encourage you to review this Policy periodically. Your continued use of BarkBuddy after any changes constitutes your acceptance of the updated Policy.</p>
            </div>
          </section>

          {/* 14 */}
          <section id="contact" className="policy-section">
            <p className="policy-section__number">14</p>
            <h2 className="policy-section__title">Contact &amp; Complaints</h2>
            <div className="policy-section__body">
              <p>If you have any questions about this Privacy Policy, wish to exercise your data rights, or have a concern about how we handle your personal data, please contact us:</p>
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
                  <span><a href="mailto:paws@barkbuddy.co.uk">paws@barkbuddy.co.uk</a></span>
                </div>
              </div>
              <p>If you are unhappy with how we have handled your personal data and we have been unable to resolve your concern, you have the right to lodge a complaint with the <strong>Information Commissioner's Office (ICO)</strong>, the UK's data protection supervisory authority:</p>
              <div className="policy-contact">
                <div className="policy-contact__row">
                  <i className="bi bi-shield-check" />
                  <span><strong>Information Commissioner's Office (ICO)</strong></span>
                </div>
                <div className="policy-contact__row">
                  <i className="bi bi-globe" />
                  <span><a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer">www.ico.org.uk</a></span>
                </div>
                <div className="policy-contact__row">
                  <i className="bi bi-telephone" />
                  <span>0303 123 1113</span>
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

export default PrivacyPolicy;