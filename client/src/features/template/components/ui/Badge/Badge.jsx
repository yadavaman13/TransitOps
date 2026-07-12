import React from 'react';
import './Badge.scss';

const Badge = ({ children, variant = 'neutral', size = 'md', icon, className = '' }) => (
    <span className={`t-badge t-badge--${variant} t-badge--${size} ${className}`}>
        {icon && <i className={icon} aria-hidden="true" />}
        {children}
    </span>
);

export default Badge;
