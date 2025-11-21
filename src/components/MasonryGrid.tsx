import React from 'react';
import Masonry from 'react-masonry-css';
import { PortfolioProject } from '../types';
import PortfolioCard from './PortfolioCard';
import './MasonryGrid.css';

interface MasonryGridProps {
  projects: PortfolioProject[];
  onProjectClick: (project: PortfolioProject) => void;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ projects, onProjectClick }) => {
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    767: 2
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {projects.map((project) => (
        <PortfolioCard
          key={project.id}
          project={project}
          onClick={onProjectClick}
        />
      ))}
    </Masonry>
  );
};

export default MasonryGrid;
