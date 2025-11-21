import React from 'react';
import { PortfolioProject } from '../types';

interface VideoModalProps {
  project: PortfolioProject;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ project, onClose }) => {
  return (
    <div className="video-modal-backdrop" onClick={onClose}>
      <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
        <div className="video-wrapper">
            <video controls autoPlay src={project.videoUrl}>
              Votre navigateur ne supporte pas la balise vidéo.
            </video>
        </div>
        <div className="project-details">
            <h3>{project.title}</h3>
            <p className="client-name">{project.client}</p>
            <p><strong>Objectif:</strong> {project.objective}</p>
            <p><strong>Rôle:</strong> {project.role}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
