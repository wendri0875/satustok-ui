import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/auth";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}