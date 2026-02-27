const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export interface ForumPost {
  id:             string;
  title:          string;
  content?:       string;
  category:       string;
  comments_count: number;
  created_at:     string;
  user_name:      string;
  user_avatar?:   string;
  user_id?:       string;
}

export interface ForumComment {
  id:          string;
  content:     string;
  created_at:  string;
  user_name:   string;
  user_avatar?: string;
  user_id:     string;
}

export interface PostsResponse {
  posts: ForumPost[];
  total: number;
  page:  number;
  limit: number;
}

const authHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const getPosts = async (params?: {
  category?: string;
  search?:   string;
  page?:     number;
}): Promise<PostsResponse> => {
  const q = new URLSearchParams();
  if (params?.category && params.category !== "All") q.set("category", params.category);
  if (params?.search)   q.set("search",   params.search);
  if (params?.page)     q.set("page",     String(params.page));

  const res  = await fetch(`${BASE}/forum/posts?${q}`);
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

export const getPost = async (id: string): Promise<{ post: ForumPost; comments: ForumComment[] }> => {
  const res  = await fetch(`${BASE}/forum/posts/${id}`);
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
};

export const createPost = async (token: string, data: {
  title:    string;
  content:  string;
  category: string;
}): Promise<{ post: ForumPost }> => {
  const res  = await fetch(`${BASE}/forum/posts`, {
    method:  "POST",
    headers: authHeaders(token),
    body:    JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
};

export const deletePost = async (token: string, id: string): Promise<void> => {
  const res = await fetch(`${BASE}/forum/posts/${id}`, {
    method:  "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw await res.json();
};

export const addComment = async (token: string, postId: string, content: string): Promise<{ comment: ForumComment }> => {
  const res  = await fetch(`${BASE}/forum/posts/${postId}/comments`, {
    method:  "POST",
    headers: authHeaders(token),
    body:    JSON.stringify({ content }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
};

export const deleteComment = async (token: string, id: string): Promise<void> => {
  const res = await fetch(`${BASE}/forum/comments/${id}`, {
    method:  "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw await res.json();
};

export const likeComment = async (token: string, commentId: string) => {
  const res = await fetch(`/api/forum/comments/${commentId}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await res.json();
  return res.json();
};

export const unlikeComment = async (token: string, commentId: string) => {
  const res = await fetch(`/api/forum/comments/${commentId}/like`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await res.json();
  return res.json();
};