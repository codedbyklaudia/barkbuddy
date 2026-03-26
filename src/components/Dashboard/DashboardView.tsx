import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  Flame, Footprints, Check, Users, MessageCircle, Eye, EyeOff,
  Search, Trash2, X, UserPlus, UserCheck, Heart, Loader2,
  Pencil, CalendarDays, Map, ChevronRight, Droplets,
  UtensilsCrossed, Zap, Star, Trophy, Sparkles, Dog,
  Activity, Plus, Shield, ArrowRight, UserMinus, Clock,
  BarChart2, CheckCircle2, ChevronLeft, Bone, Dumbbell,
} from "lucide-react";
import {
  getBuddies, searchUsers, sendBuddyRequest, acceptBuddy, removeBuddy,
} from "../../api/users";
import "./DashboardView.scss";


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
interface Buddy {
  id: string; userId: string; name: string; avatarUrl?: string;
  bio?: string; dogName?: string; dogBreed?: string; dogAvatar?: string;
  joinedAt: string; buddySince?: string;
}
interface BuddyUser {
  id: string; name: string; avatarUrl?: string; bio?: string;
  dogName?: string; status?: "none" | "pending_out" | "pending_in" | "buddy";
}
interface Post {
  id: string; title: string; body: string; category?: string;
  likesCount: number; commentsCount: number; isPublished: boolean;
  createdAt: string; updatedAt: string;
}
interface DogSummary {
  name: string; breed: string; lifeStage: string; gender: string;
  dob?: string; avatarUrl?: string; personality?: string[];
}
interface PublicProfile {
  id: string; name: string; bio?: string; avatarUrl?: string;
  createdAt: string; buddyCount: number; postCount: number; likesReceived: number;
  dog?: DogSummary;
  dogs?: DogSummary[];
}

// Care log types
interface CareLog { walk: boolean; fed: boolean; water: boolean; playtime: boolean; }
const EMPTY_LOG: CareLog = { walk: false, fed: false, water: false, playtime: false };
const LOG_KEYS = ["walk", "fed", "water", "playtime"] as const;

// API helpers
const BASE = () => import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function getMyPosts(token: string): Promise<Post[]> {
  try {
    const res = await fetch(`${BASE()}/forum/my-posts`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error();
    const d = await res.json();
    return d.posts ?? [];
  } catch { return []; }
}
async function deletePost(token: string, postId: string): Promise<void> {
  await fetch(`${BASE()}/forum/posts/${postId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
}
async function updatePost(token: string, postId: string, data: Partial<Post>): Promise<Post> {
  const res = await fetch(`${BASE()}/forum/posts/${postId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const d = await res.json();
  return d.post;
}
async function getPublicProfile(token: string, userId: string): Promise<PublicProfile | null> {
  try {
    const res = await fetch(`${BASE()}/users/${userId}/profile`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error();
    return res.json();
  } catch { return null; }
}
async function getMyProfile(token: string): Promise<PublicProfile | null> {
  try {
    const res = await fetch(`${BASE()}/users/me/profile`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error();
    return res.json();
  } catch { return null; }
}

// Checkin / streak 
function getCheckinKey(userId: string) { return `barkbuddy_checkins_${userId}`; }
function getTodayKey(): string { return new Date().toISOString().split("T")[0]; }
function getTodayLabel(): string {
  return new Date().toLocaleDateString("en-GB", { weekday: "long" });
}
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
  const today = getTodayKey();
  let streak = 0;
  const cursor = new Date(today);
  for (let i = 0; i < 365; i++) {
    const key = cursor.toISOString().split("T")[0];
    if (sorted.includes(key)) { streak++; cursor.setDate(cursor.getDate() - 1); }
    else { if (key === today) { cursor.setDate(cursor.getDate() - 1); continue; } break; }
  }
  return streak;
}

// Care log helpers
const LOG_KEY_FOR = (dogId: string) => `barkbuddy_carelog_${dogId}`;

function loadDogLog(dogId: string): Record<string, CareLog> {
  try { return JSON.parse(localStorage.getItem(LOG_KEY_FOR(dogId)) || "{}"); } catch { return {}; }
}
function saveDogLog(dogId: string, logs: Record<string, CareLog>) {
  localStorage.setItem(LOG_KEY_FOR(dogId), JSON.stringify(logs));
}

// Legacy single-dog log (backwards compat)
const LOG_KEY = "barkbuddy_carelog";
function loadLog(): Record<string, CareLog> {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || "{}"); } catch { return {}; }
}

// Care items config
const CARE_ITEMS_CONFIG: {
  key: keyof CareLog;
  Icon: React.FC<any>;
  label: string;
  desc: string;
  color: string;
}[] = [
  { key: "walk",     Icon: Footprints,      label: "Walk",        desc: "Daily exercise sorted!", color: "#3a2f51" }, 
  { key: "fed",      Icon: UtensilsCrossed, label: "Fed",          desc: "Meal all done!",          color: "#3a2f51" }, 
  { key: "water",    Icon: Droplets,        label: "Fresh Water",  desc: "Bowl topped up!",         color: "#3a2f51" }, 
  { key: "playtime", Icon: Dumbbell,        label: "Playtime",     desc: "Fun & games!",            color: "#3a2f51" }, 
];

// Dog accent colours
const DOG_ACCENTS = [
  "#6d4fc2", 
  "#9b72d8", 
  "#4a3870", 
  "#b89ee8", 
  "#7c5cbf", 
] as const;

// Tips
interface Tip {
  category: string; headline: string; body: string;
  icon: string; color: string; fact?: string;
}

const TIPS: Tip[] = [
  { category: "Dental",       headline: "Don't skip the teeth.",         body: "Brushing 2–3× a week prevents plaque build-up and bad breath. Most dental disease is painless until it's serious — early care makes all the difference.", icon: "smile",      color: "#7c5cbf", fact: "80% of dogs show signs of dental disease by age 3." },
  { category: "Hydration",    headline: "Water is their fuel.",           body: "Dogs need roughly 1 oz of water per pound of body weight every day. Dehydration sets in faster than you'd think — especially after walks or play.", icon: "droplets",   color: "#0369a1", fact: "A 10kg dog needs at least 600ml of water daily." },
  { category: "Mental Health", headline: "Sniffing IS exercise.",          body: "A 20-minute sniff walk tires a dog out more than a 1-hour power walk. Their nose processes 10,000× more scent info than ours — let them explore.", icon: "wind",       color: "#15803d", fact: "Dogs have up to 300 million olfactory receptors." },
  { category: "Anxiety",      headline: "Play beats the vet bill.",       body: "Just 10 focused minutes of play a day measurably reduces anxiety behaviours like barking, chewing, and pacing. Consistency matters more than duration.", icon: "zap",        color: "#c2710f", fact: "Anxious dogs are 3× more likely to develop destructive habits." },
  { category: "Sleep",        headline: "Dogs need more sleep than you.", body: "12–14 hours a day is completely normal. A quiet, consistent sleep spot reduces stress and supports immune health. Avoid moving their bed often.", icon: "moon",       color: "#4a3870", fact: "Puppies and seniors can sleep up to 18–20 hours." },
  { category: "Enrichment",   headline: "New toy? Wait a week.",          body: "Rotating toys weekly keeps novelty high. Dogs get bored with constant access — hiding a toy for 7 days makes it feel brand new again.", icon: "rotate-cw",  color: "#be185d", fact: "Enrichment reduces boredom-driven destruction by up to 70%." },
  { category: "Exercise",     headline: "Tired dogs are happy dogs.",     body: "Physical and mental exercise together are far more effective than either alone. A puzzle feeder before a walk sets them up for a calm afternoon.", icon: "activity",   color: "#0f766e", fact: "Combined stimulation doubles the calming effect of exercise alone." },
];

const TIP_ICONS: Record<string, React.FC<any>> = {
  smile:       (p) => <Sparkles {...p} />,
  droplets:    (p) => <Droplets {...p} />,
  wind:        (p) => <Activity {...p} />,
  zap:         (p) => <Zap {...p} />,
  moon:        (p) => <Star {...p} />,
  "rotate-cw": (p) => <Trophy {...p} />,
  activity:    (p) => <Activity {...p} />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Streak Celebration Overlay
const StreakCelebration: React.FC<{ streak: number; onClose: () => void }> = ({ streak, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="streak-celebration-overlay" onClick={onClose}>
      <div className="streak-celebration-card" onClick={e => e.stopPropagation()}>
        <div className="streak-cel-flame-wrap">
          <div className="streak-cel-flame-ring" />
          <div className="streak-cel-flame-ring ring2" />
          <Flame className="streak-cel-flame-icon" size={64} />
        </div>
        <div className="streak-cel-num">{streak}</div>
        <div className="streak-cel-label">Day Streak!</div>
        <p className="streak-cel-sub">
          {streak === 1 ? "You started your streak! Come back tomorrow." :
           streak < 7  ? `${streak} days strong. Keep going!` :
           streak < 30 ? `That's ${streak} days — you're on fire!` :
                          `${streak} days?! You're legendary!`}
        </p>
        <div className="streak-cel-particles">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="streak-cel-particle" style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

// Progress Ring (used inside CheckInModal)
const RING_R    = 18;
const RING_CIRC = 2 * Math.PI * RING_R;

const ProgressRing: React.FC<{ done: number; total: number; color: string }> = ({ done, total, color }) => {
  const offset = RING_CIRC * (1 - (total > 0 ? done / total : 0));
  const isDone = done === total && total > 0;
  return (
    <div className="checkin-ring-wrap">
      <svg className="checkin-ring-svg" viewBox="0 0 44 44" width={46} height={46} aria-hidden>
        <circle className="checkin-ring-bg" cx={22} cy={22} r={RING_R} />
        <circle
          className={`checkin-ring-fill${isDone ? " ring-complete" : ""}`}
          cx={22} cy={22} r={RING_R}
          style={{ stroke: isDone ? "#9b72d8" : color, strokeDashoffset: offset, strokeDasharray: RING_CIRC }}
        />
      </svg>
      <div
        className={`checkin-ring-label${isDone ? " ring-complete" : ""}`}
        style={{ color: isDone ? "#9b72d8" : color }}
      >
        {done}/{total}
      </div>
    </div>
  );
};

// Check-In Modal — multi-dog redesign
interface MultiDogCheckInModalProps {
  allDogs: DogProfile[];
  checkins: string[];
  dogLogs: Record<string, Record<string, CareLog>>;
  onConfirm: (updatedDogLogs: Record<string, Record<string, CareLog>>) => void;
  onClose: () => void;
}

const CheckInModal: React.FC<MultiDogCheckInModalProps> = ({
  allDogs, checkins, dogLogs, onConfirm, onClose,
}) => {
  const todayKey   = getTodayKey();
  const todayLabel = getTodayLabel();
  const streak     = calcStreak(checkins);

  const [localLogs, setLocalLogs] = useState<Record<string, CareLog>>(() => {
    const init: Record<string, CareLog> = {};
    allDogs.forEach(dog => {
      init[dog.id] = { ...(dogLogs[dog.id]?.[todayKey] ?? EMPTY_LOG) };
    });
    return init;
  });

  const [activeDogIdx, setActiveDogIdx] = useState(0);

  const activeDog   = allDogs[activeDogIdx];
  const activeLog   = localLogs[activeDog?.id] ?? EMPTY_LOG;
  const accentColor = DOG_ACCENTS[activeDogIdx % DOG_ACCENTS.length];

  const dogDoneCount = (dogId: string) =>
    LOG_KEYS.filter(k => localLogs[dogId]?.[k]).length;

  const activeDone    = dogDoneCount(activeDog?.id);
  const activeAllDone = activeDone === LOG_KEYS.length;
  const totalDone     = allDogs.reduce((s, d) => s + dogDoneCount(d.id), 0);
  const totalItems    = allDogs.length * LOG_KEYS.length;
  const overallPct    = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const toggleItem = (key: keyof CareLog) => {
    setLocalLogs(prev => ({
      ...prev,
      [activeDog.id]: { ...prev[activeDog.id], [key]: !prev[activeDog.id][key] },
    }));
  };

  const handleConfirm = () => {
    const updated: Record<string, Record<string, CareLog>> = { ...dogLogs };
    allDogs.forEach(dog => {
      updated[dog.id] = { ...(updated[dog.id] ?? {}), [todayKey]: localLogs[dog.id] };
    });
    onConfirm(updated);
    onClose();
  };

  if (!activeDog) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="checkin-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-label="Daily Check-In"
        style={{ "--accent-color": accentColor } as React.CSSProperties}
      >
        {/* ── TOP BAR ── */}
        <div className="checkin-topbar">
          <div className="checkin-topbar-left">
            <span className="checkin-eyebrow">Daily check-in</span>
            <span className="checkin-day">{todayLabel}</span>
          </div>
          <button className="checkin-close" onClick={onClose} aria-label="Close check-in">
            <X size={16} />
          </button>
        </div>

        {/* ── DOG SWITCHER ── */}
        {allDogs.length > 1 && (
          <div className="checkin-switcher" role="tablist" aria-label="Select dog">
            {allDogs.map((dog, idx) => {
              const done    = dogDoneCount(dog.id);
              const isDone  = done === LOG_KEYS.length;
              const color   = DOG_ACCENTS[idx % DOG_ACCENTS.length];
              const isActive = idx === activeDogIdx;
              return (
                <button
                  key={dog.id}
                  className={`checkin-chip${isActive ? " active" : ""}${isDone ? " chip-done" : ""}`}
                  style={{ "--chip-color": color } as React.CSSProperties}
                  onClick={() => setActiveDogIdx(idx)}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`${dog.name}, ${done} of ${LOG_KEYS.length} done`}
                >
                  <div className="checkin-chip-avatar">
                    {dog.avatarUrl ? <img src={dog.avatarUrl} alt={dog.name} /> : dog.name.charAt(0)}
                  </div>
                  <span className="checkin-chip-name">{dog.name}</span>
                  <span className="checkin-chip-progress">
                    {isDone ? "✓" : `${done}/${LOG_KEYS.length}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── BODY ── */}
        <div className="checkin-body">

          {/* Dog hero row */}
          <div className="checkin-dog-hero" style={{ "--hero-color": accentColor } as React.CSSProperties}>
            <div className="checkin-dog-hero-avatar" style={{ background: accentColor }}>
              {activeDog.avatarUrl
                ? <img src={activeDog.avatarUrl} alt={activeDog.name} />
                : <Dog size={22} strokeWidth={1.6} />}
            </div>
            <div className="checkin-dog-hero-text">
              <div className="checkin-dog-hero-name">{activeDog.name}</div>
            </div>
            <ProgressRing done={activeDone} total={LOG_KEYS.length} color={accentColor} />
          </div>

          {/* Care items */}
          <div className="checkin-items">
            {CARE_ITEMS_CONFIG.map((item, i) => {
            const isDone = activeLog[item.key];
            const { Icon } = item;
            return (
              <button
                key={item.key}
                className={`checkin-item${isDone ? " item-done" : ""}`}
                onClick={() => toggleItem(item.key)}
                aria-pressed={isDone}
                style={{ "--item-color": item.color, "--item-delay": `${i * 0.055}s` } as React.CSSProperties}
              >
                <div className="checkin-item-icon">
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <div className="checkin-item-text">
                    <span className="checkin-item-label">{item.label}</span>
                    <span className="checkin-item-sub">
                      {isDone ? item.desc : <span className="checkin-item-tap">Tap to mark as done</span>}
                    </span>
                  </div>
                  <div className="checkin-item-check" aria-hidden>
                    {isDone && <Check size={13} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* All-done banner */}
          <div className={`checkin-done-banner${activeAllDone ? " visible" : ""}`}>
            <span>{activeDog.name} is all sorted for today!</span>
          </div>

        </div>

        {/* ── FOOTER ── */}
        <div className="checkin-footer">
          <div className="checkin-streak-pill">
            <Flame size={14} />
            <span>{streak}</span>
          </div>

          <div className="checkin-footer-progress">
            <div className="checkin-footer-track">
              <div className="checkin-footer-fill" style={{ width: `${overallPct}%` }} />
            </div>
            <span className="checkin-footer-label">
              {overallPct === 100 ? "All dogs cared for! 🐾" : `${totalDone} / ${totalItems} tasks done`}
            </span>
          </div>

          {allDogs.length > 1 && activeDogIdx < allDogs.length - 1 ? (
            <button
              className="checkin-next-btn"
              onClick={() => setActiveDogIdx(i => i + 1)}
              style={{ "--accent-color": accentColor } as React.CSSProperties}
            >
              {allDogs[activeDogIdx + 1].name} <ChevronRight size={14} />
            </button>
          ) : (
            <button
              className={`checkin-save-btn${overallPct === 100 ? " btn-glow" : ""}`}
              onClick={handleConfirm}
              style={overallPct < 100 ? { background: accentColor } as React.CSSProperties : undefined}
            >
              {overallPct === 100 ? <><Star size={14} /> Save All</> : <><Check size={14} /> Save</>}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
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
  const [drawerBuddy, setDrawerBuddy]     = useState<Buddy | null>(null);
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
      setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, status: "pending_out" as const } : u));
    } finally { setActionLoading(null); }
  };

  const handleAccept = async (buddy: Buddy) => {
    setActionLoading(buddy.id);
    try {
      await acceptBuddy(token, buddy.id);
      setPendingIn(prev => prev.filter(b => b.id !== buddy.id));
      setBuddies(prev => [...prev, { ...buddy, buddySince: new Date().toISOString() }]);
    } finally { setActionLoading(null); }
  };

  const handleAcceptFromSearch = async (user: BuddyUser) => {
    setActionLoading(user.id);
    try {
      const request = pendingIn.find(b => b.userId === user.id);
      if (request) {
        await acceptBuddy(token, request.id);
        setPendingIn(prev => prev.filter(b => b.userId !== user.id));
        setBuddies(prev => [...prev, {
          id: request.id, userId: user.id, name: user.name,
          avatarUrl: user.avatarUrl, bio: user.bio, dogName: user.dogName,
          joinedAt: new Date().toISOString(), buddySince: new Date().toISOString(),
        }]);
        setSearchResults(prev => prev.map(u => u.id === user.id ? { ...u, status: "buddy" as const } : u));
      }
    } finally { setActionLoading(null); }
  };

  const handleRemove = async (buddyId: string) => {
    if (!confirm("Remove this buddy?")) return;
    setActionLoading(buddyId);
    try {
      await removeBuddy(token, buddyId);
      setBuddies(prev => prev.filter(b => b.id !== buddyId));
      if (drawerBuddy?.id === buddyId) setDrawerBuddy(null);
    } finally { setActionLoading(null); }
  };

  return (
    <div className="buddies-panel">
      <div className="buddies-tabs">
        <button className={`buddies-tab ${activeTab === "list" ? "active" : ""}`} onClick={() => setActiveTab("list")}>
          <Users size={15} /> My Pack
          {buddies.length > 0 && <span className="buddies-tab-badge">{buddies.length}</span>}
        </button>
        <button className={`buddies-tab ${activeTab === "find" ? "active" : ""}`} onClick={() => setActiveTab("find")}>
          <Search size={15} /> Find Buddies
        </button>
        {pendingIn.length > 0 && (
          <div className="buddies-pending-dot" title={`${pendingIn.length} pending`}>{pendingIn.length}</div>
        )}
      </div>

      {activeTab === "list" && (
        <div className="buddies-list-view">
          {pendingIn.length > 0 && (
            <div className="buddies-section">
              <h4 className="buddies-section-title">
                <UserPlus size={15} /> Buddy Requests
                <span className="section-count">{pendingIn.length}</span>
              </h4>
              <div className="buddies-grid">
                {pendingIn.map(b => (
                  <div key={b.id} className="buddy-card buddy-card--pending">
                    <div className="buddy-avatar">
                      {b.avatarUrl ? <img src={b.avatarUrl} alt={b.name} /> : <span>{b.name.charAt(0)}</span>}
                    </div>
                    <div className="buddy-info">
                      <p className="buddy-name">{b.name}</p>
                      {b.dogName && <p className="buddy-dog"><Bone size={11} /> {b.dogName}</p>}
                    </div>
                    <div className="buddy-actions">
                      <button className="buddy-btn accept" onClick={() => handleAccept(b)} disabled={actionLoading === b.id}>
                        {actionLoading === b.id ? <Loader2 size={13} className="spin" /> : <><Check size={13} /> Accept</>}
                      </button>
                      <button className="buddy-btn decline" onClick={() => handleRemove(b.id)} disabled={actionLoading === b.id}>
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="buddies-section">
            <h4 className="buddies-section-title">
              Your Pack <span className="section-count">{buddies.length}</span>
            </h4>
            {loading ? (
              <div className="buddies-skeletons">{[1,2,3].map(i => <div key={i} className="buddy-skeleton" />)}</div>
            ) : buddies.length === 0 ? (
              <div className="buddies-empty">
                <div className="buddies-empty-icon"><Users size={36} strokeWidth={1.2} /></div>
                <p>No buddies yet</p>
                <p className="empty-sub">Use "Find Buddies" to connect with fellow dog owners.</p>
              </div>
            ) : (
              <div className="buddies-grid">
                {buddies.map(b => (
                  <button key={b.id} className="buddy-card buddy-card--clickable" onClick={() => setDrawerBuddy(b)}>
                    <div className="buddy-avatar">
                      {b.avatarUrl ? <img src={b.avatarUrl} alt={b.name} /> : <span>{b.name.charAt(0)}</span>}
                    </div>
                    <div className="buddy-info">
                      <p className="buddy-name">{b.name}</p>
                      {b.dogName && <p className="buddy-dog"><Bone size={11} /> {b.dogName}{b.dogBreed ? ` · ${b.dogBreed}` : ""}</p>}
                      {b.buddySince && <p className="buddy-since"><Clock size={10} /> Since {new Date(b.buddySince).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p>}
                    </div>
                    <ChevronRight size={15} className="buddy-chevron" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {pendingOut.length > 0 && (
            <div className="buddies-section">
              <h4 className="buddies-section-title">
                Sent Requests <span className="section-count">{pendingOut.length}</span>
              </h4>
              <div className="buddies-grid">
                {pendingOut.map(b => (
                  <div key={b.id} className="buddy-card buddy-card--sent">
                    <div className="buddy-avatar">
                      {b.avatarUrl ? <img src={b.avatarUrl} alt={b.name} /> : <span>{b.name.charAt(0)}</span>}
                    </div>
                    <div className="buddy-info">
                      <p className="buddy-name">{b.name}</p>
                      {b.dogName && <p className="buddy-dog"><Bone size={11} /> {b.dogName}</p>}
                    </div>
                    <span className="buddy-pending-chip">Pending</span>
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
            <Search size={16} className="search-icon-abs" />
            <input
              className="buddies-search-input"
              placeholder="Search by name or dog name…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button className="search-clear-btn" onClick={() => { setSearch(""); setSearchResults([]); }}>
                <X size={14} />
              </button>
            )}
          </div>
          {searching && <div className="search-status"><Loader2 size={18} className="spin" /> Searching…</div>}
          {!searching && search && searchResults.length === 0 && (
            <div className="buddies-empty">
              <div className="buddies-empty-icon"><Search size={36} strokeWidth={1.2} /></div>
              <p>No users found for "{search}"</p>
              <p className="empty-sub">Try a different name or check the spelling.</p>
            </div>
          )}
          {!searching && searchResults.length > 0 && (
            <div className="buddies-grid">
              {searchResults.map(u => (
                <div key={u.id} className="buddy-card">
                  <div className="buddy-avatar">
                    {u.avatarUrl ? <img src={u.avatarUrl} alt={u.name} /> : <span>{u.name.charAt(0)}</span>}
                  </div>
                  <div className="buddy-info">
                    <p className="buddy-name">{u.name}</p>
                    {u.dogName && <p className="buddy-dog"><Bone size={11} /> {u.dogName}</p>}
                    {u.bio && <p className="buddy-bio">{u.bio}</p>}
                  </div>
                  <div className="buddy-actions">
                    {u.status === "buddy" ? (
                      <span className="buddy-status-badge is-buddy"><UserCheck size={13} /> Buddy</span>
                    ) : u.status === "pending_out" ? (
                      <span className="buddy-status-badge is-pending">Sent ✓</span>
                    ) : u.status === "pending_in" ? (
                      <button className="buddy-btn accept" onClick={() => handleAcceptFromSearch(u)} disabled={actionLoading === u.id}>
                        {actionLoading === u.id ? <Loader2 size={13} className="spin" /> : <><Check size={13} /> Accept</>}
                      </button>
                    ) : (
                      <button className="buddy-btn add" onClick={() => handleSendRequest(u.id)} disabled={actionLoading === u.id}>
                        {actionLoading === u.id ? <Loader2 size={13} className="spin" /> : <><UserPlus size={13} /> Add</>}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!search && !searching && (
            <div className="buddies-empty">
              <div className="buddies-empty-icon"><Search size={36} strokeWidth={1.2} /></div>
              <p>Find your dog park crew</p>
              <p className="empty-sub">Search by their name or their dog's name.</p>
            </div>
          )}
        </div>
      )}

      {drawerBuddy && (
        <BuddyDrawer
          buddy={drawerBuddy}
          token={token}
          onClose={() => setDrawerBuddy(null)}
          onRemoved={id => setBuddies(prev => prev.filter(b => b.id !== id))}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// My Posts Panel
// ─────────────────────────────────────────────────────────────────────────────

const MyPostsPanel: React.FC<{ token: string; onViewInForum: (postId: string) => void }> = ({ token, onViewInForum }) => {
  const [posts, setPosts]                 = useState<Post[]>([]);
  const [loading, setLoading]             = useState(true);
  const [deleting, setDeleting]           = useState<string | null>(null);
  const [toggling, setToggling]           = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getMyPosts(token).then(setPosts).finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async (postId: string) => {
    setDeleting(postId); setConfirmDelete(null);
    try { await deletePost(token, postId); setPosts(prev => prev.filter(p => p.id !== postId)); }
    finally { setDeleting(null); }
  };

  const handleTogglePublish = async (post: Post) => {
    setToggling(post.id);
    try {
      const updated = await updatePost(token, post.id, { isPublished: !post.isPublished });
      setPosts(prev => prev.map(p => p.id === post.id ? updated : p));
    } finally { setToggling(null); }
  };

  if (loading) return <div className="posts-skeletons">{[1,2,3].map(i => <div key={i} className="post-skeleton" />)}</div>;

  if (posts.length === 0) {
    return (
      <div className="posts-empty">
        <div className="posts-empty-icon"><MessageCircle size={40} strokeWidth={1.2} /></div>
        <p>No posts yet</p>
        <p className="empty-sub">Head to the Community Forum to share your first post!</p>
      </div>
    );
  }

  return (
    <div className="posts-panel">
      <div className="posts-panel-header">
        <span className="posts-count-chip">{posts.length} post{posts.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="posts-list">
        {posts.map(post => (
          <div key={post.id} className={`post-card ${!post.isPublished ? "is-draft" : ""}`}>
            {!post.isPublished && <div className="post-draft-tag">Draft</div>}
            <div className="post-card-body">
              <div className="post-card-main">
                <h4 className="post-card-title">{post.title}</h4>
                <p className="post-card-excerpt">{post.body.slice(0, 120)}{post.body.length > 120 ? "…" : ""}</p>
                <div className="post-card-meta">
                  <span className="post-meta-stat"><Heart size={12} /> {post.likesCount}</span>
                  <span className="post-meta-stat"><MessageCircle size={12} /> {post.commentsCount}</span>
                  <span className="post-meta-date">{timeAgo(post.createdAt)}</span>
                  {post.category && <span className="post-meta-cat">{post.category}</span>}
                </div>
              </div>
              <div className="post-card-actions">
                <button className="post-action view" onClick={() => onViewInForum(post.id)} title="View in Forum">
                  <Eye size={15} />
                </button>
                <button
                  className={`post-action ${post.isPublished ? "hide" : "publish"}`}
                  onClick={() => handleTogglePublish(post)}
                  disabled={toggling === post.id}
                  title={post.isPublished ? "Hide" : "Publish"}
                >
                  {toggling === post.id ? <Loader2 size={15} className="spin" /> : post.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button className="post-action delete" onClick={() => setConfirmDelete(post.id)} disabled={deleting === post.id} title="Delete">
                  {deleting === post.id ? <Loader2 size={15} className="spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </div>
            {confirmDelete === post.id && (
              <div className="post-delete-confirm">
                <p>Delete this post? This can't be undone.</p>
                <div className="post-confirm-actions">
                  <button className="post-confirm-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
                  <button className="post-confirm-delete" onClick={() => handleDelete(post.id)}>
                    {deleting === post.id ? <Loader2 size={13} className="spin" /> : <><Trash2 size={13} /> Delete</>}
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

// ─────────────────────────────────────────────────────────────────────────────
// Profile Card
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileCardProps {
  profile: PublicProfile; isSelf?: boolean; streak?: number;
  profileComplete?: number; buddySince?: string;
  onRemoveBuddy?: () => void; removingBuddy?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile, isSelf = false, streak = 0, profileComplete,
  buddySince, onRemoveBuddy, removingBuddy,
}) => {
  const joinedDate = new Date(profile.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const buddySinceDate = buddySince
    ? new Date(buddySince).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    : null;
  const allProfileDogs: DogSummary[] = profile.dogs?.length
    ? profile.dogs
    : profile.dog ? [profile.dog] : [];

  const getDogAge = (dob?: string) =>
    dob ? Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365)) : null;

  return (
    <div className="pc-root">
      <div className="pc-banner">
        <div className="pc-banner-bg" />
        <div className="pc-avatar-wrap">
          <div className="pc-avatar">
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} alt={profile.name} />
              : <span>{profile.name.charAt(0).toUpperCase()}</span>}
          </div>
          {streak >= 3 && (
            <div className="pc-streak-pip"><Flame size={11} /><span>{streak}</span></div>
          )}
        </div>
      </div>

      <div className="pc-identity">
        <h2 className="pc-name">{profile.name}</h2>
        <p className="pc-bio">{profile.bio || <em>No bio yet{isSelf ? " — add one!" : ""}</em>}</p>
        <div className="pc-meta-row">
          <span className="pc-meta-item"><Clock size={12} /> Joined {joinedDate}</span>
          {buddySinceDate && <span className="pc-meta-item accent"><Heart size={12} /> Buddies since {buddySinceDate}</span>}
        </div>
      </div>

      <div className="pc-stats">
        <div className="pc-stat"><span className="pc-stat-num">{profile.buddyCount}</span><span className="pc-stat-label">Buddies</span></div>
        <div className="pc-stat-divider" />
        <div className="pc-stat"><span className="pc-stat-num">{profile.postCount}</span><span className="pc-stat-label">Posts</span></div>
        <div className="pc-stat-divider" />
        <div className="pc-stat"><span className="pc-stat-num">{profile.likesReceived}</span><span className="pc-stat-label">Likes</span></div>
        {streak > 0 && (
          <>
            <div className="pc-stat-divider" />
            <div className="pc-stat"><span className="pc-stat-num pc-stat-num--fire">{streak} 🔥</span><span className="pc-stat-label">Streak</span></div>
          </>
        )}
      </div>

      {allProfileDogs.length > 0 && (
        <div className="pc-dogs">
          {allProfileDogs.map((d, i) => {
            const age = getDogAge(d.dob);
            return (
              <div key={i} className="pc-dog-card">
                <div className="pc-dog-avatar">
                  {d.avatarUrl
                    ? <img src={d.avatarUrl} alt={d.name} />
                    : <Dog size={22} strokeWidth={1.4} />}
                </div>
                <div className="pc-dog-info">
                  <div className="pc-dog-name-row">
                    <span className="pc-dog-name">{d.name}</span>
                    <span className={`pc-dog-stage stage-${d.lifeStage}`}>{d.lifeStage}</span>
                  </div>
                  <span className="pc-dog-breed">
                    {d.breed}{age !== null ? ` · ${age}y old` : ""}{" · "}{d.gender}
                  </span>
                  {d.personality && d.personality.length > 0 && (
                    <div className="pc-dog-traits">
                      {d.personality.slice(0, 4).map(t => (
                        <span key={t} className="pc-dog-trait">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isSelf && profileComplete !== undefined && profileComplete < 100 && (
        <div className="pc-complete">
          <div className="pc-complete-top">
            <span className="pc-complete-label"><CheckCircle2 size={13} /> Profile {profileComplete}% complete</span>
            <span className="pc-complete-pct">{profileComplete}%</span>
          </div>
          <div className="pc-complete-bar">
            <div className="pc-complete-fill" style={{ width: `${profileComplete}%` }} />
          </div>
          <p className="pc-complete-hint">
            {profileComplete < 40 ? "Add a bio and dog profile to get started." :
             profileComplete < 70 ? "Add your dog's photo to stand out." :
             "Almost there — add a few personality traits for your dog."}
          </p>
        </div>
      )}

      {!isSelf && onRemoveBuddy && (
        <button className="pc-remove-btn" onClick={onRemoveBuddy} disabled={removingBuddy}>
          {removingBuddy
            ? <><Loader2 size={14} className="spin" /> Removing…</>
            : <><UserMinus size={14} /> Remove Buddy</>}
        </button>
      )}
    </div>
  );
};

const ProfileCardSkeleton: React.FC = () => (
  <div className="pc-root pc-skeleton">
    <div className="pc-banner"><div className="pc-banner-bg" /></div>
    <div className="pc-identity">
      <div className="skel skel-name" />
      <div className="skel skel-bio" />
    </div>
    <div className="pc-stats">{[1,2,3].map(i => <div key={i} className="skel skel-stat" />)}</div>
    <div className="skel skel-dog" />
  </div>
);

// Buddy Drawer
const BuddyDrawer: React.FC<{
  buddy: Buddy; token: string;
  onClose: () => void; onRemoved: (buddyId: string) => void;
}> = ({ buddy, token, onClose, onRemoved }) => {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    getPublicProfile(token, buddy.userId).then(p => { setProfile(p); setLoading(false); });
  }, [buddy.userId, token]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleRemove = async () => {
    if (!confirm(`Remove ${buddy.name} as a buddy?`)) return;
    setRemoving(true);
    try { await removeBuddy(token, buddy.id); onRemoved(buddy.id); onClose(); }
    finally { setRemoving(false); }
  };

  return (
  <>
    <div className="bd-backdrop" onClick={onClose} />
    <div className="bd-drawer" role="dialog" aria-label={`${buddy.name}'s profile`}>
      <button className="bd-close" onClick={onClose} title="Close"><X size={18} /></button>
      {loading
        ? <ProfileCardSkeleton />
        : profile
          ? <ProfileCard profile={profile} isSelf={false} buddySince={buddy.buddySince} onRemoveBuddy={handleRemove} removingBuddy={removing} />
          : <div className="bd-error"><Dog size={32} strokeWidth={1.2} /><p>Couldn't load profile</p></div>
      }
    </div>
  </>
);
};

// ─────────────────────────────────────────────────────────────────────────────
// Public Profile Preview
// ─────────────────────────────────────────────────────────────────────────────

const PublicProfilePreview: React.FC<{
  user: UserProfile; dog: DogProfile | null; allDogs: DogProfile[]; checkins: string[]; token: string;
}> = ({ user, dog, allDogs, checkins, token }) => {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const streak = calcStreak(checkins);

  useEffect(() => {
    getMyProfile(token).then(p => { setProfile(p); setLoading(false); });
  }, [token]);

  if (loading) return <ProfileCardSkeleton />;

  const fallback: PublicProfile = {
    id: user.id, name: user.name, bio: user.bio, avatarUrl: user.avatarUrl,
    createdAt: user.createdAt, buddyCount: 0, postCount: 0, likesReceived: 0,
    dogs: allDogs.map(d => ({
      name: d.name, breed: d.breed, lifeStage: d.lifeStage,
      gender: d.gender, dob: d.dob, avatarUrl: d.avatarUrl, personality: d.personality,
    })),
  };

  return (
    <ProfileCard
      profile={profile ?? fallback}
      isSelf
      streak={streak}
      profileComplete={user.profileComplete}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// My Posts Bento Card
// ─────────────────────────────────────────────────────────────────────────────

const MyPostsBentoCard: React.FC<{
  token: string; onViewForum: () => void; onViewPost: (postId: string) => void;
}> = ({ token, onViewForum, onViewPost }) => {
  const [posts, setPosts]     = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPosts(token).then(setPosts).finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="dv-card dv-card--myposts">
      <div className="myposts-header">
        <span className="myposts-eyebrow"><MessageCircle size={13} /> My Posts</span>
        <button className="myposts-see-all" onClick={onViewForum}>See all <ChevronRight size={12} /></button>
      </div>
      {loading && <div className="myposts-skeletons">{[1,2,3].map(i => <div key={i} className="myposts-skeleton" />)}</div>}
      {!loading && posts.length === 0 && (
        <div className="myposts-empty">
          <MessageCircle size={28} strokeWidth={1.2} />
          <p>No posts yet</p>
          <button onClick={onViewForum}>Write your first post</button>
        </div>
      )}
      {!loading && posts.length > 0 && (
        <div className="myposts-list">
          {posts.slice(0, 3).map(post => (
            <button key={post.id} className="myposts-row" onClick={() => onViewPost(post.id)}>
              <div className="myposts-row-main">
                <span className="myposts-row-title">{post.title}</span>
                <div className="myposts-row-meta">
                  <span className={`myposts-status ${post.isPublished ? "published" : "draft"}`}>
                    {post.isPublished ? "Published" : "Draft"}
                  </span>
                  <span className="myposts-row-stats">
                    <Heart size={11} /> {post.likesCount}
                    <MessageCircle size={11} /> {post.commentsCount}
                  </span>
                </div>
              </div>
              <ChevronRight size={14} className="myposts-arrow" />
            </button>
          ))}
        </div>
      )}
      {!loading && posts.length > 3 && (
        <button className="myposts-more" onClick={onViewForum}>+{posts.length - 3} more posts</button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main DashboardView
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardViewProps {
  user: UserProfile;
  dog: DogProfile | null;
  allDogs: DogProfile[];
  token: string;
  onNav: (key: string) => void;
  onViewForumPost: (postId: string) => void;
}

type ProfileTab = "preview" | "buddies";

const DashboardView: React.FC<DashboardViewProps> = ({ user, dog, allDogs, token, onNav, onViewForumPost }) => {
  const todayKey = getTodayKey();
  const today    = new Date().toLocaleDateString("en-GB", { weekday: "long" });

  const [checkins, setCheckins]       = useState<string[]>(() => loadCheckins(user.id));
  const checkedIn                      = checkins.includes(todayKey);

  const [dogLogs, setDogLogs] = useState<Record<string, Record<string, CareLog>>>(() => {
    const result: Record<string, Record<string, CareLog>> = {};
    allDogs.forEach(d => { result[d.id] = loadDogLog(d.id); });
    if (dog) {
      const legacy = loadLog();
      if (Object.keys(legacy).length > 0 && !Object.keys(result[dog.id] ?? {}).length) {
        result[dog.id] = legacy;
      }
    }
    return result;
  });

  const [checkInOpen, setCheckInOpen]             = useState(false);
  const [showCelebration, setShowCelebration]     = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(0);
  const [profileTab, setProfileTab]               = useState<ProfileTab>("preview");

  const streak   = calcStreak(checkins);
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const dogsFullyDone = allDogs.filter(d => {
    const log = dogLogs[d.id]?.[today] ?? EMPTY_LOG;
    return LOG_KEYS.every(k => log[k]);
  });
  const allDogsCheckedIn = allDogs.length > 0 && dogsFullyDone.length === allDogs.length;

  const handleCheckInConfirm = (updatedDogLogs: Record<string, Record<string, CareLog>>) => {
    allDogs.forEach(d => {
      if (updatedDogLogs[d.id]) saveDogLog(d.id, updatedDogLogs[d.id]);
    });
    setDogLogs(updatedDogLogs);

    if (!checkedIn) {
      const updated = [...checkins, todayKey];
      saveCheckins(user.id, updated);
      setCheckins(updated);
      const newStreak = calcStreak(updated);
      setCelebrationStreak(newStreak);
      setShowCelebration(true);
    }
  };

  const quickLinks = [
    { Icon: CalendarDays,  label: "Buddy Calendar",  sub: "Events & appointments",  nav: "calendar",        external: false },
    { Icon: MessageCircle, label: "Community Forum",  sub: "Chat with other owners", nav: "forum",           external: false },
    { Icon: Map,           label: "Find Services",    sub: "Vets, groomers & walks", nav: "/service-finder", external: true  },
  ];

  const tabs: { key: ProfileTab; label: string; Icon: React.FC<any> }[] = [
    { key: "preview", label: "Profile", Icon: Shield },
    { key: "buddies", label: "Buddies", Icon: Users  },
  ];

  return (
    <div className="dv-root">

      {/* HERO */}
      <div className="dv-hero">
        <div className="dv-hero-inner">
          <div className="dv-hero-text">
            <p className="dv-hero-eyebrow">{greeting}</p>
            <h1 className="dv-hero-name">{user.name.split(" ")[0]}</h1>
            <p className="dv-hero-sub">
              {allDogsCheckedIn
                ? allDogs.length > 1
                  ? "All your dogs are checked in for today 🐾"
                  : `${dog?.name ?? "Your dog"} is all checked in for today.`
                : allDogs.length > 1
                  ? `Time for your pack's daily check-in (${dogsFullyDone.length}/${allDogs.length} done)`
                  : `Ready for ${dog ? `${dog.name}'s` : "your"} daily check-in?`}
            </p>
          </div>
          <div className="dv-hero-streak">
            <Flame size={20} className={streak >= 3 ? "flame-lit" : "flame-cold"} />
            <span className="dv-hero-streak-num">{streak}</span>
          </div>
        </div>
        <button
          className={`dv-hero-checkin-btn ${allDogsCheckedIn ? "checked" : ""}`}
          onClick={() => setCheckInOpen(true)}
        >
          {allDogsCheckedIn
            ? <><Check size={16} /> Checked In</>
            : <><Bone size={16} />
                {allDogs.length > 1 ? `Pack Check-In (${dogsFullyDone.length}/${allDogs.length})` : `${dog?.name ?? "Buddy"} Check-In`}
              </>}
        </button>
      </div>

      {/* BENTO GRID */}
      <div className="dv-bento">
        <div className="dv-card dv-card--links">
          <h3 className="links-title">Explore</h3>
          <div className="links-list">
            {quickLinks.map(link => {
              const { Icon } = link;
              return (
                <button
                  key={link.label}
                  className="link-row"
                  onClick={() => link.external ? (window.location.href = link.nav) : onNav(link.nav)}
                >
                  <div className="link-icon-wrap"><Icon size={18} strokeWidth={1.8} /></div>
                  <div className="link-text">
                    <span className="link-label">{link.label}</span>
                    <span className="link-sub">{link.sub}</span>
                  </div>
                  <ChevronRight size={16} className="link-arrow" />
                </button>
              );
            })}
          </div>
        </div>

        <MyPostsBentoCard token={token} onViewForum={() => onNav("forum")} onViewPost={onViewForumPost} />
      </div>

      {/* PROFILE HUB */}
      <div className="dv-hub">
        <div className="dv-hub-tabs" role="tablist">
          {tabs.map(tab => {
            const { Icon } = tab;
            return (
              <button
                key={tab.key}
                className={`dv-hub-tab ${profileTab === tab.key ? "active" : ""}`}
                role="tab"
                aria-selected={profileTab === tab.key}
                onClick={() => setProfileTab(tab.key)}
                tabIndex={profileTab === tab.key ? 0 : -1}
                onKeyDown={e => {
                  if (e.key === "ArrowRight") { e.preventDefault(); const i = tabs.findIndex(t => t.key === profileTab); setProfileTab(tabs[(i+1)%tabs.length].key); }
                  if (e.key === "ArrowLeft")  { e.preventDefault(); const i = tabs.findIndex(t => t.key === profileTab); setProfileTab(tabs[(i-1+tabs.length)%tabs.length].key); }
                }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="dv-hub-panel" role="tabpanel">
          {profileTab === "preview" && <PublicProfilePreview user={user} dog={dog} allDogs={allDogs} checkins={checkins} token={token} />}
          {profileTab === "buddies" && <BuddiesPanel token={token} />}
        </div>
      </div>

      {/* CHECK-IN MODAL */}
      {checkInOpen && allDogs.length > 0 && (
        <CheckInModal
          allDogs={allDogs}
          checkins={checkins}
          dogLogs={dogLogs}
          onConfirm={handleCheckInConfirm}
          onClose={() => setCheckInOpen(false)}
        />
      )}

      {/* STREAK CELEBRATION */}
      {showCelebration && (
        <StreakCelebration streak={celebrationStreak} onClose={() => setShowCelebration(false)} />
      )}
    </div>
  );
};

export default DashboardView;