import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute: React.FC = () => {
    const {
        isAuthenticated,
        setAuthenticated,
        setUserGroup,
        setUsername,
        setUseremail
    } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function verifyAuth() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/protected`, {
                    credentials: 'include',
                });

                // --- DEBUGGING LINE 1 ---
                console.log('Backend response from /api/protected:', response);

                if (response.ok) {
                    const userData = await response.json();

                    // --- DEBUGGING LINE 2 ---
                    console.log('User data from backend:', userData);

                    setAuthenticated(true);
                    // Ensure the keys here (userData.userGroup, etc.) exactly match your backend's JSON response
                    setUserGroup(userData.userGroup || null);
                    setUsername(userData.username || null);
                    setUseremail(userData.useremail || null);
                } else {
                    console.error('Authentication check failed with status:', response.status);
                    setAuthenticated(false);
                    setUserGroup(null);
                    setUsername(null);
                    setUseremail(null);
                }
            } catch (error) {
                console.error("Auth verification failed with an error:", error);
                setAuthenticated(false);
                setUserGroup(null);
                setUsername(null);
                setUseremail(null);
            } finally {
                setLoading(false);
            }
        }

        verifyAuth();
    }, [setAuthenticated, setUserGroup, setUsername, setUseremail]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;