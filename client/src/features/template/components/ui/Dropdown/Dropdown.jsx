import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Dropdown.scss';

const Dropdown = ({
    trigger,
    items = [],
    align = 'right',
    className = '',
    children,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const dropdownRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const updatePosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            let leftVal = rect.left + window.scrollX;

            if (align === 'right') {
                const menuWidth = dropdownRef.current
                    ? dropdownRef.current.offsetWidth
                    : 180;
                leftVal = rect.right + window.scrollX - menuWidth;
            }

            setCoords({
                top: rect.bottom + window.scrollY,
                left: leftVal,
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updatePosition();

            const animFrame = requestAnimationFrame(() => {
                updatePosition();
            });

            window.addEventListener('resize', updatePosition);

            let scrollListenerActive = false;
            const handleScroll = (e) => {
                if (!scrollListenerActive) return;
                if (
                    dropdownRef.current &&
                    dropdownRef.current.contains(e.target)
                ) {
                    return;
                }
                setIsOpen(false);
            };

            const scrollTimer = setTimeout(() => {
                scrollListenerActive = true;
            }, 150);

            window.addEventListener('scroll', handleScroll, true);

            return () => {
                cancelAnimationFrame(animFrame);
                clearTimeout(scrollTimer);
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', handleScroll, true);
            };
        }
    }, [isOpen, align]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isClickInsideWrapper =
                containerRef.current &&
                containerRef.current.contains(event.target);
            const isClickInsideDropdown =
                dropdownRef.current &&
                dropdownRef.current.contains(event.target);
            if (!isClickInsideWrapper && !isClickInsideDropdown) {
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

            {isOpen &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        className={`t-dropdown__menu t-dropdown__menu--align-${align}`}
                        style={{
                            position: 'absolute',
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                            right: 'auto',
                        }}
                    >
                        {items.length > 0 ? (
                            <ul className="t-dropdown__list" role="menu">
                                {items.map((item, idx) => {
                                    if (item.divider) {
                                        return (
                                            <li
                                                key={idx}
                                                className="t-dropdown__divider"
                                                role="separator"
                                            />
                                        );
                                    }
                                    return (
                                        <li
                                            key={idx}
                                            className="t-dropdown__item-wrapper"
                                            role="none"
                                        >
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
                                                {item.icon && (
                                                    <i
                                                        className={`${item.icon} t-dropdown__item-icon`}
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <span className="t-dropdown__item-label">
                                                    {item.label}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            children
                        )}
                    </div>,
                    document.body,
                )}
        </div>
    );
};

export default Dropdown;
