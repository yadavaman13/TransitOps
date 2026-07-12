import React from 'react';
import './Card.scss';

const Card = ({ title, actions, padding = 'md', children, className = '' }) => (
    <div className={`t-card ${className}`}>
        {(title || actions) && (
            <div className="t-card__header">
                {title && <h3 className="t-card__title">{title}</h3>}
                {actions && <div>{actions}</div>}
            </div>
        )}
        <div className={`t-card__body t-card__body--${padding}`}>
            {children}
        </div>
    </div>
);

export default Card;
