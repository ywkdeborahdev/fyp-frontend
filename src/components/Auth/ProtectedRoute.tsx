import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, setAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function verifyAuth() {
            try {
                // console.log('Verifying authentication...');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/protected`, {
                    credentials: 'include', // send cookies
                });

                if (response.status === 401) {
                    setAuthenticated(false);
                    console.log('Unauthorized access,');
                    return;
                };

                if (response.ok) {
                    setAuthenticated(true);
                } else {
                    setAuthenticated(false);
                }
            } catch {
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        }

        verifyAuth();
    }, [setAuthenticated]);

    if (loading) return <div>Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/signin" replace />;

    return <Outlet />;
};

export default ProtectedRoute;
