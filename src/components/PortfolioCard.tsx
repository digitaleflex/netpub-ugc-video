import React from 'react';
import { PortfolioProject } from '../types';
import { Heart, MessageCircle } from 'lucide-react';
import './PortfolioCard.css';

interface PortfolioCardProps {
  project: PortfolioProject;
  onClick: (project: PortfolioProject) => void;
  aspectRatio?: 'auto' | '9:16';
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ project, onClick, aspectRatio = 'auto' }) => {

  const cardClassName = `portfolio-card ${aspectRatio === '9:16' ? 'portfolio-card--9-16' : ''}`;

  const renderMedia = () => {
    if (project.mediaType === 'video') {
      return (
        <video
          src={project.mediaUrl}
          poster={project.thumbnailUrl}
          alt={project.title}
          className="card-media"
          controls={false}
          loop
          muted
          playsInline
          preload="metadata"
          onMouseOver={e => e.currentTarget.play()}
          onMouseOut={e => e.currentTarget.pause()}
        />
      );
    } else {
      return (
        <img src={project.mediaUrl} alt={project.title} className="card-media" loading="lazy" />
      );
    }
  };

  return (
    <div className={cardClassName} onClick={() => onClick(project)}>      {renderMedia()}
      <div className="card-overlay">
        <div className="card-header">
          <h3 className="project-title">{project.title}</h3>
        </div>
        <div className="card-footer">
          <div className="project-stats">
            <Heart size={16} />
            <span>{project.likeCount || (Array.isArray(project.likes) ? project.likes.length : 0)}</span>
            <MessageCircle size={16} />
            <span>{project.commentCount || project.comments?.length || 0}</span>
          </div>
          <div className="project-tags">
            {project.tags?.map(tag => (
              <span key={tag} className="tag-badge">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;