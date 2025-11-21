import React, { useState, useEffect, useRef } from 'react';
import ProjectFeedItem from './ProjectFeedItem';
import { PortfolioProject } from '../types';
import './ProjectFeed.css';

interface ProjectFeedProps {
  projects: PortfolioProject[];
  initialProjectIndex: number;
  onClose: () => void;
}

const ProjectFeed: React.FC<ProjectFeedProps> = ({ projects, initialProjectIndex, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(initialProjectIndex);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = feedContainerRef.current;
    if (!container) return;

    // Fait défiler jusqu'à l'élément initial
    const initialElement = container.querySelector(`[data-index="${initialProjectIndex}"]`) as HTMLElement;
    if (initialElement) {
      initialElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
            setActiveIndex(index);
          }
        });
      },
      {
        root: container,
        threshold: 0.5, // 50% de l'élément doit être visible
      }
    );

    // Observe tous les éléments
    const itemsToObserve = container.querySelectorAll('.project-item-wrapper');
    itemsToObserve.forEach(item => observer.observe(item));

    return () => {
      observer.disconnect();
    };
  }, [projects, initialProjectIndex]);

  return (
    <div className="project-feed-container" ref={feedContainerRef}>
      <button className="close-feed-button" onClick={onClose}>×</button>
      {projects.map((project, index) => (
        <div 
          key={project.id} 
          className="project-item-wrapper" // Conteneur pour l'observation
          data-index={index}
        >
          <ProjectFeedItem project={project} isActive={index === activeIndex} />
        </div>
      ))}
    </div>
  );
};

export default ProjectFeed;