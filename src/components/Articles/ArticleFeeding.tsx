import React, { useEffect, useState } from 'react';
import './Article.scss';
import Footer from '../Footer';

interface ArticlePageProps {
  onBack?: () => void;
}

const ArticleFeeding: React.FC<ArticlePageProps> = ({ onBack }) => {
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
      <div className="article-progress" style={{ width: `${scrollPct}%` }} />

      <nav className="article-nav">
        <button className="article-nav__back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M11 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Travel
        </button>
        <span className="article-nav__tag">Pet Health</span>
      </nav>

      <header className="article-hero">
        <div className="article-hero__meta">
          <span className="article-hero__category">Pet Health</span>
          <span className="article-hero__dot" />
          <span className="article-hero__read">6 min read</span>
          <span className="article-hero__dot" />
          <span className="article-hero__date">March 2026</span>
        </div>
        <h1 className="article-hero__title">
          Feeding your pet<br />when flying
          <span className="article-hero__year"> - food & water guide</span>
        </h1>
        <p className="article-hero__intro">
          When, what and how much to feed your dog before and during a flight. 
          Get it wrong and you'll be dealing with a very unhappy pup - and a very unpleasant carrier.
        </p>
        <div className="article-hero__img-wrap">
          <img src="../images/feeding_pets.webp" alt="Feeding pets when travelling" className="article-hero__img" />
          <div className="article-hero__img-caption">Timing your dog's meals correctly makes a huge difference</div>
        </div>
      </header>

      <article className="article-body">

        <section className="article-section">
          <h2 className="article-section__heading">The golden rule: fast before flying</h2>
          <p>
            Most vets recommend withholding food for <strong>4 to 6 hours before the flight</strong>. 
            Dogs - like humans - can experience nausea from the combination of motion, altitude pressure 
            changes, and stress. A full stomach makes this significantly worse.
          </p>
          <p>
            Water, however, should <em>never</em> be withheld. Cabin air is extremely dry at altitude 
            and dehydration is a real risk, especially on longer flights. Make sure your dog has access 
            to water right up until you board.
          </p>

          <div className="article-timeline">
            <div className="article-timeline__line" />
            {[
              { time: '12 hrs before', label: 'Last proper meal', note: 'Feed a normal-sized meal. Don\'t reduce - you want your dog satisfied, not anxious and hungry.' },
              { time: '6 hrs before', label: 'No more food', note: 'Stop feeding solid food. Small treats during security are fine but keep them minimal.' },
              { time: '1 hr before', label: 'Final water stop', note: 'Offer water generously. This is the last reliable hydration opportunity for a while.' },
              { time: 'At gate', label: 'Small frozen treat', note: 'A frozen broth cube or lick mat can reduce anxiety during boarding without upsetting the stomach.' },
              { time: 'During flight', label: 'Water only', note: 'Collapsible silicone bowls work well in tight cabin spaces. Offer water every 1–2 hours on long flights.' },
              { time: 'After landing', label: 'Wait 30 mins', note: 'Let your dog settle and walk before offering food. The excitement of landing can trigger nausea too.' },
            ].map((step, i) => (
              <div className="article-timeline__item" key={i}>
                <div className="article-timeline__marker" />
                <div className="article-timeline__content">
                  <span className="article-timeline__time">{step.time}</span>
                  <strong className="article-timeline__label">{step.label}</strong>
                  <p className="article-timeline__note">{step.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="article-pullquote">
          "A hungry dog is calmer than a nauseous one. Trust the fast."
        </div>

        <section className="article-section">
          <h2 className="article-section__heading">What to pack for food & water</h2>

          <div className="article-tips">
            {[
              { emoji: '💧', title: 'Collapsible silicone bowl', body: 'Takes up zero space, clips to your bag, and means you can offer water anywhere - at the gate, mid-flight, or at baggage claim.' },
              { emoji: '🧊', title: 'Frozen broth cubes', body: 'Freeze low-sodium chicken or beef broth into small cubes the night before. They\'re a soothing, hydrating treat that won\'t upset the stomach.' },
              { emoji: '🥣', title: 'Dry kibble in a zip bag', body: 'Pre-portion a meal in a sealed bag so you\'re not wrestling with a full bag of food at the destination airport.' },
              { emoji: '🧴', title: 'Electrolyte drops', body: 'Canine electrolyte drops (like Oralade) can be added to water if your dog refuses to drink. Useful for anxious dogs who go off water when stressed.' },
              { emoji: '🧁', title: 'High-value treats', body: 'Small, smelly treats (cheese, chicken, liver) are your boarding secret weapon. Use them to reward calm behaviour during security and boarding.' },
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

        <section className="article-section">
          <h2 className="article-section__heading">What about sedation?</h2>
          <p>
            Some owners ask their vet about sedation or calming medication before flights. This is a 
            legitimate conversation to have, but the general veterinary advice has shifted in recent years.
          </p>
          <p>
            Most sedatives affect a dog's ability to regulate their own body temperature and balance their 
            inner ear - both of which are already challenged at altitude. <strong>Never give your dog 
            human anxiety medication</strong> or any medication that hasn't been specifically prescribed 
            for them by your vet.
          </p>

          <div className="article-callout">
            <span className="article-callout__icon">⚕️</span>
            <div>
              <strong>Always consult your vet</strong>
              <p>
                If your dog is extremely anxious about travel, speak to your vet at least 2 weeks before 
                your trip. Natural calming supplements (like Adaptil or Zylkene) need time to build up 
                in your dog's system to be effective.
              </p>
            </div>
          </div>
        </section>

        <section className="article-section">
          <h2 className="article-section__heading">Breed-specific considerations</h2>
          <p>
            Brachycephalic breeds (flat-faced dogs like Bulldogs, Pugs, French Bulldogs, and Boxers) 
            are at much higher risk of respiratory distress during flights. Many airlines have outright 
            banned them from the cargo hold, and even in-cabin travel should be approached with extra caution.
          </p>
          <div className="article-tips">
            {[
              { emoji: '🐾', title: 'Flat-faced breeds', body: 'Feed even earlier - 8 hours before - and ensure your vet clears them to fly. Consider whether travel by car or train is a safer option.' },
              { emoji: '🐕', title: 'Large breeds', body: 'If your dog is too big for cabin travel, consider the implications for cargo carefully. Many owners opt for alternative transport.' },
              { emoji: '🐩', title: 'Senior dogs', body: 'Older dogs dehydrate faster and handle stress less well. Pack extra water, stick rigidly to the fasting schedule, and allow more settle time after landing.' },
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

      </article>
      <Footer />
    </div>
  );
};

export default ArticleFeeding;