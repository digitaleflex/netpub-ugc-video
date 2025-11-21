import React, { Suspense, lazy } from 'react';
import AnimatedHero from '../components/AnimatedHero'; // Re-added
import ClientMarquee from '../components/ClientMarquee';
import ObliqueMasonryScroller from '../components/ObliqueMasonryScroller';
import { portfolioProjects, featuredProjectIds } from '../constants';
import { PortfolioProject } from '../types';
import StatsSection from '../components/StatsSection';
import { Link } from 'react-router-dom';
import useScreenWidth from '../hooks/useScreenWidth';
import MasonryGrid from '../components/MasonryGrid';

import SEO from '../components/SEO';

// Lazy load components that are below the fold
const PricingPlans = lazy(() => import('../components/PricingPlans'));
const TestimonialCarousel = lazy(() => import('../components/TestimonialCarousel'));
const CallToAction = lazy(() => import('../components/CallToAction'));

const Home: React.FC = () => {
    const screenWidth = useScreenWidth();
    const isMobile = screenWidth < 768;

    const handleProjectClick = (project: PortfolioProject) => {
        // Future implementation: handle project click, e.g., open a modal or navigate to a project page
    };

    const featuredProjects = portfolioProjects
        .filter(p => featuredProjectIds.includes(p.id))
        .sort((a, b) => featuredProjectIds.indexOf(a.id) - featuredProjectIds.indexOf(b.id));

    return (
        <div className="page-container home-page">
            <SEO 
              title="Agence Vidéo UGC & Création de Contenu Publicitaire"
              description="NetPub est une agence spécialisée dans la création de vidéos UGC (User Generated Content) et de spots publicitaires percutants pour les marques. Boostez votre engagement et vos conversions."
              keywords="agence UGC, vidéo UGC, création de contenu, spot publicitaire, marketing vidéo, créateurs de contenu, netpub"
            />
            <AnimatedHero /> {/* Re-added */}
            <ClientMarquee />
                        <div className="oblique-masonry-header">
              <h2>Un aperçu de notre travail</h2>
              <p>Plongez dans un univers de créativité et découvrez comment nous donnons vie aux marques.</p>
              <Link to="/portfolio" className="cta-button-secondary">Voir tout le portfolio</Link>
            </div>
            <MasonryGrid projects={featuredProjects.slice(0, 12)} onProjectClick={handleProjectClick} />
            <StatsSection />
            <Suspense fallback={<div>Chargement...</div>}>
              <PricingPlans />
              <TestimonialCarousel />
              <CallToAction />
            </Suspense>
        </div>
    );
};

export default Home;
