import React, { useState, useEffect, useRef, useCallback } from "react";
import "./CommunityForum.scss";
import { useAuth } from "../context/AuthContext";
import {
  getPosts, getPost, createPost, deletePost, addComment, deleteComment,
  likeComment, unlikeComment,
  type ForumPost, type ForumComment,
} from "../api/Forum";

// Types 
interface ForumCommentWithLikes extends ForumComment {
  likesCount: number;
  likedByMe: boolean;
  parentId?:   string | null;
  replies?:     ForumCommentWithLikes[];
}

interface CommunityForumProps {
  initialPostId?:      string | null;
  initialCommentId?:   string | null;
  onDeepLinkConsumed?: () => void;
  userAvatar?:         string;
  userName?:           string;
}

// Constants
const CATEGORIES = ["All","General","Teething","Travel","Vets","Allergies","Training","Nutrition","Grooming","Dog-friendly","Health","Other"];

const CAT_COLORS: Record<string, { color: string; bg: string }> = {
  General:      { color: "#7c3aed", bg: "#ede9fe" },
  Teething:     { color: "#be185d", bg: "#fce7f3" },
  Travel:       { color: "#0891b2", bg: "#e0f2fe" },
  Vets:         { color: "#ef4444", bg: "#fee2e2" },
  Allergies:    { color: "#d97706", bg: "#fef3c7" },
  Training:     { color: "#059669", bg: "#d1fae5" },
  Nutrition:    { color: "#b45309", bg: "#fef3c7" },
  Grooming:     { color: "#8b5cf6", bg: "#ede9fe" },
  "Dog-friendly": { color: "#0d9488", bg: "#ccfbf1" },
  Health:       { color: "#dc2626", bg: "#fee2e2" },
  Other:        { color: "#6366f1", bg: "#eef2ff" },
};

const getCatStyle = (cat: string) => CAT_COLORS[cat] ?? { color: "#7c3aed", bg: "#ede9fe" };

const formatDate = (d?: string | null) => {
  if (!d) return "";
  // Postgres sometimes returns "2026-03-16 14:22:00" without T — normalise it
  const parsed = new Date(d.replace(" ", "T"));
  if (isNaN(parsed.getTime())) return "";
  const diff = Date.now() - parsed.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days}d ago`;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

// ─── Small components ─────────────────────────────────────────────────────────
const Avatar: React.FC<{ name?: string; url?: string; size?: number }> = ({ name, url, size = 36 }) => (
  <div className="cf-avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
    {url
      ? <img src={url} alt={name ?? "User"} />
      : <span>{(name ?? "?").charAt(0).toUpperCase()}</span>}
  </div>
);

const HeartIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="14" height="14"
    fill={filled ? "currentColor" : "none"} stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

// ─── Compose Box ──────────────────────────────────────────────────────────────
const ComposeBox: React.FC<{
  token: string;
  userAvatar?: string;
  userName?: string;
  onPost: (post: ForumPost) => void;
}> = ({ token, userAvatar, userName, onPost }) => {
  const [open, setOpen]       = useState(false);
  const [form, setForm]       = useState({ title: "", content: "", category: "General" });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const textareaRef           = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (open) textareaRef.current?.focus(); }, [open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim() || form.title.length < 3)      e.title   = "Title must be at least 3 characters";
    if (!form.content.trim() || form.content.length < 10) e.content = "Write a bit more (min 10 chars)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await createPost(token, form);
      onPost(res.post);
      setForm({ title: "", content: "", category: "General" });
      setOpen(false);
    } catch (err: any) {
      setErrors(err.errors ?? { general: err.message || "Something went wrong" });
    } finally { setLoading(false); }
  };

  return (
    <div className={`cf-compose ${open ? "cf-compose--open" : ""}`}>
      {!open && (
        <div className="cf-compose-trigger" onClick={() => setOpen(true)}>
          <Avatar name={userName ?? "U"} url={userAvatar} size={38} />
          <div className="cf-compose-trigger-inner">
            <span className="cf-compose-placeholder">
              What's on your mind? Share with the pack…
            </span>
            <span className="cf-compose-trigger-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M12 5v14M5 12h14"/></svg>
              New post
            </span>
          </div>
        </div>
      )}

      {open && (
        <div className="cf-compose-body">
          {/* Author row */}
          <div className="cf-compose-author-row">
            <Avatar name={userName ?? "U"} url={userAvatar} size={42} />
            <div className="cf-compose-author-info">
              <span className="cf-compose-author-name">{userName ?? "You"}</span>
              {/* Inline category selector */}
              <div className="cf-compose-cat-select">
                <span className="cf-compose-cat-label">Posting in:</span>
                <div className="cf-compose-cats">
                  {CATEGORIES.filter(c => c !== "All").map(c => {
                    const s = getCatStyle(c);
                    return (
                      <button key={c}
                        className={`cf-cat-pill ${form.category === c ? "active" : ""}`}
                        style={form.category === c ? { background: s.bg, color: s.color, borderColor: s.color } : {}}
                        onClick={() => setForm({ ...form, category: c })}>
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <button className="cf-compose-close" onClick={() => { setOpen(false); setErrors({}); }} title="Close">
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {errors.general && <div className="cf-error-banner">{errors.general}</div>}

          <input
            className={`cf-compose-input ${errors.title ? "error" : ""}`}
            placeholder="Give your post a title…"
            value={form.title}
            maxLength={200}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />
          {errors.title && <span className="cf-field-error">{errors.title}</span>}

          <textarea
            ref={textareaRef}
            className={`cf-compose-textarea ${errors.content ? "error" : ""}`}
            placeholder="Share details, ask a question, or offer advice…"
            value={form.content}
            rows={5}
            onChange={e => setForm({ ...form, content: e.target.value })}
          />
          {errors.content && <span className="cf-field-error">{errors.content}</span>}

          <div className="cf-compose-footer">
            <span className="cf-compose-char-count">{form.content.length} chars</span>
            <button className="cf-btn-post" onClick={handleSubmit} disabled={loading}>
              {loading ? "Posting…" : "Post to Forum"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Inline comment thread ────────────────────────────────────────────────────
const InlineComments: React.FC<{
  postId:   string;
  token?:   string;
  userId?:  string;
  targetId?: string | null;
}> = ({ postId, token, userId, targetId }) => {
  const [comments,    setComments]    = useState<ForumCommentWithLikes[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [newComment,  setNewComment]  = useState("");
  const [posting,     setPosting]     = useState(false);
  const [likedIds,    setLikedIds]    = useState<Set<string>>(new Set());
  const [likePending, setLikePending] = useState<Set<string>>(new Set());
  const [replyTo,     setReplyTo]     = useState<ForumCommentWithLikes | null>(null);
  const [replyText,   setReplyText]   = useState("");
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPost(postId).then(({ comments }) => {
      const typed = comments as ForumCommentWithLikes[];
      setComments(typed);
      const all = [...typed, ...typed.flatMap(c => c.replies ?? [])];
      setLikedIds(new Set(all.filter(c => c.likedByMe).map(c => c.id)));
    }).finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    if (targetId && highlightRef.current) {
      setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    }
  }, [targetId, loading]);

  const handleLike = async (id: string) => {
    if (!token || likePending.has(id)) return;
    const isLiked = likedIds.has(id);
    const update  = (list: ForumCommentWithLikes[], d: number): ForumCommentWithLikes[] =>
      list.map(c => c.id === id
        ? { ...c, likesCount: Math.max(0, (c.likesCount ?? 0) + d) }
        : { ...c, replies: update(c.replies ?? [], d) });

    setLikedIds(prev => { const n = new Set(prev); isLiked ? n.delete(id) : n.add(id); return n; });
    setComments(prev => update(prev, isLiked ? -1 : 1));
    setLikePending(prev => new Set(prev).add(id));
    try {
      const res = isLiked ? await unlikeComment(token, id) : await likeComment(token, id);
      if (res?.likesCount !== undefined) {
        setComments(prev => update(prev, 0).map(c =>
          c.id === id ? { ...c, likesCount: res.likesCount ?? 0 }
  : { ...c, replies: (c.replies ?? []).map(r => r.id === id ? { ...r, likesCount: res.likesCount ?? 0 } : r) }
        ));
      }
    } catch {
      setLikedIds(prev => { const n = new Set(prev); isLiked ? n.add(id) : n.delete(id); return n; });
      setComments(prev => update(prev, isLiked ? 1 : -1));
    } finally {
      setLikePending(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleAddComment = async () => {
    if (!token || !newComment.trim()) return;
    setPosting(true);
    try {
      const res = await addComment(token, postId, newComment.trim());
      setComments(prev => [...prev, { ...res.comment, likesCount: 0, likedByMe: false, replies: [] }]);
      setNewComment("");
    } catch { /* silent */ }
    finally { setPosting(false); }
  };

  const handleReply = async (parentId: string) => {
    if (!token || !replyText.trim()) return;
    setPosting(true);
    try {
      const res = await addComment(token, postId, replyText.trim(), parentId);
      setComments(prev => prev.map(c =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies ?? []), { ...res.comment, likesCount: 0, likedByMe: false }] }
          : c
      ));
      setReplyText("");
      setReplyTo(null);
    } catch { /* silent */ }
    finally { setPosting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    await deleteComment(token, id);
    setComments(prev => prev.filter(c => c.id !== id).map(c => ({
      ...c, replies: (c.replies ?? []).filter(r => r.id !== id),
    })));
  };

  const renderComment = (c: ForumCommentWithLikes, isReply = false) => {
    const isLiked   = likedIds.has(c.id);
    const isPending = likePending.has(c.id);
    const isTarget  = targetId === c.id;

    return (
      <div key={c.id}
        ref={isTarget ? highlightRef : undefined}
        className={`cf-comment ${isReply ? "cf-comment--reply" : ""} ${isTarget ? "cf-comment--highlight" : ""}`}>
        <Avatar name={c.userName} url={c.userAvatar} size={isReply ? 22 : 26} />
        <div className="cf-comment-body">
          <div className="cf-comment-header">
            <span className="cf-comment-name">{c.userName}</span>
            <span className="cf-comment-time">{formatDate(c.createdAt)}</span>
            {userId && c.userId === userId && (
              <button className="cf-comment-delete" onClick={() => handleDelete(c.id)} title="Delete">✕</button>
            )}
          </div>
          <p className="cf-comment-text">{c.content}</p>
          <div className="cf-comment-actions">
            <button
              className={`cf-like-btn ${isLiked ? "liked" : ""}`}
              onClick={() => handleLike(c.id)}
              disabled={!token || isPending}>
              <HeartIcon filled={isLiked} />
              <span>{c.likesCount ?? 0}</span>
            </button>
            {!isReply && token && (
              <button className="cf-reply-btn" onClick={() => setReplyTo(replyTo?.id === c.id ? null : c)}>
                Reply
              </button>
            )}
          </div>
          {replyTo?.id === c.id && (
            <div className="cf-reply-box">
              <textarea className="cf-reply-input" placeholder={`Reply to ${c.userName}…`}
                value={replyText} rows={2}
                onChange={e => setReplyText(e.target.value)}
                autoFocus />
              <div className="cf-reply-actions">
                <button className="cf-btn-cancel" onClick={() => { setReplyTo(null); setReplyText(""); }}>Cancel</button>
                <button className="cf-btn-post small" onClick={() => handleReply(c.id)}
                  disabled={posting || !replyText.trim()}>
                  {posting ? "…" : "Reply"}
                </button>
              </div>
            </div>
          )}
          {!isReply && (c.replies ?? []).length > 0 && (
            <div className="cf-replies">
              {(c.replies ?? []).map(r => renderComment(r, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="cf-comments-loading">Loading comments…</div>;

  return (
    <div className="cf-comments">
      {comments.length === 0
        ? <p className="cf-comments-empty">No comments yet — be the first! 🐾</p>
        : <div className="cf-comments-list">{comments.map(c => renderComment(c))}</div>}

      {token ? (
        <div className="cf-comment-compose">
          <textarea className="cf-reply-input" placeholder="Write a comment…"
            value={newComment} rows={2}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleAddComment(); }} />
          <div className="cf-reply-actions">
            <span className="cf-hint">Ctrl + Enter</span>
            <button className="cf-btn-post small" onClick={handleAddComment}
              disabled={posting || !newComment.trim()}>
              {posting ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      ) : (
        <p className="cf-login-prompt">
          <a href="/login">Log in</a> to join the conversation.
        </p>
      )}
    </div>
  );
};

// ─── Feed Card ────────────────────────────────────────────────────────────────
const FeedCard: React.FC<{
  post:       ForumPost;
  token?:     string;
  userId?:    string;
  expanded?:  boolean;
  targetCommentId?: string | null;
  onExpand:   () => void;
  onDelete:   (id: string) => void;
}> = ({ post, token, userId, expanded, targetCommentId, onExpand, onDelete }) => {
  const cat = getCatStyle(post.category);

  return (
    <article
      className={`cf-card ${expanded ? "cf-card--expanded" : ""}`}
      style={{ "--cat-color": cat.color, "--cat-bg": cat.bg } as React.CSSProperties}
    >
      {/* Left accent strip */}
      <div className="cf-card-strip" />

      <div className="cf-card-inner">
        {/* Header */}
        <div className="cf-card-top">
          <Avatar name={post.userName} url={post.userAvatar} size={36} />
          <div className="cf-card-meta">
            <span className="cf-card-author">{post.userName}</span>
            <span className="cf-card-time">{formatDate(post.createdAt)}</span>
          </div>
          <span className="cf-card-cat-badge"
            style={{ background: cat.bg, color: cat.color }}>
            {post.category}
          </span>
          {userId && token && (post as any).userId === userId && (
            <button className="cf-card-delete" onClick={e => { e.stopPropagation(); onDelete(post.id); }}
              title="Delete post">✕</button>
          )}
        </div>

        {/* Title + body */}
        <div className="cf-card-content" onClick={onExpand} style={{ cursor: "pointer" }}>
          <h3 className="cf-card-title">{post.title}</h3>
          <p className={`cf-card-body ${expanded ? "" : "cf-card-body--clamped"}`}>
            {post.content}
          </p>
        </div>

        {/* Footer bar */}
        <div className="cf-card-footer">
          <button className="cf-card-comments-btn" onClick={onExpand}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>{post.commentsCount} {post.commentsCount === 1 ? "comment" : "comments"}</span>
          </button>
          <button className="cf-card-expand-btn" onClick={onExpand}>
            {expanded ? "Collapse" : "Read & reply →"}
          </button>
        </div>

        {/* Inline thread */}
        {expanded && (
          <div className="cf-card-thread">
            <InlineComments
              postId={post.id}
              token={token}
              userId={userId}
              targetId={targetCommentId}
            />
          </div>
        )}
      </div>
    </article>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CommunityForum: React.FC<CommunityForumProps> = ({
  initialPostId,
  initialCommentId,
  onDeepLinkConsumed,
  userAvatar: propUserAvatar,
  userName:   propUserName,
}) => {
  const { token, user } = useAuth();
  const [posts,          setPosts]          = useState<ForumPost[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [search,         setSearch]         = useState("");
  const [searchInput,    setSearchInput]    = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedId,     setExpandedId]     = useState<string | null>(initialPostId ?? null);
  const [targetComment,  setTargetComment]  = useState<string | null>(initialCommentId ?? null);

  // Deep-link: auto-expand the post from notification
  useEffect(() => {
    if (initialPostId) {
      setExpandedId(initialPostId);
      setTargetComment(initialCommentId ?? null);
      onDeepLinkConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPostId]);

  const fetchPosts = useCallback(async (cat: string, q: string) => {
    setLoading(true);
    try {
      const res = await getPosts({ category: cat, search: q });
      setPosts(res.posts);
    } catch { setError("Failed to load posts"); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(activeCategory, search); }, [activeCategory, search, fetchPosts]);

  const handleNewPost = (post: ForumPost) => setPosts(prev => [post, ...prev]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    try { await deletePost(token, id); setPosts(prev => prev.filter(p => p.id !== id)); }
    catch { /* silent */ }
  };

  const handleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
    if (id !== expandedId) setTargetComment(null);
  };

  const userId = (user as any)?.id;

  return (
    <div className="cf-root">

      {/* ── Header ── */}
      <div className="cf-header">
        <div className="cf-header-text">
          <h1 className="cf-title">Community Feed</h1>
          <p className="cf-subtitle">Dog parents helping dog parents</p>
        </div>

        {/* Search */}
        <div className="cf-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="cf-search-input"
            placeholder="Search discussions…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && setSearch(searchInput)}
          />
          {searchInput && (
            <button className="cf-search-clear" onClick={() => { setSearchInput(""); setSearch(""); }}>✕</button>
          )}
        </div>
      </div>

      {/* ── Category filter ── */}
      <div className="cf-cats">
        {CATEGORIES.map(c => {
          const s = getCatStyle(c);
          return (
            <button key={c}
              className={`cf-cat-tab ${activeCategory === c ? "active" : ""}`}
              style={activeCategory === c && c !== "All"
                ? { background: s.bg, color: s.color, borderColor: s.color }
                : activeCategory === c
                  ? {}
                  : {}}
              onClick={() => setActiveCategory(c)}>
              {c}
            </button>
          );
        })}
      </div>

      {/* ── Compose box ── */}
      {token && (
        <ComposeBox
          token={token}
          userAvatar={propUserAvatar ?? (user as any)?.avatarUrl ?? (user as any)?.avatar_url}
          userName={propUserName ?? (user as any)?.name}
          onPost={handleNewPost}
        />
      )}

      {/* ── Feed ── */}
      <div className="cf-feed">
        {loading ? (
          <div className="cf-feed-loading">
            {[1,2,3].map(i => <div key={i} className="cf-skeleton" style={{ animationDelay: `${i * 0.1}s` }} />)}
          </div>
        ) : error ? (
          <div className="cf-feed-error">{error}</div>
        ) : posts.length === 0 ? (
          <div className="cf-feed-empty">
            <div className="cf-empty-paw">🐾</div>
            <p>No discussions yet {search ? `matching "${search}"` : "in this category"}.</p>
            {token && <p className="cf-empty-sub">Be the first to start one!</p>}
          </div>
        ) : (
          posts.map((post, i) => (
            <div key={post.id} style={{ animationDelay: `${i * 0.05}s` }} className="cf-card-wrapper">
              <FeedCard
                post={post}
                token={token ?? undefined}
                userId={userId}
                expanded={expandedId === post.id}
                targetCommentId={expandedId === post.id ? targetComment : null}
                onExpand={() => handleExpand(post.id)}
                onDelete={handleDelete}
              />
            </div>
          ))
        )}
      </div>

      {/* ── Count ── */}
      {!loading && posts.length > 0 && (
        <p className="cf-feed-count">{posts.length} discussion{posts.length !== 1 ? "s" : ""}</p>
      )}
    </div>
  );
};

export default CommunityForum;