import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as driverApi from '../service/driver.api';

export const useDriverDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [driverDetails, setDriverDetails] = useState(null);
    const [trips, setTrips] = useState([]);
    const [fuelLogs, setFuelLogs] = useState([]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const [detailsRes, tripsRes, fuelRes] = await Promise.all([
                driverApi.getDriverDetails(user.id),
                driverApi.getDriverTrips(),
                driverApi.getFuelLogs()
            ]);
            setDriverDetails(detailsRes.data);
            setTrips(tripsRes.data || []);
            setFuelLogs(fuelRes.data || []);
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
            setError(err?.response?.data?.message || 'Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    // Compute stats
    const activeTrip = trips.find(t => t.status === 'STARTED') || trips.find(t => t.status === 'DISPATCHED') || null;
    const assignedTripsCount = trips.filter(t => t.status === 'DISPATCHED').length;
    const completedTripsCount = trips.filter(t => t.status === 'COMPLETED').length;
    
    // Today's trips: planned start date is today (in local timezone)
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
    const todayTrips = trips.filter(t => {
        if (!t.plannedStart) return false;
        const plannedStr = new Date(t.plannedStart).toLocaleDateString('en-CA');
        return plannedStr === todayStr;
    });

    return {
        loading,
        error,
        driverDetails,
        trips,
        fuelLogs,
        activeTrip,
        assignedTripsCount,
        completedTripsCount,
        todayTripsCount: todayTrips.length,
        fuelLogsCount: fuelLogs.length,
        refetch: fetchData
    };
};
