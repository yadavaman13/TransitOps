import { useState, useEffect } from 'react';
import * as driverApi from '../service/driver.api';
import { useToast } from '../../template';

export const useDriverTrips = () => {
    const { addToast } = useToast();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'running' | 'completed' | 'history'

    // Details Drawer
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [timeline, setTimeline] = useState(null);
    const [tripFuelLogs, setTripFuelLogs] = useState([]);
    const [drawerLoading, setDrawerLoading] = useState(false);

    // Filters for History Tab
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        status: '',
        search: ''
    });

    const fetchTrips = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await driverApi.getDriverTrips();
            setTrips(res.data || []);
        } catch (err) {
            console.error('Failed to fetch driver trips:', err);
            setError(err?.response?.data?.message || 'Failed to fetch trips.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTripDetails = async (tripId) => {
        if (!tripId) return;
        setDrawerLoading(true);
        try {
            const [timelineRes, fuelRes] = await Promise.all([
                driverApi.getTripTimeline(tripId),
                driverApi.getFuelLogs()
            ]);
            setTimeline(timelineRes.data);
            const logs = fuelRes.data || [];
            setTripFuelLogs(logs.filter(log => log.tripId === tripId));
        } catch (err) {
            console.error('Failed to fetch trip details:', err);
            addToast({
                type: 'error',
                title: 'Error',
                message: err?.response?.data?.message || 'Failed to fetch trip details.'
            });
        } finally {
            setDrawerLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    useEffect(() => {
        if (selectedTrip) {
            fetchTripDetails(selectedTrip.id);
        } else {
            setTimeline(null);
            setTripFuelLogs([]);
        }
    }, [selectedTrip]);

    const handleStartTrip = async (tripId) => {
        setActionLoading(true);
        try {
            await driverApi.startTrip(tripId);
            addToast({
                type: 'success',
                title: 'Trip Started',
                message: 'You have successfully started the trip.'
            });
            await fetchTrips();
            if (selectedTrip && selectedTrip.id === tripId) {
                setSelectedTrip(prev => ({ ...prev, status: 'STARTED' }));
            }
        } catch (err) {
            console.error('Failed to start trip:', err);
            addToast({
                type: 'error',
                title: 'Start Trip Failed',
                message: err?.response?.data?.message || 'Failed to start trip.'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleCompleteTrip = async (tripId, completionData) => {
        setActionLoading(true);
        try {
            await driverApi.completeTrip(tripId, completionData);
            addToast({
                type: 'success',
                title: 'Trip Completed',
                message: 'Trip completed successfully!'
            });
            await fetchTrips();
            if (selectedTrip && selectedTrip.id === tripId) {
                setSelectedTrip(null);
            }
        } catch (err) {
            console.error('Failed to complete trip:', err);
            addToast({
                type: 'error',
                title: 'Completion Failed',
                message: err?.response?.data?.message || 'Failed to complete trip.'
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Filter lists
    const assignedTrips = trips.filter(t => t.status === 'DISPATCHED');
    const runningTrips = trips.filter(t => t.status === 'STARTED');
    const completedTrips = trips.filter(t => t.status === 'COMPLETED');

    const historyTrips = trips.filter(t => {
        if (filters.startDate) {
            const startLimit = new Date(filters.startDate);
            const tripStart = new Date(t.plannedStart);
            if (tripStart < startLimit) return false;
        }
        if (filters.endDate) {
            const endLimit = new Date(filters.endDate);
            endLimit.setHours(23, 59, 59, 999);
            const tripStart = new Date(t.plannedStart);
            if (tripStart > endLimit) return false;
        }
        if (filters.status && t.status !== filters.status) return false;
        if (filters.search) {
            const q = filters.search.toLowerCase();
            const tripNo = (t.tripNumber || '').toLowerCase();
            const src = (t.source || '').toLowerCase();
            const dest = (t.destination || '').toLowerCase();
            const cargo = (t.cargoName || '').toLowerCase();
            if (!tripNo.includes(q) && !src.includes(q) && !dest.includes(q) && !cargo.includes(q)) {
                return false;
            }
        }
        return true;
    });

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            status: '',
            search: ''
        });
    };

    return {
        trips,
        loading,
        actionLoading,
        error,
        activeTab,
        setActiveTab,
        selectedTrip,
        setSelectedTrip,
        timeline,
        tripFuelLogs,
        drawerLoading,
        filters,
        updateFilter,
        resetFilters,
        assignedTrips,
        runningTrips,
        completedTrips,
        historyTrips,
        startTrip: handleStartTrip,
        completeTrip: handleCompleteTrip,
        refetch: fetchTrips
    };
};
