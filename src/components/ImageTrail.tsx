import React, { useRef } from 'react';
import { useImageTrail } from '../hooks/useImageTrail';
import './ImageTrail.css';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

interface ImageTrailProps {
  media: MediaItem[];
  className?: string;
}

const ImageTrail = ({ media, className }: ImageTrailProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Activate the image trail logic using the custom hook
  useImageTrail(containerRef as React.RefObject<HTMLElement>, media.map(item => item.url)); // Pass only URLs to the hook

  return (
    <div className={`content ${className || ''}`} ref={containerRef}>
      {media.map((item, i) => (
        <div className="content__img" key={i}>
          {item.type === 'video' ? (
            <video
              src={item.url}
              className="content__img-inner"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          ) : (
            <div className="content__img-inner" style={{ backgroundImage: `url(${item.url})` }} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ImageTrail;
