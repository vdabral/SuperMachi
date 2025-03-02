import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

/**
 * ProtectedRoute - Restricts access to authenticated users & handles role-based routing.
 * @param {Object} props - The component props.
 * @param {string} props.role - Role required to access the route (optional).
 */
const ProtectedRoute = ({ role }) => {
  const { user, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setIsAuthorized(false);
    } else if (role && user.role !== role) {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [user, loading, role]);

  // Show loading indicator while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (isAuthorized === false) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
