import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="empty">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && !isAdmin)
    return <p className="empty">This area is for the site admin only.</p>;
  return children;
}
