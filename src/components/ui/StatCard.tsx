import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isUp: boolean;
    };
    color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color = 'var(--accent-brand)' }) => {
    return (
        <div className="stat-card premium-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}15`, color: color }}>
                <Icon size={24} />
            </div>
            <div className="stat-content">
                <p className="stat-title">{title}</p>
                <h3 className="stat-value">{value}</h3>
                {trend && (
                    <p className={`stat-trend ${trend.isUp ? 'trend-up' : 'trend-down'}`}>
                        <span>{trend.isUp ? '↑' : '↓'} {trend.value}%</span> vs le mois dernier
                    </p>
                )}
            </div>
        </div>
    );
};
