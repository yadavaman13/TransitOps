// client/src/features/template/components/forms/Form/Form.jsx
import React from 'react';
import './Form.scss';

/** FormSection — groups related fields with an optional heading. */
export const FormSection = ({ title, children }) => (
    <fieldset className="t-form-section">
        {title && <legend className="t-form-section__title">{title}</legend>}
        {children}
    </fieldset>
);

/** FormRow — responsive grid row of form fields. */
export const FormRow = ({ children, cols }) => (
    <div
        className="t-form-row"
        style={cols ? { gridTemplateColumns: `repeat(${cols}, 1fr)` } : undefined}
    >
        {children}
    </div>
);

/** FormActions — right-aligned action button row. */
export const FormActions = ({ children }) => (
    <div className="t-form-actions">{children}</div>
);

/**
 * Form — layout wrapper that prevents default submit and calls onSubmit.
 */
const Form = ({ children, onSubmit, className = '', ...rest }) => (
    <form
        className={`t-form ${className}`}
        onSubmit={(e) => { e.preventDefault(); onSubmit?.(e); }}
        noValidate
        {...rest}
    >
        {children}
    </form>
);

export default Form;
