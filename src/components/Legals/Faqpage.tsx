import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './FAQPage.scss';
import Footer from '../Footer';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  id: string;
  icon: string;
  label: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    id: 'account',
    icon: 'bi-person-circle',
    label: 'Account & Registration',
    items: [
      {
        q: 'How do I create a BarkBuddy account?',
        a: 'Head to our Register page and fill in your name, email address, and a secure password. You\'ll receive a confirmation email - click the link inside to verify your account and you\'re good to go.',
      },
      {
        q: 'Is BarkBuddy free to use?',
        a: 'Yes! Creating an account and using BarkBuddy as a dog owner - including searching for services, browsing the community forum, and using our travel tools - is completely free.',
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'On the login page, click "Forgot password?" and enter your registered email address. We\'ll send you a secure reset link. If you don\'t see it within a few minutes, check your spam or junk folder.',
      },
      {
        q: 'Can I change my email address or name?',
        a: 'Yes. Head to your account settings from the dashboard, where you can update your email address, display name, and other profile details at any time.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Simply head to your settings page in dashboard and click "Delete account". You can also request account deletion by contacting us at paws@barkbuddy.org.uk. We\'ll process your request and confirm deletion within 30 days. Please note that some data may be retained for legal or operational purposes as outlined in our Privacy Policy.',
      },
    ],
  },
  {
    id: 'dashboard',
    icon: 'bi-grid',
    label: 'Dog Profiles & Dashboard',
    items: [
      {
        q: 'How do I add my dog to my profile?',
        a: 'From your dashboard, click "Add a dog" and follow the registration steps. You\'ll be asked to provide your dog\'s name, breed, age, weight, and a photo. You can add multiple dogs to a single account.',
      },
      {
        q: 'What is a daily check-in?',
        a: 'The daily check-in is a quick wellbeing log for your dog - you can record their mood, activity level, appetite, and any notes. Over time this builds a simple health history you can refer back to or share with your vet.',
      },
      {
        q: 'What are BarkBuddy Buddies?',
        a: 'Buddies are other BarkBuddy members you connect with - think of them like friends on the platform. You can follow their updates, share tips, and see their dogs\' profiles. You\'re in full control of who you connect with.',
      },
      {
        q: 'Can I add more than one dog to my account?',
        a: 'Absolutely. BarkBuddy supports multiple dog profiles under a single account. Each dog gets their own profile with individual check-in history, health notes, and photos.',
      },
      {
        q: 'Who can see my dog\'s profile information?',
        a: 'Your dog\'s profile is visible to other BarkBuddy members by default. You can adjust your privacy settings in your account to control what is publicly visible. Sensitive health notes are always private to you.',
      },
    ],
  },
  {
    id: 'services',
    icon: 'bi-search-heart',
    label: 'Service Finder & Listings',
    items: [
      {
        q: 'How does the Service Finder work?',
        a: 'Enter a postcode, city, or area into the search bar - or click the location icon to use your current GPS location. You\'ll see a map and list of nearby groomers, vets, trainers, pet shops, and dog-friendly places, sorted by distance.',
      },
      {
        q: 'Are the businesses on BarkBuddy verified?',
        a: 'Yes. All business listings go through a review and approval process before appearing on the Platform. We check that the information provided is accurate and that businesses hold the appropriate credentials. That said, we encourage users to do their own due diligence before booking.',
      },
      {
        q: 'How do I book a service through BarkBuddy?',
        a: 'BarkBuddy is a discovery platform - we help you find the right business, but bookings are made directly with them. Each listing shows the business\'s contact details, phone number, and website so you can reach out and arrange things directly.',
      },
      {
        q: 'What\'s the difference between Services and Activities?',
        a: 'Services covers professional dog care - groomers, vets, trainers, behaviourists, and pet shops. Activities covers dog-friendly places to visit - parks, restaurants, hotels, and day care facilities. You can switch between the two tabs on the Service Finder page.',
      },
      {
        q: 'I can\'t find a business I know. Can I suggest a listing?',
        a: 'Yes! If you know a great local business that isn\'t on BarkBuddy yet, you can suggest it by contacting us at paws@barkbuddy.org.uk. Alternatively, business owners can apply to be listed directly through our Register a Business flow.',
      },
      {
        q: 'How do I report an incorrect or misleading listing?',
        a: 'Use the Report button on the listing page, or email us at paws@barkbuddy.org.uk with the listing name and the issue. We review all reports and take action promptly.',
      },
    ],
  },
  {
    id: 'forum',
    icon: 'bi-chat-dots',
    label: 'Community Forum',
    items: [
      {
        q: 'Who can post in the BarkBuddy Forum?',
        a: 'Any registered BarkBuddy member can read and post in the Forum. You\'ll need a verified account to participate. Guest visitors can browse but cannot post.',
      },
      {
        q: 'What topics can I discuss in the Forum?',
        a: 'The Forum is for all things dog - training tips, health questions, breed advice, food recommendations, travel stories, and general dog ownership chat. Keep it relevant, kind, and constructive.',
      },
      {
        q: 'Is veterinary advice given in the Forum reliable?',
        a: 'The Forum is a peer support space - advice comes from fellow dog owners, not qualified vets. Always treat Forum content as general discussion only, and consult a registered vet for any medical or health concerns about your dog.',
      },
      {
        q: 'How do I report a post that breaks the rules?',
        a: 'Click the Report flag on any post to alert our moderation team. We review all reports and take appropriate action. For urgent concerns, contact us directly at paws@barkbuddy.co.uk.',
      },
      {
        q: 'Can I be banned from the Forum?',
        a: 'Yes. Repeated or serious breaches of our Forum & Community Policy - including harassment, hate speech, or posting harmful content - may result in your Forum access or full account being suspended or permanently removed.',
      },
    ],
  },
  {
    id: 'travel',
    icon: 'bi-geo-alt',
    label: 'Travel Tools',
    items: [
      {
        q: 'What are the BarkBuddy Travel Tools?',
        a: 'Our Travel Tools help you plan trips with your dog. You can generate personalised documentation checklists, browse dog-friendly destinations, and get step-by-step guidance on what you need to prepare before travelling - whether within the UK or abroad.',
      },
      {
        q: 'Does BarkBuddy cover international travel?',
        a: 'Yes. Our travel guides cover both UK-based trips and international travel, including pet passport requirements, microchipping, vaccinations, and country-specific entry rules. Always verify requirements with official government sources before travelling.',
      },
      {
        q: 'Can I save or download my travel documents?',
        a: 'Yes. Documents generated through our Travel Tools can be saved to your account and downloaded as a PDF for easy reference. You\'ll find them in your dashboard under Travel.',
      },
      {
        q: 'Is the travel information on BarkBuddy official?',
        a: 'Our travel content is written to be as accurate and up to date as possible, but pet travel regulations can change. We always recommend double-checking requirements with the relevant government authority (such as DEFRA for UK departures) before you travel.',
      },
    ],
  },
  {
    id: 'privacy',
    icon: 'bi-shield-lock',
    label: 'Privacy & Data',
    items: [
      {
        q: 'What personal data does BarkBuddy collect?',
        a: 'We collect data you provide when registering (name, email, location), data about how you use the Platform (pages visited, searches), and technical data (device type, IP address). We do not sell your data to third parties. Full details are in our Privacy Policy.',
      },
      {
        q: 'Does BarkBuddy track my location?',
        a: 'Only when you explicitly allow it. If you click the "Use my location" button in the Service Finder, we use your GPS coordinates to show nearby results. We do not track your location in the background or at any other time.',
      },
      {
        q: 'How do I access or delete my data?',
        a: 'Under UK GDPR you have the right to access, correct, or delete your personal data. Email us at paws@barkbuddy.org.uk with your request and we\'ll respond within one calendar month.',
      },
      {
        q: 'Does BarkBuddy use cookies?',
        a: 'Yes. We use essential cookies to keep the Platform running, and optional analytics and preference cookies with your consent. You can manage your cookie preferences at any time via your browser settings or our cookie consent tool.',
      },
      {
        q: 'How do I unsubscribe from marketing emails?',
        a: 'Every marketing email we send includes an unsubscribe link at the bottom. Click it to opt out immediately. You can also manage email preferences in your account settings.',
      },
    ],
  },
  {
    id: 'business',
    icon: 'bi-shop',
    label: 'Business Owners',
    items: [
      {
        q: 'How do I list my business on BarkBuddy?',
        a: 'Click "Register a Business" from the main navigation and complete the application form. You\'ll need to provide your business details, contact information, description, photos, and any relevant credentials. Our team will review your submission and get back to you within a few working days.',
      },
      {
        q: 'Is it free to list my business?',
        a: 'We offer a free basic listing for all approved businesses. Enhanced listing features may be available in future. We\'ll always be transparent about any costs before they apply.',
      },
      {
        q: 'How long does the approval process take?',
        a: 'We aim to review all new listing applications within 3–5 working days. You\'ll receive an email confirmation once your listing has been approved and is live on the Platform.',
      },
      {
        q: 'Can I update my listing after it\'s approved?',
        a: 'Yes. Log into your business account to edit your listing details, update photos, change contact information, or update your service descriptions at any time. Significant changes may be subject to a brief re-review.',
      },
      {
        q: 'What happens if my listing is rejected?',
        a: 'If your listing doesn\'t meet our standards, we\'ll email you with the reason and - where possible - guidance on what to address before reapplying. Common reasons include incomplete information or missing credentials.',
      },
      {
        q: 'How do I report a problem with my listing?',
        a: 'Contact us at paws@barkbuddy.org.uk with your business name and a description of the issue. Our team will look into it and respond promptly.',
      },
    ],
  },
];

const FAQPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('account');
  const [openItem, setOpenItem]             = useState<string | null>(null);
  const [searchQuery, setSearchQuery]       = useState('');

  const currentCategory = FAQ_DATA.find(c => c.id === activeCategory)!;

  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    const results: { category: string; item: FAQItem }[] = [];
    FAQ_DATA.forEach(cat => {
      cat.items.forEach(item => {
        if (item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)) {
          results.push({ category: cat.label, item });
        }
      });
    });
    return results;
  }, [searchQuery]);

  const toggleItem = (key: string) => {
    setOpenItem(prev => prev === key ? null : key);
  };

  return (
    <div className="faq-page">

      {/* Hero */}
      <section className="faq-hero">
        <div className="faq-hero__inner">
          <div className="faq-hero__eyebrow">
            <span>Help Centre</span>
          </div>
          <h1 className="faq-hero__title">
            Frequently Asked<em> Questions</em>
          </h1>
          <p className="faq-hero__sub">
            Everything you need to know about BarkBuddy - from getting started to finding the perfect dog care near you.
          </p>

          {/* Search */}
          <div className="faq-hero__search">
            <i className="bi bi-search faq-hero__search-icon" />
            <input
              type="text"
              placeholder="Search questions… "
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setOpenItem(null); }}
              className="faq-hero__search-input"
            />
            {searchQuery && (
              <button className="faq-hero__search-clear" onClick={() => setSearchQuery('')}>
                <i className="bi bi-x" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Search results */}
      {filteredResults !== null ? (
        <div className="faq-search-results">
          <div className="faq-search-results__inner">
            <p className="faq-search-results__count">
              {filteredResults.length === 0
                ? 'No results found. Try a different search term.'
                : `${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''} for "${searchQuery}"`}
            </p>
            {filteredResults.map((r, i) => {
              const key = `search-${i}`;
              return (
                <div key={key} className="faq-search-results__item">
                  <span className="faq-search-results__category">
                    {r.category}
                  </span>
                  <button
                    className={`faq-accordion__btn ${openItem === key ? 'faq-accordion__btn--open' : ''}`}
                    onClick={() => toggleItem(key)}
                  >
                    <span>{r.item.q}</span>
                    <i className={`bi ${openItem === key ? 'bi-dash' : 'bi-plus'} faq-accordion__icon`} />
                  </button>
                  <div className={`faq-accordion__body ${openItem === key ? 'faq-accordion__body--open' : ''}`}>
                    <p>{r.item.a}</p>
                  </div>
                </div>
              );
            })}
            {filteredResults.length === 0 && (
              <div className="faq-empty">
                <i className="bi bi-emoji-neutral" />
                <p>Can't find what you're looking for? <a href="mailto:paws@barkbuddy.org.uk">Contact us</a> and we'll help.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Split layout */
        <div className="faq-layout">

          {/* Category sidebar */}
          <aside className="faq-sidebar">
            <p className="faq-sidebar__label">Categories</p>
            {FAQ_DATA.map(cat => (
              <button
                key={cat.id}
                className={`faq-sidebar__btn ${activeCategory === cat.id ? 'faq-sidebar__btn--active' : ''}`}
                onClick={() => { setActiveCategory(cat.id); setOpenItem(null); }}
              >
                <i className={`bi ${cat.icon} faq-sidebar__btn-icon`} />
                {cat.label}
                <span className="faq-sidebar__count">{cat.items.length}</span>
              </button>
            ))}

            <div className="faq-sidebar__contact">
              <p>Still need help?</p>
              <a href="mailto:paws@barkbuddy.org.uk" className="faq-sidebar__contact-link">
                <i className="bi bi-envelope" /> Email us
              </a>
              <Link to="/forum" className="faq-sidebar__contact-link">
                <i className="bi bi-chat-dots" /> Ask the community
              </Link>
            </div>
          </aside>

          {/* Questions panel */}
          <main className="faq-panel">
            <div className="faq-panel__header">
              <i className={`bi ${currentCategory.icon} faq-panel__header-icon`} />
              <div>
                <h2 className="faq-panel__title">{currentCategory.label}</h2>
                <p className="faq-panel__count">{currentCategory.items.length} questions</p>
              </div>
            </div>

            <div className="faq-accordion">
              {currentCategory.items.map((item, i) => {
                const key = `${activeCategory}-${i}`;
                return (
                  <div
                    key={key}
                    className={`faq-accordion__item ${openItem === key ? 'faq-accordion__item--open' : ''}`}
                  >
                    <button
                      className="faq-accordion__btn"
                      onClick={() => toggleItem(key)}
                    >
                      <span>{item.q}</span>
                      <i className={`bi ${openItem === key ? 'bi-dash' : 'bi-plus'} faq-accordion__icon`} />
                    </button>
                    <div className={`faq-accordion__body ${openItem === key ? 'faq-accordion__body--open' : ''}`}>
                      <p>{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      )}

      {/* Bottom CTA */}
      <section className="faq-cta">
        <div className="faq-cta__inner">
          <i className="bi bi-heart-pulse faq-cta__icon" />
          <h2 className="faq-cta__title">Still have a question?</h2>
          <p className="faq-cta__sub">We are happy to help. Drop us an email and we'll get back to you within one working day.</p>
          <div className="faq-cta__actions">
            <a href="mailto:paws@barkbuddy.org.uk" className="faq-cta__btn faq-cta__btn--primary">
              <i className="bi bi-envelope" /> Contact us
            </a>
            <Link to="/forum" className="faq-cta__btn faq-cta__btn--ghost">
              <i className="bi bi-chat-dots" /> Ask the community
            </Link>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
};

export default FAQPage;