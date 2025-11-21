import React, { useState, useEffect } from 'react';
import useScreenWidth from '../hooks/useScreenWidth';

const PricingPlans: React.FC = () => {
  const screenWidth = useScreenWidth();
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % 3);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + 3) % 3);
  };

  // Plan data for cleaner code
  const plans = [
    {
      id: 'elan',
      name: '🌱 Plan ÉLAN',
      tagline: 'Pour poser les bases de votre image',
      badge: { text: 'Débuter fort', color: 'elan' },
      features: {
        content: [
          '2 vidéos UGC créées à partir de votre univers produit',
          '3 photos produits professionnelles',
          '1 influenceur assigné à votre marque',
          '1 mini spot publicitaire vertical (Reel/TikTok)'
        ],
        strategy: [
          'Mini audit de votre marque et de votre audience',
          'Accompagnement sur la stratégie de contenu',
          'Gestion optionnelle des réseaux sociaux',
          'Optimisation de la première campagne publicitaire'
        ]
      },
      advantage: 'Idéal pour les jeunes marques qui veulent lancer leur communication avec impact.',
      idealFor: 'les e-commerçants, les entreprises locales et ceux qui débutent.'
    },
    {
      id: 'marque',
      name: '🎖️ Plan MARQUE',
      tagline: 'Pour développer votre notoriété',
      badge: { text: 'Croissance & expansion', color: 'marque' },
      popular: true,
      features: {
        content: [
          '5 vidéos UGC orientées conversion',
          '6 photos produits créatives',
          '2 influenceurs dédiés selon votre niche',
          '1 série complète de spots publicitaires cinématiques',
          'Vidéos verticales multi-format'
        ],
        strategy: [
          'Audit complet de votre marque',
          'Stratégie marketing sur 3 mois',
          'Gestion publicitaire sur Meta Ads + TikTok',
          'Suivi mensuel des performances et ajustements'
        ]
      },
      advantage: 'Parfait pour les marques qui veulent accélérer avec du contenu régulier, stylé et orienté résultats.',
      idealFor: 'les marques en pleine croissance et en essor.'
    },
    {
      id: 'entreprise',
      name: '👑 Plan ENTREPRISE',
      tagline: 'Pour s\'imposer durablement',
      badge: { text: 'Luxe & performance', color: 'entreprise' },
      features: {
        content: [
          '10 vidéos UGC 4K premium',
          '12 photos produits artistiques',
          '3 influenceurs stratégiques selon votre audience',
          '1 série complète de spots publicitaires cinématiques',
          'Captation drone + motion design avancé'
        ],
        strategy: [
          'Audit approfondi de votre marque & de vos publicités',
          'Stratégie marketing personnalisée sur 3 mois',
          'Gestion publicitaire multi-plateforme',
          'Analyse comportementale de l\'audience',
          'Suivi hebdomadaire + optimisations continues'
        ]
      },
      advantage: 'Une stratégie de contenu à la hauteur des grandes marques.',
      idealFor: 'les grandes marques et les entreprises établies.'
    }
  ];

  const openChatbot = (planName: string) => {
    const chatbotButton = document.querySelector('.chatbot-toggler') as HTMLElement;
    if (chatbotButton) {
      chatbotButton.click();
      setTimeout(() => {
        const event = new CustomEvent('chatbotContext', {
          detail: { 
            plan: planName, 
            message: `Je suis intéressé par le ${planName}` 
          }
        });
        window.dispatchEvent(event);
      }, 500);
    }
  };

  const PricingCard = ({ plan, isPopular = false }: { plan: any, isPopular?: boolean }) => (
    <div className={`pricing-card ${plan.id}-card ${isPopular ? 'popular' : ''}`}>
      <div className={`pricing-badge ${plan.badge.color}-badge`}>
        <span>{plan.badge.text}</span>
      </div>
      
      {isPopular && (
        <div className="popular-badge">
          <span>Populaire</span>
        </div>
      )}

      <div className="pricing-card-content">
        <h3>{plan.name}</h3>
        <p className="plan-tagline">{plan.tagline}</p>

        <div className="pricing-features">
          <div className="feature-group">
            <h4>🎬 Contenu :</h4>
            <ul>
              {plan.features.content.map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="feature-group">
            <h4>📈 Stratégie & analyse :</h4>
            <ul>
              {plan.features.strategy.map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="pricing-advantage">
            <p><strong>✨ Avantage clé :</strong> {plan.advantage}</p>
            <p><strong>Idéal pour :</strong> {plan.idealFor}</p>
          </div>
        </div>

        <button 
          className="pricing-cta-button"
          onClick={() => openChatbot(plan.name)}
        >
          Choisir ce plan
        </button>
      </div>
    </div>
  );

  return (
    <section className="pricing-plans-section">
      <div className="pricing-plans-container">
        <h2 className="pricing-plans-title">
          Choisissez l'expérience qui propulse votre image
        </h2>
        <p className="pricing-plans-subtitle">
          Des solutions pensées pour chaque vision
        </p>

        {screenWidth >= 769 ? (
          // Desktop: Grid statique
          <div className="pricing-plans-grid">
            {plans.map((plan, index) => (
              <PricingCard 
                key={plan.id} 
                plan={plan} 
                isPopular={plan.popular}
              />
            ))}
          </div>
        ) : (
          // Mobile: Carousel fonctionnel
          <div className="pricing-plans-mobile-carousel">
            <div className="carousel-wrapper">
              <div 
                className="pricing-cards-track"
                style={{ 
                  transform: `translateX(-${currentIndex * 100}%)`,
                  transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
              >
                {plans.map((plan, index) => (
                  <div key={plan.id} className="carousel-slide">
                    <PricingCard 
                      plan={plan} 
                      isPopular={plan.popular}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation buttons for mobile carousel */}
            <div className="carousel-navigation">
              <button 
                className="carousel-nav-btn prev" 
                onClick={prevSlide}
                aria-label="Plan précédent"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <div className="carousel-indicators">
                {plans.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Aller au plan ${index + 1}`}
                  />
                ))}
              </div>
              
              <button 
                className="carousel-nav-btn next" 
                onClick={nextSlide}
                aria-label="Plan suivant"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingPlans;