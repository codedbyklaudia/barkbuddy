import React, {
  createContext, useContext, useState,
  useCallback, useEffect, useMemo,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SavedItemType = "tip" | "service";

export interface SavedTip {
  type:     "tip";
  id:       string;
  title:    string;
  summary:  string;
  category: string;        // "grooming" | "health" | "training" | "nutrition"
  icon:     string;        // image path
  savedAt:  number;        // Date.now()
}

export interface SavedService {
  type:        "service";
  id:          string;
  title:       string;
  category:    string;     // e.g. "Grooming", "Vet", "Training"
  address?:    string;
  distance?:   string;
  rating?:     number;
  savedAt:     number;
}

export type SavedItem = SavedTip | SavedService;

// ─── Context shape ────────────────────────────────────────────────────────────

interface SavedContextValue {
  savedItems:  SavedItem[];
  isSaved:     (id: string) => boolean;
  toggleTip:   (tip: Omit<SavedTip,   "type" | "savedAt">) => void;
  toggleService:(svc: Omit<SavedService, "type" | "savedAt">) => void;
  removeSaved: (id: string) => void;
  clearAll:    () => void;
  totalCount:  number;
  tipCount:    number;
  serviceCount: number;
}

const SavedContext = createContext<SavedContextValue | null>(null);

// ─── Storage key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "barkbuddy_saved_items";

function loadFromStorage(): SavedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedItem[];
  } catch {
    return [];
  }
}

function saveToStorage(items: SavedItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage full or unavailable — silently fail
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const SavedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>(loadFromStorage);

  // Persist on every change
  useEffect(() => {
    saveToStorage(savedItems);
  }, [savedItems]);

  const isSaved = useCallback(
    (id: string) => savedItems.some(i => i.id === id),
    [savedItems],
  );

  const toggleTip = useCallback(
    (tip: Omit<SavedTip, "type" | "savedAt">) => {
      setSavedItems(prev => {
        const exists = prev.some(i => i.id === tip.id);
        if (exists) return prev.filter(i => i.id !== tip.id);
        return [{ ...tip, type: "tip", savedAt: Date.now() }, ...prev];
      });
    },
    [],
  );

  const toggleService = useCallback(
    (svc: Omit<SavedService, "type" | "savedAt">) => {
      setSavedItems(prev => {
        const exists = prev.some(i => i.id === svc.id);
        if (exists) return prev.filter(i => i.id !== svc.id);
        return [{ ...svc, type: "service", savedAt: Date.now() }, ...prev];
      });
    },
    [],
  );

  const removeSaved = useCallback(
    (id: string) => setSavedItems(prev => prev.filter(i => i.id !== id)),
    [],
  );

  const clearAll = useCallback(() => setSavedItems([]), []);

  const totalCount   = savedItems.length;
  const tipCount     = savedItems.filter(i => i.type === "tip").length;
  const serviceCount = savedItems.filter(i => i.type === "service").length;

  const value = useMemo<SavedContextValue>(() => ({
    savedItems, isSaved, toggleTip, toggleService,
    removeSaved, clearAll, totalCount, tipCount, serviceCount,
  }), [savedItems, isSaved, toggleTip, toggleService, removeSaved, clearAll,
       totalCount, tipCount, serviceCount]);

  return (
    <SavedContext.Provider value={value}>
      {children}
    </SavedContext.Provider>
  );
};

// Hook 
export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used inside <SavedProvider>");
  return ctx;
}