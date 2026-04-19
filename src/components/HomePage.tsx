import React, { useState } from 'react';
import './HomePage.scss';
import HeroSection from './HeroSection';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'parents' | 'business'>('parents');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      question: "Can I use the Forum without an app?",
      answer: "Yes! The Forum is accessible for all registred users, both through our website and in the future in the mobile app. You can join discussions, ask questions, and connect with other dog parents from any device."
    },
    {
      question: "What does the app will have that is not on the website?",
      answer: "The app will offer personalized reminders, offline access to saved content, age-specific care reminders, walk tracker and a more streamlined mobile experience for on-the-go dog parents."
    },
    {
      question: "How can I download the app?",
      answer: "The BarkBuddy app is currently under development and is expected to launch in mid-August 2026. Upon release, it will be available for download on the Google Play Store for Android devices."
    }
  ];

  return (
    <div className="home-page">
      <HeroSection />

      {/* App Features Section */}
      <section className="app-features">
        <div className="app-features__content">
          <span className="app-features__eyebrow">Coming Soon</span>
          <h2 className="app-features__title">BarkBuddy Android App</h2>
          <p className="app-features__description">
            Smarter care for every breed and age. <br /> Explore breed-based care tips anytime.
          </p>
          <p className="app-features__description">
            BarkBuddy Android App is coming soon to access personalised nutrition and care recommendations + walk &amp; health tracker!
          </p>
        </div>
        <div className="app-features__preview">
          <div className="app-features__phone-mockup">
            <img
              src="../../images/google-store.webp"
              alt="BarkBuddy App Preview"
              loading="lazy"
              decoding="async"
              width={320}
              height={400}
            />
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
                  Check travel requirements and documentation for destinations - all the essentials you need to visit the locations you want to travel to!
                </p>
                <div className="feature-card__visual">
                  <img
                    src="../../images/italy_travel.png"
                    alt="Dog Travel Map"
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={300}
                  />
                </div>
              </div>
            </div>

            {/* Find Dog-Friendly Places Card */}
            <div className="feature-card">
              <div className="feature-card__number">2</div>
              <div className="feature-card__content">
                <h3 className="feature-card__title">Find Dog-Friendly Places</h3>
                <p className="feature-card__description">
                  Search nearby vets, groomers, dog parks, and pet-friendly cafes and restaurants - find exactly what you need, near your location!
                </p>
                <div className="feature-card__visual">
                  <img
                    src="../../images/vets.png"
                    alt="Dog Services"
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={300}
                  />
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
                  Get verified &amp; let dog owners discover you by searching for dog-friendly places across the UK. Create a professional listing for your dog-friendly hotel, café, restaurant, pub, cinema, holiday rental, or activity space. Showcase your amenities, upload photos, highlight your dog policy, and tell visitors what makes your venue special.
                </p>
                <div className="feature-card__visual">
                  <img
                    src="../../images/hotels.webp"
                    alt="Business Listing"
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={300}
                  />
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
                  Whether you're a dog groomer, vet, trainer, sitter, behaviourist, or pet shop, create a detailed business profile and start receiving enquiries from local dog owners.
                </p>
                <div className="feature-card__visual">
                  <img
                    src="../../images/services1.png"
                    alt="Business Analytics"
                    loading="lazy"
                    decoding="async"
                    width={400}
                    height={300}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Community Section */}
      <section className="community">
        <div className="community__devices">
          <img
            src="../../images/mockup.webp"
            alt="Forum on Tablet"
            className="community__device community__device--tablet"
            loading="lazy"
            decoding="async"
            width={600}
            height={400}
          />
        </div>
        <div className="community__content">
          <h2 className="community__title">Dog-Parents Community</h2>
          <p className="community__description">
            Your go-to space for dog parenting advice, support, and friendship.
          </p>
          <p className="community__description">
            Share tips, ask questions, and connect with fellow dog parents. Understand the journey.
          </p>
          <Link to="/forum-page" className="btn btn--primary">
            Join Now <MessageSquare size={16} />
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq">
        <h2 className="faq__title">Your questions, answered!</h2>
        <p className="faq__subtitle">Read more of FAQ <Link to="/faq" className="faq__link">here</Link>.</p>

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
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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