import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './ServiceFinder.scss';
import Footer from './Footer';
import { formatServiceType } from '../utils/formatservicetype';

const MAPS_KEY: string = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '';

// Types 
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
  radius: number;
  type: string;
  newOnly: boolean;
}

type TabType = 'services' | 'activities';

// Type icons
const SERVICE_TYPES = [
  { icon: '../images/icons_1/grooming_icon.png', label: 'Groomer' },
  { icon: '../images/icons_1/vet_icon.png',      label: 'Vet' },
  { icon: '/images/icons_1/trainer_icon.png',           label: 'Behaviorist' },
  { icon: '../images/icons_1/petshop_icon.png',  label: 'Pet Shop' },
];

const ACTIVITY_TYPES = [
  { icon: '../images/icons_1/hotel_icon.png',      label: 'Hotel' },
  { icon: '../images/icons_1/restaurant_icon.png', label: 'Restaurant' },
  { icon: '../images/icons_1/park_icon.png',       label: 'Park' },
  { icon: '../images/icons_1/beach_icon.png',      label: 'Beaches' },
];
const API_BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
const UPLOADS_BASE: string = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace('/api', '');


const RADIUS_OPTIONS = [5, 10, 25, 50];

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

// Map component
const UnifiedMap: React.FC<{
  listings: Listing[];
  userLocation: { lat: number; lng: number } | null;
  searchCoords: { lat: number; lng: number } | null;
  radiusKm: number | null;
}> = ({ listings, userLocation, searchCoords, radiusKm }) => {
  const mapRef  = useRef<HTMLDivElement>(null);
  const mapInst = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const circle  = useRef<google.maps.Circle | null>(null);
  const infoWin = useRef<google.maps.InfoWindow | null>(null);

  // UK centre — shown until user searches
  const UK_CENTRE = { lat: 54.5, lng: -3.5 };
  const UK_ZOOM   = 6;

  useEffect(() => {
    if (!MAPS_KEY) return;
    loadGoogleMaps(MAPS_KEY).then(() => {
      if (!mapRef.current) return;

      // Default to UK overview; only zoom in once user provides a location
      const hasContext = !!(searchCoords || userLocation);
      const centre     = searchCoords || userLocation || UK_CENTRE;

      if (!mapInst.current) {
        mapInst.current = new google.maps.Map(mapRef.current, {
          center: hasContext ? centre : UK_CENTRE,
          zoom:   hasContext ? 12 : UK_ZOOM,
          styles: [
            { featureType: 'poi',     stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
          mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
        });
        infoWin.current = new google.maps.InfoWindow();
      }

      // Clear previous markers / circle
      markers.current.forEach(m => m.setMap(null));
      markers.current = [];
      circle.current?.setMap(null);
      circle.current = null;

      // Radius circle
      if (searchCoords && radiusKm) {
        circle.current = new google.maps.Circle({
          map: mapInst.current, center: searchCoords, radius: radiusKm * 1000,
          fillColor: '#5B4B8A', fillOpacity: 0.06,
          strokeColor: '#5B4B8A', strokeWeight: 1.5, strokeOpacity: 0.3,
        });
      }

      // User location dot
      if (userLocation) {
        new google.maps.Marker({
          position: userLocation, map: mapInst.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10, fillColor: '#5B4B8A', fillOpacity: 1,
            strokeColor: '#fff', strokeWeight: 3,
          },
          title: 'Your location', zIndex: 1000,
        });
      }

      // Listing pins
      listings.forEach(l => {
        if (!l.lat || !l.lng) return;
        const marker = new google.maps.Marker({
          position: { lat: l.lat, lng: l.lng },
          map: mapInst.current!,
          title: l.business_name,
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
            <div style="font-family:sans-serif;max-width:220px;padding:8px;color:#2D1B69;">
              <strong style="color:#5B4B8A;font-size:14px;display:block;margin-bottom:4px;">${l.business_name}</strong>
              <p style="margin:4px 0;font-size:12px;color:#666;">${formatServiceType(l.type)}</p>
              <p style="margin:4px 0;font-size:12px;">${l.address}, ${l.postcode}</p>
              ${l.distance_km != null ? `<p style="margin:4px 0;font-size:12px;color:#5B4B8A;font-weight:600;">${l.distance_km} km away</p>` : ''}
              ${l.is_new ? `<p style="margin:4px 0;font-size:11px;color:#7c3aed;">New on BarkBuddy</p>` : ''}
              ${l.contact_phone ? `<p style="margin:4px 0;font-size:12px;">${l.contact_phone}</p>` : ''}
            </div>`);
          infoWin.current?.open(mapInst.current, marker);
        });
        markers.current.push(marker);
      });

      // Smart zoom logic
      const pinned = listings.filter(l => l.lat && l.lng);

      if (pinned.length > 1) {
        // Multiple results → fit all pins + search centre
        const bounds = new google.maps.LatLngBounds();
        if (searchCoords) bounds.extend(searchCoords);
        pinned.forEach(l => { if (l.lat && l.lng) bounds.extend({ lat: l.lat, lng: l.lng }); });
        mapInst.current!.fitBounds(bounds, 80);
      } else if (searchCoords) {
        // 0 or 1 result → centre on search area at radius-appropriate zoom
        mapInst.current!.setCenter(searchCoords);
        mapInst.current!.setZoom(radiusKm ? Math.max(10, 14 - Math.log2(radiusKm)) : 11);
      } else {
        // No search at all → UK overview
        mapInst.current!.setCenter(UK_CENTRE);
        mapInst.current!.setZoom(UK_ZOOM);
      }
    });
  }, [listings, userLocation, searchCoords, radiusKm]);

  if (!MAPS_KEY) return (
    <div className="unified-finder__map unified-finder__map--placeholder">
      <p>Add <code>VITE_GOOGLE_MAPS_KEY</code> to enable the map</p>
    </div>
  );
  return <div ref={mapRef} className="unified-finder__map" />;
};

// Listing row card
const ListingRow: React.FC<{ listing: Listing }> = ({ listing }) => (
  <Link to={`/activity/${listing.id}`} style={{ textDecoration: 'none' }}>
    <article className="listing-card listing-card--row">
      <div className="listing-card__image listing-card__image--small">
        {listing.primary_photo
          ? <img src={`${UPLOADS_BASE}${listing.primary_photo}`} alt={listing.business_name} />
          : <div className="listing-card__no-photo">🐾</div>}
        {listing.is_new && <span className="listing-card__badge"><i className="bi bi-patch-check" /> New</span>}
      </div>
      <div className="listing-card__content">
        <span className="listing-card__category">{formatServiceType(listing.type)}</span>
        <h3 className="listing-card__title">{listing.business_name}</h3>
        <p className="listing-card__meta">
          <i className="bi bi-geo-fill" /> {listing.address}, {listing.postcode}
          {listing.distance_km != null && <> · <strong style={{ color: '#5B4B8A' }}>{listing.distance_km} km</strong></>}
        </p>
        {listing.description && <p className="listing-card__description">{listing.description}</p>}
        {listing.contact_phone && <p className="listing-card__meta"><i className="bi bi-telephone" /> {listing.contact_phone}</p>}
        {listing.website && (
          <a
            href={listing.website}
            target="_blank"
            rel="noopener noreferrer"
            className="listing-card__button"
            onClick={e => { e.stopPropagation(); e.preventDefault(); }}
          >
            Visit website
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>
    </article>
  </Link>
);

// Grid card
const GridCard: React.FC<{ listing: Listing }> = ({ listing }) => (
  <Link to={`/activity/${listing.id}`} style={{ textDecoration: 'none' }}>
    <article className="listing-card listing-card--grid">
      <div className="listing-card__image">
        {listing.primary_photo
          ? <img src={`${UPLOADS_BASE}${listing.primary_photo}`} alt={listing.business_name} />
          : <div className="listing-card__no-photo">🐾</div>}
        {listing.is_new && <span className="listing-card__badge"><i className="bi bi-patch-check" /> New</span>}
      </div>
      <div className="listing-card__content">
        <span className="listing-card__category">{formatServiceType(listing.type)}</span>
        <h3 className="listing-card__title">{listing.business_name}</h3>
        <p className="listing-card__meta"><i className="bi bi-geo" /> {listing.address}</p>
        {listing.description && <p className="listing-card__description">{listing.description}</p>}
        {listing.website && (
          <a
            href={listing.website}
            target="_blank"
            rel="noopener noreferrer"
            className="listing-card__button"
            onClick={e => { e.stopPropagation(); e.preventDefault(); }}
          >
            Learn more <i className="bi bi-box-arrow-up-right" />
          </a>
        )}
      </div>
    </article>
  </Link>
);

// Main component
const ServiceFinder: React.FC = () => {
  const [activeTab, setActiveTab]               = useState<TabType>('services');
  const [searchQuery, setSearchQuery]           = useState('');
  const [locationInput, setLocationInput]       = useState('');
  const [listings, setListings]                 = useState<Listing[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [userLocation, setUserLocation]         = useState<{ lat: number; lng: number } | null>(null);
  const [searchCoords, setSearchCoords]         = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading]                   = useState(false);
  const [featuredLoading, setFeaturedLoading]   = useState(true);
  const [hasSearched, setHasSearched]           = useState(false);
  const [error, setError]                       = useState('');
  const [locationError, setLocationError]       = useState('');
  const [filtersOpen, setFiltersOpen]           = useState(false);
  const [openFaq, setOpenFaq]                   = useState<number | null>(null);
  const [filters, setFilters]                   = useState<Filters>({ radius: 10, type: '', newOnly: false });
  const [searchMeta, setSearchMeta]             = useState<{ radiusKm: number | null; locationFound: boolean } | null>(null);

  const faqData = [
    {
      question: 'How do I book a service or activity?',
      answer: 'Contact the business directly using the phone number or website shown on their listing.',
    },
    {
      question: 'How do I search near me?',
      answer: 'Click the location icon in the search bar to use your GPS location, or type a postcode, city, or area like "North London".',
    },
    {
      question: 'What does the radius filter do?',
      answer: 'It limits results to businesses within that distance from your searched location. The default is 10km.',
    },
  ];

  const currentTypes = activeTab === 'services' ? SERVICE_TYPES : ACTIVITY_TYPES;

  // Featured listings
  useEffect(() => {
    setFeaturedLoading(true);
    const endpoint = activeTab === 'services' ? 'services' : 'activities';
    fetch(`${API_BASE}/listings/${endpoint}?new_only=true`)
      .then(r => r.json())
      .then(d => {
        const key = activeTab === 'services' ? 'services' : 'activities';
        setFeaturedListings((d[key] ?? []).slice(0, 3));
        setFeaturedLoading(false);
      })
      .catch(() => setFeaturedLoading(false));
  }, [activeTab]);

  // Core search 
  const performSearch = useCallback(async (opts: {
    query?: string; location?: string; lat?: number; lng?: number;
    radius?: number; type?: string; newOnly?: boolean;
  }) => {
    setLoading(true);
    setError('');
    setHasSearched(true);
    const endpoint = activeTab === 'services' ? 'services' : 'activities';
    const params   = new URLSearchParams();
    if (opts.query?.trim())  params.set('search',   opts.query.trim());
    if (opts.type?.trim())   params.set('type',     opts.type.trim());
    if (opts.newOnly)        params.set('new_only', 'true');
    if (opts.radius != null) params.set('radius',   String(opts.radius));
    if (opts.lat != null && opts.lng != null) {
      params.set('lat', String(opts.lat));
      params.set('lng', String(opts.lng));
    } else if (opts.location?.trim() && opts.location !== 'My location') {
      params.set('location', opts.location.trim());
    }
    try {
      const res  = await fetch(`${API_BASE}/listings/${endpoint}?${params}`);
      const data = await res.json();
      const key  = activeTab === 'services' ? 'services' : 'activities';
      setListings(data[key] ?? []);
      setSearchMeta(data.meta ?? null);
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
  }, [activeTab]);

  useEffect(() => { performSearch({}); }, [activeTab, performSearch]);

  // ── GPS detect ────────────────────────────────────────────────────────────
  const detectLocation = () => {
    if (!navigator.geolocation) { setLocationError('Geolocation not supported.'); return; }
    setLocationError('');
    setLocationInput('Detecting…');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setSearchCoords(coords);
        setLocationInput('My location');
        performSearch({ ...filters, query: searchQuery, lat: coords.lat, lng: coords.lng });
      },
      err => {
        setLocationInput('');
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location access denied. Enter a postcode instead.'
            : 'Could not get location. Try a postcode.'
        );
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleTypeClick = (label: string) => {
    const newType = filters.type === label ? '' : label;
    const next    = { ...filters, type: newType };
    setFilters(next);
    performSearch({
      query: searchQuery,
      location: locationInput,
      lat: userLocation?.lat,
      lng: userLocation?.lng,
      ...next,
    });
  };

  const handleSearch = () => {
    if (locationInput === 'My location' && userLocation) {
      performSearch({ query: searchQuery, lat: userLocation.lat, lng: userLocation.lng, ...filters });
    } else {
      performSearch({ query: searchQuery, location: locationInput, ...filters });
    }
  };

  const handleApplyFilters = () => { setFiltersOpen(false); handleSearch(); };

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

  const tabLabel = activeTab === 'services' ? 'Services' : 'Activities';

  return (
    <div className="service-finder-page">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="fh" key={activeTab}>

        {/* LEFT PANEL */}
        <div className="fh__left">
          <div className="fh__heading-block">

            <p className="fh__eyebrow">
              {activeTab === 'services' ? 'Dog Services' : 'Dog-Friendly Places'}
            </p>

            <h1 className="fh__heading">
              {activeTab === 'services' ? (
                <>Find the best<br />dog care,<br /><em>near you.</em></>
              ) : (
                <>Explore dog-<br />friendly places,<br /><em>across the UK.</em></>
              )}
            </h1>

            <p className="fh__sub">
              {activeTab === 'services'
                ? <>Groomers, vets, trainers, pet shops &amp; more — all <strong>verified</strong>, all across the UK.</>
                : <>Parks, hotels, restaurants &amp; trails — because <strong>your dog comes too.</strong> Wherever the adventure takes you.</>}
            </p>

            <div className="fh__ctas">
              <button
                className="fh__cta fh__cta--primary"
                onClick={() => document.querySelector('.finder-search')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {activeTab === 'services' ? 'Find a service' : 'Explore now'}
                <i className="bi bi-chevron-double-right" />
              </button>
              <button
                className="fh__cta fh__cta--ghost"
                onClick={() => setActiveTab(activeTab === 'services' ? 'activities' : 'services')}
              >
                View {activeTab === 'services' ? 'Activities' : 'Services'}
              </button>
            </div>

            {/* Inline search */}
            <div className="fh__search-wrap">
              <div className="fh__search">
                <div className="fh__search-field">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                  <div className="fh__search-field-inner">
                    <label htmlFor="fh-query">What</label>
                    <input
                      id="fh-query"
                      type="text"
                      placeholder="Groomer, vet, park…"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>
                <div className="fh__search-field">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <div className="fh__search-field-inner">
                    <label htmlFor="fh-location">Where</label>
                    <input
                      id="fh-location"
                      type="text"
                      placeholder="Postcode or city…"
                      value={locationInput}
                      onChange={e => { setLocationInput(e.target.value); setUserLocation(null); }}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button className="fh__locate" onClick={detectLocation} title="Use my location">
                    <i className="bi bi-crosshair" />
                  </button>
                </div>
                <button className="fh__search-btn" onClick={handleSearch}>Search</button>
              </div>
              {locationError && <p className="fh__location-error" role="alert">{locationError}</p>}
            </div>

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="fh__right" aria-hidden="true">
          <img
            key={activeTab}
            className="fh__bg-image"
            src={activeTab === 'services'
              ? '/images/Illustrations/Services-Finder-Hero (2).png'
              : '/images/Illustrations/Activities-Finder-Hero(2).png'}
            alt=""
          />
        </div>

      </section>

      {/* FEATURED  */}
      <section className="featured-section">
        <div className="featured-section__header">
          <span className="featured-section__eyebrow">Our Selection</span>
          <h2 className="featured-section__title">
            Featured {activeTab === 'services' ? 'Services' : 'Activities'}
          </h2>
        </div>
        <div className="featured-section__grid">
          {featuredLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="listing-card listing-card--grid">
                  <div className="listing-card__image skeleton-box" />
                  <div className="listing-card__content">
                    <div className="skeleton-line skeleton-line--title" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line skeleton-line--short" />
                  </div>
                </div>
              ))
            : featuredListings.map(l => <GridCard key={l.id} listing={l} />)}
        </div>
      </section>

      {/* SEARCH + RESULTS  */}
      <section className="finder-search">

        {/* Type icon buttons */}
        <div className="finder-search__types">
          {currentTypes.map(cat => (
            // Wrapper div: flex-column so label sits below circle in normal flow
            <div
              key={cat.label}
              className={`type-btn ${filters.type === cat.label ? 'type-btn--active' : ''}`}
              onClick={() => handleTypeClick(cat.label)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleTypeClick(cat.label)}
              title={cat.label}
            >
              <div className="type-btn__circle">
                <img src={cat.icon} alt={cat.label} />
              </div>
              <span className="type-btn__label">{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div className="finder-search__bar">
          <div className="finder-search__input-wrap">
            <svg className="finder-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or type…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="finder-search__input"
            />
            {searchQuery && (
              <button className="finder-search__clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          <div className="finder-search__input-wrap">
            <svg className="finder-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <input
              type="text"
              placeholder="Postcode, city or area…"
              value={locationInput}
              onChange={e => { setLocationInput(e.target.value); setUserLocation(null); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="finder-search__input"
            />
            {locationInput && (
              <button
                className="finder-search__clear"
                onClick={() => { setLocationInput(''); setUserLocation(null); setSearchCoords(null); }}
              >✕</button>
            )}
            <button className="finder-search__locate-btn" onClick={detectLocation} title="Use my location">
              <i className="bi bi-compass" />
            </button>
          </div>

          <button className="finder-search__button" onClick={handleSearch}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>

        {locationError && <p className="finder-search__error">{locationError}</p>}

        <p className="finder-search__context">
          {searchMeta?.locationFound
            ? `Showing results within ${searchMeta.radiusKm} km`
            : 'Showing all UK listings'}
          {filters.type   && ` · ${filters.type}`}
          {filters.newOnly && ' · New only'}
        </p>

        <button className="finder-search__filter-toggle" onClick={() => setFiltersOpen(o => !o)}>
          <i className="bi bi-funnel" />
          {filtersOpen ? 'Hide filters' : 'Filters'}
          {activeFilterCount > 0 && (
            <span className="finder-search__filter-badge">{activeFilterCount}</span>
          )}
        </button>

        {filtersOpen && (
          <div className="finder-search__filter-panel">
            <div className="filter-group">
              <p className="filter-label">Search radius</p>
              <div className="filter-chips">
                {RADIUS_OPTIONS.map(km => (
                  <button
                    key={km}
                    className={`filter-chip ${filters.radius === km ? 'filter-chip--active' : ''}`}
                    onClick={() => setFilters(f => ({ ...f, radius: km }))}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>
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
            <div className="filter-actions">
              <button className="filter-apply-btn" onClick={handleApplyFilters}>Apply filters</button>
              <button className="filter-reset-btn" onClick={() => setFilters({ radius: 10, type: '', newOnly: false })}>Reset</button>
            </div>
          </div>
        )}

        {error && <p className="finder-search__error">{error}</p>}

        {/* Map + Results side-by-side */}
        <div className="search-results-layout">
          <div className="search-results-layout__map-wrapper">
            <UnifiedMap
              listings={listings}
              userLocation={userLocation}
              searchCoords={searchCoords}
              radiusKm={searchMeta?.radiusKm ?? null}
            />
          </div>

          <div className="search-results-layout__listings">
            <h2 className="search-results__title">
              {loading
                ? 'Searching…'
                : `${listings.length} result${listings.length !== 1 ? 's' : ''}`}
              {filters.type && ` · ${filters.type}`}
              {locationInput && locationInput !== 'My location'
                ? ` near ${locationInput}`
                : locationInput === 'My location' ? ' near you' : ''}
            </h2>

            {loading && (
              <div className="finder-search__loading">
                <div className="loading-spinner" />
                <span>Finding {tabLabel.toLowerCase()}…</span>
              </div>
            )}

            {!loading && hasSearched && listings.length === 0 && (
              <div className="finder-search__empty">
                <p>No listings found. Try a wider radius or different search.</p>
                <button onClick={clearAll}>Clear all filters</button>
              </div>
            )}

            {!loading && listings.map(l => <ListingRow key={l.id} listing={l} />)}
          </div>
        </div>
      </section>

      <section className="faq">
        <h2 className="faq__title">Your questions, answered!</h2>
        <p className="faq__subtitle">
          Read more of our FAQ <a href="/faq" className="faq__link">here</a>.
        </p>
        <div className="faq__list">
          {faqData.map((faq, i) => (
            <div key={i} className={`faq__item ${openFaq === i ? 'faq__item--open' : ''}`}>
              <button className="faq__question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.question}</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="faq__icon">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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