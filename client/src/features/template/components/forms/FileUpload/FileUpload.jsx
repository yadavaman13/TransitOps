// client/src/features/template/components/forms/FileUpload/FileUpload.jsx
import React, { useState, useRef } from 'react';
import { uploadFile } from '../../../../fleet-manager/service/fleet.api';
import './FileUpload.scss';

let _uid = 0;

const FileUpload = ({
    label,
    value,
    onChange,
    error,
    helper,
    required = false,
    disabled = false,
    accept = 'image/*,application/pdf',
    maxSize = 5 * 1024 * 1024, // 5MB default
    className = '',
}) => {
    const [uploading, setUploading] = useState(false);
    const [localError, setLocalError] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);
    const uid = useRef(`t-fileupload-${++_uid}`);

    const handleFileChange = async (file) => {
        if (!file) return;

        // Size check
        if (file.size > maxSize) {
            setLocalError(`File size exceeds the limit of ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
            return;
        }

        setLocalError('');
        setUploading(true);

        try {
            const result = await uploadFile(file);
            if (result?.success && result?.data?.url) {
                onChange?.(result.data.url);
            } else {
                setLocalError('Upload failed. Please try again.');
            }
        } catch (err) {
            console.error('File upload error:', err);
            setLocalError(err.response?.data?.message || 'Error uploading file.');
        } finally {
            setUploading(false);
        }
    };

    const onInputChange = (e) => {
        const file = e.target.files[0];
        handleFileChange(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (disabled || uploading) return;
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (disabled || uploading) return;

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileChange(file);
        }
    };

    const triggerBrowse = () => {
        if (disabled || uploading) return;
        fileInputRef.current?.click();
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange?.('');
        setLocalError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const displayError = error || localError;

    // Detect file type from URL
    const getFileDisplay = (url) => {
        if (!url) return null;
        const lowercaseUrl = url.toLowerCase();
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)/.test(lowercaseUrl) || url.includes('/images');
        const isPdf = /\.pdf/.test(lowercaseUrl) || url.includes('/pdfs');

        if (isImage) {
            return (
                <div className="t-fileupload-preview">
                    <img src={url} alt="Receipt Attachment Preview" className="t-fileupload-image" />
                </div>
            );
        }

        return (
            <div className="t-fileupload-file-info">
                <i className={isPdf ? 'ri-file-pdf-2-line t-fileupload-file-icon' : 'ri-file-3-line t-fileupload-file-icon'} />
                <span className="t-fileupload-file-url" title={url}>
                    {url.split('/').pop() || 'Attachment Document'}
                </span>
            </div>
        );
    };

    return (
        <div className={`t-fileupload-wrapper ${className}`}>
            {label && (
                <label className="t-fileupload-label">
                    {label}
                    {required && <span className="t-fileupload-label__required">*</span>}
                </label>
            )}

            <div
                className={[
                    't-fileupload-zone',
                    isDragOver ? 't-fileupload-zone--dragover' : '',
                    displayError ? 't-fileupload-zone--error' : '',
                    disabled ? 't-fileupload-zone--disabled' : '',
                    value ? 't-fileupload-zone--has-value' : '',
                ].filter(Boolean).join(' ')}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={value ? undefined : triggerBrowse}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onInputChange}
                    accept={accept}
                    disabled={disabled || uploading}
                    className="t-fileupload-input"
                    id={uid.current}
                />

                {uploading ? (
                    <div className="t-fileupload-state t-fileupload-state--loading">
                        <i className="ri-loader-4-line t-fileupload-spinner" />
                        <span className="t-fileupload-state-text">Uploading file to ImageKit...</span>
                    </div>
                ) : value ? (
                    <div className="t-fileupload-value">
                        {getFileDisplay(value)}
                        <button
                            type="button"
                            className="t-fileupload-clear-btn"
                            onClick={handleClear}
                            aria-label="Remove uploaded file"
                        >
                            <i className="ri-close-line" />
                        </button>
                    </div>
                ) : (
                    <div className="t-fileupload-state">
                        <div className="t-fileupload-icon-container">
                            <i className="ri-upload-2-line t-fileupload-icon" />
                        </div>
                        <div className="t-fileupload-instruction">
                            <span className="t-fileupload-browse-text">Click to upload</span> or drag and drop
                        </div>
                        <div className="t-fileupload-helper-text">
                            PDF, PNG, JPG, or JPEG (Max. 5MB)
                        </div>
                    </div>
                )}
            </div>

            {displayError && (
                <p className="t-fileupload-error-text" role="alert">
                    {displayError}
                </p>
            )}
            {!displayError && helper && (
                <p className="t-fileupload-helper-desc">{helper}</p>
            )}
        </div>
    );
};

export default FileUpload;
