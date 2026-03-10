import React, { useState, useEffect, useRef } from "react";
import "./CommunityForum.scss";
import { useAuth } from "../context/AuthContext";
import {
  getPosts, getPost, createPost, deletePost, addComment, deleteComment,
  likeComment, unlikeComment,
  type ForumPost, type ForumComment,
} from "../api/Forum";

// Types 
interface ForumCommentWithLikes extends ForumComment {
  likes_count?: number;
  liked_by_me?: boolean;
  parent_id?:   string | null;
  replies?:     ForumCommentWithLikes[];
}

interface CommunityForumProps {
  initialPostId?:      string | null;
  initialCommentId?:   string | null;
  onDeepLinkConsumed?: () => void;
}

const CATEGORIES = ["All","General","Teething","Travel","Vets","Allergies","Training","Nutrition","Grooming","Dog-friendly","Health","Other"];

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

const ReplyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13">
    <polyline points="9 17 4 12 9 7"/>
    <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
  </svg>
);

const HeartIcon: React.FC<{ filled?: boolean; size?: number }> = ({ filled, size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}
    fill={filled ? "currentColor" : "none"} stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

// New Post Modal 
const NewPostModal: React.FC<{
  token: string; onPost: (post: ForumPost) => void; onClose: () => void;
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
    } finally { setLoading(false); }
  };

  return (
    <div className="forum-modal-overlay" onClick={onClose}>
      <div className="forum-modal" onClick={e => e.stopPropagation()}>
        <div className="forum-modal-header">
          <h3>Start a Discussion</h3>
          <button className="forum-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="forum-modal-body">
          {errors.general && <div className="forum-modal-error">{errors.general}</div>}
          <label className="forum-label">Category</label>
          <div className="forum-cat-chips">
            {CATEGORIES.filter(c => c !== "All").map(c => (
              <button key={c} className={`forum-cat-chip ${form.category === c ? "selected" : ""}`}
                onClick={() => setForm({ ...form, category: c })}>{c}</button>
            ))}
          </div>
          {errors.category && <span className="forum-field-error">{errors.category}</span>}
          <label className="forum-label">Title</label>
          <input className={`forum-input ${errors.title ? "error" : ""}`}
            placeholder="What's your question or topic?" value={form.title} maxLength={200}
            onChange={e => setForm({ ...form, title: e.target.value })} />
          {errors.title && <span className="forum-field-error">{errors.title}</span>}
          <label className="forum-label">Description</label>
          <textarea className={`forum-input forum-textarea ${errors.content ? "error" : ""}`}
            placeholder="Share more details, context or advice…" value={form.content} rows={5}
            onChange={e => setForm({ ...form, content: e.target.value })} />
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

// Reply Box
const ReplyBox: React.FC<{
  replyingTo: string; onSubmit: (content: string) => Promise<void>; onCancel: () => void;
}> = ({ replyingTo, onSubmit, onCancel }) => {
  const [value, setValue]     = useState("");
  const [posting, setPosting] = useState(false);
  const textareaRef           = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    setPosting(true);
    try { await onSubmit(value.trim()); setValue(""); }
    finally { setPosting(false); }
  };

  return (
    <div className="reply-box">
      <div className="reply-box-label">
        <ReplyIcon /> Replying to <strong>{replyingTo}</strong>
      </div>
      <textarea
        ref={textareaRef}
        className="forum-input forum-textarea reply-textarea"
        placeholder={`Reply to ${replyingTo}…`}
        value={value} rows={2}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSubmit(); }}
      />
      <div className="reply-box-footer">
        <span className="comment-hint">Ctrl + Enter to post</span>
        <div className="reply-box-actions">
          <button className="forum-btn-cancel reply-cancel" onClick={onCancel}>Cancel</button>
          <button className="forum-btn-post reply-submit" onClick={handleSubmit} disabled={posting || !value.trim()}>
            {posting ? "Posting…" : "Reply"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Single Comment 
const CommentItem: React.FC<{
  comment:        ForumCommentWithLikes;
  token?:         string;
  userId?:        string;
  isReply?:       boolean;
  likedIds:       Set<string>;
  likePending:    Set<string>;
  highlightId?:   string | null;
  onLike:         (id: string) => void;
  onDelete:       (id: string) => void;
  onReply:        (comment: ForumCommentWithLikes) => void;
  replyingToId?:  string;
  onSubmitReply:  (parentId: string, content: string) => Promise<void>;
  onCancelReply:  () => void;
}> = ({
  comment, token, userId, isReply = false,
  likedIds, likePending, highlightId,
  onLike, onDelete, onReply,
  replyingToId, onSubmitReply, onCancelReply,
}) => {
  const ref           = useRef<HTMLDivElement>(null);
  const isLiked       = likedIds.has(comment.id);
  const isPending     = likePending.has(comment.id);
  const likesCount    = comment.likes_count ?? 0;
  const isReplying    = replyingToId === comment.id;
  const isHighlighted = highlightId === comment.id;

  // Auto-scroll to highlighted comment after load
  useEffect(() => {
    if (isHighlighted && ref.current) {
      const timer = setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  return (
    <div
      ref={ref}
      id={`comment-${comment.id}`}
      className={[
        "comment-card",
        isReply       ? "comment-reply"       : "",
        isHighlighted ? "comment-highlighted" : "",
      ].filter(Boolean).join(" ")}
    >
      <div className="comment-header">
        <UserAvatar name={comment.user_name} url={comment.user_avatar} size={isReply ? 24 : 28} />
        <div className="comment-meta">
          <span className="comment-name">{comment.user_name}</span>
          <span className="comment-date">{formatDate(comment.created_at)}</span>
        </div>
        {userId && comment.user_id === userId && (
          <button className="comment-delete-btn" onClick={() => onDelete(comment.id)} title="Delete">✕</button>
        )}
      </div>

      <p className="comment-content">{comment.content}</p>

      <div className="comment-actions">
        <button
          className={`comment-like-btn${isLiked ? " is-liked" : ""}${isPending ? " is-pending" : ""}`}
          onClick={() => onLike(comment.id)}
          disabled={!token || isPending}
          aria-pressed={isLiked}
          title={!token ? "Log in to like" : isLiked ? "Remove like" : "Like"}
        >
          <span className={`like-heart-icon${isLiked ? " beating" : ""}`}>
            <HeartIcon filled={isLiked} size={13} />
          </span>
          <span className="like-count">{likesCount}</span>
          <span className="like-label">{isPending ? "…" : isLiked ? "Liked" : "Like"}</span>
        </button>

        {!isReply && token && (
          <button
            className={`comment-reply-btn${isReplying ? " is-active" : ""}`}
            onClick={() => isReplying ? onCancelReply() : onReply(comment)}
          >
            <ReplyIcon />
            <span>{isReplying ? "Cancel" : "Reply"}</span>
            {(comment.replies?.length ?? 0) > 0 && !isReplying && (
              <span className="reply-count">{comment.replies!.length}</span>
            )}
          </button>
        )}
      </div>

      {isReplying && (
        <ReplyBox
          replyingTo={comment.user_name}
          onSubmit={content => onSubmitReply(comment.id, content)}
          onCancel={onCancelReply}
        />
      )}

      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="replies-list">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              token={token}
              userId={userId}
              isReply={true}
              likedIds={likedIds}
              likePending={likePending}
              highlightId={highlightId}
              onLike={onLike}
              onDelete={onDelete}
              onReply={onReply}
              replyingToId={replyingToId}
              onSubmitReply={onSubmitReply}
              onCancelReply={onCancelReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Post Detail
const PostDetail: React.FC<{
  postId:           string;
  token?:           string;
  userId?:          string;
  targetCommentId?: string | null;
  onBack:           () => void;
}> = ({ postId, token, userId, targetCommentId, onBack }) => {
  const [post,        setPost]        = useState<ForumPost | null>(null);
  const [comments,    setComments]    = useState<ForumCommentWithLikes[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [newComment,  setNewComment]  = useState("");
  const [posting,     setPosting]     = useState(false);
  const [error,       setError]       = useState("");
  const [likeError,   setLikeError]   = useState("");
  const [likedIds,    setLikedIds]    = useState<Set<string>>(new Set());
  const [likePending, setLikePending] = useState<Set<string>>(new Set());
  const [replyingTo,  setReplyingTo]  = useState<ForumCommentWithLikes | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(targetCommentId ?? null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fade out highlight after 3 s
  useEffect(() => {
    if (!targetCommentId) return;
    setHighlightId(targetCommentId);
    const t = setTimeout(() => setHighlightId(null), 3000);
    return () => clearTimeout(t);
  }, [targetCommentId]);

  useEffect(() => {
    getPost(postId)
      .then(({ post, comments }) => {
        setPost(post);
        const typed = comments as ForumCommentWithLikes[];
        setComments(typed);
        const all = [...typed, ...typed.flatMap(c => c.replies ?? [])];
        setLikedIds(new Set(all.filter(c => c.liked_by_me).map(c => c.id)));
      })
      .catch(() => setError("Failed to load post"))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleAddComment = async () => {
    if (!token || !newComment.trim()) return;
    setPosting(true);
    try {
      const res = await addComment(token, postId, newComment.trim());
      setComments(prev => [...prev, { ...res.comment, likes_count: 0, liked_by_me: false, replies: [] }]);
      setNewComment("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err: any) {
      setError(err.message || "Failed to post comment");
    } finally { setPosting(false); }
  };

  const handleSubmitReply = async (parentId: string, content: string) => {
    if (!token) return;
    try {
      const res = await addComment(token, postId, content, parentId);
      setComments(prev =>
        prev.map(c => c.id === parentId
          ? { ...c, replies: [...(c.replies ?? []), { ...res.comment, likes_count: 0, liked_by_me: false }] }
          : c
        )
      );
      setReplyingTo(null);
    } catch (err: any) {
      setError(err.message || "Failed to post reply");
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!token) return;
    try {
      await deleteComment(token, id);
      setComments(prev =>
        prev.filter(c => c.id !== id).map(c => ({
          ...c,
          replies: (c.replies ?? []).filter(r => r.id !== id),
        }))
      );
    } catch { /* silent */ }
  };

  const handleLikeComment = async (id: string) => {
    if (!token || likePending.has(id)) return;
    setLikeError("");
    const isLiked = likedIds.has(id);

    const updateCount = (list: ForumCommentWithLikes[], delta: number): ForumCommentWithLikes[] =>
      list.map(c => {
        if (c.id === id) return { ...c, likes_count: Math.max(0, (c.likes_count ?? 0) + delta) };
        if (c.replies?.length) return { ...c, replies: updateCount(c.replies, delta) };
        return c;
      });

    setLikedIds(prev => { const n = new Set(prev); isLiked ? n.delete(id) : n.add(id); return n; });
    setComments(prev => updateCount(prev, isLiked ? -1 : 1));
    setLikePending(prev => new Set(prev).add(id));

    try {
      const result = isLiked ? await unlikeComment(token, id) : await likeComment(token, id);
      if (result?.likes_count !== undefined) {
        setComments(prev => prev.map(c => {
          if (c.id === id) return { ...c, likes_count: result.likes_count };
          if (c.replies?.length) return { ...c, replies: c.replies.map(r => r.id === id ? { ...r, likes_count: result.likes_count } : r) };
          return c;
        }));
      }
    } catch (err: any) {
      setLikedIds(prev => { const n = new Set(prev); isLiked ? n.add(id) : n.delete(id); return n; });
      setComments(prev => updateCount(prev, isLiked ? 1 : -1));
      setLikeError(err?.message ?? "Could not save like — please try again");
      setTimeout(() => setLikeError(""), 3500);
    } finally {
      setLikePending(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);

  if (loading) return <div className="forum-loading">Loading post…</div>;
  if (error || !post) return <div className="forum-loading" style={{ color: "#ef4444" }}>{error || "Post not found"}</div>;

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

      <div className="comments-section">
        <h3 className="comments-title">
          <CommentIcon /> {totalComments} {totalComments === 1 ? "Comment" : "Comments"}
        </h3>

        {likeError && <div className="like-error-toast">{likeError}</div>}

        {comments.length === 0 ? (
          <p className="comments-empty">No comments yet. Be the first to reply!</p>
        ) : (
          <div className="comments-list">
            {comments.map(c => (
              <CommentItem
                key={c.id}
                comment={c}
                token={token}
                userId={userId}
                likedIds={likedIds}
                likePending={likePending}
                highlightId={highlightId}
                onLike={handleLikeComment}
                onDelete={handleDeleteComment}
                onReply={setReplyingTo}
                replyingToId={replyingTo?.id}
                onSubmitReply={handleSubmitReply}
                onCancelReply={() => setReplyingTo(null)}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {token ? (
          <div className="comment-compose">
            <textarea
              className="forum-input forum-textarea"
              placeholder="Write a reply…"
              value={newComment} rows={3}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleAddComment(); }}
            />
            <div className="comment-compose-footer">
              <span className="comment-hint">Ctrl + Enter to post</span>
              <button className="forum-btn-post" onClick={handleAddComment} disabled={posting || !newComment.trim()}>
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

// Community Forum Main
const CommunityForum: React.FC<CommunityForumProps> = ({
  initialPostId,
  initialCommentId,
  onDeepLinkConsumed,
}) => {
  const { token, user } = useAuth();
  const [posts,          setPosts]          = useState<ForumPost[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [search,         setSearch]         = useState("");
  const [searchInput,    setSearchInput]    = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showNewPost,    setShowNewPost]    = useState(false);
  const [selectedPost,   setSelectedPost]   = useState<string | null>(null);
  const [targetComment,  setTargetComment]  = useState<string | null>(null);
  const [total,          setTotal]          = useState(0);

  // Auto-open post from notification deep-link
  useEffect(() => {
    if (initialPostId) {
      setSelectedPost(initialPostId);
      setTargetComment(initialCommentId ?? null);
      onDeepLinkConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPostId]);

  const fetchPosts = async (cat: string, q: string) => {
    setLoading(true);
    try {
      const res = await getPosts({ category: cat, search: q });
      setPosts(res.posts);
      setTotal(res.total);
    } catch {
      setError("Failed to load posts");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(activeCategory, search); }, [activeCategory, search]);

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

  const handleBack = () => {
    setSelectedPost(null);
    setTargetComment(null);
  };

  if (selectedPost) return (
    <PostDetail
      postId={selectedPost}
      token={token || undefined}
      userId={(user as any)?.id}
      targetCommentId={targetComment}
      onBack={handleBack}
    />
  );

  return (
    <div className="community-forum">
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
              onKeyDown={e => e.key === "Enter" && setSearch(searchInput)}
            />
            <button className="forum-search-btn" onClick={() => setSearch(searchInput)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>
          <p className="forum-hero-sub">
            Hello and welcome to our Buddy's Forum!<br />
            Search for an advice, or add a new post to start discussion.
          </p>
        </div>
        <div className="forum-hero-illustration" aria-hidden="true">
          <img src="../../images/forum-hero.svg" alt=""
            onError={e => (e.currentTarget.style.display = "none")} />
        </div>
      </div>

      {/* Mobile: native select dropdown */}
      <div className="forum-cats-mobile">
        <select
          className="forum-cats-select"
          value={activeCategory}
          onChange={e => setActiveCategory(e.target.value)}
          aria-label="Filter by category"
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Tablet+: pill tabs */}
      <div className="forum-cats">
        {CATEGORIES.map(c => (
          <button key={c} className={`forum-cat-tab ${activeCategory === c ? "active" : ""}`}
            onClick={() => setActiveCategory(c)}>{c}</button>
        ))}
      </div>

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
                  <tr><td colSpan={6} className="forum-empty-row">No posts found. Be the first to start a discussion!</td></tr>
                ) : (
                  posts.map(post => (
                    <tr key={post.id} className="forum-row" onClick={() => setSelectedPost(post.id)}>
                      <td className="col-title"><span className="forum-row-title">{post.title}</span></td>
                      <td className="col-user"><UserAvatar name={post.user_name} url={post.user_avatar} size={30} /></td>
                      <td className="col-date">{formatDate(post.created_at)}</td>
                      <td className="col-cat"><span className="forum-cat-label">{post.category}</span></td>
                      <td className="col-comments">{post.comments_count}</td>
                      <td className="col-action" onClick={e => e.stopPropagation()}>
                        <div className="forum-row-actions">
                          <button className="forum-open-btn" onClick={() => setSelectedPost(post.id)} title="Open post">
                            <i className="bi bi-box-arrow-right" />
                          </button>
                          {token && (user as any)?.id === post.user_id && (
                            <button className="forum-delete-row-btn"
                              onClick={() => handleDeletePost(post.id)} title="Delete post"><i className="bi bi-trash3"></i></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {total > 0 && <p className="forum-count">{total} discussion{total !== 1 ? "s" : ""}</p>}
          </>
        )}
      </div>

      <div className="forum-cta">
        <p className="forum-cta-text">Can't find a topic that you looking for?</p>
        <button className="forum-cta-btn"
          onClick={() => token ? setShowNewPost(true) : (window.location.href = "/login")}>
          <i className="bi bi-file-earmark-plus"></i> Start a discussion
        </button>
      </div>

      {showNewPost && token && (
        <NewPostModal token={token} onPost={handleNewPost} onClose={() => setShowNewPost(false)} />
      )}
    </div>
  );
};

export default CommunityForum;