import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }
    return children;
};

export default AdminRoute; 