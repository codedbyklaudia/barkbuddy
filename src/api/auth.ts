const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export interface AuthUser {
  id:              string;
  name:            string;
  email:           string;
  profileComplete: number;
}

export interface AuthDog {
  id:          string;
  name:        string;
  gender:      string;
  breed:       string;
  dob:         string | null;
  lifeStage:   string;
  personality: string[];
  avatarUrl?:  string;
}

export interface RegisterPayload {
  email:           string;
  name:            string;
  password:        string;
  confirmPassword: string;
  dogName:         string;
  dogGender:       string;
  breed:           string;
  dogDob:          string;
  lifeStage:       string;
  personality:     string[];
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token:   string;
  user:    AuthUser;
  dog:     AuthDog;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}

const request = async <T>(endpoint: string, options: RequestInit): Promise<T> => {
  const res  = await fetch(`${BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw data as ApiError;
  return data as T;
};

export const registerUser = (payload: RegisterPayload) =>
  request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload) });

export const loginUser = (payload: LoginPayload) =>
  request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) });

export const getMe = (token: string) =>
  request<{ user: AuthUser; dog: AuthDog }>("/auth/me", {
    method:  "GET",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
  });