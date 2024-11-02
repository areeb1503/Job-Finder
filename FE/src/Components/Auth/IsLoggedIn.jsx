import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext.jsx';

function IsLoggedIn() {
    const { auth } = useAuth();
    const location = useLocation();

    return (
        <div>IsLoggedIn</div>
    )
}

export default IsLoggedIn