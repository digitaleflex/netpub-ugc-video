import { lazy, Suspense } from 'react';

// Chargement dynamique avec lazy loading pour Vite
const ImageTrail = lazy(() => import('./ImageTrail'));

const BackgroundTrail = () => {
  return (
    <div className="background-trail">
      <Suspense fallback={null}>
        <ImageTrail />
      </Suspense>
    </div>
  );
};

export default BackgroundTrail;
