import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Dashboard.scss";
import { useAuth } from "../context/AuthContext";
import BuddyCalendar from "./Buddy_Calendar";
import CommunityForum from "./CommunityForum";
import logoSrc from "../../images/logo.png";

import {
  getProfile, updateUser, uploadUserAvatar,
  updateDog, uploadDogAvatar, updatePreferences,
  getNotifications, markNotificationsRead,
} from "../api/users";

// ─── Types ─────────────────────────────────────────────────────────────────────
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

// ─── Notification Types ────────────────────────────────────────────────────────
export type NotifType = "new_comment" | "comment_liked";

export interface AppNotification {
  id:          string;
  type:        NotifType;
  actorName:   string;
  actorAvatar?: string;
  postId?:     string;
  postTitle?:  string;
  commentSnippet?: string;
  isRead:      boolean;
  createdAt:   string;
}

// Fallback in-memory implementation if API doesn't export these yet.
// Replace with real imports once your API is ready.
async function safeGetNotifications(token: string): Promise<AppNotification[]> {
  try {
    const res = await getNotifications(token);
    return res.notifications ?? [];
  } catch {
    return [];
  }
}
async function safeMarkRead(token: string, ids: string[]): Promise<void> {
  try { await markNotificationsRead(token, ids); } catch { /* silent */ }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Streak helpers
const CHECKIN_KEY = "barkbuddy_checkins";

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}
function loadCheckins(): string[] {
  try { const raw = localStorage.getItem(CHECKIN_KEY); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}
function saveCheckins(dates: string[]) {
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(dates));
}
function calcStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = [...new Set(dates)].sort().reverse();
  const today  = getTodayKey();
  let streak   = 0;
  let cursor   = new Date(today);
  for (let i = 0; i < 365; i++) {
    const key = cursor.toISOString().split("T")[0];
    if (sorted.includes(key)) { streak++; cursor.setDate(cursor.getDate() - 1); }
    else { if (key === today) { cursor.setDate(cursor.getDate() - 1); continue; } break; }
  }
  return streak;
}

// Nav
const NAV_ITEMS = [
  { key: "home",     label: "Home",           icon: "home"     },
  { key: "settings", label: "Settings",       icon: "settings" },
  { key: "dog",      label: "My Dog",         icon: "dog"      },
  { key: "calendar", label: "Buddy Calendar", icon: "calendar" },
  { key: "forum",    label: "Forum",          icon: "forum"    },
];

// Icons
const Icon: React.FC<{ name: string; size?: number }> = ({ name, size = 18 }) => {
  const icons: Record<string, React.ReactNode> = {
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    dog: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2 .352-3.5 2.055-3.5 4v3l1 2v2l2 1v-3l4-2 2 2v3l2-1v-2l1-2V7c0-1.933-1.5-3.648-3.5-4C9.577 2.679 8 3.782 8 5.172"/></svg>,
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    forum: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    paw: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><ellipse cx="6" cy="7" rx="2" ry="2.5"/><ellipse cx="18" cy="7" rx="2" ry="2.5"/><ellipse cx="10" cy="4" rx="2" ry="2.5"/><ellipse cx="14" cy="4" rx="2" ry="2.5"/><path d="M12 10c-3.5 0-6 2.5-6 5.5 0 1.5.5 2.5 1.5 3.5H16.5c1-.5 1.5-2 1.5-3.5C18 12.5 15.5 10 12 10z"/></svg>,
    fire: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 6 6 8 6 12c0 3.3 2.7 6 6 6s6-2.7 6-6c0-1.5-.5-3-1.5-4.5C15.5 9 15 10 14 10.5 14.5 8.5 13.5 5 12 2z"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    arrow: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
    camera: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    close: <img src="../images/icons/close.svg" width={size} height={size} />,
    spinner: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
    heart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    activity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    droplet: <img src="../images/icons/water.png" width={size} height={size} />,
    scissors: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
    vaccine: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>,
    trophy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M17 4H7l-1 7h10l-1-7z"/><path d="M5 4H3v3a2 2 0 0 0 2 2h0"/><path d="M19 4h2v3a2 2 0 0 1-2 2h0"/></svg>,
    share: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
    food: <img src="../images/icons/pet_bowl.png" width={size} height={size} />,
    walk: <img src="../images/icons/walk.png" width={size} height={size} />,
    info: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    map: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    link: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    penline: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    confetti: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5.5 3 3 5.5l10 10 2.5-2.5L5.5 3z"/><path d="m18 3 3 3-3.5 3.5-3-3L18 3z"/><path d="m3 18 3 3 3.5-3.5-3-3L3 18z"/><circle cx="19.5" cy="19.5" r="1.5"/><circle cx="4.5" cy="12.5" r="1.5"/><circle cx="12.5" cy="4.5" r="1.5"/></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    ball: <img src="../images/icons/ball.png" width={size} height={size} />,
    bowl: <img src="../images/icons/pet-bowl.png" width={size} height={size} />,
    dogFace: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10L2 2L8.5 8"/>
      <path d="M22 10L22 2L15.5 8"/>
      <rect x="2" y="8" width="20" height="14" rx="2"/>
      <rect x="6.5" y="11.5" width="2.5" height="2.5" fill="currentColor" stroke="none" rx="0.3"/>
      <rect x="15" y="11.5" width="2.5" height="2.5" fill="currentColor" stroke="none" rx="0.3"/>
      <line x1="2" y1="17" x2="22" y2="17"/>
      <path d="M10.5 15.5L12 13L13.5 15.5Z" fill="currentColor" stroke="none"/>
      <path d="M10.5 17 Q10.5 21 12 21 Q13.5 21 13.5 17"/>
    </svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    comment: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    heartFilled: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  };
  return <>{icons[name] ?? null}</>;
};

// ─── Notifications Panel ───────────────────────────────────────────────────────
const NotificationsPanel: React.FC<{
  notifications:  AppNotification[];
  loading:        boolean;
  onClose:        () => void;
  onMarkAllRead:  () => void;
  onClickNotif:   (n: AppNotification) => void;
}> = ({ notifications, loading, onClose, onMarkAllRead, onClickNotif }) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      {/* Invisible overlay for click-away */}
      <div className="notif-panel-overlay" onClick={onClose} />

      <div className="notif-panel" role="dialog" aria-label="Notifications">
        <div className="notif-panel-header">
          <h3>Notifications {unreadCount > 0 && <span className="notif-header-count">({unreadCount})</span>}</h3>
          {unreadCount > 0 && (
            <button className="notif-mark-all-btn" onClick={onMarkAllRead}>
              Mark all read
            </button>
          )}
        </div>

        <div className="notif-panel-list">
          {loading ? (
            <div className="notif-loading">
              {[1, 2, 3].map(i => <div key={i} className="notif-skeleton" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty">
              <span className="notif-empty-icon">
                <Icon name="bell" size={32} />
              </span>
              <span>All caught up! No notifications yet.</span>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${!n.isRead ? "is-unread" : ""}`}
                onClick={() => onClickNotif(n)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onClickNotif(n)}
              >
                <div className={`notif-icon-wrap ${n.type === "comment_liked" ? "type-like" : "type-comment"}`}>
                  {n.type === "comment_liked"
                    ? <Icon name="heartFilled" size={16} />
                    : <Icon name="comment"    size={16} />
                  }
                </div>
                <div className="notif-body">
                  <p className="notif-text">
                    {n.type === "new_comment" ? (
                      <><strong>{n.actorName}</strong> commented on your post</>
                    ) : (
                      <><strong>{n.actorName}</strong> liked your comment</>
                    )}
                  </p>
                  {(n.postTitle || n.commentSnippet) && (
                    <span className="notif-sub">
                      {n.postTitle ?? n.commentSnippet}
                    </span>
                  )}
                  <span className="notif-time">{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="notif-panel-footer">
            <button onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Avatar Upload ─────────────────────────────────────────────────────────────
const AvatarUpload: React.FC<{
  url?: string; name: string; size?: "sm" | "lg" | "hero";
  onUpload: (file: File) => Promise<void>; uploading?: boolean;
  shape?: "circle" | "rounded";
}> = ({ url, name, size = "lg", onUpload, uploading, shape = "circle" }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={`avatar-upload ${size} shape-${shape}`}>
      <div className="avatar-img">
        {url ? <img src={url} alt={name} /> : <span>{name.charAt(0).toUpperCase()}</span>}
        {uploading && <div className="avatar-uploading"><Icon name="spinner" size={20} /></div>}
      </div>
      <button
        className="avatar-edit-btn"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Upload photo"
      >
        <Icon name="camera" size={14} />
      </button>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
    </div>
  );
};

// ─── Dog Photo Hero ────────────────────────────────────────────────────────────
const DogPhotoHero: React.FC<{
  url?: string; name: string;
  onUpload: (file: File) => Promise<void>; uploading?: boolean;
}> = ({ url, name, onUpload, uploading }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="dog-photo-hero">
      <div className="dog-photo-img">
        {url
          ? <img src={url} alt={name} />
          : (
            <div className="dog-photo-placeholder">
              <Icon name="paw" size={48} />
              <p>Add {name}'s photo</p>
            </div>
          )
        }
        {uploading && <div className="dog-photo-uploading"><Icon name="spinner" size={24} /></div>}
        <button
          className="dog-photo-btn"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Upload dog photo"
        >
          <Icon name="camera" size={20} />
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
    </div>
  );
};

// ─── Inline Bio Editor ─────────────────────────────────────────────────────────
const BioEditor: React.FC<{
  bio?: string; token: string;
  onSave: (bio: string) => void;
}> = ({ bio, onSave }) => {
  const [editing, setEditing]   = useState(false);
  const [value,   setValue]     = useState(bio ?? "");
  const [saving,  setSaving]    = useState(false);
  const textareaRef             = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  const handleSave = async () => {
    setSaving(true);
    try { onSave(value.trim()); setEditing(false); }
    finally { setSaving(false); }
  };

  const handleCancel = () => { setValue(bio ?? ""); setEditing(false); };

  if (editing) {
    return (
      <div className="bio-editor">
        <textarea
          ref={textareaRef}
          className="bio-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tell the community about you and your dog…"
          maxLength={200}
          rows={3}
        />
        <div className="bio-editor-footer">
          <span className="bio-char-count">{value.length}/200</span>
          <div className="bio-editor-actions">
            <button className="bio-btn-cancel" onClick={handleCancel} disabled={saving}>Cancel</button>
            <button className="bio-btn-save" onClick={handleSave} disabled={saving}>
              {saving ? <Icon name="spinner" size={12} /> : <Icon name="check" size={12} />}
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bio-display" onClick={() => setEditing(true)} title="Click to edit bio">
      {bio ? (
        <p className="bio-text">{bio}</p>
      ) : (
        <p className="bio-placeholder">
          <Icon name="penline" size={12} />
          Add a bio — tell us about you and your dog…
        </p>
      )}
    </div>
  );
};

// ─── Edit User Modal ───────────────────────────────────────────────────────────
const EditUserModal: React.FC<{
  user: UserProfile; token: string;
  onSave: (updated: Partial<UserProfile>) => void; onClose: () => void;
}> = ({ user, token, onSave, onClose }) => {
  const [form, setForm]       = useState({ name: user.name, email: user.email, bio: user.bio ?? "", currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (form.newPassword) {
      if (!form.currentPassword)                     e.currentPassword = "Required to change password";
      if (form.newPassword.length < 8)               e.newPassword     = "Min 8 characters";
      if (!/[A-Z]/.test(form.newPassword))           e.newPassword     = "Must contain uppercase";
      if (!/[0-9]/.test(form.newPassword))           e.newPassword     = "Must contain a number";
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
      if (form.newPassword) { payload.currentPassword = form.currentPassword; payload.newPassword = form.newPassword; }
      if (Object.keys(payload).length === 0) { onClose(); return; }
      const res = await updateUser(token, payload);
      setSuccess("Saved!"); onSave(res.user); setTimeout(onClose, 800);
    } catch (err: any) {
      setErrors(err.errors ?? { general: err.message || "Something went wrong" });
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="modal-close" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <div className="modal-body">
          {errors.general && <div className="modal-error">{errors.general}</div>}
          {success        && <div className="modal-success">{success}</div>}
          <label className="modal-label">Name</label>
          <input className={`modal-input ${errors.name ? "error" : ""}`} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <span className="modal-field-error">{errors.name}</span>}
          <label className="modal-label">Email</label>
          <input className={`modal-input ${errors.email ? "error" : ""}`} type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <span className="modal-field-error">{errors.email}</span>}
          <label className="modal-label">Bio <span className="modal-optional">(optional)</span></label>
          <textarea className="modal-input modal-textarea" value={form.bio} maxLength={200} rows={3}
            placeholder="Tell the community about you and your dog…"
            onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <span className="modal-char-hint">{form.bio.length}/200</span>
          <div className="modal-divider">Change Password <span>(optional)</span></div>
          <label className="modal-label">Current Password</label>
          <input className={`modal-input ${errors.currentPassword ? "error" : ""}`} type="password"
            placeholder="Enter current password" value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
          {errors.currentPassword && <span className="modal-field-error">{errors.currentPassword}</span>}
          <label className="modal-label">New Password</label>
          <input className={`modal-input ${errors.newPassword ? "error" : ""}`} type="password"
            placeholder="Min 8 chars, uppercase & number" value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          {errors.newPassword && <span className="modal-field-error">{errors.newPassword}</span>}
          <label className="modal-label">Confirm New Password</label>
          <input className={`modal-input ${errors.confirmPassword ? "error" : ""}`} type="password"
            placeholder="Repeat new password" value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          {errors.confirmPassword && <span className="modal-field-error">{errors.confirmPassword}</span>}
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn-save" onClick={handleSave} disabled={loading}>
            {loading ? <><Icon name="spinner" size={14} /> Saving…</> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Dog Modal ────────────────────────────────────────────────────────────
const EditDogModal: React.FC<{
  dog: DogProfile; token: string;
  onSave: (updated: DogProfile) => void; onClose: () => void;
}> = ({ dog, token, onSave, onClose }) => {
  const [form, setForm]       = useState({ name: dog.name, breed: dog.breed, gender: dog.gender, dob: dog.dob || "", lifeStage: dog.lifeStage, personality: dog.personality });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const PERSONALITIES = ["high-energy","playful","gentle","lazy","adventurous","cuddly","independent","anxious"];
  const toggleP = (p: string) =>
    setForm((prev) => ({ ...prev, personality: prev.personality.includes(p) ? prev.personality.filter((x) => x !== p) : [...prev.personality, p] }));
  const handleSave = async () => {
    if (!form.name.trim()) { setErrors({ name: "Dog name is required" }); return; }
    setLoading(true);
    try {
      const res = await updateDog(token, form);
      setSuccess("Saved!"); onSave(res.dog); setTimeout(onClose, 800);
    } catch (err: any) {
      setErrors(err.errors ?? { general: err.message || "Something went wrong" });
    } finally { setLoading(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit {dog.name}'s Profile</h3>
          <button className="modal-close" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <div className="modal-body">
          {errors.general && <div className="modal-error">{errors.general}</div>}
          {success        && <div className="modal-success">{success}</div>}
          <label className="modal-label">Name</label>
          <input className={`modal-input ${errors.name ? "error" : ""}`} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <span className="modal-field-error">{errors.name}</span>}
          <label className="modal-label">Breed</label>
          <input className="modal-input" value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })} />
          <label className="modal-label">Gender</label>
          <div className="modal-radio-row">
            {["male","female"].map((g) => (
              <button key={g} className={`modal-radio-btn ${form.gender === g ? "selected" : ""}`}
                onClick={() => setForm({ ...form, gender: g })}>
                {g === "male" ? "♂ Boy" : "♀ Girl"}
              </button>
            ))}
          </div>
          <label className="modal-label">Date of Birth <span className="modal-optional">(optional)</span></label>
          <input className="modal-input" type="date" value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })} />
          <label className="modal-label">Life Stage</label>
          <div className="modal-radio-row">
            {["puppy","adult","senior"].map((s) => (
              <button key={s} className={`modal-radio-btn ${form.lifeStage === s ? "selected" : ""}`}
                onClick={() => setForm({ ...form, lifeStage: s })}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <label className="modal-label">Personality</label>
          <div className="modal-chips">
            {PERSONALITIES.map((p) => (
              <button key={p} className={`modal-chip ${form.personality.includes(p) ? "selected" : ""}`}
                onClick={() => toggleP(p)}>{p}</button>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn-save" onClick={handleSave} disabled={loading}>
            {loading ? <><Icon name="spinner" size={14} /> Saving…</> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Preferences Modal ─────────────────────────────────────────────────────────
const PreferencesModal: React.FC<{
  user: UserProfile; token: string;
  onSave: (data: Partial<UserProfile>) => void; onClose: () => void;
}> = ({ user, token, onSave, onClose }) => {
  const [emailNotifications, setEmailNotifications] = useState(user.emailNotifications);
  const [preferences, setPreferences] = useState(user.preferences || {});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const PREFS = [
    { key: "weeklyDigest",     label: "Weekly digest email"     },
    { key: "newServices",      label: "New services near me"    },
    { key: "communityUpdates", label: "Community forum updates" },
    { key: "dogTips",          label: "Dog care tips & advice"  },
    { key: "promotions",       label: "Promotions & offers"     },
  ];
  const handleSave = async () => {
    setLoading(true);
    try {
      await updatePreferences(token, { emailNotifications, preferences });
      setSuccess("Saved!"); onSave({ emailNotifications, preferences }); setTimeout(onClose, 800);
    } finally { setLoading(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Manage Preferences</h3>
          <button className="modal-close" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <div className="modal-body">
          {success && <div className="modal-success">{success}</div>}
          <div className="pref-toggle-row main-toggle">
            <div>
              <span className="pref-label">Email Notifications</span>
              <span className="pref-sub">Receive emails from BarkBuddy</span>
            </div>
            <button className={`toggle-switch ${emailNotifications ? "on" : ""}`} onClick={() => setEmailNotifications(!emailNotifications)}>
              <span className="toggle-thumb" />
            </button>
          </div>
          <div className={`pref-list ${!emailNotifications ? "disabled" : ""}`}>
            {PREFS.map((p) => (
              <div key={p.key} className="pref-toggle-row">
                <span className="pref-label">{p.label}</span>
                <button className={`toggle-switch small ${preferences[p.key] ? "on" : ""}`}
                  onClick={() => setPreferences((prev) => ({ ...prev, [p.key]: !prev[p.key] }))}
                  disabled={!emailNotifications}><span className="toggle-thumb" /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn-save" onClick={handleSave} disabled={loading}>
            {loading ? <><Icon name="spinner" size={14} /> Saving…</> : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Logo Component ────────────────────────────────────────────────────────────
const BarkBuddyLogo: React.FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
  const [imgFailed, setImgFailed] = useState(false);
  if (imgFailed) {
    return (
      <div className={`bb-logo-text bb-logo-${size}`}>
        <span className="bb-logo-paw">🐾</span>
        <span className="bb-logo-name">BarkBuddy</span>
      </div>
    );
  }
  return (
    <img
      src={logoSrc}
      alt="BarkBuddy"
      className={`bb-logo-img bb-logo-${size}`}
      onError={() => setImgFailed(true)}
    />
  );
};

// ─── Sidebar ───────────────────────────────────────────────────────────────────
const Sidebar: React.FC<{ active: string; onNav: (k: string) => void; onLogout: () => void }> = ({ active, onNav, onLogout }) => (
  <aside className="db-sidebar">
    <nav className="db-nav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.key}
          className={`db-nav-item ${active === item.key ? "active" : ""}`}
          onClick={() => onNav(item.key)}
        >
          <Icon name={item.icon} size={18} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
    <div className="db-sidebar-divider" />
    <button className="db-nav-item db-logout" onClick={onLogout}>
      <Icon name="logout" size={18} /><span>Log Out</span>
    </button>
  </aside>
);

// ─── Mobile Drawer ─────────────────────────────────────────────────────────────
const MobileDrawer: React.FC<{
  open: boolean; active: string; onNav: (k: string) => void;
  onClose: () => void; onLogout: () => void; user: UserProfile | null;
}> = ({ open, active, onNav, onClose, onLogout, user }) => {
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <>
      <div className={`mobile-drawer-backdrop ${open ? "is-open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`mobile-drawer-panel ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <img src="../../images/logo.svg" alt="BarkBuddy" className="db-logo-img"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <button className="mobile-drawer-close" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        {user && (
          <div className="mobile-drawer-user">
            <div className="mobile-drawer-avatar">
              {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : <span>{user.name.charAt(0).toUpperCase()}</span>}
            </div>
            <div>
              <p className="mobile-drawer-name">{user.name}</p>
              <p className="mobile-drawer-email">{user.email}</p>
            </div>
          </div>
        )}
        <nav className="mobile-drawer-nav">
          {NAV_ITEMS.map((item) => (
            <button key={item.key} className={`mobile-drawer-item ${active === item.key ? "active" : ""}`}
              onClick={() => { onNav(item.key); onClose(); }}>
              <span className="mobile-drawer-icon"><Icon name={item.icon} size={18} /></span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="mobile-drawer-item mobile-drawer-logout" onClick={onLogout}>
          <span className="mobile-drawer-icon"><Icon name="logout" size={18} /></span><span>Log Out</span>
        </button>
      </aside>
    </>
  );
};

// ─── Top Bar ───────────────────────────────────────────────────────────────────
const TopBar: React.FC<{
  user:             UserProfile | null;
  label:            string;
  unreadCount:      number;
  notifOpen:        boolean;
  onMenuOpen:       () => void;
  onToggleNotif:    () => void;
}> = ({ user, label, unreadCount, notifOpen, onMenuOpen, onToggleNotif }) => (
  <header className="db-topbar">
    <div className="db-topbar-left">
      <BarkBuddyLogo size="md" />
    </div>
    <h1 className="db-topbar-title">{label}</h1>
    <div className="db-topbar-right">
      {/* Bell with badge */}
      <div className="db-notif-bell-wrap">
        <button
          className={`db-topbar-bell ${notifOpen ? "is-active" : ""}`}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          onClick={onToggleNotif}
        >
          <Icon name="bell" size={20} />
        </button>
        {unreadCount > 0 && (
          <span className="db-notif-badge" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>
      <div className="db-topbar-avatar db-desktop-only">
        {user?.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : <span>{user?.name?.charAt(0)?.toUpperCase() ?? "?"}</span>}
      </div>
      <span className="db-topbar-name db-desktop-only">{user?.name ?? ""}</span>
      <button className="db-topbar-hamburger db-mobile-only" onClick={onMenuOpen} aria-label="Open menu">
        <span className="db-hamburger-bar" /><span className="db-hamburger-bar" /><span className="db-hamburger-bar" />
      </button>
    </div>
  </header>
);

// ─── Streak Card ───────────────────────────────────────────────────────────────
const StreakCard: React.FC<{ checkins: string[]; dogName?: string }> = ({ checkins, dogName }) => {
  const today   = getTodayKey();
  const streak  = calcStreak(checkins);
  const active  = checkins.includes(today);
  const isWarm  = streak >= 3;

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      key:     d.toISOString().split("T")[0],
      label:   d.toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 2),
      isToday: i === 6,
    };
  });

  const nudge = active
    ? `Come back tomorrow to make it ${streak + 1}!`
    : streak > 0
      ? "Check in today to keep your streak alive!"
      : `Start your streak with ${dogName ?? "your dog"} today!`;

  return (
    <div className={`streak-card ${isWarm ? "streak-warm" : ""}`}>
      <div className="streak-icon-wrap">
        <svg className={`streak-flame-svg ${isWarm ? "lit" : ""}`} viewBox="0 0 64 80" fill="none">
          <path
            d="M32 4C28 18 18 22 18 36c0 7.7 6.3 14 14 14s14-6.3 14-14c0-6-4-10-4-10s-2 6-6 8c1-8-4-18-4-30z"
            fill={isWarm ? "#FF9500" : "#C4B5FD"}
          />
          <path
            d="M32 42c0 0-6-4-6-10 0 4 2 8 6 10z"
            fill={isWarm ? "#FFCC00" : "#EDE9FE"}
            opacity="0.8"
          />
        </svg>
      </div>
      <p className="streak-number">{streak}</p>
      <p className="streak-label">day streak</p>
      <div className="streak-days">
        {days.map((d) => {
          const checked = checkins.includes(d.key);
          return (
            <div key={d.key} className="streak-day-col">
              <span className="streak-day-name">{d.label}</span>
              <div className={`streak-circle ${checked ? "checked" : ""} ${d.isToday ? "today" : ""}`}>
                {checked && (
                  <svg viewBox="0 0 16 16" fill="none" className="streak-tick">
                    <polyline points="3 8 7 12 13 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="streak-nudge-text">{nudge}</p>
    </div>
  );
};

// ─── Tip Banner ────────────────────────────────────────────────────────────────
const TIPS = [
  { text: "Brush your dog's teeth 2-3x per week to prevent plaque and keep their breath fresh!" },
  { text: "Dogs need about 1oz of water per pound of body weight daily. Keep that bowl full!" },
  { text: "Regular walks aren't just exercise - sniffing on walks is mental stimulation too!" },
  { text: "10 minutes of focused play per day can significantly reduce anxiety in dogs." },
  { text: "Dogs sleep 12-14 hours a day. A cosy, quiet sleep spot is key to their health." },
];

const TipBanner: React.FC = () => {
  const tip = TIPS[new Date().getDay() % TIPS.length];
  return (
    <div className="tip-banner">
      <div className="tip-content">
        <span className="tip-label">Tip of the day</span>
        <p className="tip-text">{tip.text}</p>
      </div>
    </div>
  );
};

// ─── Daily Care Log ────────────────────────────────────────────────────────────
interface CareLog { walk: boolean; fed: boolean; water: boolean; playtime: boolean; }
const LOG_KEY = "barkbuddy_carelog";
function loadLog(): Record<string, CareLog> {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || "{}"); } catch { return {}; }
}

const CARE_ITEMS_CONFIG: {
  key: keyof CareLog;
  icon: string;
  label: string;
  desc: string;
  color: string;
  bgColor: string;
  darkColor: string;
}[] = [
  { key: "walk",     icon: "walk",    label: "Walk",        desc: "Daily walkies done!",  color: "#927ACF", bgColor: "#f7f7f7", darkColor: "#3a2f51" },
  { key: "fed",      icon: "bowl",    label: "Fed",         desc: "Meal time sorted!",    color: "#d97706", bgColor: "#f7f7f7", darkColor: "#b45309" },
  { key: "water",    icon: "droplet", label: "Fresh Water", desc: "Bowl topped up!",      color: "#0284c7", bgColor: "#f7f7f7", darkColor: "#0369a1" },
  { key: "playtime", icon: "ball",    label: "Playtime",    desc: "Fun & games!",         color: "#16a34a", bgColor: "#f7f7f7", darkColor: "#15803d" },
];

// ─── Check-In Modal ────────────────────────────────────────────────────────────
const CheckInModal: React.FC<{
  dogName: string;
  dogAvatar?: string;
  checkins: string[];
  initialLog: CareLog;
  onConfirm: (log: CareLog) => void;
  onClose: () => void;
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

  useEffect(() => {
    if (allDone) { setTimeout(() => setCelebrated(true), 200); }
    else { setCelebrated(false); }
  }, [allDone]);

  const toggleItem = (key: keyof CareLog) => setLog((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleCheckIn = () => { onConfirm(log); onClose(); };

  return (
    <div className="modal-overlay checkin-overlay" onClick={onClose}>
      <div className="checkin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="checkin-modal-header">
          <div className="checkin-header-content">
            <div className="checkin-dog-avatar">
              {dogAvatar
                ? <img src={dogAvatar} alt={dogName} />
                : <span className="checkin-avatar-fallback"><Icon name="paw" size={24} /></span>
              }
            </div>
            <div>
              <h2 className="checkin-title">Daily Check-In</h2>
              <p className="checkin-subtitle">How did today go? Tap each one to log it!</p>
            </div>
          </div>
          <button className="checkin-close" onClick={onClose}><Icon name="close" size={26} /></button>
        </div>

        <div className="checkin-progress-wrap">
          <div className="checkin-progress-bar">
            <div
              className={`checkin-progress-fill ${allDone ? "all-done" : ""}`}
              style={{ width: `${(doneCount / keys.length) * 100}%` }}
            />
          </div>
          <span className="checkin-progress-label">
            {allDone ? <><Icon name="check" size={12} /> All done!</> : `${doneCount} of ${keys.length} logged`}
          </span>
        </div>

        <div className="checkin-items-grid">
          {CARE_ITEMS_CONFIG.map((item, index) => {
            const isDone = log[item.key];
            return (
              <button
                key={item.key}
                className={`checkin-item ${isDone ? "is-done" : ""}`}
                onClick={() => toggleItem(item.key)}
                style={{
                  "--item-color": item.color,
                  "--item-bg": item.bgColor,
                  "--item-dark": item.darkColor,
                  animationDelay: `${index * 0.06}s`,
                } as React.CSSProperties}
                aria-pressed={isDone}
              >
                <div className="checkin-item-icon-wrap">
                  <span className="checkin-item-icon-svg"><Icon name={item.icon} size={28} /></span>
                  {isDone && (
                    <div className="checkin-item-check">
                      <Icon name="check" size={12} />
                    </div>
                  )}
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
            <p className="checkin-celebration-sub">You're such a great dog parent <Icon name="heart" size={12} /></p>
          </div>
        </div>

        <div className="checkin-footer">
          <div className="checkin-streak-pill">
            <svg className="checkin-flame" viewBox="0 0 24 24" fill={streak >= 3 ? "#FF9500" : "#a78bfa"} width="16" height="16">
              <path d="M12 2C9 7 7 9 7 13c0 2.8 2.2 5 5 5s5-2.2 5-5c0-2-1.5-3.5-1.5-3.5S15 11 13 12c.5-3-1.5-6-1-10z"/>
            </svg>
            <span>{streak} day streak</span>
          </div>
          <button className={`checkin-confirm-btn ${allDone ? "all-done" : ""}`} onClick={handleCheckIn}>
            {allDone
              ? <><Icon name="paw" size={16} /> Check In & Save</>
              : <><Icon name="check" size={16} /> Check In ({doneCount}/{keys.length})</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Home View ─────────────────────────────────────────────────────────────────
const HomeView: React.FC<{ user: UserProfile; dog: DogProfile | null; onNav: (k: string) => void }> = ({ user, dog, onNav }) => {
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long" });
  const [checkins, setCheckins] = useState<string[]>(() => loadCheckins());
  const todayKey  = getTodayKey();
  const checkedIn = checkins.includes(todayKey);
  const [allLogs, setAllLogs] = useState<Record<string, CareLog>>(() => loadLog());
  const todayLog: CareLog = allLogs[today] ?? { walk: false, fed: false, water: false, playtime: false };
  const [checkInOpen, setCheckInOpen] = useState(false);

  const handleCheckInConfirm = (log: CareLog) => {
    const updatedLogs = { ...allLogs, [today]: log };
    setAllLogs(updatedLogs);
    localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));
    if (!checkedIn) {
      const updated = [...checkins, todayKey];
      saveCheckins(updated);
      setCheckins(updated);
    }
  };

  const doneCount = (["walk", "fed", "water", "playtime"] as (keyof CareLog)[]).filter((k) => todayLog[k]).length;

  return (
    <div className="db-view home-view">
      <div className="home-hero">
        <div className="home-hero-text">
          <h1 className="home-hero-title">Hey, {user.name.split(" ")[0]}!</h1>
          <p className="home-hero-sub">
            {checkedIn
              ? `You and ${dog?.name ?? "your dog"} are all checked in for ${today}. Keep that streak going!`
              : `Ready for your ${today} check-in with ${dog?.name ?? "your dog"}?`
            }
          </p>
          {!checkedIn && doneCount > 0 && (
            <p className="home-hero-progress">{doneCount}/4 care tasks logged — finish the check-in!</p>
          )}
        </div>
        <button className={`btn-checkin ${checkedIn ? "done" : ""}`} onClick={() => setCheckInOpen(true)}>
          {checkedIn
            ? <><Icon name="check" size={16} /> Checked In!</>
            : <><Icon name="paw" size={16} /> {dog?.name ?? "Buddy"} Check-In</>
          }
        </button>
      </div>

      <div className="home-cards-row">
        <StreakCard checkins={checkins} dogName={dog?.name} />
        <div className="db-card quick-links-card">
          <h3 className="db-card-title">Explore BarkBuddy</h3>
          <div className="quick-links">
            {[
              { icon: "calendar", label: "Buddy Calendar",  sub: "Events & appointments", nav: "calendar",   color: "#8b5cf6" },
              { icon: "forum",    label: "Community Forum", sub: "Chat with other owners", nav: "forum",      color: "#6366f1" },
              { icon: "map",      label: "Find Services",   sub: "Vets, groomers & walks", nav: "./services", color: "#7c3aed" },
            ].map((link) => (
              <button key={link.label} className="quick-link-item" onClick={() => onNav(link.nav)}>
                <span className="quick-link-icon" style={{ background: `${link.color}16`, color: link.color }}>
                  <Icon name={link.icon} size={38} />
                </span>
                <span className="quick-link-text">
                  <span className="quick-link-label">{link.label}</span>
                  <span className="quick-link-sub">{link.sub}</span>
                </span>
                <Icon name="arrow" size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <TipBanner />

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

// ─── Dog Helpers ───────────────────────────────────────────────────────────────
function calcAge(dob?: string): string {
  if (!dob) return "Unknown";
  const birth = new Date(dob), now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 1)  return "< 1 month";
  if (months < 24) return `${months} month${months !== 1 ? "s" : ""}`;
  const years = Math.floor(months / 12), rem = months % 12;
  return rem > 0 ? `${years}y ${rem}m` : `${years} year${years !== 1 ? "s" : ""}`;
}
function humanYears(dob?: string): string {
  if (!dob) return "";
  const ageYrs = (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  let h = ageYrs <= 1 ? ageYrs * 12 : ageYrs <= 2 ? 12 + (ageYrs - 1) * 12 : 24 + (ageYrs - 2) * 4;
  return `≈ ${Math.round(h)} human years`;
}

const PERSONALITY_ICONS: Record<string, string> = {
  "high-energy":  "fire",
  "playful":      "star",
  "gentle":       "heart",
  "lazy":         "droplet",
  "adventurous":  "map",
  "cuddly":       "heart",
  "independent":  "activity",
  "anxious":      "info",
};

const CARE_TIPS: Record<string, { icon: string; title: string; tip: string }[]> = {
  puppy: [
    { icon: "vaccine",  title: "Vaccinations",   tip: "Core vaccines at 8, 12 & 16 weeks. Keep a record!" },
    { icon: "food",     title: "Feeding",         tip: "3–4 small meals daily. Use age-specific puppy food." },
    { icon: "activity", title: "Exercise",        tip: "5 mins per month of age, twice daily. Easy on joints." },
    { icon: "heart",    title: "Socialisation",   tip: "Expose to sounds, people & dogs in the 3–14 week window." },
  ],
  adult: [
    { icon: "food",     title: "Nutrition",       tip: "2 meals per day. Monitor weight and adjust seasonally." },
    { icon: "activity", title: "Exercise",        tip: "30–60 mins of activity daily based on breed." },
    { icon: "scissors", title: "Grooming",        tip: "Brush weekly, bathe monthly. Check ears & nails." },
    { icon: "heart",    title: "Dental Health",   tip: "Brush 2–3x per week to prevent plaque build-up." },
  ],
  senior: [
    { icon: "heart",    title: "Health Checks",   tip: "Bi-annual vet visits to catch age-related issues early." },
    { icon: "food",     title: "Senior Diet",     tip: "Switch to senior formula. Joint supplements can help." },
    { icon: "activity", title: "Gentle Exercise", tip: "Shorter, slower walks. Watch for joint pain signs." },
    { icon: "droplet",  title: "Hydration",       tip: "Senior dogs prone to kidney issues — keep water fresh." },
  ],
};

// ─── Dog Details (shared types & sub-modals) ───────────────────────────────────
interface DogDetails {
  weight?:        string;
  bodyCondition?: string;
  activityLevel?: string;
  neutered?:      string;
  allergies?:     string;
  healthIssues?:  string;
  medications?:   string;
  eatingStyle?:   string;
  treatsPerDay?:  string;
  feedingTimes?:  string;
}

const DOG_DETAILS_KEY = "barkbuddy_dog_details";

interface DetailsModalProps {
  details: DogDetails;
  onSave: (d: DogDetails) => void;
  onClose: () => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ details, onSave, onClose }) => {
  const [form, setForm] = useState<DogDetails>({ ...details });
  const BC  = ["underweight","just right","overweight"];
  const ACT = ["low","moderate","active","very active"];
  const NEU = ["neutered","not neutered"];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h3>Edit Details</h3><button className="modal-close" onClick={onClose}><Icon name="close" size={18} /></button></div>
        <div className="modal-body">
          <label className="modal-label">Weight (e.g. 11.3 kg)</label>
          <input className="modal-input" placeholder="e.g. 11.3 kg" value={form.weight ?? ""}
            onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          <label className="modal-label">Body Condition</label>
          <div className="modal-radio-row">{BC.map((b) =>
            <button key={b} className={`modal-radio-btn ${form.bodyCondition === b ? "selected" : ""}`}
              onClick={() => setForm({ ...form, bodyCondition: b })}>{b}</button>)}
          </div>
          <label className="modal-label">Activity Level</label>
          <div className="modal-radio-row">{ACT.map((a) =>
            <button key={a} className={`modal-radio-btn ${form.activityLevel === a ? "selected" : ""}`}
              onClick={() => setForm({ ...form, activityLevel: a })}>{a}</button>)}
          </div>
          <label className="modal-label">Neutered</label>
          <div className="modal-radio-row">{NEU.map((n) =>
            <button key={n} className={`modal-radio-btn ${form.neutered === n ? "selected" : ""}`}
              onClick={() => setForm({ ...form, neutered: n })}>{n}</button>)}
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn-save" onClick={() => { onSave(form); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
};

const MedicalModal: React.FC<DetailsModalProps> = ({ details, onSave, onClose }) => {
  const [form, setForm] = useState<DogDetails>({ ...details });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h3>Edit Medical Info</h3><button className="modal-close" onClick={onClose}><Icon name="close" size={18} /></button></div>
        <div className="modal-body">
          <label className="modal-label">Allergies</label>
          <input className="modal-input" placeholder="e.g. None, chicken, pollen…" value={form.allergies ?? ""}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
          <label className="modal-label">Health Issues</label>
          <input className="modal-input" placeholder="e.g. None, hip dysplasia…" value={form.healthIssues ?? ""}
            onChange={(e) => setForm({ ...form, healthIssues: e.target.value })} />
          <label className="modal-label">Medications <span className="modal-optional">(optional)</span></label>
          <input className="modal-input" placeholder="e.g. None, monthly flea treatment…" value={form.medications ?? ""}
            onChange={(e) => setForm({ ...form, medications: e.target.value })} />
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn-save" onClick={() => { onSave(form); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
};

const EatingModal: React.FC<DetailsModalProps> = ({ details, onSave, onClose }) => {
  const [form, setForm] = useState<DogDetails>({ ...details });
  const STYLES   = ["eats anything","moderately picky","very picky"];
  const TREATS   = ["none","1–2 per day","3–6 per day","7+ per day"];
  const FEEDINGS = ["once a day","twice a day","free feeding"];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h3>Edit Eating Habits</h3><button className="modal-close" onClick={onClose}><Icon name="close" size={18} /></button></div>
        <div className="modal-body">
          <label className="modal-label">Eating Style</label>
          <div className="modal-radio-row">{STYLES.map((s) =>
            <button key={s} className={`modal-radio-btn ${form.eatingStyle === s ? "selected" : ""}`}
              onClick={() => setForm({ ...form, eatingStyle: s })}>{s}</button>)}
          </div>
          <label className="modal-label">Treats per Day</label>
          <div className="modal-radio-row">{TREATS.map((t) =>
            <button key={t} className={`modal-radio-btn ${form.treatsPerDay === t ? "selected" : ""}`}
              onClick={() => setForm({ ...form, treatsPerDay: t })}>{t}</button>)}
          </div>
          <label className="modal-label">Feeding Times</label>
          <div className="modal-radio-row">{FEEDINGS.map((f) =>
            <button key={f} className={`modal-radio-btn ${form.feedingTimes === f ? "selected" : ""}`}
              onClick={() => setForm({ ...form, feedingTimes: f })}>{f}</button>)}
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn-save" onClick={() => { onSave(form); onClose(); }}>Save</button>
        </div>
      </div>
    </div>
  );
};

const DetailCardIllustration: React.FC<{ type: "details" | "medical" | "eating" }> = ({ type }) => {
  const configs: Record<string, { bg: string; img: string }> = {
    details: { bg: "#b8cfe0", img: "../images/details-dog.png" },
    medical: { bg: "#e8c4c4", img: "../images/details-medical.png" },
    eating:  { bg: "#c4d9c4", img: "../images/details-food.png"  },
  };
  const c = configs[type];
  return (
    <div className="detail-card-illustration" style={{ background: c.bg }}>
      <img src={c.img} alt={type} className="detail-card-img" />
    </div>
  );
};

const DogDetailsSection: React.FC<{ dogName: string; dogId?: string }> = ({ dogName, dogId }) => {
  const storageKey = dogId ? `barkbuddy_dog_details_${dogId}` : DOG_DETAILS_KEY;

  const loadDetails = (): DogDetails => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; }
  };
  const saveDetails = (d: DogDetails) => localStorage.setItem(storageKey, JSON.stringify(d));

  const [details, setDetails]   = useState<DogDetails>(() => loadDetails());
  const [openModal, setOpenModal] = useState<"details" | "medical" | "eating" | null>(null);

  const handleSave = (updated: DogDetails) => {
    const merged = { ...details, ...updated };
    setDetails(merged);
    saveDetails(merged);
  };

  const hasDetails = details.weight || details.bodyCondition || details.activityLevel || details.neutered;
  const hasMedical = details.allergies || details.healthIssues || details.medications;
  const hasEating  = details.eatingStyle || details.treatsPerDay || details.feedingTimes;

  return (
    <div className="dog-details-section">
      <h2 className="dog-details-heading">{dogName}'s details</h2>
      <div className="dog-details-grid">
        <div className="detail-card">
          <DetailCardIllustration type="details" />
          <div className="detail-card-body">
            <div className="detail-card-header">
              <h3 className="detail-card-title">Details</h3>
              <button className="detail-edit-btn" onClick={() => setOpenModal("details")}>Edit</button>
            </div>
            {hasDetails ? (
              <ul className="detail-list">
                {details.weight        && <li>{details.weight}</li>}
                {details.bodyCondition && <li className="detail-capitalize">{details.bodyCondition}</li>}
                {details.activityLevel && <li className="detail-capitalize">{details.activityLevel}</li>}
                {details.neutered      && <li className="detail-capitalize">{details.neutered}</li>}
              </ul>
            ) : (
              <p className="detail-empty" onClick={() => setOpenModal("details")}>+ Add {dogName}'s details</p>
            )}
          </div>
        </div>
        <div className="detail-card">
          <DetailCardIllustration type="medical" />
          <div className="detail-card-body">
            <div className="detail-card-header">
              <h3 className="detail-card-title">Medical info</h3>
              <button className="detail-edit-btn" onClick={() => setOpenModal("medical")}>Edit</button>
            </div>
            {hasMedical ? (
              <ul className="detail-list">
                {details.allergies    && <li>{details.allergies.toLowerCase().startsWith("no") ? details.allergies : `Allergies: ${details.allergies}`}</li>}
                {details.healthIssues && <li>{details.healthIssues.toLowerCase().startsWith("no") ? details.healthIssues : `Health: ${details.healthIssues}`}</li>}
                {details.medications  && <li>{details.medications}</li>}
              </ul>
            ) : (
              <p className="detail-empty" onClick={() => setOpenModal("medical")}>+ Add medical info</p>
            )}
          </div>
        </div>
        <div className="detail-card">
          <DetailCardIllustration type="eating" />
          <div className="detail-card-body">
            <div className="detail-card-header">
              <h3 className="detail-card-title">Eating habits</h3>
              <button className="detail-edit-btn" onClick={() => setOpenModal("eating")}>Edit</button>
            </div>
            {hasEating ? (
              <ul className="detail-list">
                {details.eatingStyle  && <li className="detail-capitalize">{details.eatingStyle}</li>}
                {details.treatsPerDay && <li>{details.treatsPerDay} treats</li>}
                {details.feedingTimes && <li className="detail-capitalize">{details.feedingTimes}</li>}
              </ul>
            ) : (
              <p className="detail-empty" onClick={() => setOpenModal("eating")}>+ Add eating habits</p>
            )}
          </div>
        </div>
      </div>
      {openModal === "details" && <DetailsModal details={details} onSave={handleSave} onClose={() => setOpenModal(null)} />}
      {openModal === "medical" && <MedicalModal details={details} onSave={handleSave} onClose={() => setOpenModal(null)} />}
      {openModal === "eating"  && <EatingModal  details={details} onSave={handleSave} onClose={() => setOpenModal(null)} />}
    </div>
  );
};

// ─── Extra Dogs ────────────────────────────────────────────────────────────────
interface ExtraDog {
  id:          string;
  name:        string;
  breed:       string;
  gender:      string;
  dob?:        string;
  lifeStage:   string;
  personality: string[];
  avatarUrl?:  string;
}

const EXTRA_DOGS_KEY = "barkbuddy_extra_dogs";
function loadExtraDogs(): ExtraDog[] {
  try { return JSON.parse(localStorage.getItem(EXTRA_DOGS_KEY) || "[]"); } catch { return []; }
}
function saveExtraDogs(dogs: ExtraDog[]) {
  localStorage.setItem(EXTRA_DOGS_KEY, JSON.stringify(dogs));
}
function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

function useSimpleBreeds() {
  const [breeds, setBreeds]   = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchBreeds = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("https://dog.ceo/api/breeds/list/all");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const list = Object.keys(data.message)
        .flatMap((breed) => {
          const subs = data.message[breed];
          if (subs.length === 0) return [breed];
          return subs.map((s: string) => `${s} ${breed}`);
        })
        .map((name, id) => ({
          id,
          name: name.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setBreeds(list);
    } catch { setError("Could not load breeds"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBreeds(); }, [fetchBreeds]);
  return { breeds, loading, error, retry: fetchBreeds };
}

interface AddDogFormData {
  name:        string;
  breed:       string;
  dob:         string;
  lifeStage:   string;
  dobLocked:   boolean;
  personality: string[];
  gender:      string;
}

const ADD_LIFE_STAGES = [
  { key: "puppy",  label: "Puppy",  age: "0–1 yrs" },
  { key: "adult",  label: "Adult",  age: "1–7 yrs" },
  { key: "senior", label: "Senior", age: "7+ yrs"  },
] as const;

const ADD_PERSONALITIES = [
  { key: "high-energy",  label: "Walks & running"  },
  { key: "playful",      label: "Sleeping"          },
  { key: "gentle",       label: "Treats"            },
  { key: "lazy",         label: "Playing"           },
  { key: "cuddly",       label: "Cuddles"           },
  { key: "anxious",      label: "Chasing the ball!" },
  { key: "adventurous",  label: "Adventurous"       },
  { key: "independent",  label: "Independent"       },
];

function calcLifeStageFromDob(dob: string): string {
  const birth = new Date(dob);
  const now   = new Date();
  const ageMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (ageMonths < 12) return "puppy";
  if (ageMonths < 84) return "adult";
  return "senior";
}

const AddDogStepA: React.FC<{
  form: AddDogFormData; errors: Record<string, string>;
  onChange: (patch: Partial<AddDogFormData>) => void;
}> = ({ form, errors, onChange }) => {
  const [search,   setSearch]   = useState(form.breed && form.breed !== "Mixed Breed" ? form.breed : "");
  const [showList, setShowList] = useState(false);
  const [isMixed,  setIsMixed]  = useState(form.breed === "Mixed Breed");
  const { breeds, loading, error, retry } = useSimpleBreeds();

  const filtered = breeds.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())).slice(0, 80);

  const handleMixed = () => {
    if (isMixed) { setIsMixed(false); onChange({ breed: "" }); setSearch(""); }
    else         { setIsMixed(true);  onChange({ breed: "Mixed Breed" }); setSearch(""); setShowList(false); }
  };

  return (
    <div className="adw-step">
      <p className="adw-step-label">Step 1</p>
      <h2 className="adw-step-heading">Tell us about your buddy!</h2>
      <label className="adw-label">What's your dog's name?</label>
      <div className="adw-field">
        <input
          className={`adw-input ${errors.name ? "adw-error" : ""}`}
          placeholder="e.g. Luna, Cooper, Max…"
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
        {errors.name && <span className="adw-field-error">{errors.name}</span>}
      </div>
      <label className="adw-label" style={{ marginTop: "1.2rem" }}>Which breed?</label>
      {!isMixed && (
        <div className="adw-field" style={{ marginTop: "0.4rem" }}>
          <div className="adw-breed-wrap">
            <input
              className={`adw-input ${form.breed && form.breed !== "Mixed Breed" ? "adw-has-value" : ""} ${errors.breed ? "adw-error" : ""}`}
              placeholder="Search breed…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowList(true); if (form.breed) onChange({ breed: "" }); }}
              onFocus={() => setShowList(true)}
              disabled={loading}
            />
            {form.breed && form.breed !== "Mixed Breed" && (
              <button className="adw-breed-clear" onClick={() => { onChange({ breed: "" }); setSearch(""); setShowList(true); }}>×</button>
            )}
          </div>
          {errors.breed && <span className="adw-field-error">{errors.breed}</span>}
          {showList && loading && <div className="adw-breed-state"><div className="adw-spinner" /><span>Loading breeds…</span></div>}
          {showList && !loading && error && (
            <div className="adw-breed-state adw-breed-error">
              <span>Could not load breeds</span>
              <button className="adw-retry-btn" onClick={retry}>Retry</button>
            </div>
          )}
          {showList && !loading && !error && (
            filtered.length === 0
              ? <div className="adw-breed-state"><span>No breeds match "{search}"</span></div>
              : (
                <div className="adw-breed-list">
                  {filtered.map((b) => (
                    <div key={b.id} className={`adw-breed-item ${form.breed === b.name ? "selected" : ""}`}
                      onClick={() => { onChange({ breed: b.name }); setSearch(b.name); setShowList(false); }}>
                      <span>{b.name}</span>
                      <span className={`adw-breed-dot ${form.breed === b.name ? "filled" : ""}`} />
                    </div>
                  ))}
                </div>
              )
          )}
        </div>
      )}
      <label className="adw-mixed-toggle" onClick={handleMixed}>
        <div className={`adw-mixed-check ${isMixed ? "checked" : ""}`}>
          {isMixed && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
        <span>
          {form.name
            ? <><strong>{form.name}</strong> has an adorable unknown, mixed breed</>
            : <>My dog has an adorable unknown, mixed breed</>
          }
        </span>
      </label>
    </div>
  );
};

const AddDogStepB: React.FC<{
  form: AddDogFormData; errors: Record<string, string>;
  onChange: (patch: Partial<AddDogFormData>) => void;
}> = ({ form, errors, onChange }) => {
  const [dobUnknown, setDobUnknown] = useState(!form.dob && !form.dobLocked);
  const dobRef = useRef<HTMLInputElement>(null);

  const handleDobChange = (dob: string) => {
    if (!dob) { onChange({ dob: "", dobLocked: false }); return; }
    const stage = calcLifeStageFromDob(dob);
    onChange({ dob, lifeStage: stage, dobLocked: true });
  };

  const handleDobUnknown = () => {
    if (!dobUnknown) { setDobUnknown(true); onChange({ dob: "", dobLocked: false }); }
    else             { setDobUnknown(false); }
  };

  const toggleP = (key: string) => {
    const updated = form.personality.includes(key)
      ? form.personality.filter((p) => p !== key)
      : [...form.personality, key];
    onChange({ personality: updated });
  };

  return (
    <div className="adw-step">
      <p className="adw-step-label">Step 2</p>
      <h2 className="adw-step-heading">Age & personality</h2>
      <label className="adw-label">
        When was {form.name || "your dog"} born?
        <span className="adw-label-hint"> (optional)</span>
      </label>
      <div className="adw-dob-row">
        <div className={`adw-field adw-dob-field ${dobUnknown ? "adw-dob-disabled" : ""}`}
          onClick={() => !dobUnknown && dobRef.current?.showPicker()}>
          <input
            ref={dobRef}
            className={`adw-input adw-calendar ${errors.dob ? "adw-error" : ""}`}
            type="date"
            value={form.dob}
            disabled={dobUnknown}
            onChange={(e) => handleDobChange(e.target.value)}
          />
        </div>
        <button className={`adw-dob-unknown ${dobUnknown ? "selected" : ""}`} onClick={handleDobUnknown}>
          {dobUnknown ? "↩ Pick a date" : "I'm not sure"}
        </button>
      </div>
      {form.dob && form.dobLocked && (
        <p className="adw-dob-hint"><Icon name="check" size={11} /> Life stage auto-set based on Birthday!</p>
      )}
      {dobUnknown && <p className="adw-dob-hint">No worries — set the life stage manually below.</p>}
      <label className="adw-label" style={{ marginTop: "1.3rem" }}>Life stage</label>
      {errors.lifeStage && <span className="adw-field-error">{errors.lifeStage}</span>}
      <div className="adw-stage-grid">
        {ADD_LIFE_STAGES.map((s) => {
          const isLocked   = form.dobLocked;
          const isSelected = form.lifeStage === s.key;
          return (
            <button key={s.key}
              className={`adw-stage-btn ${isSelected ? "selected" : ""} ${isLocked && !isSelected ? "locked-out" : ""} ${isLocked ? "stage-locked" : ""}`}
              onClick={() => { if (!isLocked) onChange({ lifeStage: s.key }); }}
              disabled={isLocked && !isSelected}
              title={isLocked ? "Life stage is locked to birthday" : undefined}
            >
              <span className="adw-stage-icon"><Icon name="dogFace" size={22} /></span>
              <span className="adw-stage-label">{s.label}</span>
              <span className="adw-stage-age">{s.age}</span>
              {isLocked && isSelected && (
                <span className="adw-stage-lock-badge" title="Locked to birthday">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="10" height="10">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <label className="adw-label" style={{ marginTop: "1.3rem" }}>
        What {form.name || "your dog"} loves most
        <span className="adw-label-hint"> (pick all that apply)</span>
      </label>
      {errors.personality && <span className="adw-field-error">{errors.personality}</span>}
      <div className="adw-personality-grid">
        {ADD_PERSONALITIES.map((p) => (
          <button key={p.key}
            className={`adw-personality-chip ${form.personality.includes(p.key) ? "selected" : ""}`}
            onClick={() => toggleP(p.key)}
          >
            <span className="adw-chip-icon"><Icon name="paw" size={16} /></span>
            <span className="adw-chip-label">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const AddDogStepC: React.FC<{
  form: AddDogFormData; errors: Record<string, string>;
  onChange: (patch: Partial<AddDogFormData>) => void;
}> = ({ form, errors, onChange }) => (
  <div className="adw-step">
    <p className="adw-step-label">Step 3</p>
    <h2 className="adw-step-heading">
      <strong>{form.name || "Your dog"}</strong> is a good…
    </h2>
    <div className="adw-gender-grid">
      <button className={`adw-gender-btn ${form.gender === "male" ? "selected" : ""}`} onClick={() => onChange({ gender: "male" })}>
        <span className="adw-gender-icon adw-gender-male">
          <img src="../images/paint/male_icon.png" width={"40%"} />
        </span>
        <span className="adw-gender-label">Boy</span>
      </button>
      <button className={`adw-gender-btn ${form.gender === "female" ? "selected" : ""}`} onClick={() => onChange({ gender: "female" })}>
        <span className="adw-gender-icon adw-gender-female">
          <img src="../images/paint/female_icon.png" width={"40%"} />
        </span>
        <span className="adw-gender-label">Girl</span>
      </button>
    </div>
    {errors.gender && <span className="adw-field-error" style={{ marginTop: "0.5rem" }}>{errors.gender}</span>}
  </div>
);

const AddDogModal: React.FC<{
  onSave:  (dog: ExtraDog) => void;
  onClose: () => void;
}> = ({ onSave, onClose }) => {
  const [step,   setStep]   = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form,   setForm]   = useState<AddDogFormData>({
    name: "", breed: "", dob: "", lifeStage: "adult", dobLocked: false, personality: [], gender: "male",
  });

  const patch = (p: Partial<AddDogFormData>) => {
    setForm((prev) => ({ ...prev, ...p }));
    const cleared: Record<string, string> = { ...errors };
    Object.keys(p).forEach((k) => delete cleared[k]);
    setErrors(cleared);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!form.name.trim())  e.name  = "Dog name is required";
      if (!form.breed.trim()) e.breed = "Please select a breed";
    }
    if (step === 2) {
      if (!form.lifeStage)             e.lifeStage   = "Please select a life stage";
      if (form.personality.length < 1) e.personality = "Pick at least one";
    }
    if (step === 3) {
      if (!form.gender) e.gender = "Please select a gender";
    }
    if (Object.keys(e).length > 0) { setErrors(e); return false; }
    return true;
  };

  const handleNext = () => { if (!validate()) return; setStep((s) => (s < 3 ? (s + 1) as 1 | 2 | 3 : s)); };
  const handleBack = () => { setErrors({}); setStep((s) => (s > 1 ? (s - 1) as 1 | 2 | 3 : s)); };
  const handleSave = () => {
    if (!validate()) return;
    const newDog: ExtraDog = {
      id: Date.now().toString(), name: form.name, breed: form.breed,
      gender: form.gender, dob: form.dob || undefined,
      lifeStage: form.lifeStage, personality: form.personality,
    };
    onSave(newDog); onClose();
  };

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") { if (step < 3) handleNext(); else handleSave(); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [step, form]);

  return (
    <div className="adw-overlay" onClick={onClose}>
      <div className="adw-modal" onClick={(e) => e.stopPropagation()}>
        <div className="adw-form">
          <div className="adw-form-topbar">
            <div className="adw-step-dots">
              {([1, 2, 3] as const).map((n) => (
                <React.Fragment key={n}>
                  <div className={`adw-dot ${step === n ? "active" : step > n ? "done" : ""}`} />
                  {n < 3 && <div className={`adw-dot-line ${step > n ? "done" : ""}`} />}
                </React.Fragment>
              ))}
            </div>
            <button className="adw-close" onClick={onClose}><Icon name="close" size={16} /></button>
          </div>
          <div className="adw-form-body">
            {step === 1 && <AddDogStepA form={form} errors={errors} onChange={patch} />}
            {step === 2 && <AddDogStepB form={form} errors={errors} onChange={patch} />}
            {step === 3 && <AddDogStepC form={form} errors={errors} onChange={patch} />}
          </div>
          <div className="adw-form-footer">
            {step > 1 && (
              <button className="adw-btn-back" onClick={handleBack}>
                <Icon name="arrow" size={14} /> Back
              </button>
            )}
            {step < 3
              ? <button className="adw-btn-next" onClick={handleNext}>Next <Icon name="arrow" size={14} /></button>
              : <button className="adw-btn-save" onClick={handleSave}><Icon name="plus" size={14} /> Add Dog</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

const ExtraDogPanel: React.FC<{
  dog: ExtraDog;
  onRemove: (id: string) => void;
  onAvatarUpdate: (id: string, url: string) => void;
}> = ({ dog, onRemove, onAvatarUpdate }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try { const b64 = await fileToBase64(file); onAvatarUpdate(dog.id, b64); }
    catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  return (
    <div className="extra-dog-panel">
      <div className="extra-dog-panel-divider">
        <span className="extra-dog-panel-divider-line" />
      </div>
      <div className="dog-butternut-layout">
        <div className="dog-photo-hero">
          <div className="dog-photo-img">
            {dog.avatarUrl
              ? <img src={dog.avatarUrl} alt={dog.name} />
              : (
                <div className="dog-photo-placeholder">
                  <Icon name="paw" size={48} />
                  <p>Add {dog.name}'s photo</p>
                </div>
              )
            }
            {uploading && <div className="dog-photo-uploading"><Icon name="spinner" size={24} /></div>}
            <button
              className="dog-photo-btn"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              aria-label={`Upload photo for ${dog.name}`}
            >
              <Icon name="camera" size={20} />
            </button>
          </div>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
        </div>
        <div className="dog-info-panel">
          <div className="dog-info-top">
            <div>
              <h2 className="dog-info-name">
                {dog.name}
                <span className="dog-info-gender">{dog.gender === "male" ? " ♂" : " ♀"}</span>
              </h2>
              <p className="dog-info-breed">{dog.breed}</p>
              {dog.dob && (
                <p className="dog-info-age">
                  <strong>{calcAge(dog.dob)}</strong>
                  <span className="dog-info-human-age">{humanYears(dog.dob)}</span>
                </p>
              )}
            </div>
            <button
              className="extra-dog-remove-panel"
              onClick={() => onRemove(dog.id)}
              title={`Remove ${dog.name}`}
              aria-label={`Remove ${dog.name} from pack`}
            >
              <Icon name="close" size={14} /> Remove
            </button>
          </div>
          <div className="dog-info-stage">
            <span className={`dog-stage-badge stage-${dog.lifeStage}`}>
              <Icon name="dogFace" size={15} /> {dog.lifeStage}
            </span>
            {dog.dob && (
              <span className="dog-birthday-pill">
                Birthday: {new Date(dog.dob).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
          {dog.personality.length > 0 && (
            <div className="dog-personality-tiles">
              {dog.personality.map((p) => (
                <div key={p} className="dog-personality-tile">
                  <span className="dog-tile-icon"><Icon name={PERSONALITY_ICONS[p] ?? "star"} size={18} /></span>
                  <span className="dog-tile-label">{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="dog-share-banner">
        <div className="dog-share-text">
          <h3 className="dog-share-title">Share {dog.name}'s profile</h3>
          <p className="dog-share-sub">Show off your pup to friends and family!</p>
        </div>
        <div className="dog-share-actions">
          <button className="dog-share-btn"><Icon name="link" size={14} /> Copy link</button>
          <button className="dog-share-btn social"><Icon name="share" size={14} /> Share</button>
        </div>
        <div className="dog-share-paws" aria-hidden="true">🐾 🐾 🐾</div>
      </div>
      <DogDetailsSection dogName={dog.name} dogId={dog.id} />
    </div>
  );
};

const AddDogRow: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div className="add-dog-row-section">
    <button className="add-another-dog-btn" onClick={onAdd}>
      <span className="add-dog-btn-icon"><Icon name="dogFace" size={20} /></span>
      <span className="add-dog-btn-text">
        <span className="add-dog-btn-label">Add Another Dog</span>
        <span className="add-dog-btn-sub">Keep track of your whole pack</span>
      </span>
      <Icon name="plus" size={18} />
    </button>
  </div>
);

// ─── My Dog View ───────────────────────────────────────────────────────────────
const DogView: React.FC<{
  dog: DogProfile | null; token: string; onDogUpdate: (d: DogProfile) => void;
}> = ({ dog, token, onDogUpdate }) => {
  const [editOpen,  setEditOpen]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extraDogs, setExtraDogs] = useState<ExtraDog[]>(() => loadExtraDogs());
  const [addOpen,   setAddOpen]   = useState(false);

  const handleAvatarUpload = async (file: File) => {
    if (!dog) return;
    setUploading(true);
    try { const res = await uploadDogAvatar(token, file); onDogUpdate({ ...dog, avatarUrl: res.avatarUrl }); }
    catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  const handleAddDog = (newDog: ExtraDog) => {
    const updated = [...extraDogs, newDog]; setExtraDogs(updated); saveExtraDogs(updated);
  };
  const handleRemoveDog = (id: string) => {
    const updated = extraDogs.filter((d) => d.id !== id); setExtraDogs(updated); saveExtraDogs(updated);
  };
  const handleExtraAvatar = (id: string, url: string) => {
    const updated = extraDogs.map((d) => d.id === id ? { ...d, avatarUrl: url } : d);
    setExtraDogs(updated); saveExtraDogs(updated);
  };

  if (!dog) {
    return (
      <div className="db-view">
        <div className="db-placeholder">
          <Icon name="paw" size={40} />
          <p>No dog profile found. Add your dog in Settings!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="db-view dog-view">
      <div className="dog-butternut-layout">
        <DogPhotoHero url={dog.avatarUrl} name={dog.name} onUpload={handleAvatarUpload} uploading={uploading} />
        <div className="dog-info-panel">
          <div className="dog-info-top">
            <div>
              <h1 className="dog-info-name">
                {dog.name}
                <span className="dog-info-gender">{dog.gender === "male" ? " ♂" : " ♀"}</span>
              </h1>
              <p className="dog-info-breed">{dog.breed}</p>
              {dog.dob && (
                <p className="dog-info-age">
                  <strong>{calcAge(dog.dob)}</strong>
                  <span className="dog-info-human-age">{humanYears(dog.dob)}</span>
                </p>
              )}
            </div>
            <button className="dog-info-edit-btn" onClick={() => setEditOpen(true)}>
              <Icon name="edit" size={14} /> Edit
            </button>
          </div>
          <div className="dog-info-stage">
            <span className={`dog-stage-badge stage-${dog.lifeStage}`}>
              <Icon name="dogFace" size={15} /> {dog.lifeStage}
            </span>
            {dog.dob && (
              <span className="dog-birthday-pill">
                Birthday: {new Date(dog.dob).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
          {dog.personality.length > 0 && (
            <div className="dog-personality-tiles">
              {dog.personality.map((p) => (
                <div key={p} className="dog-personality-tile">
                  <span className="dog-tile-icon"><Icon name={PERSONALITY_ICONS[p] ?? "star"} size={18} /></span>
                  <span className="dog-tile-label">{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="dog-share-banner">
        <div className="dog-share-text">
          <h3 className="dog-share-title">Share {dog.name}'s profile</h3>
          <p className="dog-share-sub">Show off your pup to friends and family!</p>
        </div>
        <div className="dog-share-actions">
          <button className="dog-share-btn"><Icon name="link" size={14} /> Copy link</button>
          <button className="dog-share-btn social"><Icon name="share" size={14} /> Share</button>
        </div>
        <div className="dog-share-paws" aria-hidden="true">🐾 🐾 🐾</div>
      </div>

      <DogDetailsSection dogName={dog.name} />

      {extraDogs.map((ed) => (
        <ExtraDogPanel key={ed.id} dog={ed} onRemove={handleRemoveDog} onAvatarUpdate={handleExtraAvatar} />
      ))}

      <AddDogRow onAdd={() => setAddOpen(true)} />
      {addOpen && <AddDogModal onSave={handleAddDog} onClose={() => setAddOpen(false)} />}

      {Array.from(new Set([dog.lifeStage, ...extraDogs.map((d) => d.lifeStage)])).map((stage) => {
        const tips = CARE_TIPS[stage] ?? CARE_TIPS.adult;
        const stageLabel = stage === "puppy" ? "Puppies" : stage === "senior" ? "Senior Dogs" : "Adult Dogs";
        const dogsAtStage = [
          ...(dog.lifeStage === stage ? [dog.name] : []),
          ...extraDogs.filter((d) => d.lifeStage === stage).map((d) => d.name),
        ];
        return (
          <div key={stage} className="db-card dog-tips-card">
            <div className="dog-tips-header">
              <div>
                <h3 className="db-card-title">Care Guide for {stageLabel}</h3>
                {dogsAtStage.length > 0 && (
                  <p className="dog-tips-for">{dogsAtStage.join(" & ")}</p>
                )}
              </div>
              <span className={`dog-tips-stage-badge stage-${stage}`}>{stage}</span>
            </div>
            <div className="dog-tips-grid">
              {tips.map((tip) => (
                <div key={tip.title} className="dog-tip-item">
                  <div className="dog-tip-icon"><Icon name={tip.icon} size={18} /></div>
                  <div className="dog-tip-body">
                    <p className="dog-tip-title">{tip.title}</p>
                    <p className="dog-tip-text">{tip.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {editOpen && <EditDogModal dog={dog} token={token} onSave={onDogUpdate} onClose={() => setEditOpen(false)} />}
    </div>
  );
};

// ─── Settings View ─────────────────────────────────────────────────────────────
const SettingsView: React.FC<{
  user: UserProfile; dog: DogProfile | null; token: string;
  onUpdate: (u: Partial<UserProfile>) => void; onDogUpdate: (d: DogProfile) => void;
}> = ({ user, dog, token, onUpdate, onDogUpdate }) => {
  const [modal, setModal] = useState<"user" | "dog" | "preferences" | null>(null);
  const [uploadingUser, setUploadingUser] = useState(false);
  const [uploadingDog,  setUploadingDog]  = useState(false);

  const handleUserAvatar = async (file: File) => {
    setUploadingUser(true);
    try { const res = await uploadUserAvatar(token, file); onUpdate({ avatarUrl: res.avatarUrl }); }
    finally { setUploadingUser(false); }
  };
  const handleDogAvatar = async (file: File) => {
    setUploadingDog(true);
    try { const res = await uploadDogAvatar(token, file); if (dog) onDogUpdate({ ...dog, avatarUrl: res.avatarUrl }); }
    finally { setUploadingDog(false); }
  };

  const lastUpdated = user.updatedAt
    ? new Date(user.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "—";

  return (
    <div className="db-view settings-view">
      <div className="settings-hero">
        <div className="settings-hero-text">
          <h1 className="settings-hero-title">Account Settings</h1>
          <p className="settings-hero-sub">Member since {memberSince} · {user.email}</p>
        </div>
        <div className="settings-hero-avatar">
          <AvatarUpload url={user.avatarUrl} name={user.name} size="lg"
            onUpload={handleUserAvatar} uploading={uploadingUser} />
        </div>
      </div>

      <div className="settings-sections">
        <div className="settings-section">
          <div className="settings-section-label">Profile</div>
          <div className="settings-card profile-settings-card">
            <div className="settings-field-row">
              <div className="settings-field-meta">
                <span className="settings-field-title">Bio</span>
                <span className="settings-field-hint">Shown to other BarkBuddy members</span>
              </div>
              <div className="settings-field-value bio-value">
                <BioEditor bio={user.bio} token={token} onSave={(bio) => onUpdate({ bio })} />
              </div>
            </div>
            <div className="settings-field-row no-border">
              <div className="settings-field-meta">
                <span className="settings-field-title">Profile Completeness</span>
                <span className="settings-field-hint">Fill in all details to unlock community features</span>
              </div>
              <div className="settings-field-value">
                <div className="profile-complete-inline">
                  <div className="profile-complete-bar">
                    <div className="profile-complete-fill" style={{ width: `${user.profileComplete}%` }} />
                  </div>
                  <span className="profile-complete-pct">{user.profileComplete}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-label">Account Info</div>
          <div className="settings-card">
            {[
              { label: "Full Name", value: user.name,    hint: "Your display name"                },
              { label: "Email",     value: user.email,   hint: "Used for login & notifications"   },
              { label: "Password",  value: "••••••••••", hint: "Last updated " + lastUpdated      },
            ].map((row, i, arr) => (
              <div key={row.label} className={`settings-field-row ${i === arr.length - 1 ? "no-border" : ""}`}>
                <div className="settings-field-meta">
                  <span className="settings-field-title">{row.label}</span>
                  <span className="settings-field-hint">{row.hint}</span>
                </div>
                <div className="settings-field-value">
                  <span className="settings-field-current">{row.value}</span>
                </div>
              </div>
            ))}
            <div className="settings-card-footer">
              <button className="settings-action-btn primary" onClick={() => setModal("user")}>
                <Icon name="edit" size={14} /> Edit Account Info
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-label">Notifications &amp; Preferences</div>
          <div className="settings-card">
            <div className="settings-field-row no-border">
              <div className="settings-field-meta">
                <span className="settings-field-title">Email Notifications</span>
                <span className="settings-field-hint">
                  {user.emailNotifications ? "Receiving emails from BarkBuddy" : "Email notifications are off"}
                </span>
              </div>
              <div className="settings-field-value">
                <span className={`settings-status-badge ${user.emailNotifications ? "active" : "inactive"}`}>
                  {user.emailNotifications ? "On" : "Off"}
                </span>
              </div>
            </div>
            <div className="settings-card-footer">
              <button className="settings-action-btn" onClick={() => setModal("preferences")}>
                Manage Preferences
              </button>
            </div>
          </div>
        </div>
      </div>

      {modal === "user"        && <EditUserModal    user={user} token={token} onSave={onUpdate}    onClose={() => setModal(null)} />}
      {modal === "dog" && dog  && <EditDogModal     dog={dog}   token={token} onSave={onDogUpdate} onClose={() => setModal(null)} />}
      {modal === "preferences" && <PreferencesModal user={user} token={token} onSave={onUpdate}    onClose={() => setModal(null)} />}
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const { token, logout }           = useAuth();
  const [activeNav, setActiveNav]   = useState("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user,    setUser]    = useState<UserProfile | null>(null);
  const [dog,     setDog]     = useState<DogProfile  | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // ── Notifications state ───────────────────────────────────────────────────
  const [notifications,   setNotifications]   = useState<AppNotification[]>([]);
  const [notifLoading,    setNotifLoading]    = useState(false);
  const [notifOpen,       setNotifOpen]       = useState(false);
  const POLL_INTERVAL_MS = 60_000; // poll every 60 s

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setNotifLoading(true);
    try {
      const data = await safeGetNotifications(token);
      setNotifications(data);
    } finally {
      setNotifLoading(false);
    }
  }, [token]);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleToggleNotif = () => {
    setNotifOpen(prev => !prev);
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (!unreadIds.length) return;
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (token) await safeMarkRead(token, unreadIds);
  };

  const handleClickNotif = async (notif: AppNotification) => {
    // Mark as read locally
    setNotifications(prev =>
      prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
    );
    if (token && !notif.isRead) {
      await safeMarkRead(token, [notif.id]);
    }
    // Navigate to the forum post if applicable
    if (notif.postId) {
      setActiveNav("forum");
      setNotifOpen(false);
    }
  };

  // ── Profile load ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    getProfile(token)
      .then(({ user, dog }) => { setUser(user); setDog(dog); })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleUserUpdate = (updated: Partial<UserProfile>) => setUser((p) => p ? { ...p, ...updated } : p);
  const handleDogUpdate  = (updated: DogProfile) => setDog(updated);
  const handleLogout     = () => { logout(); window.location.href = "/"; };

  const labels: Record<string, string> = {
    home: "Dashboard", settings: "Settings", dog: "My Dog",
    calendar: "Buddy Calendar", forum: "Community Forum",
  };

  if (loading) return <div className="dashboard-loading"><div className="auth-loading-spinner" /></div>;
  if (error || !user) return <div className="dashboard-loading"><p style={{ color: "#927ACF" }}>{error || "Something went wrong"}</p></div>;

  return (
    <div className="dashboard">
      <TopBar
        user={user}
        label={labels[activeNav] ?? "Dashboard"}
        unreadCount={unreadCount}
        notifOpen={notifOpen}
        onMenuOpen={() => setDrawerOpen(true)}
        onToggleNotif={handleToggleNotif}
      />

      {/* Notifications panel — rendered above everything else */}
      {notifOpen && (
        <NotificationsPanel
          notifications={notifications}
          loading={notifLoading}
          onClose={() => setNotifOpen(false)}
          onMarkAllRead={handleMarkAllRead}
          onClickNotif={handleClickNotif}
        />
      )}

      <div className="db-body">
        <Sidebar active={activeNav} onNav={setActiveNav} onLogout={handleLogout} />
        <main className="db-content">
          {activeNav === "home"     && <HomeView user={user} dog={dog} onNav={setActiveNav} />}
          {activeNav === "settings" && token && (
            <SettingsView user={user} dog={dog} token={token} onUpdate={handleUserUpdate} onDogUpdate={handleDogUpdate} />
          )}
          {activeNav === "dog" && token && (
            <DogView dog={dog} token={token} onDogUpdate={handleDogUpdate} />
          )}
          {activeNav === "calendar" && <div className="db-view"><BuddyCalendar dogName={dog?.name} /></div>}
          {activeNav === "forum"    && <div className="db-view"><CommunityForum /></div>}
        </main>
      </div>
      <MobileDrawer open={drawerOpen} active={activeNav} onNav={setActiveNav}
        onClose={() => setDrawerOpen(false)} onLogout={handleLogout} user={user} />
    </div>
  );
};

export default Dashboard;