// client/src/features/template/components/forms/DatePicker/DatePicker.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './DatePicker.scss';

let _uid = 0;

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_ABBRS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DatePicker = ({
    label,
    id,
    name,
    value,
    onChange,
    placeholder = 'YYYY-MM-DD',
    disabled = false,
    required = false,
    error,
    helper,
    inline = false,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('days'); // 'days' | 'months' | 'years'
    const containerRef = useRef(null);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);
    const uid = useRef(`t-datepicker-${++_uid}`);
    const pickerId = id || name || uid.current;

    // Position coordinates of the portal dropdown
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    // Extract current selected date elements
    const parsedDate = value ? new Date(value) : null;
    const isValidDate = parsedDate && !isNaN(parsedDate);

    // Viewed month and year for calendar grid
    const [currentYear, setCurrentYear] = useState(isValidDate ? parsedDate.getFullYear() : new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(isValidDate ? parsedDate.getMonth() : new Date().getMonth());

    // Update calendar view when value updates externally
    useEffect(() => {
        if (isValidDate) {
            setCurrentYear(parsedDate.getFullYear());
            setCurrentMonth(parsedDate.getMonth());
        }
    }, [value]);

    // Click outside and escape handlers
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
            const dropdownWidth = 280; // matches SCSS width
            let left = rect.left + window.scrollX;
            
            // If the dropdown would overflow the viewport width, align to the right edge of the trigger
            if (rect.left + dropdownWidth > window.innerWidth) {
                left = rect.right + window.scrollX - dropdownWidth;
            }
            
            setCoords({
                top: rect.bottom + window.scrollY,
                left: Math.max(8, left),
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
                // If scroll is inside the dropdown itself, don't close
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

    // Reset view to 'days' when closed
    useEffect(() => {
        if (!isOpen) {
            setView('days');
        }
    }, [isOpen]);

    const handleToggle = () => {
        if (!disabled) {
            const nextOpen = !isOpen;
            if (nextOpen) {
                updatePosition();
            }
            setIsOpen(nextOpen);
        }
    };

    // State updates are handled directly in handlers to avoid Strict Mode double-firing bugs
    const handlePrevMonth = (e) => {
        e.stopPropagation();
        if (view === 'days') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        } else if (view === 'months') {
            setCurrentYear(currentYear - 1);
        } else if (view === 'years') {
            setCurrentYear(currentYear - 12);
        }
    };

    const handleNextMonth = (e) => {
        e.stopPropagation();
        if (view === 'days') {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        } else if (view === 'months') {
            setCurrentYear(currentYear + 1);
        } else if (view === 'years') {
            setCurrentYear(currentYear + 12);
        }
    };

    const handleHeaderTitleClick = (e) => {
        e.stopPropagation();
        if (view === 'days') {
            setView('months');
        } else if (view === 'months') {
            setView('years');
        } else if (view === 'years') {
            setView('months');
        }
    };

    const handleSelectMonth = (monthIdx) => {
        setCurrentMonth(monthIdx);
        setView('days');
    };

    const handleSelectYear = (year) => {
        setCurrentYear(year);
        setView('months');
    };

    const handleSelectDay = (day) => {
        const formattedMonth = String(currentMonth + 1).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
        onChange?.({ target: { name: name || id || '', value: dateStr } });
        setIsOpen(false);
    };

    const handleToday = (e) => {
        e.stopPropagation();
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        onChange?.({ target: { name: name || id || '', value: dateStr } });
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange?.({ target: { name: name || id || '', value: '' } });
        setIsOpen(false);
    };

    // Generate days for 7x6 calendar grid
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

    const dayCells = [];
    // Padding from previous month
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        dayCells.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        dayCells.push({ day: d, isCurrentMonth: true });
    }
    // Padding for next month to complete 6 rows (42 cells)
    const remainingCells = 42 - dayCells.length;
    for (let d = 1; d <= remainingCells; d++) {
        dayCells.push({ day: d, isCurrentMonth: false });
    }

    const isToday = (day) => {
        const today = new Date();
        return today.getFullYear() === currentYear &&
               today.getMonth() === currentMonth &&
               today.getDate() === day;
    };

    const isSelected = (day) => {
        return isValidDate &&
               parsedDate.getFullYear() === currentYear &&
               parsedDate.getMonth() === currentMonth &&
               parsedDate.getDate() === day;
    };

    const getHeaderTitle = () => {
        if (view === 'days') {
            return `${MONTH_NAMES[currentMonth]} ${currentYear}`;
        } else if (view === 'months') {
            return `${currentYear}`;
        } else {
            const startYear = currentYear - 5;
            return `${startYear} - ${startYear + 11}`;
        }
    };

    return (
        <div
            className={[
                't-datepicker-wrapper',
                inline ? 't-datepicker-wrapper--inline' : '',
                className
            ].filter(Boolean).join(' ')}
            ref={containerRef}
        >
            {label && (
                <label className="t-input-label" htmlFor={pickerId}>
                    {label}
                    {required && (
                        <span className="t-input-label__required" aria-hidden="true">*</span>
                    )}
                </label>
            )}

            <div className="t-datepicker-field" ref={triggerRef}>
                <div
                    id={pickerId}
                    className={[
                        't-datepicker-trigger',
                        isOpen ? 't-datepicker-trigger--open' : '',
                        error ? 't-datepicker-trigger--error' : '',
                        disabled ? 't-datepicker-trigger--disabled' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={handleToggle}
                    tabIndex={disabled ? -1 : 0}
                    role="button"
                    aria-expanded={isOpen}
                    aria-haspopup="dialog"
                >
                    <span className="t-datepicker-value">
                        {value || <span className="t-datepicker-placeholder">{placeholder}</span>}
                    </span>
                    <span className="t-datepicker-icon" aria-hidden="true">
                        <i className="ri-calendar-line" />
                    </span>
                </div>

                {isOpen && createPortal(
                    <div 
                        className="t-datepicker-dropdown" 
                        role="dialog" 
                        aria-label="Calendar"
                        ref={dropdownRef}
                        style={{
                            position: 'absolute',
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                            zIndex: 9999,
                        }}
                    >
                        <div className="t-datepicker-header">
                            <button type="button" className="t-datepicker-nav-btn" onClick={handlePrevMonth}>
                                <i className="ri-arrow-left-s-line" />
                            </button>
                            <button 
                                type="button" 
                                className="t-datepicker-month-year-btn" 
                                onClick={handleHeaderTitleClick}
                            >
                                {getHeaderTitle()}
                            </button>
                            <button type="button" className="t-datepicker-nav-btn" onClick={handleNextMonth}>
                                <i className="ri-arrow-right-s-line" />
                            </button>
                        </div>

                        {view === 'days' && (
                            <div className="t-datepicker-grid">
                                {WEEKDAYS.map((wd) => (
                                    <span key={wd} className="t-datepicker-weekday">{wd}</span>
                                ))}
                                {dayCells.map((cell, idx) => {
                                    if (!cell.isCurrentMonth) {
                                        return (
                                            <span key={idx} className="t-datepicker-day t-datepicker-day--muted">
                                                {cell.day}
                                            </span>
                                        );
                                    }
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            className={[
                                                't-datepicker-day',
                                                isToday(cell.day) ? 't-datepicker-day--today' : '',
                                                isSelected(cell.day) ? 't-datepicker-day--selected' : '',
                                            ].filter(Boolean).join(' ')}
                                            onClick={() => handleSelectDay(cell.day)}
                                        >
                                            {cell.day}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {view === 'months' && (
                            <div className="t-datepicker-months-grid">
                                {MONTH_ABBRS.map((mAbbr, idx) => {
                                    const isMonthSelected = idx === currentMonth;
                                    return (
                                        <button
                                            key={mAbbr}
                                            type="button"
                                            className={[
                                                't-datepicker-month-btn',
                                                isMonthSelected ? 't-datepicker-month-btn--selected' : '',
                                            ].filter(Boolean).join(' ')}
                                            onClick={() => handleSelectMonth(idx)}
                                        >
                                            {mAbbr}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {view === 'years' && (
                            <div className="t-datepicker-years-grid">
                                {Array.from({ length: 12 }, (_, i) => currentYear - 5 + i).map((yr) => {
                                    const isYearSelected = yr === currentYear;
                                    return (
                                        <button
                                            key={yr}
                                            type="button"
                                            className={[
                                                't-datepicker-year-btn',
                                                isYearSelected ? 't-datepicker-year-btn--selected' : '',
                                            ].filter(Boolean).join(' ')}
                                            onClick={() => handleSelectYear(yr)}
                                        >
                                            {yr}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="t-datepicker-footer">
                            <button type="button" className="t-datepicker-footer-btn" onClick={handleClear}>
                                Clear
                            </button>
                            <button type="button" className="t-datepicker-footer-btn t-datepicker-footer-btn--primary" onClick={handleToday}>
                                Today
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
            </div>

            {error && <p className="t-datepicker-error" role="alert">{error}</p>}
            {!error && helper && <p className="t-datepicker-helper">{helper}</p>}
        </div>
    );
};

export default DatePicker;

