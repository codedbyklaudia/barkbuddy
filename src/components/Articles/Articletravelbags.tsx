import React, { useEffect, useState } from 'react';
import './Article.scss';
import Footer from '../Footer';

interface ArticlePageProps {
  onBack?: () => void;
}

const ArticleTravelBags: React.FC<ArticlePageProps> = ({ onBack }) => {
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const onScroll = () => {
      const el = document.documentElement;
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollPct(pct);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="article-page">
      {/* Reading progress bar */}
      <div className="article-progress" style={{ width: `${scrollPct}%` }} />

      {/* Back nav */}
      <nav className="article-nav">
        <button className="article-nav__back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Travel
        </button>
        <span className="article-nav__tag">Travel Gear</span>
      </nav>

      {/* Hero */}
      <header className="article-hero">
        <div className="article-hero__meta">
          <span className="article-hero__category">Travel Gear</span>
          <span className="article-hero__dot" />
          <span className="article-hero__read">8 min read</span>
          <span className="article-hero__dot" />
          <span className="article-hero__date">March 2026</span>
        </div>
        <h1 className="article-hero__title">
          The best in-cabin<br />dog travel bags
          <span className="article-hero__year"> 2026</span>
        </h1>
        <p className="article-hero__intro">
          Flying with your dog doesn't have to be stressful. The right carrier makes all the difference - 
          for you, your pup, and the person in the next seat. We tested 12 bags so you don't have to.
        </p>
        <div className="article-hero__img-wrap">
          <img src="../images/dog_inplane.jpg" alt="Dog in travel bag on airplane" className="article-hero__img" />
          <div className="article-hero__img-caption">The right bag = a calmer flight for everyone</div>
        </div>
      </header>

      {/* Body */}
      <article className="article-body">

        <section className="article-section">
          <h2 className="article-section__heading">What to look for</h2>
          <p>
            Not all airline-approved carriers are created equal. Airlines typically require soft-sided carriers 
            that fit under the seat in front of you - usually around <strong>45 × 28 × 25 cm</strong>, though 
            this varies by airline. Always check your specific carrier's pet policy before booking.
          </p>
          <p>
            Beyond dimensions, you want a bag that keeps your dog comfortable, well-ventilated, and secure 
            during turbulence. Here's what matters most:
          </p>

          <div className="article-tips">
            {[
              { emoji: '📐', title: 'Size & compliance', body: 'Measure your dog in a natural standing position. The bag should allow them to stand, turn around, and lie down comfortably.' },
              { emoji: '🌬️', title: 'Ventilation', body: 'Mesh panels on multiple sides are essential. Avoid bags where the only airflow is from a single small window.' },
              { emoji: '🔒', title: 'Security', body: 'Look for double-zipper closures with a secondary safety clip. Nervous dogs can nose their way out of single-zip bags.' },
              { emoji: '🧹', title: 'Washability', body: 'Accidents happen. Removable, machine-washable liners are a must for any trip longer than a couple of hours.' },
            ].map((tip, i) => (
              <div className="article-tip" key={i}>
                <span className="article-tip__emoji">{tip.emoji}</span>
                <div>
                  <strong className="article-tip__title">{tip.title}</strong>
                  <p className="article-tip__body">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="article-pullquote">
          "The best carrier is the one your dog will actually stay calm in - not the most expensive one."
        </div>

        <section className="article-section">
          <h2 className="article-section__heading">Our top picks</h2>

          {[
            {
              rank: '01',
              name: 'Sleepypod Air',
              tag: 'Best overall',
              tagColor: '#7c3aed',
              price: '£150–£180',
              pros: ['Crash-tested safety', 'Extremely well ventilated', 'Stylish enough to not embarrass you'],
              cons: ['Pricey', 'No external pockets'],
              verdict: 'The gold standard for in-cabin travel. Pricey but worth every penny if you fly regularly with your dog.',
            },
            {
              rank: '02',
              name: 'Sherpa Original Deluxe',
              tag: 'Best value',
              tagColor: '#059669',
              price: '£55–£75',
              pros: ['Airline approved worldwide', 'Flexible sides expand under seat', 'Great price'],
              cons: ['Basic looks', 'Can feel warm on longer flights'],
              verdict: 'The reliable workhorse. If you want something that just works without drama, this is it.',
            },
            {
              rank: '03',
              name: 'K9 Sport Sack Air Plus',
              tag: 'Best for active dogs',
              tagColor: '#d97706',
              price: '£90–£120',
              pros: ['Converts to backpack for airport transit', 'Excellent ventilation', 'Water-resistant'],
              cons: ['Bulkier shape', 'Takes practice to get dog in'],
              verdict: 'A great pick if you\'re hiking before or after your flight and need one bag for both.',
            },
            {
              rank: '04',
              name: 'EliteField 3-Door Soft Crate',
              tag: 'Best for anxious dogs',
              tagColor: '#2563eb',
              price: '£40–£60',
              pros: ['Three entry points - less wrestling', 'Very spacious feel', 'Folds flat for storage'],
              cons: ['Softer structure', 'Not all airlines approve the shape'],
              verdict: 'Dogs who hate being stuffed into a top-loader tend to accept this one more easily.',
            },
          ].map((pick, i) => (
            <div className="article-pick" key={i}>
              <div className="article-pick__rank">{pick.rank}</div>
              <div className="article-pick__content">
                <div className="article-pick__header">
                  <h3 className="article-pick__name">{pick.name}</h3>
                  <span className="article-pick__tag" style={{ background: pick.tagColor }}>{pick.tag}</span>
                  <span className="article-pick__price">{pick.price}</span>
                </div>
                <div className="article-pick__cols">
                  <div>
                    <p className="article-pick__label">Pros</p>
                    <ul className="article-pick__list article-pick__list--pros">
                      {pick.pros.map((p, j) => <li key={j}>{p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="article-pick__label">Cons</p>
                    <ul className="article-pick__list article-pick__list--cons">
                      {pick.cons.map((c, j) => <li key={j}>{c}</li>)}
                    </ul>
                  </div>
                </div>
                <p className="article-pick__verdict">
                  <span>Verdict - </span>{pick.verdict}
                </p>
              </div>
            </div>
          ))}
        </section>

        <section className="article-section">
          <h2 className="article-section__heading">Before you fly - a quick checklist</h2>
          <div className="article-checklist">
            {[
              'Book your pet\'s spot in-cabin when you book your own ticket (limited spaces)',
              'Weigh your dog including the carrier - most airlines have a 8–10 kg combined limit',
              'Do a dry run: put the carrier out at home a week before so your dog gets used to it',
              'Bring a familiar-smelling item - an old t-shirt works perfectly',
              'Fast your dog for 4-6 hours before the flight to reduce nausea risk',
              'Bring a portable water dispenser and offer water during boarding',
              'Label the bag with your contact details and your dog\'s name',
            ].map((item, i) => (
              <div className="article-checklist__item" key={i}>
                <span className="article-checklist__box" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="article-callout">
          <span className="article-callout__icon">✈️</span>
          <div>
            <strong>Planning to fly abroad?</strong>
            <p>Check our travel requirements guide to make sure your dog's documentation is in order before you book.</p>
            <button className="article-callout__btn" onClick={onBack}>View travel requirements →</button>
          </div>
        </div>

      </article>
      <Footer />
    </div>
  );
};

export default ArticleTravelBags;