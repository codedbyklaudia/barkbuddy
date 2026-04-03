import React, { useState, useEffect, useCallback, useRef } from "react";
import "./AdminPanel.scss";
import { LogOut } from 'lucide-react';


const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const UPLOADS_BASE: string = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api").replace("/api", "");

// ─── Types ────────────────────────────────────────────────────────────────────
interface Business {
  id:               number;
  email:            string;
  personal_name:    string;
  business_name:    string;
  category:         "services" | "activities";
  type:             string;
  address:          string;
  postcode:         string;
  status:           "pending" | "approved" | "rejected";
  email_verified:   boolean;
  username:         string | null;
  created_at:       string;
  approved_at:      string | null;
  price_list?:      string;
  additional_info?: string;
  document_url?:    string;
  document_filename?: string;
}

interface BusinessPhoto {
  id:         number;
  file_name:  string;
  file_path:  string;
  caption?:   string;
  is_primary: boolean;
}

type Tab = "pending" | "approved" | "rejected" | "all";

const STATUS_COLOURS: Record<string, string> = {
  pending:  "#d97706",
  approved: "#059669",
  rejected: "#dc2626",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

// ─── Admin login gate ─────────────────────────────────────────────────────────
const AdminLogin: React.FC<{ onAuth: (secret: string) => void }> = ({ onAuth }) => {
  const [secret, setSecret] = useState("");
  const [error,  setError]  = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) { setError("Enter the admin secret"); return; }
    onAuth(secret.trim());
  };

  return (
    <div className="admin-login">
      <div className="admin-login__box">
        <h1>BarkBuddy Admin</h1>
        <p>Enter the secret to continue</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className={error ? "error" : ""}
            placeholder="Admin secret"
            value={secret}
            onChange={e => { setSecret(e.target.value); setError(""); }}
            autoFocus
          />
          {error && <span className="admin-login__error">{error}</span>}
          <button type="submit">Admin Panel</button>
        </form>
      </div>
    </div>
  );
};

// ─── Photo Manager ────────────────────────────────────────────────────────────
const PhotoManager: React.FC<{ businessId: number; secret: string; businessName: string }> = ({
  businessId, secret, businessName,
}) => {
  const [photos,     setPhotos]     = useState<BusinessPhoto[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [uploading,  setUploading]  = useState(false);
  const [caption,    setCaption]    = useState("");
  const [isPrimary,  setIsPrimary]  = useState(false);
  const [preview,    setPreview]    = useState<string | null>(null);
  const [file,       setFile]       = useState<File | null>(null);
  const [toast,      setToast]      = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/admin/businesses/${businessId}/photos`, {
        headers: { "x-admin-secret": secret },
      });
      const data = await res.json();
      setPhotos(data.photos ?? []);
    } catch {
      showToast("❌ Failed to load photos");
    } finally {
      setLoading(false);
    }
  }, [businessId, secret]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) { showToast("Please select a file first"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("caption", caption);
      formData.append("is_primary", String(isPrimary));

      const res  = await fetch(`${API_BASE}/admin/businesses/${businessId}/photos`, {
        method:  "POST",
        headers: { "x-admin-secret": secret },
        body:    formData,
      });
      const data = await res.json();
      if (!res.ok) { showToast(`❌ ${data.message}`); return; }
      showToast("✅ Photo uploaded!");
      setFile(null);
      setPreview(null);
      setCaption("");
      setIsPrimary(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchPhotos();
    } catch {
      showToast("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    try {
      const res = await fetch(`${API_BASE}/admin/businesses/${businessId}/photos/${photoId}/primary`, {
        method:  "PATCH",
        headers: { "x-admin-secret": secret },
      });
      if (res.ok) { showToast("✅ Primary photo updated"); fetchPhotos(); }
    } catch {
      showToast("❌ Failed to update primary");
    }
  };

  const handleDelete = async (photoId: number) => {
    if (!confirm("Delete this photo?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/businesses/${businessId}/photos/${photoId}`, {
        method:  "DELETE",
        headers: { "x-admin-secret": secret },
      });
      if (res.ok) { showToast("🗑 Photo deleted"); fetchPhotos(); }
    } catch {
      showToast("❌ Failed to delete");
    }
  };

  return (
    <div className="photo-manager">
      {toast && <div className="admin-toast">{toast}</div>}

      <p className="photo-manager__label">Photos for {businessName}</p>

      {/* Existing photos */}
      {loading ? (
        <p className="photo-manager__empty">Loading photos…</p>
      ) : photos.length === 0 ? (
        <p className="photo-manager__empty">No photos yet</p>
      ) : (
        <div className="photo-manager__grid">
          {photos.map(photo => (
            <div key={photo.id} className={`photo-manager__item ${photo.is_primary ? "photo-manager__item--primary" : ""}`}>
              <img src={`${UPLOADS_BASE}${photo.file_path}`} alt={photo.caption || businessName} />
              {photo.is_primary && <span className="photo-manager__primary-badge">★ Primary</span>}
              <div className="photo-manager__item-actions">
                {!photo.is_primary && (
                  <button onClick={() => handleSetPrimary(photo.id)} title="Set as primary">★</button>
                )}
                <button onClick={() => handleDelete(photo.id)} title="Delete" className="photo-manager__delete">✕</button>
              </div>
              {photo.caption && <p className="photo-manager__caption">{photo.caption}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Upload form */}
      <div className="photo-manager__upload">
        <p className="photo-manager__upload-title">Upload new photo</p>

        <div
          className={`photo-manager__dropzone ${preview ? "photo-manager__dropzone--has-preview" : ""}`}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="photo-manager__preview" />
          ) : (
            <>
              <span className="photo-manager__dropzone-icon">📷</span>
              <span>Click to select image</span>
              <span className="photo-manager__dropzone-sub">JPG, PNG or WEBP · max 10MB</span>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <input
          type="text"
          className="photo-manager__caption-input"
          placeholder="Caption (optional)"
          value={caption}
          onChange={e => setCaption(e.target.value)}
        />

        <label className="photo-manager__primary-toggle">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={e => setIsPrimary(e.target.checked)}
          />
          Set as primary (cover) photo
        </label>

        <button
          className="admin-btn admin-btn--approve photo-manager__upload-btn"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? "Uploading…" : "Upload photo"}
        </button>

        {preview && (
          <button
            className="admin-btn admin-btn--ghost photo-manager__cancel-btn"
            onClick={() => { setFile(null); setPreview(null); setCaption(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Business detail drawer ───────────────────────────────────────────────────
const BusinessDrawer: React.FC<{
  id:        number;
  secret:    string;
  onClose:   () => void;
  onRefresh: () => void;
}> = ({ id, secret, onClose, onRefresh }) => {
  const [biz,        setBiz]        = useState<Business | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [acting,     setActing]     = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [toast,      setToast]      = useState("");
  const [showPhotos, setShowPhotos] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/admin/businesses/${id}`, {
      headers: { "x-admin-secret": secret },
    })
      .then(r => r.json())
      .then(d => setBiz(d.business))
      .finally(() => setLoading(false));
  }, [id, secret]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const approve = async () => {
    if (!biz) return;
    setActing(true);
    const res  = await fetch(`${API_BASE}/admin/businesses/${biz.id}/approve`, {
      method:  "POST",
      headers: { "x-admin-secret": secret },
    });
    const data = await res.json();
    if (res.ok) {
      setBiz(b => b ? { ...b, status: "approved", username: data.username } : b);
      showToast(`✅ Approved! Username: ${data.username}`);
      onRefresh();
    } else {
      showToast(`❌ ${data.message}`);
    }
    setActing(false);
  };

  const reject = async () => {
    if (!biz) return;
    setActing(true);
    const res  = await fetch(`${API_BASE}/admin/businesses/${biz.id}/reject`, {
      method:  "POST",
      headers: { "x-admin-secret": secret, "Content-Type": "application/json" },
      body:    JSON.stringify({ reason: rejectNote }),
    });
    const data = await res.json();
    if (res.ok) {
      setBiz(b => b ? { ...b, status: "rejected" } : b);
      setShowReject(false);
      showToast("Rejected and email sent.");
      onRefresh();
    } else {
      showToast(`❌ ${data.message}`);
    }
    setActing(false);
  };

  const deleteBusiness = async () => {
    if (!biz) return;
    setDeleting(true);
    try {
      const res  = await fetch(`${API_BASE}/admin/businesses/${biz.id}`, {
        method:  "DELETE",
        headers: { "x-admin-secret": secret },
      });
      const data = await res.json();
      if (res.ok) { onRefresh(); onClose(); }
      else showToast(`❌ ${data.message}`);
    } catch {
      showToast("❌ Failed to delete business");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-drawer-overlay" onClick={onClose}>
      <div className="admin-drawer" onClick={e => e.stopPropagation()}>
        <button className="admin-drawer__close" onClick={onClose}>✕</button>

        {toast && <div className="admin-toast">{toast}</div>}

        {loading ? (
          <div className="admin-drawer__loading">Loading…</div>
        ) : !biz ? (
          <div className="admin-drawer__loading">Not found</div>
        ) : (
          <>
            {/* Status bar */}
            <div
              className="admin-drawer__status-bar"
              style={{ background: STATUS_COLOURS[biz.status] }}
            >
              <span>{biz.status.toUpperCase()}</span>
              {biz.email_verified
                ? <span>✓ Email verified</span>
                : <span>⚠ Email not verified</span>}
            </div>

            <div className="admin-drawer__body">
              <h2>{biz.business_name}</h2>
              <p className="admin-drawer__sub">{biz.category} · {biz.type}</p>

              <div className="admin-info-grid">
                <div className="admin-info-row">
                  <span>Contact name</span><strong>{biz.personal_name}</strong>
                </div>
                <div className="admin-info-row">
                  <span>Email</span>
                  <strong><a href={`mailto:${biz.email}`}>{biz.email}</a></strong>
                </div>
                <div className="admin-info-row">
                  <span>Address</span>
                  <strong>{biz.address}, {biz.postcode}</strong>
                </div>
                <div className="admin-info-row">
                  <span>Applied</span>
                  <strong>{fmtDate(biz.created_at)} at {fmtTime(biz.created_at)}</strong>
                </div>
                {biz.username && (
                  <div className="admin-info-row">
                    <span>Username</span>
                    <strong className="admin-username">{biz.username}</strong>
                  </div>
                )}
                {biz.approved_at && (
                  <div className="admin-info-row">
                    <span>Approved</span>
                    <strong>{fmtDate(biz.approved_at)}</strong>
                  </div>
                )}
              </div>

              {/* Service details */}
              {biz.price_list && (
                <div className="admin-detail-box">
                  <p className="admin-detail-box__label">Price list</p>
                  <p>{biz.price_list}</p>
                </div>
              )}
              {biz.additional_info && (
                <div className="admin-detail-box">
                  <p className="admin-detail-box__label">Additional info</p>
                  <p>{biz.additional_info}</p>
                </div>
              )}

              {/* Activity document */}
              {biz.document_url && (
                <div className="admin-detail-box">
                  <p className="admin-detail-box__label">Dog-friendly document</p>
                  <a
                    href={biz.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-doc-link"
                  >
                    📄 {biz.document_filename ?? "View document"}
                  </a>
                </div>
              )}

              {/* ── Photo Manager toggle ── */}
              <div className="admin-photos-section">
                <button
                  className="admin-photos-toggle"
                  onClick={() => setShowPhotos(v => !v)}
                >
                  📷 {showPhotos ? "Hide" : "Manage"} photos
                  <span className="admin-photos-toggle__arrow">{showPhotos ? "▲" : "▼"}</span>
                </button>
                {showPhotos && (
                  <PhotoManager
                    businessId={biz.id}
                    secret={secret}
                    businessName={biz.business_name}
                  />
                )}
              </div>

              {/* Actions */}
              {biz.status === "pending" && (
                <div className="admin-actions">
                  {!showReject ? (
                    <>
                      <button
                        className="admin-btn admin-btn--approve"
                        onClick={approve}
                        disabled={acting}
                      >
                        {acting ? "Processing…" : "✓ Approve & send username"}
                      </button>
                      <button
                        className="admin-btn admin-btn--reject"
                        onClick={() => setShowReject(true)}
                        disabled={acting}
                      >
                        ✕ Reject
                      </button>
                    </>
                  ) : (
                    <div className="admin-reject-form">
                      <label>Rejection reason <span>(optional — included in email)</span></label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Document provided does not confirm dog-friendly status"
                        value={rejectNote}
                        onChange={e => setRejectNote(e.target.value)}
                      />
                      <div className="admin-reject-form__btns">
                        <button
                          className="admin-btn admin-btn--reject"
                          onClick={reject}
                          disabled={acting}
                        >
                          {acting ? "Sending…" : "Confirm rejection"}
                        </button>
                        <button
                          className="admin-btn admin-btn--ghost"
                          onClick={() => setShowReject(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {biz.status === "approved" && (
                <div className="admin-approved-note">
                  ✅ Approved — username <strong>{biz.username}</strong> sent to {biz.email}
                </div>
              )}

              {biz.status === "rejected" && (
                <div className="admin-rejected-note">
                  ✕ Rejected — email notification sent
                </div>
              )}

              {/* ── Danger zone ── */}
              <div className="admin-danger-zone">
                <p className="admin-danger-zone__label">Danger zone</p>
                {!showDelete ? (
                  <button
                    className="admin-btn admin-btn--danger"
                    onClick={() => setShowDelete(true)}
                  >
                    🗑 Permanently delete this business
                  </button>
                ) : (
                  <div className="admin-delete-confirm">
                    <p>This will permanently delete <strong>{biz.business_name}</strong> and all its photos. This cannot be undone.</p>
                    <div className="admin-delete-confirm__btns">
                      <button
                        className="admin-btn admin-btn--danger"
                        onClick={deleteBusiness}
                        disabled={deleting}
                      >
                        {deleting ? "Deleting…" : "Yes, delete permanently"}
                      </button>
                      <button
                        className="admin-btn admin-btn--ghost"
                        onClick={() => setShowDelete(false)}
                        disabled={deleting}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main admin panel ─────────────────────────────────────────────────────────
const AdminPanel: React.FC = () => {
  const [secret,     setSecret]     = useState(() => sessionStorage.getItem("admin_secret") ?? "");
  const [authed,     setAuthed]     = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [tab,        setTab]        = useState<Tab>("pending");
  const [search,     setSearch]     = useState("");
  const [drawerOpen, setDrawerOpen] = useState<number | null>(null);
  const [authError,  setAuthError]  = useState(false);

  const fetchBusinesses = useCallback(async (s: string) => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/admin/businesses`, {
      headers: { "x-admin-secret": s },
    });
    if (res.status === 401) {
      setAuthed(false);
      setAuthError(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setBusinesses(data.businesses ?? []);
    setLoading(false);
  }, []);

  const handleAuth = (s: string) => {
    sessionStorage.setItem("admin_secret", s);
    setSecret(s);
    setAuthError(false);
    setAuthed(true);
    fetchBusinesses(s);
  };

  useEffect(() => {
    if (secret) { setAuthed(true); fetchBusinesses(secret); }
  }, []);

  if (!authed) return <AdminLogin onAuth={handleAuth} />;

  const filtered = businesses.filter(b => {
    const matchTab    = tab === "all" || b.status === tab;
    const matchSearch = !search.trim() ||
      b.business_name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      b.personal_name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    pending:  businesses.filter(b => b.status === "pending").length,
    approved: businesses.filter(b => b.status === "approved").length,
    rejected: businesses.filter(b => b.status === "rejected").length,
    all:      businesses.length,
  };

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <div className="admin-header__left">
          <h1>Admin Panel</h1>
        </div>
        <div className="admin-header__right">
          <button
            className="admin-refresh"
            onClick={() => fetchBusinesses(secret)}
            disabled={loading}
          >
            {loading ? "Loading…" : "↺ Refresh"}
          </button>
          <button
            className="admin-logout"
            onClick={() => { sessionStorage.removeItem("admin_secret"); setAuthed(false); setSecret(""); }}
          >
            <LogOut />
          </button>
        </div>
      </header>

      {authError && (
        <div className="admin-auth-error">
          ⚠ Incorrect admin secret. Please log out and try again.
        </div>
      )}

      <div className="admin-stats">
        {(["pending", "approved", "rejected", "all"] as Tab[]).map(t => (
          <button
            key={t}
            className={`admin-stat ${tab === t ? "admin-stat--active" : ""} admin-stat--${t}`}
            onClick={() => setTab(t)}
          >
            <span className="admin-stat__count">{counts[t]}</span>
            <span className="admin-stat__label">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
          </button>
        ))}
      </div>

      <div className="admin-search-bar">
        <input
          type="search"
          placeholder="Search by business name, email, or contact name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">No {tab === "all" ? "" : tab} businesses found</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Contact</th>
                <th>Category</th>
                <th>Applied</th>
                <th>Email verified</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} onClick={() => setDrawerOpen(b.id)} className="admin-table__row">
                  <td>
                    <strong>{b.business_name}</strong>
                    <span className="admin-table__sub">{b.type}</span>
                  </td>
                  <td>
                    <span>{b.personal_name}</span>
                    <span className="admin-table__sub">{b.email}</span>
                  </td>
                  <td>{b.category}</td>
                  <td>
                    <span>{fmtDate(b.created_at)}</span>
                    <span className="admin-table__sub">{fmtTime(b.created_at)}</span>
                  </td>
                  <td>
                    <span className={`admin-verified admin-verified--${b.email_verified}`}>
                      {b.email_verified ? "✓ Yes" : "✗ No"}
                    </span>
                  </td>
                  <td>
                    <span
                      className="admin-status-badge"
                      style={{ background: STATUS_COLOURS[b.status] + "20", color: STATUS_COLOURS[b.status] }}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <button className="admin-view-btn">Review →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {drawerOpen !== null && (
        <BusinessDrawer
          id={drawerOpen}
          secret={secret}
          onClose={() => setDrawerOpen(null)}
          onRefresh={() => fetchBusinesses(secret)}
        />
      )}
    </div>
  );
};

export default AdminPanel;