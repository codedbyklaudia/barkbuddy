import React, { useState, useEffect, useRef } from "react";
import "./Buddy_Calendar.scss";
import {
  getHealthEvents, addHealthEvent, completeHealthEvent,
  deleteHealthEvent, editHealthEvent,
  type HealthEvent, type EventType,
} from "../api/Healthevents";
import { useAuth } from "../context/AuthContext";

import vaccineIcon  from "../../images/icons/vaccine.svg";
import fleaIcon     from "../../images/icons/flea.svg";
import wormIcon     from "../../images/icons/worming.svg";
import vetIcon      from "../../images/icons/care.svg";
import groomingIcon from "../../images/icons/grooming1.svg";
import eventIcon    from "../../images/icons/calendar-add.svg";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DogOption {
  id:        string;
  name:      string;
  isMain?:   boolean;
  avatarUrl?: string;
}

const DOG_COLORS = [
  { color: "#7c3aed", bg: "#ede9fe" },
  { color: "#0891b2", bg: "#e0f2fe" },
  { color: "#be185d", bg: "#fce7f3" },
  { color: "#059669", bg: "#d1fae5" },
  { color: "#b45309", bg: "#fef3c7" },
  { color: "#6366f1", bg: "#eef2ff" },
];

const getDogColor = (dogs: DogOption[], dogId: string) => {
  const idx = dogs.findIndex((d) => d.id === dogId);
  return DOG_COLORS[Math.max(0, idx) % DOG_COLORS.length];
};

const TYPE_CONFIG: Record<EventType, { label: string; icon: string; color: string; bg: string }> = {
  vaccine:   { label: "Vaccine",         icon: vaccineIcon,  color: "#7c3aed", bg: "#ede9fe" },
  flea_tick: { label: "Flea & Tick",     icon: fleaIcon,     color: "#0891b2", bg: "#e0f2fe" },
  worming:   { label: "Worming",         icon: wormIcon,     color: "#b45309", bg: "#fef3c7" },
  vet:       { label: "Vet Appointment", icon: vetIcon,      color: "#be185d", bg: "#fce7f3" },
  grooming:  { label: "Grooming",        icon: groomingIcon, color: "#059669", bg: "#d1fae5" },
  custom:    { label: "Custom Event",    icon: eventIcon,    color: "#6366f1", bg: "#eef2ff" },
};

const MONTHS       = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_SHORT   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ─── Date helpers ─────────────────────────────────────────────────────────────

const toDateKey      = (raw: string): string => raw?.slice(0, 10) ?? "";
const parseLocalDate = (s: string): Date => {
  const [y, m, d] = toDateKey(s).split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
};
const eventDateKey  = (event: HealthEvent): string => toDateKey(event.due_date);
const localTodayStr = (): string => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
};

// ─── Status ───────────────────────────────────────────────────────────────────

type Status = "overdue" | "soon" | "upcoming" | "done";

const getStatus = (event: HealthEvent): Status => {
  if (event.completed) return "done";
  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const due      = parseLocalDate(event.due_date); due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)   return "overdue";
  if (diffDays <= 14) return "soon";
  return "upcoming";
};

const STATUS_COLOR: Record<Status, string> = {
  overdue: "#ef4444", soon: "#f59e0b", upcoming: "#6366f1", done: "#10b981",
};
const STATUS_LABEL: Record<Status, string> = {
  overdue: "Overdue", soon: "Due Soon", upcoming: "Upcoming", done: "Done",
};

// ─── Hook: detect mobile ──────────────────────────────────────────────────────

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

// ─── Dog Avatar ───────────────────────────────────────────────────────────────

const DogAvatar: React.FC<{ dog: DogOption; size?: number; color: string; bg: string }> = ({ dog, size = 22, color, bg }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: dog.avatarUrl ? undefined : bg,
    border: `1.5px solid ${color}`,
    overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.45, fontWeight: 700, color,
    flexShrink: 0,
  }}>
    {dog.avatarUrl
      ? <img src={dog.avatarUrl} alt={dog.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      : dog.name.charAt(0).toUpperCase()}
  </div>
);

// ─── Dog Selector ─────────────────────────────────────────────────────────────

const DogSelector: React.FC<{
  dogs:     DogOption[];
  selected: string;
  onChange: (id: string) => void;
}> = ({ dogs, selected, onChange }) => {
  if (dogs.length <= 1) return null;
  return (
    <div className="cal-dog-selector">
      {dogs.map((dog) => {
        const { color, bg } = getDogColor(dogs, dog.id);
        const isSelected    = selected === dog.id;
        return (
          <button
            key={dog.id}
            className={`cal-dog-btn ${isSelected ? "selected" : ""}`}
            style={isSelected ? { borderColor: color, background: bg } : {}}
            onClick={() => onChange(dog.id)}
          >
            <DogAvatar dog={dog} size={20} color={color} bg={bg} />
            <span style={isSelected ? { color } : {}}>{dog.name}</span>
          </button>
        );
      })}
    </div>
  );
};

// ─── Drag state ───────────────────────────────────────────────────────────────

let dragPayload: { event: HealthEvent } | null = null;

// ─── DnD Dialog ───────────────────────────────────────────────────────────────

const DndDialog: React.FC<{
  event: HealthEvent; newDate: string;
  onMove: () => void; onCopy: () => void; onCancel: () => void;
}> = ({ event, newDate, onMove, onCopy, onCancel }) => {
  const config        = TYPE_CONFIG[event.type];
  const formattedDate = parseLocalDate(newDate).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
  const overlayRef = useRef<HTMLDivElement>(null);
  return (
    <div className="cal-modal-overlay dnd-dialog-overlay" ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onCancel(); }}>
      <div className="cal-modal dnd-dialog">
        <div className="cal-modal-stripe" style={{ background: config.color }} />
        <div className="cal-modal-header">
          <div className="cal-modal-title-row">
            <span className="cal-modal-type-chip" style={{ background: config.bg, color: config.color }}>
              <img src={config.icon} alt="" style={{ width: 14, height: 14 }} />
              {event.title}
            </span>
            <h3>Move or copy to {formattedDate}?</h3>
          </div>
          <button className="cal-modal-close" onClick={onCancel} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="dnd-dialog-body">
          <p className="dnd-dialog-hint">
            Choose whether to <strong>move</strong> the event to the new date, or keep the original and create a <strong>copy</strong>.
          </p>
          <div className="dnd-dialog-actions">
            <button className="dnd-btn dnd-btn-move" style={{ background: config.color }} onClick={onMove}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Move here
            </button>
            <button className="dnd-btn dnd-btn-copy" style={{ borderColor: config.color, color: config.color }} onClick={onCopy}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="5" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M5 5V3.5A1.5 1.5 0 016.5 2H13a1.5 1.5 0 011.5 1.5V10A1.5 1.5 0 0113 11.5H11.5" stroke="currentColor" strokeWidth="1.6"/>
              </svg>
              Copy here
            </button>
            <button className="dnd-btn dnd-btn-cancel" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Event Form Modal ─────────────────────────────────────────────────────────

const EventForm: React.FC<{
  initial:  { dog_id: string; type: EventType; title: string; due_date: string; notes: string };
  dogs:     DogOption[];
  mode:     "add" | "edit";
  onSubmit: (data: { dog_id: string; type: EventType; title: string; due_date: string; notes: string }) => Promise<void>;
  onClose:  () => void;
}> = ({ initial, dogs, mode, onSubmit, onClose }) => {
  const [form, setForm]       = useState(initial);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const overlayRef            = useRef<HTMLDivElement>(null);

  const handleTypeChange = (type: EventType) => {
    setForm((prev) => {
      const prevDefault = TYPE_CONFIG[prev.type].label;
      const isDefault   = prev.title === "" || prev.title === prevDefault;
      return {
        ...prev, type,
        title: type === "custom"
          ? (prev.type === "custom" ? prev.title : "")
          : (isDefault ? TYPE_CONFIG[type].label : prev.title),
      };
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.dog_id)       e.dog_id   = "Please select a dog";
    if (!form.title.trim()) e.title    = "Title is required";
    if (!form.due_date)     e.due_date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({ ...form, notes: form.notes.trim() || "" });
      onClose();
    } catch (err: any) {
      const msg = err?.message || err?.errors?.[Object.keys(err?.errors ?? {})[0]]
        || (typeof err === "string" ? err : null) || "Something went wrong.";
      setErrors({ general: msg });
    } finally { setLoading(false); }
  };

  const selectedCfg = TYPE_CONFIG[form.type];

  return (
    <div className="cal-modal-overlay" ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="cal-modal">
        <div className="cal-modal-stripe" style={{ background: selectedCfg.color }} />
        <div className="cal-modal-header">
          <div className="cal-modal-title-row">
            <span className="cal-modal-type-chip" style={{ background: selectedCfg.bg, color: selectedCfg.color }}>
              <img src={selectedCfg.icon} alt="" style={{ width: 16, height: 16 }} />
              {selectedCfg.label}
            </span>
            <h3>{mode === "add" ? "New Health Event" : "Edit Health Event"}</h3>
          </div>
          <button className="cal-modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="cal-modal-body">
          {errors.general && <div className="cal-modal-error">{errors.general}</div>}

          {dogs.length > 1 && (
            <div className="cal-form-section">
              <label className="cal-label">Which dog?</label>
              <DogSelector dogs={dogs} selected={form.dog_id} onChange={(id) => setForm({ ...form, dog_id: id })} />
              {errors.dog_id && <span className="cal-field-error">{errors.dog_id}</span>}
            </div>
          )}

          <div className="cal-form-section">
            <label className="cal-label">Event Type</label>
            <div className="cal-type-grid">
              {(Object.keys(TYPE_CONFIG) as EventType[]).map((t) => (
                <button key={t}
                  className={`cal-type-btn ${form.type === t ? "selected" : ""}`}
                  style={form.type === t ? { borderColor: TYPE_CONFIG[t].color, background: TYPE_CONFIG[t].bg } : {}}
                  onClick={() => handleTypeChange(t)}>
                  <img src={TYPE_CONFIG[t].icon} alt="" className="cal-type-icon"
                    style={form.type === t ? { filter: "none" } : {}} />
                  <span className="cal-type-label" style={form.type === t ? { color: TYPE_CONFIG[t].color } : {}}>
                    {TYPE_CONFIG[t].label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="cal-form-section">
            <label className="cal-label">{form.type === "custom" ? "Event Name" : "Title"}</label>
            <input className={`cal-input ${errors.title ? "error" : ""}`}
              value={form.title}
              placeholder={form.type === "custom" ? "e.g. Bath time, Weigh-in…" : `e.g. ${TYPE_CONFIG[form.type].label}`}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus={form.type === "custom"} />
            {errors.title && <span className="cal-field-error">{errors.title}</span>}
          </div>

          <div className="cal-form-section">
            <label className="cal-label">Due Date</label>
            <input className={`cal-input ${errors.due_date ? "error" : ""}`}
              type="date" value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            {errors.due_date && <span className="cal-field-error">{errors.due_date}</span>}
          </div>

          <div className="cal-form-section">
            <label className="cal-label">Notes <span className="cal-optional">(optional)</span></label>
            <textarea className="cal-input cal-textarea" value={form.notes}
              placeholder={form.type === "custom" ? "Add any details…" : "e.g. Rabies booster, Frontline Plus…"}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        <div className="cal-modal-footer">
          <button className="cal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="cal-btn-save" style={{ background: selectedCfg.color }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : mode === "add" ? "Add Event" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Event Pill ───────────────────────────────────────────────────────────────

const EventPill: React.FC<{
  event:       HealthEvent;
  dogs:        DogOption[];
  onClick:     (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
}> = ({ event, dogs, onClick, onDragStart }) => {
  const config    = TYPE_CONFIG[event.type];
  const typeColor = event.completed ? STATUS_COLOR.done : config.color;
  const dogColor  = getDogColor(dogs, event.dog_id);
  const dog       = dogs.find((d) => d.id === event.dog_id);
  const status    = getStatus(event);

  return (
    <button
      className={`cal-pill cal-pill--${status}`}
      style={{
        "--pill-color":     typeColor,
        "--pill-bg":        config.bg,
        "--pill-dog-color": dogColor.color,
        "--pill-dog-bg":    dogColor.bg,
      } as React.CSSProperties}
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
      title={`${event.title}${dog ? ` · ${dog.name}` : ""}`}
    >
      <span className="cal-pill__strip" />
      <span className="cal-pill__icon">
        <img src={config.icon} alt="" />
      </span>
      <span className="cal-pill__title">{event.title}</span>
      {event.completed && <span className="cal-pill__check">✓</span>}
      {dogs.length > 1 && dog && (
        <span className="cal-pill__dog">
          {dog.avatarUrl
            ? <img src={dog.avatarUrl} alt={dog.name} />
            : dog.name.charAt(0).toUpperCase()}
        </span>
      )}
    </button>
  );
};

// ─── Mobile Event Dot ─────────────────────────────────────────────────────────
// Tiny coloured dot used inside month cells on mobile

const EventDot: React.FC<{
  event:   HealthEvent;
  onClick: (e: React.MouseEvent) => void;
}> = ({ event, onClick }) => {
  const color = event.completed ? STATUS_COLOR.done : TYPE_CONFIG[event.type].color;
  return (
    <button
      className="cal-dot"
      style={{ "--dot-color": color } as React.CSSProperties}
      onClick={onClick}
      title={event.title}
      aria-label={event.title}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" width="8" height="8">
        <ellipse cx="6"  cy="7"  rx="2"   ry="2.5"/>
        <ellipse cx="18" cy="7"  rx="2"   ry="2.5"/>
        <ellipse cx="10" cy="4"  rx="2"   ry="2.5"/>
        <ellipse cx="14" cy="4"  rx="2"   ry="2.5"/>
        <path d="M12 10c-3.5 0-6 2.5-6 5.5 0 1.5.5 2.5 1.5 3.5H16.5c1-.5 1.5-2 1.5-3.5C18 12.5 15.5 10 12 10z"/>
      </svg>
    </button>
  );
};

// ─── Event Popover ────────────────────────────────────────────────────────────

const EventPopover: React.FC<{
  event:      HealthEvent;
  dogs:       DogOption[];
  anchor:     { top: number; left: number };
  onClose:    () => void;
  onComplete: (id: string, done: boolean) => void;
  onDelete:   (id: string) => void;
  onEdit:     (event: HealthEvent) => void;
}> = ({ event, dogs, anchor, onClose, onComplete, onDelete, onEdit }) => {
  const isMobile = useIsMobile();
  const status   = getStatus(event);
  const config   = TYPE_CONFIG[event.type];
  const dog      = dogs.find((d) => d.id === event.dog_id);
  const dogColor = getDogColor(dogs, event.dog_id);
  const ref      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const formattedDate = parseLocalDate(event.due_date).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const popover = (
    <div
      ref={ref}
      className="cal-popover"
      // On mobile CSS overrides position to fixed+centred; on desktop use anchor coords
      style={isMobile ? undefined : { top: anchor.top, left: anchor.left }}
    >
      <div className="cal-popover-header" style={{ borderTop: `4px solid ${config.color}` }}>
        <div className="cal-popover-title-row">
          <span className="cal-popover-type-chip" style={{ background: config.bg, color: config.color }}>
            <img src={config.icon} alt="" style={{ width: 13, height: 13 }} />
            {config.label}
          </span>
          <button className="cal-popover-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <h4 className="cal-popover-title">{event.title}</h4>
        {dog && (
          <div className="cal-popover-dog-row">
            <DogAvatar dog={dog} size={18} color={dogColor.color} bg={dogColor.bg} />
            <span style={{ fontSize: "0.78rem", color: dogColor.color, fontWeight: 500 }}>{dog.name}</span>
          </div>
        )}
        <div className="cal-popover-date">📅 {formattedDate}</div>
        {event.notes && <div className="cal-popover-notes">{event.notes}</div>}
        <span className="cal-popover-badge" style={{ background: `${STATUS_COLOR[status]}18`, color: STATUS_COLOR[status] }}>
          {STATUS_LABEL[status]}
        </span>
      </div>
      <div className="cal-popover-actions">
        <button className="cal-popover-btn complete"
          style={{ color: event.completed ? STATUS_COLOR.done : config.color, borderColor: event.completed ? STATUS_COLOR.done : config.color }}
          onClick={() => { onComplete(event.id, !event.completed); onClose(); }}>
          {event.completed ? "✓ Mark Pending" : "✓ Mark Done"}
        </button>
        <button className="cal-popover-btn edit"   onClick={() => { onEdit(event);      onClose(); }}>✎ Edit</button>
        <button className="cal-popover-btn delete" onClick={() => { onDelete(event.id); onClose(); }}>✕ Delete</button>
      </div>
    </div>
  );

  // On mobile: wrap in a full-screen backdrop so tapping outside closes it
  if (isMobile) {
    return (
      <div
        style={{
          position: "fixed", inset: 0,
          background: "rgba(30,27,75,0.4)",
          backdropFilter: "blur(2px)",
          zIndex: 1200,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {popover}
      </div>
    );
  }

  return popover;
};

// ─── Month Grid ───────────────────────────────────────────────────────────────

const MonthGrid: React.FC<{
  events:        HealthEvent[];
  dogs:          DogOption[];
  viewMonth:     Date;
  onChangeMonth: (d: Date) => void;
  onPillClick:   (event: HealthEvent, anchor: { top: number; left: number }) => void;
  onDayClick:    (dateStr: string) => void;
  onDropEvent:   (event: HealthEvent, newDateStr: string) => void;
}> = ({ events, dogs, viewMonth, onChangeMonth, onPillClick, onDayClick, onDropEvent }) => {
  const isMobile = useIsMobile();
  const year     = viewMonth.getFullYear();
  const month    = viewMonth.getMonth();
  const firstDay     = new Date(year, month, 1);
  const lastDay      = new Date(year, month + 1, 0);
  const startOffset  = (firstDay.getDay() + 6) % 7;

  const eventMap: Record<string, HealthEvent[]> = {};
  events.forEach((e) => {
    const key = eventDateKey(e);
    if (!eventMap[key]) eventMap[key] = [];
    eventMap[key].push(e);
  });

  const todayStr = localTodayStr();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const handlePillClick = (e: React.MouseEvent, event: HealthEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    onPillClick(event, { top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
  };

  const handlePillDragStart = (e: React.DragEvent, event: HealthEvent) => {
    dragPayload = { event };
    e.dataTransfer.effectAllowed = "copyMove";
    const ghost = document.createElement("div");
    ghost.textContent = event.title;
    ghost.style.cssText = `position:fixed;top:-100px;left:-100px;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:500;background:${TYPE_CONFIG[event.type].color};color:white;box-shadow:0 4px 12px rgba(0,0,0,0.2);pointer-events:none;`;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    requestAnimationFrame(() => ghost.remove());
  };

  // Max dots on mobile, max pills on desktop
  const MAX_DOTS  = 3;
  const MAX_PILLS = 2;

  return (
    <div className="month-grid-wrapper">
      <div className="month-grid-header">
        <button className="month-nav-btn" onClick={() => onChangeMonth(new Date(year, month - 1, 1))}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="month-grid-title">
          <span className="month-name">{MONTHS[month]}</span>
          <span className="month-year">{year}</span>
        </div>
        <button className="month-nav-btn" onClick={() => onChangeMonth(new Date(year, month + 1, 1))}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {dogs.length > 1 && (
        <div className="cal-dog-legend">
          {dogs.map((dog) => {
            const { color, bg } = getDogColor(dogs, dog.id);
            return (
              <div key={dog.id} className="cal-dog-legend-item">
                <DogAvatar dog={dog} size={18} color={color} bg={bg} />
                <span style={{ color, fontSize: "0.72rem", fontWeight: 500 }}>{dog.name}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="month-grid">
        {DAYS_SHORT.map((d) => (
          <div key={d} className="month-day-label">{isMobile ? d.charAt(0) : d}</div>
        ))}

        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="month-cell empty" />;
          const dateStr    = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEvents  = eventMap[dateStr] || [];
          const isToday    = dateStr === todayStr;
          const isDragOver = dragOverDate === dateStr;

          return (
            <div key={dateStr}
              className={`month-cell ${isToday ? "today" : ""} ${dayEvents.length ? "has-events" : ""} clickable ${isDragOver ? "drag-over" : ""}`}
              onClick={() => onDayClick(dateStr)}
              onDragOver={(e) => { if (!dragPayload) return; e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverDate(dateStr); }}
              onDragLeave={() => setDragOverDate(null)}
              onDrop={(e) => {
                e.preventDefault(); setDragOverDate(null);
                if (!dragPayload) return;
                const { event } = dragPayload; dragPayload = null;
                if (eventDateKey(event) === dateStr) return;
                onDropEvent(event, dateStr);
              }}
              title={`Add event on ${day} ${MONTHS_SHORT[month]}`}>

              <span className={`month-cell-day ${isToday ? "today-badge" : ""}`}>{day}</span>

              {/* ── Mobile: dots only ── */}
              {isMobile ? (
                <div className="month-cell-dots">
                  {dayEvents.slice(0, MAX_DOTS).map((ev) => (
                    <EventDot key={ev.id} event={ev}
                      onClick={(e) => { e.stopPropagation(); handlePillClick(e, ev); }} />
                  ))}
                  {dayEvents.length > MAX_DOTS && (
                    <span className="month-cell-dots-more">+{dayEvents.length - MAX_DOTS}</span>
                  )}
                </div>
              ) : (
                /* ── Desktop: full pills ── */
                <div className="month-cell-events">
                  {dayEvents.slice(0, MAX_PILLS).map((ev) => (
                    <EventPill key={ev.id} event={ev} dogs={dogs}
                      onClick={(e) => handlePillClick(e, ev)}
                      onDragStart={(e) => handlePillDragStart(e, ev)} />
                  ))}
                  {dayEvents.length > MAX_PILLS && (
                    <span className="month-cell-more">+{dayEvents.length - MAX_PILLS} more</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Year View ────────────────────────────────────────────────────────────────
// Shows all 12 months as a compact mini-grid. Clicking a month navigates to it.

const YearView: React.FC<{
  events:        HealthEvent[];
  viewYear:      number;
  onChangeYear:  (y: number) => void;
  onMonthClick:  (month: Date) => void;  // navigate to month view on that month
}> = ({ events, viewYear, onChangeYear, onMonthClick }) => {
  const todayStr = localTodayStr();

  // Build a set of date keys with events for quick lookup
  const eventDates = new Set(events.map(eventDateKey));
  const overdueSet = new Set(
    events.filter((e) => getStatus(e) === "overdue").map(eventDateKey)
  );
  const soonSet = new Set(
    events.filter((e) => getStatus(e) === "soon").map(eventDateKey)
  );

  return (
    <div className="year-view">
      {/* Year navigation */}
      <div className="year-nav">
        <button className="month-nav-btn" onClick={() => onChangeYear(viewYear - 1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="year-nav-label">{viewYear}</span>
        <button className="month-nav-btn" onClick={() => onChangeYear(viewYear + 1)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* 12 mini month grids */}
      <div className="year-grid">
        {Array.from({ length: 12 }, (_, monthIdx) => {
          const firstDay    = new Date(viewYear, monthIdx, 1);
          const lastDay     = new Date(viewYear, monthIdx + 1, 0);
          const startOffset = (firstDay.getDay() + 6) % 7;
          const cells: (number | null)[] = [
            ...Array(startOffset).fill(null),
            ...Array.from({ length: lastDay.getDate() }, (_, i) => i + 1),
          ];
          while (cells.length % 7 !== 0) cells.push(null);

          // Count events this month
          const monthEvents = events.filter((e) => {
            const key = eventDateKey(e);
            return key.startsWith(`${viewYear}-${String(monthIdx + 1).padStart(2, "0")}`);
          });

          return (
            <div
              key={monthIdx}
              className="mini-month"
              onClick={() => onMonthClick(new Date(viewYear, monthIdx, 1))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onMonthClick(new Date(viewYear, monthIdx, 1))}
              aria-label={`View ${MONTHS[monthIdx]} ${viewYear}`}
            >
              {/* Month title + event count badge */}
              <div className="mini-month-header">
                <span className="mini-month-name">{MONTHS_SHORT[monthIdx]}</span>
                {monthEvents.length > 0 && (
                  <span className="mini-month-count"
                    style={{
                      background: monthEvents.some((e) => getStatus(e) === "overdue")
                        ? `${STATUS_COLOR.overdue}18`
                        : monthEvents.some((e) => getStatus(e) === "soon")
                          ? `${STATUS_COLOR.soon}18`
                          : `${STATUS_COLOR.upcoming}18`,
                      color: monthEvents.some((e) => getStatus(e) === "overdue")
                        ? STATUS_COLOR.overdue
                        : monthEvents.some((e) => getStatus(e) === "soon")
                          ? STATUS_COLOR.soon
                          : STATUS_COLOR.upcoming,
                    }}>
                    {monthEvents.length}
                  </span>
                )}
              </div>

              {/* Mini day-of-week labels */}
              <div className="mini-month-grid">
                {"MTWTFSS".split("").map((d, di) => (
                  <div key={di} className="mini-day-label">{d}</div>
                ))}

                {cells.map((day, ci) => {
                  if (!day) return <div key={`e-${ci}`} className="mini-cell empty" />;
                  const dateStr = `${viewYear}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isToday   = dateStr === todayStr;
                  const hasEvent  = eventDates.has(dateStr);
                  const isOverdue = overdueSet.has(dateStr);
                  const isSoon    = soonSet.has(dateStr);

                  return (
                    <div key={dateStr}
                      className={`mini-cell ${isToday ? "today" : ""} ${hasEvent ? "has-event" : ""}`}
                      style={
                        hasEvent
                          ? {
                              "--mini-dot-color": isOverdue
                                ? STATUS_COLOR.overdue
                                : isSoon
                                  ? STATUS_COLOR.soon
                                  : STATUS_COLOR.upcoming,
                            } as React.CSSProperties
                          : undefined
                      }
                      title={hasEvent ? `Events on ${day} ${MONTHS_SHORT[monthIdx]}` : undefined}>
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Day View ─────────────────────────────────────────────────────────────────
// Full-screen daily breakdown — shown when user taps a date in month grid

const DayView: React.FC<{
  date:       string;           // "YYYY-MM-DD"
  events:     HealthEvent[];    // ALL events (unfiltered) so we show everything for this day
  dogs:       DogOption[];
  onBack:     () => void;
  onAdd:      (date: string) => void;
  onComplete: (id: string, done: boolean) => void;
  onDelete:   (id: string) => void;
  onEdit:     (event: HealthEvent) => void;
}> = ({ date, events, dogs, onBack, onAdd, onComplete, onDelete, onEdit }) => {
  const dayEvents = events.filter((e) => eventDateKey(e) === date);

  const parsed = parseLocalDate(date);
  const isMobile = useIsMobile();
  const formattedDate = parsed.toLocaleDateString("en-GB", isMobile
    ? { weekday: "short", day: "numeric", month: "short", year: "numeric" }
    : { weekday: "long",  day: "numeric", month: "long",  year: "numeric" }
  );
  const isToday = date === localTodayStr();

  // Group by status
  const groups: Record<Status, HealthEvent[]> = {
    overdue:  dayEvents.filter((e) => getStatus(e) === "overdue"),
    soon:     dayEvents.filter((e) => getStatus(e) === "soon"),
    upcoming: dayEvents.filter((e) => getStatus(e) === "upcoming"),
    done:     dayEvents.filter((e) => getStatus(e) === "done"),
  };

  return (
    <div className="day-view">
      {/* Header */}
      <div className="day-view-header">
        <button className="day-view-back" onClick={onBack} aria-label="Back to calendar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <div className="day-view-title-wrap">
          <h2 className="day-view-title">
            {isToday && <span className="day-view-today-chip">Today</span>}
            {formattedDate}
          </h2>
          <span className="day-view-count">
            {dayEvents.length === 0
              ? "No events"
              : `${dayEvents.length} event${dayEvents.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        <button className="day-view-add-btn" onClick={() => onAdd(date)}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add Event
        </button>
      </div>

      {/* Empty state */}
      {dayEvents.length === 0 && (
        <div className="day-view-empty">
          <span className="day-view-empty-icon">🐾</span>
          <p>No events on this day</p>
          <button className="day-view-empty-add" onClick={() => onAdd(date)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add your first event
          </button>
        </div>
      )}

      {/* Events grouped by status */}
      {dayEvents.length > 0 && (
        <div className="day-view-groups">
          {(["overdue", "soon", "upcoming", "done"] as Status[]).map((status) => {
            const group = groups[status];
            if (!group.length) return null;
            return (
              <div key={status} className="day-view-group">
                <div className="day-view-group-header">
                  <span className="day-view-status-dot" style={{ background: STATUS_COLOR[status] }} />
                  <span className="day-view-status-label" style={{ color: STATUS_COLOR[status] }}>
                    {STATUS_LABEL[status]}
                  </span>
                  <span className="day-view-group-count">{group.length}</span>
                </div>

                {group.map((event) => {
                  const config   = TYPE_CONFIG[event.type];
                  const dog      = dogs.find((d) => d.id === event.dog_id);
                  const dogColor = getDogColor(dogs, event.dog_id);

                  return (
                    <div
                      key={event.id}
                      className={`day-view-card ${event.completed ? "done" : ""}`}
                      style={{ borderLeft: `4px solid ${event.completed ? STATUS_COLOR.done : config.color}` }}
                    >
                      {/* Icon */}
                      <div className="day-view-card-icon" style={{ background: config.bg }}>
                        <img src={config.icon} alt="" style={{ width: 22, height: 22 }} />
                      </div>

                      {/* Info */}
                      <div className="day-view-card-info">
                        <span className="day-view-card-title">{event.title}</span>
                        <div className="day-view-card-meta">
                          <span className="day-view-card-type"
                            style={{ background: config.bg, color: config.color }}>
                            {config.label}
                          </span>
                          {dog && dogs.length > 1 && (
                            <span className="day-view-card-dog"
                              style={{ background: dogColor.bg, color: dogColor.color, border: `1px solid ${dogColor.color}30` }}>
                              <DogAvatar dog={dog} size={12} color={dogColor.color} bg={dogColor.bg} />
                              {dog.name}
                            </span>
                          )}
                        </div>
                        {event.notes && (
                          <span className="day-view-card-notes">{event.notes}</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="day-view-card-actions">
                        <button
                          className={`day-view-complete-btn ${event.completed ? "is-done" : ""}`}
                          style={{
                            color:       event.completed ? STATUS_COLOR.done : config.color,
                            borderColor: event.completed ? STATUS_COLOR.done : config.color,
                            background:  event.completed ? `${STATUS_COLOR.done}12` : `${config.color}0d`,
                          }}
                          onClick={() => onComplete(event.id, !event.completed)}
                        >
                          {event.completed ? "✓ Done" : "Mark Done"}
                        </button>
                        <button className="day-view-icon-btn edit"   onClick={() => onEdit(event)}      title="Edit">✎</button>
                        <button className="day-view-icon-btn delete" onClick={() => onDelete(event.id)} title="Delete">✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Agenda List ──────────────────────────────────────────────────────────────

const AgendaList: React.FC<{
  events:     HealthEvent[];
  dogs:       DogOption[];
  onComplete: (id: string, done: boolean) => void;
  onDelete:   (id: string) => void;
  onEdit:     (event: HealthEvent) => void;
}> = ({ events, dogs, onComplete, onDelete, onEdit }) => {
  const groups = {
    overdue:  events.filter((e) => getStatus(e) === "overdue"),
    soon:     events.filter((e) => getStatus(e) === "soon"),
    upcoming: events.filter((e) => getStatus(e) === "upcoming"),
    done:     events.filter((e) => getStatus(e) === "done"),
  };

  if (events.length === 0) {
    return (
      <div className="cal-empty">
        <div className="cal-empty-icon">🐾</div>
        <p>No events match your filters</p>
      </div>
    );
  }

  return (
    <div className="agenda-list">
      {(["overdue", "soon", "upcoming", "done"] as Status[]).map((status) => {
        const group = groups[status];
        if (!group.length) return null;
        return (
          <div key={status} className="agenda-group">
            <div className="agenda-group-header">
              <span className="agenda-status-dot" style={{ background: STATUS_COLOR[status] }} />
              <span className="agenda-group-label" style={{ color: STATUS_COLOR[status] }}>{STATUS_LABEL[status]}</span>
              <span className="agenda-group-count">{group.length}</span>
            </div>
            {group.map((event) => {
              const config        = TYPE_CONFIG[event.type];
              const dog           = dogs.find((d) => d.id === event.dog_id);
              const dogColor      = getDogColor(dogs, event.dog_id);
              const formattedDate = parseLocalDate(event.due_date).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
              });
              return (
                <div key={event.id}
                  className={`agenda-card ${event.completed ? "done" : ""}`}
                  style={{ borderLeft: `3px solid ${event.completed ? STATUS_COLOR.done : config.color}` }}>
                  <div className="agenda-card-icon" style={{ background: config.bg }}>
                    <img src={config.icon} alt="" style={{ width: 18, height: 18 }} />
                  </div>
                  <div className="agenda-card-info">
                    <span className="agenda-card-title">{event.title}</span>
                    <div className="agenda-card-meta">
                      <span className="agenda-card-date">{formattedDate}</span>
                      {dog && dogs.length > 1 && (
                        <span className="agenda-card-dog-tag"
                          style={{ background: dogColor.bg, color: dogColor.color, border: `1px solid ${dogColor.color}40` }}>
                          <DogAvatar dog={dog} size={12} color={dogColor.color} bg={dogColor.bg} />
                          {dog.name}
                        </span>
                      )}
                      {event.notes && <span className="agenda-card-notes">{event.notes}</span>}
                    </div>
                  </div>
                  <div className="agenda-card-actions">
                    <button className={`agenda-complete-btn ${event.completed ? "done" : ""}`}
                      style={{ color: event.completed ? STATUS_COLOR.done : config.color, borderColor: event.completed ? STATUS_COLOR.done : config.color, background: event.completed ? `${STATUS_COLOR.done}12` : `${config.color}10` }}
                      onClick={() => onComplete(event.id, !event.completed)}>
                      {event.completed ? "✓ Done" : "Mark Done"}
                    </button>
                    <button className="agenda-icon-btn edit"   onClick={() => onEdit(event)}      title="Edit">✎</button>
                    <button className="agenda-icon-btn delete" onClick={() => onDelete(event.id)} title="Delete">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const StatsBar: React.FC<{ events: HealthEvent[] }> = ({ events }) => {
  const counts = { overdue: 0, soon: 0, upcoming: 0, done: 0 };
  events.forEach((e) => { counts[getStatus(e)]++; });
  return (
    <div className="cal-stats-bar">
      {(["overdue", "soon", "upcoming", "done"] as Status[]).map((s) => (
        <div key={s} className="cal-stat-item">
          <span className="cal-stat-dot"  style={{ background: STATUS_COLOR[s] }} />
          <span className="cal-stat-num"  style={{ color: STATUS_COLOR[s] }}>{counts[s]}</span>
          <span className="cal-stat-lbl">{STATUS_LABEL[s]}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const BuddyCalendar: React.FC<{
  dogName?: string;
  allDogs?: DogOption[];
}> = ({ dogName = "Your Dog", allDogs = [] }) => {
  const { token } = useAuth();

  const [events,       setEvents]       = useState<HealthEvent[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [modalMode,    setModalMode]    = useState<"add" | "edit" | null>(null);
  const [editingEvent, setEditingEvent] = useState<HealthEvent | null>(null);
  const [viewMonth,    setViewMonth]    = useState(new Date());
  const [viewYear,     setViewYear]     = useState(new Date().getFullYear());
  const [view,         setView]         = useState<"month" | "year" | "agenda">("month");
  const [dayView,      setDayView]      = useState<string | null>(null); // "YYYY-MM-DD" or null
  const [filterType,   setFilterType]   = useState<EventType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterDog,    setFilterDog]    = useState<string | "all">("all");
  const [showFilters,  setShowFilters]  = useState(false);
  const [popover,      setPopover]      = useState<{ event: HealthEvent; anchor: { top: number; left: number } } | null>(null);
  const [addDate,      setAddDate]      = useState("");
  const [dndPending,   setDndPending]   = useState<{ event: HealthEvent; newDate: string } | null>(null);

  const defaultDogId = allDogs.find((d) => d.isMain)?.id ?? allDogs[0]?.id ?? "";

  useEffect(() => {
    if (!token) return;
    getHealthEvents(token)
      .then(({ events }) => setEvents(events))
      .catch(() => setError("Failed to load health events"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAdd = async (data: { dog_id: string; type: EventType; title: string; due_date: string; notes: string }) => {
    if (!token) return;
    const res = await addHealthEvent(token, {
      dog_id:   data.dog_id,
      type:     data.type,
      title:    data.title.trim(),
      due_date: data.due_date,
      ...(data.notes.trim() ? { notes: data.notes.trim() } : {}),
    });
    setEvents((prev) => [...prev, res.event].sort((a, b) => a.due_date.localeCompare(b.due_date)));
  };

  const handleEdit = async (data: { dog_id: string; type: EventType; title: string; due_date: string; notes: string }) => {
    if (!token || !editingEvent) return;
    const res = await editHealthEvent(token, editingEvent.id, {
      dog_id:   data.dog_id,
      title:    data.title.trim(),
      due_date: data.due_date,
      notes:    data.notes.trim() || "",
    });
    setEvents((prev) =>
      prev.map((e) => e.id === editingEvent.id ? res.event : e)
        .sort((a, b) => a.due_date.localeCompare(b.due_date))
    );
  };

  const handleComplete = async (id: string, completed: boolean) => {
    if (!token) return;
    const res = await completeHealthEvent(token, id, completed);
    setEvents((prev) => prev.map((e) => e.id === id ? res.event : e));
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    await deleteHealthEvent(token, id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleDropEvent = (event: HealthEvent, newDate: string) => setDndPending({ event, newDate });

  const handleDndMove = async () => {
    if (!dndPending || !token) return;
    const { event, newDate } = dndPending;
    setDndPending(null);
    try {
      const res = await editHealthEvent(token, event.id, { title: event.title, due_date: newDate, notes: event.notes || "" });
      setEvents((prev) => prev.map((e) => e.id === event.id ? res.event : e).sort((a, b) => a.due_date.localeCompare(b.due_date)));
    } catch {}
  };

  const handleDndCopy = async () => {
    if (!dndPending || !token) return;
    const { event, newDate } = dndPending;
    setDndPending(null);
    try {
      const res = await addHealthEvent(token, { dog_id: event.dog_id, type: event.type, title: event.title, due_date: newDate, ...(event.notes ? { notes: event.notes } : {}) });
      setEvents((prev) => [...prev, res.event].sort((a, b) => a.due_date.localeCompare(b.due_date)));
    } catch {}
  };

  const openAdd  = (date?: string) => { setAddDate(date || ""); setEditingEvent(null); setModalMode("add"); };
  const openEdit = (event: HealthEvent) => { setEditingEvent(event); setModalMode("edit"); };

  // When clicking a month in year view, switch to month view on that month
  const handleYearMonthClick = (month: Date) => {
    setViewMonth(month);
    setView("month");
  };

  const filtered = events.filter((e) => {
    if (filterType   !== "all" && e.type       !== filterType)   return false;
    if (filterStatus !== "all" && getStatus(e) !== filterStatus) return false;
    if (filterDog    !== "all" && e.dog_id     !== filterDog)    return false;
    return true;
  });

  const hasFilter = filterType !== "all" || filterStatus !== "all" || filterDog !== "all";

  if (loading) return <div className="cal-loading">Loading calendar…</div>;
  if (error)   return <div className="cal-loading" style={{ color: "#ef4444" }}>{error}</div>;

  return (
    <div className="buddy-calendar">

      {/* Top bar */}
      <div className="cal-topbar">
        <div className="cal-topbar-left">
          <div className="cal-logo-area">
            <div>
              <h1 className="cal-title">Health Calendar</h1>
              <p className="cal-sub">Track vaccines, treatments &amp; appointments for your buddies!</p>
            </div>
          </div>
        </div>
        <div className="cal-topbar-right">
          <StatsBar events={events} />
          <button className="cal-add-btn" onClick={() => openAdd()}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add Event
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="cal-toolbar">
        <div className="cal-view-toggle">
          {/* Month */}
          <button className={`view-btn ${view === "month" ? "active" : ""}`} onClick={() => { setView("month"); setDayView(null); }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Month
          </button>
          {/* Year */}
          <button className={`view-btn ${view === "year" ? "active" : ""}`} onClick={() => { setView("year"); setDayView(null); }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="6" y="1" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="11" y="1" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="1" y="6" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="6" y="6" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="11" y="6" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="1" y="11" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="6" y="11" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="11" y="11" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
            Year
          </button>
          {/* Agenda */}
          <button className={`view-btn ${view === "agenda" ? "active" : ""}`} onClick={() => { setView("agenda"); setDayView(null); }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Agenda
          </button>
        </div>

        <div className="cal-toolbar-right">
          <button className={`cal-filter-toggle ${showFilters ? "active" : ""} ${hasFilter ? "has-filter" : ""}`}
            onClick={() => setShowFilters(!showFilters)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M1 3h14M4 8h8M7 13h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Filters {hasFilter && <span className="filter-dot" />}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="cal-filters-panel">
          {allDogs.length > 1 && (
            <div className="cal-filter-group">
              <span className="cal-filter-title">Dog</span>
              <div className="cal-filter-btns">
                <button className={`cal-filter-btn ${filterDog === "all" ? "active" : ""}`} onClick={() => setFilterDog("all")}>All dogs</button>
                {allDogs.map((dog) => {
                  const { color, bg } = getDogColor(allDogs, dog.id);
                  return (
                    <button key={dog.id}
                      className={`cal-filter-btn ${filterDog === dog.id ? "active" : ""}`}
                      style={filterDog === dog.id ? { borderColor: color, color, background: bg } : {}}
                      onClick={() => setFilterDog(filterDog === dog.id ? "all" : dog.id)}>
                      <DogAvatar dog={dog} size={14} color={color} bg={bg} />
                      {dog.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="cal-filter-group">
            <span className="cal-filter-title">Type</span>
            <div className="cal-filter-btns">
              <button className={`cal-filter-btn ${filterType === "all" ? "active" : ""}`} onClick={() => setFilterType("all")}>All</button>
              {(Object.keys(TYPE_CONFIG) as EventType[]).map((t) => (
                <button key={t}
                  className={`cal-filter-btn ${filterType === t ? "active" : ""}`}
                  style={filterType === t ? { borderColor: TYPE_CONFIG[t].color, color: TYPE_CONFIG[t].color, background: TYPE_CONFIG[t].bg } : {}}
                  onClick={() => setFilterType(filterType === t ? "all" : t)}>
                  <img src={TYPE_CONFIG[t].icon} alt="" style={{ width: 13, height: 13 }} />
                  {TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>
          <div className="cal-filter-group">
            <span className="cal-filter-title">Status</span>
            <div className="cal-filter-btns">
              <button className={`cal-filter-btn ${filterStatus === "all" ? "active" : ""}`} onClick={() => setFilterStatus("all")}>All</button>
              {(["overdue", "soon", "upcoming", "done"] as Status[]).map((s) => (
                <button key={s}
                  className={`cal-filter-btn ${filterStatus === s ? "active" : ""}`}
                  style={filterStatus === s ? { borderColor: STATUS_COLOR[s], color: STATUS_COLOR[s], background: `${STATUS_COLOR[s]}12` } : {}}
                  onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}>
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
          {hasFilter && (
            <button className="cal-clear-all" onClick={() => { setFilterType("all"); setFilterStatus("all"); setFilterDog("all"); }}>
              ✕ Clear filters
            </button>
          )}
        </div>
      )}

      {/* Main view */}
      <div className="cal-body">
        {/* Daily view — shown when user taps a date */}
        {dayView ? (
          <DayView
            date={dayView}
            events={events}
            dogs={allDogs}
            onBack={() => setDayView(null)}
            onAdd={(date) => { openAdd(date); }}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onEdit={openEdit}
          />
        ) : view === "month" ? (
          <MonthGrid events={filtered} dogs={allDogs} viewMonth={viewMonth} onChangeMonth={setViewMonth}
            onPillClick={(event, anchor) => setPopover({ event, anchor })}
            onDayClick={(dateStr) => setDayView(dateStr)}
            onDropEvent={handleDropEvent} />
        ) : view === "year" ? (
          <YearView events={filtered} viewYear={viewYear} onChangeYear={setViewYear} onMonthClick={handleYearMonthClick} />
        ) : (
          <AgendaList events={filtered} dogs={allDogs} onComplete={handleComplete} onDelete={handleDelete} onEdit={openEdit} />
        )}
      </div>

      {/* Popover */}
      {popover && (
        <EventPopover event={popover.event} dogs={allDogs} anchor={popover.anchor}
          onClose={() => setPopover(null)} onComplete={handleComplete} onDelete={handleDelete} onEdit={openEdit} />
      )}

      {/* DnD dialog */}
      {dndPending && (
        <DndDialog event={dndPending.event} newDate={dndPending.newDate}
          onMove={handleDndMove} onCopy={handleDndCopy} onCancel={() => setDndPending(null)} />
      )}

      {/* Add modal */}
      {modalMode === "add" && token && (
        <EventForm
          initial={{ dog_id: defaultDogId, type: "vaccine", title: "", due_date: addDate, notes: "" }}
          dogs={allDogs}
          mode="add"
          onSubmit={handleAdd}
          onClose={() => setModalMode(null)} />
      )}

      {/* Edit modal */}
      {modalMode === "edit" && editingEvent && token && (
        <EventForm
          initial={{ dog_id: editingEvent.dog_id, type: editingEvent.type, title: editingEvent.title, due_date: editingEvent.due_date.slice(0, 10), notes: editingEvent.notes || "" }}
          dogs={allDogs}
          mode="edit"
          onSubmit={handleEdit}
          onClose={() => { setModalMode(null); setEditingEvent(null); }} />
      )}
    </div>
  );
};

export default BuddyCalendar;