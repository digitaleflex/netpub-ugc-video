import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { useChatbot } from '../contexts/ChatbotContext';

import ImageTrail from './ImageTrail';

const subtitles = [
  'Créez des publicités qui font ressentir, pas juste regarder.',
  'Des vidéos UGC qui font vendre. Simplement.',
  'L’art de raconter votre marque, en vidéo.',
  'Stop au contenu fade. Faites vibrer votre marque.',
];

const trailMedia: { url: string; type: 'image' | 'video' }[] = [
    { url: '/images/1.png', type: 'image' }, { url: '/images/2.png', type: 'image' }, { url: '/images/3.png', type: 'image' }, { url: '/images/4.png', type: 'image' },
    { url: '/images/5.png', type: 'image' }, { url: '/images/6.png', type: 'image' }, { url: '/images/7.png', type: 'image' }, { url: '/images/8.png', type: 'image' },
    { url: '/images/9.png', type: 'image' }, { url: '/images/10.png', type: 'image' }, { url: '/images/11.png', type: 'image' }, { url: '/images/12.png', type: 'image' },
    { url: '/images/13.png', type: 'image' }, { url: '/images/14.png', type: 'image' }, { url: '/images/15.png', type: 'image' }, { url: '/images/16.png', type: 'image' },
    { url: '/video-mode/Design sans titre (1).mp4', type: 'video' },
    { url: '/video-mode/Design sans titre (2).mp4', type: 'video' },
    { url: '/video-mode/Design sans titre (3).mp4', type: 'video' },
    { url: '/video-mode/Design sans titre.mp4', type: 'video' },
];

const AnimatedHero = () => {
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [animationPhase, setAnimationPhase] = useState('in'); // 'in' or 'out'
  const { openChatbot } = useChatbot();

  useEffect(() => {
    let phaseTimer: NodeJS.Timeout;

    if (animationPhase === 'in') {
      phaseTimer = setTimeout(() => {
        setAnimationPhase('out');
      }, 2800);
    } else {
      phaseTimer = setTimeout(() => {
        setSubtitleIndex(prevIndex => (prevIndex + 1) % subtitles.length);
        setAnimationPhase('in');
      }, 500);
    }

    return () => clearTimeout(phaseTimer);
  }, [animationPhase]);

  return (
    <section 
      className="hero-section relative w-full min-h-screen overflow-hidden" 
      id="hero-section"
    >
      <div className="container mx-auto px-4 relative z-10 col-start-1 row-start-1">
        <div className="max-w-4xl mx-auto text-center">
          <div style={{ height: '100px' }}></div> {/* Spacer div */} 
          <h1 className="hero-main-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            Votre agence vidéo UGC & Spots 4K pour réseaux sociaux.
          </h1>
          
          <div className="hero-subtitles h-16 md:h-20 mb-8 flex items-center justify-center">
            <p 
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#aaa',
                transition: 'opacity 500ms ease-in-out',
                opacity: animationPhase === 'in' ? 1 : 0,
              }}
            >
              {subtitles[subtitleIndex]}
            </p>
          </div>
          
          <div className="hero-cta-buttons flex flex-col sm:flex-row gap-4 sm:gap-8 md:gap-16 justify-center">
            <button 
              onClick={openChatbot}
              className="cta-button bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-300"
            >
              Créez votre prochaine pub
            </button>
            <Link 
              to="/portfolio" 
              className="cta-button-secondary border-2 border-white text-white hover:bg-white hover:text-black font-semibold py-3 px-8 rounded-full transition-colors duration-300"
            >
              Voir nos réalisations
            </Link>
          </div>
        </div>
      </div>
      
      <Suspense fallback={null}>
        <ImageTrail media={trailMedia} className="absolute inset-0 pointer-events-none col-start-1 row-start-1" />
      </Suspense>
    </section>
  );
};

export default AnimatedHero;