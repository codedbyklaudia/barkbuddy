import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./BusinessDashboard.scss";
import {
  Settings, Camera, LayoutDashboard, PencilLine,
  LogOut, Lock, ChevronsRight, Trash2, Star,
  Eye, MessageSquare, CheckCircle, XCircle, ExternalLink,
  MapPin, Phone, Mail, Globe, Info,
} from 'lucide-react';
import { formatServiceType } from '../utils/formatservicetype';

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

// Types
interface Business {
  id: number; email: string; personal_name: string; business_name: string;
  category: string; type: string; address: string; postcode: string;
  contact_phone: string; contact_email: string; website: string;
  description: string; username: string; status: string;
  must_change_password: boolean; approved_at: string;
  email_verified?: boolean; username_updated_at?: string;
  price_list?: string; additional_info?: string;
}

interface Photo {
  id: number; cloudinary_url: string; caption: string; is_primary: boolean;
}

interface Review {
  id: number; user_name: string; rating: number; comment: string; created_at: string;
}

interface ReviewStats {
  average_rating: number; total_reviews: number;
}

type Section = "overview" | "profile" | "photos" | "reviews" | "listing" | "settings";

// ─── Auth helpers ─────────────────────────────────────────────────────────────
const getToken = () => {
  const token = localStorage.getItem("business_token") ?? "";
  if (!token) console.warn("[BarkBuddy] No business_token found in localStorage");
  return token;
};

const getBiz = (): Business | null => {
  try { return JSON.parse(localStorage.getItem("business_user") ?? "null"); }
  catch { return null; }
};

const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast: React.FC<{ msg: string; type: "success" | "error" }> = ({ msg, type }) => (
  <div className={`biz-toast biz-toast--${type}`}>{msg}</div>
);

// ─── Star row display ─────────────────────────────────────────────────────────
const StarRow: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => (
  <span className="biz-star-row">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={size} className={i <= Math.round(rating) ? "star--filled" : "star--empty"} />
    ))}
  </span>
);

// ─── Force password change modal ──────────────────────────────────────────────
const ForcePasswordChange: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [form, setForm]     = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoad]  = useState(false);
  const [toast, setToast]   = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoad(true);
    const res  = await fetch(`${API_BASE}/business/dashboard/password`, {
      method: "PATCH", headers: authHeader(), body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoad(false);
    if (res.ok) { onDone(); }
    else { setErrors(data.errors ?? {}); setToast(data.message ?? "Failed"); }
  };

  return (
    <div className="biz-force-overlay">
      <div className="biz-force-modal">
        <div className="biz-force-modal__header">
          <span><Lock /></span>
          <h2>Set your password</h2>
          <p>For security, please set a personal password before continuing.</p>
        </div>
        {toast && <div className="biz-force-modal__error">{toast}</div>}
        <form onSubmit={submit}>
          {[
            { name: "currentPassword", label: "Current password",     placeholder: "Your registration password" },
            { name: "newPassword",     label: "New password",         placeholder: "Min 8 chars, 1 uppercase, 1 number" },
            { name: "confirmPassword", label: "Confirm new password", placeholder: "Repeat new password" },
          ].map(f => (
            <div key={f.name} className="biz-force-field">
              <label>{f.label}</label>
              <input
                type="password" placeholder={f.placeholder}
                value={(form as any)[f.name]}
                onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
              />
              {errors[f.name] && <span className="biz-force-field__err">{errors[f.name]}</span>}
            </div>
          ))}
          <button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Set password & continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Profile section ──────────────────────────────────────────────────────────
const ProfileSection: React.FC<{
  biz: Business;
  onSaved: () => void;
  onToast: (m: string, t: "success" | "error") => void;
}> = ({ biz, onSaved, onToast }) => {
  const [form, setForm] = useState({
    businessName:   biz.business_name   || "",
    description:    biz.description     || "",
    address:        biz.address         || "",
    postcode:       biz.postcode        || "",
    contactPhone:   biz.contact_phone   || "",
    contactEmail:   biz.contact_email   || "",
    website:        biz.website         || "",
    priceList:      biz.price_list      || "",
    additionalInfo: biz.additional_info || "",
  });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors: Record<string, string> = {};
    if (!form.businessName.trim()) clientErrors.businessName = "Business name is required";
    if (!form.address.trim())      clientErrors.address      = "Address is required";
    if (!form.postcode.trim())     clientErrors.postcode     = "Postcode is required";
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return; }
    setLoading(true); setErrors({});
    const payload = {
      businessName:   form.businessName.trim(),
      description:    form.description.trim()    || "",
      address:        form.address.trim(),
      postcode:       form.postcode.trim(),
      contactPhone:   form.contactPhone.trim()   || "",
      contactEmail:   form.contactEmail.trim()   || "",
      website:        form.website.trim()        || "",
      priceList:      form.priceList.trim()      || "",
      additionalInfo: form.additionalInfo.trim() || "",
    };
    const res  = await fetch(`${API_BASE}/business/dashboard/profile`, {
      method: "PATCH", headers: authHeader(), body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { onToast("Profile saved!", "success"); onSaved(); }
    else { setErrors(data.errors ?? {}); onToast(data.message ?? "Failed to save.", "error"); }
  };

  const field = (key: keyof typeof form, label: string, placeholder = "", type = "text") => (
    <div className="biz-field-group">
      <label>{label}</label>
      <input type={type} placeholder={placeholder} value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
      {errors[key] && <span className="biz-field-group__err">{errors[key]}</span>}
    </div>
  );

  return (
    <form className="biz-section-form" onSubmit={save}>
      <div className="biz-form-grid">
        {field("businessName",  "Business name",  "Your business name")}
        {field("address",       "Address",        "Street address")}
        {field("postcode",      "Postcode",       "e.g. EC1A 1BB")}
        {field("contactPhone",  "Phone number",   "e.g. +44 20 1234 5678")}
        {field("contactEmail",  "Contact email",  "e.g. hello@yourbusiness.com", "email")}
        {field("website",       "Website",        "e.g. https://yourbusiness.com")}
      </div>
      <div className="biz-field-group biz-field-group--full">
        <label>Description <span>(shown on your listing)</span></label>
        <textarea rows={4}
          placeholder="Tell dog owners about your business, what makes you special, and what to expect…"
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        {errors.description && <span className="biz-field-group__err">{errors.description}</span>}
      </div>
      {biz.category === "services" && (
        <>
          <div className="biz-field-group biz-field-group--full">
            <label>Price list</label>
            <textarea rows={3} placeholder="e.g. Full groom from £45, Nail trim £15…"
              value={form.priceList}
              onChange={e => setForm(p => ({ ...p, priceList: e.target.value }))} />
          </div>
          <div className="biz-field-group biz-field-group--full">
            <label>Additional information</label>
            <textarea rows={3} placeholder="Opening hours, booking instructions, etc."
              value={form.additionalInfo}
              onChange={e => setForm(p => ({ ...p, additionalInfo: e.target.value }))} />
          </div>
        </>
      )}
      <button type="submit" className="biz-btn biz-btn--primary" disabled={loading}>
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
};

// ─── Photos section ───────────────────────────────────────────────────────────
const PhotosSection: React.FC<{
  bizId: number;
  onToast: (m: string, t: "success" | "error") => void;
}> = ({ bizId, onToast }) => {
  const [photos,    setPhotos]    = useState<Photo[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const res  = await fetch(`${API_BASE}/business/dashboard/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    setPhotos(data.photos ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    const res  = await fetch(`${API_BASE}/business/dashboard/photos`, {
      method: "POST", headers: { Authorization: `Bearer ${getToken()}` }, body: fd,
    });
    const data = await res.json();
    setUploading(false);
    if (res.ok) { onToast("Photo uploaded!", "success"); load(); }
    else { onToast(data.message, "error"); }
    if (fileRef.current) fileRef.current.value = "";
  };

  const deletePhoto = async (id: number) => {
    if (!confirm("Delete this photo?")) return;
    const res = await fetch(`${API_BASE}/business/dashboard/photos/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) { onToast("Photo deleted.", "success"); load(); }
    else { onToast("Failed to delete.", "error"); }
  };

  const makePrimary = async (id: number) => {
    const res = await fetch(`${API_BASE}/business/dashboard/photos/${id}/primary`, {
      method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.ok) { onToast("Cover photo updated!", "success"); load(); }
  };

  if (loading) return <div className="biz-loading">Loading photos…</div>;

  return (
    <div className="biz-photos">
      <div className="biz-photos__header">
        <p className="biz-photos__note">{photos.length}/8 photos · First photo is your cover image</p>
        {photos.length < 8 && (
          <label className="biz-btn biz-btn--primary biz-btn--upload">
            {uploading ? "Uploading…" : "+ Add photo"}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload} disabled={uploading} hidden />
          </label>
        )}
      </div>
      {photos.length === 0 ? (
        <div className="biz-photos__empty">
          <p>No photos yet</p>
          <p>Add photos to make your listing more attractive to dog owners.</p>
        </div>
      ) : (
        <div className="biz-photos__grid">
          {photos.map(p => (
            <div key={p.id} className={`biz-photo-card ${p.is_primary ? "biz-photo-card--primary" : ""}`}>
              <img src={p.cloudinary_url} alt={p.caption || "Business photo"} />
              {p.is_primary && <div className="biz-photo-card__badge">Cover</div>}
              <div className="biz-photo-card__actions">
                {!p.is_primary && (
                  <button onClick={() => makePrimary(p.id)} className="biz-photo-action">
                    <Star size={14} /> Set cover
                  </button>
                )}
                <button onClick={() => deletePhoto(p.id)} className="biz-photo-action biz-photo-action--delete">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Reviews section ──────────────────────────────────────────────────────────
const ReviewsSection: React.FC<{ bizId: number }> = ({ bizId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats,   setStats]   = useState<ReviewStats>({ average_rating: 0, total_reviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${API_BASE}/reviews/business/${bizId}`);
        const data = await res.json();
        setReviews(data.reviews ?? []);
        setStats(data.statistics ?? { average_rating: 0, total_reviews: 0 });
      } catch (e) {
        console.error("Failed to load reviews", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bizId]);

  if (loading) return <div className="biz-loading">Loading reviews…</div>;

  const avg = Number(stats.average_rating) || 0;

  return (
    <div className="biz-reviews" style={{ animation: "fadeUp 0.3s ease both" }}>
      <div className="biz-reviews__stats">
        <div className="biz-reviews__stats-score">
          <span className="biz-reviews__stats-number">{avg.toFixed(1)}</span>
          <div>
            <StarRow rating={avg} size={18} />
            <p>{stats.total_reviews} review{stats.total_reviews !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="biz-reviews__stats-bars">
          {[5,4,3,2,1].map(star => {
            const count = reviews.filter(r => r.rating === star).length;
            const pct   = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
            return (
              <div key={star} className="biz-reviews__bar-row">
                <span>{star} <Star size={11} /></span>
                <div className="biz-reviews__bar-track">
                  <div className="biz-reviews__bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="biz-reviews__bar-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="biz-reviews__empty">
          <MessageSquare size={32} />
          <p>No reviews yet</p>
          <span>When dog owners leave reviews on your listing they'll appear here.</span>
        </div>
      ) : (
        <div className="biz-reviews__list">
          {reviews.map(r => (
            <div key={r.id} className="biz-review-item">
              <div className="biz-review-item__header">
                <div className="biz-review-item__author">
                  <div className="biz-review-item__avatar">
                    {r.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="biz-review-item__name">{r.user_name}</p>
                    <p className="biz-review-item__date">
                      {new Date(r.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <StarRow rating={r.rating} size={14} />
              </div>
              <p className="biz-review-item__comment">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Listing preview section ──────────────────────────────────────────────────
const ListingPreviewSection: React.FC<{ biz: Business; bizId: number }> = ({ biz, bizId }) => {
  const [photos,  setPhotos]  = useState<Photo[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats,   setStats]   = useState<ReviewStats>({ average_rating: 0, total_reviews: 0 });
  const [loading, setLoading] = useState(true);
  const [mainPhoto, setMainPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, revRes] = await Promise.all([
          fetch(`${API_BASE}/business/dashboard/me`, { headers: { Authorization: `Bearer ${getToken()}` } }),
          fetch(`${API_BASE}/reviews/business/${bizId}`),
        ]);
        const meData  = await meRes.json();
        const revData = await revRes.json();
        const p: Photo[] = meData.photos ?? [];
        setPhotos(p);
        setMainPhoto(p.find(ph => ph.is_primary) || p[0] || null);
        setReviews(revData.reviews ?? []);
        setStats(revData.statistics ?? { average_rating: 0, total_reviews: 0 });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bizId]);

  if (loading) return <div className="biz-loading">Loading preview…</div>;

  const avg = Number(stats.average_rating) || 0;

  return (
    <div className="biz-listing-preview" style={{ animation: "fadeUp 0.3s ease both" }}>
      <div className="biz-listing-preview__notice">
        <Eye size={15} />
        <span>This is exactly how your listing appears to dog owners on BarkBuddy.</span>
        <Link
          to={`/finder/${bizId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="biz-listing-preview__open"
        >
          Open live listing <ExternalLink size={12} />
        </Link>
      </div>

      <div className="biz-listing-card">
        <div className="biz-listing-card__header">
          <span className="biz-listing-card__badge">
            {formatServiceType(biz.type)}
          </span>
          <h2 className="biz-listing-card__name">{biz.business_name}</h2>
          <p className="biz-listing-card__address">
            <MapPin size={13} /> {biz.address}, {biz.postcode}
          </p>
          {avg > 0 && (
            <div className="biz-listing-card__rating">
              <StarRow rating={avg} size={14} />
              <span>{avg.toFixed(1)}</span>
              <span className="biz-listing-card__rating-count">({stats.total_reviews})</span>
            </div>
          )}
        </div>

        {photos.length > 0 && (
          <div className="biz-listing-card__gallery">
            <div className="biz-listing-card__photo-main">
              {mainPhoto && <img src={mainPhoto.cloudinary_url} alt={biz.business_name} />}
            </div>
            {photos.length > 1 && (
              <div className="biz-listing-card__photo-grid">
                {photos.filter(p => p !== mainPhoto).slice(0, 4).map((p, i) => (
                  <div
                    key={p.id}
                    className="biz-listing-card__photo-thumb"
                    onClick={() => setMainPhoto(p)}
                    role="button"
                    title="Click to preview"
                  >
                    <img src={p.cloudinary_url} alt={`Photo ${i + 2}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="biz-listing-card__details">
          {biz.contact_phone && (
            <div className="biz-listing-card__detail-row">
              <Phone size={14} /><span>{biz.contact_phone}</span>
            </div>
          )}
          {biz.contact_email && (
            <div className="biz-listing-card__detail-row">
              <Mail size={14} /><span>{biz.contact_email}</span>
            </div>
          )}
          {biz.website && (
            <div className="biz-listing-card__detail-row">
              <Globe size={14} />
              <a href={biz.website} target="_blank" rel="noopener noreferrer">{biz.website}</a>
            </div>
          )}
        </div>

        {biz.description && (
          <div className="biz-listing-card__description">
            <h3><Info size={15} /> About</h3>
            <p>{biz.description}</p>
          </div>
        )}
        {biz.price_list && (
          <div className="biz-listing-card__description">
            <h3>Price list</h3>
            <p style={{ whiteSpace: "pre-line" }}>{biz.price_list}</p>
          </div>
        )}
        {biz.additional_info && (
          <div className="biz-listing-card__description">
            <h3>Additional information</h3>
            <p style={{ whiteSpace: "pre-line" }}>{biz.additional_info}</p>
          </div>
        )}

        <div className="biz-listing-card__reviews">
          <h3>Reviews ({stats.total_reviews})</h3>
          {reviews.length === 0 ? (
            <p className="biz-listing-card__no-reviews">No reviews yet.</p>
          ) : (
            <div className="biz-listing-card__review-list">
              {reviews.slice(0, 3).map(r => (
                <div key={r.id} className="biz-listing-card__review-item">
                  <div className="biz-listing-card__review-meta">
                    <strong>{r.user_name}</strong>
                    <StarRow rating={r.rating} size={12} />
                  </div>
                  <p>{r.comment}</p>
                  <span>{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              ))}
              {reviews.length > 3 && (
                <p className="biz-listing-card__more-reviews">+{reviews.length - 3} more reviews</p>
              )}
            </div>
          )}
        </div>

        {(!biz.description || !biz.contact_phone || photos.length === 0) && (
          <div className="biz-listing-card__nudges">
            <p className="biz-listing-card__nudge-title">💡 Complete your listing to attract more clients:</p>
            <ul>
              {!biz.description   && <li>Add a description</li>}
              {!biz.contact_phone && <li>Add a phone number</li>}
              {photos.length === 0 && <li>Upload at least one photo</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Settings section ─────────────────────────────────────────────────────────
const SettingsSection: React.FC<{
  biz: Business;
  onToast: (m: string, t: "success" | "error") => void;
  onUsernameChange: (u: string) => void;
}> = ({ biz, onToast, onUsernameChange }) => {
  const [username,    setUsername]    = useState(biz.username);
  const [usernameErr, setUsernameErr] = useState("");
  const [savingUser,  setSavingUser]  = useState(false);

  const usernameNextAllowed = biz.username_updated_at
    ? new Date(new Date(biz.username_updated_at).getTime() + 30 * 24 * 60 * 60 * 1000)
    : null;
  const usernameLocked = usernameNextAllowed ? new Date() < usernameNextAllowed : false;
  const usernameNextDate = usernameNextAllowed
    ? usernameNextAllowed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const [pwForm,   setPwForm]   = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [savingPw, setSavingPw] = useState(false);

  const saveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    const res  = await fetch(`${API_BASE}/business/dashboard/username`, {
      method: "PATCH", headers: authHeader(), body: JSON.stringify({ username }),
    });
    const data = await res.json();
    setSavingUser(false);
    if (res.ok) { onToast("Username updated!", "success"); onUsernameChange(data.username); }
    else { setUsernameErr(data.message); }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    const res  = await fetch(`${API_BASE}/business/dashboard/password`, {
      method: "PATCH", headers: authHeader(), body: JSON.stringify(pwForm),
    });
    const data = await res.json();
    setSavingPw(false);
    if (res.ok) {
      onToast("Password changed!", "success");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setPwErrors(data.errors ?? {}); onToast(data.message, "error");
    }
  };

  const isVerified = biz.email_verified !== false;

  return (
    <div className="biz-settings">
      <div className="biz-settings-card">
        <h3>Username</h3>
        <p>Letters, numbers, and hyphens only. Can be changed once every 30 days.</p>
        {usernameLocked ? (
          <div className="biz-username-locked">
            <Lock size={14} />
            <span>Username locked until <strong>{usernameNextDate}</strong></span>
          </div>
        ) : (
          <form className="biz-settings-card__form" onSubmit={saveUsername}>
            <input type="text" value={username}
              onChange={e => { setUsername(e.target.value); setUsernameErr(""); }}
              placeholder="your-username" autoCapitalize="none" spellCheck={false} />
            {usernameErr && <span className="biz-settings-card__err">{usernameErr}</span>}
            <button type="submit" className="biz-btn biz-btn--primary" disabled={savingUser}>
              {savingUser ? "Saving…" : "Update username"}
            </button>
          </form>
        )}
      </div>

      <div className="biz-settings-card">
        <h3>Change password</h3>
        <p>Use at least 8 characters, one uppercase letter, and one number.</p>
        <form className="biz-settings-card__form" onSubmit={savePassword}>
          {[
            { key: "currentPassword", label: "Current password" },
            { key: "newPassword",     label: "New password" },
            { key: "confirmPassword", label: "Confirm new password" },
          ].map(f => (
            <div key={f.key} className="biz-settings-card__field">
              <label>{f.label}</label>
              <input type="password" value={(pwForm as any)[f.key]}
                onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} />
              {pwErrors[f.key] && <span className="biz-settings-card__err">{pwErrors[f.key]}</span>}
            </div>
          ))}
          <button type="submit" className="biz-btn biz-btn--primary" disabled={savingPw}>
            {savingPw ? "Saving…" : "Change password"}
          </button>
        </form>
      </div>

      <div className="biz-settings-card biz-settings-card--info">
        <h3>Account info</h3>
        <div className="biz-info-rows">
          <div>
            <span>Email</span>
            <strong className="biz-info-email-row">
              {biz.email}
              {isVerified ? (
                <span className="biz-email-verified"><CheckCircle size={13} /> Verified</span>
              ) : (
                <span className="biz-email-unverified"><XCircle size={13} /> Not verified - check your inbox</span>
              )}
            </strong>
          </div>
          <div><span>Business type</span><strong>{biz.category} — {biz.type}</strong></div>
          <div><span>Status</span><strong className="biz-status-approved">Approved</strong></div>
          {biz.approved_at && (
            <div>
              <span>Listed since</span>
              <strong>
                {new Date(biz.approved_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const BusinessDashboard: React.FC = () => {
  const navigate  = useNavigate();
  const [biz,     setBiz]     = useState<Business | null>(getBiz());
  const [section, setSection] = useState<Section>("overview");
  const [toast,   setToast]   = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const logout = () => {
    localStorage.removeItem("business_token");
    localStorage.removeItem("business_user");
    navigate("/business/login");
  };

  const loadMe = async () => {
    const token = getToken();

    // ── Debug logs — remove once confirmed working ──
    console.log("[BarkBuddy] API_BASE:", API_BASE);
    console.log("[BarkBuddy] Token present:", !!token);
    console.log("[BarkBuddy] Token value:", token ? token.substring(0, 20) + "…" : "MISSING");

    if (!token) {
      console.warn("[BarkBuddy] No token — redirecting to login");
      navigate("/business/login");
      return;
    }

    try {
      setLoadError("");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API_BASE}/business/dashboard/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      console.log("[BarkBuddy] /dashboard/me status:", res.status);

      if (res.status === 401) {
        console.warn("[BarkBuddy] 401 — token invalid or expired, logging out");
        logout();
        return;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error("[BarkBuddy] Dashboard error:", res.status, errText);
        setLoadError(`Server error (${res.status}). Please try refreshing.`);
        return;
      }

      const data = await res.json();
      console.log("[BarkBuddy] Dashboard data received:", !!data.business);
      setBiz(data.business);
      localStorage.setItem("business_user", JSON.stringify(data.business));
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.error("[BarkBuddy] Request timed out");
        setLoadError("Request timed out. The server may be waking up — please refresh in a moment.");
      } else {
        console.error("[BarkBuddy] Dashboard load failed:", err);
        setLoadError("Failed to connect. Please check your connection and refresh.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) { navigate("/business/login"); return; }
    loadMe();
  }, []);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="biz-dash-loading">
        <div className="biz-dash-loading__spinner" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  // ── Error state — shown instead of blank screen ──
  if (loadError) {
    return (
      <div className="biz-dash-loading">
        <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{loadError}</p>
        <button
          onClick={() => { setLoading(true); setLoadError(""); loadMe(); }}
          style={{
            padding: "10px 24px", borderRadius: "8px", border: "none",
            background: "#6d5acd", color: "#fff", cursor: "pointer", fontSize: "0.9rem",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!biz) {
    return (
      <div className="biz-dash-loading">
        <p>Something went wrong. <button onClick={logout}>Log in again</button></p>
      </div>
    );
  }

  if (biz.must_change_password) {
    return (
      <ForcePasswordChange
        onDone={() => { setBiz(b => b ? { ...b, must_change_password: false } : b); loadMe(); }}
      />
    );
  }

  const navItems: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview",     icon: <LayoutDashboard /> },
    { key: "listing",  label: "My listing",   icon: <Eye /> },
    { key: "reviews",  label: "My reviews",   icon: <MessageSquare /> },
    { key: "photos",   label: "Photos",       icon: <Camera /> },
    { key: "profile",  label: "Edit listing", icon: <PencilLine /> },
    { key: "settings", label: "Settings",     icon: <Settings /> },
  ];

  const mobileNavItems: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: "listing",  label: "My Listing",  icon: <Eye /> },
    { key: "reviews",  label: "Reviews",     icon: <MessageSquare /> },
    { key: "photos",   label: "Photos",      icon: <Camera /> },
    { key: "profile",  label: "Edit",        icon: <PencilLine /> },
    { key: "settings", label: "Settings",    icon: <Settings /> },
  ];

  const firstName  = biz.personal_name.split(" ")[0];
  const isVerified = biz.email_verified !== false;

  return (
    <div className="biz-dash">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── Mobile top bar ── */}
      <header className="biz-dash__mobile-header">
        <Link to="/" className="biz-dash__mobile-header-logo">
          <img src="/images/logo.png" alt="BarkBuddy" />
          <span>BarkBuddy</span>
        </Link>
        <button
          className="biz-dash__mobile-header-identity"
          onClick={() => setSection("overview")}
          aria-label="Go to overview"
        >
          <div className="biz-dash__mobile-header-avatar">
            {biz.business_name.charAt(0).toUpperCase()}
          </div>
          <span className="biz-dash__mobile-header-name">{biz.business_name}</span>
        </button>
      </header>

      {/* ── Desktop sidebar ── */}
      <aside className="biz-dash__sidebar">
        <div className="biz-dash__sidebar-top">
          <Link to="/" className="biz-dash__logo">
            <img src="/images/logo.png" alt="BarkBuddy" />
          </Link>

          <div className="biz-dash__biz-card">
            <div className="biz-dash__biz-avatar">
              {biz.business_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="biz-dash__biz-name">{biz.business_name}</p>
              <p className="biz-dash__biz-username">@{biz.username}</p>
            </div>
          </div>

          <div className="biz-dash__badge">
            <span className="biz-dash__badge-dot" />
            Live · {biz.category}
          </div>

          <nav className="biz-dash__nav">
            {navItems.map(n => (
              <button
                key={n.key}
                className={`biz-dash__nav-item ${section === n.key ? "biz-dash__nav-item--active" : ""}`}
                onClick={() => setSection(n.key)}
              >
                {n.icon}
                {n.label}
              </button>
            ))}
          </nav>
        </div>

        <button className="biz-dash__logout" onClick={logout}>
          <LogOut size={15} /> Log out
        </button>
      </aside>

      {/* ── Main content ── */}
      <main className="biz-dash__main">
        <div className="biz-dash__main-inner">

          {section === "overview" && (
            <div className="biz-overview">
              {!isVerified && (
                <div className="biz-overview__verify-warning">
                  <XCircle size={16} />
                  <span>Your email address hasn't been verified yet. Check your inbox for the verification link.</span>
                </div>
              )}

              <div className="biz-overview__welcome">
                <div className="biz-overview__welcome-content">
                  <div className="biz-overview__welcome-text">
                    <h1>Welcome back, {firstName}</h1>
                    <p>Your listing is live and visible to dog owners across the UK.</p>
                  </div>
                  <div className="biz-overview__welcome-status">
                    <span /><span>Live</span>
                  </div>
                </div>
              </div>

              <div className="biz-overview__cards">
                {[
                  { key: "profile"  as Section, icon: <PencilLine />,    title: "Edit listing",     desc: "Update your description, contact details, prices, and address.", cta: "Edit" },
                  { key: "photos"   as Section, icon: <Camera />,        title: "Manage photos",    desc: "Add photos to make your listing stand out. Up to 8 photos allowed.", cta: "Photos" },
                  { key: "listing"  as Section, icon: <Eye />,           title: "My listing",       desc: "See exactly how your listing looks to dog owners.", cta: "Preview" },
                  { key: "reviews"  as Section, icon: <MessageSquare />, title: "My reviews",       desc: "Read reviews left by dog owners on your listing.", cta: "Reviews" },
                  { key: "settings" as Section, icon: <Settings />,      title: "Account settings", desc: "Change your username or password.", cta: "Settings" },
                ].map(card => (
                  <div key={card.key} className="biz-overview-card" onClick={() => setSection(card.key)}>
                    <span className="biz-overview-card__icon">{card.icon}</span>
                    <div className="biz-overview-card__content">
                      <h3>{card.title}</h3>
                      <p>{card.desc}</p>
                    </div>
                    <span className="biz-overview-card__link">
                      {card.cta} <ChevronsRight size={15} />
                    </span>
                  </div>
                ))}
              </div>

              <div className="biz-overview__listing-preview">
                <h2>Your listing details</h2>
                <div className="biz-info-rows">
                  <div><span>Business</span><strong>{biz.business_name}</strong></div>
                  <div><span>Category</span><strong>{biz.category} — {biz.type}</strong></div>
                  <div><span>Address</span><strong>{biz.address}, {biz.postcode}</strong></div>
                  {biz.contact_phone && <div><span>Phone</span><strong>{biz.contact_phone}</strong></div>}
                  {biz.website && (
                    <div><span>Website</span><strong>
                      <a href={biz.website} target="_blank" rel="noopener noreferrer">{biz.website}</a>
                    </strong></div>
                  )}
                  {biz.description && <div><span>Description</span><strong>{biz.description}</strong></div>}
                </div>
                {!biz.description && (
                  <div className="biz-overview__nudge">
                    💡 Add a description to help dog owners learn about your business.
                    <button onClick={() => setSection("profile")}>Add description →</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {section === "profile" && (
            <>
              <h1 className="biz-dash__page-title">Edit listing</h1>
              <p className="biz-dash__page-sub">Changes appear on your public listing immediately.</p>
              <ProfileSection biz={biz} onSaved={loadMe} onToast={showToast} />
            </>
          )}

          {section === "photos" && (
            <>
              <h1 className="biz-dash__page-title">Photos</h1>
              <p className="biz-dash__page-sub">Add up to 8 photos. The first photo is your cover image.</p>
              <PhotosSection bizId={biz.id} onToast={showToast} />
            </>
          )}

          {section === "listing" && (
            <>
              <h1 className="biz-dash__page-title">My listing</h1>
              <p className="biz-dash__page-sub">This is how your business looks to dog owners on BarkBuddy.</p>
              <ListingPreviewSection biz={biz} bizId={biz.id} />
            </>
          )}

          {section === "reviews" && (
            <>
              <h1 className="biz-dash__page-title">My reviews</h1>
              <p className="biz-dash__page-sub">Reviews left by dog owners on your listing.</p>
              <ReviewsSection bizId={biz.id} />
            </>
          )}

          {section === "settings" && (
            <>
              <h1 className="biz-dash__page-title">Account settings</h1>
              <p className="biz-dash__page-sub">Manage your login credentials.</p>
              <SettingsSection
                biz={biz}
                onToast={showToast}
                onUsernameChange={u => setBiz(b => b ? { ...b, username: u } : b)}
              />
            </>
          )}

        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="biz-dash__mobile-nav">
        {mobileNavItems.map(n => (
          <button
            key={n.key}
            className={`biz-dash__mobile-nav-item ${section === n.key ? "biz-dash__mobile-nav-item--active" : ""}`}
            onClick={() => setSection(n.key)}
          >
            {n.icon}
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default BusinessDashboard;