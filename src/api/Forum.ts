const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ForumPost {
  id:            string;
  title:         string;
  content?:      string;
  body?:         string;
  category:      string;
  isPublished?:  boolean;
  commentsCount: number;   // always present — backed by DB column + live count
  createdAt:     string;   // ISO 8601
  updatedAt?:    string;
  userName?:     string;
  userAvatar?:   string;
  userId?:       string;
  likesCount?:   number;
}

export interface ForumComment {
  id:          string;
  content:     string;
  createdAt:   string;     // ISO 8601
  userName:    string;
  userAvatar?: string;
  userId:      string;
  likesCount:  number;
  likedByMe:   boolean;
  parentId?:   string | null;
  replies?:    ForumComment[];
}

export interface PostsResponse {
  posts: ForumPost[];
  total: number;
  page:  number;
  limit: number;
}

// ─── Normaliser ───────────────────────────────────────────────────────────────
// The backend returns a mix of camelCase aliases (createdAt, commentsCount) and
// snake_case passthrough fields (user_name, user_avatar, user_id, likes_count,
// liked_by_me). This function maps everything to a consistent camelCase shape.

const toISO = (val: any): string => {
  if (!val) return new Date().toISOString();
  const s = typeof val === 'string' ? val.replace(' ', 'T') : String(val);
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

const normalisePost = (raw: any): ForumPost => ({
  id:            raw.id,
  title:         raw.title,
  content:       raw.content ?? raw.body,
  category:      raw.category,
  isPublished:   raw.isPublished ?? raw.is_published,
  // commentsCount: prefer live DB column, fall back to snake_case variant
  commentsCount: raw.commentsCount ?? raw.comments_count ?? 0,
  createdAt:     toISO(raw.createdAt ?? raw.created_at),
  updatedAt:     raw.updatedAt ? toISO(raw.updatedAt) : undefined,
  // user fields — backend returns these as snake_case passthrough
  userName:      raw.userName  ?? raw.user_name,
  userAvatar:    raw.userAvatar ?? raw.user_avatar,
  userId:        raw.userId    ?? raw.user_id,
  likesCount:    raw.likesCount ?? raw.likes_count,
});

const normaliseComment = (raw: any): ForumComment => ({
  id:          raw.id,
  content:     raw.content,
  createdAt:   toISO(raw.createdAt ?? raw.created_at),
  userName:    raw.userName  ?? raw.user_name  ?? 'Unknown',
  userAvatar:  raw.userAvatar ?? raw.user_avatar,
  userId:      raw.userId    ?? raw.user_id,
  likesCount:  raw.likesCount ?? raw.likes_count ?? 0,
  likedByMe:   raw.likedByMe ?? raw.liked_by_me ?? false,
  parentId:    raw.parentId  ?? raw.parent_id  ?? null,
  replies:     Array.isArray(raw.replies) ? raw.replies.map(normaliseComment) : [],
});

// ─── Auth header helper ───────────────────────────────────────────────────────

const authHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// ─── Posts ────────────────────────────────────────────────────────────────────

export const getPosts = async (params?: {
  category?: string;
  search?:   string;
  page?:     number;
}): Promise<PostsResponse> => {
  const q = new URLSearchParams();
  if (params?.category && params.category !== "All") q.set("category", params.category);
  if (params?.search) q.set("search", params.search);
  if (params?.page)   q.set("page",   String(params.page));

  const res  = await fetch(`${BASE}/forum/posts?${q}`);
  const data = await res.json();
  if (!res.ok) throw data;

  return {
    posts: (data.posts ?? []).map(normalisePost),
    total: data.total ?? 0,
    page:  data.page  ?? 1,
    limit: data.limit ?? 20,
  };
};

export const getPost = async (
  id: string
): Promise<{ post: ForumPost; comments: ForumComment[] }> => {
  const res  = await fetch(`${BASE}/forum/posts/${id}`);
  const data = await res.json();
  if (!res.ok) throw data;

  return {
    post:     normalisePost(data.post),
    comments: (data.comments ?? []).map(normaliseComment),
  };
};

export const createPost = async (
  token: string,
  data: { title: string; content: string; category: string }
): Promise<{ post: ForumPost }> => {
  const res  = await fetch(`${BASE}/forum/posts`, {
    method:  "POST",
    headers: authHeaders(token),
    body:    JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return { post: normalisePost(json.post) };
};

export const updatePost = async (
  token: string,
  id:    string,
  data:  { title?: string; content?: string; category?: string; isPublished?: boolean }
): Promise<{ post: ForumPost }> => {
  const res = await fetch(`${BASE}/forum/posts/${id}`, {
    method:  "PATCH",
    headers: authHeaders(token),
    body:    JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return { post: normalisePost(json.post) };
};

export const deletePost = async (token: string, id: string): Promise<void> => {
  const res = await fetch(`${BASE}/forum/posts/${id}`, {
    method:  "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw await res.json();
};

export const getMyPosts = async (token: string): Promise<{ posts: ForumPost[] }> => {
  const res  = await fetch(`${BASE}/forum/my-posts`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return { posts: (data.posts ?? []).map(normalisePost) };
};

// ─── Comments ─────────────────────────────────────────────────────────────────

export const addComment = async (
  token:     string,
  postId:    string,
  content:   string,
  parentId?: string,
): Promise<{ comment: ForumComment }> => {
  const res  = await fetch(`${BASE}/forum/posts/${postId}/comments`, {
    method:  "POST",
    headers: authHeaders(token),
    body:    JSON.stringify({ content, parent_id: parentId ?? null }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return { comment: normaliseComment(json.comment) };
};

export const deleteComment = async (token: string, id: string): Promise<void> => {
  const res = await fetch(`${BASE}/forum/comments/${id}`, {
    method:  "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw await res.json();
};

// ─── Likes ────────────────────────────────────────────────────────────────────
// Module-level set prevents double-firing on fast clicks
const likeInProgress = new Set<string>();

export const likeComment = async (
  token:     string,
  commentId: string,
): Promise<{ liked: boolean; likesCount?: number; isDuplicate?: boolean }> => {
  if (likeInProgress.has(commentId)) return { liked: true, isDuplicate: true };
  likeInProgress.add(commentId);
  try {
    const res  = await fetch(`${BASE}/forum/comments/${commentId}/like`, {
      method:  "POST",
      headers: authHeaders(token),
    });
    if (!res.ok) throw await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    const text = await res.text();
    const data = text ? JSON.parse(text) : { liked: true };
    // backend returns likes_count — normalise
    return { liked: true, likesCount: data.likes_count ?? data.likesCount, isDuplicate: data.isDuplicate };
  } finally {
    likeInProgress.delete(commentId);
  }
};

export const unlikeComment = async (
  token:     string,
  commentId: string,
): Promise<{ liked: boolean; likesCount?: number; isDuplicate?: boolean }> => {
  if (likeInProgress.has(commentId)) return { liked: false, isDuplicate: true };
  likeInProgress.add(commentId);
  try {
    const res  = await fetch(`${BASE}/forum/comments/${commentId}/like`, {
      method:  "DELETE",
      headers: authHeaders(token),
    });
    if (!res.ok) throw await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    const text = await res.text();
    const data = text ? JSON.parse(text) : { liked: false };
    return { liked: false, likesCount: data.likes_count ?? data.likesCount, isDuplicate: false };
  } finally {
    likeInProgress.delete(commentId);
  }
};