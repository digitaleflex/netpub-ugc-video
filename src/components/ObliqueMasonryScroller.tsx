import React, { useRef } from 'react';
import useOnScreen from '../hooks/useOnScreen';
import { Link } from 'react-router-dom';
import { PortfolioProject } from '../types';
import PortfolioCard from './PortfolioCard';

interface ObliqueMasonryScrollerProps {
  projects: PortfolioProject[];
  onProjectClick: (project: PortfolioProject) => void;
  aspectRatio?: 'auto' | '9:16';
}

const ObliqueMasonryScroller: React.FC<ObliqueMasonryScrollerProps> = ({ projects, onProjectClick, aspectRatio }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(scrollerRef, { threshold: 0.1 });

  if (!projects || projects.length === 0) {
    return <div>Chargement des projets...</div>;
  }

  return (
    <section ref={scrollerRef} className={`oblique-masonry-section ${isVisible ? 'is-visible' : ''}`}>
      <div className="masonry-grid">
        {projects.map((project) => (
          <PortfolioCard
            key={project.id}
            project={project}
            onClick={onProjectClick}
            aspectRatio={aspectRatio}
          />
        ))}
      </div>
    </section>
  );
};

export default ObliqueMasonryScroller;// Force re-compilation
// Force re-compilation
