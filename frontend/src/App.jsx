import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import SchoolLayout from "./components/SchoolLayout";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import WelcomeOverlay from "./components/WelcomeOverlay";
import Home from "./pages/PublicHome";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import CreateCampaign from "./pages/CreateCampaign";
import AdminDashboard from "./pages/AdminDashboard";
import PemerintahDashboard from "./pages/PemerintahDashboard";
import PerusahaanDashboard from "./pages/PerusahaanDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SchoolAccountStatus from "./pages/SchoolAccountStatus";
import SchoolAccountReview from "./pages/SchoolAccountReview";
import AuditLogPage from "./pages/AuditLogPage";
import AdminSchools from "./pages/AdminSchools";
import SchoolDashboard from "./pages/SchoolDashboard";
import DonorDashboard from "./pages/DonorDashboard";
import PaymentStatus from "./pages/PaymentStatus";
import AdminReports from "./pages/AdminReports";

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const { user, ready } = useAuth();
  const isAdmin = user?.role === "admin";
  const isSchool = user?.role === "sekolah";
  const isAuthPage = ["/masuk", "/daftar", "/status-verifikasi"].includes(location.pathname);
  const publicPage = (page) => {
    if (!ready) return null;
    return isAdmin ? <Navigate to="/admin" replace /> : page;
  };

  return (
    <>
      <WelcomeOverlay />
      {isAdmin ? (
        <AdminLayout>
          <AppRoutes publicPage={publicPage} />
        </AdminLayout>
      ) : isSchool ? (
        <SchoolLayout>
          <AppRoutes publicPage={publicPage} />
        </SchoolLayout>
      ) : (
        <div className="flex min-h-screen min-w-0 flex-col">
          <Nav />
          <main className="min-w-0 flex-1">
            <AppRoutes publicPage={publicPage} />
          </main>
          {!isAuthPage && <Footer />}
        </div>
      )}
    </>
  );
}

function AppRoutes({ publicPage = (page) => page }) {
  return (
    <Routes>
      <Route path="/" element={publicPage(<Home />)} />
      <Route path="/kampanye" element={publicPage(<Campaigns />)} />
      <Route
        path="/kampanye/:id"
        element={publicPage(<CampaignDetail />)}
      />
      <Route path="/masuk" element={<Login />} />
      <Route path="/daftar" element={<Register />} />
      <Route
        path="/pembayaran/selesai"
        element={
          <ProtectedRoute roles={["individu", "perusahaan", "pemerintah"]}>
            <PaymentStatus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-sekolah"
        element={
          <ProtectedRoute roles={["sekolah"]}>
            <SchoolDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-donatur"
        element={
          <ProtectedRoute roles={["individu"]}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sekolah/profil"
        element={
          <ProtectedRoute roles={["sekolah"]}>
            <SchoolAccountStatus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/status-verifikasi"
        element={
          <ProtectedRoute roles={["sekolah"]}>
            <SchoolAccountStatus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/akun-sekolah"
        element={
          <ProtectedRoute roles={["admin"]}>
            <SchoolAccountReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-log"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AuditLogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/laporan"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/data-sekolah"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminSchools />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ajukan"
        element={
          <ProtectedRoute
            roles={["sekolah", "individu", "perusahaan", "pemerintah"]}
          >
            <CreateCampaign />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cocok"
        element={<Navigate to="/kampanye?sort=recommended" replace />}
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pengajuan-kampanye"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard campaignQueue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-pemerintah"
        element={
          <ProtectedRoute roles={["pemerintah"]}>
            <PemerintahDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard-perusahaan"
        element={
          <ProtectedRoute roles={["perusahaan"]}>
            <PerusahaanDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
