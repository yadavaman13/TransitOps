// client/src/features/template/components/ui/Button/Button.jsx
import React from 'react';
import './Button.scss';

const VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'text'];
const SIZES    = ['xs', 'sm', 'md', 'lg'];

/**
 * Button — universal ERP button with variants, sizes, icons, and loading state.
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    iconLeft,
    iconRight,
    disabled = false,
    fullWidth = false,
    className = '',
    type = 'button',
    onClick,
    ...rest
}) => {
    const v = VARIANTS.includes(variant) ? variant : 'primary';
    const s = SIZES.includes(size) ? size : 'md';

    const cls = [
        't-btn',
        `t-btn--${v}`,
        `t-btn--${s}`,
        loading   ? 't-btn--loading' : '',
        fullWidth ? 't-btn--full'    : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={cls}
            disabled={disabled || loading}
            onClick={onClick}
            aria-busy={loading || undefined}
            {...rest}
        >
            {loading && <span className="t-btn__spinner" aria-hidden="true" />}
            {!loading && iconLeft && (
                <i className={`${iconLeft} t-btn__icon`} aria-hidden="true" />
            )}
            {children}
            {!loading && iconRight && (
                <i className={`${iconRight} t-btn__icon`} aria-hidden="true" />
            )}
        </button>
    );
};

export default Button;
