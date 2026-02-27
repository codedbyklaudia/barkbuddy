import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ServiceFinder.scss';
import Footer from './Footer';

const API_BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
const GOOGLE_MAPS_KEY: string = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '';

// Types
interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  address: string;
  city: string;
  postcode: string;
  phone?: string;
  website?: string;
  image_url: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  lat: number;
  lng: number;
  distance_km?: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface AutocompleteItem {
  label: string;
  type: string;
  city?: string;
  count?: number;
}

interface Filters {
  radius: number;
  minRating: number;
  verifiedOnly: boolean;
}

const SERVICE_CATEGORIES = [
  { icon: '/images/icons/grooming.svg', label: 'Grooming' },
  { icon: '/images/pet_shop_icon.png', label: 'Pet shops' },
  { icon: '/images/icons/health.svg', label: 'Vet Clinics' },
  { icon: '/images/icons/training.svg', label: 'Behaviorists' },
];

// Google Maps loader
let mapsLoaded = false;
let mapsCallbacks: (() => void)[] = [];

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (mapsLoaded) { resolve(); return; }
    mapsCallbacks.push(resolve);
    if (document.getElementById('google-maps-script')) return;
    (window as any).__onGoogleMapsLoad = () => {
      mapsLoaded = true;
      mapsCallbacks.forEach((cb) => cb());
      mapsCallbacks = [];
    };
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__onGoogleMapsLoad`;
    script.async = true;
    document.head.appendChild(script);
  });
}

// StarRating
const StarRating: React.FC<{ rating: number; count: number }> = ({ rating, count }) => (
  <div className="listing-card__rating">
    <span className="stars">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
    <span className="count">({count})</span>
  </div>
);

// Map
const ServiceMap: React.FC<{
  listings: Listing[];
  userLocation: { lat: number; lng: number } | null;
}> = ({ listings, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const infoWindow = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_KEY) return;
    loadGoogleMaps(GOOGLE_MAPS_KEY).then(() => {
      if (!mapRef.current) return;
      const centre = userLocation || { lat: 51.5074, lng: -0.1278 };
      if (!mapInstance.current) {
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: centre,
          zoom: userLocation ? 12 : 10,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        infoWindow.current = new google.maps.InfoWindow();
      }

      markers.current.forEach((m) => m.setMap(null));
      markers.current = [];

      if (userLocation) {
        new google.maps.Marker({
          position: userLocation,
          map: mapInstance.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#5B4B8A',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 3,
          },
          title: 'Your location',
          zIndex: 1000,
        });
      }

      listings.forEach((listing) => {
        if (!listing.lat || !listing.lng) return;
        const marker = new google.maps.Marker({
          position: { lat: listing.lat, lng: listing.lng },
          map: mapInstance.current!,
          title: listing.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48">
                <path fill="#5B4B8A" stroke="#fff" stroke-width="2"
                  d="M18 2C10.3 2 4 8.3 4 16c0 9.9 14 30 14 30S32 25.9 32 16C32 8.3 25.7 2 18 2z"/>
                <circle fill="white" cx="18" cy="16" r="7"/>
              </svg>`),
            scaledSize: new google.maps.Size(36, 48),
            anchor: new google.maps.Point(18, 48),
          },
        });

        marker.addListener('click', () => {
          infoWindow.current?.setContent(`
            <div style="font-family:sans-serif;max-width:200px;padding:4px;">
              <strong style="color:#5B4B8A;font-size:14px;">${listing.title}</strong>
              <p style="margin:4px 0;font-size:12px;color:#666;">${listing.category}</p>
              <p style="margin:4px 0;font-size:12px;">${listing.address}, ${listing.city}</p>
              ${listing.distance_km ? `<p style="margin:4px 0;font-size:12px;color:#5B4B8A;">${listing.distance_km.toFixed(1)} km away</p>` : ''}
              <p style="margin:4px 0;font-size:12px;">⭐ ${listing.rating} (${listing.review_count} reviews)</p>
            </div>
          `);
          infoWindow.current?.open(mapInstance.current, marker);
        });
        markers.current.push(marker);
      });

      if (listings.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        if (userLocation) bounds.extend(userLocation);
        listings.forEach((l) => l.lat && bounds.extend({ lat: l.lat, lng: l.lng }));
        mapInstance.current!.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      }
    });
  }, [listings, userLocation]);

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="service-search__map service-search__map--placeholder">
        <p>Add VITE_GOOGLE_MAPS_KEY to .env.local to enable the map</p>
      </div>
    );
  }
  return <div ref={mapRef} className="service-search__map" />;
};

// Main Component
const DogFriendlyActivitiesFinder: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [newListings, setNewListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [newLoading, setNewLoading] = useState(true);
  const [autocomplete, setAutocomplete] = useState<AutocompleteItem[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ radius: 25, minRating: 0, verifiedOnly: false });
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  const faqData = [
    {
      question: "How can I book a stay in the hotel?",
      answer: "You can book visit with the vet directly, the details page of each vet clinic will show you the contact details, or you can book on their website."
    },
    {
      question: "How can I cancel my appointment with the venue?",
      answer: "You have to reach out to the venue directly. Their contact details are always shown on the venue's details page."
    },
    {
      question: "How can I find services near me?",
      answer: "You can find services near you by clicking the near me icon in the search bar. Choose category, and this will show you the venues with km details of how far this is from you exactly. You can also apply filters with km radius!"
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Load new listings on mount
  useEffect(() => {
    fetch(`${API_BASE}/listings/new`)
      .then((r) => r.json())
      .then((data) => { setNewListings(data); setNewLoading(false); })
      .catch(() => setNewLoading(false));
  }, []);

  // Load default listings on mount (shown before any search)
  useEffect(() => {
    fetch(`${API_BASE}/listings?limit=6`)
      .then((r) => r.json())
      .then((data) => setListings(data.listings || []))
      .catch(() => {});
  }, []);

  // Core search function
  const performSearch = useCallback(async (
    query: string,
    category: string,
    location: string,
    currentFilters: Filters,
    page = 1
  ) => {
    setLoading(true);
    setError('');
    setHasSearched(true);

    let lat: number | null = null;
    let lng: number | null = null;

    // Geocode location if provided
    if (location.trim() && location !== '📍 My location') {
      try {
        await loadGoogleMaps(GOOGLE_MAPS_KEY);
        if (!geocoderRef.current) geocoderRef.current = new google.maps.Geocoder();
        const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoderRef.current!.geocode(
            { address: `${location}, UK`, componentRestrictions: { country: 'gb' } },
            (results, status) => {
              if (status === 'OK' && results) resolve(results);
              else reject(status);
            }
          );
        });
        lat = result[0].geometry.location.lat();
        lng = result[0].geometry.location.lng();
      } catch {
        setError('Location not found. Try a postcode or city name.');
        setLoading(false);
        return;
      }
    } else if (userLocationRef.current) {
      lat = userLocationRef.current.lat;
      lng = userLocationRef.current.lng;
    }

    const params = new URLSearchParams({
      q: query,
      category,
      page: String(page),
      limit: '9',
      min_rating: String(currentFilters.minRating),
      verified_only: String(currentFilters.verifiedOnly),
      radius: String(currentFilters.radius),
    });

    if (lat !== null && lng !== null) {
      params.set('lat', String(lat));
      params.set('lng', String(lng));
    }

    try {
      const res = await fetch(`${API_BASE}/listings?${params}`);
      const data = await res.json();
      setListings(data.listings || []);
      setPagination(data.pagination || null);
    } catch {
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autocomplete — searches categories first
  useEffect(() => {
    if (searchQuery.length < 2) { setAutocomplete([]); return; }
    const timeout = setTimeout(() => {
      fetch(`${API_BASE}/autocomplete?q=${encodeURIComponent(searchQuery)}`)
        .then((r) => r.json())
        .then(setAutocomplete)
        .catch(() => {});
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Detect GPS location — immediately searches with fresh coords
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        userLocationRef.current = coords;
        setLocationQuery('📍 My location');

        // Search immediately with fresh coords — don't rely on stale state
        setLoading(true);
        setHasSearched(true);
        const params = new URLSearchParams({
          q: searchQuery,
          category: activeCategory,
          page: '1',
          limit: '9',
          min_rating: String(filters.minRating),
          verified_only: String(filters.verifiedOnly),
          radius: String(filters.radius),
          lat: String(coords.lat),
          lng: String(coords.lng),
        });
        fetch(`${API_BASE}/listings?${params}`)
          .then((r) => r.json())
          .then((data) => {
            setListings(data.listings || []);
            setPagination(data.pagination || null);
          })
          .catch(() => setError('Failed to load listings. Please try again.'))
          .finally(() => setLoading(false));
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError('Location access denied. Please allow location access in your browser settings, or enter a postcode manually.');
        } else {
          setError('Could not get your location. Try entering a postcode instead.');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // Close autocomplete on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!autocompleteRef.current?.contains(e.target as Node)) setShowAutocomplete(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Category click — shows ALL listings in that category (no location required)
  const handleCategoryClick = (label: string) => {
    const newCategory = activeCategory === label ? '' : label;
    setActiveCategory(newCategory);
    performSearch(searchQuery, newCategory, locationQuery, filters, 1);
  };

  // Search button / Enter key
  const handleSearch = () => {
    performSearch(searchQuery, activeCategory, locationQuery, filters, 1);
  };

  // Apply filters button
  const handleApplyFilters = () => {
    setFiltersOpen(false);
    performSearch(searchQuery, activeCategory, locationQuery, filters, 1);
  };

  // Autocomplete item click
  const handleAutocompleteClick = (item: AutocompleteItem) => {
    if (item.type === 'category') {
      // Clicked a category suggestion — set as active category and search
      setActiveCategory(item.label);
      setSearchQuery('');
      performSearch('', item.label, locationQuery, filters, 1);
    } else {
      // Clicked a listing title
      setSearchQuery(item.label);
      performSearch(item.label, activeCategory, locationQuery, filters, 1);
    }
    setShowAutocomplete(false);
  };

  return (
    <div className="service-finder">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Home</span>
        <span>›</span>
        <span>Service Finder</span>
      </nav>

      {/* Hero */}
      <section className="service-hero">
        <div className="service-hero__content">
          <h1 className="service-hero__title">Service finder</h1>
          <p className="service-hero__description">Find exactly what your dog needs — grooming, vets, pet shops, and more.</p>
          <p className="service-hero__description">Browse thousands of trusted listings, reach out to book instantly, or walk in when it suits you.</p>
          <p className="service-hero__tagline">Everything your pet needs, all in one place.</p>
        </div>
        <div className="service-hero__image">
          <img src="../../images/services1.png" alt="Service Finder Picture" />
        </div>
      </section>

      {/* New Listings */}
      <section className="new-listings">
        <h2 className="new-listings__title">New on our platform</h2>
        <div className="new-listings__grid">
          {newLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="listing-card listing-card--skeleton">
                  <div className="listing-card__image skeleton-box" />
                  <div className="listing-card__content">
                    <div className="skeleton-line skeleton-line--title" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line skeleton-line--short" />
                  </div>
                </div>
              ))
            : newListings.map((listing) => (
                <article key={listing.id} className="listing-card">
                  <div className="listing-card__image">
                    <img src={listing.image_url} alt={listing.title}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }} />
                  </div>
                  <div className="listing-card__content">
                    <span className="listing-card__category">{listing.category}</span>
                    <h3 className="listing-card__title">{listing.title}</h3>
                    <p className="listing-card__description">{listing.description}</p>
                    <StarRating rating={listing.rating} count={listing.review_count} />
                    <button className="listing-card__button">
                      Check details
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </article>
              ))}
        </div>
      </section>

      {/* Search Section */}
      <section className="service-search">

        {/* Category icons */}
        <div className="service-search__categories">
          {SERVICE_CATEGORIES.map((cat) => (
            <div
              key={cat.label}
              className={`category-item ${activeCategory === cat.label ? 'category-item--active' : ''}`}
              onClick={() => handleCategoryClick(cat.label)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(cat.label)}
            >
              <div className="category-item__icon">
                <img src={cat.icon} alt={cat.label} />
              </div>
              <span className="category-item__label">{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div ref={autocompleteRef} className="service-search__bar">
          {/* Keyword input */}
          <div className="service-search__input-wrap">
            <svg className="service-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by category, e.g. Grooming, Vet..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowAutocomplete(true); }}
              onFocus={() => setShowAutocomplete(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="service-search__input"
              aria-label="Search services"
            />
            {searchQuery && (
              <button className="service-search__clear" onClick={() => { setSearchQuery(''); setAutocomplete([]); }}>✕</button>
            )}
            {/* Autocomplete dropdown */}
            {showAutocomplete && autocomplete.length > 0 && (
              <ul className="service-search__autocomplete">
                {autocomplete.map((item, i) => (
                  <li key={i} onClick={() => handleAutocompleteClick(item)}>
                    {item.type === 'category' ? (
                      <>
                        <span className="autocomplete__tag">Category</span>
                        <strong>{item.label}</strong>
                        <span className="autocomplete__count">{item.count} listings</span>
                      </>
                    ) : (
                      <>
                        <span className="autocomplete__tag autocomplete__tag--listing">Listing</span>
                        <strong>{item.label}</strong>
                        <span>{item.type} · {item.city}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Location input */}
          <div className="service-search__input-wrap">
            <svg className="service-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <input
              type="text"
              placeholder="City or postcode — leave empty for all UK"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="service-search__input"
              aria-label="Location"
            />
            <button className="service-search__locate-btn" onClick={detectLocation} title="Use my location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
            </button>
          </div>

          {/* Search button */}
          <button className="service-search__button" onClick={handleSearch}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>

        <p className="service-search__text">
          {locationQuery ? `Searching near ${locationQuery}` : 'Searching across the whole of the UK'}
        </p>

        {/* Filters */}
        <button className="service-search__filter" onClick={() => setFiltersOpen((o) => !o)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          {filtersOpen ? 'Hide Filters' : 'Filters'}
          {/* Show active filter count */}
          {(filters.minRating > 0 || filters.verifiedOnly || filters.radius !== 25) && (
            <span className="service-search__filter-badge">
              {[filters.minRating > 0, filters.verifiedOnly, filters.radius !== 25].filter(Boolean).length}
            </span>
          )}
        </button>

        {filtersOpen && (
          <div className="service-search__filter-panel">
            <div className="filter-group">
              <p className="service-search__filter-label">Search radius</p>
              <div className="service-search__filter-chips">
                {[5, 10, 25, 50].map((km) => (
                  <button
                    key={km}
                    className={`filter-chip ${filters.radius === km ? 'filter-chip--active' : ''}`}
                    onClick={() => setFilters((f) => ({ ...f, radius: km }))}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <p className="service-search__filter-label">Minimum rating</p>
              <div className="service-search__filter-chips">
                {[{ label: 'Any', value: 0 }, { label: '3+ ⭐', value: 3 }, { label: '4+ ⭐', value: 4 }, { label: '4.5+ ⭐', value: 4.5 }].map((r) => (
                  <button
                    key={r.value}
                    className={`filter-chip ${filters.minRating === r.value ? 'filter-chip--active' : ''}`}
                    onClick={() => setFilters((f) => ({ ...f, minRating: r.value }))}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-toggle">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => setFilters((f) => ({ ...f, verifiedOnly: e.target.checked }))}
                />
                Verified listings only
              </label>
            </div>

            <button className="service-search__apply-btn" onClick={handleApplyFilters}>
              Apply Filters
            </button>

            <button className="service-search__reset-btn" onClick={() => {
              setFilters({ radius: 25, minRating: 0, verifiedOnly: false });
            }}>
              Reset
            </button>
          </div>
        )}

        {error && <p className="service-search__error">{error}</p>}

        {/* Two-column layout: listings left, map right */}
        <div className="search-layout">

          {/* Left: listings panel */}
          <div className="search-layout__listings">

            {hasSearched && (
              <h2 className="search-results__title">
                {pagination?.total ?? 0} result{(pagination?.total ?? 0) !== 1 ? 's' : ''}
                {activeCategory && ` · ${activeCategory}`}
                {locationQuery && ` near ${locationQuery}`}
              </h2>
            )}

            {!hasSearched && (
              <h2 className="search-results__title">Featured listings</h2>
            )}

            {loading && (
              <div className="service-search__loading">
                <div className="loading-spinner" />
                <span>Finding services…</span>
              </div>
            )}

            {!loading && hasSearched && listings.length === 0 && (
              <div className="service-search__empty">
                <p>No listings found. Try a different search or wider radius.</p>
              </div>
            )}

            {!loading && listings.map((listing) => (
              <article key={listing.id} className="listing-card listing-card--row">
                <div className="listing-card__image listing-card__image--small">
                  <img src={listing.image_url} alt={listing.title}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }} />
                  {listing.is_verified && <span className="listing-card__verified">✓ Verified</span>}
                </div>
                <div className="listing-card__content">
                  <span className="listing-card__category">{listing.category}</span>
                  <h3 className="listing-card__title">{listing.title}</h3>
                  <p className="listing-card__meta">
                    📍 {listing.address}, {listing.city} {listing.postcode}
                    {listing.distance_km != null && (
                      <> · <strong>{listing.distance_km.toFixed(1)} km</strong></>
                    )}
                  </p>
                  <StarRating rating={listing.rating} count={listing.review_count} />
                  <button className="listing-card__button">
                    Check details
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}

            {pagination && pagination.pages > 1 && (
              <div className="search-results__pagination">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pagination-btn ${p === pagination.page ? 'pagination-btn--active' : ''}`}
                    onClick={() => performSearch(searchQuery, activeCategory, locationQuery, filters, p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: sticky map */}
          <div className="search-layout__map">
            <ServiceMap listings={listings} userLocation={userLocation} />
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq">
        <h2 className="faq__title">Your questions, answered!</h2>
        <p className="faq__subtitle">Read more of FAQ <a href="/faq" className="faq__link">here</a>.</p>

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

export default DogFriendlyActivitiesFinder;