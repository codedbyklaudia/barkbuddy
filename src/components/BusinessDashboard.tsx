import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./BusinessDashboard.scss";
import { Settings, Camera, LayoutDashboard, PencilLine, LogOut, Lock, ChevronsRight,Trash2, Star   } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

// Types
interface Business {
  id: number; email: string; personal_name: string; business_name: string;
  category: string; type: string; address: string; postcode: string;
  contact_phone: string; contact_email: string; website: string;
  description: string; username: string; status: string;
  must_change_password: boolean; approved_at: string;
  price_list?: string; additional_info?: string;
}

interface Photo {
  id: number; cloudinary_url: string; caption: string; is_primary: boolean;
}

type Section = "overview" | "profile" | "photos" | "settings";

// Auth helpers
const getToken  = () => localStorage.getItem("business_token") ?? "";
const getBiz    = (): Business | null => {
  try { return JSON.parse(localStorage.getItem("business_user") ?? "null"); }
  catch { return null; }
};
const authHeader = () => ({ Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" });

// Toast 
const Toast: React.FC<{ msg: string; type: "success" | "error" }> = ({ msg, type }) => (
  <div className={`biz-toast biz-toast--${type}`}>{msg}</div>
);

// Force password change modal
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
          <p>For security, please set a personal password before continuing. Your current password was set during registration.</p>
        </div>
        {toast && <div className="biz-force-modal__error">{toast}</div>}
        <form onSubmit={submit}>
          {[
            { name: "currentPassword", label: "Current password", placeholder: "Your registration password" },
            { name: "newPassword",     label: "New password",     placeholder: "Min 8 chars, 1 uppercase, 1 number" },
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

// Profile section
const ProfileSection: React.FC<{ biz: Business; onSaved: () => void; onToast: (m: string, t: "success"|"error") => void }> = ({ biz, onSaved, onToast }) => {
  const [form, setForm]     = useState({
    businessName:  biz.business_name  || "",
    description:   biz.description    || "",
    address:       biz.address        || "",
    postcode:      biz.postcode       || "",
    contactPhone:  biz.contact_phone  || "",
    contactEmail:  biz.contact_email  || "",
    website:       biz.website        || "",
    priceList:     biz.price_list     || "",
    additionalInfo: biz.additional_info || "",
  });
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res  = await fetch(`${API_BASE}/business/dashboard/profile`, {
      method: "PATCH", headers: authHeader(), body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { onToast("Profile saved!", "success"); onSaved(); }
    else { setErrors(data.errors ?? {}); onToast(data.message, "error"); }
  };

  const field = (key: keyof typeof form, label: string, placeholder = "", type = "text") => (
    <div className="biz-field-group">
      <label>{label}</label>
      <input
        type={type} placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
      />
      {errors[key] && <span className="biz-field-group__err">{errors[key]}</span>}
    </div>
  );

  return (
    <form className="biz-section-form" onSubmit={save}>
      <div className="biz-form-grid">
        {field("businessName",  "Business name",    "Your business name")}
        {field("address",       "Address",          "Street address")}
        {field("postcode",      "Postcode",         "e.g. EC1A 1BB")}
        {field("contactPhone",  "Phone number",     "e.g. +44 20 1234 5678")}
        {field("contactEmail",  "Contact email",    "e.g. hello@yourbusiness.com", "email")}
        {field("website",       "Website",          "e.g. https://yourbusiness.com")}
      </div>

      <div className="biz-field-group biz-field-group--full">
        <label>Description <span>(shown on your listing)</span></label>
        <textarea
          rows={4}
          placeholder="Tell dog owners about your business, what makes you special, and what to expect…"
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
        />
      </div>

      {biz.category === "services" && (
        <>
          <div className="biz-field-group biz-field-group--full">
            <label>Price list </label>
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

// Photos section
const PhotosSection: React.FC<{ bizId: number; onToast: (m: string, t: "success"|"error") => void }> = ({ bizId, onToast }) => {
  const [photos,   setPhotos]   = useState<Photo[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [uploading,setUploading]= useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const res  = await fetch(`${API_BASE}/business/dashboard/me`, { headers: { Authorization: `Bearer ${getToken()}` } });
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
                    <Star size={"16"}/> Set as cover
                  </button>
                )}
                <button onClick={() => deletePhoto(p.id)} className="biz-photo-action biz-photo-action--delete">
                 <Trash2 size={"16"} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Settings section
const SettingsSection: React.FC<{ biz: Business; onToast: (m: string, t: "success"|"error") => void; onUsernameChange: (u: string) => void }> = ({ biz, onToast, onUsernameChange }) => {
  const [username,    setUsername]    = useState(biz.username);
  const [usernameErr, setUsernameErr] = useState("");
  const [savingUser,  setSavingUser]  = useState(false);

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
    if (res.ok) { onToast("Password changed!", "success"); setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }
    else { setPwErrors(data.errors ?? {}); onToast(data.message, "error"); }
  };

  return (
    <div className="biz-settings">
      {/* Username */}
      <div className="biz-settings-card">
        <h3>Username</h3>
        <p>This is what you use to log in. Letters, numbers, and hyphens only.</p>
        <form className="biz-settings-card__form" onSubmit={saveUsername}>
          <input
            type="text" value={username}
            onChange={e => { setUsername(e.target.value); setUsernameErr(""); }}
            placeholder="your-username"
            autoCapitalize="none" spellCheck={false}
          />
          {usernameErr && <span className="biz-settings-card__err">{usernameErr}</span>}
          <button type="submit" className="biz-btn biz-btn--primary" disabled={savingUser}>
            {savingUser ? "Saving…" : "Update username"}
          </button>
        </form>
      </div>

      {/* Password */}
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
              <input
                type="password"
                value={(pwForm as any)[f.key]}
                onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
              />
              {pwErrors[f.key] && <span className="biz-settings-card__err">{pwErrors[f.key]}</span>}
            </div>
          ))}
          <button type="submit" className="biz-btn biz-btn--primary" disabled={savingPw}>
            {savingPw ? "Saving…" : "Change password"}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="biz-settings-card biz-settings-card--info">
        <h3>Account info</h3>
        <div className="biz-info-rows">
          <div><span>Email</span><strong>{biz.email}</strong></div>
          <div><span>Business type</span><strong>{biz.category} — {biz.type}</strong></div>
          <div><span>Status</span><strong className="biz-status-approved">Approved</strong></div>
          {biz.approved_at && <div><span>Listed since</span><strong>{new Date(biz.approved_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</strong></div>}
        </div>
      </div>
    </div>
  );
};

// Main dashboard
const BusinessDashboard: React.FC = () => {
  const navigate  = useNavigate();
  const [biz,     setBiz]     = useState<Business | null>(getBiz());
  const [section, setSection] = useState<Section>("overview");
  const [toast,   setToast]   = useState<{ msg: string; type: "success"|"error" } | null>(null);
  const [loading, setLoading] = useState(true);

  // Show toast for 3s
  const showToast = (msg: string, type: "success"|"error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const logout = () => {
    localStorage.removeItem("business_token");
    localStorage.removeItem("business_user");
    navigate("/business/login");
  };

  // Load fresh data from server
  const loadMe = async () => {
    const res = await fetch(`${API_BASE}/business/dashboard/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (res.status === 401) { logout(); return; }
    const data = await res.json();
    setBiz(data.business);
    localStorage.setItem("business_user", JSON.stringify(data.business));
    setLoading(false);
  };

  useEffect(() => {
    if (!getToken()) { navigate("/business/login"); return; }
    loadMe();
  }, []);

  if (!biz || loading) {
    return (
      <div className="biz-dash-loading">
        <div className="biz-dash-loading__spinner" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  // Force password change on first login
  if (biz.must_change_password) {
    return <ForcePasswordChange onDone={() => { setBiz(b => b ? { ...b, must_change_password: false } : b); loadMe(); }} />;
  }

  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: "overview", label: "Overview",    icon: <LayoutDashboard /> },
    { key: "profile",  label: "Edit listing", icon: <PencilLine /> },
    { key: "photos",   label: "Photos",       icon: <Camera /> },
    { key: "settings", label: "Settings",     icon: <Settings /> },
  ];

  return (
    <div className="biz-dash">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Sidebar */}
      <aside className="biz-dash__sidebar">
        <div className="biz-dash__sidebar-top">
          <Link to="/" className="biz-dash__logo">
            <img src="/images/logo.png" alt="Logo" />
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
            Listed · {biz.category}
          </div>

          <nav className="biz-dash__nav">
            {navItems.map(n => (
              <button
                key={n.key}
                className={`biz-dash__nav-item ${section === n.key ? "biz-dash__nav-item--active" : ""}`}
                onClick={() => setSection(n.key)}
              >
                <span>{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>
        </div>

        <button className="biz-dash__logout" onClick={logout}> <LogOut size={"16"} /> Log out</button>
      </aside>

      {/* Main content */}
      <main className="biz-dash__main">
        <div className="biz-dash__main-inner">

          {/* Overview */}
          {section === "overview" && (
            <div className="biz-overview">
              <h1 className="biz-dash__page-title">Welcome back, {biz.personal_name.split(" ")[0]}</h1>
              <p className="biz-dash__page-sub">Your listing is live and visible to dog owners.</p>

              <div className="biz-overview__cards">
                <div className="biz-overview-card" onClick={() => setSection("profile")}>
                  <span className="biz-overview-card__icon"><PencilLine/></span>
                  <h3>Edit listing</h3>
                  <p>Update your description, contact details, prices, and address.</p>
                  <span className="biz-overview-card__link">Edit <ChevronsRight size={"16"}/></span>
                </div>
                <div className="biz-overview-card" onClick={() => setSection("photos")}>
                  <span className="biz-overview-card__icon"><Camera /></span>
                  <h3>Manage photos</h3>
                  <p>Add photos to make your listing stand out. Up to 8 photos allowed.</p>
                  <span className="biz-overview-card__link">Add photos <ChevronsRight size={"16"}/></span>
                </div>
                <div className="biz-overview-card" onClick={() => setSection("settings")}>
                  <span className="biz-overview-card__icon"><Settings /></span>
                  <h3>Account settings</h3>
                  <p>Change your username or password.</p>
                  <span className="biz-overview-card__link">Settings <ChevronsRight size={"16"}/></span>
                </div>
              </div>

              <div className="biz-overview__listing-preview">
                <h2>Your listing details</h2>
                <div className="biz-info-rows">
                  <div><span>Business name</span><strong>{biz.business_name}</strong></div>
                  <div><span>Category</span><strong>{biz.category} — {biz.type}</strong></div>
                  <div><span>Address</span><strong>{biz.address}, {biz.postcode}</strong></div>
                  {biz.contact_phone && <div><span>Phone</span><strong>{biz.contact_phone}</strong></div>}
                  {biz.website && <div><span>Website</span><strong><a href={biz.website} target="_blank" rel="noopener noreferrer">{biz.website}</a></strong></div>}
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

          {/* Profile */}
          {section === "profile" && (
            <>
              <h1 className="biz-dash__page-title">Edit listing</h1>
              <p className="biz-dash__page-sub">Changes appear on your public listing immediately.</p>
              <ProfileSection biz={biz} onSaved={loadMe} onToast={showToast} />
            </>
          )}

          {/* Photos */}
          {section === "photos" && (
            <>
              <h1 className="biz-dash__page-title">Photos</h1>
              <p className="biz-dash__page-sub">Add up to 8 photos. The first photo is your cover image.</p>
              <PhotosSection bizId={biz.id} onToast={showToast} />
            </>
          )}

          {/* Settings */}
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
    </div>
  );
};

export default BusinessDashboard;