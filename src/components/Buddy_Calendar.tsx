import React, { useState, useEffect } from "react";
import "./Buddy_Calendar.scss";
import {
  getHealthEvents, addHealthEvent, completeHealthEvent,
  deleteHealthEvent, editHealthEvent,
  type HealthEvent, type EventType,
} from "../api/Healthevents";
import { useAuth } from "../context/AuthContext";

import vaccineIcon from "../../images/icons/vaccine.svg";
import fleaIcon from "../../images/icons/flea.svg";
import wormIcon from "../../images/icons/worming.svg";
import vetIcon from "../../images/icons/care.svg";
import groomingIcon from "../../images/icons/grooming1.svg";
import eventIcon from "../../images/icons/calendar-add.svg";

// Config
const TYPE_CONFIG: Record<EventType, { label: string; icon: string; color: string }> = {
  vaccine:   { label: "Vaccine",         icon: vaccineIcon,  color: "#7c3aed" },
  flea_tick: { label: "Flea & Tick",     icon: fleaIcon,     color: "#0891b2" },
  worming:   { label: "Worming",         icon: wormIcon,     color: "#b45309" },
  vet:       { label: "Vet Appointment", icon: vetIcon,      color: "#be185d" },
  grooming:  { label: "Grooming",        icon: groomingIcon, color: "#059669" },
  custom:    { label: "My Events",       icon: eventIcon,    color: "#b767cd" },
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

//  Status helpers 
type Status = "overdue" | "soon" | "upcoming" | "done";

const getStatus = (event: HealthEvent): Status => {
  if (event.completed) return "done";
  const today    = new Date(); today.setHours(0,0,0,0);
  const due      = new Date(event.due_date); due.setHours(0,0,0,0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)   return "overdue";
  if (diffDays <= 14) return "soon";
  return "upcoming";
};

const STATUS_COLOR: Record<Status, string> = {
  overdue:  "#ef4444",
  soon:     "#f59e0b",
  upcoming: "#a78bfa",
  done:     "#10b981",
};

const STATUS_LABEL: Record<Status, string> = {
  overdue:  "Overdue",
  soon:     "Due Soon",
  upcoming: "Upcoming",
  done:     "Done",
};

// Shared Event Form (used by Add + Edit modals)
const EventForm: React.FC<{
  initial:   { type: EventType; title: string; due_date: string; notes: string };
  token:     string;
  mode:      "add" | "edit";
  onSubmit:  (data: { type: EventType; title: string; due_date: string; notes: string }) => Promise<void>;
  onClose:   () => void;
}> = ({ initial, token, mode, onSubmit, onClose }) => {
  const [form, setForm]       = useState(initial);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleTypeChange = (type: EventType) =>
    setForm((prev) => ({
      ...prev,
      type,
      title: prev.title === "" || Object.values(TYPE_CONFIG).some(c => c.label === prev.title)
        ? TYPE_CONFIG[type].label
        : prev.title,
    }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title    = "Title is required";
    if (!form.due_date)     e.due_date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      setErrors({ general: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cal-modal-overlay" onClick={onClose}>
      <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cal-modal-header">
          <h3>{mode === "add" ? "Add Health Event" : "Edit Health Event"}</h3>
          <button className="cal-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="cal-modal-body">
          {errors.general && <div className="cal-modal-error">{errors.general}</div>}

          <label className="cal-label">Event Type</label>
          <div className="cal-type-grid">
            {(Object.keys(TYPE_CONFIG) as EventType[]).map((t) => (
              <button
                key={t}
                className={`cal-type-btn ${form.type === t ? "selected" : ""}`}
                style={
                  form.type === t
                    ? {
                        borderColor: TYPE_CONFIG[t].color,
                        background: `${TYPE_CONFIG[t].color}15`,
                      }
                    : {}
                }
                onClick={() => handleTypeChange(t)}
              >
                <img
                  src={TYPE_CONFIG[t].icon}
                  alt={TYPE_CONFIG[t].label}
                  className="cal-type-icon"
                />
                <span className="cal-type-label">
                  {TYPE_CONFIG[t].label}
                </span>
              </button>
            ))}
          </div>

          <label className="cal-label">Title</label>
          <input
            className={`cal-input ${errors.title ? "error" : ""}`}
            value={form.title}
            placeholder={`e.g. ${TYPE_CONFIG[form.type].label}`}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          {errors.title && <span className="cal-field-error">{errors.title}</span>}

          <label className="cal-label">Due Date</label>
          <input
            className={`cal-input ${errors.due_date ? "error" : ""}`}
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
          {errors.due_date && <span className="cal-field-error">{errors.due_date}</span>}

          <label className="cal-label">Notes <span className="cal-optional">(optional)</span></label>
          <textarea
            className="cal-input cal-textarea"
            value={form.notes}
            placeholder="e.g. Rabies booster, Frontline Plus..."
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <div className="cal-modal-footer">
          <button className="cal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="cal-btn-save" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : mode === "add" ? "Add Event" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Event Card
const EventCard: React.FC<{
  event:      HealthEvent;
  onComplete: (id: string, done: boolean) => void;
  onDelete:   (id: string) => void;
  onEdit:     (event: HealthEvent) => void;
}> = ({ event, onComplete, onDelete, onEdit }) => {
  const status      = getStatus(event);
  const config      = TYPE_CONFIG[event.type];
  const statusColor = STATUS_COLOR[status];

  const formattedDate = new Date(event.due_date).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className={`event-card ${event.completed ? "completed" : ""}`} style={{ borderLeftColor: statusColor }}>
      <div className="event-card-left">
        <img
          src={config.icon}
          alt={config.label}
          className="event-icon"
        />
        <div className="event-info">
          <span className="event-title">{event.title}</span>
          <span className="event-meta">
            <span className="event-date">📅 {formattedDate}</span>
            {event.notes && <span className="event-notes">{event.notes}</span>}
          </span>
        </div>
      </div>

      <div className="event-card-right">
        <span className="event-status-badge" style={{ background: `${statusColor}18`, color: statusColor }}>
          {STATUS_LABEL[status]}
        </span>
        <div className="event-actions">
          <button
            className={`event-complete-btn ${event.completed ? "undo" : ""}`}
            style={{ borderColor: statusColor, color: event.completed ? "#10b981" : statusColor }}
            onClick={() => onComplete(event.id, !event.completed)}
            title={event.completed ? "Mark as pending" : "Mark as done"}
          >
            {event.completed ? "✓ Done" : "Mark Done"}
          </button>
          <button className="event-icon-btn edit" onClick={() => onEdit(event)} title="Edit">
            ✎
          </button>
          <button className="event-icon-btn delete" onClick={() => onDelete(event.id)} title="Delete">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

// Mini Calendar 
const MiniCalendar: React.FC<{
  events:        HealthEvent[];
  selectedDate:  string;
  onSelectDate:  (d: string) => void;
  viewMonth:     Date;
  onChangeMonth: (d: Date) => void;
}> = ({ events, selectedDate, onSelectDate, viewMonth, onChangeMonth }) => {
  const year  = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const firstDay    = new Date(year, month, 1);
  const lastDay     = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;

  const eventMap: Record<string, Status[]> = {};
  events.forEach((e) => {
    const key = e.due_date.slice(0, 10);
    if (!eventMap[key]) eventMap[key] = [];
    eventMap[key].push(getStatus(e));
  });

  const today    = new Date(); today.setHours(0,0,0,0);
  const todayStr = today.toISOString().slice(0, 10);

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="mini-calendar">
      <div className="mini-cal-header">
        <button className="mini-cal-nav" onClick={() => onChangeMonth(new Date(year, month - 1, 1))}>‹</button>
        <span className="mini-cal-title">{MONTHS[month]} {year}</span>
        <button className="mini-cal-nav" onClick={() => onChangeMonth(new Date(year, month + 1, 1))}>›</button>
      </div>
      <div className="mini-cal-grid">
        {DAYS.map((d) => <div key={d} className="mini-cal-day-label">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateStr  = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const statuses = eventMap[dateStr] || [];
          const isToday    = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const dotColor   = statuses.includes("overdue")  ? STATUS_COLOR.overdue
                           : statuses.includes("soon")     ? STATUS_COLOR.soon
                           : statuses.includes("upcoming") ? STATUS_COLOR.upcoming
                           : statuses.includes("done")     ? STATUS_COLOR.done
                           : null;
          return (
            <button
              key={dateStr}
              className={`mini-cal-cell ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${statuses.length ? "has-events" : ""}`}
              onClick={() => onSelectDate(isSelected ? "" : dateStr)}
            >
              {day}
              {dotColor && <span className="mini-cal-dot" style={{ background: dotColor }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

//  Stats Row 
// const StatsRow: React.FC<{ events: HealthEvent[] }> = ({ events }) => {
//   const counts = { overdue: 0, soon: 0, upcoming: 0, done: 0 };
//   events.forEach((e) => { counts[getStatus(e)]++; });
//   return (
//     <div className="cal-stats-row">
//       {(["overdue","soon","upcoming","done"] as Status[]).map((s) => (
//         <div key={s} className="cal-stat-card" style={{ borderTopColor: STATUS_COLOR[s] }}>
//           <span className="cal-stat-count" style={{ color: STATUS_COLOR[s] }}>{counts[s]}</span>
//           <span className="cal-stat-label">{STATUS_LABEL[s]}</span>
//         </div>
//       ))}
//     </div>
//   );
// };

// Main Calendar 
const BuddyCalendar: React.FC<{ dogName?: string }> = ({ dogName = "Your Dog" }) => {
  const { token } = useAuth();

  const [events,        setEvents]        = useState<HealthEvent[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [modalMode,     setModalMode]     = useState<"add" | "edit" | null>(null);
  const [editingEvent,  setEditingEvent]  = useState<HealthEvent | null>(null);
  const [selectedDate,  setSelectedDate]  = useState("");
  const [viewMonth,     setViewMonth]     = useState(new Date());
  const [filterType,    setFilterType]    = useState<EventType | "all">("all");
  const [filterStatus,  setFilterStatus]  = useState<Status | "all">("all");
  const [showFilters,   setShowFilters]   = useState(false);

  useEffect(() => {
    if (!token) return;
    getHealthEvents(token)
      .then(({ events }) => setEvents(events))
      .catch(() => setError("Failed to load health events"))
      .finally(() => setLoading(false));
  }, [token]);

  // Handlers
  const handleAdd = async (data: { type: EventType; title: string; due_date: string; notes: string }) => {
    if (!token) return;
    const res = await addHealthEvent(token, data);
    setEvents((prev) => [...prev, res.event].sort((a, b) => a.due_date.localeCompare(b.due_date)));
  };

  const handleEdit = async (data: { type: EventType; title: string; due_date: string; notes: string }) => {
    if (!token || !editingEvent) return;
    const res = await editHealthEvent(token, editingEvent.id, data);
    setEvents((prev) => prev.map((e) => e.id === editingEvent.id ? res.event : e)
      .sort((a, b) => a.due_date.localeCompare(b.due_date)));
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

  const openEdit = (event: HealthEvent) => {
    setEditingEvent(event);
    setModalMode("edit");
  };

  const openAdd = () => {
    setEditingEvent(null);
    setModalMode("add");
  };

  // Filter
  const filtered = events.filter((e) => {
    if (selectedDate && e.due_date.slice(0, 10) !== selectedDate) return false;
    if (filterType   !== "all" && e.type    !== filterType)       return false;
    if (filterStatus !== "all" && getStatus(e) !== filterStatus)  return false;
    return true;
  });

  const groups = {
    overdue:  filtered.filter((e) => getStatus(e) === "overdue"),
    soon:     filtered.filter((e) => getStatus(e) === "soon"),
    upcoming: filtered.filter((e) => getStatus(e) === "upcoming"),
    done:     filtered.filter((e) => getStatus(e) === "done"),
  };

  const hasActiveFilter = filterType !== "all" || filterStatus !== "all" || selectedDate !== "";

  if (loading) return <div className="cal-loading">Loading calendar…</div>;
  if (error)   return <div className="cal-loading" style={{ color: "#ef4444" }}>{error}</div>;

  return (
    <div className="buddy-calendar">

      {/* ── Header ── */}
      <div className="cal-header">
        <div>
          <h1 className="cal-title">{dogName}'s Health Calendar</h1>
          <p className="cal-sub">Track vaccines, treatments &amp; appointments</p>
        </div>
        <div className="cal-header-actions">
          <button className={`cal-filter-toggle ${showFilters ? "active" : ""} ${hasActiveFilter ? "has-filter" : ""}`} onClick={() => setShowFilters(!showFilters)}>
            <img src="../../images/icons/filters.svg"></img> Filters {hasActiveFilter && <span className="filter-dot" />}
          </button>
          <button className="cal-add-btn" onClick={openAdd}><img src="../../images/icons/calendar-add.svg" alt="Add" /> Add Event</button>
        </div>
      </div>

      {/* Stats */}
      {/* <StatsRow events={events} /> */}

      {/* Filters (collapsible on mobile) */}
      {showFilters && (
        <div className="cal-filters-panel">
          <div className="cal-filter-group">
            <p className="cal-filter-title">Type</p>
            <div className="cal-filter-btns">
              <button className={`cal-filter-btn ${filterType === "all" ? "active" : ""}`} onClick={() => setFilterType("all")}>All</button>
              {(Object.keys(TYPE_CONFIG) as EventType[]).map((t) => (
                <button key={t} className={`cal-filter-btn ${filterType === t ? "active" : ""}`}
                  style={filterType === t ? { borderColor: TYPE_CONFIG[t].color, color: TYPE_CONFIG[t].color, background: `${TYPE_CONFIG[t].color}12` } : {}}
                  onClick={() => setFilterType(filterType === t ? "all" : t)}>
                  <img
                    src={TYPE_CONFIG[t].icon}
                    alt=""
                    className="filter-icon"
                  />
                  {TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>
          <div className="cal-filter-group">
            <p className="cal-filter-title">Status</p>
            <div className="cal-filter-btns">
              <button className={`cal-filter-btn ${filterStatus === "all" ? "active" : ""}`} onClick={() => setFilterStatus("all")}>All</button>
              {(["overdue","soon","upcoming","done"] as Status[]).map((s) => (
                <button key={s} className={`cal-filter-btn ${filterStatus === s ? "active" : ""}`}
                  style={filterStatus === s ? { borderColor: STATUS_COLOR[s], color: STATUS_COLOR[s], background: `${STATUS_COLOR[s]}12` } : {}}
                  onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}>
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
          {hasActiveFilter && (
            <button className="cal-clear-all" onClick={() => { setFilterType("all"); setFilterStatus("all"); setSelectedDate(""); }}>
              ✕ Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Main layout  */}
      <div className="cal-layout">

        {/* Left: Mini Calendar */}
        <div className="cal-left">
          <MiniCalendar
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            viewMonth={viewMonth}
            onChangeMonth={setViewMonth}
          />
          {selectedDate && (
            <button className="cal-clear-date" onClick={() => setSelectedDate("")}>
              ✕ Clear date filter
            </button>
          )}
        </div>

        {/* Right: Event List */}
        <div className="cal-right">
          {filtered.length === 0 ? (
            <div className="cal-empty">
              <span className="cal-empty-icon">🐾</span>
              <p>{hasActiveFilter ? "No events match your filters" : "No events yet"}</p>
              {!hasActiveFilter && (
                <button className="cal-add-btn-sm" onClick={openAdd}>Add your first event</button>
              )}
            </div>
          ) : (
            <>
              {groups.overdue.length > 0 && (
                <div className="cal-group">
                  <h3 className="cal-group-title" style={{ color: STATUS_COLOR.overdue }}>Overdue ({groups.overdue.length})</h3>
                  {groups.overdue.map((e) => <EventCard key={e.id} event={e} onComplete={handleComplete} onDelete={handleDelete} onEdit={openEdit} />)}
                </div>
              )}
              {groups.soon.length > 0 && (
                <div className="cal-group">
                  <h3 className="cal-group-title" style={{ color: STATUS_COLOR.soon }}>Due Soon ({groups.soon.length})</h3>
                  {groups.soon.map((e) => <EventCard key={e.id} event={e} onComplete={handleComplete} onDelete={handleDelete} onEdit={openEdit} />)}
                </div>
              )}
              {groups.upcoming.length > 0 && (
                <div className="cal-group">
                  <h3 className="cal-group-title" style={{ color: STATUS_COLOR.upcoming }}>Upcoming ({groups.upcoming.length})</h3>
                  {groups.upcoming.map((e) => <EventCard key={e.id} event={e} onComplete={handleComplete} onDelete={handleDelete} onEdit={openEdit} />)}
                </div>
              )}
              {groups.done.length > 0 && (
                <div className="cal-group">
                  <h3 className="cal-group-title" style={{ color: STATUS_COLOR.done }}>Done ({groups.done.length})</h3>
                  {groups.done.map((e) => <EventCard key={e.id} event={e} onComplete={handleComplete} onDelete={handleDelete} onEdit={openEdit} />)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {modalMode === "add" && token && (
        <EventForm
          initial={{ type: "vaccine", title: "", due_date: selectedDate, notes: "" }}
          token={token}
          mode="add"
          onSubmit={handleAdd}
          onClose={() => setModalMode(null)}
        />
      )}
      {modalMode === "edit" && editingEvent && token && (
        <EventForm
          initial={{
            type:     editingEvent.type,
            title:    editingEvent.title,
            due_date: editingEvent.due_date.slice(0, 10),
            notes:    editingEvent.notes || "",
          }}
          token={token}
          mode="edit"
          onSubmit={handleEdit}
          onClose={() => { setModalMode(null); setEditingEvent(null); }}
        />
      )}
    </div>
  );
};

export default BuddyCalendar;