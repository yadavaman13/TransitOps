import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/hooks/useAuth';
import Logout from '../../auth/components/LogoutButton';

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    React.useEffect(() => {
        if (user?.role === 'FINANCIAL_ANALYST') {
            navigate('/finance/dashboard', { replace: true });
        }
    }, [user, navigate]);

    return (
        <main>
            <div className="home-container">
                <h1>Welcome, {user?.name || user?.email}!</h1>
                <p>You are successfully logged in.</p>
                <Logout />
            </div>
        </main>
    );
};

export default HomePage;
