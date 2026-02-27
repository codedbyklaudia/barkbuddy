import React, { useState } from 'react';
import './TravelPage.scss';
import TravelFlow from './TravelFlow/TravelFlow';
import Footer from './Footer';
import type { TravelDirection } from './TravelFlow/types';


// Icons
const ArrowIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Intent card
interface IntentCardProps {
  title: string;
  description: string;
  mapImage: string;
  countryName: string;
  onClick: () => void;
}

const IntentCard: React.FC<IntentCardProps> = ({
  title, description, mapImage, onClick,
}) => (
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

// Article card
interface ArticleCardProps {
  image: string;
  title: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ image, title }) => (
  <div className="article-card" role="button" tabIndex={0}>
    <div className="article-card__img">
      <img src={image} alt="" aria-hidden="true" />
    </div>
    <div className="article-card__body">
      <p className="article-card__title">{title}</p>
      <span className="article-card__arrow" aria-label="Read article"><ArrowIcon /></span>
    </div>
  </div>
);

// TravelPage
interface TravelPageProps {
  onFlowChange?: (isActive: boolean) => void;
}

const TravelPage: React.FC<TravelPageProps> = ({ onFlowChange }) => {
  const [activeFlow, setActiveFlow] = useState<TravelDirection | null>(null);

  const openFlow = (direction: TravelDirection) => {
    setActiveFlow(direction);
    onFlowChange?.(true);
  };

  const closeFlow = () => {
    setActiveFlow(null);
    onFlowChange?.(false);
  };
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
    const toggleFaq = (index: number) => {
      setOpenFaq(openFaq === index ? null : index);
    };
  
    const faqData = [
      {
        question: "How do I use this page to plan my trip with my dog?",
        answer: "This page is designed to guide you step-by-step through the preparation process. Simply select your departure and destination country (if applicable) and review the listed entry requirements and documentation. Use the tips section to avoid common travel mistakes"
      },
      {
        question: "Where can I find the documentation and requirements for my destination?",
        answer: "All required documentation, health requirements, and travel tips are organized by section on this page. At the end, you will be able to also download the travel checklist!"
      },
      {
        question: "How do I access the printable travel checklist?",
        answer: "A downloadable PDF checklist is available in step 6 of our travel guide to help you track your preparations. The checklist is available exclusively for logged-in users."
      }
    ];
  if (activeFlow) {
    return (
      <div className="travel-page">
        <TravelFlow direction={activeFlow} onClose={closeFlow} />
      </div>
    );
  }

  return (
    <div className="travel-page">
      <nav className="travel-breadcrumb" aria-label="Breadcrumb">
        <a href="/" className="travel-breadcrumb__link">Home</a>
        <span className="travel-breadcrumb__sep" aria-hidden="true">›</span>
        <span className="travel-breadcrumb__current">Travel</span>
      </nav>

      <section className="travel-hero">
        <div className="travel-hero__content">
          <span className="travel-hero__tag">Pet Travel Guide</span>
          <h1 className="travel-hero__heading">Travel with dog in <em>2026</em></h1>
          <p className="travel-hero__body">
            If you're planning to travel with your pet, you may need to complete certain{' '}
            <strong>paperwork or tasks</strong> before you go. Meeting these requirements takes time, so don't delay.
          </p>
          <p className="travel-hero__body">The information on this page will help you get started.</p>
        </div>
        <div className="travel-hero__visual" aria-hidden="true">
          <img
            src="../images/hero_picture.png"
            alt="Travel with dog"
            className="travel-hero__illustration"
          />
        </div>
      </section>

      <section className="travel-section travel-section--white">
        <div className="travel-section__inner">
          <h2 className="travel-section__heading">I want to…</h2>
          <div className="intent-grid">
            <IntentCard
              title="Travel from UK"
              description="Check travel requirements and documentation by destination for travel from UK to another country."
              mapImage="../images/italy_travel.png"
              countryName="Italy"
              onClick={() => openFlow('from-uk')}
            />
            <IntentCard
              title="Travel to UK"
              description="Check travel requirements and documentation that you need for travel to UK from another country."
              mapImage="../images/uk_travel.png"
              countryName="UK & Ireland"
              onClick={() => openFlow('to-uk')}
            />
          </div>
        </div>
      </section>

      <section className="travel-section">
        <div className="travel-section__inner">
          <h2 className="travel-section__heading">You may need this when you travel!</h2>
          <div className="articles-grid">
            <ArticleCard
              image="../images/dog_inplane.jpg"
              title="The best in-cabin dog travel bags 2026"
            />
            <ArticleCard
              image="../images/feeding_pets.webp"
              title="Feeding pets when flying | Food and water"
            />
            <ArticleCard
              image="../images/dog_anxiety.avif"
              title="Anxiety in dogs while travel"
            />
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="faq">
        <h2 className="faq__title">Your questions, answered!</h2>
        <p className="faq__subtitle">Read more of FAQ here.</p>
        
        <div className="faq__list">
          {faqData.map((faq, index) => (
            <div 
              key={index} 
              className={`faq__item ${openFaq === index ? 'faq__item--open' : ''}`}
            >
              <button 
                className="faq__question"
                onClick={() => toggleFaq(index)}
              >
                <span>{faq.question}</span>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  className="faq__icon"
                >
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div className="faq__answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TravelPage;