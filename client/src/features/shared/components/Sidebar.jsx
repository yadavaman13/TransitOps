import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../auth/hooks/useAuth.js';

/**
 * Sidebar navigation component
 */
const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    // Render first letter of name as a fallback avatar
    const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    const closeSidebar = () => setIsOpen(false);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const json = await res.json();
                if (json.success && json.data) {
                    setNotifications(json.data.notifications || []);
                    setUnreadCount(json.data.unreadCount || 0);
                }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    React.useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 15000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleMarkAsRead = async (id) => {
        try {
            const res = await fetch(`/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const res = await fetch('/api/notifications/read-all', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking all read:', error);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            const res = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const formatDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <>
            {/* Mobile Top Toggle Bar */}
            <header className="sidebar-mobile-bar">
                <Link
                    to="/dashboard"
                    className="sidebar-mobile-bar__brand"
                    aria-label="Home"
                >
                    <i className="ri-command-fill" aria-hidden="true" />
                    <span>TransitOps</span>
                </Link>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="sidebar-mobile-bar__toggle"
                    aria-label="Toggle navigation menu"
                    aria-expanded={isOpen}
                >
                    <i className={isOpen ? 'ri-close-line' : 'ri-menu-line'} />
                </button>
            </header>

            {/* Overlay for mobile drawer */}
            <div
                className={`sidebar-overlay ${isOpen ? 'sidebar-overlay--visible' : ''}`}
                onClick={closeSidebar}
                aria-hidden="true"
            />

            {/* Sidebar Panel Container */}
            <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
                {/* Brand Brand logo */}
                <Link
                    to="/dashboard"
                    className="sidebar__header"
                    onClick={closeSidebar}
                    aria-label="Home"
                >
                    <i className="ri-command-fill" aria-hidden="true" />
                    <span>TransitOps</span>
                </Link>

                {/* Navigation Items */}
                <nav
                    className="sidebar__nav"
                    role="navigation"
                    aria-label="Main Navigation"
                >
                    {user?.role !== 'FINANCIAL_ANALYST' && (
                        <>
                            <Link
                                to="/dashboard"
                                className={`sidebar__link ${isActive('/dashboard') ? 'sidebar__link--active' : ''}`}
                                onClick={closeSidebar}
                                aria-current={
                                    isActive('/dashboard') ? 'page' : undefined
                                }
                            >
                                <i className="ri-dashboard-3-line" aria-hidden="true" />
                                <span>Dashboard</span>
                            </Link>

                            <Link
                                to="/profile"
                                className={`sidebar__link ${isActive('/profile') ? 'sidebar__link--active' : ''}`}
                                onClick={closeSidebar}
                                aria-current={isActive('/profile') ? 'page' : undefined}
                            >
                                <i className="ri-user-line" aria-hidden="true" />
                                <span>My Profile</span>
                            </Link>
                        </>
                    )}

                    {user?.role === 'FLEET_MANAGER' && (
                        <Link
                            to="/admin/users"
                            className={`sidebar__link ${isActive('/admin/users') ? 'sidebar__link--active' : ''}`}
                            onClick={closeSidebar}
                            aria-current={
                                isActive('/admin/users') ? 'page' : undefined
                            }
                        >
                            <i
                                className="ri-shield-user-line"
                                aria-hidden="true"
                            />
                            <span>Admin Portal</span>
                        </Link>
                    )}

                    {(user?.role === 'FINANCIAL_ANALYST' || user?.role === 'FLEET_MANAGER') && (
                        <>
                            {user?.role === 'FLEET_MANAGER' && (
                                <div className="sidebar__section-title" style={{ padding: '12px 16px 4px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Finance Portal</div>
                            )}
                            <Link
                                to="/finance/dashboard"
                                className={`sidebar__link ${isActive('/finance/dashboard') ? 'sidebar__link--active' : ''}`}
                                onClick={closeSidebar}
                                aria-current={isActive('/finance/dashboard') ? 'page' : undefined}
                            >
                                <i className="ri-dashboard-2-line" aria-hidden="true" />
                                <span>📊 Dashboard</span>
                            </Link>
                            <Link
                                to="/finance/expenses"
                                className={`sidebar__link ${isActive('/finance/expenses') ? 'sidebar__link--active' : ''}`}
                                onClick={closeSidebar}
                                aria-current={isActive('/finance/expenses') ? 'page' : undefined}
                            >
                                <i className="ri-coins-line" aria-hidden="true" />
                                <span>💰 Expenses</span>
                            </Link>
                            <Link
                                to="/finance/fuel"
                                className={`sidebar__link ${isActive('/finance/fuel') ? 'sidebar__link--active' : ''}`}
                                onClick={closeSidebar}
                                aria-current={isActive('/finance/fuel') ? 'page' : undefined}
                            >
                                <i className="ri-gas-station-line" aria-hidden="true" />
                                <span>⛽ Fuel</span>
                            </Link>
                            <Link
                                to="/finance/reports"
                                className={`sidebar__link ${isActive('/finance/reports') ? 'sidebar__link--active' : ''}`}
                                onClick={closeSidebar}
                                aria-current={isActive('/finance/reports') ? 'page' : undefined}
                            >
                                <i className="ri-line-chart-line" aria-hidden="true" />
                                <span>📈 Reports</span>
                            </Link>
                        </>
                    )}


                </nav>

                {/* User profile and actions */}
                {user && (
                    <div className="sidebar__footer">
                        <div
                            className="sidebar__user-plate"
                            title={`Logged in as ${user.name}`}
                        >
                            <div className="sidebar__avatar" aria-hidden="true">
                                {avatarLetter}
                            </div>
                            <div className="sidebar__user-info">
                                <span className="sidebar__user-name">
                                    {user.name}
                                </span>
                                <span className="badge-pill sidebar__role-badge">
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        {/* Notifications Toggle Button */}
                        <button
                            onClick={() => setIsNotificationsOpen(true)}
                            className="button-secondary sidebar__notifications-btn"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color, #e2e8f0)',
                                backgroundColor: 'transparent',
                                color: 'var(--text-color, #1e293b)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginBottom: '12px',
                                fontWeight: 500,
                            }}
                            aria-label="View system notifications"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="ri-notification-3-line" style={{ fontSize: '18px', color: 'var(--primary-color, #6366f1)' }} />
                                <span>Notifications</span>
                            </div>
                            {unreadCount > 0 && (
                                <span style={{
                                    backgroundColor: '#ef4444',
                                    color: '#ffffff',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                    lineHeight: '1.2'
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="button-secondary sidebar__logout-btn"
                            aria-label="Log out of your account"
                        >
                            <i
                                className="ri-logout-box-r-line"
                                aria-hidden="true"
                            />
                            <span>Log Out</span>
                        </button>
                    </div>
                )}
            </aside>

            {/* Notifications Modal */}
            {isNotificationsOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onClick={() => setIsNotificationsOpen(false)}
                >
                    <div
                        style={{
                            width: '90%',
                            maxWidth: '500px',
                            maxHeight: '80vh',
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
                                    Notifications
                                </h3>
                                {unreadCount > 0 && (
                                    <span style={{
                                        backgroundColor: '#fef2f2',
                                        color: '#ef4444',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                    }}>
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            color: '#6366f1',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            padding: '4px 8px',
                                        }}
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsNotificationsOpen(false)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: '#64748b',
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                    aria-label="Close modal"
                                >
                                    <i className="ri-close-line" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div
                            style={{
                                padding: '10px 0',
                                overflowY: 'auto',
                                flex: 1,
                            }}
                        >
                            {notifications.length === 0 ? (
                                <div
                                    style={{
                                        padding: '40px 20px',
                                        textAlign: 'center',
                                        color: '#64748b',
                                    }}
                                >
                                    <i className="ri-notification-off-line" style={{ fontSize: '48px', color: '#cbd5e1', display: 'block', marginBottom: '12px' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>No notifications yet</span>
                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                                        We'll let you know when system alerts trigger.
                                    </p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        style={{
                                            padding: '14px 20px',
                                            borderBottom: '1px solid #f8fafc',
                                            display: 'flex',
                                            gap: '12px',
                                            backgroundColor: n.isRead ? '#ffffff' : '#f8fafc',
                                            transition: 'background-color 0.2s',
                                        }}
                                    >
                                        {/* Status indicator */}
                                        <div style={{ marginTop: '4px' }}>
                                            {!n.isRead ? (
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                                            ) : (
                                                <div style={{ width: '8px', height: '8px' }} />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                                                {n.title}
                                            </h4>
                                            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
                                                {n.message}
                                            </p>
                                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                {formatDate(n.createdAt)}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                                            {!n.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(n.id)}
                                                    title="Mark as read"
                                                    style={{
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        color: '#10b981',
                                                        cursor: 'pointer',
                                                        fontSize: '16px',
                                                        padding: '4px',
                                                    }}
                                                >
                                                    <i className="ri-checkbox-circle-line" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteNotification(n.id)}
                                                title="Delete notification"
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    fontSize: '16px',
                                                    padding: '4px',
                                                }}
                                            >
                                                <i className="ri-delete-bin-line" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
