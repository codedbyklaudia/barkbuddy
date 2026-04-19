import React, { useState } from "react";
import { updateUser, uploadUserAvatar, uploadDogAvatar, updatePreferences } from "../../api/users";

// Types
interface UserProfile {
  id: string; name: string; email: string; bio?: string;
  profileComplete: number; avatarUrl?: string;
  emailNotifications: boolean; preferences: Record<string, any>;
  createdAt: string; updatedAt: string;
}
interface DogProfile {
  id: string; name: string; gender: string; breed: string;
  dob?: string; lifeStage: string; personality: string[]; avatarUrl?: string;
}

// Tiny helpers 
const Icon: React.FC<{ name: string; size?: number }> = ({ name, size = 16 }) => {
  const icons: Record<string, React.ReactNode> = {
    edit:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>,
    camera:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    close:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    check:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    spinner: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
    dog:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2 .352-3.5 2.055-3.5 4v3l1 2v2l2 1v-3l4-2 2 2v3l2-1v-2l1-2V7c0-1.933-1.5-3.648-3.5-4C9.577 2.679 8 3.782 8 5.172"/></svg>,
    dogFace: <img src="./../images/icons/dog_icon.svg" width={size} height={size} />,
    plus:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    shield:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    bell:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    eye:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    eyeOff:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  };
  return <>{icons[name] ?? null}</>;
};

// Cloudinary optimizer
const clImg = (url: string, width = 120) =>
  url?.includes('cloudinary.com')
    ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`)
    : url;

// Toggle Switch
const Toggle: React.FC<{ on: boolean; onChange: () => void; disabled?: boolean }> = ({ on, onChange, disabled }) => (
  <button className={`sv-toggle ${on ? "on" : ""}`} onClick={onChange} disabled={disabled} aria-checked={on} role="switch">
    <span className="sv-toggle-thumb" />
  </button>
);

// Row 
const Row: React.FC<{
  label: string; hint?: string; value?: React.ReactNode;
  action?: { label: string; onClick: () => void; variant?: "default" | "danger" };
  noBorder?: boolean; children?: React.ReactNode;
}> = ({ label, hint, value, action, noBorder, children }) => (
  <div className={`sv-row ${noBorder ? "no-border" : ""}`}>
    <div className="sv-row-meta">
      <span className="sv-row-label">{label}</span>
      {hint && <span className="sv-row-hint">{hint}</span>}
    </div>
    <div className="sv-row-right">
      {children}
      {value && <span className="sv-row-value">{value}</span>}
      {action && (
        <button className={`sv-row-action ${action.variant === "danger" ? "danger" : ""}`} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  </div>
);

// Card
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`sv-card ${className ?? ""}`}>{children}</div>
);

// Section
const Section: React.FC<{ label: string; icon?: string; children: React.ReactNode }> = ({ label, icon, children }) => (
  <div className="sv-section">
    <div className="sv-section-label">
      {icon && <span className="sv-section-icon"><Icon name={icon} size={13} /></span>}
      {label}
    </div>
    {children}
  </div>
);

// Avatar Hero
const AvatarHero: React.FC<{
  user: UserProfile; onUpload: (f: File) => Promise<void>; uploading: boolean;
}> = ({ user, onUpload, uploading }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
    : "—";

  return (
    <Card className="sv-avatar-card">
      <div className="sv-avatar-layout">
        <div className="sv-avatar-wrap" onClick={() => inputRef.current?.click()} title="Change photo">
          <div className="sv-avatar">
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt={user.name} loading="lazy"
                  decoding="async"
                  width={1}
                  height={1} />
              : <span>{user.name.charAt(0).toUpperCase()}</span>}
          </div>
          <div className="sv-avatar-overlay">
            {uploading ? <Icon name="spinner" size={18} /> : <Icon name="camera" size={16} />}
          </div>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
        </div>
        <div className="sv-avatar-info">
          <h1 className="sv-avatar-name">{user.name}</h1>
          <p className="sv-avatar-sub">{user.email}</p>
          <p className="sv-avatar-sub">Member since {memberSince}</p>
          <div className="sv-progress-row">
            <span className="sv-progress-label">Profile</span>
            <div className="sv-progress-bar">
              <div className="sv-progress-fill" style={{ width: `${user.profileComplete}%` }} />
            </div>
            <span className="sv-progress-pct">{user.profileComplete}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Edit Profile Modal
const EditProfileModal: React.FC<{
  user: UserProfile; token: string;
  onSave: (u: Partial<UserProfile>) => void; onClose: () => void;
}> = ({ user, token, onSave, onClose }) => {
  const [form, setForm] = useState({
    name: user.name, email: user.email, bio: user.bio ?? "",
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [showNewPw, setShowNewPw] = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (form.newPassword) {
      if (!form.currentPassword)                     e.currentPassword = "Current password required";
      if (form.newPassword.length < 8)               e.newPassword = "Minimum 8 characters";
      if (!/[A-Z]/.test(form.newPassword))           e.newPassword = "Must contain uppercase letter";
      if (!/[0-9]/.test(form.newPassword))           e.newPassword = "Must contain a number";
      if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    }
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    try {
      const payload: any = {};
      if (form.name  !== user.name)        payload.name  = form.name;
      if (form.email !== user.email)       payload.email = form.email;
      if (form.bio   !== (user.bio ?? "")) payload.bio   = form.bio;
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword     = form.newPassword;
      }
      if (Object.keys(payload).length === 0) { onClose(); return; }
      const res = await updateUser(token, payload);
      setSuccess("Saved!"); onSave(res.user); setTimeout(onClose, 700);
    } catch (err: any) {
      setErrors(err.errors ?? { general: err.message || "Something went wrong" });
    } finally { setLoading(false); }
  };

  return (
    <div className="sv-modal-overlay" onClick={onClose}>
      <div className="sv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sv-modal-header">
          <span>Edit profile</span>
          <button className="sv-modal-close" onClick={onClose}><Icon name="close" size={16} /></button>
        </div>
        <div className="sv-modal-body">
          {errors.general && <div className="sv-modal-error">{errors.general}</div>}
          {success        && <div className="sv-modal-success">{success}</div>}

          <label className="sv-label">Full name</label>
          <input className={`sv-input ${errors.name ? "error" : ""}`} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <span className="sv-field-err">{errors.name}</span>}

          <label className="sv-label">Email address</label>
          <input className={`sv-input ${errors.email ? "error" : ""}`} type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <span className="sv-field-err">{errors.email}</span>}

          <label className="sv-label">Bio</label>
          <textarea className="sv-input sv-textarea" value={form.bio} maxLength={200} rows={3}
            placeholder="Tell the community about you and your dog…"
            onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <span className="sv-char-hint">{form.bio.length}/200</span>

          <div className="sv-modal-divider">Change password</div>

          <label className="sv-label">Current password</label>
          <input className={`sv-input ${errors.currentPassword ? "error" : ""}`} type="password"
            placeholder="Enter current password" value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
          {errors.currentPassword && <span className="sv-field-err">{errors.currentPassword}</span>}

          <label className="sv-label">New password</label>
          <div className="sv-pw-wrap">
            <input className={`sv-input ${errors.newPassword ? "error" : ""}`}
              type={showNewPw ? "text" : "password"} placeholder="Min 8 chars, uppercase & number"
              value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
            <button className="sv-pw-eye" onClick={() => setShowNewPw(!showNewPw)} type="button">
              <Icon name={showNewPw ? "eyeOff" : "eye"} size={15} />
            </button>
          </div>
          {errors.newPassword && <span className="sv-field-err">{errors.newPassword}</span>}

          <label className="sv-label">Confirm new password</label>
          <input className={`sv-input ${errors.confirmPassword ? "error" : ""}`}
            type="password" placeholder="Repeat new password" value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          {errors.confirmPassword && <span className="sv-field-err">{errors.confirmPassword}</span>}
        </div>
        <div className="sv-modal-footer">
          <button className="sv-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="sv-btn-save" onClick={handleSave} disabled={loading}>
            {loading ? <><Icon name="spinner" size={14} /> Saving…</> : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Preferences Modal
const PreferencesModal: React.FC<{
  user: UserProfile; token: string;
  onSave: (d: Partial<UserProfile>) => void; onClose: () => void;
}> = ({ user, token, onSave, onClose }) => {
  const [emailNotifications, setEmail] = useState(user.emailNotifications);
  const [prefs, setPrefs]              = useState(user.preferences || {});
  const [loading, setLoading]          = useState(false);
  const [success, setSuccess]          = useState("");

  const PREFS = [
    { key: "weeklyDigest",     label: "Weekly digest",         hint: "Summary of community activity" },
    { key: "newServices",      label: "New services near me",  hint: "Service providers in your area" },
    { key: "communityUpdates", label: "Community updates",     hint: "Replies and likes on your posts" },
    { key: "dogTips",          label: "Dog care tips",         hint: "Breed-specific advice" },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      await updatePreferences(token, { emailNotifications, preferences: prefs });
      setSuccess("Saved!"); onSave({ emailNotifications, preferences: prefs }); setTimeout(onClose, 700);
    } finally { setLoading(false); }
  };

  return (
    <div className="sv-modal-overlay" onClick={onClose}>
      <div className="sv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sv-modal-header">
          <span>Notifications &amp; preferences</span>
          <button className="sv-modal-close" onClick={onClose}><Icon name="close" size={16} /></button>
        </div>
        <div className="sv-modal-body">
          {success && <div className="sv-modal-success">{success}</div>}
          <div className="sv-pref-master">
            <div>
              <div className="sv-label" style={{ marginBottom: 2 }}>Email notifications</div>
              <div className="sv-pref-hint">Receive emails from BarkBuddy</div>
            </div>
            <Toggle on={emailNotifications} onChange={() => setEmail(!emailNotifications)} />
          </div>
          <div className={`sv-pref-list ${!emailNotifications ? "disabled" : ""}`}>
            {PREFS.map((p) => (
              <div key={p.key} className="sv-pref-row">
                <div>
                  <div className="sv-pref-label">{p.label}</div>
                  <div className="sv-pref-hint">{p.hint}</div>
                </div>
                <Toggle on={!!prefs[p.key]} onChange={() => setPrefs((prev) => ({ ...prev, [p.key]: !prev[p.key] }))} disabled={!emailNotifications} />
              </div>
            ))}
          </div>
        </div>
        <div className="sv-modal-footer">
          <button className="sv-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="sv-btn-save" onClick={handleSave} disabled={loading}>
            {loading ? <><Icon name="spinner" size={14} /> Saving…</> : "Save preferences"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Dog Row
const DogRow: React.FC<{
  dog: DogProfile; onEdit: () => void; onRemove: () => void;
  token: string; onAvatarUpdate: (url: string) => void;
}> = ({ dog, onEdit, onRemove, token, onAvatarUpdate }) => {
  const [uploading, setUploading]       = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const calcAge = (dob?: string) => {
    if (!dob) return null;
    const months = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    if (months < 24) return `${months}mo`;
    return `${Math.floor(months / 12)}y`;
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadDogAvatar(token, file);
      onAvatarUpdate(res.avatarUrl);
    } finally { setUploading(false); }
  };

  const handleRemoveClick = () => {
    if (confirmRemove) {
      onRemove();
    } else {
      setConfirmRemove(true);
      // Auto-reset confirmation state after 3 seconds if user doesn't confirm
      setTimeout(() => setConfirmRemove(false), 3000);
    }
  };

  return (
    <div className="sv-dog-row">
      <div className="sv-dog-avatar-wrap" onClick={() => inputRef.current?.click()} title="Change photo">
        <div className="sv-dog-avatar">
          {dog.avatarUrl
            ? <img src={dog.avatarUrl} alt={dog.name} loading="lazy"
                  decoding="async"
                  width={1}
                  height={1}/>
            : <span>{dog.name.charAt(0).toUpperCase()}</span>}
        </div>
        {uploading && <div className="sv-dog-avatar-loading"><Icon name="spinner" size={12} /></div>}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
      </div>
      <div className="sv-dog-info">
        <span className="sv-dog-name">{dog.name} <span className="sv-dog-gender">{dog.gender === "male" ? "♂" : "♀"}</span></span>
        <span className="sv-dog-meta">
          {dog.breed}
          {dog.lifeStage && <> · <span className={`sv-dog-stage stage-${dog.lifeStage}`}>{dog.lifeStage}</span></>}
          {dog.dob && calcAge(dog.dob) && <> · {calcAge(dog.dob)}</>}
        </span>
      </div>
      <div className="sv-dog-actions">
        <button
          className={`sv-dog-btn danger ${confirmRemove ? "confirming" : ""}`}
          onClick={handleRemoveClick}
        >
          {confirmRemove ? "Sure?" : "Remove"}
        </button>
        <button className="sv-dog-btn primary" onClick={onEdit}>Edit</button>
      </div>
    </div>
  );
};

// Edit Dog Modal
const EditDogModal: React.FC<{
  dog: DogProfile; token: string;
  onSave: (d: DogProfile) => void; onClose: () => void;
}> = ({ dog, token, onSave, onClose }) => {
  const [form, setForm] = useState({
    name: dog.name, breed: dog.breed, gender: dog.gender,
    dob: dog.dob || "", lifeStage: dog.lifeStage, personality: dog.personality,
  });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");

  const PERSONALITIES = ["high-energy","playful","gentle","lazy","adventurous","cuddly","independent","anxious"];
  const toggleP = (p: string) => setForm((prev) => ({
    ...prev,
    personality: prev.personality.includes(p)
      ? prev.personality.filter((x) => x !== p)
      : [...prev.personality, p],
  }));

  const handleSave = async () => {
    if (!form.name.trim()) { setErrors({ name: "Dog name is required" }); return; }
    setLoading(true);
    try {
      const { updateDog } = await import("../../api/users");
      const res = await updateDog(token, { ...form });
      setSuccess("Saved!"); onSave(res.dog); setTimeout(onClose, 700);
    } catch (err: any) {
      setErrors(err.errors ?? { general: err.message || "Something went wrong" });
    } finally { setLoading(false); }
  };

  return (
    <div className="sv-modal-overlay" onClick={onClose}>
      <div className="sv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sv-modal-header">
          <span>Edit {dog.name}'s profile</span>
          <button className="sv-modal-close" onClick={onClose}><Icon name="close" size={16} /></button>
        </div>
        <div className="sv-modal-body">
          {errors.general && <div className="sv-modal-error">{errors.general}</div>}
          {success        && <div className="sv-modal-success">{success}</div>}

          <label className="sv-label">Name</label>
          <input className={`sv-input ${errors.name ? "error" : ""}`} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <span className="sv-field-err">{errors.name}</span>}

          <label className="sv-label">Breed</label>
          <input className="sv-input" value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })} />

          <label className="sv-label">Gender</label>
          <div className="sv-radio-row">
            {["male","female"].map((g) => (
              <button key={g} className={`sv-radio-btn ${form.gender === g ? "selected" : ""}`}
                onClick={() => setForm({ ...form, gender: g })}>
                {g === "male" ? "♂ Boy" : "♀ Girl"}
              </button>
            ))}
          </div>

          <label className="sv-label">Date of birth <span className="sv-optional">optional</span></label>
          <input className="sv-input" type="date" value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })} />

          <label className="sv-label">Life stage</label>
          <div className="sv-radio-row">
            {["puppy","adult","senior"].map((s) => (
              <button key={s} className={`sv-radio-btn ${form.lifeStage === s ? "selected" : ""}`}
                onClick={() => setForm({ ...form, lifeStage: s })}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <label className="sv-label">Personality</label>
          <div className="sv-chips">
            {PERSONALITIES.map((p) => (
              <button key={p} className={`sv-chip ${form.personality.includes(p) ? "selected" : ""}`}
                onClick={() => toggleP(p)}>{p}</button>
            ))}
          </div>
        </div>
        <div className="sv-modal-footer">
          <button className="sv-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="sv-btn-save" onClick={handleSave} disabled={loading}>
            {loading ? <><Icon name="spinner" size={14} /> Saving…</> : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main SettingsView 
interface SettingsViewProps {
  user:        UserProfile;
  dog:         DogProfile | null;
  dogs:        DogProfile[];
  token:       string;
  onUpdate:    (u: Partial<UserProfile>) => void;
  onDogUpdate: (d: DogProfile) => void;
  onDogRemove: (dogId: string) => void;
  onNav:       (key: string) => void;
  onAddDog:    () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  user, dog, dogs, token, onUpdate, onDogUpdate, onDogRemove, onNav, onAddDog,
}) => {
  const [modal, setModal]           = useState<"profile" | "preferences" | null>(null);
  const [editingDog, setEditingDog] = useState<DogProfile | null>(null);
  const [uploadingUser, setUpUser]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const handleDeleteAccount = async () => {
  if (!deleteConfirm) {
    setDeleteConfirm(true);
    setTimeout(() => setDeleteConfirm(false), 4000);
    return;
  }
  setDeleting(true);
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.clear();
    window.location.href = "/";
  } catch (err) {
    console.error("Delete account error:", err);
    setDeleting(false);
    setDeleteConfirm(false);
  }
};
  const handleUserAvatar = async (file: File) => {
    setUpUser(true);
    try { const res = await uploadUserAvatar(token, file); onUpdate({ avatarUrl: res.avatarUrl }); }
    finally { setUpUser(false); }
  };

  const allDogs = dogs.length > 0 ? dogs : (dog ? [dog] : []);

  return (
    <div className="sv-page">

      {/* Avatar Hero */}
      <AvatarHero user={user} onUpload={handleUserAvatar} uploading={uploadingUser} />

      {/* Profile */}
      <Section label="Profile" icon="edit">
        <Card>
          <Row
            label="Full name"
            hint="Shown to other BarkBuddy members"
            value={user.name}
            action={{ label: "Edit", onClick: () => setModal("profile") }}
          />
          <Row
            label="Email address"
            hint="Used for login and notifications"
            value={user.email}
            action={{ label: "Edit", onClick: () => setModal("profile") }}
          />
          <Row
            label="Bio"
            hint={user.bio ? undefined : "Tell the community about you"}
            value={user.bio || <span style={{ fontStyle: "italic", opacity: 0.5 }}>Not set</span>}
            action={{ label: user.bio ? "Edit" : "Add", onClick: () => setModal("profile") }}
            noBorder
          />
        </Card>
      </Section>

      {/* Security */}
      <Section label="Security" icon="shield">
        <Card>
          <Row
            label="Password"
            hint="Last updated recently"
            value="••••••••••"
            action={{ label: "Change", onClick: () => setModal("profile") }}
            noBorder
          />
        </Card>
      </Section>

      {/* My Dogs */}
      <Section label="My dogs" icon="dogFace">
        <Card>
          {allDogs.length === 0 ? (
            <div className="sv-dogs-empty">
              <p>No dogs yet — add your first pup!</p>
            </div>
          ) : (
            allDogs.map((d) => (
              <DogRow
                key={d.id}
                dog={d}
                token={token}
                onEdit={() => setEditingDog(d)}
                onRemove={() => onDogRemove(d.id)}
                onAvatarUpdate={(url) => onDogUpdate({ ...d, avatarUrl: url })}
              />
            ))
          )}

          {/* Opens the same 3-step AddDogModal as My Dog page */}
          <button className="sv-add-dog-row" onClick={onAddDog}>
            <span className="sv-add-dog-icon"><Icon name="dogFace" size={16} /></span>
            <span className="sv-add-dog-label">Add another dog</span>
          </button>
        </Card>
      </Section>

      {/* Notifications */}
      <Section label="Notifications" icon="bell">
        <Card>
          <Row
            label="Email notifications"
            hint={user.emailNotifications ? "Receiving emails from BarkBuddy" : "Email notifications are off"}
            noBorder
          >
            <div className="sv-row-right">
              <Toggle on={user.emailNotifications} onChange={() => setModal("preferences")} />
              <button className="sv-row-action" onClick={() => setModal("preferences")}>Manage</button>
            </div>
          </Row>
        </Card>
      </Section>

      {/* Danger zone */}
      <Section label="Danger zone" icon="trash">
        <Card>
          <Row
            label="Delete account"
            hint="Permanently delete your account and all data. This cannot be undone."
            action={{
              label: deleting ? "Deleting…" : deleteConfirm ? "Yes, delete everything" : "Delete account",
              onClick: handleDeleteAccount,
              variant: "danger",
            }}
            noBorder
          />
        </Card>
      </Section>

      {/* Modals */}
      {modal === "profile"     && <EditProfileModal user={user} token={token} onSave={onUpdate} onClose={() => setModal(null)} />}
      {modal === "preferences" && <PreferencesModal user={user} token={token} onSave={onUpdate} onClose={() => setModal(null)} />}
      {editingDog              && <EditDogModal dog={editingDog} token={token} onSave={(d) => { onDogUpdate(d); setEditingDog(null); }} onClose={() => setEditingDog(null)} />}
    </div>
  );
};

export default SettingsView;