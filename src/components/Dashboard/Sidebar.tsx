import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';


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

// Nav config

const NAV_ITEMS = [
  { key: "home",     label: "Dashboard",      icon: IconHome     },
  { key: "dog",      label: "My Dog",         icon: IconDog      },
  { key: "calendar", label: "Buddy Calendar", icon: IconCalendar },
  { key: "settings", label: "Settings",       icon: IconSettings },
  { key: "saved",    label: "Saved",          icon: IconBookmark },
];

// Component 

export const Sidebar: React.FC<{
  active:      string;
  onNav:       (k: string) => void;
  onLogout:    () => void;
  userAvatar?: string;
  userName?:   string;
  savedCount?: number;
}> = ({ active, onNav, onLogout, userAvatar, userName, savedCount = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <aside
      className={`db-sidebar ${expanded ? "expanded" : ""}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* User avatar pill */}
      <div className="db-sidebar-user">
        <div className="db-sidebar-avatar">
          {userAvatar
            ? <img src={userAvatar} alt={userName ?? "User"} />
            : <span>{(userName ?? "U").charAt(0).toUpperCase()}</span>}
        </div>
        <span className="db-sidebar-username">{userName ?? ""}</span>
      </div>

      <div className="db-sidebar-divider" />

      {/* Nav items */}
      <nav className="db-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const NavIcon  = item.icon;
          const isActive = active === item.key;
          const showBadge = item.key === "saved" && savedCount > 0;

          return (
            <button
              key={item.key}
              className={`db-nav-item ${isActive ? "active" : ""}`}
              onClick={() => onNav(item.key)}
              aria-current={isActive ? "page" : undefined}
              title={item.label}
            >
              <span className="db-nav-icon">
                <NavIcon size={19} />
                {/* Badge — only visible when collapsed */}
                {showBadge && !expanded && (
                  <span className="db-nav-badge-dot" aria-label={`${savedCount} saved`} />
                )}
              </span>
              <span className="db-nav-label">
                {item.label}
                {/* Count pill — only visible when expanded */}
                {showBadge && expanded && (
                  <span className="db-nav-badge-pill">{savedCount}</span>
                )}
              </span>
              {isActive && <span className="db-nav-pip" aria-hidden="true" />}
            </button>
          );
        })}
      </nav>

      <div className="db-sidebar-spacer" />

      {/* Go to BarkBuddy */}
      <div className="db-sidebar-divider" />
      <button
        className="db-nav-item db-platform-link"
        onClick={() => navigate('/')}
        title="Go to BarkBuddy"
      >
        <span className="db-nav-icon"><IconPlatform size={19} /></span>
        <span className="db-nav-label">Go to Platform</span>
      </button>

      {/* Logout */}
      <button className="db-nav-item db-logout" onClick={onLogout} title="Log out">
        <span className="db-nav-icon"><IconLogout size={19} /></span>
        <span className="db-nav-label">Log out</span>
      </button>
    </aside>
  );
};

export default Sidebar;