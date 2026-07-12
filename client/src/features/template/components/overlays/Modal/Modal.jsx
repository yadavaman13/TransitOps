// client/src/features/template/components/overlays/Modal/Modal.jsx
import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Modal.scss';

/**
 * Modal — accessible portal dialog.
 * Closes on Escape. Locks body scroll. Closes on overlay click (optional).
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    size = 'md',
    footer,
    children,
    closeOnOverlayClick = true,
}) => {
    const handleEsc = useCallback((e) => {
        if (e.key === 'Escape') onClose?.();
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEsc]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="t-modal-overlay"
            onClick={closeOnOverlayClick ? onClose : undefined}
            role="presentation"
        >
            <div
                className={`t-modal t-modal--${size}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 't-modal-title' : undefined}
                onClick={(e) => e.stopPropagation()}
            >
                {(title || onClose) && (
                    <div className="t-modal__header">
                        {title && (
                            <h2 className="t-modal__title" id="t-modal-title">{title}</h2>
                        )}
                        <button
                            className="t-modal__close"
                            onClick={onClose}
                            aria-label="Close dialog"
                        >
                            <i className="ri-close-line" aria-hidden="true" />
                        </button>
                    </div>
                )}
                <div className="t-modal__body">{children}</div>
                {footer && <div className="t-modal__footer">{footer}</div>}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
