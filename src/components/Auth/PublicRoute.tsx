import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PublicRoute: React.FC = () => {
    const { isAuthenticated, setAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);

    // This check is for users who are already logged in from a previous session.
    // We don't want to show them the sign-in page.
    useEffect(() => {
        async function verifyAuth() {
            // This logic is similar to ProtectedRoute, it checks for an existing session.
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/protected`, {
                    credentials: 'include', // This sends the httpOnly cookie
                });

                if (response.ok) {
                    setAuthenticated(true);
                } else {
                    setAuthenticated(false);
                }
            } catch (error) {
                console.error('Error verifying auth on public route:', error);
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        }

        // We only run this check if the auth status isn't already known.
        if (!isAuthenticated) {
            verifyAuth();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, setAuthenticated]);


    if (loading) {
        return <div>Loading...</div>; // Or a spinner
    }

    if (isAuthenticated) {
        // If logged in, don't show the sign-in page, redirect to the dashboard.
        return <Navigate to="/home" replace />;
    }

    // If not logged in, show the public route (e.g., SignIn).
    return <Outlet />;
};

export default PublicRoute;