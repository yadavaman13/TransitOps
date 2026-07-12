// client/src/features/template/components/forms/Input/Input.jsx
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import './Input.scss';

let _uid = 0;

/**
 * Input — universal form field for all input types with built-in validation.
 */
const Input = forwardRef(({
    type = 'text',
    label,
    id,
    name,
    placeholder,
    value,
    onChange,
    onBlur,
    onFocus,
    error,
    helper,
    required = false,
    iconLeft,
    prefix,
    suffix,
    loading = false,
    disabled = false,
    clearable = false,
    className = '',
    validate,
    onValidate,
    ...rest
}, ref) => {
    const [showPwd, setShowPwd] = useState(false);
    const [localError, setLocalError] = useState('');
    const inputRef = useRef(null);
    const uid = useRef(`t-input-${++_uid}`);
    const inputId = id || name || uid.current;

    const isPassword = type === 'password';
    const inputType  = isPassword ? (showPwd ? 'text' : 'password') : type;

    // Run validation logic against active constraints
    const validateValue = (val) => {
        if (disabled || loading) return '';

        // 1. Required check
        if (required && (!val || String(val).trim() === '')) {
            return `${label || name || 'Field'} is required`;
        }

        if (val && String(val).trim() !== '') {
            // 2. Email format check
            if (type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(val)) {
                    return 'Please enter a valid email address';
                }
            }

            // 3. URL format check
            if (type === 'url') {
                try {
                    new URL(val);
                } catch (_) {
                    return 'Please enter a valid URL';
                }
            }

            // 4. MinLength check
            if (rest.minLength && String(val).length < rest.minLength) {
                return `Minimum length is ${rest.minLength} characters`;
            }

            // 5. MaxLength check
            if (rest.maxLength && String(val).length > rest.maxLength) {
                return `Maximum length is ${rest.maxLength} characters`;
            }

            // 6. Pattern check
            if (rest.pattern) {
                const regex = typeof rest.pattern === 'string' ? new RegExp(rest.pattern) : rest.pattern;
                if (!regex.test(val)) {
                    return 'Please match the requested format';
                }
            }

            // 7. Custom validation callback
            if (validate) {
                const customErr = validate(val);
                if (customErr) return customErr;
            }
        }

        return '';
    };

    // Expose imperative methods to parent
    useImperativeHandle(ref, () => ({
        validate: () => {
            const err = validateValue(value);
            setLocalError(err);
            onValidate?.(err === '', err);
            return !err;
        },
        focus: () => {
            inputRef.current?.focus();
        },
        clear: () => {
            setLocalError('');
        }
    }));

    const handleBlur = (e) => {
        const err = validateValue(value);
        setLocalError(err);
        onValidate?.(err === '', err);
        onBlur?.(e);
    };

    const handleChange = (e) => {
        const val = e.target.value;
        // Run validation immediately if an error is already showing to clear it instantly
        if (localError || error) {
            const err = validateValue(val);
            setLocalError(err);
            onValidate?.(err === '', err);
        }
        onChange?.(e);
    };

    const handleClear = () => {
        const emptyVal = '';
        onChange?.({ target: { name: name || id || '', value: emptyVal } });
        const err = validateValue(emptyVal);
        setLocalError(err);
        onValidate?.(err === '', err);
        inputRef.current?.focus();
    };

    const displayError = error !== undefined ? error : localError;

    return (
        <div className={`t-input-wrapper ${className}`}>
            {label && (
                <label className="t-input-label" htmlFor={inputId}>
                    {label}
                    {required && (
                        <span className="t-input-label__required" aria-hidden="true">*</span>
                    )}
                </label>
            )}

            <div
                className={[
                    't-input-field',
                    displayError ? 't-input-field--error'    : '',
                    disabled     ? 't-input-field--disabled' : '',
                ].filter(Boolean).join(' ')}
            >
                {iconLeft && (
                    <span className="t-input-icon" aria-hidden="true">
                        <i className={iconLeft} />
                    </span>
                )}
                {prefix && <span className="t-input-prefix">{prefix}</span>}

                <input
                    ref={inputRef}
                    id={inputId}
                    name={name || id}
                    type={inputType}
                    value={value ?? ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onFocus={onFocus}
                    placeholder={placeholder}
                    disabled={disabled || loading}
                    required={required}
                    aria-invalid={!!displayError}
                    aria-describedby={
                        displayError ? `${inputId}-error` :
                        helper       ? `${inputId}-helper` : undefined
                    }
                    className="t-input-control"
                    {...rest}
                />

                {suffix && <span className="t-input-suffix">{suffix}</span>}

                {isPassword && (
                    <button
                        type="button"
                        className="t-input-action-btn"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            setShowPwd((v) => !v);
                            inputRef.current?.focus();
                        }}
                        tabIndex={-1}
                        aria-label={showPwd ? 'Hide password' : 'Show password'}
                    >
                        <i className={showPwd ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </button>
                )}

                {clearable && !isPassword && value && (
                    <button
                        type="button"
                        className="t-input-action-btn"
                        onClick={handleClear}
                        tabIndex={-1}
                        aria-label="Clear"
                    >
                        <i className="ri-close-line" />
                    </button>
                )}

                {loading && (
                    <span className="t-input-suffix" aria-hidden="true">
                        <i className="ri-loader-4-line" style={{ animation: 't-spin 0.6s linear infinite' }} />
                    </span>
                )}
            </div>

            {displayError && (
                <p className="t-input-error" id={`${inputId}-error`} role="alert">{displayError}</p>
            )}
            {!displayError && helper && (
                <p className="t-input-helper" id={`${inputId}-helper`}>{helper}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
