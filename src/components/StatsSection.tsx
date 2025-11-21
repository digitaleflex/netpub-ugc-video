import React, { useRef } from 'react';
import { companyStats } from '../constants';
import useOnScreen from '../hooks/useOnScreen';
import useCountUp from '../hooks/useCountUp';

const StatCounter: React.FC<{ end: number; suffix?: string }> = ({ end, suffix = '' }) => {
    const count = useCountUp(end, 2000);
    return <span className="stat-number">{Math.round(count)}{suffix}</span>;
};

interface StatsSectionProps {
    title?: string;
}

const StatsSection: React.FC<StatsSectionProps> = ({ title }) => {
    const statsRef = useRef<HTMLDivElement>(null);
    const isStatsVisible = useOnScreen(statsRef, { threshold: 0.2 });

    return (
        <section ref={statsRef} className={`stats-section fade-up-section ${isStatsVisible ? 'is-visible' : ''}`}>
            {title && <h2 className="section-title text-center">{title}</h2>}
            <div className="stats-grid">
                {companyStats.map((stat, index) => (
                    <div key={index} className="stat-item" style={{ transitionDelay: `${index * 100}ms` }}>
                        {isStatsVisible && <StatCounter end={stat.value} suffix={stat.suffix} />}
                        <p className="stat-label">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default StatsSection;
