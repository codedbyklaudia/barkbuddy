import React, { useEffect, useState } from 'react';
import './HeroSection.scss';
import { Link } from 'react-router-dom';

interface ImageItem {
  id: number;
  src: string;
  alt: string;
}

const HeroSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const column1Images: ImageItem[] = [
    { id: 1, src: '../../images/labrador.webp', alt: 'Labrador' },
    { id: 2, src: '../../images/pug.webp', alt: 'Pug' },
    { id: 7, src: '../../images/husky.webp', alt: 'Husky' }
  ];

  const column2Images: ImageItem[] = [
    { id: 3, src: '../../images/border-collie.webp', alt: 'Border Collie' },
    { id: 4, src: '../../images/corgi.webp', alt: 'Corgi' },
    { id: 8, src: '../../images/mixed-breed.webp', alt: 'Mixed-breed dog' }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__title">
          Everything Dog Parents Need:<br />
          Care, Services, & Travel
        </h1>
        <p className="hero__subtitle">Begin a lifetime of happiness with your dog!</p>
        <div className="hero__home-buttons">
          <Link to="/service-finder" className="btn1 btn1--1">
            Service Finder
            <i className="bi bi-chevron-double-right"></i>
          </Link>

          <Link to="/travel-page" className="btn1 btn1--2">
            Travel Guide
            <i className="bi bi-chevron-double-right"></i>
          </Link>
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