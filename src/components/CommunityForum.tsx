import React, { useState, useEffect, useRef } from "react";
import "./CommunityForum.scss";
import { useAuth } from "../context/AuthContext";
import {
  getPosts, getPost, createPost, deletePost, addComment, deleteComment,
  likeComment, unlikeComment,
  type ForumPost, type ForumComment,
} from "../api/Forum";

// ─── Extended comment type with like fields ────────────────────────────────────
interface ForumCommentWithLikes extends ForumComment {
  likes_count?: number;
  liked_by_me?: boolean;
}

const CATEGORIES = ["All","General","Teething","Travel","Vets","Allergies","Training","Nutrition","Grooming","Dog-friendly","Health","Other"];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, ".");

const UserAvatar: React.FC<{ name: string; url?: string; size?: number }> = ({ name, url, size = 32 }) => (
  <div className="forum-avatar" style={{ width: size, height: size }}>
    {url
      ? <img src={url} alt={name} />
      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width={size * 0.6} height={size * 0.6}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
    }
  </div>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const HeartIcon: React.FC<{ filled?: boolean; size?: number }> = ({ filled, size = 14 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

// ─── New Post Modal ────────────────────────────────────────────────────────────
const NewPostModal: React.FC<{
  token:   string;
  onPost:  (post: ForumPost) => void;
  onClose: () => void;
}> = ({ token, onPost, onClose }) => {
  const [form, setForm]       = useState({ title: "", content: "", category: "General" });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim() || form.title.length < 3)      e.title    = "Title must be at least 3 characters";
    if (!form.content.trim() || form.content.length < 10) e.content  = "Please write a bit more (min 10 chars)";
    if (!form.category)                                   e.category = "Please choose a category";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await createPost(token, form);
      onPost(res.post);
      onClose();
    } catch (err: any) {
      if (err.errors) setErrors(err.errors);
      else setErrors({ general: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forum-modal-overlay" onClick={onClose}>
      <div className="forum-modal" onClick={(e) => e.stopPropagation()}>
        <div className="forum-modal-header">
          <h3>Start a Discussion</h3>
          <button className="forum-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="forum-modal-body">
          {errors.general && <div className="forum-modal-error">{errors.general}</div>}

          <label className="forum-label">Category</label>
          <div className="forum-cat-chips">
            {CATEGORIES.filter(c => c !== "All").map((c) => (
              <button
                key={c}
                className={`forum-cat-chip ${form.category === c ? "selected" : ""}`}
                onClick={() => setForm({ ...form, category: c })}
              >{c}</button>
            ))}
          </div>
          {errors.category && <span className="forum-field-error">{errors.category}</span>}

          <label className="forum-label">Title</label>
          <input
            className={`forum-input ${errors.title ? "error" : ""}`}
            placeholder="What's your question or topic?"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={200}
          />
          {errors.title && <span className="forum-field-error">{errors.title}</span>}

          <label className="forum-label">Description</label>
          <textarea
            className={`forum-input forum-textarea ${errors.content ? "error" : ""}`}
            placeholder="Share more details, context or advice…"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={5}
          />
          {errors.content && <span className="forum-field-error">{errors.content}</span>}
        </div>
        <div className="forum-modal-footer">
          <button className="forum-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="forum-btn-post" onClick={handleSubmit} disabled={loading}>
            {loading ? "Posting…" : "Post Discussion"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Post Detail View ──────────────────────────────────────────────────────────
const PostDetail: React.FC<{
  postId:  string;
  token?:  string;
  userId?: string;
  onBack:  () => void;
}> = ({ postId, token, userId, onBack }) => {
  const [post,        setPost]        = useState<ForumPost | null>(null);
  const [comments,    setComments]    = useState<ForumCommentWithLikes[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [newComment,  setNewComment]  = useState("");
  const [posting,     setPosting]     = useState(false);
  const [error,       setError]       = useState("");
  const [likeError,   setLikeError]   = useState("");
  const [likedIds,    setLikedIds]    = useState<Set<string>>(new Set());
  const [likePending, setLikePending] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPost(postId)
      .then(({ post, comments }) => {
        setPost(post);
        const typed = comments as ForumCommentWithLikes[];
        setComments(typed);

        // Seed which comments this user already liked
        const initialLiked = new Set(
          typed.filter(c => c.liked_by_me).map(c => c.id)
        );
        setLikedIds(initialLiked);

        // Debug: verify the API is returning likes_count + liked_by_me
        if (typed.length > 0) {
          console.log("[Forum] comment shape:", {
            id:          typed[0].id,
            likes_count: typed[0].likes_count,
            liked_by_me: typed[0].liked_by_me,
          });
        }
      })
      .catch(() => setError("Failed to load post"))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleAddComment = async () => {
    if (!token || !newComment.trim()) return;
    setPosting(true);
    try {
      const res = await addComment(token, postId, newComment.trim());
      setComments(prev => [
        ...prev,
        { ...res.comment, likes_count: 0, liked_by_me: false },
      ]);
      setNewComment("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err: any) {
      setError(err.message || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!token) return;
    try {
      await deleteComment(token, id);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch { /* silent */ }
  };

  const handleLikeComment = async (id: string) => {
    if (!token || likePending.has(id)) return;
    setLikeError("");

    const isLiked = likedIds.has(id);

    // ── 1. Optimistic update ──────────────────────────────────────────────
    setLikedIds(prev => {
      const next = new Set(prev);
      isLiked ? next.delete(id) : next.add(id);
      return next;
    });
    setComments(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, likes_count: Math.max(0, (c.likes_count ?? 0) + (isLiked ? -1 : 1)) }
          : c
      )
    );

    // ── 2. Lock button while request is in flight ─────────────────────────
    setLikePending(prev => new Set(prev).add(id));

    try {
      let result: any;
      if (isLiked) {
        result = await unlikeComment(token, id);
      } else {
        result = await likeComment(token, id);
        console.log("[likeComment] success:", result);
      }

      // If the API returns a fresh count, sync it to be exact
      if (result?.likes_count !== undefined) {
        setComments(prev =>
          prev.map(c =>
            c.id === id ? { ...c, likes_count: result.likes_count } : c
          )
        );
      }
    } catch (err: any) {
      console.error("[likeComment] error:", err);

      // ── 3. Revert on failure ──────────────────────────────────────────
      setLikedIds(prev => {
        const next = new Set(prev);
        isLiked ? next.add(id) : next.delete(id);
        return next;
      });
      setComments(prev =>
        prev.map(c =>
          c.id === id
            ? { ...c, likes_count: Math.max(0, (c.likes_count ?? 0) + (isLiked ? 1 : -1)) }
            : c
        )
      );

      const msg =
        err?.status === 401 ? "Please log in to like comments"    :
        err?.status === 404 ? "Comment not found"                 :
        err?.message        ? err.message                         :
                              "Could not save like — please try again";
      setLikeError(msg);
      setTimeout(() => setLikeError(""), 3500);
    } finally {
      setLikePending(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  if (loading) return <div className="forum-loading">Loading post…</div>;
  if (error || !post) return (
    <div className="forum-loading" style={{ color: "#ef4444" }}>
      {error || "Post not found"}
    </div>
  );

  return (
    <div className="post-detail">
      <button className="forum-back-btn" onClick={onBack}>← Back to Forum</button>

      <div className="post-detail-card">
        <div className="post-detail-header">
          <span className="post-category-badge">{post.category}</span>
          <h2 className="post-detail-title">{post.title}</h2>
          <div className="post-detail-meta">
            <UserAvatar name={post.user_name} url={post.user_avatar} size={28} />
            <span className="post-meta-name">{post.user_name}</span>
            <span className="post-meta-dot">·</span>
            <span className="post-meta-date">{formatDate(post.created_at)}</span>
          </div>
        </div>
        <p className="post-detail-content">{post.content}</p>
      </div>

      {/* ── Comments ── */}
      <div className="comments-section">
        <h3 className="comments-title">
          <CommentIcon /> {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </h3>

        {/* Like error toast */}
        {likeError && (
          <div className="like-error-toast">{likeError}</div>
        )}

        {comments.length === 0 ? (
          <p className="comments-empty">No comments yet. Be the first to reply!</p>
        ) : (
          <div className="comments-list">
            {comments.map(c => {
              const isLiked    = likedIds.has(c.id);
              const isPending  = likePending.has(c.id);
              const likesCount = c.likes_count ?? 0;

              return (
                <div key={c.id} className="comment-card">
                  <div className="comment-header">
                    <UserAvatar name={c.user_name} url={c.user_avatar} size={28} />
                    <div className="comment-meta">
                      <span className="comment-name">{c.user_name}</span>
                      <span className="comment-date">{formatDate(c.created_at)}</span>
                    </div>
                    {userId && c.user_id === userId && (
                      <button
                        className="comment-delete-btn"
                        onClick={() => handleDeleteComment(c.id)}
                        title="Delete"
                      >✕</button>
                    )}
                  </div>

                  <p className="comment-content">{c.content}</p>

                  {/* ── Like button ── */}
                  <div className="comment-actions">
                    <button
                      className={`comment-like-btn${isLiked ? " is-liked" : ""}${isPending ? " is-pending" : ""}`}
                      onClick={() => handleLikeComment(c.id)}
                      disabled={!token || isPending}
                      title={
                        !token    ? "Log in to like comments" :
                        isPending ? "Saving…"                 :
                        isLiked   ? "Remove like"             :
                                    "Like this comment"
                      }
                      aria-pressed={isLiked}
                    >
                      <span className={`like-heart-icon${isLiked ? " beating" : ""}`}>
                        <HeartIcon filled={isLiked} size={14} />
                      </span>
                      <span className="like-count">{likesCount}</span>
                      <span className="like-label">
                        {isPending ? "…" : isLiked ? "Liked" : "Like"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}

        {/* ── Add comment ── */}
        {token ? (
          <div className="comment-compose">
            <textarea
              className="forum-input forum-textarea"
              placeholder="Write a reply…"
              value={newComment}
              rows={3}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleAddComment(); }}
            />
            <div className="comment-compose-footer">
              <span className="comment-hint">Ctrl + Enter to post</span>
              <button
                className="forum-btn-post"
                onClick={handleAddComment}
                disabled={posting || !newComment.trim()}
              >
                {posting ? "Posting…" : "Post Reply"}
              </button>
            </div>
          </div>
        ) : (
          <div className="comment-login-prompt">
            <a href="/login">Log in</a> to join the discussion.
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Community Forum Main ──────────────────────────────────────────────────────
const CommunityForum: React.FC = () => {
  const { token, user } = useAuth();

  const [posts,          setPosts]          = useState<ForumPost[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [search,         setSearch]         = useState("");
  const [searchInput,    setSearchInput]    = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showNewPost,    setShowNewPost]    = useState(false);
  const [selectedPost,   setSelectedPost]   = useState<string | null>(null);
  const [total,          setTotal]          = useState(0);

  const fetchPosts = async (cat: string, q: string) => {
    setLoading(true);
    try {
      const res = await getPosts({ category: cat, search: q });
      setPosts(res.posts);
      setTotal(res.total);
    } catch {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(activeCategory, search); }, [activeCategory, search]);

  const handleSearch = () => setSearch(searchInput);

  const handleNewPost = (post: ForumPost) => {
    setPosts(prev => [post, ...prev]);
    setTotal(t => t + 1);
  };

  const handleDeletePost = async (id: string) => {
    if (!token) return;
    try {
      await deletePost(token, id);
      setPosts(prev => prev.filter(p => p.id !== id));
      setTotal(t => t - 1);
    } catch { /* silent */ }
  };

  // ── Post detail view ───────────────────────────────────────────────────────
  if (selectedPost) return (
    <PostDetail
      postId={selectedPost}
      token={token || undefined}
      userId={(user as any)?.id}
      onBack={() => setSelectedPost(null)}
    />
  );

  return (
    <div className="community-forum">

      {/* ── Hero ── */}
      <div className="forum-hero">
        <div className="forum-hero-text">
          <h1 className="forum-hero-title">Dog-Parents Forum</h1>
          <div className="forum-search-bar">
            <span className="forum-search-cat-all">
              All
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>
            <input
              className="forum-search-input"
              placeholder="Search for advice..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
            <button className="forum-search-btn" onClick={handleSearch}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>
          <p className="forum-hero-sub">
            Hello and welcome to our Buddy's Forum!<br />
            Search for an advice, or add a new post to start discussion.
          </p>
        </div>
        <div className="forum-hero-illustration" aria-hidden="true">
          <img
            src="../../images/forum-hero.svg"
            alt=""
            onError={e => (e.currentTarget.style.display = "none")}
          />
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="forum-cats">
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`forum-cat-tab ${activeCategory === c ? "active" : ""}`}
            onClick={() => setActiveCategory(c)}
          >{c}</button>
        ))}
      </div>

      {/* ── Posts table ── */}
      <div className="forum-table-wrap">
        {loading ? (
          <div className="forum-loading">Loading posts…</div>
        ) : error ? (
          <div className="forum-loading" style={{ color: "#ef4444" }}>{error}</div>
        ) : (
          <>
            <table className="forum-table">
              <thead>
                <tr>
                  <th className="col-title">Title</th>
                  <th className="col-user">User</th>
                  <th className="col-date">Date added</th>
                  <th className="col-cat">Category</th>
                  <th className="col-comments">Comments</th>
                  <th className="col-action" />
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="forum-empty-row">
                      No posts found. Be the first to start a discussion!
                    </td>
                  </tr>
                ) : (
                  posts.map(post => (
                    <tr
                      key={post.id}
                      className="forum-row"
                      onClick={() => setSelectedPost(post.id)}
                    >
                      <td className="col-title">
                        <span className="forum-row-title">{post.title}</span>
                      </td>
                      <td className="col-user">
                        <UserAvatar name={post.user_name} url={post.user_avatar} size={30} />
                      </td>
                      <td className="col-date">{formatDate(post.created_at)}</td>
                      <td className="col-cat">
                        <span className="forum-cat-label">{post.category}</span>
                      </td>
                      <td className="col-comments">{post.comments_count}</td>
                      <td className="col-action" onClick={e => e.stopPropagation()}>
                        <div className="forum-row-actions">
                          <button
                            className="forum-open-btn"
                            onClick={() => setSelectedPost(post.id)}
                            title="Open post"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                              <polyline points="15 3 21 3 21 9"/>
                              <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                          </button>
                          {token && (user as any)?.id === post.user_id && (
                            <button
                              className="forum-delete-row-btn"
                              onClick={() => handleDeletePost(post.id)}
                              title="Delete post"
                            >✕</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {total > 0 && (
              <p className="forum-count">
                {total} discussion{total !== 1 ? "s" : ""}
              </p>
            )}
          </>
        )}
      </div>

      {/* ── CTA ── */}
      <div className="forum-cta">
        <p className="forum-cta-text">Can't find a topic that you looking for?</p>
        <button
          className="forum-cta-btn"
          onClick={() => token ? setShowNewPost(true) : (window.location.href = "/login")}
        >
          + Start a discussion
        </button>
      </div>

      {/* ── New Post Modal ── */}
      {showNewPost && token && (
        <NewPostModal
          token={token}
          onPost={handleNewPost}
          onClose={() => setShowNewPost(false)}
        />
      )}
    </div>
  );
};

export default CommunityForum;