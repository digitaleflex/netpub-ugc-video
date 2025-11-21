import React, { useRef } from 'react';
import { ourValues, ourMethod } from '../constants';
import useOnScreen from '../hooks/useOnScreen';
import StatsSection from '../components/StatsSection';
import TestimonialCarousel from '../components/TestimonialCarousel';
import CallToAction from '../components/CallToAction';
import ElectricBorder from '../components/ElectricBorder';

const About: React.FC = () => {
    // Refs for fade-in animations
    const introRef = useRef<HTMLDivElement>(null);
    const valuesRef = useRef<HTMLDivElement>(null);
    const methodRef = useRef<HTMLDivElement>(null);

    const isIntroVisible = useOnScreen(introRef, { threshold: 0.2 });
    const isValuesVisible = useOnScreen(valuesRef, { threshold: 0.2 });
    const isMethodVisible = useOnScreen(methodRef, { threshold: 0.1 });

    return (
        <div className="page-container new-about-page">

            {/* 1. Introduction Section */}
            <section ref={introRef} className={`about-intro-section fade-up-section ${isIntroVisible ? 'is-visible' : ''}`}>
                <div className="intro-text-content">
                    <h1 className="intro-title">Nous créons des histoires que les marques n’oublient jamais.</h1>
                    <p className="intro-paragraph">
                        Notre mission est de transformer votre vision en contenu vidéo captivant qui résonne avec votre audience, crée une connexion authentique et génère des résultats concrets. Nous sommes plus qu'une agence, nous sommes votre partenaire créatif.
                    </p>
                </div>
                <div className="intro-image-pills-container">
                    <div className="image-pill pill-1">
                        <img src="/images/9.png" alt="Image 9" />
                    </div>
                    <div className="image-pill pill-2">
                        <img src="/images/15.png" alt="Image 15" />
                    </div>
                    <div className="image-pill pill-3">
                        <img src="/images/8.png" alt="Image 8" />
                    </div>
                    <div className="image-pill pill-4">
                        <img src="/images/14.png" alt="Image 14" />
                    </div>
                </div>
            </section>

            {/* 2. Values Section */}
            <section ref={valuesRef} className={`values-section fade-up-section ${isValuesVisible ? 'is-visible' : ''}`}>
                <h2 className="section-title text-center">Notre Valeur</h2>
                <div className="values-grid">
                    {ourValues.map((value, index) => (
                        <ElectricBorder key={index} color="#5227FF">
                            <div className="value-card" style={{ transitionDelay: `${index * 150}ms`, height: '100%' }}>
                                <div className="value-icon">{value.icon}</div>
                                <h3 className="value-title">{value.title}</h3>
                                <p className="value-description">{value.description}</p>
                            </div>
                        </ElectricBorder>
                    ))}
                </div>
            </section>

            {/* 4. Method Section */}
            <section ref={methodRef} className="method-section">
                <h2 className="section-title text-center">Notre méthode</h2>
                <div className="timeline">
                    {ourMethod.map((item, index) => (
                        <div key={index} className={`timeline-item fade-up-section ${isMethodVisible ? 'is-visible' : ''}`} style={{ transitionDelay: `${index * 200}ms` }}>
                            <div className="timeline-step">{item.step}</div>
                            <div className="timeline-content">
                                <h3 className="timeline-title">{item.title}</h3>
                                <p className="timeline-description">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Impact Section */}
            <StatsSection title="Notre Impact" />

            {/* Section Avis */}
            <TestimonialCarousel />

            {/* 6. Final CTA Section */}
            <CallToAction />

        </div>
    );
};

export default About;