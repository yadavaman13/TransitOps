import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import {
    Card,
    Breadcrumb,
    Input,
    Button
} from '../../template';
import '../../template/styles/index.scss';
import '../../template/pages/DashboardTemplatePage/DashboardTemplatePage.scss';

const BREADCRUMBS = [
    { label: 'Home', link: '/driver' },
    { label: 'Profile' }
];

const DriverProfilePage = () => {
    const { user } = useAuth();
    const [phone, setPhone] = useState(user?.phone || '');
    const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '9876543211');
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        // Save logic placeholder
        setTimeout(() => {
            setSaving(false);
            alert('Profile updated successfully!');
        }, 800);
    };

    return (
        <div className="t-dash-page">
            <div className="t-dash-page__header">
                <div className="t-dash-page__title-block">
                    <Breadcrumb items={BREADCRUMBS} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--t-space-6)' }}>
                {/* Avatar / Card Panel */}
                <Card>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 'var(--t-space-4)' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--t-color-primary-light, #e0e7ff)', marginBottom: 'var(--t-space-4)' }}>
                            <img
                                src={user?.profileImage || "https://ik.imagekit.io/2bzzjhgkg/defaul_profile_image.jpeg"}
                                alt={user?.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <h2 style={{ fontSize: 'var(--t-font-size-lg)', fontWeight: 600, color: 'var(--t-text-title)' }}>{user?.name || 'Driver'}</h2>
                        <p style={{ fontSize: 'var(--t-font-size-sm)', color: 'var(--t-text-muted)', marginTop: '4px' }}>{user?.role || 'DRIVER'}</p>
                        
                        <div style={{ width: '100%', borderTop: '1px solid var(--t-border-light, #f3f4f6)', marginTop: 'var(--t-space-6)', paddingTop: 'var(--t-space-4)', textAlign: 'left' }}>
                            <p style={{ fontSize: 'var(--t-font-size-xs)', textTransform: 'uppercase', color: 'var(--t-text-muted)', letterSpacing: '0.05em' }}>Assigned Vehicle</p>
                            <p style={{ fontSize: 'var(--t-font-size-sm)', fontWeight: 500, color: 'var(--t-text-body)', marginTop: '4px' }}>MH-12-XY-9876 (Eicher Pro)</p>
                        </div>
                    </div>
                </Card>

                {/* Form Info Panel */}
                <Card>
                    <h2 style={{ fontSize: 'var(--t-font-size-lg)', fontWeight: 600, color: 'var(--t-text-title)', marginBottom: 'var(--t-space-4)' }}>Contact Details</h2>
                    
                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--t-space-4)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                            <Input
                                label="Name"
                                value={user?.name || ''}
                                disabled
                            />
                            <Input
                                label="Email Address"
                                value={user?.email || ''}
                                disabled
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--t-space-4)' }}>
                            <Input
                                label="Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter 10-digit mobile number"
                            />
                            <Input
                                label="Emergency Contact"
                                value={emergencyContact}
                                onChange={(e) => setEmergencyContact(e.target.value)}
                                placeholder="Enter emergency contact info"
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--t-space-4)' }}>
                            <Button type="submit" variant="primary" loading={saving}>
                                Update Profile
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default DriverProfilePage;
