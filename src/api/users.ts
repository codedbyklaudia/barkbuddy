const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const authRequest = async <T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> => {
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data as T;
};

// Get full profile
export const getProfile = (token: string) =>
  authRequest<{ user: any; dog: any }>("/users/me", token);

// Update user details
export const updateUser = (token: string, data: {
  name?:            string;
  email?:           string;
  currentPassword?: string;
  newPassword?:     string;
}) =>
  authRequest<{ message: string; user: any }>("/users/me", token, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });

// Upload user avatar
export const uploadUserAvatar = (token: string, file: File) => {
  const form = new FormData();
  form.append("avatar", file);
  return authRequest<{ message: string; avatarUrl: string }>("/users/me/avatar", token, {
    method: "POST",
    body:   form,
  });
};

// Update preferences
export const updatePreferences = (token: string, data: {
  emailNotifications?: boolean;
  preferences?:        Record<string, any>;
}) =>
  authRequest<{ message: string }>("/users/me/preferences", token, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });

// Update dog details 
export const updateDog = (token: string, data: {
  name?:        string;
  breed?:       string;
  gender?:      string;
  dob?:         string;
  lifeStage?:   string;
  personality?: string[];
}) =>
  authRequest<{ message: string; dog: any }>("/users/me/dog", token, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });

// Upload dog avatar
export const uploadDogAvatar = (token: string, file: File) => {
  const form = new FormData();
  form.append("avatar", file);
  return authRequest<{ message: string; avatarUrl: string }>("/users/me/dog/avatar", token, {
    method: "POST",
    body:   form,
  });
};

export const getNotifications = async (token: string) => {
  const res = await fetch(`/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await res.json();
  return res.json(); // expects { notifications: AppNotification[] }
};

export const markNotificationsRead = async (token: string, ids: string[]) => {
  const res = await fetch(`/api/notifications/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};