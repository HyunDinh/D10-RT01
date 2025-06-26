import React from 'react';
import { Navigate } from 'react-router-dom';
import Unauthorized from '../pages/auth/Unauthorized'; // Import the Unauthorized component

const ProtectedRoute = ({ children, allowedRoles }) => {
    const userRole = localStorage.getItem('userRole');

    // Check if the user's role is in the allowedRoles array
    if (!userRole || !allowedRoles.includes(userRole)) {
        return <Unauthorized allowedRoles={allowedRoles} />;
    }

    return children;
};

export default ProtectedRoute;