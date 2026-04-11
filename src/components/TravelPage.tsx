import React, { useState } from 'react';
import './TravelPage.scss';
import TravelFlow from './TravelFlow/TravelFlow';
import Footer from './Footer';
import type { TravelDirection } from './TravelFlow/types';

import ArticleTravelBags from './Articles/Articletravelbags';
import ArticleFeeding    from './Articles/ArticleFeeding';
import ArticleAnxiety    from './Articles/ArticleAnxiety';

type View = 'travel' | 'article-bags' | 'article-feeding' | 'article-anxiety';

const ArrowIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface IntentCardProps {
  title: string; description: string; mapImage: string; onClick: () => void;
}
const IntentCard: React.FC<IntentCardProps> = ({ title, description, mapImage, onClick }) => (
  <button className="intent-card" onClick={onClick} type="button" aria-label={title}>
    <h2 className="intent-card__title">{title}</h2>
    <p className="intent-card__desc">{description}</p>
    <div className="intent-card__map">
      <img src={mapImage} alt="" className="intent-card__map-img" aria-hidden="true" />
    </div>
    <div className="intent-card__footer">
      <span className="intent-card__arrow" aria-hidden="true"><ArrowIcon /></span>
    </div>
  </button>
);

interface ArticleCardProps {
  image: string; title: string; onClick: () => void;
}
const ArticleCard: React.FC<ArticleCardProps> = ({ image, title, onClick }) => (
  <div className="article-card" role="button" tabIndex={0} onClick={onClick} onKeyDown={e => e.key === 'Enter' && onClick()}>
    <div className="article-card__img">
      <img src={image} alt="" aria-hidden="true" />
    </div>
    <div className="article-card__body">
      <p className="article-card__title">{title}</p>
      <span className="article-card__arrow" aria-label="Read article"><ArrowIcon /></span>
    </div>
  </div>
);

interface TravelPageProps {
  onFlowChange?: (isActive: boolean) => void;
}

const TravelPage: React.FC<TravelPageProps> = ({ onFlowChange }) => {
  const [view, setView] = useState<View>('travel');
  const [activeFlow, setActiveFlow] = useState<TravelDirection | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const openFlow = (direction: TravelDirection) => { setActiveFlow(direction); onFlowChange?.(true); };
  const closeFlow = () => { setActiveFlow(null); onFlowChange?.(false); };
  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  const faqData = [
    { question: "How do I use this page to plan my trip with my dog?", answer: "This page is designed to guide you step-by-step through the preparation process. Simply select your departure and destination country (if applicable) and review the listed entry requirements and documentation. Use the tips section to avoid common travel mistakes." },
    { question: "Where can I find the documentation and requirements for my destination?", answer: "All required documentation, health requirements, and travel tips are organized by section on this page. At the end, you will be able to also download the travel checklist!" },
    { question: "How do I access the printable travel checklist?", answer: "A downloadable PDF checklist is available in step 6 of our travel guide to help you track your preparations. The checklist is available exclusively for logged-in users." },
  ];

  // Render article views 
  if (view === 'article-bags')    return <ArticleTravelBags onBack={() => setView('travel')} />;
  if (view === 'article-feeding') return <ArticleFeeding    onBack={() => setView('travel')} />;
  if (view === 'article-anxiety') return <ArticleAnxiety    onBack={() => setView('travel')} />;
  if (activeFlow) return (
    <div className="travel-page">
      <TravelFlow direction={activeFlow} onClose={closeFlow} />
    </div>
  );

  return (
    <div className="travel-page">
      <section className="travel-hero">
        <div className="travel-hero__left">
          <div className="travel-hero__heading-block">
            <p className="travel-hero__eyebrow">Plan your journey</p>
            <h1 className="travel-hero__heading">
              Travel with<br />your dog,<br /><em>stress-free.</em>
            </h1>
            <p className="travel-hero__sub">
              If you're planning to travel with your pet, you may need to complete certain
              <strong> paperwork or tasks</strong> before you go. Don't delay - we'll guide you through every step.
            </p>
            <div className="travel-hero__ctas">
              <button className="travel-hero__cta travel-hero__cta--primary" onClick={() => openFlow('from-uk')}>
                Get started
                <i className="bi bi-chevron-double-right"></i>

              </button>
              <button className="travel-hero__cta travel-hero__cta--ghost"
                onClick={() => document.querySelector('.travel-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Browse destinations
              </button>
            </div>
          </div>
        </div>
        <div className="travel-hero__right">
          <img className="travel-hero__image" src="../images/Travelling.webp" alt="Person travelling and looking at mountains with their dog" />
        </div>
      </section>

      <section className="travel-section travel-section--white">
        <div className="travel-section__inner">
          <h2 className="travel-section__heading">I want to…</h2>
          <div className="intent-grid">
            <IntentCard title="Travel from UK" description="Check travel requirements and documentation by destination for travel from UK to another country." mapImage="../images/italy_travel.png" onClick={() => openFlow('from-uk')} />
            <IntentCard title="Travel to UK" description="Check travel requirements and documentation that you need for travel to UK from another country." mapImage="../images/uk_travel.png" onClick={() => openFlow('to-uk')} />
          </div>
        </div>
      </section>

      <section className="travel-section">
        <div className="travel-section__inner">
          <h2 className="travel-section__heading">You may need this when you travel!</h2>
          <div className="articles-grid">
            <ArticleCard image="../images/dog_inplane.webp"    title="The best in-cabin dog travel bags 2026"    onClick={() => setView('article-bags')} />
            <ArticleCard image="../images/feeding_pets.webp"  title="Feeding pets when flying | Food and water" onClick={() => setView('article-feeding')} />
            <ArticleCard image="../images/dog_anxiety.webp"   title="Anxiety in dogs while travel"              onClick={() => setView('article-anxiety')} />
          </div>
        </div>
      </section>

      <section className="faq">
        <h2 className="faq__title">Your questions, answered!</h2>
        <p className="faq__subtitle">Read more of FAQ here.</p>
        <div className="faq__list">
          {faqData.map((faq, i) => (
            <div key={i} className={`faq__item ${openFaq === i ? 'faq__item--open' : ''}`}>
              <button className="faq__question" onClick={() => toggleFaq(i)}>
                <span>{faq.question}</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="faq__icon">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div className="faq__answer"><p>{faq.answer}</p></div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default TravelPage;