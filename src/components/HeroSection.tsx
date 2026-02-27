import React, { useEffect, useState } from 'react';
import './HeroSection.scss';

interface ImageItem {
  id: number;
  src: string;
  alt: string;
}

const HeroSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const column1Images: ImageItem[] = [
    { id: 1, src: '../../images/labrador.jpg', alt: 'Image 1' },
    { id: 2, src: '../../images/pug.jpg', alt: 'Image 4' },
    { id: 7, src: '../../images/husky.jpg', alt: 'Image 7' }
  ];

  const column2Images: ImageItem[] = [
    { id: 3, src: '../../images/border-collie.jpg', alt: 'Image 2' },
    { id: 4, src: '../../images/corgi.jpg', alt: 'Image 5' },
    { id: 8, src: '../../images/mixed-breed.jpg', alt: 'Image 8' }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__title">
          Everything Dog Parents Need:<br />
          Care, Services, Travel & Activities
        </h1>
        <p className="hero__subtitle">Begin a lifetime of happiness with your dog!</p>
        <div className="hero__cta-buttons">
          <button className="btn btn--primary">
            Service Finder
            <svg className="btn__icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="btn btn--secondary">
            Explore Activities
            <svg className="btn__icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Right Side - Animated Image Grid */}
      <div className="hero-images">
        {/* Row 1 - Scrolls Right */}
        <div className="image-row scroll-right">
          <div className="scroll-content">
            {[...column1Images, ...column1Images, ...column1Images].map((image, index) => (
              <div key={`row1-${index}`} className="image-card">
                <img src={image.src} alt={image.alt} />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - Scrolls Left */}
        <div className="image-row scroll-left">
          <div className="scroll-content">
            {[...column2Images, ...column2Images, ...column2Images].map((image, index) => (
              <div key={`row2-${index}`} className="image-card">
                <img src={image.src} alt={image.alt} />
              </div>
            ))}
          </div>
        </div>

        {/* Blur/Vignette Overlay */}
        <div className="hero-images__overlay"></div>
      </div>
    </section>
  );
};

export default HeroSection;