import React, { useState, useEffect } from 'react';
import { Comment as CommentType, PortfolioProject } from '../types';
import Comment from './Comment';
import './Comment.css'; // Assuming styles will be in Comment.css

import { fetchCsrfToken } from '../utils/csrf';

const GRAPHQL_ENDPOINT = '/graphql';

interface CommentThreadProps {
  project: PortfolioProject;
  setIsCommenting: (isCommenting: boolean) => void;
  onCommentAdded: () => void;
}

const CommentThread: React.FC<CommentThreadProps> = ({ project, setIsCommenting, onCommentAdded }) => {
  const [comments, setComments] = useState<CommentType[]>(project.comments || []);
  const [newComment, setNewComment] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let id = localStorage.getItem('viewerId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('viewerId', id);
    }
    setUserId(id);
  }, []);

  const handleAddComment = async () => {
    if (!newComment.trim() || !userId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const csrf = await fetchCsrfToken();
      if (!csrf) {
        throw new Error('CSRF token not available');
      }

      const variables = { projectId: project.id, content: newComment, anonymousId: userId };

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({
          query: `
            mutation AddComment($projectId: ID!, $content: String!, $anonymousId: String) {
              addComment(projectId: $projectId, content: $content, anonymousId: $anonymousId) {
                id
                content
                anonymousId
                createdAt
                user { id name }
                replies { id content }
              }
            }
          `,
          variables: { projectId: project.id, content: newComment, anonymousId: userId },
        }),
      });

      const result = await response.json();
      if (result.data && result.data.addComment) {
        setComments([...comments, result.data.addComment]);
        setNewComment('');
        setIsSubmitted(true);
        onCommentAdded();
        setTimeout(() => {
          setIsSubmitted(false);
        }, 2000); // Hide message after 2 seconds
      } else {
        throw new Error(result.errors?.[0]?.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      // Optionally show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comment-thread">
      <div className="comments-list">
        {comments.map(comment => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
      {isSubmitted ? (
        <div className="comment-submitted-message">
          <p>✔️ Votre commentaire a été envoyé !</p>
        </div>
      ) : (
        <div className="add-comment-form">
          <input
            type="text"
            value={newComment}
            onFocus={() => setIsCommenting(true)}
            onBlur={() => setIsCommenting(false)}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Laissez un commentaire..."
          />
          <button onClick={handleAddComment} disabled={!userId || isSubmitting}>
            <svg fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentThread;
