import { useState, useEffect } from 'react';

const useScreenWidth = () => {
    // Initialise avec 0 au lieu de window.innerWidth
    const [width, setWidth] = useState(0);

    useEffect(() => {
        // Vérifie si on est côté client
        if (typeof window !== 'undefined') {
            const handleResize = () => {
                setWidth(window.innerWidth);
            };

            // Initialise la valeur
            handleResize();

            window.addEventListener('resize', handleResize);

            // Cleanup listener on component unmount
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    return width;
};

export default useScreenWidth;