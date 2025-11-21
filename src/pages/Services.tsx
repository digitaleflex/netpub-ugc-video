import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { newServicesData, newWhyChooseUsPillars } from '../constants';
import useOnScreen from '../hooks/useOnScreen';
import TestimonialCarousel from '../components/TestimonialCarousel';
import CallToAction from '../components/CallToAction';
import { useChatbot } from '../contexts/ChatbotContext'; // Import useChatbot
import SEO from '../components/SEO';


const Services: React.FC = () => {
    // Refs for fade-in animations
    const servicesRef = useRef<HTMLDivElement>(null);
    const isServicesVisible = useOnScreen(servicesRef, { threshold: 0.1 });

    const whyChooseUsRef = useRef<HTMLDivElement>(null);
    const isWhyChooseUsVisible = useOnScreen(whyChooseUsRef, { threshold: 0.1 });

    // State for 3D card rotation
    const [cardTransforms, setCardTransforms] = useState<{ [key: number]: { rotateX: number; rotateY: number; translateX: number; translateY: number; } }>({});

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element.
        const y = e.clientY - rect.top;  // y position within the element.

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10; // Adjust sensitivity
        const rotateY = (x - centerX) / 10; // Adjust sensitivity
        const translateX = (x - centerX) / 20; // Adjust sensitivity
        const translateY = (y - centerY) / 20; // Adjust sensitivity

        setCardTransforms(prev => ({
            ...prev,
            [index]: { rotateX, rotateY, translateX, translateY }
        }));
    };

    const handleMouseLeave = (index: number) => {
        setCardTransforms(prev => ({
            ...prev,
            [index]: { rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 }
        }));
    };

    const { openChatbot } = useChatbot(); // Get openChatbot from context

    return (
        <div className="page-container services-page">
            <SEO 
              title="Services - Création de Vidéos UGC, Storytelling & Montage Publicitaire"
              description="Découvrez les services de NetPub : production de vidéos UGC authentiques, storytelling, scénarisation, montage vidéo optimisé pour les publicités, et design sonore."
              keywords="services, production vidéo, vidéos UGC, storytelling, montage vidéo, publicité, design sonore, netpub"
            />

            {/* Section NOS SERVICES */}
            <section ref={servicesRef} className={`services-new-section fade-up-section ${isServicesVisible ? 'is-visible' : ''}`}>
                <div className="services-header text-center">
                    <h1 className="section-title">Nos services créatifs</h1>
                    <p className="section-subtitle">De la stratégie au rendu final, on donne vie à vos produits à travers des vidéos qui captent, émeuvent et convertissent.</p>
                </div>
                <div className="services-grid-3d-container">
                    {newServicesData.map((service, index) => (
                        <div
                            key={index}
                            className="service-card-3d"
                            onMouseMove={(e) => handleMouseMove(e, index)}
                            onMouseLeave={() => handleMouseLeave(index)}
                            style={{
                                transform: `perspective(1000px) rotateX(${cardTransforms[index]?.rotateX || 0}deg) rotateY(${cardTransforms[index]?.rotateY || 0}deg) translateX(${cardTransforms[index]?.translateX || 0}px) translateY(${cardTransforms[index]?.translateY || 0}px)`,
                                transition: 'transform 0.1s ease-out' // Smoother immediate response
                            }}
                        >
                            <video className="service-card-video-bg" src={service.videoUrl} autoPlay loop muted playsInline></video>
                            <div className="service-card-overlay">
                                <div className="service-card-content">
                                    <h3>{service.title}</h3>
                                    <p>{service.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center cta-services-bottom">
                    <button onClick={openChatbot} className="cta-button">Créez votre prochaine campagne</button>
                </div>
            </section>

            {/* Section POURQUOI NOUS CHOISIR ? */}
            <section ref={whyChooseUsRef} className={`why-choose-us-new-section fade-up-section ${isWhyChooseUsVisible ? 'is-visible' : ''}`}>
                <div className="why-choose-us-header text-center">
                    <h2 className="section-title">Pourquoi nous choisir ?</h2>
                    <p className="section-subtitle">Parce que nous ne faisons pas de la publicité. Nous créons des émotions qui font vendre.</p>
                </div>
                <div className="why-choose-us-pillars-grid">
                    {newWhyChooseUsPillars.map((pillar, index) => (
                        <div key={index} className="why-choose-us-pillar-card">
                            <div className="pillar-main-content">
                                <h3>{pillar.title}</h3>
                            </div>
                            <div className="pillar-overlay-content">
                                <p>{pillar.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center cta-why-choose-us-bottom">
                    <button onClick={openChatbot} className="cta-button-secondary">✉️ Discutons de votre projet</button>
                </div>
            </section>

            {/* Section Témoignages */}
            <TestimonialCarousel />

            {/* Section Call To Action */}
            <CallToAction />

        </div>
    );
};

export default Services;
