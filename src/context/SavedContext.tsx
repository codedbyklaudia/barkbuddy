import React, {
  createContext, useContext, useState,
  useCallback, useEffect, useMemo,
} from "react";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SavedItemType = "tip" | "service";

export interface SavedTip {
  type:     "tip";
  id:       string;        // DB row id (uuid)
  itemId:   string;        // original tip id — used for isSaved checks
  title:    string;
  summary:  string;
  category: string;
  icon:     string;
  savedAt:  number;
}

export interface SavedService {
  type:      "service";
  id:        string;       // DB row id (uuid)
  itemId:    string;       // original service id
  title:     string;
  category:  string;
  address?:  string;
  distance?: string;
  rating?:   number;
  savedAt:   number;
}

export type SavedItem = SavedTip | SavedService;

// ─── Context shape ────────────────────────────────────────────────────────────

interface SavedContextValue {
  savedItems:    SavedItem[];
  loading:       boolean;
  isSaved:       (id: string) => boolean;
  toggleTip:     (tip: Omit<SavedTip,     "type" | "savedAt" | "id"> & { id?: string }) => Promise<void>;
  toggleService: (svc: Omit<SavedService, "type" | "savedAt" | "id"> & { id?: string }) => Promise<void>;
  removeSaved:   (id: string) => Promise<void>;
  clearAll:      () => Promise<void>;
  totalCount:    number;
  tipCount:      number;
  serviceCount:  number;
}

const SavedContext = createContext<SavedContextValue | null>(null);

// ─── Helper — normalise raw DB row → SavedItem ────────────────────────────────
function normaliseItem(raw: any): SavedItem {
  const savedAt = raw.savedAt
    ? (typeof raw.savedAt === "number" ? raw.savedAt : new Date(raw.savedAt).getTime())
    : Date.now();

  const base = {
    id:      raw.id      ?? raw.itemId ?? "",
    itemId:  raw.itemId  ?? raw.id     ?? "",   // handle both shapes
    title:   raw.title   ?? "",
    savedAt,
  };

  if (raw.type === "service") {
    return {
      ...base,
      type:     "service",
      category: raw.category ?? "",
      address:  raw.address,
      distance: raw.distance,
      rating:   raw.rating,
    } as SavedService;
  }

  return {
    ...base,
    type:     "tip",
    summary:  raw.summary  ?? "",
    category: raw.category ?? "",
    icon:     raw.icon     ?? "",
  } as SavedTip;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const SavedProvider: React.FC<{
  children: React.ReactNode;
  token:    string | null;
}> = ({ children, token }) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading]       = useState(false);

  // ── Load from DB ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { setSavedItems([]); return; }
    setLoading(true);
    fetch(`${BASE}/saved`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const items = (data.items ?? []).map(normaliseItem);
        setSavedItems(items);
      })
      .catch(err => console.error("Failed to load saved items:", err))
      .finally(() => setLoading(false));
  }, [token]);

  // ── isSaved — works with both old `id` and new `itemId` ─────────────────
  const isSaved = useCallback(
    (id: string) => savedItems.some(i => i.itemId === id || i.id === id),
    [savedItems],
  );

  // ── Internal save helper ─────────────────────────────────────────────────
  const saveItem = useCallback(async (
    type: "tip" | "service",
    // accepts old shape { id, ... } or new shape { itemId, ... }
    data: Record<string, any>
  ) => {
    if (!token) return;

    // Support both old API (id) and new API (itemId)
    const itemId = data.itemId ?? data.id ?? "";

    const existing = savedItems.find(
      i => i.type === type && (i.itemId === itemId || i.id === itemId)
    );

    if (existing) {
      // ── Unsave ──
      setSavedItems(prev => prev.filter(i => i.id !== existing.id));
      try {
        await fetch(`${BASE}/saved/${existing.id}`, {
          method:  "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        setSavedItems(prev => [...prev, existing]);
      }
    } else {
      // ── Save ──
      const tempId = `temp-${Date.now()}`;
      const optimistic = normaliseItem({ ...data, type, id: tempId, itemId, savedAt: Date.now() });
      setSavedItems(prev => [optimistic, ...prev]);

      try {
        const res = await fetch(`${BASE}/saved`, {
          method:  "POST",
          headers: {
            Authorization:  `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type, itemId, ...data }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Save failed:", err);
          setSavedItems(prev => prev.filter(i => i.id !== tempId));
          return;
        }

        const saved = await res.json();
        setSavedItems(prev => prev.map(i =>
          i.id === tempId ? normaliseItem(saved.item) : i
        ));
      } catch (err) {
        console.error("Save error:", err);
        setSavedItems(prev => prev.filter(i => i.id !== tempId));
      }
    }
  }, [token, savedItems]);

  // ── toggleTip — same signature as old context ────────────────────────────
  const toggleTip = useCallback(
    (tip: Omit<SavedTip, "type" | "savedAt" | "id"> & { id?: string }) =>
      saveItem("tip", tip),
    [saveItem],
  );

  // ── toggleService — same signature as old context ────────────────────────
  const toggleService = useCallback(
    (svc: Omit<SavedService, "type" | "savedAt" | "id"> & { id?: string }) =>
      saveItem("service", svc),
    [saveItem],
  );

  // ── removeSaved ──────────────────────────────────────────────────────────
  const removeSaved = useCallback(async (id: string) => {
    if (!token) return;
    const removed = savedItems.find(i => i.id === id);
    setSavedItems(prev => prev.filter(i => i.id !== id));
    try {
      await fetch(`${BASE}/saved/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      if (removed) setSavedItems(prev => [...prev, removed]);
    }
  }, [token, savedItems]);

  // ── clearAll ─────────────────────────────────────────────────────────────
  const clearAll = useCallback(async () => {
    if (!token) return;
    const backup = savedItems;
    setSavedItems([]);
    try {
      await fetch(`${BASE}/saved`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      setSavedItems(backup);
    }
  }, [token, savedItems]);

  const totalCount   = savedItems.length;
  const tipCount     = savedItems.filter(i => i.type === "tip").length;
  const serviceCount = savedItems.filter(i => i.type === "service").length;

  const value = useMemo<SavedContextValue>(() => ({
    savedItems, loading, isSaved,
    toggleTip, toggleService,
    removeSaved, clearAll,
    totalCount, tipCount, serviceCount,
  }), [savedItems, loading, isSaved, toggleTip, toggleService,
       removeSaved, clearAll, totalCount, tipCount, serviceCount]);

  return (
    <SavedContext.Provider value={value}>
      {children}
    </SavedContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used inside <SavedProvider>");
  return ctx;
}