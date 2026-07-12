// client/src/features/template/components/feedback/Toast/ToastProvider.jsx
import React, { createContext, useCallback, useContext, useState } from 'react';
import './Toast.scss';

const ToastCtx = createContext(null);
let _id = 0;

const ICONS = {
    success: 'ri-checkbox-circle-line',
    error:   'ri-error-warning-line',
    warning: 'ri-alert-line',
    info:    'ri-information-line',
};

/**
 * ToastProvider — add once at the top of your component tree.
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3500) => {
        const id = ++_id;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastCtx.Provider value={{ showToast }}>
            {children}
            <div className="t-toast-container" aria-live="polite" aria-atomic="false">
                {toasts.map((t) => (
                    <div key={t.id} className={`t-toast t-toast--${t.type}`} role="status">
                        <i className={`${ICONS[t.type]} t-toast__icon`} aria-hidden="true" />
                        <div className="t-toast__body">
                            <p className="t-toast__message">{t.message}</p>
                        </div>
                        <button
                            className="t-toast__close"
                            onClick={() => dismiss(t.id)}
                            aria-label="Dismiss"
                        >
                            <i className="ri-close-line" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastCtx.Provider>
    );
};

/**
 * useToast — call inside any component wrapped by ToastProvider.
 * @returns {{ showToast: (message: string, type?: string, duration?: number) => void }}
 */
export const useToast = () => {
    const ctx = useContext(ToastCtx);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
};
