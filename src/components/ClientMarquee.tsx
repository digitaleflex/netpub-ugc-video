import React from 'react';
import { clientNames } from '../constants';

const ClientMarquee: React.FC = () => {
  // Duplicate for seamless loop, ensure enough items for the visual
  const extendedNames = [...clientNames, ...clientNames, ...clientNames, ...clientNames];

  return (
    <section className="client-marquee-section">
      <div className="marquee-track track-1">
        <div className="marquee-content">
          {extendedNames.map((name, index) => (
            <React.Fragment key={`t1-${index}`}>
              <span className="client-name">{name}</span>
              <span className="separator">★</span>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="marquee-track track-2">
         <div className="marquee-content">
          {extendedNames.map((name, index) => (
            <React.Fragment key={`t2-${index}`}>
              <span className="client-name">{name}</span>
              <span className="separator">★</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientMarquee;