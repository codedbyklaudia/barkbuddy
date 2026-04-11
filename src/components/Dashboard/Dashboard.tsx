import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from 'react-router-dom';
import "./Dashboard.scss";
import { useAuth } from "../../context/AuthContext";
import { useSaved } from "../../context/SavedContext";
import BuddyCalendar from "../Buddy_Calendar";
import CommunityForum from "../CommunityForum";
import DashboardView from './DashboardView';
import Sidebar, { MobileTopNav } from './Sidebar';
import SettingsView from './SettingsView';
import SavedView from './SavedView';
import logoSrc from "../../../images/logo.png";
import { Logs } from "lucide-react";


import {
  getProfile, updateUser, uploadUserAvatar,
  updateDog, updatePreferences,
  getNotifications, markNotificationsRead,
} from "../../api/users";

import {
  getAllDogs, createExtraDog, deleteExtraDog, updateExtraDog,
  uploadDogAvatarById, getDogDetails, saveDogDetails,
} from "../../api/Dogs";

import type { DogDetails } from "../../api/Dogs";

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
  isMain?:     boolean;
}

export type NotifType = "new_comment" | "comment_liked";
export interface AppNotification {
  id:               string;
  type:             NotifType;
  actorName:        string;
  actorAvatar?:     string;
  postId?:          string;
  postTitle?:       string;
  commentSnippet?:  string;
  commentId?:       string;
  isRead:           boolean;
  createdAt:        string;
}

// Helpers
async function safeGetNotifications(token: string): Promise<AppNotification[]> {
  try { const res = await getNotifications(token); return res.notifications ?? []; }
  catch { return []; }
}
async function safeMarkRead(token: string, ids: string[]): Promise<void> {
  try { await markNotificationsRead(token, ids); } catch { /* silent */ }
}

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

function calcProfileComplete(user: UserProfile, dog: DogProfile | null): number {
  let score = 0;
  if (user.name?.trim())         score += 20;
  if (user.email?.trim())        score += 15;
  if (user.bio?.trim())          score += 20;
  if (user.avatarUrl)            score += 15;
  if (dog)                       score += 15;
  if (dog?.avatarUrl)            score += 10;
  if (dog?.personality?.length)  score += 5;
  return Math.min(score, 100);
}

// Icon
const Icon: React.FC<{ name: string; size?: number }> = ({ name, size = 18 }) => {
  const icons: Record<string, React.ReactNode> = {
    home:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    dog:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2 .352-3.5 2.055-3.5 4v3l1 2v2l2 1v-3l4-2 2 2v3l2-1v-2l1-2V7c0-1.933-1.5-3.648-3.5-4C9.577 2.679 8 3.782 8 5.172"/></svg>,
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    forum:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    bookmark: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
    logout:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    bell:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    edit:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    paw:      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><ellipse cx="6" cy="7" rx="2" ry="2.5"/><ellipse cx="18" cy="7" rx="2" ry="2.5"/><ellipse cx="10" cy="4" rx="2" ry="2.5"/><ellipse cx="14" cy="4" rx="2" ry="2.5"/><path d="M12 10c-3.5 0-6 2.5-6 5.5 0 1.5.5 2.5 1.5 3.5H16.5c1-.5 1.5-2 1.5-3.5C18 12.5 15.5 10 12 10z"/></svg>,
    fire:     <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 6 6 8 6 12c0 3.3 2.7 6 6 6s6-2.7 6-6c0-1.5-.5-3-1.5-4.5C15.5 9 15 10 14 10.5 14.5 8.5 13.5 5 12 2z"/></svg>,
    check:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    arrow:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
    arrowLeft:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
    camera:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    close:    <img src="../images/icons/close.svg" width={size} height={size} />,
    spinner:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
    heart:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    heartFilled: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    activity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    droplet:  <img src="../images/icons/water.png" width={size} height={size} />,
    scissors: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
    vaccine:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>,
    trophy:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M17 4H7l-1 7h10l-1-7z"/><path d="M5 4H3v3a2 2 0 0 0 2 2h0"/><path d="M19 4h2v3a2 2 0 0 1-2 2h0"/></svg>,
    share:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
    food:     <img src="../images/icons/pet_bowl.png" width={size} height={size} />,
    walk:     <img src="../images/icons/walk.png" width={size} height={size} />,
    info:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    star:     <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    map:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    link:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    penline:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    x:        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    confetti: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5.5 3 3 5.5l10 10 2.5-2.5L5.5 3z"/><path d="m18 3 3 3-3.5 3.5-3-3L18 3z"/><path d="m3 18 3 3 3.5-3.5-3-3L3 18z"/><circle cx="19.5" cy="19.5" r="1.5"/><circle cx="4.5" cy="12.5" r="1.5"/><circle cx="12.5" cy="4.5" r="1.5"/></svg>,
    user:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    users:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    shield:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    ball:     <img src="../images/icons/ball.png" width={size} height={size} />,
    bowl:     <img src="../images/icons/pet-bowl.png" width={size} height={size} />,
    dogFace:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10L2 2L8.5 8"/><path d="M22 10L22 2L15.5 8"/><rect x="2" y="8" width="20" height="14" rx="2"/><rect x="6.5" y="11.5" width="2.5" height="2.5" fill="currentColor" stroke="none" rx="0.3"/><rect x="15" y="11.5" width="2.5" height="2.5" fill="currentColor" stroke="none" rx="0.3"/><line x1="2" y1="17" x2="22" y2="17"/><path d="M10.5 15.5L12 13L13.5 15.5Z" fill="currentColor" stroke="none"/><path d="M10.5 17 Q10.5 21 12 21 Q13.5 21 13.5 17"/></svg>,
    plus:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    comment:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    search:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    trash:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    userPlus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
    userCheck:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>,
    eye:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    eyeOff:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
    award:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  };
  return <>{icons[name] ?? null}</>;
};

const NAV_ICON_MAP: Record<string, React.FC<{ size?: number }>> = {
  home:     IconHome,
  dog:      IconDog,
  calendar: IconCalendar,
  settings: IconSettings,
  saved:    IconBookmark,
};

// Icons
function IconHome({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>;
}
function IconDog({ size = 20 }: { size?: number }) {
  return <img src="./../images/icons/dog_icon.svg" width={size} height={size} />;
}
function IconCalendar({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IconSettings({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function IconBookmark({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
}
function IconLogout({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function IconPlatform({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}

// Nav Items
const NAV_ITEMS = [
  { key: "home",     label: "Dashboard",      icon: IconHome     },
  { key: "dog",      label: "My Dog",         icon: IconDog      },
  { key: "calendar", label: "Buddy Calendar", icon: IconCalendar },
  { key: "settings", label: "Settings",       icon: IconSettings },
  { key: "saved",    label: "Saved",          icon: IconBookmark },
];

// Notifications Panel
const NotificationsPanel: React.FC<{
  notifications: AppNotification[]; loading: boolean;
  onClose: () => void; onMarkAllRead: () => void;
  onClickNotif: (n: AppNotification) => void;
}> = ({ notifications, loading, onClose, onMarkAllRead, onClickNotif }) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;
  return (
    <>
      <div className="notif-panel-overlay" onClick={onClose} />
      <div className="notif-panel" role="dialog" aria-label="Notifications">
        <div className="notif-panel-header">
          <h3>Notifications {unreadCount > 0 && <span className="notif-header-count">({unreadCount})</span>}</h3>
          {unreadCount > 0 && <button className="notif-mark-all-btn" onClick={onMarkAllRead}>Mark all read</button>}
        </div>
        <div className="notif-panel-list">
          {loading ? (
            <div className="notif-loading">{[1,2,3].map(i => <div key={i} className="notif-skeleton" />)}</div>
          ) : notifications.length === 0 ? (
            <div className="notif-empty">
              <span className="notif-empty-icon"><Icon name="bell" size={40} /></span>
              <span>All caught up!</span>
            </div>
          ) : notifications.map((n) => (
            <div key={n.id} className={`notif-item ${!n.isRead ? "is-unread" : ""}`}
              onClick={() => onClickNotif(n)} role="button" tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onClickNotif(n)}>
              <div className={`notif-icon-wrap ${n.type === "comment_liked" ? "type-like" : "type-comment"}`}>
                {n.type === "comment_liked" ? <Icon name="heartFilled" size={16} /> : <Icon name="comment" size={16} />}
              </div>
              <div className="notif-body">
                <p className="notif-text">
                  {n.type === "new_comment"
                    ? <><strong>{n.actorName}</strong> commented on your post</>
                    : <><strong>{n.actorName}</strong> liked your comment</>}
                </p>
                {(n.postTitle || n.commentSnippet) && (
                  <span className="notif-sub">{n.postTitle ?? n.commentSnippet}</span>
                )}
                <span className="notif-time">{timeAgo(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
        {notifications.length > 0 && (
          <div className="notif-panel-footer"><button onClick={onClose}>Close</button></div>
        )}
      </div>
    </>
  );
};

// Avatar Upload
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
      <button className="avatar-edit-btn" onClick={() => inputRef.current?.click()} disabled={uploading} title="Upload photo">
        <Icon name="camera" size={14} />
      </button>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
    </div>
  );
};

// Dog Photo Hero
const DogPhotoHero: React.FC<{
  url?: string; name: string; onUpload: (file: File) => Promise<void>; uploading?: boolean;
}> = ({ url, name, onUpload, uploading }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="dog-photo-hero">
      <div className="dog-photo-img">
        {url ? <img src={url} alt={name} />
          : (<div className="dog-photo-placeholder"><Icon name="paw" size={48} /><p>Add {name}'s photo</p></div>)}
        {uploading && <div className="dog-photo-uploading"><Icon name="spinner" size={24} /></div>}
        <button className="dog-photo-btn" onClick={() => inputRef.current?.click()} disabled={uploading} aria-label="Upload dog photo">
          <Icon name="camera" size={20} />
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={(e) => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
    </div>
  );
};

// Bio Editor
const BioEditor: React.FC<{
  bio?: string; token: string;
  onSave: (bio: string, profileComplete: number) => void;
  dog: DogProfile | null; user: UserProfile;
}> = ({ bio, token, onSave, dog, user }) => {
  const [editing, setEditing]   = useState(false);
  const [value,   setValue]     = useState(bio ?? "");
  const [saving,  setSaving]    = useState(false);
  const [error,   setError]     = useState("");
  const textareaRef             = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (editing) textareaRef.current?.focus(); }, [editing]);

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const trimmed = value.trim();
      await updateUser(token, { bio: trimmed });
      const updatedUser = { ...user, bio: trimmed };
      const newComplete = calcProfileComplete(updatedUser, dog);
      onSave(trimmed, newComplete);
      setEditing(false);
    } catch {
      setError("Failed to save. Try again.");
    } finally { setSaving(false); }
  };

  const handleCancel = () => { setValue(bio ?? ""); setEditing(false); setError(""); };

  if (editing) {
    return (
      <div className="bio-editor">
        <textarea ref={textareaRef} className="bio-textarea" value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tell the community about you and your dog…"
          maxLength={200} rows={3} aria-label="Bio" />
        <div className="bio-editor-footer">
          <span className="bio-char-count">{value.length}/200</span>
          {error && <span className="bio-save-error">{error}</span>}
          <div className="bio-editor-actions">
            <button className="bio-btn-cancel" onClick={handleCancel} disabled={saving}>Cancel</button>
            <button className="bio-btn-save" onClick={handleSave} disabled={saving}>
              {saving ? <Icon name="spinner" size={12} /> : <Icon name="check" size={12} />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bio-display" onClick={() => setEditing(true)} title="Click to edit bio" role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setEditing(true)}>
      {bio ? (
        <p className="bio-text">{bio}</p>
      ) : (
        <p className="bio-placeholder"><Icon name="penline" size={12} />Add a bio — tell everyone about you and your dog…</p>
      )}
    </div>
  );
};

// Edit User Modal
const EditUserModal: React.FC<{
  user: UserProfile; token: string;
  onSave: (updated: Partial<UserProfile>) => void; onClose: () => void;
}> = ({ user, token, onSave, onClose }) => {
  const [form, setForm] = useState({ name: user.name, email: user.email, bio: user.bio ?? "", currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (form.newPassword) {
      if (!form.currentPassword)                     e.currentPassword = "Required to change password";
      if (form.newPassword.length < 8)               e.newPassword = "Min 8 characters";
      if (!/[A-Z]/.test(form.newPassword))           e.newPassword = "Must contain uppercase";
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
          <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>
        <div className="modal-body">
          {errors.general && <div className="modal-error">{errors.general}</div>}
          {success        && <div className="modal-success">{success}</div>}
          <label className="modal-label">Name</label>
          <input className={`modal-input ${errors.name ? "error" : ""}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <span className="modal-field-error">{errors.name}</span>}
          <label className="modal-label">Email</label>
          <input className={`modal-input ${errors.email ? "error" : ""}`} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <span className="modal-field-error">{errors.email}</span>}
          <label className="modal-label">Bio <span className="modal-optional">(optional)</span></label>
          <textarea className="modal-input modal-textarea" value={form.bio} maxLength={200} rows={3}
            placeholder="Tell the community about you and your dog…"
            onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <span className="modal-char-hint">{form.bio.length}/200</span>
          <div className="modal-divider">Change Password <span>(optional)</span></div>
          <label className="modal-label">Current Password</label>
          <input className={`modal-input ${errors.currentPassword ? "error" : ""}`} type="password" placeholder="Enter current password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
          {errors.currentPassword && <span className="modal-field-error">{errors.currentPassword}</span>}
          <label className="modal-label">New Password</label>
          <input className={`modal-input ${errors.newPassword ? "error" : ""}`} type="password" placeholder="Min 8 chars, uppercase & number" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
          {errors.newPassword && <span className="modal-field-error">{errors.newPassword}</span>}
          <label className="modal-label">Confirm New Password</label>
          <input className={`modal-input ${errors.confirmPassword ? "error" : ""}`} type="password" placeholder="Repeat new password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
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

// Edit Dog Modal
const EditDogModal: React.FC<{
  dog: DogProfile; token: string;
  onSave: (updated: DogProfile) => void; onClose: () => void;
}> = ({ dog, token, onSave, onClose }) => {
  const [form, setForm] = useState({ name: dog.name, breed: dog.breed, gender: dog.gender, dob: dog.dob || "", lifeStage: dog.lifeStage, personality: dog.personality });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");

  const handleSave = async () => {
    if (!form.name.trim()) { setErrors({ name: "Dog name is required" }); return; }
    setLoading(true);
    try {
      if (dog.isMain) {
        const res = await updateDog(token, form);
        setSuccess("Saved!"); onSave({ ...res.dog, isMain: true }); setTimeout(onClose, 800);
      } else {
        const res = await updateExtraDog(token, dog.id, form);
        setSuccess("Saved!"); onSave({ ...res.dog, isMain: false }); setTimeout(onClose, 800);
      }
    } catch (err: any) {
      setErrors(err.errors ?? { general: err.message || "Something went wrong" });
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit {dog.name}'s Profile</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
        </div>
        <div className="modal-body">
          {errors.general && <div className="modal-error">{errors.general}</div>}
          {success && <div className="modal-success">{success}</div>}
          <label className="modal-label">Name</label>
          <input className={`modal-input ${errors.name ? "error" : ""}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <span className="modal-field-error">{errors.name}</span>}
          <label className="modal-label">Breed</label>
          <input className="modal-input" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
          <label className="modal-label">Gender</label>
          <div className="modal-radio-row">
            {["male","female"].map((g) => (
              <button key={g} className={`modal-radio-btn ${form.gender === g ? "selected" : ""}`} onClick={() => setForm({ ...form, gender: g })}>
                {g === "male" ? "♂ Boy" : "♀ Girl"}
              </button>
            ))}
          </div>
          <label className="modal-label">Date of Birth <span className="modal-optional">(optional)</span></label>
          <input className="modal-input" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
          <label className="modal-label">Life Stage</label>
          <div className="modal-radio-row">
            {["puppy","adult","senior"].map((s) => (
              <button key={s} className={`modal-radio-btn ${form.lifeStage === s ? "selected" : ""}`} onClick={() => setForm({ ...form, lifeStage: s })}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <label className="modal-label">Personality</label>
          {PERSONALITY_CATEGORIES.map(cat => (
            <div key={cat.id} className="modal-personality-cat">
              <p className="modal-personality-question">{cat.question}</p>
              <div className="modal-personality-grid">
                {cat.options.map(opt => {
                  const isSel = form.personality.includes(opt.key);
                  return (
                    <button key={opt.key}
                      className={`modal-personality-btn ${isSel ? "selected" : ""}`}
                      onClick={() => setForm(prev => ({ ...prev, personality: setSelected(prev.personality, cat.id, opt.key) }))}>
                      <img src={opt.img} alt={opt.label}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
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

// Preferences Modal
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
          <button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button>
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

// Logo
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
  return <img src={logoSrc} alt="BarkBuddy" className={`bb-logo-img bb-logo-${size}`} onError={() => setImgFailed(true)} />;
};

// Mobile Drawer
const MobileDrawer: React.FC<{
  open: boolean; active: string; onNav: (k: string) => void;
  onClose: () => void; onLogout: () => void; user: UserProfile | null;
  savedCount: number;
}> = ({ open, active, onNav, onClose, onLogout, user, savedCount }) => {
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
            <img src="../../images/logo.svg" alt="BarkBuddy" className="db-logo-img" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <button className="mobile-drawer-close" onClick={onClose} aria-label="Close menu"><Icon name="close" size={18} /></button>
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
              <span className="mobile-drawer-icon">
                {(() => { const I = NAV_ICON_MAP[item.key]; return I ? <I size={18} /> : null; })()}
              </span>
              <span>{item.label}</span>
              {item.key === "saved" && savedCount > 0 && (
                <span className="mobile-drawer-badge">{savedCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="mobile-drawer-divider" />
        <button className="mobile-drawer-item mobile-drawer-platform" onClick={() => { window.location.href = "/"; onClose(); }}>
          <span className="mobile-drawer-icon"><IconHome size={19} /></span>
          <span>Go to Platform</span>
        </button>
        <button className="mobile-drawer-item mobile-drawer-logout" onClick={onLogout}>
          <span className="mobile-drawer-icon"><IconLogout size={19} /></span>
          <span>Log out</span>
        </button>
      </aside>
    </>
  );
};

// Top Bar
const TopBar: React.FC<{
  user: UserProfile | null; label: string; unreadCount: number;
  notifOpen: boolean; onMenuOpen: () => void; onToggleNotif: () => void;
}> = ({ user, label, unreadCount, notifOpen, onMenuOpen, onToggleNotif }) => {
  return (
    <header className="db-topbar">
      <div className="db-topbar-left">
        <BarkBuddyLogo size="lg" />
      </div>
      <h1 className="db-topbar-title">{label}</h1>
      <div className="db-topbar-right">
        <div className="db-notif-bell-wrap">
          <button className={`db-topbar-bell ${notifOpen ? "is-active" : ""}`}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
            onClick={onToggleNotif}>
            <Icon name="bell" size={20} />
          </button>
          {unreadCount > 0 && <span className="db-notif-badge" aria-hidden="true">{unreadCount > 99 ? "99+" : unreadCount}</span>}
        </div>
        <div className="db-topbar-avatar db-desktop-only">
          {user?.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : <span>{user?.name?.charAt(0)?.toUpperCase() ?? "?"}</span>}
        </div>
        <span className="db-topbar-name db-desktop-only">{user?.name ?? ""}</span>
        <button className="db-topbar-hamburger db-mobile-only" onClick={onMenuOpen} aria-label="Open menu">
          <Logs size={22} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
};

// Dog Helpers
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

// Care Tips (12 per stage)
const CARE_TIPS: Record<string, { icon: string; title: string; tip: string }[]> = {
  puppy: [
    { icon: "vaccine",  title: "Vaccination Windows",       tip: "The primary course runs at 8, 12, and 16 weeks. Maternal antibodies actively interfere with vaccine response before 8 weeks — vaccinating earlier is largely ineffective. Full immunity isn't established until 2 weeks after the final dose, so avoid high-risk environments until then." },
    { icon: "food",     title: "Feeding Frequency",         tip: "Puppies have small stomachs and fast metabolisms — 3 to 4 meals daily prevents hypoglycaemia, especially in toy breeds. Portion from a single daily allowance rather than adding extra meals. Large breeds should eat from a raised bowl and avoid vigorous exercise within 1 hour of eating to reduce bloat risk." },
    { icon: "activity", title: "Growth Plate Safety",       tip: "The '5 minutes per month of age' rule exists because growth plates don't close until 12–18 months depending on breed size. Repetitive high-impact exercise on immature cartilage increases the risk of osteochondrosis and angular limb deformities — particularly in Labradors, Goldens, and giant breeds." },
    { icon: "heart",    title: "Socialisation Science",     tip: "The primary socialisation window closes around 12–14 weeks. During this period, novel stimuli are processed without the same fear response as later in life. Aim for 100 different positive exposures — surfaces, sounds, handling, people types, animals. Quality matters more than quantity: one frightening experience can have lasting effects." },
    { icon: "scissors", title: "Handling Desensitisation",  tip: "Touch every part of the body daily: inside the mouth, between paw pads, ears, tail base, and under the belly. Pair each with high-value food. Puppies that accept full-body handling are significantly less stressed at vet visits and grooming — reducing the cortisol response that makes future handling harder." },
    { icon: "droplet",  title: "Hydration & Dehydration",   tip: "Puppies need approximately 60ml of water per kilogram of body weight daily — more during hot weather or after exercise. Early signs of dehydration include skin tenting (skin doesn't snap back when lifted) and tacky gums. Dry kibble diets increase water requirements; wet food contributes roughly 70–80% water by content." },
    { icon: "trophy",   title: "Operant Conditioning",      tip: "Puppies learn fastest through positive reinforcement in sessions of 3–5 minutes maximum — beyond this, attention drops and errors increase. Mark the exact moment of correct behaviour with a clicker or marker word before delivering the reward. Luring (food in hand) should transition to hand signals within 3–5 repetitions to avoid food dependency." },
    { icon: "heart",    title: "Neonatal Dental Health",    tip: "Deciduous teeth erupt from 3–6 weeks and are replaced by adult teeth from 12–24 weeks. Begin daily brushing with finger gauze as soon as teeth appear — this period shapes lifelong tolerance. Retained baby teeth (most common in small breeds) trap plaque and must be extracted; check at every puppy vet visit." },
    { icon: "shield",   title: "Endoparasite Protocol",     tip: "Puppies are born with roundworm larvae that have migrated transplacentally. The standard protocol is worming every 2 weeks from birth to 12 weeks, then monthly to 6 months. Lungworm (Angiostrongylus) is distinct from intestinal worms and requires a specific prescription product — not all broad-spectrum wormers cover it." },
    { icon: "paw",      title: "Sleep Architecture",        tip: "Puppies require 16–20 hours of sleep daily for neurological development. Disrupting sleep to play or socialise more creates cortisol-driven hyperactivity often misread as high energy. Provide a crate or den where the puppy cannot be disturbed — this also accelerates crate training by associating the space with rest." },
    { icon: "info",     title: "Bite Inhibition Timing",    tip: "Bite inhibition — learning to control jaw pressure — must be taught before 18 weeks. Dogs that never learned this as puppies cannot moderate a bite if they react in fear or pain as adults. Allow mouthing during play; yelp and withdraw attention for hard bites. Suppressing all mouthing entirely can remove the opportunity to learn pressure control." },
    { icon: "walk",     title: "Lead Pressure Response",    tip: "Introduce the collar at home for short periods before attaching a lead. When a puppy pulls, stop completely — forward movement must only happen on a loose lead. This is more effective than correction-based methods and prevents the opposition reflex: the instinctive pull-back response triggered when constant leash tension is applied." },
  ],
  adult: [
    { icon: "food",     title: "Caloric Precision",         tip: "Feeding guides on packaging are calculated for entire unspayed/unneutered dogs at average activity — neutered adults typically need 20–30% fewer calories. Body condition scoring (1–9 scale) is more accurate than weight alone: you should feel ribs easily without pressing but not see them. Reassess portions every 3 months as activity and season change." },
    { icon: "activity", title: "Exercise Physiology",       tip: "Aerobic capacity varies enormously by breed — brachycephalic dogs (Bulldogs, Pugs) have structurally compromised airways that limit oxygen exchange. High-intensity exercise in heat above 20°C risks heatstroke in these breeds within minutes. For scent hounds and working breeds, mental fatigue from nose work can be more tiring than physical exercise at equivalent time." },
    { icon: "scissors", title: "Coat & Skin Health",        tip: "Over-bathing strips the sebaceous gland secretions that maintain the skin barrier, leading to dry, flaky skin and increased susceptibility to Malassezia (yeast) overgrowth. Monthly bathing is appropriate for most breeds; weekly for dogs with skin conditions only if directed by a vet. Always dry ears thoroughly after bathing — residual moisture is the primary trigger for otitis externa." },
    { icon: "heart",    title: "Periodontal Disease",       tip: "By age 3, over 80% of dogs show signs of periodontal disease — the leading source of chronic systemic inflammation linked to cardiac and kidney pathology. Daily brushing is the gold standard; enzymatic toothpaste accelerates plaque breakdown. Dental chews have evidence of efficacy only if they carry the VOHC (Veterinary Oral Health Council) seal." },
    { icon: "shield",   title: "Titre Testing",             tip: "Antibody titre tests measure circulating immunity to core diseases (parvovirus, distemper, hepatitis) and can replace annual boosters if levels are protective — reducing unnecessary antigen exposure. Leptospirosis and kennel cough vaccines do not produce durable titres and typically require annual boosting regardless. Discuss with your vet what your dog's actual risk profile warrants." },
    { icon: "droplet",  title: "Water Intake as Diagnostic",tip: "A sudden increase in water intake (polydipsia) — defined as more than 100ml per kg per day — is a key early indicator of diabetes mellitus, Cushing's disease, kidney disease, or pyometra in intact females. Track approximate daily intake if you notice increased thirst. A simple water bowl volume test over 24 hours gives your vet useful data." },
    { icon: "trophy",   title: "Cognitive Enrichment",      tip: "Olfactory enrichment activates more cortical area than any other sense in dogs — a 20-minute nose work session produces equivalent fatigue to a 2-hour walk for many breeds. Scatter feeding, sniff mats, and tracking exercises satisfy this drive. Dogs deprived of mental stimulation redirect into destructive behaviour, excessive barking, or compulsive disorders." },
    { icon: "heart",    title: "Canine Body Condition",     tip: "Obesity in dogs increases the risk of cruciate ligament rupture, orthopaedic disease, diabetes, and reduces lifespan by up to 2 years. The ideal BCS is 4–5 out of 9: ribs palpable, waist visible from above, abdominal tuck visible from the side. In thick-coated breeds, always palpate rather than assess visually — coats can disguise significant weight gain." },
    { icon: "walk",     title: "Off-Lead Recall Reliability",tip: "Recall is only reliable if it has been reinforced more than 200 times before it's ever needed in a high-distraction environment. Dogs don't generalise commands automatically — a dog that recalls perfectly in the garden may have zero recall near wildlife or other dogs. Train recall in progressively more distracting settings, and never call a dog to you for anything unpleasant." },
    { icon: "paw",      title: "Canine Social Dynamics",    tip: "Forced dog-to-dog greetings (on-lead, face-to-face) are the most common trigger for reactive behaviour — it mimics a challenge in canine body language. Parallel walking at distance is far less confrontational. Dogs that play well off-lead may still be reactive on-lead due to frustration; this is distinct from aggression and responds well to specific training protocols." },
    { icon: "vaccine",  title: "Ectoparasite Resistance",   tip: "Flea populations are developing resistance to older pyrethroid-based treatments — if a product has been used for years without apparent problems it may not be as effective as assumed. Spot-on treatments require intact skin barrier and are rendered ineffective by bathing within 48 hours of application. Isoxazoline-class treatments (oral, monthly) currently show the lowest resistance rates." },
    { icon: "info",     title: "Xylitol Toxicity",          tip: "Xylitol triggers a dose-dependent insulin release in dogs that does not occur in humans, causing life-threatening hypoglycaemia within 30 minutes of ingestion. It's found in sugar-free gum, some peanut butters, dental products, and increasingly in baked goods. As little as 0.1g per kg bodyweight can be lethal. Check ingredient labels — 'birch sugar' is the same compound." },
  ],
  senior: [
    { icon: "heart",    title: "Bi-Annual Health Screening",tip: "A dog aged 8+ is physiologically equivalent to a human in their 60s–70s. Bi-annual blood panels (full CBC, biochemistry, urinalysis, thyroid) catch subclinical kidney disease, early hypothyroidism, and anaemia before clinical signs appear. Kidney disease is detectable on standard bloods only after 75% of nephron function is already lost — SDMA testing detects it at 40% loss." },
    { icon: "food",     title: "Protein Requirements in Age",tip: "Contrary to older advice, healthy senior dogs do not need protein restriction. Reduced protein accelerates age-related muscle loss (sarcopaenia), which worsens mobility and metabolic function. Only dogs with confirmed chronic kidney disease require phosphorus and protein restriction — and even then, excessive restriction is now questioned. Prioritise high-quality, digestible protein sources." },
    { icon: "activity", title: "Hydrotherapy & Joint Loading",tip: "Water reduces effective body weight by up to 90% at shoulder depth, allowing pain-free range of motion in arthritic dogs who refuse land exercise. Even 15 minutes of swimming or underwater treadmill work 2–3x weekly maintains muscle mass around affected joints — the single most effective way to reduce osteoarthritis progression. Ask your vet for a referral to a certified canine hydrotherapist." },
    { icon: "droplet",  title: "Kidney Disease & Water",    tip: "Chronic kidney disease (CKD) is the most common age-related organ failure in dogs. The kidneys lose concentrating ability first, causing compensatory polydipsia — the dog drinks more to flush what the kidneys can't concentrate. Providing multiple water stations, adding water to food, and feeding wet or rehydrated kibble significantly reduces the kidney's daily workload." },
    { icon: "scissors", title: "Sebaceous Adenoma & Skin",  tip: "Warty, cauliflower-like skin growths in older dogs are typically benign sebaceous adenomas — common and usually harmless. Any growth that changes size rapidly, bleeds spontaneously, or becomes ulcerated warrants a fine needle aspirate to rule out mast cell tumour or other malignancy. Monthly full-body palpation during grooming is the most reliable way to catch new masses early." },
    { icon: "trophy",   title: "Canine Cognitive Dysfunction",tip: "Canine Cognitive Dysfunction Syndrome (CCDS) affects an estimated 14–35% of dogs over 8 and is mechanistically similar to Alzheimer's — the same amyloid-beta plaques are present. Symptoms include disorientation, reversed sleep cycles, loss of house training, and reduced interaction. Selegiline is the only licensed pharmaceutical treatment; dietary supplements rich in antioxidants and medium-chain triglycerides show supportive evidence." },
    { icon: "heart",    title: "Pain Quantification",       tip: "Dogs are instinctively stoic — overt pain vocalisation typically indicates severe acute pain. Chronic pain manifests as behavioural changes: reluctance to jump, altered gait, withdrawal from interaction, increased sleep, or uncharacteristic aggression when touched. The Helsinki Chronic Pain Index and Glasgow Pain Scale are validated owner-completed tools that help quantify pain levels for your vet." },
    { icon: "shield",   title: "Dental Disease & Systemic Risk",tip: "Untreated periodontal disease in seniors creates a continuous bacteraemia (bacteria entering the bloodstream) that the ageing immune system cannot clear effectively. Research in dogs mirrors human findings linking oral bacteria to endocarditis and kidney pathology. Annual dental scaling under anaesthesia is significantly safer than leaving progressive periodontal disease untreated in an otherwise healthy dog." },
    { icon: "paw",      title: "Orthopaedic Bedding",       tip: "Memory foam orthopedic beds reduce pressure point pain in dogs with hip dysplasia, spondylosis, or generalised osteoarthritis — joints bear approximately 3x body weight during the act of lying down on a hard surface. Beds with low entry height reduce the pain of rising. Heated pads at around 38°C improve synovial fluid viscosity and joint mobility, particularly in cold weather." },
    { icon: "info",     title: "Anaesthetic Risk in Seniors",tip: "Age alone does not contraindicate anaesthesia, but pre-anaesthetic blood work is essential to identify subclinical organ compromise. The greatest risks are hypotension and hypothermia during recovery, not the anaesthetic agents themselves. A senior dog with well-managed disease under an experienced vet carries lower risk than leaving a painful dental or tumour untreated. Do not avoid necessary procedures based on age alone." },
    { icon: "vaccine",  title: "Immune Senescence",         tip: "The ageing immune system mounts a weaker vaccine response (immunosenescence) — the same mechanism that makes flu vaccines less effective in elderly humans. Core vaccines should be continued on schedule, but titre testing is particularly valuable in seniors to confirm adequate response rather than assuming annual boosters are producing protective immunity. Discuss a tailored protocol with your vet." },
    { icon: "walk",     title: "Thermoregulation Decline",  tip: "Senior dogs lose subcutaneous fat and have less efficient peripheral vasoconstriction, making them significantly more vulnerable to both cold and heat stress. Core body temperature drops faster in cold weather and rises faster in heat compared to younger dogs. A well-fitted coat adds meaningful warmth in temperatures below 7°C for lean or short-coated seniors, and is not merely cosmetic." },
  ],
};

// ─── Daily tip rotation ───────────────────────────────────────────────────────
function getDailyTips(stage: string): { icon: string; title: string; tip: string }[] {
  const tips = CARE_TIPS[stage] ?? CARE_TIPS.adult;
  const now  = new Date();
  let seed   = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  for (let i = 0; i < stage.length; i++) seed += stage.charCodeAt(i);
  const shuffled = [...tips];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 3);
}

// ─── Care Guide Cards ─────────────────────────────────────────────────────────
const CARD_TINTS = ["#c8daea", "#e8c4c4", "#c4d9c4"] as const;

const CareGuideFallbackIcon: React.FC = () => (
  <div className="cg-tip-icon-fallback">
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
      stroke="rgba(100,80,160,0.35)" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  </div>
);

const CareGuideCards: React.FC<{
  stage: string;
  dogsAtStage: string[];
}> = ({ stage, dogsAtStage }) => {
  const tips = getDailyTips(stage);
  const [imgFailed, setImgFailed] = useState<boolean[]>([false, false, false]);

  const handleImgError = (i: number) => {
    setImgFailed((prev) => {
      const next = [...prev];
      next[i] = true;
      return next;
    });
  };

  return (
    <div className="cg-cards-section">
      <div className="cg-cards-header">
        <div>
          <h3 className="cg-cards-title">Care Guide</h3>
          {dogsAtStage.length > 0 && (
            <p className="cg-cards-for">For {dogsAtStage.join(" & ")} 🐾</p>
          )}
        </div>
        <span className={`cg-cards-stage-pill stage-${stage}`}>{stage}</span>
      </div>

      <div className="cg-cards-grid">
        {tips.map((tip, i) => (
          <div key={tip.title} className="cg-tip-card">
            <div className="cg-tip-illustration" style={{ background: CARD_TINTS[i] }}>
              {imgFailed[i] ? (
                <CareGuideFallbackIcon />
              ) : (
                <img
                  src={`../images/care/care-${stage}-${i + 1}.png`}
                  alt={tip.title}
                  className="cg-tip-img"
                  onError={() => handleImgError(i)}
                />
              )}
            </div>
            <div className="cg-tip-body">
              <div className="cg-tip-body-header">
                <h4 className="cg-tip-title">{tip.title}</h4>
                <span className="cg-tip-num">0{i + 1}</span>
              </div>
              <p className="cg-tip-text">{tip.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Dog Details Section
interface DetailsModalProps { details: DogDetails; onSave: (d: DogDetails) => void; onClose: () => void; }

const DetailsModal: React.FC<DetailsModalProps> = ({ details, onSave, onClose }) => {
  const [form, setForm] = useState<DogDetails>({ ...details });
  const BC  = ["underweight","just right","overweight"];
  const ACT = ["low","moderate","active","very active"];
  const NEU = ["neutered","not neutered"];
  return (
    <div className="modal-overlay" onClick={onClose}><div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header"><h3>Edit Details</h3><button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button></div>
      <div className="modal-body">
        <label className="modal-label">Weight (e.g. 11.3 kg)</label>
        <input className="modal-input" placeholder="e.g. 11.3 kg" value={form.weight ?? ""} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
        <label className="modal-label">Body Condition</label>
        <div className="modal-radio-row">{BC.map((b) => <button key={b} className={`modal-radio-btn ${form.bodyCondition === b ? "selected" : ""}`} onClick={() => setForm({ ...form, bodyCondition: b })}>{b}</button>)}</div>
        <label className="modal-label">Activity Level</label>
        <div className="modal-radio-row">{ACT.map((a) => <button key={a} className={`modal-radio-btn ${form.activityLevel === a ? "selected" : ""}`} onClick={() => setForm({ ...form, activityLevel: a })}>{a}</button>)}</div>
        <label className="modal-label">Neutered</label>
        <div className="modal-radio-row">{NEU.map((n) => <button key={n} className={`modal-radio-btn ${form.neutered === n ? "selected" : ""}`} onClick={() => setForm({ ...form, neutered: n })}>{n}</button>)}</div>
      </div>
      <div className="modal-footer"><button className="modal-btn-cancel" onClick={onClose}>Cancel</button><button className="modal-btn-save" onClick={() => { onSave(form); onClose(); }}>Save</button></div>
    </div></div>
  );
};

const MedicalModal: React.FC<DetailsModalProps> = ({ details, onSave, onClose }) => {
  const [form, setForm] = useState<DogDetails>({ ...details });
  return (
    <div className="modal-overlay" onClick={onClose}><div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header"><h3>Edit Medical Info</h3><button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button></div>
      <div className="modal-body">
        <label className="modal-label">Allergies</label>
        <input className="modal-input" placeholder="e.g. None, chicken, pollen…" value={form.allergies ?? ""} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
        <label className="modal-label">Health Issues</label>
        <input className="modal-input" placeholder="e.g. None, hip dysplasia…" value={form.healthIssues ?? ""} onChange={(e) => setForm({ ...form, healthIssues: e.target.value })} />
        <label className="modal-label">Medications <span className="modal-optional">(optional)</span></label>
        <input className="modal-input" placeholder="e.g. None, monthly flea treatment…" value={form.medications ?? ""} onChange={(e) => setForm({ ...form, medications: e.target.value })} />
      </div>
      <div className="modal-footer"><button className="modal-btn-cancel" onClick={onClose}>Cancel</button><button className="modal-btn-save" onClick={() => { onSave(form); onClose(); }}>Save</button></div>
    </div></div>
  );
};

const EatingModal: React.FC<DetailsModalProps> = ({ details, onSave, onClose }) => {
  const [form, setForm] = useState<DogDetails>({ ...details });
  const STYLES   = ["eats anything","moderately picky","very picky"];
  const TREATS   = ["none","1–2 per day","3–6 per day","7+ per day"];
  const FEEDINGS = ["once a day","twice a day","free feeding"];
  return (
    <div className="modal-overlay" onClick={onClose}><div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header"><h3>Edit Eating Habits</h3><button className="modal-close" onClick={onClose} aria-label="Close"><Icon name="close" size={18} /></button></div>
      <div className="modal-body">
        <label className="modal-label">Eating Style</label>
        <div className="modal-radio-row">{STYLES.map((s) => <button key={s} className={`modal-radio-btn ${form.eatingStyle === s ? "selected" : ""}`} onClick={() => setForm({ ...form, eatingStyle: s })}>{s}</button>)}</div>
        <label className="modal-label">Treats per Day</label>
        <div className="modal-radio-row">{TREATS.map((t) => <button key={t} className={`modal-radio-btn ${form.treatsPerDay === t ? "selected" : ""}`} onClick={() => setForm({ ...form, treatsPerDay: t })}>{t}</button>)}</div>
        <label className="modal-label">Feeding Times</label>
        <div className="modal-radio-row">{FEEDINGS.map((f) => <button key={f} className={`modal-radio-btn ${form.feedingTimes === f ? "selected" : ""}`} onClick={() => setForm({ ...form, feedingTimes: f })}>{f}</button>)}</div>
      </div>
      <div className="modal-footer"><button className="modal-btn-cancel" onClick={onClose}>Cancel</button><button className="modal-btn-save" onClick={() => { onSave(form); onClose(); }}>Save</button></div>
    </div></div>
  );
};

const DetailCardIllustration: React.FC<{ type: "details" | "medical" | "eating" }> = ({ type }) => {
  const configs: Record<string, { bg: string; img: string }> = {
    details: { bg: "#b8cfe0", img: "../images/details-dog.png" },
    medical: { bg: "#e8c4c4", img: "../images/details-medical.png" },
    eating:  { bg: "#c4d9c4", img: "../images/details-food.png" },
  };
  const c = configs[type];
  return (
    <div className="detail-card-illustration" style={{ background: c.bg }}>
      <img src={c.img} alt={type} className="detail-card-img" />
    </div>
  );
};

const DogDetailsSection: React.FC<{ dogName: string; dogId: string; token: string }> = ({ dogName, dogId, token }) => {
  const [details,   setDetails]   = useState<DogDetails>({});
  const [fetching,  setFetching]  = useState(true);
  const [openModal, setOpenModal] = useState<"details" | "medical" | "eating" | null>(null);

  useEffect(() => {
    if (!dogId || !token) return;
    getDogDetails(token, dogId)
      .then(({ details: d }) => setDetails(d))
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [dogId, token]);

  const handleSave = async (updated: DogDetails) => {
    const merged = { ...details, ...updated };
    setDetails(merged);
    try {
      const { details: saved } = await saveDogDetails(token, dogId, merged);
      setDetails(saved);
    } catch (err) {
      console.error("Failed to save dog details:", err);
      setDetails(details);
    }
  };

  if (fetching) {
    return (
      <div className="dog-details-section">
        <h2 className="dog-details-heading">{dogName}'s details</h2>
        <div className="dog-details-grid">
          {[0,1,2].map((i) => <div key={i} className="detail-card" style={{ height: 260, opacity: 0.3, background: "rgba(0,0,0,0.04)" }} />)}
        </div>
      </div>
    );
  }

  const hasDetails = details.weight || details.bodyCondition || details.activityLevel || details.neutered;
  const hasMedical = details.allergies || details.healthIssues || details.medications;
  const hasEating  = details.eatingStyle || details.treatsPerDay || details.feedingTimes;

  return (
    <div className="dog-details-section">
      <h2 className="dog-details-heading">{dogName}'s details</h2>
      <div className="dog-details-grid">
        {([
          { key: "details", title: "Details",       has: hasDetails, items: [
              details.weight        && `Weight: ${details.weight} kg`,
              details.bodyCondition && `Condition: ${details.bodyCondition}`,
              details.activityLevel && `Activity: ${details.activityLevel}`,
              details.neutered      && `Neutered: ${details.neutered}`,
            ].filter(Boolean) },
          { key: "medical", title: "Medical info",  has: hasMedical, items: [
              details.allergies    && `Allergies: ${details.allergies}`,
              details.healthIssues && details.healthIssues.toLowerCase() !== "none" && `Health: ${details.healthIssues}`,
              details.medications  && details.medications.toLowerCase()  !== "none" && `Medications: ${details.medications}`,
            ].filter(Boolean) },
          { key: "eating",  title: "Eating habits", has: hasEating,  items: [
              details.eatingStyle  && `Style: ${details.eatingStyle}`,
              details.treatsPerDay && `Treats: ${details.treatsPerDay}`,
              details.feedingTimes && `Feeding: ${details.feedingTimes}`,
            ].filter(Boolean) },
        ] as const).map((section) => (
          <div key={section.key} className="detail-card">
            <DetailCardIllustration type={section.key} />
            <div className="detail-card-body">
              <div className="detail-card-header">
                <h3 className="detail-card-title">{section.title}</h3>
                <button className="detail-edit-btn" onClick={() => setOpenModal(section.key)}>Edit</button>
              </div>
              {section.has ? (
                <ul className="detail-list">{(section.items as string[]).map((item, i) => <li key={i} className="detail-capitalize">{item}</li>)}</ul>
              ) : (
                <p className="detail-empty" onClick={() => setOpenModal(section.key)} role="button" tabIndex={0}>+ Add {dogName}'s {section.title.toLowerCase()}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {openModal === "details" && <DetailsModal details={details} onSave={handleSave} onClose={() => setOpenModal(null)} />}
      {openModal === "medical" && <MedicalModal details={details} onSave={handleSave} onClose={() => setOpenModal(null)} />}
      {openModal === "eating"  && <EatingModal  details={details} onSave={handleSave} onClose={() => setOpenModal(null)} />}
    </div>
  );
};

// Personality helpers
interface PersonalityOption { key: string; label: string; img: string; }
interface PersonalityCategory { id: string; question: string; options: PersonalityOption[]; }

const PERSONALITY_CATEGORIES: PersonalityCategory[] = [
  {
    id: "fav_game",
    question: "What's their favourite game?",
    options: [
      { key: "game_fetch",  label: "Ball chaser",      img: "../images/personality/ball.png"    },
      { key: "game_tug",    label: "Tug of war",        img: "../images/personality/tug.png"     },
      { key: "game_chase",  label: "Chasing sticks",    img: "../images/personality/chase.png"   },
      { key: "game_hide",   label: "Hide & seek",       img: "../images/personality/hide_and_seek.png" },
      { key: "game_chill",  label: "Just chilling",     img: "../images/personality/chill.png"   },
    ],
  },
  {
    id: "fav_thing",
    question: "What do they love most?",
    options: [
      { key: "loves_cuddles", label: "Cuddles",           img: "../images/personality/cuddles.png" },
      { key: "loves_treats",  label: "Tricks for treats", img: "../images/personality/treats.png"  },
      { key: "loves_walks",   label: "Walkies",           img: "../images/personality/walks.png"   },
      { key: "loves_friends", label: "Making friends",    img: "../images/personality/friends.png" },
      { key: "loves_sleep",   label: "Sleeping",          img: "../images/personality/sleep.png"   },
    ],
  },
  {
    id: "personality",
    question: "How would you describe them?",
    options: [
      { key: "pers_energetic", label: "High-energy",       img: "../images/personality/high_energy.png" },
      { key: "pers_gentle",    label: "Gentle",            img: "../images/personality/gentle.png"    },
      { key: "pers_cuddly",    label: "Cuddly",            img: "../images/personality/cuddly.png"    },
      { key: "pers_playful",   label: "Playful",           img: "../images/personality/playful.png"   },
      { key: "pers_stubborn",  label: "A little stubborn", img: "../images/personality/stubborn.png"  },
    ],
  },
];

const getSelected = (personality: string[], catId: string): string => {
  const cat = PERSONALITY_CATEGORIES.find(c => c.id === catId);
  if (!cat) return "";
  return cat.options.find(o => personality.includes(o.key))?.key ?? "";
};

const setSelected = (personality: string[], catId: string, key: string): string[] => {
  const cat = PERSONALITY_CATEGORIES.find(c => c.id === catId);
  if (!cat) return personality;
  const catKeys = cat.options.map(o => o.key);
  return [...personality.filter(p => !catKeys.includes(p)), key];
};

function calcLifeStageFromDob(dob: string): string {
  const birth = new Date(dob), now = new Date();
  const ageMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (ageMonths < 12) return "puppy"; if (ageMonths < 84) return "adult"; return "senior";
}

// Add Dog Wizard
interface AddDogFormData { name: string; breed: string; dob: string; lifeStage: string; dobLocked: boolean; personality: string[]; gender: string; }
const ADD_LIFE_STAGES = [{ key: "puppy", label: "Puppy", age: "0–1 yrs" }, { key: "adult", label: "Adult", age: "1–7 yrs" }, { key: "senior", label: "Senior", age: "7+ yrs" }] as const;

function useSimpleBreeds() {
  const [breeds, setBreeds]   = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const fetchBreeds = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch("https://dog.ceo/api/breeds/list/all");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const list = Object.keys(data.message).flatMap((breed) => {
        const subs = data.message[breed];
        return subs.length === 0 ? [breed] : subs.map((s: string) => `${s} ${breed}`);
      }).map((name, id) => ({ id, name: name.split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") })).sort((a, b) => a.name.localeCompare(b.name));
      setBreeds(list);
    } catch { setError("Could not load breeds"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchBreeds(); }, [fetchBreeds]);
  return { breeds, loading, error, retry: fetchBreeds };
}

const AddDogStepA: React.FC<{ form: AddDogFormData; errors: Record<string, string>; onChange: (patch: Partial<AddDogFormData>) => void; }> = ({ form, errors, onChange }) => {
  const [search, setSearch] = useState(form.breed && form.breed !== "Mixed Breed" ? form.breed : "");
  const [showList, setShowList] = useState(false);
  const [isMixed, setIsMixed] = useState(form.breed === "Mixed Breed");
  const { breeds, loading, error, retry } = useSimpleBreeds();
  const filtered = breeds.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())).slice(0, 80);
  const handleMixed = () => { if (isMixed) { setIsMixed(false); onChange({ breed: "" }); setSearch(""); } else { setIsMixed(true); onChange({ breed: "Mixed Breed" }); setSearch(""); setShowList(false); } };
  return (
    <div className="adw-step">
      <p className="adw-step-label">Step 1</p>
      <h2 className="adw-step-heading">Tell us about your buddy!</h2>
      <label className="adw-label">What's your dog's name?</label>
      <div className="adw-field">
        <input className={`adw-input ${errors.name ? "adw-error" : ""}`} placeholder="e.g. Luna, Cooper, Max…" value={form.name} onChange={(e) => onChange({ name: e.target.value })} />
        {errors.name && <span className="adw-field-error">{errors.name}</span>}
      </div>
      <label className="adw-label" style={{ marginTop: "1.2rem" }}>Which breed?</label>
      {!isMixed && (
        <div className="adw-field" style={{ marginTop: "0.4rem" }}>
          <div className="adw-breed-wrap">
            <input className={`adw-input ${form.breed && form.breed !== "Mixed Breed" ? "adw-has-value" : ""} ${errors.breed ? "adw-error" : ""}`}
              placeholder="Search breed…" value={search}
              onChange={(e) => { setSearch(e.target.value); setShowList(true); if (form.breed) onChange({ breed: "" }); }}
              onFocus={() => setShowList(true)} disabled={loading} />
            {form.breed && form.breed !== "Mixed Breed" && <button className="adw-breed-clear" onClick={() => { onChange({ breed: "" }); setSearch(""); setShowList(true); }}>×</button>}
          </div>
          {errors.breed && <span className="adw-field-error">{errors.breed}</span>}
          {showList && loading && <div className="adw-breed-state"><div className="adw-spinner" /><span>Loading breeds…</span></div>}
          {showList && !loading && error && <div className="adw-breed-state adw-breed-error"><span>Could not load breeds</span><button className="adw-retry-btn" onClick={retry}>Retry</button></div>}
          {showList && !loading && !error && (filtered.length === 0 ? <div className="adw-breed-state"><span>No breeds match "{search}"</span></div> : (
            <div className="adw-breed-list">{filtered.map((b) => (<div key={b.id} className={`adw-breed-item ${form.breed === b.name ? "selected" : ""}`} onClick={() => { onChange({ breed: b.name }); setSearch(b.name); setShowList(false); }}><span>{b.name}</span><span className={`adw-breed-dot ${form.breed === b.name ? "filled" : ""}`} /></div>))}</div>
          ))}
        </div>
      )}
      <label className="adw-mixed-toggle" onClick={handleMixed}>
        <div className={`adw-mixed-check ${isMixed ? "checked" : ""}`}>{isMixed && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}</div>
        <span>{form.name ? <><strong>{form.name}</strong> has an adorable unknown, mixed breed</> : <>My dog has an adorable unknown, mixed breed</>}</span>
      </label>
    </div>
  );
};

const AddDogStepB: React.FC<{ form: AddDogFormData; errors: Record<string, string>; onChange: (patch: Partial<AddDogFormData>) => void; }> = ({ form, errors, onChange }) => {
  const [dobUnknown, setDobUnknown] = useState(!form.dob && !form.dobLocked);
  const dobRef = useRef<HTMLInputElement>(null);
  const handleDobChange = (dob: string) => { if (!dob) { onChange({ dob: "", dobLocked: false }); return; } const stage = calcLifeStageFromDob(dob); onChange({ dob, lifeStage: stage, dobLocked: true }); };
  const handleDobUnknown = () => { if (!dobUnknown) { setDobUnknown(true); onChange({ dob: "", dobLocked: false }); } else { setDobUnknown(false); } };
  return (
    <div className="adw-step">
      <p className="adw-step-label">Step 2</p>
      <h2 className="adw-step-heading">Age & personality</h2>
      <label className="adw-label">When was {form.name || "your dog"} born? <span className="adw-label-hint"> (optional)</span></label>
      <div className="adw-dob-row">
        <div className={`adw-field adw-dob-field ${dobUnknown ? "adw-dob-disabled" : ""}`} onClick={() => !dobUnknown && dobRef.current?.showPicker()}>
          <input ref={dobRef} className={`adw-input adw-calendar ${errors.dob ? "adw-error" : ""}`} type="date" value={form.dob} disabled={dobUnknown} onChange={(e) => handleDobChange(e.target.value)} />
        </div>
        <button className={`adw-dob-unknown ${dobUnknown ? "selected" : ""}`} onClick={handleDobUnknown}>{dobUnknown ? "↩ Pick a date" : "I'm not sure"}</button>
      </div>
      {form.dob && form.dobLocked && <p className="adw-dob-hint"><Icon name="check" size={11} /> Life stage auto-set based on Birthday!</p>}
      {dobUnknown && <p className="adw-dob-hint">No worries — set the life stage manually below.</p>}
      <label className="adw-label" style={{ marginTop: "1.3rem" }}>Life stage</label>
      {errors.lifeStage && <span className="adw-field-error">{errors.lifeStage}</span>}
      <div className="adw-stage-grid">
        {ADD_LIFE_STAGES.map((s) => {
          const isLocked = form.dobLocked, isSelected = form.lifeStage === s.key;
          return (
            <button key={s.key} className={`adw-stage-btn ${isSelected ? "selected" : ""} ${isLocked && !isSelected ? "locked-out" : ""} ${isLocked ? "stage-locked" : ""}`}
              onClick={() => { if (!isLocked) onChange({ lifeStage: s.key }); }} disabled={isLocked && !isSelected}>
              <span className="adw-stage-icon"><Icon name="dogFace" size={22} /></span>
              <span className="adw-stage-label">{s.label}</span>
              <span className="adw-stage-age">{s.age}</span>
              {isLocked && isSelected && (<span className="adw-stage-lock-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="10" height="10"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>)}
            </button>
          );
        })}
      </div>
      {PERSONALITY_CATEGORIES.map((cat) => (
        <div key={cat.id} className="adw-personality-category">
          <label className="adw-label" style={{ marginTop: "1.3rem" }}>{cat.question}</label>
          {errors.personality && cat.id === "fav_thing" && <span className="adw-field-error">{errors.personality}</span>}
          <div className="adw-personality-grid">
            {cat.options.map((opt) => {
              const isSelected = form.personality.includes(opt.key);
              return (
                <button key={opt.key} className={`adw-personality-chip ${isSelected ? "selected" : ""}`}
                  onClick={() => onChange({ personality: setSelected(form.personality, cat.id, opt.key) })}>
                  <span className="adw-chip-img">
                    <img src={opt.img} alt={opt.label}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                        const wrap = img.parentElement;
                        if (wrap && !wrap.querySelector(".adw-chip-fallback")) {
                          const fb = document.createElement("span");
                          fb.className = "adw-chip-fallback";
                          fb.textContent = "🐾";
                          wrap.appendChild(fb);
                        }
                      }} />
                  </span>
                  <span className="adw-chip-label">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const AddDogStepC: React.FC<{ form: AddDogFormData; errors: Record<string, string>; onChange: (patch: Partial<AddDogFormData>) => void; }> = ({ form, errors, onChange }) => (
  <div className="adw-step">
    <p className="adw-step-label">Step 3</p>
    <h2 className="adw-step-heading"><strong>{form.name || "Your dog"}</strong> is a good…</h2>
    <div className="adw-gender-grid">
      <button className={`adw-gender-btn ${form.gender === "male" ? "selected" : ""}`} onClick={() => onChange({ gender: "male" })}>
        <span className="adw-gender-icon adw-gender-male"><img src="../images/paint/male_icon.png" width={"40%"} /></span>
        <span className="adw-gender-label">Boy</span>
      </button>
      <button className={`adw-gender-btn ${form.gender === "female" ? "selected" : ""}`} onClick={() => onChange({ gender: "female" })}>
        <span className="adw-gender-icon adw-gender-female"><img src="../images/paint/female_icon.png" width={"40%"} /></span>
        <span className="adw-gender-label">Girl</span>
      </button>
    </div>
    {errors.gender && <span className="adw-field-error" style={{ marginTop: "0.5rem" }}>{errors.gender}</span>}
  </div>
);

const AddDogModal: React.FC<{
  token: string; onSave: (dog: DogProfile) => void; onClose: () => void;
}> = ({ token, onSave, onClose }) => {
  const [step,   setStep]   = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [form,   setForm]   = useState<AddDogFormData>({ name: "", breed: "", dob: "", lifeStage: "adult", dobLocked: false, personality: [], gender: "male" });

  const patch = (p: Partial<AddDogFormData>) => {
    setForm((prev) => ({ ...prev, ...p }));
    const cleared = { ...errors };
    Object.keys(p).forEach((k) => delete cleared[k]);
    setErrors(cleared);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 1) { if (!form.name.trim()) e.name = "Dog name is required"; if (!form.breed.trim()) e.breed = "Please select a breed"; }
    if (step === 2) { if (!form.lifeStage) e.lifeStage = "Please select a life stage"; const hasCats = PERSONALITY_CATEGORIES.every(cat => cat.options.some(o => form.personality.includes(o.key))); if (!hasCats) e.personality = "Please pick one in each category"; }
    if (step === 3) { if (!form.gender) e.gender = "Please select a gender"; }
    if (Object.keys(e).length > 0) { setErrors(e); return false; } return true;
  };

  const handleNext = () => { if (!validate()) return; setStep((s) => (s < 3 ? (s + 1) as 1 | 2 | 3 : s)); };
  const handleBack = () => { setErrors({}); setStep((s) => (s > 1 ? (s - 1) as 1 | 2 | 3 : s)); };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const { dog } = await createExtraDog(token, {
        name: form.name, breed: form.breed, gender: form.gender,
        dob: form.dob || undefined, lifeStage: form.lifeStage, personality: form.personality,
      });
      onSave({ ...dog, isMain: false });
      onClose();
    } catch (err) {
      console.error("Failed to add dog:", err);
      setErrors({ general: "Failed to add dog. Please try again." });
    } finally { setSaving(false); }
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
              {([1,2,3] as const).map((n) => (<React.Fragment key={n}><div className={`adw-dot ${step === n ? "active" : step > n ? "done" : ""}`} />{n < 3 && <div className={`adw-dot-line ${step > n ? "done" : ""}`} />}</React.Fragment>))}
            </div>
            <button className="adw-close" onClick={onClose} aria-label="Close"><Icon name="close" size={16} /></button>
          </div>
          {errors.general && <div className="modal-error" style={{ margin: "0 1.5rem 0.5rem" }}>{errors.general}</div>}
          <div className="adw-form-body">
            {step === 1 && <AddDogStepA form={form} errors={errors} onChange={patch} />}
            {step === 2 && <AddDogStepB form={form} errors={errors} onChange={patch} />}
            {step === 3 && <AddDogStepC form={form} errors={errors} onChange={patch} />}
          </div>
          <div className="adw-form-footer">
            {step > 1 && <button className="adw-btn-back" onClick={handleBack}><Icon name="arrowLeft" size={14} /> Back</button>}
            {step < 3
              ? <button className="adw-btn-next" onClick={handleNext}>Next <Icon name="arrow" size={14} /></button>
              : <button className="adw-btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? <><Icon name="spinner" size={14} /> Adding…</> : <><Icon name="plus" size={14} /> Add Dog</>}
                </button>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Extra Dog Panel ──────────────────────────────────────────────────────────
const ExtraDogPanel: React.FC<{
  dog: DogProfile; token: string;
  onRemove: (id: string) => void;
  onAvatarUpdate: (dogId: string, file: File) => Promise<void>;
  onDogUpdate: (updated: DogProfile) => void;
}> = ({ dog, token, onRemove, onAvatarUpdate, onDogUpdate }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading,    setUploading]    = useState(false);
  const [editOpen,     setEditOpen]     = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");

  const handleUpload = async (file: File) => {
    setUploading(true);
    try { await onAvatarUpdate(dog.id, file); }
    catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/#/dog/${dog.id}`);
      setCopyFeedback("✓ Copied!"); setTimeout(() => setCopyFeedback(""), 2000);
    } catch { setCopyFeedback("Failed"); setTimeout(() => setCopyFeedback(""), 2000); }
  };

  const handleShare = async () => {
    const url  = `${window.location.origin}/#/dog/${dog.id}`;
    const text = `Check out ${dog.name}! 🐾 ${url}`;
    if (navigator.share) {
      try { await navigator.share({ title: `${dog.name} on BarkBuddy`, text, url }); }
      catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopyFeedback("✓ Link copied!");
        setTimeout(() => setCopyFeedback(""), 2000);
      } catch { /* silent */ }
    }
  };

  return (
    <div className="extra-dog-panel">
      <div className="extra-dog-panel-divider"><span className="extra-dog-panel-divider-line" /></div>
      <div className="dog-butternut-layout">
        <div className="dog-photo-hero">
          <div className="dog-photo-img">
            {dog.avatarUrl ? <img src={dog.avatarUrl} alt={dog.name} /> : (<div className="dog-photo-placeholder"><Icon name="paw" size={48} /><p>Add {dog.name}'s photo</p></div>)}
            {uploading && <div className="dog-photo-uploading"><Icon name="spinner" size={24} /></div>}
            <button className="dog-photo-btn" onClick={() => inputRef.current?.click()} disabled={uploading} aria-label={`Upload photo for ${dog.name}`}><Icon name="camera" size={20} /></button>
          </div>
          <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
        </div>
        <div className="dog-info-panel">
          <div className="dog-info-top">
            <button className="dog-info-edit-btn" onClick={() => setEditOpen(true)}><Icon name="edit" size={14} /> Edit</button>
            <h2 className="dog-info-name">{dog.name}<span className="dog-info-gender">{dog.gender === "male" ? " ♂" : " ♀"}</span></h2>
            <p className="dog-info-breed">{dog.breed}</p>
            {dog.dob && <p className="dog-info-age"><strong>{calcAge(dog.dob)}</strong><span className="dog-info-human-age">{humanYears(dog.dob)}</span></p>}
          </div>
          {dog.personality.length > 0 && (
            <div className="dog-personality-cats">
              {PERSONALITY_CATEGORIES.map(cat => {
                const sel = cat.options.find(o => dog.personality.includes(o.key));
                if (!sel) return null;
                return (
                  <div
                    key={cat.id}
                    className="dog-personality-cat-card"
                    onClick={() => setEditOpen(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setEditOpen(true)}
                    title="Edit personality"
                  >
                    <div className="dog-personality-cat-img-wrap">
                      <img src={sel.img} alt={sel.label}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = "none";
                          const wrap = img.parentElement;
                          if (wrap && !wrap.querySelector(".dog-pcat-fallback")) {
                            const fb = document.createElement("span");
                            fb.className = "dog-pcat-fallback";
                            fb.textContent = "🐾";
                            wrap.appendChild(fb);
                          }
                        }} />
                    </div>
                    <span className="dog-personality-cat-label">{sel.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="dog-share-banner">
        <div className="dog-share-text"><h3 className="dog-share-title">Share {dog.name}'s profile</h3><p className="dog-share-sub">Show off your pup to friends and family!</p></div>
        <div className="dog-share-actions">
          <button className="dog-share-btn" onClick={handleCopyLink}><Icon name="link" size={14} /> {copyFeedback || "Copy link"}</button>
          <button className="dog-share-btn social" onClick={handleShare}><Icon name="share" size={14} /> Share</button>
        </div>
        <div className="dog-share-paws" aria-hidden="true">🐾 🐾 🐾</div>
      </div>
      <DogDetailsSection dogName={dog.name} dogId={dog.id} token={token} />
      {editOpen && <EditDogModal dog={{ ...dog, isMain: false }} token={token} onSave={onDogUpdate} onClose={() => setEditOpen(false)} />}
    </div>
  );
};

const AddDogRow: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div className="add-dog-row-section">
    <button className="add-another-dog-btn" onClick={onAdd}>
      <span className="add-dog-btn-icon"><Icon name="dogFace" size={20} /></span>
      <span className="add-dog-btn-text"><span className="add-dog-btn-label">Add Another Dog</span><span className="add-dog-btn-sub">Keep track of your whole pack</span></span>
      <Icon name="plus" size={18} />
    </button>
  </div>
);

// ─── Dog View ─────────────────────────────────────────────────────────────────
const DogView: React.FC<{
  dog: DogProfile | null; allDogs: DogProfile[]; token: string;
  onDogUpdate: (d: DogProfile) => void; onAllDogsUpdate: (dogs: DogProfile[]) => void;
}> = ({ dog, allDogs, token, onDogUpdate, onAllDogsUpdate }) => {
  const [editOpen,     setEditOpen]     = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [addOpen,      setAddOpen]      = useState(false);

  const extraDogs = allDogs.filter((d) => !d.isMain);

  const handleAvatarUpload = async (file: File) => {
    if (!dog) return;
    setUploading(true);
    try { const { avatarUrl } = await uploadDogAvatarById(token, dog.id, file); onDogUpdate({ ...dog, avatarUrl }); }
    catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  const handleCopyLink = async () => {
    if (!dog) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/#/dog/${dog.id}`);
      setCopyFeedback("✓ Copied!"); setTimeout(() => setCopyFeedback(""), 2000);
    } catch { setCopyFeedback("Failed to copy"); setTimeout(() => setCopyFeedback(""), 2000); }
  };

  const handleShare = async () => {
    if (!dog) return;
    const url  = `${window.location.origin}/#/dog/${dog.id}`;
    const text = `Check out ${dog.name}! 🐾 ${url}`;
    if (navigator.share) {
      try { await navigator.share({ title: `${dog.name} on BarkBuddy`, text, url }); }
      catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopyFeedback("✓ Link copied!");
        setTimeout(() => setCopyFeedback(""), 2000);
      } catch { /* silent */ }
    }
  };

  const handleAddDog      = (newDog: DogProfile) => onAllDogsUpdate([...allDogs, { ...newDog, isMain: false }]);
  const handleRemoveDog   = async (id: string) => { try { await deleteExtraDog(token, id); onAllDogsUpdate(allDogs.filter((d) => d.id !== id)); } catch (err) { console.error(err); } };
  const handleExtraAvatar = async (dogId: string, file: File) => { try { const { avatarUrl } = await uploadDogAvatarById(token, dogId, file); onAllDogsUpdate(allDogs.map((d) => d.id === dogId ? { ...d, avatarUrl } : d)); } catch (err) { console.error(err); } };
  const handleExtraUpdate = (updated: DogProfile) => onAllDogsUpdate(allDogs.map((d) => d.id === updated.id ? updated : d));

  if (!dog) {
    return <div className="db-view"><div className="db-placeholder"><Icon name="paw" size={40} /><p>No dog profile found. Add your dog in Settings!</p></div></div>;
  }

  return (
    <div className="db-view dog-view">
      <div className="dog-butternut-layout">
        <DogPhotoHero url={dog.avatarUrl} name={dog.name} onUpload={handleAvatarUpload} uploading={uploading} />
        <div className="dog-info-panel">
          <div className="dog-info-top">
            <button className="dog-info-edit-btn" onClick={() => setEditOpen(true)}><Icon name="edit" size={14} /> Edit</button>
            <h1 className="dog-info-name">{dog.name}<span className="dog-info-gender">{dog.gender === "male" ? " ♂" : " ♀"}</span></h1>
            <p className="dog-info-breed">{dog.breed}</p>
            {dog.dob && <p className="dog-info-age"><strong>{calcAge(dog.dob)}</strong><span className="dog-info-human-age">{humanYears(dog.dob)}</span></p>}
          </div>
          {dog.personality.length > 0 && (
            <div className="dog-personality-cats">
              {PERSONALITY_CATEGORIES.map(cat => {
                const sel = cat.options.find(o => dog.personality.includes(o.key));
                if (!sel) return null;
                return (
                  <div
                    key={cat.id}
                    className="dog-personality-cat-card"
                    onClick={() => setEditOpen(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setEditOpen(true)}
                    title="Edit personality"
                  >
                    <div className="dog-personality-cat-img-wrap">
                      <img src={sel.img} alt={sel.label}
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = "none";
                          const wrap = img.parentElement;
                          if (wrap && !wrap.querySelector(".dog-pcat-fallback")) {
                            const fb = document.createElement("span");
                            fb.className = "dog-pcat-fallback";
                            fb.textContent = "🐾";
                            wrap.appendChild(fb);
                          }
                        }} />
                    </div>
                    <span className="dog-personality-cat-label">{sel.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="dog-share-banner">
        <div className="dog-share-text"><h3 className="dog-share-title">Share {dog.name}'s profile</h3><p className="dog-share-sub">Show off your pup to friends and family!</p></div>
        <div className="dog-share-actions">
          <button className="dog-share-btn" onClick={handleCopyLink}><Icon name="link" size={14} /> {copyFeedback || "Copy link"}</button>
          <button className="dog-share-btn social" onClick={handleShare}><Icon name="share" size={14} /> Share</button>
        </div>
        <div className="dog-share-paws" aria-hidden="true">🐾 🐾 🐾</div>
      </div>

      <DogDetailsSection dogName={dog.name} dogId={dog.id} token={token} />

      {extraDogs.map((ed) => (
        <ExtraDogPanel key={ed.id} dog={ed} token={token}
          onRemove={handleRemoveDog} onAvatarUpdate={handleExtraAvatar} onDogUpdate={handleExtraUpdate} />
      ))}

      <AddDogRow onAdd={() => setAddOpen(true)} />
      {addOpen && <AddDogModal token={token} onSave={handleAddDog} onClose={() => setAddOpen(false)} />}

      {/* ─── Daily Care Guide Cards ────────────────────────────────────────── */}
      {Array.from(new Set([dog.lifeStage, ...extraDogs.map((d) => d.lifeStage)])).map((stage) => {
        const dogsAtStage = [
          ...(dog.lifeStage === stage ? [dog.name] : []),
          ...extraDogs.filter((d) => d.lifeStage === stage).map((d) => d.name),
        ];
        return (
          <CareGuideCards key={stage} stage={stage} dogsAtStage={dogsAtStage} />
        );
      })}

      {editOpen && <EditDogModal dog={{ ...dog, isMain: true }} token={token} onSave={onDogUpdate} onClose={() => setEditOpen(false)} />}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const { token, logout }  = useAuth();
  const { totalCount: savedCount } = useSaved();
  const location = useLocation();
  const [activeNav, setActiveNav] = useState<string>(
    (location.state as { tab?: string })?.tab ?? "home"
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user,    setUser]    = useState<UserProfile | null>(null);
  const [dog,     setDog]     = useState<DogProfile  | null>(null);
  const [allDogs, setAllDogs] = useState<DogProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [notifications,  setNotifications]  = useState<AppNotification[]>([]);
  const [notifLoading,   setNotifLoading]   = useState(false);
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [forumPostId,    setForumPostId]    = useState<string | null>(null);
  const [forumCommentId, setForumCommentId] = useState<string | null>(null);
  const [settingsAddDogOpen, setSettingsAddDogOpen] = useState(false);

  const POLL_INTERVAL_MS = 60_000;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setNotifLoading(true);
    try { const data = await safeGetNotifications(token); setNotifications(data); }
    finally { setNotifLoading(false); }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (!unreadIds.length) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (token) await safeMarkRead(token, unreadIds);
  };

  const handleClickNotif = async (notif: AppNotification) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    if (token && !notif.isRead) await safeMarkRead(token, [notif.id]);
    if (notif.postId) {
      setForumPostId(notif.postId);
      setForumCommentId(notif.commentId ?? null);
      setActiveNav("forum");
      setNotifOpen(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    Promise.all([getProfile(token), getAllDogs(token)])
      .then(([profileRes, dogsRes]) => {
        setUser(profileRes.user);
        const dogs: DogProfile[] = dogsRes.dogs ?? [];
        if (dogs.length > 0) {
          const hasMain = dogs.some((d: any) => d.isMain);
          const merged  = hasMain
            ? dogs
            : dogs.map((d: any, i: number) => ({ ...d, isMain: i === 0 }));
          const mainDog = merged.find((d) => d.isMain) ?? merged[0];
          setDog({ ...mainDog, isMain: true });
          setAllDogs(merged);
        } else if (profileRes.dog) {
          setDog({ ...profileRes.dog, isMain: true });
          setAllDogs([{ ...profileRes.dog, isMain: true }]);
        } else {
          setDog(null);
          setAllDogs([]);
        }
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleUserUpdate    = (updated: Partial<UserProfile>) => setUser((p) => p ? { ...p, ...updated } : p);
  const handleAllDogsUpdate = (dogs: DogProfile[]) => setAllDogs(dogs);
  const handleLogout        = () => { logout(); window.location.href = "/"; };

  const handleDogUpdate = (updated: DogProfile) => {
    setDog(updated);
    setAllDogs((prev) => prev.map((d) => d.id === updated.id ? { ...updated, isMain: true } : d));
    setUser((u) => u ? { ...u, profileComplete: calcProfileComplete(u, updated) } : u);
  };

  const handleDogRemove = async (dogId: string) => {
    try {
      await deleteExtraDog(token!, dogId);
      setAllDogs((prev) => prev.filter((d) => d.id !== dogId));
    } catch (err) {
      console.error("Failed to remove dog:", err);
    }
  };

  const handleViewForumPost = (postId: string) => {
    setForumPostId(postId);
    setForumCommentId(null);
    setActiveNav("forum");
  };

  const labels: Record<string, string> = {
    home:     "Dashboard",
    settings: "Settings",
    dog:      "My Dog",
    calendar: "Buddy Calendar",
    forum:    "Community Forum",
    saved:    "Saved",
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
        onToggleNotif={() => setNotifOpen(p => !p)}
      />

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
        <Sidebar
          active={activeNav}
          onNav={setActiveNav}
          onLogout={handleLogout}
          userAvatar={user.avatarUrl}
          userName={user.name}
          savedCount={savedCount}
        />

        <main className="db-content" id="main-content" tabIndex={-1}>

          {activeNav === "home" && token && (
            <DashboardView
              user={user} dog={dog} allDogs={allDogs} token={token}
              onNav={setActiveNav} onViewForumPost={handleViewForumPost}
            />
          )}

          {activeNav === "settings" && token && (
            <SettingsView
              user={user} dog={dog} dogs={allDogs} token={token}
              onUpdate={handleUserUpdate}
              onDogUpdate={handleDogUpdate}
              onDogRemove={handleDogRemove}
              onNav={setActiveNav}
              onAddDog={() => setSettingsAddDogOpen(true)}
            />
          )}

          {settingsAddDogOpen && token && (
            <AddDogModal
              token={token}
              onSave={(newDog) => {
                handleAllDogsUpdate([...allDogs, { ...newDog, isMain: false }]);
                setSettingsAddDogOpen(false);
              }}
              onClose={() => setSettingsAddDogOpen(false)}
            />
          )}

          {activeNav === "dog" && token && (
            <DogView
              dog={dog} allDogs={allDogs} token={token}
              onDogUpdate={handleDogUpdate} onAllDogsUpdate={handleAllDogsUpdate}
            />
          )}

          {activeNav === "calendar" && (
            <div className="db-view"><BuddyCalendar dogName={dog?.name} allDogs={allDogs} /></div>
          )}

          {activeNav === "forum" && (
            <div className="db-view">
              <CommunityForum
                initialPostId={forumPostId}
                initialCommentId={forumCommentId}
                onDeepLinkConsumed={() => { setForumPostId(null); setForumCommentId(null); }}
                userAvatar={user?.avatarUrl}
                userName={user?.name}
              />
            </div>
          )}

          {activeNav === "saved" && (
            <div className="db-view">
              <SavedView onNav={setActiveNav} />
            </div>
          )}

        </main>
      </div>

      <MobileTopNav
        open={drawerOpen}
        active={activeNav}
        onNav={setActiveNav}
        onClose={() => setDrawerOpen(false)}
        onLogout={handleLogout}
        userAvatar={user?.avatarUrl}
        userName={user?.name}
        userEmail={user?.email}
        savedCount={savedCount}
      />
    </div>
  );
};

export default Dashboard;