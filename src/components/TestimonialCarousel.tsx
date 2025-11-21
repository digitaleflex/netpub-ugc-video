import React, { useState, FC } from 'react';
import { testimonials } from '../constants';

const TestimonialCarousel: FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
    };

    const getSlideClass = (index: number) => {
        const total = testimonials.length;
        if (index === currentIndex) return 'slide-active';
        
        const prevIndex = (currentIndex - 1 + total) % total;
        if (index === prevIndex) return 'slide-prev';

        const nextIndex = (currentIndex + 1) % total;
        if (index === nextIndex) return 'slide-next';
        
        const prev2Index = (currentIndex - 2 + total) % total;
        if(index === prev2Index) return 'slide-hidden-prev';

        const next2Index = (currentIndex + 2 + total) % total;
         if(index === next2Index) return 'slide-hidden-next';

        return 'slide-hidden';
    };
    
    const renderStars = (rating: number = 5) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < rating ? 'star-filled' : 'star-empty'}>★</span>
        ));
    }


    return (
        <section className="testimonial-carousel-section">
            <div className="testimonials-header">
                <h2>Ce que nos clients disent</h2>
                <p>La confiance est au cœur de chaque collaboration réussie.</p>
            </div>
            <div className="testimonial-carousel">
                <div className="carousel-track-3d">
                    {testimonials.map((testimonial, index) => (
                        <div key={testimonial.id} className={`testimonial-slide-3d ${getSlideClass(index)}`}>
                             <div className="testimonial-card-carousel">
                                <div className="testimonial-rating">{renderStars(testimonial.rating)}</div>
                                <blockquote>"{testimonial.quote}"</blockquote>
                                <cite>
                                    <span className="author">{testimonial.author}</span>
                                    <span className="company">{testimonial.company}</span>
                                </cite>
                            </div>
                        </div>
                    ))}
                </div>


                <button className="carousel-nav prev" onClick={handlePrev} aria-label="Témoignage précédent">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
                </button>
                <button className="carousel-nav next" onClick={handleNext} aria-label="Témoignage suivant">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
                </button>
            </div>
        </section>
    );
};

export default TestimonialCarousel;
