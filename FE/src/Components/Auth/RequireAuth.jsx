import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext.jsx'

function RequireAuth({allowedRole}) {
    const { auth } = useAuth();
    const location = useLocation();

    return (
        auth?.user?.role === allowedRole ? <Outlet /> : 
        <Navigate to="/unauthorized" state={{ from: location }} replace/>
    )
}

export default RequireAuth