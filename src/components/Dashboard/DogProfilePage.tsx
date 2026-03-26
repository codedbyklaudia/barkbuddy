import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./DogProfilePage.scss";
import { getPublicDogProfile } from "../../api/Dogs";
import type { PublicDogProfile } from "../../api/Dogs";

// ─── Personality image map ────────────────────────────────────────────────────

const PERSONALITY_MAP: Record<string, { label: string; img: string }> = {
  game_fetch:     { label: "Ball chaser",      img: "../images/personality/ball.png"          },
  game_tug:       { label: "Tug of war",        img: "../images/personality/tug.png"           },
  game_chase:     { label: "Chasing sticks",    img: "../images/personality/chase.png"         },
  game_hide:      { label: "Hide & seek",       img: "../images/personality/hide_and_seek.png" },
  game_chill:     { label: "Just chilling",     img: "../images/personality/chill.png"         },
  loves_cuddles:  { label: "Cuddles",           img: "../images/personality/cuddles.png"       },
  loves_treats:   { label: "Tricks for treats", img: "../images/personality/treats.png"        },
  loves_walks:    { label: "Walkies",           img: "../images/personality/walks.png"         },
  loves_friends:  { label: "Making friends",    img: "../images/personality/friends.png"       },
  loves_sleep:    { label: "Sleeping",          img: "../images/personality/sleep.png"         },
  pers_energetic: { label: "High-energy",       img: "../images/personality/high_energy.png"   },
  pers_gentle:    { label: "Gentle",            img: "../images/personality/gentle.png"        },
  pers_cuddly:    { label: "Cuddly",            img: "../images/personality/cuddly.png"        },
  pers_playful:   { label: "Playful",           img: "../images/personality/playful.png"       },
  pers_stubborn:  { label: "A little stubborn", img: "../images/personality/stubborn.png"      },
};

// Detail card illustrations — matching your existing detail cards
const DETAIL_ILLUSTRATIONS: Record<string, { bg: string; img: string }> = {
  details: { bg: "#b8cfe0", img: "../images/details-dog.png"     },
  medical: { bg: "#e8c4c4", img: "../images/details-medical.png" },
  eating:  { bg: "#c4d9c4", img: "../images/details-food.png"    },
};

const STAGE_LABEL: Record<string, string> = {
  puppy:  "Puppy 🐣",
  adult:  "Adult 🐕",
  senior: "Senior 🏆",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAge(dob?: string): string {
  if (!dob) return "";
  const months = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 1)  return "< 1 month";
  if (months < 24) return `${months} month${months !== 1 ? "s" : ""}`;
  const yrs = Math.floor(months / 12);
  const rem  = months % 12;
  return rem > 0 ? `${yrs}y ${rem}m` : `${yrs} year${yrs !== 1 ? "s" : ""}`;
}

function humanYears(dob?: string): string {
  if (!dob) return "";
  const ageYrs = (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const h = ageYrs <= 1 ? ageYrs * 12
    : ageYrs <= 2 ? 12 + (ageYrs - 1) * 12
    : 24 + (ageYrs - 2) * 4;
  return `≈ ${Math.round(h)} human years`;
}

// ─── Postcard — the html2canvas capture target ────────────────────────────────

const Postcard: React.FC<{ dog: PublicDogProfile }> = ({ dog }) => {
  const age    = calcAge(dog.dob);
  const human  = humanYears(dog.dob);
  const gender = dog.gender === "male" ? "♂" : "♀";

  const chips = dog.personality
    .map(k => ({ key: k, ...PERSONALITY_MAP[k] }))
    .filter(c => c.label);

  const hasDetails = dog.weight || dog.activityLevel || dog.bodyCondition || dog.neutered;
  const hasMedical = dog.allergies || dog.healthIssues || dog.medications;
  const hasEating  = dog.eatingStyle || dog.treatsPerDay || dog.feedingTimes;

  return (
    <div className="dpc-card">

      {/* Hero */}
      <div className="dpc-hero">
        <div className="dpc-photo-wrap">
          {dog.avatarUrl
            ? <img src={dog.avatarUrl} alt={dog.name} crossOrigin="anonymous" className="dpc-photo" />
            : <div className="dpc-photo-placeholder">🐾</div>}
        </div>

        <div className="dpc-hero-info">
          <h1 className="dpc-name">
            {dog.name} <span className="dpc-gender">{gender}</span>
          </h1>
          <p className="dpc-breed">{dog.breed}</p>
          {age && (
            <p className="dpc-age">
              <strong>{age}</strong>
              {human && <span className="dpc-human-age"> {human}</span>}
            </p>
          )}

          {/* Owner row */}
          <div className="dpc-owner-row">
            <div className="dpc-owner-avatar">
              {dog.ownerAvatar
                ? <img src={dog.ownerAvatar} alt={dog.ownerName} crossOrigin="anonymous" />
                : <span>{dog.ownerName.charAt(0).toUpperCase()}</span>}
            </div>
            <div className="dpc-owner-text">
              <span className="dpc-owner-label">Owner</span>
              <span className="dpc-owner-name">{dog.ownerName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Personality chips — matching your dog page style exactly ── */}
      {chips.length > 0 && (
        <div className="dpc-section">
          <h3 className="dpc-section-title">Personality</h3>
          <div className="dpc-personality-grid">
            {chips.map((c) => (
              <div key={c.key} className="dpc-personality-chip">
                <div className="dpc-chip-img-wrap">
                  <img
                    src={c.img}
                    alt={c.label}
                    crossOrigin="anonymous"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <span className="dpc-chip-label">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Detail cards — matching your detail card illustrations ── */}
      {(hasDetails || hasMedical || hasEating) && (
        <div className="dpc-section">
          <h3 className="dpc-section-title">{dog.name}'s details</h3>
          <div className="dpc-detail-cards">

            {hasDetails && (
              <div className="dpc-detail-card">
                <div
                  className="dpc-detail-card-img"
                  style={{ background: DETAIL_ILLUSTRATIONS.details.bg }}
                >
                  <img
                    src={DETAIL_ILLUSTRATIONS.details.img}
                    alt="Details"
                    crossOrigin="anonymous"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div className="dpc-detail-card-body">
                  <p className="dpc-detail-card-title">Details</p>
                  <ul className="dpc-detail-list">
                    {dog.weight        && <li><span className="dpc-detail-key">Weight: </span>{dog.weight}</li>}
                    {dog.bodyCondition && <li><span className="dpc-detail-key">Condition: </span>{dog.bodyCondition}</li>}
                    {dog.activityLevel && <li><span className="dpc-detail-key">Activity: </span>{dog.activityLevel}</li>}
                    {dog.neutered      && <li><span className="dpc-detail-key">Neutered: </span>{dog.neutered}</li>}
                  </ul>
                </div>
              </div>
            )}

            {hasMedical && (
              <div className="dpc-detail-card">
                <div
                  className="dpc-detail-card-img"
                  style={{ background: DETAIL_ILLUSTRATIONS.medical.bg }}
                >
                  <img
                    src={DETAIL_ILLUSTRATIONS.medical.img}
                    alt="Medical"
                    crossOrigin="anonymous"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div className="dpc-detail-card-body">
                  <p className="dpc-detail-card-title">Medical info</p>
                  <ul className="dpc-detail-list">
                    {dog.allergies    && <li><span className="dpc-detail-key">Allergies: </span>{dog.allergies}</li>}
                    {dog.healthIssues && dog.healthIssues.toLowerCase() !== "none" && <li><span className="dpc-detail-key">Health: </span>{dog.healthIssues}</li>}
                    {dog.medications  && dog.medications.toLowerCase()  !== "none" && <li><span className="dpc-detail-key">Medications: </span>{dog.medications}</li>}
                  </ul>
                </div>
              </div>
            )}

            {hasEating && (
              <div className="dpc-detail-card">
                <div
                  className="dpc-detail-card-img"
                  style={{ background: DETAIL_ILLUSTRATIONS.eating.bg }}
                >
                  <img
                    src={DETAIL_ILLUSTRATIONS.eating.img}
                    alt="Eating"
                    crossOrigin="anonymous"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div className="dpc-detail-card-body">
                  <p className="dpc-detail-card-title">Eating habits</p>
                  <ul className="dpc-detail-list">
                    {dog.eatingStyle  && <li><span className="dpc-detail-key">Eating Style: </span>{dog.eatingStyle}</li>}
                    {dog.treatsPerDay && <li><span className="dpc-detail-key">Treats: </span>{dog.treatsPerDay}</li>}
                    {dog.feedingTimes && <li><span className="dpc-detail-key">Feeding Times: </span>{dog.feedingTimes}</li>}
                  </ul>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

// Page wrapper 

const DogProfilePage: React.FC = () => {
  const { dogId } = useParams<{ dogId: string }>();
  const cardRef   = useRef<HTMLDivElement>(null);

  const [dog,         setDog]         = useState<PublicDogProfile | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);

  useEffect(() => {
    if (!dogId) { setNotFound(true); setLoading(false); return; }
    getPublicDogProfile(dogId)
      .then(({ dog }) => setDog(dog))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [dogId]);


  // Loading 
  if (loading) {
    return (
      <div className="dpp-root">
        <div className="dpp-loading">
          <div className="dpp-spinner" />
          <p>Loading {dogId ? "profile" : "…"}</p>
        </div>
      </div>
    );
  }

  if (notFound || !dog) {
    return (
      <div className="dpp-root">
        <div className="dpp-notfound">
          <span className="dpp-notfound-emoji">🐾</span>
          <h1>Woof — not found!</h1>
          <p>This dog profile doesn't exist or has been removed.</p>
          <a href="/" className="dpp-home-btn">← Back to BarkBuddy</a>
        </div>
      </div>
    );
  }

  // Main
  return (
    <div className="dpp-root">

      {/* Soft background matching app */}
      <div className="dpp-bg" aria-hidden>
        <div className="dpp-blob dpp-blob-1" />
        <div className="dpp-blob dpp-blob-2" />
      </div>

      {/* Postcard — html2canvas captures this div */}
      <div className="dpp-stage">
        <div ref={cardRef}>
          <Postcard dog={dog} />
        </div>
      </div>
    </div>
  );
};

export default DogProfilePage;