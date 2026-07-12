import React from 'react';
import { Link } from 'react-router';
import './Breadcrumb.scss';

const Breadcrumb = ({ items = [] }) => (
    <nav aria-label="Breadcrumb">
        <ol className="t-breadcrumb">
            {items.map((item, idx) => {
                const isLast = idx === items.length - 1;
                return (
                    <li key={`${item.label}-${idx}`} className="t-breadcrumb__item">
                        {isLast ? (
                            <span className="t-breadcrumb__current" aria-current="page">
                                {item.label}
                            </span>
                        ) : item.href ? (
                            <Link className="t-breadcrumb__link" to={item.href}>
                                {item.label}
                            </Link>
                        ) : (
                            <span className="t-breadcrumb__link">{item.label}</span>
                        )}
                        {!isLast && (
                            <i className="ri-arrow-right-s-line t-breadcrumb__sep" aria-hidden="true" />
                        )}
                    </li>
                );
            })}
        </ol>
    </nav>
);

export default Breadcrumb;
