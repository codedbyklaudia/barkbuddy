import React, { useEffect, useState } from 'react';
import './Article.scss';
import Footer from '../Footer';
import { Link } from 'react-router-dom';
import { Shirt, Music, Leaf, ScanFace, Volleyball, Clock9, PawPrint,ChevronsRight  } from 'lucide-react';


interface ArticlePageProps {
  onBack?: () => void;
}

const ArticleAnxiety: React.FC<ArticlePageProps> = ({ onBack }) => {
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
        <span className="article-nav__tag">Dog Behaviour</span>
      </nav>

      <header className="article-hero">
        <div className="article-hero__meta">
          <span className="article-hero__category">Dog Behaviour</span>
          <span className="article-hero__dot" />
          <span className="article-hero__read">7 min read</span>
          <span className="article-hero__dot" />
          <span className="article-hero__date">April 2026</span>
        </div>
        <h1 className="article-hero__title">
          Anxiety in dogs<br />
          <em>while travelling</em>
        </h1>
        <p className="article-hero__intro">
          Travel anxiety is one of the most common reasons owners leave their dogs at home. 
          It doesn't have to be. Understanding what's happening in your dog's mind - and body - 
          is the first step to making travel something they can actually handle.
        </p>
        <div className="article-hero__img-wrap">
          <img src="../images/dog_anxiety.avif" alt="Anxious dog during travel" className="article-hero__img" />
          <div className="article-hero__img-caption">Anxiety shows up differently in every dog - but the signs are learnable</div>
        </div>
      </header>

      <article className="article-body">

        <section className="article-section">
          <h2 className="article-section__heading">Why do dogs get anxious during travel?</h2>
          <p>
            Dogs are creatures of routine and territory. Travel disrupts both simultaneously - unfamiliar 
            smells, sounds, movement, confinement, and the loss of their safe space all stack up into 
            what the nervous system reads as a threat.
          </p>
          <p>
            For dogs that haven't been socialised to travel from a young age, a carrier or car journey 
            can trigger the same fight-or-flight response as a genuine danger. This isn't bad behaviour 
            - it's biology. And crucially, <strong>it can be changed</strong> with the right approach.
          </p>

          <div className="article-highlight-box">
            <h3>Signs of travel anxiety to watch for</h3>
            <div className="article-signs-grid">
              {[
                { level: 'Mild', color: '#58f396', signs: ['Yawning excessively', 'Lip licking', 'Whale eye (whites showing)', 'Refusing to enter carrier'] },
                { level: 'Moderate', color: '#f5d922', signs: ['Panting without heat', 'Trembling or shaking', 'Whining or vocalising', 'Drooling heavily'] },
                { level: 'Severe', color: '#dc2626', signs: ['Attempting to escape', 'Vomiting', 'Toileting accidents', 'Unresponsive to commands'] },
              ].map((group, i) => (
                <div className="article-signs-card" key={i} style={{ borderTopColor: group.color }}>
                  <span className="article-signs-card__level" style={{ color: group.color }}>{group.level}</span>
                  <ul>
                    {group.signs.map((s, j) => <li key={j}>{s}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="article-pullquote">
          "Your dog isn't being difficult. They're communicating the only way they know how."
        </div>

        <section className="article-section">
          <h2 className="article-section__heading">The desensitisation approach</h2>
          <p>
            The most effective long-term solution for travel anxiety is <strong>gradual desensitisation</strong> - 
            systematically exposing your dog to travel triggers at a low level, rewarding calm behaviour, 
            and building positive associations over time. This is not a quick fix. Start 4–6 weeks before 
            your trip if possible.
          </p>

          <div className="article-timeline">
            <div className="article-timeline__line" />
            {[
              { time: 'Week 1–2', label: 'Introduce the carrier', note: 'Leave the carrier open in a room your dog uses. Put treats and familiar blankets inside. Let them explore it on their own terms - never force entry.' },
              { time: 'Week 2–3', label: 'Meals inside the carrier', note: 'Feed your dog their regular meals just inside the carrier entrance, then gradually move the bowl further back over several days.' },
              { time: 'Week 3–4', label: 'Short confinement sessions', note: 'Close the door for 30 seconds while your dog eats. Gradually extend to 5, 10, 20 minutes. Only progress if they remain calm.' },
              { time: 'Week 4–5', label: 'Movement exposure', note: 'Carry the closed carrier around the house. Then short car journeys (5 minutes) to neutral destinations - not the vet.' },
              { time: 'Week 5–6', label: 'Build positive associations', note: 'Pair travel with things your dog loves - a favourite park, a friend they adore. The goal is "carrier = good things happen".' },
              { time: 'Pre-trip', label: 'Full dry run', note: 'Do a journey that mirrors your actual trip in length and environment. Observe and adjust your plan based on how they respond.' },
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

        <section className="article-section">
          <h2 className="article-section__heading">On the day - calming techniques that work</h2>

          <div className="article-tips">
            {[
              { emoji: <Shirt />, title: 'Worn clothing in the carrier', body: 'A T-shirt you\'ve slept in placed inside the carrier gives your dog your scent - one of the most powerful natural calming signals available.' },
              { emoji: <Music />, title: 'Calming music or white noise', body: 'Studies show that classical music and specifically composed dog-calming music (like iCalmDog) measurably reduce stress indicators in kennelled dogs. Use during the journey.' },
              { emoji: <Leaf />, title: 'Adaptil spray', body: 'Spray the inside of the carrier with Adaptil (dog-appeasing pheromone) 15 minutes before your dog gets in. It mimics the calming pheromones mother dogs produce for puppies.' },
              { emoji: <ScanFace />, title: 'Stay calm yourself', body: 'Dogs read your emotional state constantly. Anxious, fussing owners reinforce the idea that something is wrong. Practice your most bored, relaxed energy.' },
              { emoji: <Volleyball />, title: 'Familiar toy or blanket', body: 'Something that smells of home provides enormous comfort. Don\'t wash it before the trip.' },
              { emoji: <Clock9 />, title: 'Tire them out beforehand', body: 'A long walk or play session 2–3 hours before travel uses up nervous energy and makes rest more likely during the journey.' },
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
          <h2 className="article-section__heading">When to involve your vet</h2>
          <p>
            If your dog's anxiety is severe - vomiting, self-injury, complete shutdown - behavioural 
            modification alone may not be enough before your trip. A vet can prescribe short-term 
            anxiolytics (like trazodone or gabapentin) that are safe for travel and won't cause the 
            balance or temperature issues that older sedatives did.
          </p>
          <p>
            This isn't a failure - it's a tool. Many dogs need pharmaceutical support alongside 
            behavioural training, just as some humans need both therapy and medication for anxiety.
          </p>

          <div className="article-callout">
            <span className="article-callout__icon"><PawPrint /></span>
            <div>
              <strong>Find a behaviorist near you!</strong>
              <p>Looking for a vet who specialises in behavioural anxiety? Use BarkBuddy's service finder to find qualified professionals near you.</p>
              <Link to="/service-finder" className="article-callout__btn">
                Find a behaviourist near you <ChevronsRight />
              </Link>
            </div>
          </div>
        </section>

        <section className="article-section">
          <h2 className="article-section__heading">The bigger picture</h2>
          <p>
            Travel anxiety rarely gets better on its own - but it also rarely has to stay. Dogs that 
            were genuinely phobic of travel at age two have become relaxed, experienced travellers by 
            age five with patient, consistent work. The investment is worth it.
          </p>
          <p>
            Start small. Go slow. Celebrate every tiny win. And remember that the goal isn't a dog 
            that loves travel - it's a dog that can <em>cope</em> with it.
          </p>
        </section>

      </article>
      <Footer />
    </div>
  );
};

export default ArticleAnxiety;