// client/src/features/template/components/layout/Sidebar/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import './Sidebar.scss';

/**
 * Sidebar — config-driven navigation panel.
 *
 * @param {string}   logo      - Brand name
 * @param {string}   logoIcon  - Remix icon class
 * @param {object}   user      - { name, role }
 * @param {Array}    navItems  - [{ title, icon?, route?, permission?, badge?, children? }]
 * @param {function} onLogout  - Logout callback
 */
const Sidebar = ({
    logo = 'ERP Kit',
    logoIcon = 'ri-command-fill',
    user,
    navItems = [],
    onLogout,
}) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [expanded, setExpanded] = useState({});

    const isActive = (route) => {
        if (!route) return false;
        const normPath = location.pathname.endsWith('/') && location.pathname !== '/'
            ? location.pathname.slice(0, -1)
            : location.pathname;
        const normRoute = route.endsWith('/') && route !== '/'
            ? route.slice(0, -1)
            : route;
        return normPath === normRoute;
    };
    const closeSidebar = () => setIsOpen(false);
    const toggleGroup = (title) =>
        setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));

    const canRender = (item) =>
        !item.permission || user?.role === item.permission;

    const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    const renderItem = (item) => {
        if (!canRender(item)) return null;

        if (item.children) {
            const isExpanded = expanded[item.title];
            return (
                <div key={item.title} className="t-sidebar__group">
                    <button
                        className="t-sidebar__group-toggle"
                        onClick={() => toggleGroup(item.title)}
                        aria-expanded={isExpanded}
                    >
                        {item.icon && <i className={item.icon} aria-hidden="true" />}
                        <span>{item.title}</span>
                        <i
                            className={isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
                            aria-hidden="true"
                        />
                    </button>
                    {isExpanded && (
                        <div className="t-sidebar__sub-menu">
                            {item.children.map((child) => renderItem(child))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.route}
                to={item.route}
                className={`t-sidebar__link ${isActive(item.route) ? 't-sidebar__link--active' : ''}`}
                onClick={closeSidebar}
                aria-current={isActive(item.route) ? 'page' : undefined}
            >
                {item.icon && <i className={item.icon} aria-hidden="true" />}
                <span>{item.title}</span>
                {item.badge != null && (
                    <span className="t-sidebar__badge">{item.badge}</span>
                )}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile top bar */}
            <header className="t-sidebar-mobile-bar">
                <Link to="/" className="t-sidebar-mobile-bar__brand" onClick={closeSidebar}>
                    <i className={logoIcon} aria-hidden="true" />
                    <span>{logo}</span>
                </Link>
                <button
                    className="t-sidebar-mobile-bar__toggle"
                    onClick={() => setIsOpen((v) => !v)}
                    aria-label="Toggle navigation"
                    aria-expanded={isOpen}
                >
                    <i className={isOpen ? 'ri-close-line' : 'ri-menu-line'} />
                </button>
            </header>

            {/* Mobile overlay */}
            <div
                className={`t-sidebar-overlay ${isOpen ? 't-sidebar-overlay--visible' : ''}`}
                onClick={closeSidebar}
                aria-hidden="true"
            />

            {/* Sidebar panel */}
            <aside className={`t-sidebar ${isOpen ? 't-sidebar--open' : ''}`}>
                <Link to="/" className="t-sidebar__header" onClick={closeSidebar}>
                    <i className={logoIcon} aria-hidden="true" />
                    <span>{logo}</span>
                </Link>

                <nav className="t-sidebar__nav" role="navigation" aria-label="Main Navigation">
                    {navItems.map((item) => renderItem(item))}
                </nav>

                {user && (
                    <div className="t-sidebar__footer">
                        <div className="t-sidebar__user-plate">
                            <div className="t-sidebar__avatar" aria-hidden="true" style={{ padding: 0, overflow: 'hidden' }}>
                                <img
                                    src={user.profileImage || "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg"}
                                    alt={user.name}
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                                />
                            </div>
                            <div className="t-sidebar__user-info">
                                <span className="t-sidebar__user-name">{user.name}</span>
                                {user.role && (
                                    <span className="t-sidebar__role">{user.role}</span>
                                )}
                            </div>
                        </div>
                        {onLogout && (
                            <button
                                className="t-sidebar__logout"
                                onClick={onLogout}
                                aria-label="Log out"
                            >
                                <i className="ri-logout-box-r-line" aria-hidden="true" />
                                <span>Log Out</span>
                            </button>
                        )}
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
