import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './ForumPage.scss';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import {
  getPosts, getPost, createPost, deletePost, addComment, deleteComment,
  likeComment, unlikeComment,
  type ForumPost, type ForumComment,
} from '../api/Forum';

const API_BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

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
}

type ReportTarget =
  | { type: 'post';    id: string; title:   string }
  | { type: 'comment'; id: string; preview: string };

const CATEGORIES = [
  'All','General','Teething','Travel','Vets','Allergies',
  'Training','Nutrition','Grooming','Dog-friendly','Health','Other',
];

const REPORT_REASONS = [
  'Spam or advertising',
  'Harassment or bullying',
  'Hate speech or discrimination',
  'Misinformation or false advice',
  'Inappropriate or offensive content',
  'Animal cruelty or neglect',
  'Other',
];

const formatDate = (d: string | number | null | undefined) => {
  if (!d) return '—';
  const date = typeof d === 'number' ? new Date(d) : new Date(String(d).replace(' ', 'T'));
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
};

// Helpers 
const UserAvatar: React.FC<{ name: string; url?: string; size?: number }> = ({ name, url, size = 32 }) => (
  <div className="forum-avatar" style={{ width: size, height: size }}>
    {url
      ? <img src={url} alt={name} />
      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width={size * 0.55} height={size * 0.55}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>}
  </div>
);

const HeartIcon: React.FC<{ filled?: boolean; size?: number }> = ({ filled, size = 13 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}
    fill={filled ? 'currentColor' : 'none'} stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ReplyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13">
    <polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// Locked / Guest
const ForumLocked: React.FC = () => (
  <div className="forum-locked">
    <div className="forum-locked__blur-bg" aria-hidden="true">
      <div className="forum-locked__fake-hero" />
      <div className="forum-locked__fake-row" />
      <div className="forum-locked__fake-row forum-locked__fake-row--short" />
      <div className="forum-locked__fake-row" />
      <div className="forum-locked__fake-row forum-locked__fake-row--short" />
      <div className="forum-locked__fake-row" />
    </div>
    <div className="forum-locked__overlay" />
    <div className="forum-locked__card">
      <div className="forum-locked__icon"><i className="bi bi-chat-heart" /></div>
      <h1 className="forum-locked__title">Join the Community</h1>
      <p className="forum-locked__sub">
        The BarkBuddy Forum is where dog owners share advice, ask questions, and support each other.
        <br /><strong>Log in or create a free account to join in.</strong>
      </p>
      <div className="forum-locked__actions">
        <Link to="/login" className="forum-locked__btn forum-locked__btn--primary">
          <i className="bi bi-box-arrow-in-right" /> Log in
        </Link>
        <Link to="/register" className="forum-locked__btn forum-locked__btn--ghost">
          Create free account
        </Link>
      </div>
      <p className="forum-locked__hint">
        Already know what you're looking for? Check our <Link to="/faq">FAQ</Link> or read the{' '}
        <Link to="/forum-policy">Forum Policy</Link>.
      </p>
    </div>
  </div>
);

// Toast
const Toast: React.FC<{ message: string; type?: 'success' | 'error' }> = ({ message, type = 'success' }) => (
  <div className={`forum-toast forum-toast--${type}`}>
    <i className={`bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}`} />
    {message}
  </div>
);

// ─── Report Modal ─────────────────────────────────────────────────────────────
const ReportModal: React.FC<{
  target: ReportTarget; token: string; onClose: () => void; onSuccess: () => void;
}> = ({ target, token, onClose, onSuccess }) => {
  const [reason,    setReason]  = useState('');
  const [details,   setDetails] = useState('');
  const [submitting, setSubmit] = useState(false);
  const [error,     setError]   = useState('');

  const handleSubmit = async () => {
    if (!reason) { setError('Please select a reason.'); return; }
    setSubmit(true); setError('');
    try {
      await fetch(`${API_BASE}/reports`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ target_type: target.type, target_id: target.id, reason, details: details.trim() || null }),
      });
      onSuccess(); onClose();
    } catch { setError('Failed to submit report. Please try again.'); }
    finally { setSubmit(false); }
  };

  return (
    <div className="forum-modal-overlay" onClick={onClose}>
      <div className="forum-modal forum-modal--report" onClick={e => e.stopPropagation()}>
        <div className="forum-modal-header">
          <div className="forum-modal-header__left">
            <i className="bi bi-flag forum-modal-header__icon" />
            <h3>Report {target.type === 'post' ? 'Post' : 'Comment'}</h3>
          </div>
          <button className="forum-modal-close" onClick={onClose}><i className="bi bi-x" /></button>
        </div>
        <div className="forum-modal-body">
          <div className="report-preview">
            <i className="bi bi-quote" />
            <p>{target.type === 'post' ? (target as any).title : (target as any).preview}</p>
          </div>
          {error && <div className="forum-modal-error">{error}</div>}
          <label className="forum-label">Why are you reporting this?</label>
          <div className="report-reasons">
            {REPORT_REASONS.map(r => (
              <button key={r} className={`report-reason-btn ${reason === r ? 'report-reason-btn--active' : ''}`}
                onClick={() => setReason(r)}>
                <span className="report-reason-btn__check">{reason === r && <i className="bi bi-check" />}</span>
                {r}
              </button>
            ))}
          </div>
          <label className="forum-label">
            Additional details <span className="forum-label--optional">(optional)</span>
          </label>
          <textarea className="forum-input forum-textarea" placeholder="Any extra context…"
            value={details} rows={3} onChange={e => setDetails(e.target.value)} />
        </div>
        <div className="forum-modal-footer">
          <button className="forum-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="forum-btn-report" onClick={handleSubmit} disabled={submitting || !reason}>
            <i className="bi bi-flag" />{submitting ? 'Submitting…' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── New Post Modal ───────────────────────────────────────────────────────────
const NewPostModal: React.FC<{
  token: string; onPost: (post: ForumPost) => void; onClose: () => void;
}> = ({ token, onPost, onClose }) => {
  const [form,   setForm]   = useState({ title: '', content: '', category: 'General' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoad]  = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim() || form.title.length < 3)      e.title    = 'Title must be at least 3 characters';
    if (!form.content.trim() || form.content.length < 10) e.content  = 'Please write a bit more (min 10 chars)';
    if (!form.category)                                   e.category = 'Please choose a category';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoad(true);
    try { const res = await createPost(token, form); onPost(res.post); onClose(); }
    catch (err: any) { setErrors(err.errors ?? { general: err.message || 'Something went wrong' }); }
    finally { setLoad(false); }
  };

  return (
    <div className="forum-modal-overlay" onClick={onClose}>
      <div className="forum-modal" onClick={e => e.stopPropagation()}>
        <div className="forum-modal-header">
          <div className="forum-modal-header__left">
            <i className="bi bi-pencil-square forum-modal-header__icon" />
            <h3>Start a Discussion</h3>
          </div>
          <button className="forum-modal-close" onClick={onClose}><i className="bi bi-x" /></button>
        </div>
        <div className="forum-modal-body">
          {errors.general && <div className="forum-modal-error">{errors.general}</div>}
          <label className="forum-label">Category</label>
          <div className="forum-cat-chips">
            {CATEGORIES.filter(c => c !== 'All').map(c => (
              <button key={c} className={`forum-cat-chip ${form.category === c ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, category: c })}>{c}</button>
            ))}
          </div>
          {errors.category && <span className="forum-field-error">{errors.category}</span>}
          <label className="forum-label">Title</label>
          <input className={`forum-input ${errors.title ? 'error' : ''}`}
            placeholder="What's your question or topic?" value={form.title} maxLength={200}
            onChange={e => setForm({ ...form, title: e.target.value })} />
          {errors.title && <span className="forum-field-error">{errors.title}</span>}
          <label className="forum-label">Description</label>
          <textarea className={`forum-input forum-textarea ${errors.content ? 'error' : ''}`}
            placeholder="Share more details, context or advice…" value={form.content} rows={5}
            onChange={e => setForm({ ...form, content: e.target.value })} />
          {errors.content && <span className="forum-field-error">{errors.content}</span>}
        </div>
        <div className="forum-modal-footer">
          <button className="forum-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="forum-btn-post" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Posting…' : 'Post Discussion'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Reply Box ────────────────────────────────────────────────────────────────
const ReplyBox: React.FC<{
  replyingTo: string; onSubmit: (content: string) => Promise<void>; onCancel: () => void;
}> = ({ replyingTo, onSubmit, onCancel }) => {
  const [value,   setValue]   = useState('');
  const [posting, setPosting] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    setPosting(true);
    try { await onSubmit(value.trim()); setValue(''); }
    finally { setPosting(false); }
  };

  return (
    <div className="reply-box">
      <div className="reply-box-label"><ReplyIcon /> Replying to <strong>{replyingTo}</strong></div>
      <textarea ref={ref} className="forum-input forum-textarea reply-textarea"
        placeholder={`Reply to ${replyingTo}…`} value={value} rows={2}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }} />
      <div className="reply-box-footer">
        <span className="comment-hint">Ctrl + Enter to post</span>
        <div className="reply-box-actions">
          <button className="forum-btn-cancel reply-cancel" onClick={onCancel}>Cancel</button>
          <button className="forum-btn-post reply-submit" onClick={handleSubmit} disabled={posting || !value.trim()}>
            {posting ? 'Posting…' : 'Reply'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Comment Item ─────────────────────────────────────────────────────────────
const CommentItem: React.FC<{
  comment:       ForumCommentWithLikes;
  token?:        string;
  userId?:       string;
  isReply?:      boolean;
  likedIds:      Set<string>;
  likePending:   Set<string>;
  highlightId?:  string | null;
  onLike:        (id: string) => void;
  onDelete:      (id: string) => void;
  onReply:       (c: ForumCommentWithLikes) => void;
  onReport:      (target: ReportTarget) => void;
  replyingToId?: string;
  onSubmitReply: (parentId: string, content: string) => Promise<void>;
  onCancelReply: () => void;
}> = ({ comment, token, userId, isReply = false, likedIds, likePending, highlightId,
        onLike, onDelete, onReply, onReport, replyingToId, onSubmitReply, onCancelReply }) => {
  const ref           = useRef<HTMLDivElement>(null);
  const isLiked       = likedIds.has(comment.id);
  const isPending     = likePending.has(comment.id);
  const isReplying    = replyingToId === comment.id;
  const isHighlighted = highlightId === comment.id;
  const isOwner       = userId && comment.userId === userId;

  useEffect(() => {
    if (isHighlighted && ref.current) {
      const t = setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 350);
      return () => clearTimeout(t);
    }
  }, [isHighlighted]);

  return (
    <div ref={ref} id={`comment-${comment.id}`}
      className={['comment-card', isReply ? 'comment-reply' : '', isHighlighted ? 'comment-highlighted' : ''].filter(Boolean).join(' ')}>

      <div className="comment-header">
        <UserAvatar name={comment.userName} url={comment.userAvatar} size={isReply ? 24 : 30} />
        <div className="comment-meta">
          <span className="comment-name">{comment.userName}</span>
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
        </div>
        <div className="comment-header__actions">
          {token && !isOwner && (
            <button className="comment-action-btn comment-action-btn--report" title="Report"
              onClick={() => onReport({ type: 'comment', id: comment.id,
                preview: comment.content.slice(0, 120) + (comment.content.length > 120 ? '…' : '') })}>
              <i className="bi bi-flag" />
            </button>
          )}
          {isOwner && (
            <button className="comment-action-btn comment-action-btn--delete"
              onClick={() => onDelete(comment.id)} title="Delete">
              <i className="bi bi-trash3" />
            </button>
          )}
        </div>
      </div>

      <p className="comment-content">{comment.content}</p>

      <div className="comment-actions">
        <button
          className={`comment-like-btn${isLiked ? ' is-liked' : ''}${isPending ? ' is-pending' : ''}`}
          onClick={() => onLike(comment.id)} disabled={!token || isPending}
          title={!token ? 'Log in to like' : isLiked ? 'Remove like' : 'Like'}>
          <span className={`like-heart-icon${isLiked ? ' beating' : ''}`}>
            <HeartIcon filled={isLiked} />
          </span>
          <span className="like-count">{comment.likesCount ?? 0}</span>
          <span className="like-label">{isPending ? '…' : isLiked ? 'Liked' : 'Like'}</span>
        </button>
        {!isReply && token && (
          <button className={`comment-reply-btn${isReplying ? ' is-active' : ''}`}
            onClick={() => isReplying ? onCancelReply() : onReply(comment)}>
            <ReplyIcon />
            <span>{isReplying ? 'Cancel' : 'Reply'}</span>
            {(comment.replies?.length ?? 0) > 0 && !isReplying && (
              <span className="reply-count">{comment.replies!.length}</span>
            )}
          </button>
        )}
      </div>

      {isReplying && (
        <ReplyBox replyingTo={comment.userName}
          onSubmit={content => onSubmitReply(comment.id, content)}
          onCancel={onCancelReply} />
      )}

      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="replies-list">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} token={token} userId={userId}
              isReply likedIds={likedIds} likePending={likePending} highlightId={highlightId}
              onLike={onLike} onDelete={onDelete} onReply={onReply} onReport={onReport}
              replyingToId={replyingToId} onSubmitReply={onSubmitReply} onCancelReply={onCancelReply} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Post Detail ──────────────────────────────────────────────────────────────
const PostDetail: React.FC<{
  postId: string; token?: string; userId?: string;
  targetCommentId?: string | null; onBack: () => void; onReport: (t: ReportTarget) => void;
}> = ({ postId, token, userId, targetCommentId, onBack, onReport }) => {
  const [post,        setPost]        = useState<ForumPost | null>(null);
  const [comments,    setComments]    = useState<ForumCommentWithLikes[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [newComment,  setNewComment]  = useState('');
  const [posting,     setPosting]     = useState(false);
  const [error,       setError]       = useState('');
  const [likeError,   setLikeError]   = useState('');
  const [likedIds,    setLikedIds]    = useState<Set<string>>(new Set());
  const [likePending, setLikePending] = useState<Set<string>>(new Set());
  const [replyingTo,  setReplyingTo]  = useState<ForumCommentWithLikes | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(targetCommentId ?? null);
  const bottomRef = useRef<HTMLDivElement>(null);

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
        setLikedIds(new Set(all.filter(c => c.likedByMe).map(c => c.id)));
      })
      .catch(() => setError('Failed to load post'))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleAddComment = async () => {
    if (!token || !newComment.trim()) return;
    setPosting(true);
    try {
      const res = await addComment(token, postId, newComment.trim());
      setComments(prev => [...prev, { ...res.comment, likesCount: 0, likedByMe: false, replies: [] }]);
      setNewComment('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: any) { setError(err.message || 'Failed to post comment'); }
    finally { setPosting(false); }
  };

  const handleSubmitReply = async (parentId: string, content: string) => {
    if (!token) return;
    try {
      const res = await addComment(token, postId, content, parentId);
      setComments(prev => prev.map(c => c.id === parentId
        ? { ...c, replies: [...(c.replies ?? []), { ...res.comment, likesCount: 0, likedByMe: false }] } : c));
      setReplyingTo(null);
    } catch (err: any) { setError(err.message || 'Failed to post reply'); }
  };

  const handleDeleteComment = async (id: string) => {
    if (!token) return;
    try {
      await deleteComment(token, id);
      setComments(prev => prev.filter(c => c.id !== id)
        .map(c => ({ ...c, replies: (c.replies ?? []).filter(r => r.id !== id) })));
    } catch { /* silent */ }
  };

  const handleLikeComment = async (id: string) => {
    if (!token || likePending.has(id)) return;
    setLikeError('');
    const isLiked = likedIds.has(id);
    const bump = (list: ForumCommentWithLikes[], d: number): ForumCommentWithLikes[] =>
      list.map(c => {
        if (c.id === id) return { ...c, likesCount: Math.max(0, (c.likesCount ?? 0) + d) };
        if (c.replies?.length) return { ...c, replies: bump(c.replies, d) };
        return c;
      });
    setLikedIds(prev => { const n = new Set(prev); isLiked ? n.delete(id) : n.add(id); return n; });
    setComments(prev => bump(prev, isLiked ? -1 : 1));
    setLikePending(prev => new Set(prev).add(id));
    try {
      const result = isLiked ? await unlikeComment(token, id) : await likeComment(token, id);
      if (result?.likesCount !== undefined) {
        setComments(prev => prev.map(c => {
          if (c.id === id) return { ...c, likesCount: result.likesCount ?? 0 };
          if (c.replies?.length) return { ...c, replies: c.replies.map(r => r.id === id ? { ...r, likesCount: result.likesCount ?? 0 } : r) };
          return c;
        }));
      }
    } catch (err: any) {
      setLikedIds(prev => { const n = new Set(prev); isLiked ? n.add(id) : n.delete(id); return n; });
      setComments(prev => bump(prev, isLiked ? 1 : -1));
      setLikeError(err?.message ?? 'Could not save like — please try again');
      setTimeout(() => setLikeError(''), 3500);
    } finally {
      setLikePending(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);
  const isOwner       = userId && post?.userId === userId;

  if (loading) return <div className="forum-loading">Loading post…</div>;
  if (error || !post) return <div className="forum-loading forum-loading--error">{error || 'Post not found'}</div>;

  return (
    <div className="post-detail">

      {/* ── Back ── */}
      <button className="forum-back-btn" onClick={onBack}>
        <i className="bi bi-arrow-left" /> Back to Forum
      </button>

      {/* ── Post card ── */}
      <article className="post-detail-card">

        {/* Top row: category badge + optional report */}
        <div className="post-detail-card__top">
          <span className="post-category-badge">{post.category}</span>
          {token && !isOwner && (
            <button className="post-report-btn"
              onClick={() => onReport({ type: 'post', id: post.id, title: post.title })}>
              <i className="bi bi-flag" /> Report
            </button>
          )}
        </div>

        {/* Big editorial title */}
        <h2 className="post-detail-title">{post.title}</h2>

        {/* Author meta row — avatar + name + date stacked */}
        <div className="post-detail-author">
          <UserAvatar name={post.userName ?? ''} url={post.userAvatar} size={38} />
          <div className="post-detail-author__info">
            <span className="post-detail-author__name">{post.userName}</span>
            <span className="post-detail-author__date">{formatDate(post.createdAt)}</span>
          </div>
        </div>

        <div className="post-detail-divider" />

        {/* Body */}
        <p className="post-detail-content">{post.content}</p>

      </article>

      {/* ── Comments ── */}
      <div className="comments-section">

        <div className="comments-header">
          <h3 className="comments-title">
            <CommentIcon />
            {totalComments} {totalComments === 1 ? 'Comment' : 'Comments'}
          </h3>
        </div>

        {likeError && <div className="like-error-toast">{likeError}</div>}

        {comments.length === 0
          ? <p className="comments-empty">No comments yet. Be the first to reply!</p>
          : (
            <div className="comments-list">
              {comments.map(c => (
                <CommentItem key={c.id} comment={c} token={token} userId={userId}
                  likedIds={likedIds} likePending={likePending} highlightId={highlightId}
                  onLike={handleLikeComment} onDelete={handleDeleteComment}
                  onReply={setReplyingTo} onReport={onReport}
                  replyingToId={replyingTo?.id}
                  onSubmitReply={handleSubmitReply}
                  onCancelReply={() => setReplyingTo(null)} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}

        {/* Compose */}
        {token ? (
          <div className="comment-compose">
            <textarea className="forum-input forum-textarea"
              placeholder="Share your thoughts…" value={newComment} rows={3}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAddComment(); }} />
            <div className="comment-compose-footer">
              <span className="comment-hint">Ctrl + Enter to post</span>
              <button className="forum-btn-post" onClick={handleAddComment}
                disabled={posting || !newComment.trim()}>
                {posting ? 'Posting…' : 'Post Reply'}
              </button>
            </div>
          </div>
        ) : (
          <div className="comment-login-prompt">
            <Link to="/login">Log in</Link> to join the discussion.
          </div>
        )}
      </div>
    </div>
  );
};

// Main ForumPage 
const ForumPage: React.FC<CommunityForumProps> = ({ initialPostId, initialCommentId, onDeepLinkConsumed }) => {
  const { token, user } = useAuth();
  const [posts,          setPosts]          = useState<ForumPost[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [search,         setSearch]         = useState('');
  const [searchInput,    setSearchInput]    = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showNewPost,    setShowNewPost]    = useState(false);
  const [selectedPost,   setSelectedPost]   = useState<string | null>(null);
  const [targetComment,  setTargetComment]  = useState<string | null>(null);
  const [total,          setTotal]          = useState(0);
  const [reportTarget,   setReportTarget]   = useState<ReportTarget | null>(null);
  const [toast,          setToast]          = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

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
    try { const res = await getPosts({ category: cat, search: q }); setPosts(res.posts); setTotal(res.total); }
    catch { setError('Failed to load posts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(activeCategory, search); }, [activeCategory, search]);

  const handleNewPost    = (post: ForumPost) => { setPosts(prev => [{ ...post, commentsCount: post.commentsCount ?? 0 }, ...prev]); setTotal(t => t + 1); };
  const handleDeletePost = async (id: string) => {
    if (!token) return;
    try { await deletePost(token, id); setPosts(prev => prev.filter(p => p.id !== id)); setTotal(t => t - 1); }
    catch { /* silent */ }
  };
  const handleBack = () => { setSelectedPost(null); setTargetComment(null); };

  if (!token) return <ForumLocked />;

  if (selectedPost) return (
    <div className="forum-page">
      <PostDetail postId={selectedPost} token={token || undefined} userId={(user as any)?.id}
        targetCommentId={targetComment} onBack={handleBack} onReport={setReportTarget} />
      <Footer />
      {reportTarget && token && (
        <ReportModal target={reportTarget} token={token}
          onClose={() => setReportTarget(null)}
          onSuccess={() => showToast('Report submitted — thank you. Our team will review it shortly.')} />
      )}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );

  return (
    <div className="forum-page">
      <div className="forum-page__inner">

        {/* Hero — same layout as TravelPage hero */}
        <section className="forum-page-hero">
          <div className="forum-page-hero__left">
            <p className="forum-page-hero__eyebrow">Community Forum</p>

            <div className="forum-page-hero__heading-block">
              <h1 className="forum-page-hero__title">
                Ask, share,<br />
                <em>connect.</em>
              </h1>
              <p className="forum-page-hero__sub">
                Get advice from fellow dog owners across the UK.{' '}
                <strong>Your community is here.</strong>
              </p>

              <div className="forum-page-hero__ctas">
                <button
                  className="forum-page-hero__cta forum-page-hero__cta--primary"
                  onClick={() => setShowNewPost(true)}
                >
                  Start a discussion
                  <i className="bi bi-chevron-double-right" />
                </button>
                <button
                  className="forum-page-hero__cta forum-page-hero__cta--ghost"
                  onClick={() => document.querySelector('.forum-content')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Browse posts
                </button>
              </div>
            </div>

            {/* Search — below CTAs, secondary */}
            <div className="forum-page-hero__search">
              <i className="bi bi-search forum-page-hero__search-icon" />
              <input
                className="forum-page-hero__search-input"
                placeholder="Search discussions…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
              />
              {searchInput && (
                <button className="forum-page-hero__search-clear"
                  onClick={() => { setSearchInput(''); setSearch(''); }}>
                  <i className="bi bi-x" />
                </button>
              )}
              <button className="forum-page-hero__search-btn" onClick={() => setSearch(searchInput)}>
                Search
              </button>
            </div>
          </div>

          <div className="forum-page-hero__right" aria-hidden="true">
            <img
              src="/images/Forum.webp"
              alt=""
              onError={e => (e.currentTarget.style.display = 'none')}
            />
          </div>
        </section>

        <div className="forum-content">

          {/* Mobile category select */}
          <div className="forum-cats-mobile">
            <select className="forum-cats-select" value={activeCategory}
              onChange={e => setActiveCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Desktop category pills */}
          <div className="forum-cats">
            {CATEGORIES.map(c => (
              <button key={c} className={`forum-cat-tab ${activeCategory === c ? 'active' : ''}`}
                onClick={() => setActiveCategory(c)}>{c}</button>
            ))}
          </div>

          {/* ── Table — NO User column ── */}
          <div className="forum-table-wrap">
            {loading ? (
              <div className="forum-loading">Loading posts…</div>
            ) : error ? (
              <div className="forum-loading forum-loading--error">{error}</div>
            ) : (
              <>
                <table className="forum-table">
                  <thead>
                    <tr>
                      <th className="col-title">Post title</th>
                      <th className="col-date">Date</th>
                      <th className="col-cat">Category</th>
                      <th className="col-comments">Comments</th>
                      <th className="col-action" />
                    </tr>
                  </thead>
                  <tbody>
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="forum-empty-row">
                          No posts found - be the first to start a discussion!
                        </td>
                      </tr>
                    ) : (
                      posts.map(post => (
                        <tr key={post.id} className="forum-row" onClick={() => setSelectedPost(post.id)}>

                          {/* Title + author name below on mobile */}
                          <td className="col-title">
                            <div className="forum-row-title-wrap">
                              <span className="forum-row-title">{post.title}</span>
                              <span className="forum-row-meta">
                                {post.userName} · {formatDate(post.createdAt)}
                              </span>
                            </div>
                          </td>

                          <td className="col-date">{formatDate(post.createdAt)}</td>
                          <td className="col-cat"><span className="forum-cat-label">{post.category}</span></td>
                          <td className="col-comments">
                            <span className="forum-replies-pill">{post.commentsCount}</span>
                          </td>
                          <td className="col-action" onClick={e => e.stopPropagation()}>
                            <div className="forum-row-actions">
                              <button className="forum-open-btn" title="Open"
                                onClick={() => setSelectedPost(post.id)}>
                                <i className="bi bi-box-arrow-right"></i>
                              </button>
                              {(user as any)?.id !== post.userId && (
                                <button className="forum-report-row-btn" title="Report post"
                                  onClick={() => setReportTarget({ type: 'post', id: post.id, title: post.title })}>
                                  <i className="bi bi-flag" />
                                </button>
                              )}
                              {(user as any)?.id === post.userId && (
                                <button className="forum-delete-row-btn" title="Delete post"
                                  onClick={() => handleDeletePost(post.id)}>
                                  <i className="bi bi-trash3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {total > 0 && <p className="forum-count">{total} post{total !== 1 ? 's' : ''}</p>}
              </>
            )}
          </div>

          {/* CTA */}
          <div className="forum-cta">
            <p className="forum-cta-text">Can't find what you're looking for?</p>
            <button className="forum-cta-btn" onClick={() => setShowNewPost(true)}>
              <i className="bi bi-plus-lg" /> Start a discussion
            </button>
          </div>

        </div>{/* /forum-content */}
      </div>{/* /forum-page__inner */}

      <Footer />

      {showNewPost && token && (
        <NewPostModal token={token} onPost={handleNewPost} onClose={() => setShowNewPost(false)} />
      )}
      {reportTarget && token && (
        <ReportModal target={reportTarget} token={token}
          onClose={() => setReportTarget(null)}
          onSuccess={() => showToast('Report submitted — thank you. Our team will review it shortly.')} />
      )}
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
};

export default ForumPage;