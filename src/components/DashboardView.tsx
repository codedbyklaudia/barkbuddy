import React, { useState, useEffect, useRef } from "react";
import {
  getBuddies, searchUsers, sendBuddyRequest, acceptBuddy, removeBuddy,
} from "../api/users";
import "./DashboardView.scss";

//Types
interface UserProfile {
  id:                 string;
  name:               string;
  email:              string;
  bio?:               string;
  profileComplete:    number;
  avatarUrl?:         string;
  emailNotifications: boolean;
  preferences:        Record<string, any>;
  createdAt:          string;
  updatedAt:          string;
}

interface DogProfile {
  id:          string;
  name:        string;
  gender:      string;
  breed:       string;
  dob?:        string;
  lifeStage:   string;
  personality: string[];
  avatarUrl?:  string;
}

interface Buddy {
  id:          string;
  userId:      string;
  name:        string;
  avatarUrl?:  string;
  bio?:        string;
  dogName?:    string;
  dogBreed?:   string;
  dogAvatar?:  string;
  joinedAt:    string;
  buddySince?: string;
}

interface BuddyUser {
  id:         string;
  name:       string;
  avatarUrl?: string;
  bio?:       string;
  dogName?:   string;
  status?:    "none" | "pending_out" | "pending_in" | "buddy";
}

interface Post {
  id:            string;
  title:         string;
  body:          string;
  category?:     string;
  likesCount:    number;
  commentsCount: number;
  isPublished:   boolean;
  createdAt:     string;
  updatedAt:     string;
}

// API helpers
async function getMyPosts(token: string): Promise<Post[]> {
  try {
    const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
    const res = await fetch(`${BASE}/forum/my-posts`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error();
    const d = await res.json();
    return d.posts ?? [];
  } catch (err) {
    console.error("Failed to load posts:", err);
    return [];
  }
}

async function deletePost(token: string, postId: string): Promise<void> {
  const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
  await fetch(`${BASE}/forum/posts/${postId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
}

async function updatePost(token: string, postId: string, data: Partial<Post>): Promise<Post> {
  const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
  const res = await fetch(`${BASE}/forum/posts/${postId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const d = await res.json();
  return d.post;
}

// ─── Streak helpers (user-specific, like Duolingo) ───────────────────────────
function getCheckinKey(userId: string) { return `barkbuddy_checkins_${userId}`; }
function getTodayKey(): string { return new Date().toISOString().split("T")[0]; }
function loadCheckins(userId: string): string[] {
  try { const raw = localStorage.getItem(getCheckinKey(userId)); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}
function saveCheckins(userId: string, dates: string[]) {
  localStorage.setItem(getCheckinKey(userId), JSON.stringify(dates));
}
function calcStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = [...new Set(dates)].sort().reverse();
  const today = getTodayKey(); let streak = 0;
  let cursor = new Date(today);
  for (let i = 0; i < 365; i++) {
    const key = cursor.toISOString().split("T")[0];
    if (sorted.includes(key)) { streak++; cursor.setDate(cursor.getDate() - 1); }
    else { if (key === today) { cursor.setDate(cursor.getDate() - 1); continue; } break; }
  }
  return streak;
}

// Care log helpers 
interface CareLog { walk: boolean; fed: boolean; water: boolean; playtime: boolean; }
const LOG_KEY = "barkbuddy_carelog";
function loadLog(): Record<string, CareLog> {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || "{}"); } catch { return {}; }
}

// Tips 
const TIPS = [
  { text: "Brush your dog's teeth 2-3x per week to prevent plaque and keep their breath fresh!" },
  { text: "Dogs need about 1oz of water per pound of body weight daily. Keep that bowl full!" },
  { text: "Regular walks aren't just exercise - sniffing on walks is mental stimulation too!" },
  { text: "10 minutes of focused play per day can significantly reduce anxiety in dogs." },
  { text: "Dogs sleep 12-14 hours a day. A cosy, quiet sleep spot is key to their health." },
  { text: "Rotate toys weekly to keep your dog engaged and curious." },
  { text: "A tired dog is a good dog - combine physical and mental exercise every day." },
];

// Care items config 
const CARE_ITEMS_CONFIG = [
  { key: "walk" as keyof CareLog,     icon: "paw",      label: "Walk",        desc: "Daily walkies done!",  color: "#927ACF" },
  { key: "fed" as keyof CareLog,      icon: "utensils", label: "Fed",         desc: "Meal time sorted!",    color: "#d97706" },
  { key: "water" as keyof CareLog,    icon: "droplet",  label: "Fresh Water", desc: "Bowl topped up!",      color: "#0284c7" },
  { key: "playtime" as keyof CareLog, icon: "ball",     label: "Playtime",    desc: "Fun & games!",         color: "#16a34a" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// SVG Icon helper 
const I: React.FC<{ n: string; s?: number }> = ({ n, s = 18 }) => {
  const icons: Record<string, React.ReactNode> = {
    activity:   <i className="bi bi-activity"></i>,
    fire:      <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9 7 7 9 7 13c0 2.8 2.2 5 5 5s5-2.2 5-5c0-2-1.5-3.5-1.5-3.5S15 11 13 12c.5-3-1.5-6-1-10z"/></svg>,
    paw:       <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M8.646 5.646a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L7.354 7.854a.5.5 0 1 1-.708-.708l2-2z"/><path d="M1 14s1-1 6-1 6 1 6 1v1H1v-1zm11-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>,
    check:     <i className="bi bi-check"></i>,
    users:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    comment:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    eye:       <i className="bi bi-eye"></i>,
    post:      <i className="bi bi-postage-heart"></i>,
    eyeOff:    <i className="bi bi-eye-slash"></i>,
    search:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    trash:     <i className="bi bi-trash"></i>,
    x:         <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    userPlus:  <i className="bi bi-person-add"></i>,
    userCheck: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>,
    heart:     <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    spinner:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
    edit:      <i className="bi bi-pen"></i>,
    close:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    calendar:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    forum:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    map:       <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    arrow:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
    utensils:  <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><path d="M.75 1a.75.75 0 0 0 0 1.5h.384l.415 8.29a1.75 1.75 0 0 0 1.74 1.61h9.172a1.75 1.75 0 0 0 1.74-1.61l.415-8.29h.384a.75.75 0 0 0 0-1.5H.75zM4.5 5.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm2-3a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm2 0a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/></svg>,
    droplet:   <i className="bi bi-droplet"></i>,
    ball:      <svg width={s} height={s} viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.3"/><path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1zm2.5 3a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM5 7a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm6 2a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM8 11a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/></svg>,
  };
  return <>{icons[n] ?? null}</>;
};

// ─── Check-In Modal ──────────────────────────────────────────────────────────
const CheckInModal: React.FC<{
  dogName: string; dogAvatar?: string; checkins: string[]; initialLog: CareLog;
  onConfirm: (log: CareLog) => void; onClose: () => void;
}> = ({ dogName, dogAvatar, checkins, initialLog, onConfirm, onClose }) => {
  const [log, setLog] = useState<CareLog>({ ...initialLog });
  const [celebrated, setCelebrated] = useState(false);
  const keys: (keyof CareLog)[] = ["walk", "fed", "water", "playtime"];
  const doneCount = keys.filter((k) => log[k]).length;
  const allDone = doneCount === keys.length;
  const streak = calcStreak(checkins);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  useEffect(() => { if (allDone) { setTimeout(() => setCelebrated(true), 200); } else { setCelebrated(false); } }, [allDone]);
  const toggleItem = (key: keyof CareLog) => setLog((prev) => ({ ...prev, [key]: !prev[key] }));
  const handleCheckIn = () => { onConfirm(log); onClose(); };

  return (
    <div className="modal-overlay checkin-overlay" onClick={onClose}>
      <div className="checkin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="checkin-modal-header">
          <div className="checkin-header-content">
            <div className="checkin-dog-avatar">
              {dogAvatar ? <img src={dogAvatar} alt={dogName} /> : <span className="checkin-avatar-fallback"><I n="paw" s={24} /></span>}
            </div>
            <div>
              <h2 className="checkin-title">Daily Check-In</h2>
              <p className="checkin-subtitle">How did today go? Tap each one to log it!</p>
            </div>
          </div>
          <button className="checkin-close" onClick={onClose} aria-label="Close"><I n="close" s={26} /></button>
        </div>
        <div className="checkin-progress-wrap">
          <div className="checkin-progress-bar">
            <div className={`checkin-progress-fill ${allDone ? "all-done" : ""}`} style={{ width: `${(doneCount / keys.length) * 100}%` }} />
          </div>
          <span className="checkin-progress-label">
            {allDone ? <><I n="check" s={12} /> All done!</> : `${doneCount} of ${keys.length} logged`}
          </span>
        </div>
        <div className="checkin-items-grid">
          {CARE_ITEMS_CONFIG.map((item, index) => {
            const isDone = log[item.key];
            return (
              <button key={item.key} className={`checkin-item ${isDone ? "is-done" : ""}`}
                onClick={() => toggleItem(item.key)}
                style={{ "--item-color": item.color, animationDelay: `${index * 0.06}s` } as React.CSSProperties}
                aria-pressed={isDone}>
                <div className="checkin-item-icon-wrap">
                  <span className="checkin-item-icon-svg"><I n={item.icon} s={28} /></span>
                  {isDone && <div className="checkin-item-check"><I n="check" s={12} /></div>}
                </div>
                <div className="checkin-item-text">
                  <span className="checkin-item-label">{item.label}</span>
                  <span className="checkin-item-desc">{isDone ? item.desc : "Tap to log"}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className={`checkin-celebration ${celebrated ? "visible" : ""}`}>
          <div>
            <p className="checkin-celebration-title">Amazing! All taken care of!</p>
            <p className="checkin-celebration-sub">You're such a great dog parent <I n="heart" s={12} /></p>
          </div>
        </div>
        <div className="checkin-footer">
          <div className="checkin-streak-pill">
            <I n="fire" s={16} />
            <span>{streak} day streak</span>
          </div>
          <button className={`checkin-confirm-btn ${allDone ? "all-done" : ""}`} onClick={handleCheckIn}>
            {allDone ? <><I n="paw" s={16} /> Check In & Save</> : <><I n="check" s={16} /> Check In ({doneCount}/{keys.length})</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// Buddies Panel 
const BuddiesPanel: React.FC<{ token: string }> = ({ token }) => {
  const [buddies, setBuddies]             = useState<Buddy[]>([]);
  const [pendingIn, setPendingIn]         = useState<Buddy[]>([]);
  const [pendingOut, setPendingOut]       = useState<Buddy[]>([]);
  const [search, setSearch]               = useState("");
  const [searchResults, setSearchResults] = useState<BuddyUser[]>([]);
  const [searching, setSearching]         = useState(false);
  const [loading, setLoading]             = useState(true);
  const [activeTab, setActiveTab]         = useState<"list" | "find">("list");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoading(true);
    getBuddies(token).then(({ buddies: b, pendingIn: pi, pendingOut: po }) => {
      setBuddies(b); setPendingIn(pi); setPendingOut(po);
    }).finally(() => setLoading(false));
  }, [token]);

  const handleSearch = (q: string) => {
    setSearch(q);
    if (searchRef.current) clearTimeout(searchRef.current);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    searchRef.current = setTimeout(async () => {
      const results = await searchUsers(token, q);
      setSearchResults(results);
      setSearching(false);
    }, 400);
  };

  const handleSendRequest = async (userId: string) => {
    setActionLoading(userId);
    try {
      await sendBuddyRequest(token, userId);
      setSearchResults((prev) => prev.map((u) => u.id === userId ? { ...u, status: "pending_out" } : u));
    } finally { setActionLoading(null); }
  };

  const handleAccept = async (buddy: Buddy) => {
    setActionLoading(buddy.id);
    try {
      await acceptBuddy(token, buddy.id);
      setPendingIn((prev) => prev.filter((b) => b.id !== buddy.id));
      setBuddies((prev) => [...prev, { ...buddy, buddySince: new Date().toISOString() }]);
    } finally { setActionLoading(null); }
  };

  const handleAcceptFromSearch = async (user: BuddyUser) => {
    setActionLoading(user.id);
    try {
      const request = pendingIn.find((b) => b.userId === user.id);
      if (request) {
        await acceptBuddy(token, request.id);
        setPendingIn((prev) => prev.filter((b) => b.userId !== user.id));
        setBuddies((prev) => [...prev, {
          id: request.id, userId: user.id, name: user.name,
          avatarUrl: user.avatarUrl, bio: user.bio, dogName: user.dogName,
          joinedAt: new Date().toISOString(), buddySince: new Date().toISOString(),
        }]);
        setSearchResults((prev) => prev.map((u) => u.id === user.id ? { ...u, status: "buddy" } : u));
      }
    } finally { setActionLoading(null); }
  };

  const handleRemove = async (buddyId: string) => {
    if (!confirm("Remove this buddy?")) return;
    setActionLoading(buddyId);
    try {
      await removeBuddy(token, buddyId);
      setBuddies((prev) => prev.filter((b) => b.id !== buddyId));
    } finally { setActionLoading(null); }
  };

  return (
    <div className="buddies-panel">
      <div className="buddies-tabs">
        <button className={`buddies-tab ${activeTab === "list" ? "active" : ""}`} onClick={() => setActiveTab("list")}>
          <I n="users" s={15} /> My Buddies
          {buddies.length > 0 && <span className="buddies-tab-count">{buddies.length}</span>}
        </button>
        <button className={`buddies-tab ${activeTab === "find" ? "active" : ""}`} onClick={() => setActiveTab("find")}>
          <I n="search" s={15} /> Find Buddies
        </button>
        {pendingIn.length > 0 && (
          <div className="buddies-pending-badge" title={`${pendingIn.length} pending request${pendingIn.length > 1 ? "s" : ""}`}>
            {pendingIn.length}
          </div>
        )}
      </div>

      {activeTab === "list" && (
        <div className="buddies-list-view">
          {pendingIn.length > 0 && (
            <div className="buddies-section">
              <h4 className="buddies-section-title">
                <I n="userPlus" s={15} /> Buddy Requests
                <span className="buddies-section-count">{pendingIn.length}</span>
              </h4>
              <div className="buddies-grid">
                {pendingIn.map((b) => (
                  <div key={b.id} className="buddy-card buddy-card--pending">
                    <div className="buddy-card-avatar">
                      {b.avatarUrl ? <img src={b.avatarUrl} alt={b.name} /> : <span>{b.name.charAt(0)}</span>}
                    </div>
                    <div className="buddy-card-info">
                      <p className="buddy-card-name">{b.name}</p>
                      {b.dogName && <p className="buddy-card-dog"><I n="paw" s={12} /> {b.dogName}</p>}
                    </div>
                    <div className="buddy-card-actions">
                      <button className="buddy-btn buddy-btn--accept" onClick={() => handleAccept(b)} disabled={actionLoading === b.id}>
                        {actionLoading === b.id ? <I n="spinner" s={14} /> : <><I n="check" s={14} /> Accept</>}
                      </button>
                      <button className="buddy-btn buddy-btn--decline" onClick={() => handleRemove(b.id)} disabled={actionLoading === b.id}>
                        <I n="x" s={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="buddies-section">
            <h4 className="buddies-section-title">
              Your Pack <span className="buddies-section-count">{buddies.length}</span>
            </h4>
            {loading ? (
              <div className="buddies-loading">{[1,2,3].map((i) => <div key={i} className="buddy-skeleton" />)}</div>
            ) : buddies.length === 0 ? (
              <div className="buddies-empty">
                <span className="buddies-empty-icon">🐾</span>
                <p>No buddies yet!</p>
                <p className="buddies-empty-sub">Use the "Find Buddies" tab to connect with fellow dog owners.</p>
              </div>
            ) : (
              <div className="buddies-grid">
                {buddies.map((b) => (
                  <div key={b.id} className="buddy-card">
                    <div className="buddy-card-avatar">
                      {b.avatarUrl ? <img src={b.avatarUrl} alt={b.name} /> : <span>{b.name.charAt(0)}</span>}
                    </div>
                    <div className="buddy-card-info">
                      <p className="buddy-card-name">{b.name}</p>
                      {b.dogName && <p className="buddy-card-dog"><I n="paw" s={12} /> {b.dogName}{b.dogBreed ? ` · ${b.dogBreed}` : ""}</p>}
                      {b.bio && <p className="buddy-card-bio">{b.bio}</p>}
                      {b.buddySince && <p className="buddy-card-since">Buddies since {new Date(b.buddySince).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p>}
                    </div>
                    <button className="buddy-btn buddy-btn--remove" title="Remove buddy" onClick={() => handleRemove(b.id)} disabled={actionLoading === b.id}>
                      {actionLoading === b.id ? <I n="spinner" s={14} /> : <I n="x" s={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pendingOut.length > 0 && (
            <div className="buddies-section">
              <h4 className="buddies-section-title">
                ⏳ Sent Requests <span className="buddies-section-count">{pendingOut.length}</span>
              </h4>
              <div className="buddies-grid">
                {pendingOut.map((b) => (
                  <div key={b.id} className="buddy-card buddy-card--sent">
                    <div className="buddy-card-avatar">
                      {b.avatarUrl ? <img src={b.avatarUrl} alt={b.name} /> : <span>{b.name.charAt(0)}</span>}
                    </div>
                    <div className="buddy-card-info">
                      <p className="buddy-card-name">{b.name}</p>
                      {b.dogName && <p className="buddy-card-dog"><I n="paw" s={12} /> {b.dogName}</p>}
                    </div>
                    <span className="buddy-pending-label">Pending…</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "find" && (
        <div className="buddies-find-view">
          <div className="buddies-search-wrap">
            <span className="buddies-search-icon"><I n="search" s={16} /></span>
            <input className="buddies-search-input" placeholder="Search by name or dog name…"
              value={search} onChange={(e) => handleSearch(e.target.value)}
              autoFocus aria-label="Search for buddies" />
            {search && (
              <button className="buddies-search-clear" onClick={() => { setSearch(""); setSearchResults([]); }}>
                <I n="x" s={14} />
              </button>
            )}
          </div>
          {searching && <div className="buddies-search-status"><I n="spinner" s={18} /> Searching…</div>}
          {!searching && search && searchResults.length === 0 && (
            <div className="buddies-empty">
              <span className="buddies-empty-icon">🔍</span>
              <p>No users found for "{search}"</p>
              <p className="buddies-empty-sub">Try a different name or check the spelling.</p>
            </div>
          )}
          {!searching && searchResults.length > 0 && (
            <div className="buddies-grid">
              {searchResults.map((u) => (
                <div key={u.id} className="buddy-card">
                  <div className="buddy-card-avatar">
                    {u.avatarUrl ? <img src={u.avatarUrl} alt={u.name} /> : <span>{u.name.charAt(0)}</span>}
                  </div>
                  <div className="buddy-card-info">
                    <p className="buddy-card-name">{u.name}</p>
                    {u.dogName && <p className="buddy-card-dog"><I n="paw" s={12} /> {u.dogName}</p>}
                    {u.bio && <p className="buddy-card-bio">{u.bio}</p>}
                  </div>
                  <div className="buddy-card-actions">
                    {u.status === "buddy" ? (
                      <span className="buddy-status-badge buddy-status-badge--buddy"><I n="userCheck" s={13} /> Buddy</span>
                    ) : u.status === "pending_out" ? (
                      <span className="buddy-status-badge buddy-status-badge--pending">Sent ✓</span>
                    ) : u.status === "pending_in" ? (
                      <button className="buddy-btn buddy-btn--accept" onClick={() => handleAcceptFromSearch(u)} disabled={actionLoading === u.id}>
                        {actionLoading === u.id ? <I n="spinner" s={14} /> : <><I n="check" s={14} /> Accept</>}
                      </button>
                    ) : (
                      <button className="buddy-btn buddy-btn--add" onClick={() => handleSendRequest(u.id)} disabled={actionLoading === u.id}>
                        {actionLoading === u.id ? <I n="spinner" s={14} /> : <><I n="userPlus" s={14} /> Add</>}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!search && !searching && (
            <div className="buddies-find-hint">
              <div className="buddies-find-hint-icon">🔍</div>
              <p>Search for fellow dog owners to connect with!</p>
              <p className="buddies-empty-sub">Find friends by their name or their dog's name.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── My Posts Panel ──────────────────────────────────────────────────────────
const MyPostsPanel: React.FC<{ token: string; onViewInForum: (postId: string) => void }> = ({ token, onViewInForum }) => {
  const [posts, setPosts]         = useState<Post[]>([]);
  const [loading, setLoading]     = useState(true);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [toggling, setToggling]   = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getMyPosts(token).then(setPosts).finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (postId: string) => {
    setDeleting(postId); setConfirmDelete(null);
    try { await deletePost(token, postId); setPosts((prev) => prev.filter((p) => p.id !== postId)); }
    finally { setDeleting(null); }
  };

  const handleTogglePublish = async (post: Post) => {
    setToggling(post.id);
    try {
      const updated = await updatePost(token, post.id, { isPublished: !post.isPublished });
      setPosts((prev) => prev.map((p) => p.id === post.id ? updated : p));
    } finally { setToggling(null); }
  };

  if (loading) return <div className="posts-loading">{[1,2,3].map((i) => <div key={i} className="post-skeleton" />)}</div>;

  if (posts.length === 0) {
    return (
      <div className="posts-empty">
        <span className="posts-empty-icon"><I n="comment" s={40} /></span>
        <p>You haven't posted yet</p>
        <p className="posts-empty-sub">Head to the Community Forum to share your first post!</p>
      </div>
    );
  }

  return (
    <div className="posts-panel">
      <div className="posts-header">
        <p className="posts-count">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="posts-list">
        {posts.map((post) => (
          <div key={post.id} className={`post-card ${!post.isPublished ? "post-card--draft" : ""}`}>
            {!post.isPublished && <div className="post-draft-badge">Draft</div>}
            <div className="post-card-body">
              <div className="post-card-main">
                <h4 className="post-card-title">{post.title}</h4>
                <p className="post-card-excerpt">{post.body.slice(0, 120)}{post.body.length > 120 ? "…" : ""}</p>
                <div className="post-card-meta">
                  <span className="post-meta-item"><I n="heart" s={13} /> {post.likesCount}</span>
                  <span className="post-meta-item"><I n="comment" s={13} /> {post.commentsCount}</span>
                  <span className="post-meta-date">{timeAgo(post.createdAt)}</span>
                  {post.category && <span className="post-meta-category">{post.category}</span>}
                </div>
              </div>
              <div className="post-card-actions">
                <button className="post-action-btn post-action-btn--view" onClick={() => onViewInForum(post.id)} title="View in Forum">
                  <I n="post" s={15} />
                </button>
                <button
                  className={`post-action-btn ${post.isPublished ? "post-action-btn--hide" : "post-action-btn--publish"}`}
                  onClick={() => handleTogglePublish(post)} disabled={toggling === post.id}
                  title={post.isPublished ? "Hide post" : "Publish post"}>
                  {toggling === post.id ? <I n="spinner" s={15} /> : post.isPublished ? <I n="eyeOff" s={15} /> : <I n="eye" s={15} />}
                </button>
                <button className="post-action-btn post-action-btn--delete" onClick={() => setConfirmDelete(post.id)} disabled={deleting === post.id} title="Delete post">
                  {deleting === post.id ? <I n="spinner" s={15} /> : <I n="trash" s={15} />}
                </button>
              </div>
            </div>
            {confirmDelete === post.id && (
              <div className="post-delete-confirm">
                <p>Delete this post? This can't be undone.</p>
                <div className="post-delete-actions">
                  <button className="post-delete-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
                  <button className="post-delete-confirm-btn" onClick={() => handleDelete(post.id)}>
                    {deleting === post.id ? <I n="spinner" s={13} /> : <><I n="trash" s={13} /> Delete</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── PUBLIC PROFILE PREVIEW - COMPACT ─────────────────────────────────────────
const PublicProfilePreview: React.FC<{ user: UserProfile; dog: DogProfile | null; checkins: string[] }> = ({ user, dog, checkins }) => {
  const streak = calcStreak(checkins);

  return (
    <div className="pub-profile-card">
      {/* Header with avatar, name, bio */}
      <div className="pub-profile-body">
        <div className="pub-profile-header">
          <div className="pub-profile-avatar">
            {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : <span>{user.name.charAt(0).toUpperCase()}</span>}
          </div>
          
          <div className="pub-profile-info">
            <h2 className="pub-profile-name">{user.name}</h2>
            <p className="pub-profile-bio">
              {user.bio && user.bio.length > 0 
                ? user.bio 
                : <em>No bio yet</em>}
            </p>
          </div>

          {/* Streak badge top right */}
          <div className="pub-stat-compact">
            <I n="fire" s={16} />
            <span className="pub-stat-value-compact">{streak}</span>
          </div>
        </div>

        {/* Dog info row - compact bullet-separated */}
        {dog && (
          <div className="pub-profile-dog-info">
            <span className="pub-dog-item">
              <I n="paw" s={16} />
              {dog.name}
            </span>
            <span className="pub-dog-item">
              <span>{dog.breed}</span>
            </span>
            <span className="pub-dog-item">
              <span className={`dog-stage-badge stage-${dog.lifeStage}`}>{dog.lifeStage}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// MAIN DashboardView COMPONENT
interface DashboardViewProps {
  user: UserProfile;
  dog: DogProfile | null;
  token: string;
  onNav: (key: string) => void;
  onViewForumPost: (postId: string) => void;
}

type ProfileTab = "preview" | "buddies" | "posts";

const DashboardView: React.FC<DashboardViewProps> = ({ user, dog, token, onNav, onViewForumPost }) => {
  const todayKey = getTodayKey();
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long" });
  const [checkins, setCheckins] = useState<string[]>(() => loadCheckins(user.id));
  const checkedIn = checkins.includes(todayKey);
  const [allLogs, setAllLogs] = useState<Record<string, CareLog>>(() => loadLog());
  const todayLog: CareLog = allLogs[today] ?? { walk: false, fed: false, water: false, playtime: false };
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<ProfileTab>("preview");

  const streak = calcStreak(checkins);
  const tip = TIPS[new Date().getDay() % TIPS.length];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const doneCount = (["walk", "fed", "water", "playtime"] as (keyof CareLog)[]).filter((k) => todayLog[k]).length;

  const handleCheckInConfirm = (log: CareLog) => {
    const updatedLogs = { ...allLogs, [today]: log };
    setAllLogs(updatedLogs);
    localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));
    if (!checkedIn) {
      const updated = [...checkins, todayKey];
      saveCheckins(user.id, updated);
      setCheckins(updated);
    }
  };

  const quickLinks = [
    { icon: "calendar", label: "Buddy Calendar",  sub: "Events & appointments",  nav: "calendar",          type: "internal" as const },
    { icon: "forum",    label: "Community Forum",  sub: "Chat with other owners", nav: "forum",             type: "internal" as const },
    { icon: "map",      label: "Find Services",    sub: "Vets, groomers & walks", nav: "/service-finder",   type: "external" as const },
  ];

  // Streak last-7-days dots
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { key: d.toISOString().split("T")[0], label: d.toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 3), isToday: i === 6 };
  });

  const tabs: { key: ProfileTab; label: string; icon: string }[] = [
    { key: "preview", label: "Profile", icon: "eye" },
    { key: "buddies", label: "Buddies", icon: "users" },
    { key: "posts",   label: "Posts", icon: "comment" },
  ];

  return (
    <div className="db-view dv-view">

      {/* ── HERO ── */}
      <div className="dv-hero">
        <div className="dv-hero-left">
          <div className="dv-hero-avatar">
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt={user.name} />
              : <span>{user.name.charAt(0).toUpperCase()}</span>}
          </div>
          <div className="dv-hero-text">
            <h1 className="dv-hero-greeting">{greeting}, {user.name.split(" ")[0]}! 👋</h1>
            <p className="dv-hero-sub">
              {checkedIn
                ? `${dog?.name ?? "Your dog"} is all checked in for today. Keep that streak going!`
                : `Ready for your ${today} check-in${dog ? ` with ${dog.name}` : ""}?`}
            </p>
          </div>
        </div>
        <button className={`dv-checkin-hero-btn ${checkedIn ? "done" : ""}`} onClick={() => setCheckInOpen(true)}>
          {checkedIn
            ? <><I n="check" s={16} /> Checked In!</>
            : <><I n="paw" s={16} /> {dog?.name ?? "Buddy"} Check-In</>}
        </button>
      </div>

      {/* ── BENTO GRID ── */}
      {/* ── BENTO GRID ── */}
      <div className="dv-bento">

        {/* Streak */}
        <div className="dv-card dv-streak">
          <div className={`dv-streak-flame ${streak >= 3 ? "lit" : ""}`}>
            <svg viewBox="0 0 64 80" fill="none" className="dv-flame-svg">
              <path d="M32 4C28 18 18 22 18 36c0 7.7 6.3 14 14 14s14-6.3 14-14c0-6-4-10-4-10s-2 6-6 8c1-8-4-18-4-30z"
                fill={streak >= 3 ? "#FF9500" : "#C4B5FD"} />
              <path d="M32 42c0 0-6-4-6-10 0 4 2 8 6 10z" fill={streak >= 3 ? "#FFCC00" : "#EDE9FE"} opacity="0.8" />
            </svg>
          </div>
          <div className="dv-streak-num">{streak}</div>
          <div className="dv-streak-lbl">day streak</div>
          <div className="dv-streak-dots">
            {last7.map((d) => (
              <div key={d.key} className="dv-dot-col">
                <span className="dv-dot-name">{d.label}</span>
                <div className={`dv-dot ${checkins.includes(d.key) ? "checked" : ""} ${d.isToday ? "today" : ""}`}>
                  {checkins.includes(d.key) && <I n="check" s={9} />}
                </div>
              </div>
            ))}
          </div>
          <p className="dv-streak-nudge">
            {checkedIn
              ? `Come back tomorrow to make it ${streak + 1}!`
              : streak > 0 ? "Check in today to keep your streak alive!"
              : `Start your streak with ${dog?.name ?? "your dog"} today!`}
          </p>
        </div>

        {/* Daily care summary / quick-tap check-in */}
        <div className="dv-card dv-checkin">
          <div className="dv-checkin-hd">
            <div className="dv-checkin-title">Daily Check-In</div>
            <div className="dv-checkin-prog">{doneCount}/4 done</div>
          </div>
          <div className="dv-care-grid">
            {CARE_ITEMS_CONFIG.map((item) => (
              <div key={item.key} className={`dv-care-item ${todayLog[item.key] ? "done" : ""}`}
                style={{ "--care-color": item.color } as React.CSSProperties}>
                <span className="dv-care-icon"><I n={item.icon} s={28} /></span>
                <span className="dv-care-label">{item.label}</span>
              </div>
            ))}
          </div>
          <button className={`dv-checkin-btn ${checkedIn ? "done" : ""}`} onClick={() => setCheckInOpen(true)}>
            {checkedIn ? <><I n="check" s={14} /> Done for today</> : <><I n="paw" s={14} /> Open full check-in</>}
          </button>
        </div>

        {/* Tip of the day */}
        <div className="dv-card dv-tip">
          <div className="dv-tip-badge">💡 Tip of the day</div>
          <p className="dv-tip-text">{tip.text}</p>
        </div>

        {/* Quick links - NOW WIDER */}
        <div className="dv-card dv-links">
          <h3 className="dv-links-title">Explore BarkBuddy</h3>
          <div className="dv-links-list">
            {quickLinks.map((link) => (
              <button key={link.label} className="dv-link-item"
                onClick={() => link.type === "external" ? (window.location.href = link.nav) : onNav(link.nav)}>
                <span className="dv-link-icon"><I n={link.icon} s={20} /></span>
                <span className="dv-link-text">
                  <span className="dv-link-label">{link.label}</span>
                  <span className="dv-link-sub">{link.sub}</span>
                </span>
                <I n="arrow" s={14} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROFILE HUB WITH INSTAGRAM TABS ── */}
      <div className="dv-profile-hub">
        <div className="dv-hub-tabs" role="tablist" aria-label="Profile navigation">
          {tabs.map((tab, index) => (
            <button
              key={tab.key}
              className={`dv-hub-tab ${profileTab === tab.key ? "active" : ""}`}
              role="tab"
              aria-selected={profileTab === tab.key}
              aria-controls={`${tab.key}-panel`}
              aria-label={`View ${tab.label}`}
              onClick={() => setProfileTab(tab.key)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  const idx = tabs.findIndex(t => t.key === profileTab);
                  setProfileTab(tabs[(idx + 1) % tabs.length].key);
                } else if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  const idx = tabs.findIndex(t => t.key === profileTab);
                  setProfileTab(tabs[(idx - 1 + tabs.length) % tabs.length].key);
                } else if (e.key === "Home") {
                  e.preventDefault();
                  setProfileTab(tabs[0].key);
                } else if (e.key === "End") {
                  e.preventDefault();
                  setProfileTab(tabs[tabs.length - 1].key);
                }
              }}
              tabIndex={profileTab === tab.key ? 0 : -1}
            >
              <I n={tab.icon} s={20} />
              <span className="dv-hub-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="dv-hub-panel" id={`${profileTab}-panel`} role="tabpanel" aria-labelledby={`${profileTab}-tab`}>
          {profileTab === "preview" && <PublicProfilePreview user={user} dog={dog} checkins={checkins} />}
          {profileTab === "buddies" && <BuddiesPanel token={token} />}
          {profileTab === "posts"   && <MyPostsPanel token={token} onViewInForum={onViewForumPost} />}
        </div>
      </div>

      {/* ── CHECK-IN MODAL ── */}
      {checkInOpen && (
        <CheckInModal
          dogName={dog?.name ?? "Buddy"}
          dogAvatar={dog?.avatarUrl}
          checkins={checkins}
          initialLog={todayLog}
          onConfirm={handleCheckInConfirm}
          onClose={() => setCheckInOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardView;