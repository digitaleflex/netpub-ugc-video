import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'outline' | 'filled';
    status?: 'pending' | 'confirmed' | 'delivered' | 'cancelled' | 'managed' | 'default' | 'success' | 'warning' | 'info' | 'danger';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'filled', status = 'default', className = '' }) => {
    return (
        <span className={`premium-badge badge-${variant} status-${status} ${className}`}>
            {children}
        </span>
    );
};
