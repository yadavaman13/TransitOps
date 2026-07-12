import React, { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading, error, handleGetMe } = useAuth();
    const [hasChecked, setHasChecked] = useState(false);
    const hasRequestedRef = useRef(false);

    useEffect(() => {
        if (hasRequestedRef.current) {
            return;
        }

        hasRequestedRef.current = true;

        const loadUser = async () => {
            try {
                await handleGetMe(true);
            } finally {
                setHasChecked(true);
            }
        };

        loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!hasChecked || (loading && !error && !user)) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#888' }}>
                Loading...
            </div>
        );
    }

    if (!user && !loading) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
