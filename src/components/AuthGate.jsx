import { Navigate } from "react-router-dom";
import LoaderScreen from "../components/LoaderScreen";
import { useAuth } from "../context/AuthContext";

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoaderScreen />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
