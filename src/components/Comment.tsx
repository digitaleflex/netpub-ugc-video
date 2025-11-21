import React from 'react';
import './Comment.css';
import { Comment as CommentType } from '../types';

interface CommentProps {
  comment: CommentType;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  return (
    <div className="comment">
      <p className="comment-author">{comment.user ? comment.user.name : ''}</p>
      <p className="comment-text">{comment.content}</p>
      <p className="comment-timestamp">{new Date(comment.createdAt).toLocaleString()}</p>
    </div>
  );
};

export default Comment;
