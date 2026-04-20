import React from 'react';
import './HeroSection.scss';
import { Link } from 'react-router-dom';
import { ChevronsRight } from 'lucide-react';

interface ImageItem {
  id: number;
  src: string;
  alt: string;
  priority?: boolean;
}

const column1Images: ImageItem[] = [
  { id: 1, src: '../../images/labrador.webp',    alt: 'Labrador',        priority: true  },
  { id: 2, src: '../../images/pug.webp',         alt: 'Pug',             priority: false },
  { id: 7, src: '../../images/husky.webp',       alt: 'Husky',           priority: false },
];

const column2Images: ImageItem[] = [
  { id: 3, src: '../../images/border-collie.webp', alt: 'Border Collie',   priority: true  },
  { id: 4, src: '../../images/corgi.webp',          alt: 'Corgi',           priority: false },
  { id: 8, src: '../../images/mixed-breed.webp',    alt: 'Mixed-breed dog', priority: false },
];

const HeroSection: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__title">
          Everything Dog Parents Need:<br />
          Care, Services, &amp; Travel
        </h1>
        <p className="hero__subtitle">Begin a lifetime of happiness with your dog!</p>
        <div className="hero__home-buttons">
          <Link to="/service-finder" className="btn1 btn1--1">
            Service Finder
            <ChevronsRight size={16} />
          </Link>
          <Link to="/travel-page" className="btn1 btn1--2">
            Travel Guide
            <ChevronsRight size={16} />
          </Link>
        </div>
      </div>

      {/* Right Side - Animated Image Grid */}
      <div className="hero-images">

        {/* Row 1 - Scrolls Right */}
        <div className="image-row scroll-right">
          <div className="scroll-content">
            {[...column1Images, ...column1Images, ...column1Images].map((image, index) => {
              const isFirst = index < column1Images.length && image.priority;
              return (
                <div key={`row1-${index}`} className="image-card">
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading={isFirst ? 'eager' : 'lazy'}
                    decoding={isFirst ? 'sync' : 'async'}
                    fetchPriority={isFirst ? 'high' : 'low'}
                    width={220}
                    height={280}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2 - Scrolls Left */}
        <div className="image-row scroll-left">
          <div className="scroll-content">
            {[...column2Images, ...column2Images, ...column2Images].map((image, index) => {
              const isFirst = index < column2Images.length && image.priority;
              return (
                <div key={`row2-${index}`} className="image-card">
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading={isFirst ? 'eager' : 'lazy'}
                    decoding={isFirst ? 'sync' : 'async'}
                    fetchPriority={isFirst ? 'high' : 'low'}
                    width={220}
                    height={280}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Blur/Vignette Overlay */}
        <div className="hero-images__overlay" />
      </div>
    </section>
  );
};

export default HeroSection;