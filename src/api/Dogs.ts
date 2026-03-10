// ═══════════════════════════════════════════════════════════════════════════════
// PURPOSE: API client for managing dogs (both main and extra)
// ═══════════════════════════════════════════════════════════════════════════════

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export interface DogProfile {
  id:          string;
  name:        string;
  gender:      string;
  breed:       string;
  dob?:        string;
  lifeStage:   string;
  personality: string[];
  avatarUrl?:  string;
}

export interface DogsResponse {
  mainDog: DogProfile | null;
  extraDogs: DogProfile[];
}

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// ─── GET all dogs for current user ───────────────────────────────────────────
export const getAllDogs = async (token: string): Promise<DogsResponse> => {
  const res = await fetch(`${BASE}/dogs`, {
    method: "GET",
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// ─── POST create new extra dog ───────────────────────────────────────────────
export const createExtraDog = async (
  token: string,
  dog: {
    name: string;
    breed: string;
    gender: string;
    dob?: string;
    lifeStage: string;
    personality: string[];
  }
): Promise<{ dog: DogProfile }> => {
  const res = await fetch(`${BASE}/dogs`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(dog),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// ─── PATCH update extra dog ─────────────────────────────────────────────────
export const updateExtraDog = async (
  token: string,
  id: string,
  dog: Partial<DogProfile>
): Promise<{ dog: DogProfile }> => {
  const res = await fetch(`${BASE}/dogs/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(dog),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

// ─── DELETE remove extra dog ────────────────────────────────────────────────
export const deleteExtraDog = async (token: string, id: string): Promise<void> => {
  const res = await fetch(`${BASE}/dogs/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw await res.json();
};

// ─── UPLOAD dog avatar ──────────────────────────────────────────────────────
export const uploadDogAvatarNew = async (
  token: string,
  dogId: string,
  file: File
): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${BASE}/dogs/${dogId}/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};