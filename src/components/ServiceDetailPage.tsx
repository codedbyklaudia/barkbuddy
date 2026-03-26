import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ServiceDetailPage.scss';
import Footer from './Footer';
import { formatServiceType } from '../utils/formatservicetype';
import { SquarePen, TicketPercent, Star, Info, Search, CheckCircle, AlertCircle, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSaved } from '../context/SavedContext';

const API_BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Business {
  id: number;
  business_name: string;
  type: string;
  category: string;
  address: string;
  postcode: string;
  lat?: number;
  lng?: number;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  description?: string;
  status: string;
  is_new: boolean;
  distance_km?: number;
  created_at?: string;
  approved_at?: string;
}

interface Photo {
  id: number;
  cloudinary_url: string;
  caption?: string;
  is_primary: boolean;
}

interface Review {
  id: number;
  user_name: string;
  user_email?: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Statistics {
  average_rating: number | string;
  total_reviews: number;
}

// ─── Star rating display ──────────────────────────────────────────────────────

const StarRow = ({ rating, size = 16 }: { rating: number; size?: number }) => (
  <>
    {[...Array(5)].map((_, i) => (
      <span key={i} className={i < Math.round(rating) ? 'star-filled' : 'star-empty'}>
        <Star size={size} />
      </span>
    ))}
  </>
);

// ─── Interactive star picker ──────────────────────────────────────────────────

const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="rating-picker" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className="rating-picker__star"
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <svg
            viewBox="0 0 24 24"
            width="32"
            height="32"
            fill={display >= star ? '#f59e0b' : 'none'}
            stroke={display >= star ? '#f59e0b' : '#d1d5db'}
            strokeWidth="1.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
};

// ─── Save button component ────────────────────────────────────────────────────

const SaveButton: React.FC<{
  business: Business;
  averageRating: number;
  variant?: 'sidebar' | 'header';
}> = ({ business, averageRating, variant = 'sidebar' }) => {
  const { isSaved, toggleService } = useSaved();
  const saved = isSaved(String(business.id));
  const [popped, setPopped] = useState(false);

  const handleSave = () => {
    toggleService({
      id:       String(business.id),
      title:    business.business_name,
      category: formatServiceType(business.type),
      address:  `${business.address}, ${business.postcode}`,
      rating:   averageRating > 0 ? averageRating : undefined,
    });
    // Pop animation feedback
    setPopped(true);
    setTimeout(() => setPopped(false), 400);
  };

  if (variant === 'header') {
    return (
      <button
        className={`sdp-save-header${saved ? ' sdp-save-header--saved' : ''}${popped ? ' sdp-save-header--pop' : ''}`}
        onClick={handleSave}
        aria-label={saved ? 'Remove from saved' : 'Save this listing'}
        title={saved ? 'Remove from saved' : 'Save this listing'}
      >
        <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
        <span>{saved ? 'Saved' : 'Save'}</span>
      </button>
    );
  }

  return (
    <button
      className={`__but __but--save${saved ? ' __but--save-active' : ''}${popped ? ' __but--save-pop' : ''}`}
      onClick={handleSave}
      aria-label={saved ? 'Remove from saved' : 'Save this listing'}
    >
      <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
      <span>{saved ? 'Saved ✓' : 'Save listing'}</span>
    </button>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const ServiceDetailPage: React.FC = () => {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();

  // Page data
  const [business, setBusiness]     = useState<Business | null>(null);
  const [photos, setPhotos]         = useState<Photo[]>([]);
  const [reviews, setReviews]       = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({ average_rating: 0, total_reviews: 0 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Auth
  const { token, logout, user, isLoading: authLoading } = useAuth();
  const isLoggedIn = !!token;

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating]       = useState(0);
  const [reviewComment, setReviewComment]     = useState('');
  const [submitting, setSubmitting]           = useState(false);
  const [reviewError, setReviewError]         = useState('');
  const [reviewSuccess, setReviewSuccess]     = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res  = await fetch(`${API_BASE}/listings/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const { business: b, photos: p, reviews: r, statistics: s } = data;
        if (!b?.id) { setError('Business not found'); return; }
        setBusiness(b);
        setPhotos(p || []);
        setReviews(r || []);
        setStatistics(s || { average_rating: 0, total_reviews: 0 });
      } catch (e) {
        setError('Failed to load business details');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Refresh stats ─────────────────────────────────────────────────────────

  const refreshStats = useCallback(async () => {
    if (!id) return;
    try {
      const res  = await fetch(`${API_BASE}/reviews/business/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setStatistics(data.statistics || { average_rating: 0, total_reviews: 0 });
    } catch (e) {
      console.error('Could not refresh stats', e);
    }
  }, [id]);

  // ── Review modal ──────────────────────────────────────────────────────────

  const handleOpenReview = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setReviewRating(0);
    setReviewComment('');
    setReviewError('');
    setReviewSuccess(false);
    setShowReviewModal(true);
  };

  const handleCloseReview = () => {
    setShowReviewModal(false);
    setTimeout(() => { setReviewError(''); setReviewSuccess(false); }, 300);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) { setReviewError('Please select a star rating.'); return; }
    if (!reviewComment.trim()) { setReviewError('Please write a comment before submitting.'); return; }
    if (reviewComment.trim().length < 10) { setReviewError('Comment must be at least 10 characters.'); return; }
    if (!token) { navigate('/login'); return; }

    try {
      setSubmitting(true);
      setReviewError('');
      const res  = await fetch(`${API_BASE}/reviews`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ business_id: Number(id), rating: reviewRating, comment: reviewComment.trim() }),
      });
      const data = await res.json();
      if (res.status === 401) { logout(); navigate('/login'); return; }
      if (!res.ok) { setReviewError(data.error || data.message || 'Failed to submit review. Please try again.'); return; }

      const newReview: Review = {
        ...(data.review ?? data),
        user_name: (data.review ?? data).user_name || user?.name || 'You',
      };
      setReviews(prev => [newReview, ...prev]);
      await refreshStats();
      setReviewSuccess(true);
      setTimeout(() => handleCloseReview(), 2000);
    } catch (e) {
      console.error('Review submit error:', e);
      setReviewError('Network error — please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Lightbox ──────────────────────────────────────────────────────────────

  const openLightbox  = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const navigateLightbox = useCallback((dir: 1 | -1) => {
    setLightboxIndex(prev =>
      prev === null ? null : (prev + dir + photos.length) % photos.length
    );
  }, [photos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navigateLightbox(1);
      if (e.key === 'ArrowLeft')  navigateLightbox(-1);
      if (e.key === 'Escape')     closeLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, navigateLightbox]);

  // ── Guards ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="activity-details">
      <div className="activity-details__loading">
        <div className="loading-spinner" />
        <p>Loading business details…</p>
      </div>
      <Footer />
    </div>
  );

  if (error || !business) return (
    <div className="activity-details">
      <div className="activity-details__error">
        <h2>Oops! {error || 'Business not found'}</h2>
        <button onClick={() => navigate(-1)}>← Go back</button>
      </div>
      <Footer />
    </div>
  );

  // ── Derived values ────────────────────────────────────────────────────────

  const primaryPhoto  = photos.find(p => p.is_primary) || photos[0];
  const otherPhotos   = photos.filter(p => p !== primaryPhoto);
  const averageRating = Number(statistics.average_rating) || 0;
  const totalReviews  = statistics.total_reviews || 0;
  const currentPhoto  = lightboxIndex !== null ? photos[lightboxIndex] : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="activity-details">

      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span onClick={() => navigate('/')}>Home</span>
        <span>›</span>
        <span onClick={() => navigate('/finder')}>Finder</span>
        <span>›</span>
        <span>Details</span>
      </nav>

      <section className="activity-details__content">

        {/* ── Left column ── */}
        <div className="activity-details__info">

          {/* Header — type badge + title + save button in one row */}
          <div className="activity-details__header-info">
            <div className="activity-details__header-top">
              <span className="activity-details__type-badge">
                {formatServiceType(business.type)}
              </span>
              {/* Save button — header variant, always visible */}
              <SaveButton
                business={business}
                averageRating={averageRating}
                variant="header"
              />
            </div>

            <h1 className="activity-details__title">{business.business_name}</h1>
            <p className="activity-details__details-address">{business.address}, {business.postcode}</p>
            {business.is_new && (
              <span className="activity-details__new-badge">
                <i className="bi bi-patch-check" /> New on BarkBuddy
              </span>
            )}
          </div>

          {/* Photo hero */}
          {photos.length > 0 && (
            <div className="activity-details__photo-hero">
              <div
                className="photo-hero__main"
                onClick={() => primaryPhoto && openLightbox(photos.indexOf(primaryPhoto))}
                role="button"
                aria-label="Open photo"
              >
                {primaryPhoto && (
                  <img src={primaryPhoto.cloudinary_url} alt={business.business_name} />
                )}
                <div className="photo-hero__main-overlay">
                  <span className="photo-hero__zoom-icon"><Search size={46} /></span>
                </div>
              </div>

              <div className="photo-hero__grid">
                {otherPhotos.slice(0, 4).map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="photo-hero__thumb"
                    onClick={() => openLightbox(photos.indexOf(photo))}
                    role="button"
                    aria-label={`Open photo ${idx + 2}`}
                  >
                    <img src={photo.cloudinary_url} alt={`${business.business_name} photo ${idx + 2}`} />
                    {idx === 3 && photos.length > 5 && (
                      <div className="photo-hero__more-overlay">+{photos.length - 5} more</div>
                    )}
                  </div>
                ))}
                {photos.length > 5 && (
                  <div className="photo-hero__more-pill" onClick={() => openLightbox(5)} role="button">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    {photos.length - 5} more photos
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Venue details */}
          <div className="activity-details__details">
            <div className="detail-item">
              <span className="detail-item__icon"><i className="bi bi-pin-map" /></span>
              <div>
                <p className="detail-item__label">Venue Address</p>
                <p className="detail-item__value">{business.address}, {business.postcode}</p>
              </div>
            </div>
            {business.contact_phone && (
              <div className="detail-item">
                <span className="detail-item__icon"><i className="bi bi-telephone" /></span>
                <div>
                  <p className="detail-item__label">Phone</p>
                  <a href={`tel:${business.contact_phone}`} className="detail-item__value detail-item__value--link">
                    {business.contact_phone}
                  </a>
                </div>
              </div>
            )}
            {business.contact_email && (
              <div className="detail-item">
                <span className="detail-item__icon"><i className="bi bi-envelope-open-heart" /></span>
                <div>
                  <p className="detail-item__label">Contact Email</p>
                  <a href={`mailto:${business.contact_email}`} className="detail-item__value detail-item__value--link">
                    {business.contact_email}
                  </a>
                </div>
              </div>
            )}
            {business.website && (
              <div className="detail-item">
                <span className="detail-item__icon"><i className="bi bi-browser-safari" /></span>
                <div>
                  <p className="detail-item__label">Website</p>
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="detail-item__value detail-item__value--link">
                    Visit website <i className="bi bi-box-arrow-up-right" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {business.description && (
            <div className="activity-details__description">
              <h2><Info size={18} /> About the place</h2>
              <p>{business.description}</p>
            </div>
          )}

          {/* Reviews card */}
          <div className="activity-details__reviews-card">
            <div className="reviews-header">
              <h3>Reviews ({totalReviews})</h3>
              <div className="reviews-rating">
                <span className="rating-stars"><StarRow rating={averageRating} /></span>
                <span className="rating-number">{averageRating.toFixed(1)}</span>
              </div>
            </div>

            <button
              className="activity-details__review-btn"
              onClick={handleOpenReview}
              disabled={authLoading}
            >
              <SquarePen size={16} />
              {authLoading ? 'Loading…' : isLoggedIn ? 'Leave a Review' : 'Sign in to Review'}
            </button>

            <div className="reviews-list">
              {reviews.length === 0 ? (
                <p className="reviews-empty">No reviews yet. Be the first!</p>
              ) : reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <p className="review-author">{review.user_name}</p>
                    <div className="review-rating"><StarRow rating={review.rating} size={13} /></div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <p className="review-date">
                    {new Date(review.created_at).toLocaleDateString('en-GB', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <aside className="activity-details__sidebar">
          <div className="activity-details__cta">
            {business.website ? (
              <a className="__but" href={business.website} target="_blank" rel="noopener noreferrer">
                <TicketPercent size={16} /><span>Book / Visit Site</span>
              </a>
            ) : business.contact_email ? (
              <a className="__but" href={`mailto:${business.contact_email}`}>
                <TicketPercent size={16} /><span>Enquire to Book</span>
              </a>
            ) : business.contact_phone ? (
              <a className="__but" href={`tel:${business.contact_phone}`}>
                <TicketPercent size={16} /><span>Call to Book</span>
              </a>
            ) : null}

            {/* Write a review */}
            <button className="__but" onClick={handleOpenReview} disabled={authLoading}>
              <SquarePen size={16} />
              <span>{authLoading ? 'Loading…' : isLoggedIn ? 'Write a Review' : 'Sign in to Review'}</span>
            </button>

            {/* Save listing — sidebar variant */}
            <SaveButton
              business={business}
              averageRating={averageRating}
              variant="sidebar"
            />
          </div>

          {/* Extra gallery thumbs */}
          {otherPhotos.length > 4 && (
            <div className="activity-details__gallery">
              <div className="gallery-grid">
                {otherPhotos.slice(4).map((photo, idx) => (
                  <div key={photo.id} className="gallery-item" onClick={() => openLightbox(photos.indexOf(photo))}>
                    <img src={photo.cloudinary_url} alt={`${business.business_name} photo ${idx + 6}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>

      {/* ── Review modal ── */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={handleCloseReview}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>How was your experience at {business.business_name}?</h2>
              <button className="modal-close" onClick={handleCloseReview} aria-label="Close">✕</button>
            </div>
            {reviewSuccess ? (
              <div className="review-form__success">
                <CheckCircle size={48} />
                <p>Thank you for your review!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="review-form" noValidate>
                <div className="review-form__group">
                  <label>Your rating</label>
                  <StarPicker value={reviewRating} onChange={setReviewRating} />
                  {reviewRating === 0 && <span className="review-form__rating-hint">Click a star to rate</span>}
                </div>
                <div className="review-form__group">
                  <label htmlFor="review-comment">Your review</label>
                  <textarea
                    id="review-comment"
                    value={reviewComment}
                    onChange={e => { setReviewComment(e.target.value); if (reviewError) setReviewError(''); }}
                    placeholder="Share your experience… (min 10 characters)"
                    rows={5}
                    className="review-form__textarea"
                    maxLength={1000}
                    disabled={submitting}
                  />
                  <span className="review-form__char-count">{reviewComment.length} / 1000</span>
                </div>
                {reviewError && (
                  <p className="review-form__error"><AlertCircle size={14} /> {reviewError}</p>
                )}
                <div className="review-form__actions">
                  <button type="button" className="review-form__cancel" onClick={handleCloseReview} disabled={submitting}>Cancel</button>
                  <button type="submit" className="review-form__submit" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {currentPhoto && lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox__close" onClick={closeLightbox} aria-label="Close">✕</button>
            {photos.length > 1 && (
              <button className="lightbox__nav lightbox__nav--prev" onClick={() => navigateLightbox(-1)} aria-label="Previous photo">‹</button>
            )}
            <img key={lightboxIndex} src={currentPhoto.cloudinary_url} alt={business.business_name} className="lightbox__img" />
            {photos.length > 1 && (
              <button className="lightbox__nav lightbox__nav--next" onClick={() => navigateLightbox(1)} aria-label="Next photo">›</button>
            )}
            <div className="lightbox__footer">
              {currentPhoto.caption && <p className="lightbox__caption">{currentPhoto.caption}</p>}
              <p className="lightbox__counter">{lightboxIndex + 1} / {photos.length}</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ServiceDetailPage;