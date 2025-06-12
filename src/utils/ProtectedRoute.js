// frontend/src/utils/ProtectedRoute.js

import React from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify"; // Make sure react-toastify is installed

import { useAuth } from "contexts/AuthContext"; // Adjust path if your AuthContext.js moves

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // If AuthContext is still loading the authentication status (e.g., checking localStorage),
  // display a temporary loading message. This prevents flickering or premature redirects.
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "20px",
          color: "#333",
        }}
      >
        Verificando permisos...
      </div>
    );
  }

  // First, check if the user is authenticated at all.
  // Although `App.js` will handle the primary redirect for unauthenticated users,
  // this provides an additional layer of safety, especially if this component
  // is ever used outside the main `App.js` routing structure or for direct access.
  if (!isAuthenticated) {
    // If not authenticated, redirect to the sign-in page.
    // We don't show a toast here, as the main App.js handles the primary unauthorized redirect.
    return <Navigate to="/authentication/sign-in" replace />;
  }

  // If authenticated, now check if their role is allowed for this specific route.
  const userRole = user?.role; // Safely get the user's role from the context

  // Check if the user has a role AND if that role is included in the `allowedRoles` array
  if (!userRole || !allowedRoles.includes(userRole)) {
    // If the user's role is not allowed, show a toast notification.
    toast.error("No tienes permiso para acceder a esta página.");
    // Redirect the unauthorized user to a default safe page (e.g., dashboard)
    // within the authenticated area.
    return <Navigate to="/dashboard" replace />;
  }

  // If all checks pass (authenticated and role is allowed), render the protected component.
  return children;
};

ProtectedRoute.propTypes = {
  /**
   * The child components (the actual page/layout) that this route protects.
   */
  children: PropTypes.node.isRequired,
  /**
   * An array of roles that are allowed to access this route.
   * Example: `['Administrador', 'Editor']`
   */
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ProtectedRoute;
