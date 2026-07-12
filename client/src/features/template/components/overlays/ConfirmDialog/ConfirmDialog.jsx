// client/src/features/template/components/overlays/ConfirmDialog/ConfirmDialog.jsx
import React from 'react';
import Modal from '../Modal/index.js';
import Button from '../../ui/Button/index.js';

/**
 * ConfirmDialog — pre-wired confirmation modal.
 * Built on top of Modal + Button — no extra styles needed.
 */
const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm',
    message = 'Are you sure you want to proceed?',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    confirmVariant = 'danger',
    loading = false,
}) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        size="sm"
        closeOnOverlayClick={!loading}
        footer={
            <>
                <Button variant="ghost" onClick={onClose} disabled={loading}>
                    {cancelLabel}
                </Button>
                <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
                    {confirmLabel}
                </Button>
            </>
        }
    >
        <p style={{
            color: 'var(--t-text-main)',
            fontSize: 'var(--t-font-size-base)',
            lineHeight: 'var(--t-line-height-base)',
        }}>
            {message}
        </p>
    </Modal>
);

export default ConfirmDialog;
