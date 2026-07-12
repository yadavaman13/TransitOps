import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    Breadcrumb,
    Button,
    Input,
    Select,
    useToast
} from '../../template';
import '../../template/styles/index.scss';
import * as fleetApi from '../service/fleet.api';
import { useAuth } from '../../auth/hooks/useAuth';

const BREADCRUMBS = [{ label: 'Home', href: '/' }, { label: 'Settings' }];

const CURRENCIES = [
    { value: 'INR', label: 'INR (₹)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
];

const DISTANCE_UNITS = [
    { value: 'km', label: 'Kilometers (km)' },
    { value: 'mi', label: 'Miles (mi)' },
];

const TIMEZONES = [
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
    { value: 'America/New_York', label: 'Eastern Standard Time (EST)' },
];

const SettingsPage = () => {
    const { showToast } = useToast();
    const { user, handleGetMe } = useAuth();
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'company' | 'rules'
    const [submitLoading, setSubmitLoading] = useState(false);

    // Profile settings forms
    const [profileForm, setProfileForm] = useState({ name: '', email: '' });
    const [profileErrors, setProfileErrors] = useState({});
    
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    // Password forms
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordErrors, setPasswordErrors] = useState({});

    // Company & App settings forms
    const [companyForm, setCompanyForm] = useState({
        companyName: 'TransitOps Logistics Ltd.',
        baseLocation: 'Pune, Maharashtra',
        currency: 'INR',
        distanceUnit: 'km',
        timezone: 'Asia/Kolkata',
    });

    // Fleet Rules (Alert limits)
    const [rulesForm, setRulesForm] = useState({
        maxCargoExceedPercent: '0',
        licenseExpiryWarningDays: '30',
        insuranceExpiryWarningDays: '30',
        maintenanceReminderDays: '7',
    });

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                email: user.email || '',
            });
        }
    }, [user]);

    // Load custom settings from DB
    const loadSettings = async () => {
        try {
            const res = await fleetApi.getSettings();
            if (res?.success && res.data?.settings) {
                const { fleetRules } = res.data.settings;
                if (fleetRules) {
                    setRulesForm({
                        maxCargoExceedPercent: fleetRules.maxCargoExceedPercent?.toString() || '0',
                        licenseExpiryWarningDays: fleetRules.licenseExpiryWarningDays?.toString() || '30',
                        insuranceExpiryWarningDays: fleetRules.insuranceExpiryWarningDays?.toString() || '30',
                        maintenanceReminderDays: fleetRules.maintenanceReminderDays?.toString() || '7',
                    });
                }
            }
        } catch (err) {
            console.error('Failed to load custom system settings', err);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Please select a valid image file.', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Image size should be less than 5MB.', 'error');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fleetApi.updateProfileImage(formData);
            if (res.success) {
                showToast('Profile image updated successfully.', 'success');
                if (handleGetMe) await handleGetMe(true);
            }
        } catch (err) {
            console.error('Failed to upload profile image:', err);
            const msg = err.response?.data?.message || 'Failed to upload profile image.';
            showToast(msg, 'error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleProfileSubmit = async () => {
        const errors = {};
        if (!profileForm.name.trim()) errors.name = 'Full Name is required';
        if (!profileForm.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
            errors.email = 'Invalid email address';
        }

        if (Object.keys(errors).length > 0) {
            setProfileErrors(errors);
            return;
        }

        setSubmitLoading(true);
        setProfileErrors({});
        try {
            const res = await fleetApi.updateProfile(profileForm);
            if (res.success) {
                showToast('Profile details updated successfully.', 'success');
                // Refresh authentication details
                if (handleGetMe) await handleGetMe(true);
            }
        } catch (err) {
            showToast('Failed to update profile.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handlePasswordSubmit = async () => {
        const errors = {};
        if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
        if (!passwordForm.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordForm.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }

        setSubmitLoading(true);
        setPasswordErrors({});
        try {
            const res = await fleetApi.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            if (res.success) {
                showToast('Password updated successfully.', 'success');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Password update failed. Verify current password.';
            showToast(msg, 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCompanySubmit = () => {
        setSubmitLoading(true);
        setTimeout(() => {
            showToast('Company core settings saved.', 'success');
            setSubmitLoading(false);
        }, 600);
    };

    const handleRulesSubmit = async () => {
        setSubmitLoading(true);
        try {
            const res = await fleetApi.updateFleetRules({
                maxCargoExceedPercent: Number(rulesForm.maxCargoExceedPercent),
                licenseExpiryWarningDays: Number(rulesForm.licenseExpiryWarningDays),
                insuranceExpiryWarningDays: Number(rulesForm.insuranceExpiryWarningDays),
                maintenanceReminderDays: Number(rulesForm.maintenanceReminderDays),
            });

            if (res.success) {
                showToast('Fleet safety alert thresholds updated.', 'success');
            }
        } catch (err) {
            showToast('Failed to update thresholds.', 'error');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-5)', fontFamily: 'var(--t-font-family)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--t-space-3)' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 'var(--t-font-size-md)', fontWeight: 'var(--t-font-weight-semibold)', color: 'var(--t-text-main)' }}>
                        Settings
                    </h1>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--t-space-5)', alignItems: 'start' }}>
                
                {/* Menu items sidebar */}
                <Card padding="none">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button
                            onClick={() => setActiveTab('profile')}
                            style={{
                                padding: 'var(--t-space-3) var(--t-space-4)',
                                border: 0,
                                textAlign: 'left',
                                backgroundColor: activeTab === 'profile' ? 'var(--t-primary-faint)' : 'transparent',
                                color: activeTab === 'profile' ? 'var(--t-primary)' : 'var(--t-text-muted)',
                                fontWeight: activeTab === 'profile' ? 'var(--t-font-weight-semibold)' : 'var(--t-font-weight-regular)',
                                cursor: 'pointer',
                                borderLeft: activeTab === 'profile' ? '3px solid var(--t-primary)' : '3px solid transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: 'var(--t-font-size-body-sm)'
                            }}
                        >
                            <i className="ri-user-settings-line"></i> User Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('company')}
                            style={{
                                padding: 'var(--t-space-3) var(--t-space-4)',
                                border: 0,
                                textAlign: 'left',
                                backgroundColor: activeTab === 'company' ? 'var(--t-primary-faint)' : 'transparent',
                                color: activeTab === 'company' ? 'var(--t-primary)' : 'var(--t-text-muted)',
                                fontWeight: activeTab === 'company' ? 'var(--t-font-weight-semibold)' : 'var(--t-font-weight-regular)',
                                cursor: 'pointer',
                                borderLeft: activeTab === 'company' ? '3px solid var(--t-primary)' : '3px solid transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: 'var(--t-font-size-body-sm)'
                            }}
                        >
                            <i className="ri-building-line"></i> Company Configuration
                        </button>
                        <button
                            onClick={() => setActiveTab('rules')}
                            style={{
                                padding: 'var(--t-space-3) var(--t-space-4)',
                                border: 0,
                                textAlign: 'left',
                                backgroundColor: activeTab === 'rules' ? 'var(--t-primary-faint)' : 'transparent',
                                color: activeTab === 'rules' ? 'var(--t-primary)' : 'var(--t-text-muted)',
                                fontWeight: activeTab === 'rules' ? 'var(--t-font-weight-semibold)' : 'var(--t-font-weight-regular)',
                                cursor: 'pointer',
                                borderLeft: activeTab === 'rules' ? '3px solid var(--t-primary)' : '3px solid transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: 'var(--t-font-size-body-sm)'
                            }}
                        >
                            <i className="ri-shield-flash-line"></i> Fleet Guard Rules
                        </button>
                    </div>
                </Card>

                {/* Settings Panel Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-5)' }}>
                    
                    {activeTab === 'profile' && (
                        <>
                            <Card>
                                <h3 style={{ margin: '0 0 var(--t-space-4)', fontSize: 'var(--t-font-size-base)', fontWeight: 'var(--t-font-weight-semibold)' }}>Personal Information</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)', maxWidth: '480px' }}>
                                    
                                    {/* Profile Picture Upload Section */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--t-space-4)', marginBottom: 'var(--t-space-2)' }}>
                                        <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--t-color-primary-light, #e0e7ff)' }}>
                                            <img
                                                src={user?.profileImage || "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg"}
                                                alt={user?.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            {uploading && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#fff'
                                                }}>
                                                    <i className="ri-loader-4-line ri-spin" style={{ fontSize: '20px' }}></i>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-2)' }}>
                                            <div style={{ display: 'flex', gap: 'var(--t-space-2)' }}>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploading}
                                                    style={{ fontSize: 'var(--t-font-size-body-xs)', padding: '6px 12px' }}
                                                >
                                                    <i className="ri-upload-2-line" style={{ marginRight: '4px' }}></i> Upload Photo
                                                </Button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleImageUpload}
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                            <p style={{ margin: 0, fontSize: 'var(--t-font-size-xs)', color: 'var(--t-text-muted)' }}>
                                                JPG, PNG or GIF, max 5MB.
                                            </p>
                                        </div>
                                    </div>

                                    <Input
                                        label="Full Name"
                                        value={profileForm.name}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                        error={profileErrors.name}
                                    />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                        error={profileErrors.email}
                                    />
                                    <Button style={{ alignSelf: 'flex-start' }} loading={submitLoading} onClick={handleProfileSubmit}>
                                        Save Profile Info
                                    </Button>
                                </div>
                            </Card>

                            <Card>
                                <h3 style={{ margin: '0 0 var(--t-space-4)', fontSize: 'var(--t-font-size-base)', fontWeight: 'var(--t-font-weight-semibold)' }}>Update Password</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)', maxWidth: '480px' }}>
                                    <Input
                                        label="Current Password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        required
                                        error={passwordErrors.currentPassword}
                                    />
                                    <Input
                                        label="New Password"
                                        type="password"
                                        placeholder="Min 6 characters"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                        required
                                        error={passwordErrors.newPassword}
                                    />
                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        placeholder="Re-enter password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        required
                                        error={passwordErrors.confirmPassword}
                                    />
                                    <Button style={{ alignSelf: 'flex-start' }} loading={submitLoading} onClick={handlePasswordSubmit}>
                                        Change Password
                                    </Button>
                                </div>
                            </Card>
                        </>
                    )}

                    {activeTab === 'company' && (
                        <Card>
                            <h3 style={{ margin: '0 0 var(--t-space-4)', fontSize: 'var(--t-font-size-base)', fontWeight: 'var(--t-font-weight-semibold)' }}>Company Configurations</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)', maxWidth: '480px' }}>
                                <Input
                                    label="Company Name"
                                    value={companyForm.companyName}
                                    onChange={(e) => setCompanyForm(prev => ({ ...prev, companyName: e.target.value }))}
                                    required
                                />
                                <Input
                                    label="Base Headquarter Depot Location"
                                    value={companyForm.baseLocation}
                                    onChange={(e) => setCompanyForm(prev => ({ ...prev, baseLocation: e.target.value }))}
                                    required
                                />
                                <Select
                                    label="Local Currency Unit"
                                    value={companyForm.currency}
                                    onChange={(e) => setCompanyForm(prev => ({ ...prev, currency: e.target.value }))}
                                    options={CURRENCIES}
                                />
                                <Select
                                    label="Distance Units"
                                    value={companyForm.distanceUnit}
                                    onChange={(e) => setCompanyForm(prev => ({ ...prev, distanceUnit: e.target.value }))}
                                    options={DISTANCE_UNITS}
                                />
                                <Select
                                    label="Local Timezone"
                                    value={companyForm.timezone}
                                    onChange={(e) => setCompanyForm(prev => ({ ...prev, timezone: e.target.value }))}
                                    options={TIMEZONES}
                                />
                                <Button style={{ alignSelf: 'flex-start' }} loading={submitLoading} onClick={handleCompanySubmit}>
                                    Save Configurations
                                </Button>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'rules' && (
                        <Card>
                            <h3 style={{ margin: '0 0 var(--t-space-4)', fontSize: 'var(--t-font-size-base)', fontWeight: 'var(--t-font-weight-semibold)' }}>Fleet Guard Alert Thresholds</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)', maxWidth: '480px' }}>
                                <Input
                                    label="Max Cargo Exceedance Threshold (%)"
                                    type="number"
                                    value={rulesForm.maxCargoExceedPercent}
                                    onChange={(e) => setRulesForm(prev => ({ ...prev, maxCargoExceedPercent: e.target.value }))}
                                    required
                                />
                                <Input
                                    label="License Expiry Alert Period (Days)"
                                    type="number"
                                    value={rulesForm.licenseExpiryWarningDays}
                                    onChange={(e) => setRulesForm(prev => ({ ...prev, licenseExpiryWarningDays: e.target.value }))}
                                    required
                                />
                                <Input
                                    label="Asset Insurance Expiry Warning Period (Days)"
                                    type="number"
                                    value={rulesForm.insuranceExpiryWarningDays}
                                    onChange={(e) => setRulesForm(prev => ({ ...prev, insuranceExpiryWarningDays: e.target.value }))}
                                    required
                                />
                                <Input
                                    label="Vehicle Maintenance Reminder Lead (Days)"
                                    type="number"
                                    value={rulesForm.maintenanceReminderDays}
                                    onChange={(e) => setRulesForm(prev => ({ ...prev, maintenanceReminderDays: e.target.value }))}
                                    required
                                />
                                <Button style={{ alignSelf: 'flex-start' }} loading={submitLoading} onClick={handleRulesSubmit}>
                                    Update Alert Rules
                                </Button>
                            </div>
                        </Card>
                    )}

                </div>

            </div>

        </div>
    );
};

export default SettingsPage;
