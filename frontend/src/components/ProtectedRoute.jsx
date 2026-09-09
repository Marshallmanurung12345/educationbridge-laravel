import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ roles, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null;

  if (!user) {
    return <Navigate to="/masuk" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <h1 className="font-display text-2xl">Akses terbatas</h1>
        <p className="text-ink-light mt-2">
          Halaman ini hanya untuk peran: {roles.join(", ")}. Akun Anda saat ini berperan sebagai {user.role}.
        </p>
      </div>
    );
  }

  return children;
}
