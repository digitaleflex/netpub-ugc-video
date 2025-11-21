import { useState, useEffect, RefObject } from 'react';

const useOnScreen = (
  ref: RefObject<HTMLElement>,
  options: IntersectionObserverInit = { rootMargin: '0px', threshold: 0.1 }
): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Mettre à jour l'état seulement si l'élément devient visible
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Une fois visible, on n'a plus besoin d'observer
        observer.unobserve(entry.target);
      }
    }, options);

    const currentElement = ref.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, options.rootMargin, options.threshold]); // S'assurer que l'effet se relance si les options changent

  return isVisible;
};

export default useOnScreen;
