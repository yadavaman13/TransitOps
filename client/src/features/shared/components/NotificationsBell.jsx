import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function NotificationsBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get('/api/notifications', { withCredentials: true });
            if (res.data?.success) {
                setNotifications(res.data.data.notifications || []);
                setUnreadCount(res.data.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            const res = await axios.patch(`/api/notifications/${id}/read`, {}, { withCredentials: true });
            if (res.data?.success) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const res = await axios.patch('/api/notifications/read-all', {}, { withCredentials: true });
            if (res.data?.success) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`/api/notifications/${id}`, { withCredentials: true });
            if (res.data?.success) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const formatTimeAgo = (dateStr) => {
        const diff = new Date() - new Date(dateStr);
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    backgroundColor: 'var(--bg-card, #ffffff)',
                    color: 'var(--text-main, #1e293b)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                }}
                className="hover-scale"
                aria-label="Notifications"
            >
                <i className="ri-notification-3-line" style={{ fontSize: '18px' }} />
                {unreadCount > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            backgroundColor: 'var(--danger, #ef4444)',
                            color: '#ffffff',
                            fontSize: '9px',
                            fontWeight: 700,
                            height: '14px',
                            minWidth: '14px',
                            borderRadius: '7px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 4px',
                        }}
                    >
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '46px',
                        right: '0',
                        width: '320px',
                        maxHeight: '400px',
                        backgroundColor: 'var(--bg-card, #ffffff)',
                        border: '1px solid var(--border-color, #e2e8f0)',
                        borderRadius: 'var(--border-radius-lg, 12px)',
                        boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1))',
                        zIndex: 200,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--border-color, #e2e8f0)',
                        }}
                    >
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main, #1e293b)' }}>
                            Notifications
                        </span>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'var(--primary, #6366f1)',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer',
                                    padding: '0',
                                }}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Scrollable list */}
                    <div style={{ flex: 1, overflowY: 'auto', maxHeight: '330px' }}>
                        {notifications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted, #64748b)' }}>
                                <i className="ri-notification-off-line" style={{ fontSize: '32px', display: 'block', marginBottom: '8px', opacity: 0.5 }} />
                                <span style={{ fontSize: '13px' }}>No notifications yet</span>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    style={{
                                        display: 'flex',
                                        gap: '10px',
                                        padding: '12px 16px',
                                        borderBottom: '1px solid var(--border-color, #e2e8f0)',
                                        backgroundColor: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.04)',
                                        transition: 'background-color 0.2s',
                                        position: 'relative',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.querySelector('.delete-btn').style.opacity = '1';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.querySelector('.delete-btn').style.opacity = '0';
                                    }}
                                >
                                    {/* Unread Status indicator */}
                                    {!n.isRead && (
                                        <span
                                            style={{
                                                position: 'absolute',
                                                left: '6px',
                                                top: '18px',
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--primary, #6366f1)',
                                            }}
                                        />
                                    )}

                                    {/* Icon based on content */}
                                    <div
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            backgroundColor: n.title?.toLowerCase().includes('trip')
                                                ? 'rgba(34, 197, 94, 0.1)'
                                                : 'rgba(239, 68, 68, 0.1)',
                                            color: n.title?.toLowerCase().includes('trip')
                                                ? 'var(--success, #22c55e)'
                                                : 'var(--danger, #ef4444)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            marginTop: '2px',
                                        }}
                                    >
                                        <i
                                            className={
                                                n.title?.toLowerCase().includes('trip')
                                                    ? 'ri-navigation-line'
                                                    : 'ri-error-warning-line'
                                            }
                                            style={{ fontSize: '14px' }}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #1e293b)' }}>
                                            {n.title}
                                        </span>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', margin: '0', lineHeight: '1.4' }}>
                                            {n.message}
                                        </p>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted, #94a3b8)', marginTop: '2px' }}>
                                            {formatTimeAgo(n.createdAt)}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                                        {!n.isRead && (
                                            <button
                                                type="button"
                                                onClick={() => handleMarkAsRead(n.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--primary, #6366f1)',
                                                    cursor: 'pointer',
                                                    padding: '2px',
                                                }}
                                                title="Mark as read"
                                            >
                                                <i className="ri-check-line" style={{ fontSize: '14px' }} />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="delete-btn"
                                            onClick={() => handleDelete(n.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--danger, #ef4444)',
                                                cursor: 'pointer',
                                                padding: '2px',
                                                opacity: 0,
                                                transition: 'opacity 0.2s',
                                            }}
                                            title="Delete"
                                        >
                                            <i className="ri-delete-bin-line" style={{ fontSize: '14px' }} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
