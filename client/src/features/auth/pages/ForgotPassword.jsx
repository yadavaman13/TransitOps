import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';

import FormGroup from '../components/FormGroup';
import { useAuth } from '../hooks/useAuth';
import {
    validateEmail,
    validatePasswordMatch,
    validatePasswordStrength,
} from '../utils/validation.utils';
import * as authApi from '../services/auth.api';
import '../styles/auth.scss';

const initialFormValues = {
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
};

const createInitialErrors = () => ({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
});

const createInitialTouched = (step = 'request') => ({
    email: false,
    otp: step === 'reset',
    password: step === 'reset',
    confirmPassword: step === 'reset',
});

// OTP is case-sensitive — preserve the user's input exactly, only strip whitespace
const normalizeOtpValue = (value) => value.replace(/\s+/g, '');

const getFieldError = (fieldName, fieldValue, values = {}) => {
    if (fieldName === 'email') {
        return validateEmail(fieldValue);
    }

    if (fieldName === 'otp') {
        if (!fieldValue.trim()) {
            return 'OTP is required.';
        }

        return fieldValue.trim().length === 6
            ? ''
            : 'OTP must be exactly 6 characters long.';
    }

    if (fieldName === 'password') {
        return validatePasswordStrength(fieldValue);
    }

    if (fieldName === 'confirmPassword') {
        return validatePasswordMatch(values.password, fieldValue);
    }

    return '';
};

const getValidationErrors = (step, values) => ({
    email: getFieldError('email', values.email),
    otp: step === 'reset' ? getFieldError('otp', values.otp) : '',
    password:
        step === 'reset' ? getFieldError('password', values.password) : '',
    confirmPassword:
        step === 'reset'
            ? getFieldError('confirmPassword', values.confirmPassword, values)
            : '',
});

const getStepCopy = (step) =>
    step === 'request'
        ? 'Enter your email address and we will send a one-time password to help you reset your password.'
        : 'Enter the OTP we sent and choose a new password.';

const getSubmitLabel = (step, loading) => {
    if (step === 'request') {
        return loading ? 'Sending OTP...' : 'Send OTP';
    }

    return loading ? 'Resetting password...' : 'Reset password';
};

const getBannerClassName = (statusType) =>
    statusType === 'success'
        ? 'toast-banner is-success'
        : 'toast-banner is-error';

const StatusBanner = ({ message, statusType }) => {
    if (!message) {
        return null;
    }

    return (
        <div
            className={getBannerClassName(statusType)}
            role="status"
            aria-live="polite"
        >
            {message}
        </div>
    );
};

const ResetPasswordFields = ({
    formValues,
    errors,
    touched,
    onChange,
    onBlur,
    loading,
}) => (
    <>
        <FormGroup
            label="OTP"
            id="otp"
            name="otp"
            type="text"
            value={formValues.otp}
            onChange={onChange}
            onBlur={onBlur}
            hasError={Boolean(touched.otp && errors.otp)}
            errorMessage={touched.otp ? errors.otp : ''}
            disabled={loading}
        />
        <p className="otp-help">
            Use the OTP from your email. It expires in 5 minutes.
        </p>
        <FormGroup
            label="New password"
            id="password"
            name="password"
            type="password"
            value={formValues.password}
            onChange={onChange}
            onBlur={onBlur}
            hasError={Boolean(touched.password && errors.password)}
            errorMessage={touched.password ? errors.password : ''}
            disabled={loading}
        />
        <FormGroup
            label="Confirm password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formValues.confirmPassword}
            onChange={onChange}
            onBlur={onBlur}
            hasError={Boolean(
                touched.confirmPassword && errors.confirmPassword,
            )}
            errorMessage={touched.confirmPassword ? errors.confirmPassword : ''}
            disabled={loading}
        />
    </>
);

const ForgotPasswordFields = ({
    step,
    formValues,
    errors,
    touched,
    onChange,
    onBlur,
    loading,
}) => (
    <>
        <FormGroup
            label="Email"
            id="email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={onChange}
            onBlur={onBlur}
            hasError={Boolean(touched.email && errors.email)}
            errorMessage={touched.email ? errors.email : ''}
            disabled={loading || step === 'reset'}
        />

        {step === 'reset' ? (
            <ResetPasswordFields
                formValues={formValues}
                errors={errors}
                touched={touched}
                onChange={onChange}
                onBlur={onBlur}
                loading={loading}
            />
        ) : null}
    </>
);

const ForgotPassword = () => {
    const { user, handleRequestPasswordReset, handleResetPassword, error } =
        useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState('request');
    const [formValues, setFormValues] = useState(initialFormValues);
    const [errors, setErrors] = useState(createInitialErrors);
    const [touched, setTouched] = useState(() =>
        createInitialTouched('request'),
    );
    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);
    const cooldownRef = useRef(null);

    // if (!isInitialized) {
    //     return <div>Loading...</div>;
    // }

    if (user) {
        return <Navigate to="/" replace />;
    }

    const validateForm = () => {
        const nextErrors = getValidationErrors(step, formValues);

        setErrors(nextErrors);
        setTouched(createInitialTouched(step));

        return !Object.values(nextErrors).some(Boolean);
    };

    // Clear cooldown interval on unmount
    useEffect(() => {
        return () => {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
        };
    }, []);

    const startCooldown = (seconds) => {
        setResendCooldown(seconds);
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(cooldownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleFieldChange = (event) => {
        const { name, value } = event.target;
        const normalizedValue =
            name === 'otp' ? normalizeOtpValue(value) : value;

        const nextValues = {
            ...formValues,
            [name]: normalizedValue,
        };

        setFormValues(nextValues);

        if (touched[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: getFieldError(name, normalizedValue, nextValues),
            }));
        }

        if (statusMessage) {
            setStatusMessage('');
            setStatusType('');
        }
    };

    const handleBlur = (event) => {
        const { name, value } = event.target;
        const normalizedValue =
            name === 'otp' ? normalizeOtpValue(value) : value;

        setTouched((prev) => ({
            ...prev,
            [name]: true,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: getFieldError(name, normalizedValue, {
                ...formValues,
                [name]: normalizedValue,
            }),
        }));
    };

    const handleRequestOtp = async (event) => {
        event.preventDefault();
        setStatusMessage('');
        setStatusType('');

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await handleRequestPasswordReset({
                email: formValues.email,
            });

            if (!result.success) {
                setStatusMessage(result.message || 'Unable to send reset OTP.');
                setStatusType('error');
                return;
            }

            setStep('reset');
            setStatusMessage(
                'OTP sent! Check your inbox. It expires in 10 minutes.',
            );
            setStatusType('success');
            startCooldown(120);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0 || resendLoading) return;
        setResendLoading(true);
        setStatusMessage('');
        setStatusType('');
        try {
            const data = await authApi.resendOtp({
                email: formValues.email,
                purpose: 'forgot-password',
            });
            if (data?.success) {
                setStatusMessage('OTP resent! Check your inbox.');
                setStatusType('success');
                startCooldown(120);
            } else {
                setStatusMessage(data?.message || 'Failed to resend OTP.');
                setStatusType('error');
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to resend OTP.';
            setStatusMessage(msg);
            setStatusType('error');
        } finally {
            setResendLoading(false);
        }
    };

    const handleResetPasswordSubmit = async (event) => {
        event.preventDefault();
        setStatusMessage('');
        setStatusType('');

        if (!validateForm()) {
            return;
        }

        let result;
        setIsSubmitting(true);

        try {
            result = await handleResetPassword({
                email: formValues.email,
                otp: formValues.otp,
                password: formValues.password,
                confirmPassword: formValues.confirmPassword,
            });
        } finally {
            setIsSubmitting(false);
        }

        if (!result.success) {
            return;
        }

        navigate('/login', { replace: true });
    };

    return (
        <main className="auth-page auth-page--forgot-password">
            <div className="form-container auth-form-container auth-form-container--forgot-password">
                <div className="form-header">
                    <h1 className="form-title">Forgot password</h1>
                    <p className="forgot-password-copy">{getStepCopy(step)}</p>
                </div>

                <StatusBanner message={statusMessage} statusType={statusType} />

                <form
                    onSubmit={
                        step === 'request'
                            ? handleRequestOtp
                            : handleResetPasswordSubmit
                    }
                    noValidate
                >
                    <ForgotPasswordFields
                        step={step}
                        formValues={formValues}
                        errors={errors}
                        touched={touched}
                        onChange={handleFieldChange}
                        onBlur={handleBlur}
                        loading={isSubmitting}
                    />

                    {step === 'reset' && (
                        <div className="resend-otp-row">
                            {resendCooldown > 0 ? (
                                <span className="resend-otp-cooldown">
                                    Resend available in{' '}
                                    {String(
                                        Math.floor(resendCooldown / 60),
                                    ).padStart(2, '0')}
                                    :
                                    {String(resendCooldown % 60).padStart(
                                        2,
                                        '0',
                                    )}
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    className="resend-otp-btn"
                                    onClick={handleResendOtp}
                                    disabled={resendLoading}
                                >
                                    {resendLoading
                                        ? 'Sending...'
                                        : 'Resend OTP'}
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        className="btn btn-auth-submit"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {getSubmitLabel(step, isSubmitting)}
                    </button>
                </form>

                <p className="form-footer">
                    <Link to="/login">Back to login</Link>
                </p>
            </div>
        </main>
    );
};

export default ForgotPassword;
