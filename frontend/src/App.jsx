import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/PublicHome";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import CreateCampaign from "./pages/CreateCampaign";
import AdminDashboard from "./pages/AdminDashboard";
import SmartMatch from "./pages/SmartMatch";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  const location = useLocation();
  const isAuthPage = ["/masuk", "/daftar"].includes(location.pathname);

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kampanye" element={<Campaigns />} />
            <Route path="/kampanye/:id" element={<CampaignDetail />} />
            <Route path="/masuk" element={<Login />} />
            <Route path="/daftar" element={<Register />} />

            <Route
              path="/ajukan"
              element={
                <ProtectedRoute roles={["sekolah"]}>
                  <CreateCampaign />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cocok"
              element={
                <ProtectedRoute
                  roles={["individu", "perusahaan", "pemerintah"]}
                >
                  <SmartMatch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        {!isAuthPage && <Footer />}
      </div>
    </AuthProvider>
  );
}
