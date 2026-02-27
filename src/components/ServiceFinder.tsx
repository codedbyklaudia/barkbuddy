import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ServiceFinder.scss';
import Footer from './Footer';

const API_BASE: string  = import.meta.env.VITE_API_URL     ?? 'http://localhost:4000/api';
const MAPS_KEY: string  = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Listing {
  id: number;
  business_name: string;
  type: string;
  address: string;
  postcode: string;
  lat?: number;
  lng?: number;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  description?: string;
  approved_at: string;
  price_list?: string;
  primary_photo?: string;
  photo_count: number;
  is_new: boolean;
  distance_km?: number;
}

interface Filters {
  radius:  number;   // km
  type:    string;   // service type
  newOnly: boolean;
}

const SERVICE_TYPES = [
  { icon: '/images/icons/grooming.svg', label: 'Groomer' },
  { icon: '/images/pet_shop_icon.png',  label: 'Pet Shop' },
  { icon: '/images/icons/health.svg',   label: 'Vet' },
  { icon: '/images/icons/training.svg', label: 'Trainer' },
];

const RADIUS_OPTIONS = [5, 10, 25, 50];

// ─── Google Maps loader ───────────────────────────────────────────────────────
let mapsLoaded = false;
let mapsCallbacks: (() => void)[] = [];

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (mapsLoaded) { resolve(); return; }
    mapsCallbacks.push(resolve);
    if (document.getElementById('google-maps-script')) return;
    (window as any).__onGoogleMapsLoad = () => {
      mapsLoaded = true;
      mapsCallbacks.forEach(cb => cb());
      mapsCallbacks = [];
    };
    const s = document.createElement('script');
    s.id  = 'google-maps-script';
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__onGoogleMapsLoad`;
    s.async = true;
    document.head.appendChild(s);
  });
}

// ─── Map component ────────────────────────────────────────────────────────────
const ServiceMap: React.FC<{
  listings:     Listing[];
  userLocation: { lat: number; lng: number } | null;
  searchCoords: { lat: number; lng: number } | null;
  radiusKm:     number | null;
}> = ({ listings, userLocation, searchCoords, radiusKm }) => {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInst     = useRef<google.maps.Map | null>(null);
  const markers     = useRef<google.maps.Marker[]>([]);
  const circle      = useRef<google.maps.Circle | null>(null);
  const infoWin     = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!MAPS_KEY) return;
    loadGoogleMaps(MAPS_KEY).then(() => {
      if (!mapRef.current) return;
      const centre = searchCoords || userLocation || { lat: 51.5074, lng: -0.1278 };

      if (!mapInst.current) {
        mapInst.current = new google.maps.Map(mapRef.current, {
          center: centre, zoom: 12,
          styles: [
            { featureType: 'poi',     stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
          mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
        });
        infoWin.current = new google.maps.InfoWindow();
      }

      // Clear old markers & circle
      markers.current.forEach(m => m.setMap(null));
      markers.current = [];
      circle.current?.setMap(null);

      // Draw radius circle
      if (searchCoords && radiusKm) {
        circle.current = new google.maps.Circle({
          map:         mapInst.current,
          center:      searchCoords,
          radius:      radiusKm * 1000,
          fillColor:   '#5B4B8A',
          fillOpacity: 0.06,
          strokeColor: '#5B4B8A',
          strokeWeight: 1.5,
          strokeOpacity: 0.3,
        });
      }

      // User location dot
      if (userLocation) {
        new google.maps.Marker({
          position: userLocation, map: mapInst.current,
          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#5B4B8A', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 },
          title: 'Your location', zIndex: 1000,
        });
      }

      // Business pins
      listings.forEach(l => {
        if (!l.lat || !l.lng) return;
        const marker = new google.maps.Marker({
          position: { lat: l.lat, lng: l.lng },
          map:       mapInst.current!,
          title:     l.business_name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="36" height="48">
                <path fill="#5B4B8A" stroke="#fff" stroke-width="2"
                  d="M18 2C10.3 2 4 8.3 4 16c0 9.9 14 30 14 30S32 25.9 32 16C32 8.3 25.7 2 18 2z"/>
                <circle fill="white" cx="18" cy="16" r="7"/>
              </svg>`),
            scaledSize: new google.maps.Size(36, 48),
            anchor:     new google.maps.Point(18, 48),
          },
        });
        marker.addListener('click', () => {
          infoWin.current?.setContent(`
            <div style="font-family:sans-serif;max-width:220px;padding:6px;">
              <strong style="color:#5B4B8A;font-size:14px;">${l.business_name}</strong>
              <p style="margin:4px 0;font-size:12px;color:#666;">${l.type}</p>
              <p style="margin:4px 0;font-size:12px;">📍 ${l.address}, ${l.postcode}</p>
              ${l.distance_km != null ? `<p style="margin:4px 0;font-size:12px;color:#5B4B8A;font-weight:600;">${l.distance_km} km away</p>` : ''}
              ${l.is_new ? `<p style="margin:4px 0;font-size:11px;color:#7c3aed;">✨ New on BarkBuddy</p>` : ''}
              ${l.contact_phone ? `<p style="margin:4px 0;font-size:12px;">📞 ${l.contact_phone}</p>` : ''}
            </div>
          `);
          infoWin.current?.open(mapInst.current, marker);
        });
        markers.current.push(marker);
      });

      // Fit map to results
      const pinned = listings.filter(l => l.lat && l.lng);
      if (pinned.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        if (userLocation)   bounds.extend(userLocation);
        if (searchCoords)   bounds.extend(searchCoords);
        pinned.forEach(l => bounds.extend({ lat: l.lat!, lng: l.lng! }));
        mapInst.current!.fitBounds(bounds, 60);
      } else if (searchCoords) {
        mapInst.current!.panTo(searchCoords);
        mapInst.current!.setZoom(radiusKm ? Math.max(10, 14 - Math.log2(radiusKm)) : 12);
      }
    });
  }, [listings, userLocation, searchCoords, radiusKm]);

  if (!MAPS_KEY) {
    return (
      <div className="service-search__map service-search__map--placeholder">
        <p>Add <code>VITE_GOOGLE_MAPS_KEY</code> to enable the map</p>
      </div>
    );
  }
  return <div ref={mapRef} className="service-search__map" />;
};

// ─── Listing row card ─────────────────────────────────────────────────────────
const ListingRow: React.FC<{ listing: Listing }> = ({ listing }) => (
  <article className="listing-card listing-card--row">
    <div className="listing-card__image listing-card__image--small">
      {listing.primary_photo
        ? <img src={listing.primary_photo} alt={listing.business_name} />
        : <div className="listing-card__no-photo">🐾</div>}
      {listing.is_new && <span className="listing-card__verified">✨ New</span>}
    </div>
    <div className="listing-card__content">
      <span className="listing-card__category">{listing.type}</span>
      <h3 className="listing-card__title">{listing.business_name}</h3>
      <p className="listing-card__meta">
        📍 {listing.address}, {listing.postcode}
        {listing.distance_km != null && (
          <> · <strong style={{ color: '#5B4B8A' }}>{listing.distance_km} km away</strong></>
        )}
      </p>
      {listing.description && (
        <p className="listing-card__description">{listing.description}</p>
      )}
      {listing.contact_phone && <p className="listing-card__meta">📞 {listing.contact_phone}</p>}
      {listing.website && (
        <a href={listing.website} target="_blank" rel="noopener noreferrer" className="listing-card__button">
          Visit website
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      )}
    </div>
  </article>
);

// ─── New listing card (grid) ──────────────────────────────────────────────────
const NewListingCard: React.FC<{ listing: Listing }> = ({ listing }) => (
  <article className="listing-card">
    <div className="listing-card__image">
      {listing.primary_photo
        ? <img src={listing.primary_photo} alt={listing.business_name} />
        : <div className="listing-card__no-photo">🐾</div>}
    </div>
    <div className="listing-card__content">
      <span className="listing-card__category">{listing.type}</span>
      <h3 className="listing-card__title">{listing.business_name}</h3>
      <p className="listing-card__meta">📍 {listing.address}, {listing.postcode}</p>
      {listing.description && <p className="listing-card__description">{listing.description}</p>}
      {listing.website && (
        <a href={listing.website} target="_blank" rel="noopener noreferrer" className="listing-card__button">
          Check details <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </a>
      )}
    </div>
  </article>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const ServiceFinder: React.FC = () => {
  const [searchQuery,   setSearchQuery]   = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [listings,      setListings]      = useState<Listing[]>([]);
  const [newListings,   setNewListings]   = useState<Listing[]>([]);
  const [userLocation,  setUserLocation]  = useState<{ lat: number; lng: number } | null>(null);
  const [searchCoords,  setSearchCoords]  = useState<{ lat: number; lng: number } | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [newLoading,    setNewLoading]    = useState(true);
  const [hasSearched,   setHasSearched]   = useState(false);
  const [error,         setError]         = useState('');
  const [locationError, setLocationError] = useState('');
  const [filtersOpen,   setFiltersOpen]   = useState(false);
  const [openFaq,       setOpenFaq]       = useState<number | null>(null);
  const [filters,       setFilters]       = useState<Filters>({ radius: 10, type: '', newOnly: false });
  const [searchMeta,    setSearchMeta]    = useState<{ radiusKm: number | null; locationFound: boolean } | null>(null);

  const faqData = [
    { question: "How do I book a service?", answer: "Contact the business directly using the phone number or website shown on their listing." },
    { question: "How do I search near me?", answer: "Click the location icon in the search bar to use your GPS location, or type a postcode, city, or area like 'North London'." },
    { question: "What does the radius filter do?", answer: "It limits results to businesses within that distance from your searched location. The default is 10km." },
  ];

  // Load "new on platform" on mount
  useEffect(() => {
    fetch(`${API_BASE}/listings/services?new_only=true`)
      .then(r => r.json())
      .then(d => { setNewListings((d.services ?? []).slice(0, 3)); setNewLoading(false); })
      .catch(() => setNewLoading(false));
  }, []);

  // Core search
  const performSearch = useCallback(async (opts: {
    query?:    string;
    location?: string;
    lat?:      number;
    lng?:      number;
    radius?:   number;
    type?:     string;
    newOnly?:  boolean;
  }) => {
    setLoading(true);
    setError('');
    setHasSearched(true);

    const params = new URLSearchParams();
    if (opts.query?.trim())    params.set('search',   opts.query.trim());
    if (opts.type?.trim())     params.set('type',     opts.type.trim());
    if (opts.newOnly)          params.set('new_only', 'true');
    if (opts.radius != null)   params.set('radius',   String(opts.radius));
    if (opts.lat != null && opts.lng != null) {
      params.set('lat', String(opts.lat));
      params.set('lng', String(opts.lng));
    } else if (opts.location?.trim() && opts.location !== '📍 My location') {
      params.set('location', opts.location.trim());
    }

    try {
      const res  = await fetch(`${API_BASE}/listings/services?${params}`);
      const data = await res.json();
      setListings(data.services ?? []);
      setSearchMeta(data.meta ?? null);
      // Update searchCoords from meta so map circle draws correctly
      if (data.meta?.searchLat && data.meta?.searchLng) {
        setSearchCoords({ lat: data.meta.searchLat, lng: data.meta.searchLng });
      } else if (!opts.lat && !opts.lng) {
        setSearchCoords(null);
      }
    } catch {
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all on mount (no location filter)
  useEffect(() => {
    performSearch({});
  }, [performSearch]);

  // GPS location detect
  const detectLocation = () => {
    if (!navigator.geolocation) { setLocationError('Geolocation not supported.'); return; }
    setLocationError('');
    setLocationInput('Detecting…');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setSearchCoords(coords);
        setLocationInput('📍 My location');
        performSearch({ ...filters, query: searchQuery, lat: coords.lat, lng: coords.lng });
      },
      err => {
        setLocationInput('');
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location access denied. Enter a postcode instead.');
        } else {
          setLocationError('Could not get location. Try a postcode.');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleTypeClick = (label: string) => {
    const newType = filters.type === label ? '' : label;
    const next = { ...filters, type: newType };
    setFilters(next);
    performSearch({ query: searchQuery, location: locationInput, lat: userLocation?.lat, lng: userLocation?.lng, ...next });
  };

  const handleSearch = () => {
    if (locationInput === '📍 My location' && userLocation) {
      performSearch({ query: searchQuery, lat: userLocation.lat, lng: userLocation.lng, ...filters });
    } else {
      performSearch({ query: searchQuery, location: locationInput, ...filters });
    }
  };

  const handleApplyFilters = () => {
    setFiltersOpen(false);
    handleSearch();
  };

  const clearAll = () => {
    setSearchQuery('');
    setLocationInput('');
    setFilters({ radius: 10, type: '', newOnly: false });
    setUserLocation(null);
    setSearchCoords(null);
    setSearchMeta(null);
    performSearch({});
  };

  const activeFilterCount = [
    filters.type !== '',
    filters.radius !== 10,
    filters.newOnly,
  ].filter(Boolean).length;

  return (
    <div className="service-finder">

      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Home</span><span>›</span><span>Service Finder</span>
      </nav>

      {/* Hero */}
      <section className="service-hero">
        <div className="service-hero__content">
          <h1 className="service-hero__title">Service finder</h1>
          <p className="service-hero__description">Find exactly what your dog needs — grooming, vets, pet shops, trainers, and more.</p>
          <p className="service-hero__tagline">Everything your pet needs, all in one place.</p>
        </div>
        <div className="service-hero__image">
          <img src="../../images/services1.png" alt="Service Finder" />
        </div>
      </section>

      {/* New on platform */}
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
            : newListings.length === 0
              ? <p style={{ color: 'rgba(45,27,105,0.4)', fontSize: '0.95rem' }}>No new listings yet — check back soon!</p>
              : newListings.map(l => <NewListingCard key={l.id} listing={l} />)
          }
        </div>
      </section>

      {/* Search section */}
      <section className="service-search">

        {/* Category icon tabs */}
        <div className="service-search__categories">
          {SERVICE_TYPES.map(cat => (
            <div
              key={cat.label}
              className={`category-item ${filters.type === cat.label ? 'category-item--active' : ''}`}
              onClick={() => handleTypeClick(cat.label)}
              role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleTypeClick(cat.label)}
            >
              <div className="category-item__icon"><img src={cat.icon} alt={cat.label} /></div>
              <span className="category-item__label">{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div className="service-search__bar">

          {/* Keyword */}
          <div className="service-search__input-wrap">
            <svg className="service-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or service…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="service-search__input"
            />
            {searchQuery && (
              <button className="service-search__clear" onClick={() => { setSearchQuery(''); }}>✕</button>
            )}
          </div>

          {/* Location */}
          <div className="service-search__input-wrap">
            <svg className="service-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
            </svg>
            <input
              type="text"
              placeholder="Postcode, city or area (e.g. North London)…"
              value={locationInput}
              onChange={e => { setLocationInput(e.target.value); setUserLocation(null); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="service-search__input"
            />
            {locationInput && (
              <button className="service-search__clear" onClick={() => { setLocationInput(''); setUserLocation(null); setSearchCoords(null); }}>✕</button>
            )}
            <button className="service-search__locate-btn" onClick={detectLocation} title="Use my location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
            </button>
          </div>

          <button className="service-search__button" onClick={handleSearch}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>

        {locationError && <p className="service-search__error">{locationError}</p>}

        {/* Context line */}
        <p className="service-search__text">
          {searchMeta?.locationFound
            ? `Showing results within ${searchMeta.radiusKm} km`
            : 'Showing all UK listings'}
          {filters.type && ` · ${filters.type}`}
          {filters.newOnly && ' · New only'}
        </p>

        {/* Filters toggle */}
        <button className="service-search__filter" onClick={() => setFiltersOpen(o => !o)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          {filtersOpen ? 'Hide filters' : 'Filters'}
          {activeFilterCount > 0 && (
            <span className="service-search__filter-badge">{activeFilterCount}</span>
          )}
        </button>

        {filtersOpen && (
          <div className="service-search__filter-panel">

            {/* Radius */}
            <div className="filter-group">
              <p className="service-search__filter-label">Search radius</p>
              <div className="service-search__filter-chips">
                {RADIUS_OPTIONS.map(km => (
                  <button
                    key={km}
                    className={`filter-chip ${filters.radius === km ? 'filter-chip--active' : ''}`}
                    onClick={() => setFilters(f => ({ ...f, radius: km }))}
                  >{km} km</button>
                ))}
              </div>
            </div>

            {/* Service type */}
            <div className="filter-group">
              <p className="service-search__filter-label">Service type</p>
              <div className="service-search__filter-chips">
                <button
                  className={`filter-chip ${!filters.type ? 'filter-chip--active' : ''}`}
                  onClick={() => setFilters(f => ({ ...f, type: '' }))}
                >All</button>
                {['Groomer', 'Vet', 'Trainer', 'Pet Shop', 'Dog Walker', 'Boarding', 'Day Care'].map(t => (
                  <button
                    key={t}
                    className={`filter-chip ${filters.type === t ? 'filter-chip--active' : ''}`}
                    onClick={() => setFilters(f => ({ ...f, type: f.type === t ? '' : t }))}
                  >{t}</button>
                ))}
              </div>
            </div>

            {/* New only */}
            <div className="filter-group">
              <label className="filter-toggle">
                <input
                  type="checkbox"
                  checked={filters.newOnly}
                  onChange={e => setFilters(f => ({ ...f, newOnly: e.target.checked }))}
                />
                Show new listings only (last 30 days)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button className="service-search__apply-btn" onClick={handleApplyFilters}>Apply filters</button>
              <button className="service-search__reset-btn" onClick={() => setFilters({ radius: 10, type: '', newOnly: false })}>Reset</button>
            </div>
          </div>
        )}

        {error && <p className="service-search__error">{error}</p>}

        {/* Two-column layout */}
        <div className="search-layout">
          <div className="search-layout__listings">

            <h2 className="search-results__title">
              {loading ? 'Searching…' : `${listings.length} result${listings.length !== 1 ? 's' : ''}`}
              {filters.type && ` · ${filters.type}`}
              {locationInput && locationInput !== '📍 My location' && ` near ${locationInput}`}
              {locationInput === '📍 My location' && ' near you'}
            </h2>

            {loading && (
              <div className="service-search__loading">
                <div className="loading-spinner" />
                <span>Finding services…</span>
              </div>
            )}

            {!loading && hasSearched && listings.length === 0 && (
              <div className="service-search__empty">
                <p>No listings found. Try a wider radius or different search.</p>
                <button onClick={clearAll}>Clear all filters</button>
              </div>
            )}

            {!loading && listings.map(l => <ListingRow key={l.id} listing={l} />)}
          </div>

          <div className="search-layout__map">
            <ServiceMap
              listings={listings}
              userLocation={userLocation}
              searchCoords={searchCoords}
              radiusKm={searchMeta?.radiusKm ?? null}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <h2 className="faq__title">Your questions, answered!</h2>
        <p className="faq__subtitle">Read more of our FAQ <a href="/faq" className="faq__link">here</a>.</p>
        <div className="faq__list">
          {faqData.map((faq, i) => (
            <div key={i} className={`faq__item ${openFaq === i ? 'faq__item--open' : ''}`}>
              <button className="faq__question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.question}</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="faq__icon">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div className="faq__answer"><p>{faq.answer}</p></div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServiceFinder;