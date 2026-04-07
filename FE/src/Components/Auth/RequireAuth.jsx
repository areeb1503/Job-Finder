import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext.jsx';
import Loader from '../Utils/Loader.jsx';


const RequireAuth = ({ allowedRole }) => {
  const { auth, loading } = useAuth();

  // ✅ Wait until auth is restored
  if (loading) return <p><Loader /></p>;

  if (!auth?.accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && auth.user?.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;