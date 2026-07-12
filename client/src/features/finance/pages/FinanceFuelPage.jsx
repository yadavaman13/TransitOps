import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Button,
    Modal,
    Input,
    Select,
    FormSection,
    FormRow,
    FormActions
} from '../../template';
import { getFuelLogsApi, createFuelLogApi } from '../services/finance.api.js';
import '../styles/finance.scss';

export default function FinanceFuelPage() {
    const [fuelLogs, setFuelLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal & Dropdowns States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSubmitting, setModalSubmitting] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [trips, setTrips] = useState([]);

    // Form Field States
    const [modalTripId, setModalTripId] = useState('');
    const [modalLitres, setModalLitres] = useState('');
    const [modalPricePerLitre, setModalPricePerLitre] = useState('');
    const [modalTotalCost, setModalTotalCost] = useState('');
    const [modalStationName, setModalStationName] = useState('');
    const [modalOdometer, setModalOdometer] = useState('');
    const [modalReceiptUrl, setModalReceiptUrl] = useState('');

    // Trip details helpers (derived states)
    const selectedTrip = trips.find(t => t.id === modalTripId);
    const associatedVehicle = selectedTrip 
        ? vehicles.find(v => v.id === selectedTrip.vehicleId) 
        : null;

    const fetchFuelLogs = async () => {
        try {
            setLoading(true);
            const res = await getFuelLogsApi();
            if (res.success) {
                setFuelLogs(res.data.fuelLogs);
            } else {
                setError(res.message || 'Failed to load fuel logs');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error communicating with server');
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdowns = async () => {
        try {
            const vehRes = await axios.get('/api/vehicles', { withCredentials: true });
            if (vehRes.data?.success) {
                const list = vehRes.data.data.vehicles || vehRes.data.data || [];
                setVehicles(list);
            }
            const tripRes = await axios.get('/api/trips', { withCredentials: true });
            if (tripRes.data?.success) {
                const list = tripRes.data.data.trips || tripRes.data.data || [];
                setTrips(list);
            }
        } catch (err) {
            console.error('Dropdown load warning:', err);
        }
    };

    useEffect(() => {
        fetchFuelLogs();
        fetchDropdowns();
    }, []);

    // Auto-calculate total cost and set minimum odometer when parameters change
    useEffect(() => {
        const l = parseFloat(modalLitres);
        const p = parseFloat(modalPricePerLitre);
        if (!isNaN(l) && !isNaN(p)) {
            setModalTotalCost((l * p).toFixed(2));
        } else {
            setModalTotalCost('');
        }
    }, [modalLitres, modalPricePerLitre]);

    useEffect(() => {
        if (associatedVehicle) {
            setModalOdometer(Math.ceil(parseFloat(associatedVehicle.currentOdometer || 0)).toString());
        } else {
            setModalOdometer('');
        }
    }, [associatedVehicle]);

    const handleCreateFuelLog = async (e) => {
        e.preventDefault();
        try {
            setModalSubmitting(true);
            setModalError(null);

            if (!modalTripId) {
                throw new Error('Please select an active trip assignment');
            }
            if (!selectedTrip || !selectedTrip.vehicleId || !selectedTrip.driverId) {
                throw new Error('Selected trip is missing assigned driver or vehicle');
            }

            const payload = {
                tripId: modalTripId,
                vehicleId: selectedTrip.vehicleId,
                driverId: selectedTrip.driverId,
                litres: parseFloat(modalLitres),
                pricePerLitre: parseFloat(modalPricePerLitre),
                totalCost: parseFloat(modalTotalCost),
                stationName: modalStationName.trim(),
                odometer: parseFloat(modalOdometer),
                receiptUrl: modalReceiptUrl.trim() || undefined
            };

            const res = await createFuelLogApi(payload);
            if (res.success) {
                setIsModalOpen(false);
                // Clear fields
                setModalTripId('');
                setModalLitres('');
                setModalPricePerLitre('');
                setModalTotalCost('');
                setModalStationName('');
                setModalOdometer('');
                setModalReceiptUrl('');
                fetchFuelLogs();
            } else {
                setModalError(res.message || 'Failed to record fuel log');
            }
        } catch (err) {
            console.error(err);
            setModalError(err.response?.data?.message || err.message || 'Failed to submit fuel log');
        } finally {
            setModalSubmitting(false);
        }
    };

    const formatCurrency = (val) => {
        return typeof val === 'number'
            ? `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `₹${parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="finance-container">
            {/* Header */}
            <div className="finance-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="finance-header__title">
                    <h1><i className="ri-gas-station-line" aria-hidden="true" /> Fuel Logs</h1>
                    <p>Audit vehicle refueling transactions, fuel rates, and total consumption costs</p>
                </div>
                <Button variant="primary" icon="ri-add-line" onClick={() => setIsModalOpen(true)}>
                    Log Refueling
                </Button>
            </div>

            {/* Table Card */}
            <div className="finance-table-card">
                <div className="finance-table-card__header">
                    <span>Fuel Refilling Entries</span>
                </div>
                <div className="finance-table-card__table-wrapper">
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
                            <div className="spinner" style={{ border: '3px solid var(--border-color)', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--danger)' }}>
                            <i className="ri-error-warning-line" style={{ fontSize: '24px', marginRight: '8px' }} />
                            <span>{error}</span>
                        </div>
                    ) : fuelLogs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                            <i className="ri-inbox-line" style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }} />
                            <span>No fuel log records found in the database</span>
                        </div>
                    ) : (
                        <table className="finance-table">
                            <thead>
                                <tr>
                                    <th>Vehicle</th>
                                    <th>Trip</th>
                                    <th>Litres</th>
                                    <th>Price/Litre</th>
                                    <th>Total Cost</th>
                                    <th>Station Name</th>
                                    <th>Odometer</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fuelLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td style={{ fontWeight: 600 }}>
                                            {log.registrationNumber ? `${log.registrationNumber} (${log.vehicleNumber})` : '—'}
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{log.tripNumber || '—'}</td>
                                        <td>{Number(log.litres).toFixed(2)} L</td>
                                        <td>{formatCurrency(log.pricePerLitre)}/L</td>
                                        <td style={{ fontWeight: 600 }}>{formatCurrency(log.totalCost)}</td>
                                        <td>{log.stationName || '—'}</td>
                                        <td>{log.odometer ? `${Number(log.odometer).toLocaleString()} km` : '—'}</td>
                                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(log.date)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Log Refueling Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setModalError(null);
                }}
                title="Log Vehicle Refueling"
            >
                <form onSubmit={handleCreateFuelLog}>
                    {modalError && (
                        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="ri-error-warning-fill" />
                            <span>{modalError}</span>
                        </div>
                    )}

                    <FormSection style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <FormRow>
                            <Select
                                label="Active Trip Assignment"
                                required
                                options={trips.map(t => ({
                                    value: t.id,
                                    label: `${t.tripNumber} (${t.source} ➜ ${t.destination})`
                                }))}
                                value={modalTripId}
                                onChange={(e) => setModalTripId(e.target.value)}
                                placeholder="Select Trip Assignment"
                            />
                        </FormRow>

                        {selectedTrip && (
                            <FormRow cols={2}>
                                <Input
                                    label="Assigned Vehicle"
                                    value={associatedVehicle ? `${associatedVehicle.registrationNumber} (${associatedVehicle.brand} ${associatedVehicle.model})` : 'Loading...'}
                                    disabled
                                />
                                <Input
                                    label="Assigned Driver"
                                    value={selectedTrip.driver?.name || 'Loading...'}
                                    disabled
                                />
                            </FormRow>
                        )}

                        <FormRow cols={2}>
                            <Input
                                type="number"
                                label="Fuel Litres"
                                required
                                step="0.01"
                                min="0.01"
                                placeholder="e.g. 50.5"
                                value={modalLitres}
                                onChange={(e) => setModalLitres(e.target.value)}
                            />
                            <Input
                                type="number"
                                label="Price Per Litre (₹)"
                                required
                                step="0.01"
                                min="0.01"
                                placeholder="e.g. 96.50"
                                value={modalPricePerLitre}
                                onChange={(e) => setModalPricePerLitre(e.target.value)}
                            />
                        </FormRow>

                        <FormRow cols={2}>
                            <Input
                                type="number"
                                label="Total Cost (₹)"
                                required
                                step="0.01"
                                min="0.00"
                                placeholder="Calculated total cost"
                                value={modalTotalCost}
                                onChange={(e) => setModalTotalCost(e.target.value)}
                            />
                            <Input
                                type="number"
                                label="Odometer Reading (km)"
                                required
                                step="1"
                                min="0"
                                placeholder={associatedVehicle ? `Min: ${Math.ceil(parseFloat(associatedVehicle.currentOdometer))}` : "e.g. 45000"}
                                value={modalOdometer}
                                onChange={(e) => setModalOdometer(e.target.value)}
                            />
                        </FormRow>

                        <FormRow>
                            <Input
                                label="Fuel Station Name"
                                required
                                placeholder="e.g. Indian Oil, Sector 15"
                                value={modalStationName}
                                onChange={(e) => setModalStationName(e.target.value)}
                            />
                        </FormRow>

                        <FormRow>
                            <Input
                                label="Receipt Attachment URL"
                                placeholder="e.g. https://image-upload.com/receipt.jpg"
                                value={modalReceiptUrl}
                                onChange={(e) => setModalReceiptUrl(e.target.value)}
                            />
                        </FormRow>
                    </FormSection>

                    <FormActions style={{ marginTop: '24px' }}>
                        <Button
                            variant="neutral"
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                setModalError(null);
                            }}
                            disabled={modalSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            loading={modalSubmitting}
                        >
                            Submit Log
                        </Button>
                    </FormActions>
                </form>
            </Modal>
        </div>
    );
}
