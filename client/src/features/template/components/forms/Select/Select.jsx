// client/src/features/template/components/forms/Select/Select.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Select.scss';

let _uid = 0;

const Select = ({
    label,
    id,
    name,
    options = [],
    value,
    onChange,
    multiple = false,
    clearable = false,
    loading = false,
    disabled = false,
    error,
    placeholder = 'Select...',
    required = false,
    inline = false,
    className = '',
    size = 'md',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);
    const uid = useRef(`t-select-${++_uid}`);
    const selectId = id || name || uid.current;

    // Position coordinates of the portal dropdown
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            const isClickInsideWrapper = containerRef.current && containerRef.current.contains(e.target);
            const isClickInsideDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
            if (!isClickInsideWrapper && !isClickInsideDropdown) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    // Position updater and scroll capture logic
    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('resize', updatePosition);

            // Capture scroll on any parent container to auto-close dropdown
            let scrollListenerActive = false;
            const handleScroll = (e) => {
                if (!scrollListenerActive) return;
                if (dropdownRef.current && dropdownRef.current.contains(e.target)) {
                    return;
                }
                setIsOpen(false);
            };

            // Register scroll listener after a short timeout to prevent initial focus scroll from closing it
            const scrollTimer = setTimeout(() => {
                scrollListenerActive = true;
            }, 150);

            window.addEventListener('scroll', handleScroll, true);

            return () => {
                clearTimeout(scrollTimer);
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', handleScroll, true);
            };
        }
    }, [isOpen]);

    const handleToggle = () => {
        if (!disabled && !loading) {
            const nextOpen = !isOpen;
            if (nextOpen) {
                updatePosition();
            }
            setIsOpen(nextOpen);
        }
    };

    const handleOptionClick = (optVal) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : (value ? [value] : []);
            const nextValues = currentValues.includes(optVal)
                ? currentValues.filter((v) => v !== optVal)
                : [...currentValues, optVal];
            onChange?.({ target: { name: name || id || '', value: nextValues } });
        } else {
            onChange?.({ target: { name: name || id || '', value: optVal } });
            setIsOpen(false);
        }
    };

    const getSelectedLabel = () => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : (value ? [value] : []);
            if (currentValues.length === 0) return placeholder;
            return options
                .filter((o) => currentValues.includes(o.value))
                .map((o) => o.label)
                .join(', ');
        }
        const found = options.find((o) => o.value === value);
        return found ? found.label : placeholder;
    };

    const isOptionSelected = (optVal) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : (value ? [value] : []);
            return currentValues.includes(optVal);
        }
        return value === optVal;
    };

    return (
        <div 
            className={[
                't-select-wrapper',
                size === 'sm' ? 't-select-wrapper--sm' : '',
                inline ? 't-select-wrapper--inline' : '',
                className
            ].filter(Boolean).join(' ')} 
            ref={containerRef}
        >
            {label && (
                <label className="t-input-label" htmlFor={selectId}>
                    {label}
                    {required && (
                        <span className="t-input-label__required" aria-hidden="true">*</span>
                    )}
                </label>
            )}
            <div className="t-select-field">
                <div
                    ref={triggerRef}
                    id={selectId}
                    className={[
                        't-select-trigger',
                        isOpen ? 't-select-trigger--open' : '',
                        error ? 't-select-trigger--error' : '',
                        disabled ? 't-select-trigger--disabled' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={handleToggle}
                    tabIndex={disabled || loading ? -1 : 0}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-invalid={!!error}
                >
                    <span className="t-select-value">
                        {getSelectedLabel()}
                    </span>
                    <span className="t-select-caret" aria-hidden="true">
                        {loading ? (
                            <i className="ri-loader-4-line" style={{ animation: 't-spin 0.6s linear infinite' }} />
                        ) : (
                            <i className="ri-arrow-down-s-line" />
                        )}
                    </span>
                </div>

                {isOpen && createPortal(
                    <div 
                        ref={dropdownRef}
                        className="t-select-dropdown"
                        style={{
                            position: 'absolute',
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                            width: `${coords.width}px`,
                        }}
                    >
                        <ul className="t-select-options" role="listbox">
                            {clearable && !multiple && (
                                <li
                                    className="t-select-option t-select-option--clear"
                                    role="option"
                                    aria-selected={!value}
                                    onClick={() => {
                                        onChange?.({ target: { name: name || id || '', value: '' } });
                                        setIsOpen(false);
                                    }}
                                >
                                    {placeholder}
                                </li>
                            )}
                            {options.map((opt) => (
                                <li
                                    key={opt.value}
                                    className={[
                                        't-select-option',
                                        isOptionSelected(opt.value) ? 't-select-option--selected' : '',
                                        opt.disabled ? 't-select-option--disabled' : '',
                                    ].filter(Boolean).join(' ')}
                                    role="option"
                                    aria-selected={isOptionSelected(opt.value)}
                                    onClick={() => !opt.disabled && handleOptionClick(opt.value)}
                                >
                                    {multiple && (
                                        <span className="t-select-checkbox">
                                            {isOptionSelected(opt.value) && <i className="ri-check-line" />}
                                        </span>
                                    )}
                                    <span className="t-select-option-label">{opt.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>,
                    document.body
                )}
            </div>
            {error && (
                <p className="t-select-error" role="alert">{error}</p>
            )}
        </div>
    );
};

export default Select;
