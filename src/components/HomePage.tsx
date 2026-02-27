import React, { useState } from 'react';
import './HomePage.scss';
import HeroSection from './HeroSection';
import Footer from './Footer';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'parents' | 'business'>('parents');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      question: "Can I use the Forum without an app?",
      answer: "Yes! The Forum is accessible for registred users, both through our website and mobile app. You can join discussions, ask questions, and connect with other dog parents from any device."
    },
    {
      question: "What does the app have that is not on the website?",
      answer: "The app offers personalized reminders, offline access to saved content, age-specific care reminders, walk tracker and a more streamlined mobile experience for on-the-go dog parents."
    },
    {
      question: "How can I download the app?",
      answer: "You can download the BarkBuddy app from the Google Play Store for Android devices. Just search for 'BarkBuddy' and tap install!"
    }
  ];

  return (
    <div className="home-page">
      <HeroSection />

      {/* App Features Section */}
      <section className="app-features">
        <div className="app-features__content">
          <h2 className="app-features__title">Age-personalised expert tips</h2>
          <p className="app-features__description">
            Smarter care for every age. Explore age-based care tips anytime.
          </p>
          <p className="app-features__description">
            Download BarkBuddy App to access personalised, age-specific nutrition and care recommendations + your walk & health tracker!
          </p>
          <button className="btn btn--download">
            Download the app
            <svg className="btn__icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="app-features__preview">
          <div className="app-features__phone-mockup">
            <img src="../../images/google_store_ad.png" alt="BarkBuddy App Preview" />
            <div className="app-features__labels">
              <span className="feature-label feature-label--training">Reminders</span>
              <span className="feature-label feature-label--health">Health tracker</span>
              <span className="feature-label feature-label--nutrition">Walk tracker</span>
              <span className="feature-label feature-label--care">Save favourites</span>
              <span className="feature-label feature-label--reminders">Forum</span>
            </div>
          </div>
        </div>
      </section>

      {/* What's Else Section */}
      <section className="whats-else">
        <h2 className="whats-else__title">Parks of BarkBuddy</h2>
        
        <div className="whats-else__tabs">
          <button 
            className={`tab-btn ${activeTab === 'parents' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('parents')}
          >
            for Dog Parents
          </button>
          <button 
            className={`tab-btn ${activeTab === 'business' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            for Businesses
          </button>
        </div>

        {activeTab === 'parents' ? (
          <div className="whats-else__cards">
            {/* Travel Guide Card */}
            <div className="feature-card">
              <div className="feature-card__number">1</div>
              <div className="feature-card__content">
                <h3 className="feature-card__title">Travel Guide</h3>
                <p className="feature-card__description">
                  Check travel requirements and documentation for destinations - all the essentials you need to visit the location to find exactly what you need.
                </p>
                <div className="feature-card__visual">
                  <img src="../../images/italy_travel.png" alt="Dog Travel Map" />
                </div>
              </div>
            </div>

            {/* Find Dog-Friendly Places Card */}
            <div className="feature-card">
              <div className="feature-card__number">2</div>
              <div className="feature-card__content">
                <h3 className="feature-card__title">Find Dog-Friendly Places</h3>
                <p className="feature-card__description">
                  Search nearby vets, groomers, dog parks, and pet-friendly cafes and restaurants - find exactly what you need, location to find exactly what you need.
                </p>
                <div className="feature-card__visual">
                  <img src="../../images/vets.png" alt="Dog Services" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="whats-else__cards">
            {/* Business Listing Card */}
            <div className="feature-card">
              <div className="feature-card__number">1</div>
              <div className="feature-card__content">
                <h3 className="feature-card__title">List Your Dog-Friendly Place</h3>
                <p className="feature-card__description">
                  Get verified & let dog owners discover you by searching for dog-friendly places across the UK.Create a professional listing for your dog-friendly hotel, café, restaurant, pub, cinema, holiday rental, or activity space. Showcase your amenities, upload photos, highlight your dog policy, and tell visitors what makes your venue special.
                </p>
                <div className="feature-card__visual">
                  <img src="../../images/hotels.png" alt="Business Listing" />
                </div>
              </div>
            </div>

            {/* Business Analytics Card */}
            <div className="feature-card">
              <div className="feature-card__number">2</div>
              <div className="feature-card__content">
                <h3 className="feature-card__title">Promote Your Dog Services</h3>
                <p className="feature-card__description">
                  Connect with dog parents looking for trusted pet services near them.
                  Whether you’re a dog groomer, vet, trainer, sitter, behaviourist, or pet shop, create a detailed business profile and start receiving enquiries from local dog owners.
                </p>
                <div className="feature-card__visual">
                  <img src="../../images/services1.png" alt="Business Analytics" />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Community Section */}
      <section className="community">
        <div className="community__devices">
          <img src="../../images/phone_mockup.png" alt="Forum on Mobile" className="community__device community__device--mobile" />
          <img src="../../images/ipad_mockup.png" alt="Forum on Tablet" className="community__device community__device--tablet" />
          <img src="../../images/macbook_mockup.png" alt="Forum on Desktop" className="community__device community__device--desktop" />
        </div>
        <div className="community__content">
          <h2 className="community__title">Dog-Parents Community</h2>
          <p className="community__description">
            Your go-to space for dog parenting advice, support, and friendship.
          </p>
          <p className="community__description">
            Share tips, ask questions, and connect with fellow dog parents. Understand the journey.
          </p>
          <button className="btn btn--primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Join Now
          </button>
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

export default HomePage;