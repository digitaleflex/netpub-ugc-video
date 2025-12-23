import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    icon,
    className = '',
    ...props
}) => {
    return (
        <button
            className={`premium-btn btn-${variant} btn-${size} ${isLoading ? 'btn-loading' : ''} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <span className="btn-loader"></span>}
            {!isLoading && icon && <span className="btn-icon">{icon}</span>}
            <span className="btn-text">{children}</span>
        </button>
    );
};
