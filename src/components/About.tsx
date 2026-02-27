import React from "react";
import { Link } from "react-router-dom";
import "./About.scss";
import Footer from "./Footer";

// ─── Feature item 
interface FeatureItemProps {
  icon: string;
  text: string;
}
const FeatureItem: React.FC<FeatureItemProps> = ({ icon, text }) => (
  <li className="about-feature-item">
    <img src={icon} alt="" className="about-feature-item__icon" />
    <span>{text}</span>
  </li>
);

// ─── Vision item 
const VisionItem: React.FC<{ text: string; index: number }> = ({ text, index }) => (
  <div className="about-vision-item" style={{ animationDelay: `${index * 0.1}s` }}>
    <div className="about-vision-item__num">{String(index + 1).padStart(2, "0")}</div>
    <p>{text}</p>
  </div>
);

// ─── Page 
const About: React.FC = () => {
  return (
    <div className="about-page">

      {/* ── Hero  */}
      <section className="about-hero">
        <div className="about-hero__bg-glow" aria-hidden="true" />
        <div className="about-hero__inner">
          <div className="about-hero__eyebrow">
            <img src="/images/paint/dog-friendly.png" alt="" />
            Our Story
          </div>
          <h1 className="about-hero__title">
            About<br /><em>BarkBuddy</em>
          </h1>
          <p className="about-hero__sub">
            Built from real experiences, real frustrations,<br />
            and real love for dogs.
          </p>
        </div>
        <div className="about-hero__paw" aria-hidden="true">
          <img src="/images/paint/dog-friendly.png" alt="" />
        </div>
      </section>

      {/* ── Story section  */}
      <section className="about-story">
        <div className="about-story__inner">

          {/* Left column — text */}
          <div className="about-story__text">
            <span className="about-section-label">Hi, I'm Klaudia</span>
            <h2 className="about-section-title">
              The founder, designer<br />and developer of BarkBuddy
            </h2>
            <p>
              Like many of you, I'm first and foremost a proud dog parent. Nox - my
              black and white-coated mix of border collie and corgi - is the reason BarkBuddy exists.
            </p>
            <p>
              BarkBuddy started with a simple question:
            </p>
            <blockquote className="about-story__quote">
              Why is it so hard to find reliable dog care & travel informations, services and dog-friendly places?
            </blockquote>
            <p>
              When I became a dog parent, I quickly realised how overwhelming everything
              felt. Endless articles. Conflicting advice. Expensive vet visits for
              questions that could have been prevented with better guidance. And finding
              trusted local services? That meant jumping between maps, social media
              groups, and random websites. Not mention about dog-friendly restaurants or places! Calling the place every time to ask whether they accept dogs, No! And then another one.. and another...
            </p>
            <p>
              I knew there had to be a better way - so I built BarkBuddy.
            </p>
          </div>

          {/* Right column — photo */}
          <div className="about-story__photo-wrap">
            <div className="about-photo about-photo--portrait">
              <div className="about-photo__placeholder">
                <img src="../../images/klaudia+nox.jpeg" alt="Klaudia and Nox" />
              </div>
              <div className="about-photo__frame" aria-hidden="true" />
            </div>
          </div>

        </div>
      </section>

      {/* ── Divider  */}
      <div className="about-divider" aria-hidden="true">
        <div className="about-divider__line" />
        <img src="/images/paint/dog-friendly.png" alt="" className="about-divider__icon" />
        <div className="about-divider__line" />
      </div>

      {/* ── Mission  */}
      <section className="about-mission">
        <div className="about-mission__inner">

          {/* Photo — left */}
          <div className="about-story__photo-wrap about-story__photo-wrap--left">
            <div className="about-photo about-photo--landscape">
              <div className="about-photo__placeholder">
                <img src="/images/paint/dog-friendly.png" alt="" />
                <p>A walk, park moment, or playful picture</p>
              </div>
              <div className="about-photo__frame" aria-hidden="true" />
            </div>
          </div>

          {/* Text — right */}
          <div className="about-mission__text">
            <span className="about-section-label">The Mission</span>
            <h2 className="about-section-title">
              Making dog parenting easier, smarter, and more connected
            </h2>
            <p>
              BarkBuddy exists to support dog parents at every stage of the journey -
              from the overwhelming first weeks to the confident routines that come later.
            </p>
            <div className="about-mission__belief">
              <p>
                I believe every dog deserves informed care - and every dog parent
                deserves simple tools to provide it.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── How it works  */}
      <section className="about-how">
        <div className="about-how__inner">
          <div className="about-how__header">
            <span className="about-section-label">How BarkBuddy Works</span>
            <h2 className="about-section-title">
              A growing experience,<br />designed for you
            </h2>
            <p className="about-how__sub">
              BarkBuddy is designed to give value immediately - and grow with you.
            </p>
          </div>

          <div className="about-how__tiers">

            {/* Tier 1 */}
            <div className="about-tier about-tier--free">
              <div className="about-tier__header">
                <div className="about-tier__icon">
                  <img src="/images/paint/dog-friendly.png" alt="" />
                </div>
                <div>
                  <h3 className="about-tier__title">Explore Freely</h3>
                  <p className="about-tier__sub">No account required</p>
                </div>
              </div>
              <ul className="about-tier__list">
                <FeatureItem icon="/images/icons/grooming.svg" text="Dog care tips" />
                <FeatureItem icon="/images/icons/plane.svg"    text="Travel guide" />
                <FeatureItem icon="/images/icons/dog-friendly.svg" text="Dog-friendly locations" />
                <FeatureItem icon="/images/icons/services.svg" text="Local services directory" />
              </ul>
            </div>

            {/* Arrow connector */}
            <div className="about-how__arrow" aria-hidden="true">
              <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
                <path d="M8 20h24M22 12l10 8-10 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Tier 2 */}
            <div className="about-tier about-tier--account">
              <div className="about-tier__header">
                <div className="about-tier__icon">
                  <img src="/images/paint/dog-owners.png" alt="" />
                </div>
                <div>
                  <h3 className="about-tier__title">Unlock Personalised Features</h3>
                  <p className="about-tier__sub">Free account</p>
                </div>
              </div>
              <ul className="about-tier__list">
                <FeatureItem icon="/images/icons/health.svg"     text="Age-personalised care tips" />
                <FeatureItem icon="/images/icons/grooming.svg"   text="Health calendar & reminders" />
                <FeatureItem icon="/images/icons/services.svg"   text="Custom recommendations" />
                <FeatureItem icon="/images/icons/dog-friendly.svg" text="Save favourite services" />
                <FeatureItem icon="/images/icons/more.svg"       text="Community forum" />
                <FeatureItem icon="/images/icons/care.svg"       text="Android app with walk tracker" />
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ── Vision  */}
      <section className="about-vision">
        <div className="about-vision__inner">
          <div className="about-vision__header">
            <span className="about-section-label about-section-label--light">The Bigger Vision</span>
            <h2 className="about-section-title about-section-title--light">
              BarkBuddy isn't just a website
            </h2>
            <p className="about-vision__sub">
              It's a growing system - designed to make life genuinely better for
              dog parents and their dogs.
            </p>
          </div>

          <div className="about-vision__grid">
            {[
              "Support responsible dog parenting",
              "Reduce stress and confusion",
              "Build a global dog-parent community",
              "Provide personalised insights through our mobile application",
            ].map((text, i) => (
              <VisionItem key={i} text={text} index={i} />
            ))}
          </div>

          <p className="about-vision__note">
            Our website serves as the entry point - offering immediate value — while
            the BarkBuddy mobile app delivers advanced personalisation and smart
            features for each dog.
          </p>
        </div>
      </section>

      {/* ── Closing  */}
      <section className="about-closing">
        <div className="about-closing__inner">
          <div className="about-closing__paw" aria-hidden="true">
            <img src="/images/paint/dog-friendly.png" alt="" />
          </div>
          <h2 className="about-closing__title">
            Built with love - for us, the dog parents
          </h2>
          <p className="about-closing__body">
            BarkBuddy was built from real experiences, real frustrations, and real love
            for dogs. This isn't just a project - it's a passion.
          </p>
          <p className="about-closing__tagline">
            Every feature is designed with one goal in mind:
          </p>
          <p className="about-closing__highlight">
            To make life better for you and your bark buddy.
          </p>
          <div className="about-closing__cta">
            <Link to="/register" className="about-cta-btn about-cta-btn--primary">
              Join BarkBuddy - it's free
            </Link>
            <Link to="/" className="about-cta-btn about-cta-btn--secondary">
              Explore the platform
            </Link>
          </div>
        </div>
      </section>
     <Footer />

    </div>
  );
};

export default About;