import React from 'react';
import './StatCard.scss';

/**
 * StatCard — KPI metric card for ERP dashboard overview rows.
 */
const StatCard = ({
    title,
    value,
    icon,
    trend,
    trendUp,
    subtitle,
    color = 'primary',
}) => (
    <div className="t-stat-card">
        {icon && (
            <div className={`t-stat-card__icon t-stat-card__icon--${color}`}>
                <i className={icon} aria-hidden="true" />
            </div>
        )}
        <div className="t-stat-card__body">
            <p className="t-stat-card__title">{title}</p>
            <p className="t-stat-card__value">{value}</p>
            {(trend || subtitle) && (
                <div className="t-stat-card__meta">
                    {trend && (
                        <span className={`t-stat-card__trend t-stat-card__trend--${trendUp ? 'up' : 'down'}`}>
                            <i className={trendUp ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} aria-hidden="true" />
                            {trend}
                        </span>
                    )}
                    {subtitle && <span className="t-stat-card__subtitle">{subtitle}</span>}
                </div>
            )}
        </div>
    </div>
);

export default StatCard;
