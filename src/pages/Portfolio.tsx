import React, { useState, useMemo } from 'react';
import { portfolioProjects, featuredProjectIds } from '../constants';
import { PortfolioCategory, PortfolioProject } from '../types';
import MasonryGrid from '../components/MasonryGrid';
import ProjectFeed from '../components/ProjectFeed';
import TestimonialCarousel from '../components/TestimonialCarousel';
import CallToAction from '../components/CallToAction';
import SEO from '../components/SEO';



const Portfolio: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<PortfolioCategory | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
  const [initialProjectIndex, setInitialProjectIndex] = useState(0);

  const categories = ['All', ...Object.values(PortfolioCategory)];

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') {
      // Create a map for quick lookup
      const featuredMap = new Map(featuredProjectIds.map((id, index) => [id, index]));
      // Filter and sort based on the user's specific list
      return portfolioProjects
        .filter(p => featuredMap.has(p.id))
        .sort((a, b) => (featuredMap.get(a.id) ?? 0) - (featuredMap.get(b.id) ?? 0));
    }
    return portfolioProjects.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const handleCardClick = (project: PortfolioProject) => {
    const projectIndex = filteredProjects.findIndex(p => p.id === project.id);
    setInitialProjectIndex(projectIndex);
    setViewMode('feed');
  };

  const handleCloseFeed = () => {
    setViewMode('grid');
  };

  if (viewMode === 'feed') {
    return (
      <ProjectFeed 
        projects={filteredProjects} 
        initialProjectIndex={initialProjectIndex} 
        onClose={handleCloseFeed} 
      />
    );
  }

  return (
    <div className="page-container portfolio-page">
      <SEO 
        title="Portfolio - Nos Réalisations de Vidéos UGC & Publicitaires"
        description="Explorez les réalisations de NetPub. Découvrez notre portfolio de vidéos UGC, de spots publicitaires créatifs et de contenu de marque qui captivent et convertissent."
        keywords="portfolio, réalisations, vidéos UGC, spots publicitaires, contenu de marque, études de cas, netpub"
      />
      <header className="article-header text-center">
        <p className="article-meta">Notre travail</p>
        <h1>Découvrez nos réalisations</h1>
      </header>
      
      <div className="portfolio-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category as PortfolioCategory | 'All')}
          >
            {category === 'All' ? 'Tous les projets' : category}
          </button>
        ))}
      </div>

      <MasonryGrid projects={filteredProjects} onProjectClick={handleCardClick} />

      <TestimonialCarousel />
      <CallToAction />
    </div>
  );
};

export default Portfolio;