import React from 'react';
import './SearchBar.scss';

/**
 * SearchBar — standalone search input.
 * @param {string}   value       - Current search value
 * @param {function} onChange    - Called with the new string value
 * @param {string}   placeholder
 */
const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
    <div className={`t-search-bar ${className}`}>
        <i className="ri-search-line t-search-bar__icon" aria-hidden="true" />
        <input
            type="search"
            className="t-search-bar__input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
        />
        {value && (
            <button
                type="button"
                className="t-search-bar__clear"
                onClick={() => onChange('')}
                aria-label="Clear search"
            >
                <i className="ri-close-line" />
            </button>
        )}
    </div>
);

export default SearchBar;
