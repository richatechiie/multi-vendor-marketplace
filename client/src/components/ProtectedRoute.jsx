// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user)   return <Navigate to="/login" replace />;

  if (role && user.role !== role)
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div
          className="rounded-2xl p-10 text-center max-w-sm w-full animate-fade-up"
          style={{
            background: "rgba(0,36,56,0.8)",
            border: "1px solid rgba(193,18,31,0.25)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6"
            style={{
              background: "rgba(193,18,31,0.1)",
              border: "1px solid rgba(193,18,31,0.25)",
            }}
          >
            🚫
          </div>
          <h2
            className="font-display font-bold text-2xl mb-2"
            style={{ color: "#FDF0D5" }}
          >
            Access Denied
          </h2>
          <p className="text-sm" style={{ color: "#b8a88a" }}>
            This page requires the{" "}
            <strong style={{ color: "#C1121F" }}>{role}</strong> role.
          </p>
        </div>
      </div>
    );

  return children;
}