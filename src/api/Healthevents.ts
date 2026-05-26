const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export type EventType = "vaccine" | "flea_tick" | "worming" | "vet" | "grooming" | "custom";

export interface HealthEvent {
  id:            string;
  dog_id:        string;   
  dog_name?:     string;  
  dog_is_main?:  boolean;
  type:          EventType;
  title:         string;
  notes?:        string;
  due_date:      string; 
  completed:     boolean;
  completed_at?: string;
  created_at:    string;
}

const authRequest = async <T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> => {
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data as T;
};

export const getHealthEvents = (token: string) =>
  authRequest<{ events: HealthEvent[] }>("/health-events", token);

export const addHealthEvent = (token: string, data: {
  type:      EventType;
  title:     string;
  due_date:  string;
  notes?:    string;
  dog_id?:   string;
}) =>
  authRequest<{ event: HealthEvent }>("/health-events", token, {
    method: "POST",
    body:   JSON.stringify(data),
  });

export const completeHealthEvent = (token: string, id: string, completed: boolean) =>
  authRequest<{ event: HealthEvent }>(`/health-events/${id}/complete`, token, {
    method: "PATCH",
    body:   JSON.stringify({ completed }),
  });

export const editHealthEvent = (token: string, id: string, data: {
  title?:    string;
  due_date?: string;
  notes?:    string;
  dog_id?:   string;  
}) =>
  authRequest<{ event: HealthEvent }>(`/health-events/${id}`, token, {
    method: "PATCH",
    body:   JSON.stringify(data),
  });

export const deleteHealthEvent = (token: string, id: string) =>
  authRequest<{ message: string }>(`/health-events/${id}`, token, {
    method: "DELETE",
  });