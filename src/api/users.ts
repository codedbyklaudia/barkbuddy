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

// User profile 
export const getProfile = (token: string) =>
  authRequest<{ user: any; dog: any }>("/users/me", token);

export const updateUser = (token: string, data: {
  name?:            string;
  email?:           string;
  bio?:             string;
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
  return authRequest<{ message: string; avatarUrl: string; profileComplete: number }>(
    "/users/me/avatar", token, { method: "POST", body: form }
  );
};

// Upload user banner (profile background)
export const uploadUserBanner = (token: string, file: File) => {
  const form = new FormData();
  form.append("banner", file);
  return authRequest<{ message: string; bannerUrl: string }>(
    "/users/me/banner", token, { method: "POST", body: form }
  );
};

// Preferences 
export const updatePreferences = (token: string, data: {
  emailNotifications?: boolean;
  preferences?:        Record<string, any>;
}) =>
  authRequest<{ message: string }>("/users/me/preferences", token, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });

// Dog
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

export const uploadDogAvatar = (token: string, file: File) => {
  const form = new FormData();
  form.append("avatar", file);
  return authRequest<{ message: string; avatarUrl: string }>(
    "/users/me/dog/avatar", token, { method: "POST", body: form }
  );
};
export const removeDog = (token: string, dogId: string) =>
  authRequest<{ message: string }>(`/users/me/dogs/${dogId}`, token, {
    method: "DELETE",
  });

// Notifications
export const getNotifications = (token: string) =>
  authRequest<{ notifications: any[]; unread_count: number }>("/notifications", token)
    .then(data => ({
      unread_count: data.unread_count,
      notifications: data.notifications.map((n: any) => ({
        id:             n.id,
        type:           n.type,
        actorName:      n.actor_name,
        actorAvatar:    n.actor_avatar,
        postId:         n.post_id,
        postTitle:      n.post_title,
        commentId:      n.comment_id,
        commentSnippet: n.comment_snippet,
        isRead:         n.is_read,
        createdAt:      n.created_at,
      })),
    }));

export const markNotificationsRead = (token: string, ids: string[]) =>
  authRequest<{ message: string }>("/notifications/read", token, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ ids }),
  });

// Buddies 
export const getBuddies = (token: string) =>
  authRequest<{ buddies: any[]; pendingIn: any[]; pendingOut: any[] }>("/buddies", token);

export const searchUsers = (token: string, q: string) =>
  authRequest<{ users: any[] }>(`/users/search?q=${encodeURIComponent(q)}`, token)
    .then(d => d.users ?? []);

export const sendBuddyRequest = (token: string, userId: string) =>
  authRequest<{ message: string }>("/buddies/request", token, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ userId }),
  });

export const acceptBuddy = (token: string, buddyId: string) =>
  authRequest<{ message: string }>(`/buddies/${buddyId}/accept`, token, {
    method: "POST",
  });

export const removeBuddy = (token: string, buddyId: string) =>
  authRequest<{ message: string }>(`/buddies/${buddyId}`, token, {
    method: "DELETE",
  });

// Forum posts 
export const getMyPosts = (token: string) =>
  authRequest<{ posts: any[] }>("/forum/my-posts", token)
    .then(d => d.posts ?? []);

export const deletePost = (token: string, postId: string) =>
  authRequest<{ message: string }>(`/forum/posts/${postId}`, token, {
    method: "DELETE",
  });

export const updatePost = (token: string, postId: string, data: Record<string, any>) =>
  authRequest<{ post: any }>(`/forum/posts/${postId}`, token, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });