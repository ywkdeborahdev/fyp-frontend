import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PublicRoute: React.FC = () => {
    const { isAuthenticated, setAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function verifyAuth() {
            try {
                console.log('Verifying authentication...');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/protected`, {
                    credentials: 'include', // send cookies
                });

                if (response.status === 401) {
                    setAuthenticated(false);
                    console.log('Unauthorized access,');
                    return null;
                };
                if (response.ok) {
                    setAuthenticated(true);
                } else {
                    setAuthenticated(false);
                }
            } catch (error) {
                console.log('Error verifying authentication:', error);
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        }

        verifyAuth();
    }, [setAuthenticated]);

    if (loading) return <Navigate to="/signin" replace />;
    if (isAuthenticated) return <Navigate to="/home" replace />;

    return <Outlet />;
};

export default PublicRoute;
