import React, { useState, useEffect, useRef } from 'react';
import './Dropdown.scss';

const Dropdown = ({
    trigger,
    items = [],
    align = 'right',
    className = '',
    children
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    return (
        <div className={`t-dropdown ${className}`} ref={containerRef}>
            <div className="t-dropdown__trigger" onClick={toggleDropdown}>
                {trigger}
            </div>

            {isOpen && (
                <div className={`t-dropdown__menu t-dropdown__menu--align-${align}`}>
                    {items.length > 0 ? (
                        <ul className="t-dropdown__list" role="menu">
                            {items.map((item, idx) => {
                                if (item.divider) {
                                    return <li key={idx} className="t-dropdown__divider" role="separator" />;
                                }
                                return (
                                    <li key={idx} className="t-dropdown__item-wrapper" role="none">
                                        <button
                                            type="button"
                                            className={`t-dropdown__item ${item.danger ? 't-dropdown__item--danger' : ''}`}
                                            role="menuitem"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                item.onClick?.(e);
                                                handleClose();
                                            }}
                                            disabled={item.disabled}
                                        >
                                            {item.icon && <i className={`${item.icon} t-dropdown__item-icon`} aria-hidden="true" />}
                                            <span className="t-dropdown__item-label">{item.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        children
                    )}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
