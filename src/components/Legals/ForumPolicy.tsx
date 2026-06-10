import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ForumPolicy.scss';
import Footer from "../Footer";
import {
  ShieldCheck, Calendar, RefreshCw, ArrowLeft, Mail, Flag,
  Building2, MapPin,
} from 'lucide-react';

interface Section {
  id: string;
  number: string;
  title: string;
}

const SECTIONS: Section[] = [
  { id: 'purpose',      number: '01',  title: 'Purpose of the Forum' },
  { id: 'legal',        number: '02',  title: 'Legal & Welfare Compliance' },
  { id: 'conduct',      number: '03',  title: 'Community Conduct Standards' },
  { id: 'vet',          number: '04',  title: 'Veterinary & Medical Disclaimer' },
  { id: 'prohibited',   number: '05',  title: 'Prohibited Content' },
  { id: 'ugc',          number: '06',  title: 'User-Generated Content' },
  { id: 'moderation',   number: '07',  title: 'Moderation & Enforcement' },
  { id: 'reporting',    number: '08',  title: 'Reporting Concerns' },
  { id: 'data',         number: '09',  title: 'Data Protection & Privacy' },
  { id: 'liability',    number: '10',  title: 'Limitation of Liability' },
  { id: 'amendments',   number: '11',  title: 'Amendments' },
  { id: 'contact',      number: '12',  title: 'Contact Information' },
];

const ForumPolicy: React.FC = () => {
  const [activeSection, setActiveSection] = useState('purpose');

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
            Forum &amp; Community<em> Policy</em>
          </h1>
          <div className="policy-hero__meta">
            <span className="policy-hero__badge">
              <ShieldCheck size={13} />
              UK Compliant
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
        <p>By using the BarkBuddy Forum you agree to this policy, our <strong>Terms of Service</strong>, and our <strong>Privacy Policy</strong>.</p>
        <Link to="/forum" className="policy-date-bar__back">
          <ArrowLeft size={14} /> Back to Homepage
        </Link>
      </div>

      {/* Layout */}
      <div className="policy-layout">

        {/* Sidebar nav */}
        <nav className="policy-nav" aria-label="Policy sections">
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

          {/* 1 */}
          <section id="purpose" className="policy-section">
            <p className="policy-section__number">01</p>
            <h2 className="policy-section__title">Purpose of the Forum</h2>
            <div className="policy-section__body">
              <p>The Forum exists to provide a safe and supportive space for dog owners and guardians in the United Kingdom. We want BarkBuddy to be a place where the community genuinely helps each other.</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span>Share experiences and advice with fellow dog owners</span></li>
                <li className="policy-list__item"><span>Discuss training, behaviour, nutrition, and wellbeing</span></li>
                <li className="policy-list__item"><span>Promote responsible and compassionate dog ownership</span></li>
                <li className="policy-list__item"><span>Build a respectful, inclusive community across the UK</span></li>
              </ul>
            </div>
          </section>

          {/* 2 */}
          <section id="legal" className="policy-section">
            <p className="policy-section__number">02</p>
            <h2 className="policy-section__title">Legal &amp; Welfare Compliance</h2>
            <div className="policy-section__body">
              <p>All users must comply with applicable UK law. Content that encourages or depicts illegal behaviour will be removed immediately. This includes, but is not limited to:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span>Content promoting animal cruelty or neglect contrary to the <strong>Animal Welfare Act 2006</strong></span></li>
                <li className="policy-list__item"><span>Harassment or threatening communications contrary to the <strong>Communications Act 2003</strong> or <strong>Malicious Communications Act 1988</strong></span></li>
                <li className="policy-list__item"><span>Defamatory statements contrary to the <strong>Defamation Act 2013</strong></span></li>
                <li className="policy-list__item"><span>Misuse of personal data contrary to the <strong>Data Protection Act 2018</strong> and <strong>UK GDPR</strong></span></li>
              </ul>
              <div className="policy-section__callout--warning policy-section__callout">
                <p>We reserve the right to report unlawful content to relevant authorities where appropriate.</p>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section id="conduct" className="policy-section">
            <p className="policy-section__number">03</p>
            <h2 className="policy-section__title">Community Conduct Standards</h2>
            <div className="policy-section__body">
              <p>By participating in the Forum, you agree to uphold the following standards at all times.</p>

              <div className="policy-subsection">
                <p className="policy-subsection__title">3.1 - Be Respectful</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>No bullying, harassment, hate speech, or discrimination</span></li>
                  <li className="policy-list__item"><span>No abusive, threatening, or inflammatory language</span></li>
                  <li className="policy-list__item"><span>No personal attacks or targeted hostility toward any member</span></li>
                </ul>
              </div>

              <div className="policy-subsection">
                <p className="policy-subsection__title">3.2 - Protect Animal Welfare</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Do not promote harmful, abusive, or unsafe training practices</span></li>
                  <li className="policy-list__item"><span>Do not encourage neglect or mistreatment of any animal</span></li>
                  <li className="policy-list__item"><span>Do not post graphic or disturbing material</span></li>
                </ul>
              </div>

              <div className="policy-subsection">
                <p className="policy-subsection__title">3.3 - No Misinformation or False Claims</p>
                <ul className="policy-list">
                  <li className="policy-list__item"><span>Do not knowingly share false, misleading, or deceptive information</span></li>
                  <li className="policy-list__item"><span>Do not impersonate veterinary professionals or qualified experts</span></li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4 */}
          <section id="vet" className="policy-section">
            <p className="policy-section__number">04</p>
            <h2 className="policy-section__title">Veterinary &amp; Medical Disclaimer</h2>
            <div className="policy-section__body">
              <div className="policy-section__callout">
                <p>The BarkBuddy Forum does <strong>not</strong> provide veterinary advice. Content shared by members is for general informational purposes only and does not constitute professional veterinary advice.</p>
              </div>
              <p>Forum content must not be relied upon for the diagnosis or treatment of any animal. Users should always consult a qualified veterinary surgeon registered with the <strong>Royal College of Veterinary Surgeons (RCVS)</strong> for any medical concerns.</p>
              <p>BarkBuddy accepts no liability for reliance on user-generated advice.</p>
            </div>
          </section>

          {/* 5 */}
          <section id="prohibited" className="policy-section">
            <p className="policy-section__number">05</p>
            <h2 className="policy-section__title">Prohibited Content</h2>
            <div className="policy-section__body">
              <p>The following content is strictly prohibited on the BarkBuddy Forum:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span>Illegal content of any kind</span></li>
                <li className="policy-list__item"><span>Defamatory statements about individuals, businesses, or organisations</span></li>
                <li className="policy-list__item"><span>Spam, unsolicited advertising, or commercial promotions</span></li>
                <li className="policy-list__item"><span>Copyrighted material posted without permission</span></li>
                <li className="policy-list__item"><span>Personal data of others without lawful basis or consent</span></li>
                <li className="policy-list__item"><span>Explicit, obscene, or violent content</span></li>
                <li className="policy-list__item"><span>Fraudulent, misleading, or scam-related content</span></li>
              </ul>
            </div>
          </section>

          {/* 6 */}
          <section id="ugc" className="policy-section">
            <p className="policy-section__number">06</p>
            <h2 className="policy-section__title">User-Generated Content &amp; Licence</h2>
            <div className="policy-section__body">
              <p>By posting content to the Forum, you confirm that you have the right to post it and you grant BarkBuddy a <strong>non-exclusive, royalty-free, worldwide licence</strong> to host, display, reproduce, and distribute the content within our services.</p>
              <p>You acknowledge that content may be publicly visible to other users and visitors. BarkBuddy does not endorse opinions expressed by users.</p>
            </div>
          </section>

          {/* 7 */}
          <section id="moderation" className="policy-section">
            <p className="policy-section__number">07</p>
            <h2 className="policy-section__title">Moderation &amp; Enforcement</h2>
            <div className="policy-section__body">
              <p>We reserve the right, at our sole discretion, to take any of the following actions:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span>Remove or edit any content that breaches this Policy</span></li>
                <li className="policy-list__item"><span>Suspend or permanently terminate user accounts</span></li>
                <li className="policy-list__item"><span>Restrict access to any part of the Forum</span></li>
                <li className="policy-list__item"><span>Report unlawful conduct to the relevant authorities</span></li>
              </ul>
              <div className="policy-section__callout">
                <p>We are not obliged to monitor all content but may do so. <strong>Moderation decisions are final.</strong></p>
              </div>
            </div>
          </section>

          {/* 8 */}
          <section id="reporting" className="policy-section">
            <p className="policy-section__number">08</p>
            <h2 className="policy-section__title">Reporting Concerns</h2>
            <div className="policy-section__body">
              <p>If you believe content breaches this Policy or UK law, please report it using the Forum reporting tool or contact us directly. We will review all reports in a timely and reasonable manner.</p>
              <div className="policy-contact">
                <div className="policy-contact__row">
                  <Mail size={15} />
                  <span>Email: <a href="mailto:paws@barkbuddy.org.uk">paws@barkbuddy.org.uk</a></span>
                </div>
                <div className="policy-contact__row">
                  <Flag size={15} />
                  <span>Use the <strong>Report</strong> button on any Forum post</span>
                </div>
              </div>
            </div>
          </section>

          {/* 9 */}
          <section id="data" className="policy-section">
            <p className="policy-section__number">09</p>
            <h2 className="policy-section__title">Data Protection &amp; Privacy</h2>
            <div className="policy-section__body">
              <p>Personal data processed through the Forum is handled in accordance with the <strong>Data Protection Act 2018</strong> and the <strong>UK General Data Protection Regulation (UK GDPR)</strong>.</p>
              <p>Users should avoid posting sensitive personal information in public posts. BarkBuddy is not responsible for personal data voluntarily disclosed by users in the Forum.</p>
              <p>For full details, please refer to our <Link to="/privacy-policy" style={{ color: 'var(--serene-purple, #927ACF)', fontWeight: 700 }}>Privacy Policy</Link>.</p>
            </div>
          </section>

          {/* 10 */}
          <section id="liability" className="policy-section">
            <p className="policy-section__number">10</p>
            <h2 className="policy-section__title">Limitation of Liability</h2>
            <div className="policy-section__body">
              <p>To the fullest extent permitted under UK law:</p>
              <ul className="policy-list">
                <li className="policy-list__item"><span>We are not responsible for user-generated content posted on the Forum</span></li>
                <li className="policy-list__item"><span>We are not liable for any loss, damage, or injury resulting from reliance on Forum content</span></li>
                <li className="policy-list__item"><span>Participation in the Forum is at your own risk</span></li>
              </ul>
              <p>Nothing in this Policy excludes or limits liability where it would be unlawful to do so.</p>
            </div>
          </section>

          {/* 11 */}
          <section id="amendments" className="policy-section">
            <p className="policy-section__number">11</p>
            <h2 className="policy-section__title">Amendments</h2>
            <div className="policy-section__body">
              <p>We may update this Policy at any time. We will endeavour to notify users of significant changes via the Forum or by email. Continued use of the Forum following any update constitutes your acceptance of the revised Policy.</p>
            </div>
          </section>

          {/* 12 */}
          <section id="contact" className="policy-section">
            <p className="policy-section__number">12</p>
            <h2 className="policy-section__title">Contact Information</h2>
            <div className="policy-section__body">
              <p>For any questions relating to this Policy, please contact us:</p>
              <div className="policy-contact">
                <div className="policy-contact__row">
                  <Building2 size={15} />
                  <span><strong>BarkBuddy</strong></span>
                </div>
                <div className="policy-contact__row">
                  <MapPin size={15} />
                  <span>London, United Kingdom</span>
                </div>
                <div className="policy-contact__row">
                  <Mail size={15} />
                  <span><a href="mailto:paws@barkbuddy.org.uk">paws@barkbuddy.org.uk</a></span>
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

export default ForumPolicy;