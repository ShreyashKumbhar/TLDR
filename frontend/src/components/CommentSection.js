import React, { useEffect, useState } from 'react';
import { commentService } from '../services/api';
import { useAuth } from '../context/AuthContext';

function CommentSection({ summaryId, onCommentCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const isModerator = user?.role === 'MODERATOR';

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryId, user?.id, refreshKey]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentService.getCommentsBySummary(summaryId, user?.id ?? null, 0, 50);
      const list = response.data.content || [];
      setComments(list);
      if (onCommentCountChange) {
        onCommentCountChange(countComments(list));
      }
      setError('');
    } catch (err) {
      console.error('Error loading comments', err);
      setError('Unable to load comments right now.');
    } finally {
      setLoading(false);
    }
  };

  const countComments = (items) => {
    return items.reduce((acc, item) => acc + 1 + countComments(item.replies || []), 0);
  };

  const handleAddComment = async (content, parentId = null) => {
    if (!user) {
      alert('Please sign in to comment.');
      return;
    }
    if (!content.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    try {
      await commentService.createComment({
        summaryId,
        userId: user.id,
        content: content.trim(),
        parentId
      });
      setNewComment('');
      triggerRefresh();
    } catch (err) {
      console.error('Error creating comment', err);
      alert('Unable to post your comment. Please try again.');
    }
  };

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleToggleLike = async (comment) => {
    if (!user) {
      alert('Please sign in to like comments.');
      return;
    }
    try {
      const response = comment.likedByViewer
        ? await commentService.unlikeComment(comment.id, user.id)
        : await commentService.likeComment(comment.id, user.id);
      updateCommentInTree(response.data);
    } catch (err) {
      console.error('Error toggling like', err);
      alert('Unable to update like right now.');
    }
  };

  const handleDelete = async (comment) => {
    if (!user) {
      alert('Please sign in.');
      return;
    }
    if (!(comment.userId === user.id || isModerator)) {
      alert('You can only delete your own comments.');
      return;
    }
    const confirmed = window.confirm('Delete this comment and its replies?');
    if (!confirmed) return;
    try {
      await commentService.deleteComment(comment.id, user.id);
      triggerRefresh();
    } catch (err) {
      console.error('Error deleting comment', err);
      alert('Unable to delete comment.');
    }
  };

  const handleReport = async (comment) => {
    if (!user) {
      alert('Please sign in to report comments.');
      return;
    }
    const reason = window.prompt('Let us know why you are reporting this comment:');
    if (!reason) return;
    try {
      await commentService.reportComment(comment.id, user.id, reason);
      alert('Thanks! Our moderators will review the comment.');
    } catch (err) {
      console.error('Error reporting comment', err);
      alert('Unable to report comment right now.');
    }
  };

  const handleModeration = async (comment, action) => {
    if (!isModerator) {
      alert('Only moderators can perform this action.');
      return;
    }
    try {
      const response = action === 'hide'
        ? await commentService.hideComment(comment.id, user.id)
        : await commentService.restoreComment(comment.id, user.id);
      updateCommentInTree(response.data);
    } catch (err) {
      console.error('Moderation action failed', err);
      alert('Unable to apply moderation action.');
    }
  };

  const updateCommentInTree = (updatedComment) => {
    const update = (items) => items.map(item => {
      if (item.id === updatedComment.id) {
        return { ...updatedComment };
      }
      if (item.replies && item.replies.length) {
        return { ...item, replies: update(item.replies) };
      }
      return item;
    });
    setComments((prev) => update(prev));
  };

  const renderComment = (comment, depth = 0, commentNumber = 0) => (
    <CommentItem
      key={comment.id}
      comment={comment}
      depth={depth}
      user={user}
      isModerator={isModerator}
      onReply={handleAddComment}
      onLike={handleToggleLike}
      onDelete={handleDelete}
      onReport={handleReport}
      onModeration={handleModeration}
      commentNumber={commentNumber}
    />
  );

  return (
    <div className="comment-section">
      <h4>Comments</h4>

      {user ? (
        <div className="comment-composer">
          <textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button className="button" onClick={() => handleAddComment(newComment)}>
            Post Comment
          </button>
        </div>
      ) : (
        <div className="comment-signin-hint">
          <p>Please sign in to join the conversation.</p>
        </div>
      )}

      {loading && <div className="loading">Loading comments...</div>}
      {!loading && error && <div className="error">{error}</div>}
      {!loading && !error && comments.length === 0 && (
        <div className="empty-state">
          <p>No comments yet. Be the first to share your perspective!</p>
        </div>
      )}
      {!loading && !error && comments.length > 0 && comments.map((comment, index) => renderComment(comment, 0, index))}
    </div>
  );
}

function CommentItem({ comment, depth, user, isModerator, onReply, onLike, onDelete, onReport, onModeration, commentNumber }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const canDelete = user && (user.id === comment.userId || isModerator);
  const canReply = Boolean(user);
  const canReport = user && user.id !== comment.userId;

  const handleReplySubmit = () => {
    onReply(replyText, comment.id);
    setReplyText('');
    setReplying(false);
  };

  const formatDate = (ts) => new Date(ts).toLocaleString();

  return (
    <div className={`comment-item comment-depth-${depth}`}>
      {depth > 0 && <div className="comment-connector"></div>}
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-number">#{commentNumber}</span>
          <strong className="comment-author">{comment.username || 'User'}</strong>
          <span className="comment-timestamp">{formatDate(comment.createdAt)}</span>
        </div>
        {comment.hidden ? (
          <div className="comment-hidden">This comment has been hidden by a moderator.</div>
        ) : (
          <p className="comment-body">{comment.content}</p>
        )}
        <div className="comment-actions">
          <button
            className={`link-button ${comment.likedByViewer ? 'active' : ''}`}
            onClick={() => onLike(comment)}
            disabled={!user}
          >
            ❤️ {comment.likesCount || 0}
          </button>
          {canReply && (
            <button className="link-button" onClick={() => setReplying((prev) => !prev)}>
              {replying ? 'Cancel' : 'Reply'}
            </button>
          )}
          {canReport && (
            <button className="link-button" onClick={() => onReport(comment)}>
              Report
            </button>
          )}
          {canDelete && (
            <button className="link-button" onClick={() => onDelete(comment)}>
              Delete
            </button>
          )}
          {isModerator && (
            comment.hidden ? (
              <button className="link-button" onClick={() => onModeration(comment, 'restore')}>
                Restore
              </button>
            ) : (
              <button className="link-button" onClick={() => onModeration(comment, 'hide')}>
                Hide
              </button>
            )
          )}
        </div>

        {replying && (
          <div className="comment-reply-form">
            <textarea
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <button className="button" onClick={handleReplySubmit} disabled={!replyText.trim()}>
              Reply
            </button>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((reply, replyIndex) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                user={user}
                isModerator={isModerator}
                onReply={onReply}
                onLike={onLike}
                onDelete={onDelete}
                onReport={onReport}
                onModeration={onModeration}
                commentNumber={`${commentNumber}.${replyIndex}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentSection;

