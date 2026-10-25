import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingIndicator from "./LoadingIndicator";

export default function ProtectedRoute({ roles, children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <LoadingIndicator
        label="Memeriksa sesi akun…"
        className="min-h-[calc(100svh-68px)] px-5 py-12"
      />
    );
  }

  if (!user) {
    return <Navigate to="/masuk" state={{ from: location.pathname }} replace />;
  }

  if (
    user.role === "sekolah" &&
    user.account_status !== "verified" &&
    location.pathname === "/ajukan"
  ) {
    return (
      <main className="min-h-[calc(100svh-68px)] bg-[#F7F8FA] px-4 py-8 sm:px-6">
        <section className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-white p-6 sm:p-8">
          <p className="text-sm font-semibold text-amber-800">Verifikasi diperlukan</p>
          <h1 className="page-title mt-2 text-[#17345B]">
            Akun sekolah belum terverifikasi
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#667085]">
            Pengajuan kebutuhan sekolah tersedia setelah admin menyelesaikan
            verifikasi akun. Anda dapat melihat status dan catatan admin melalui
            halaman profil sekolah.
          </p>
          <Link
            to="/sekolah/profil"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#17345B] px-4 text-sm font-semibold text-white hover:bg-[#244977]"
          >
            Lihat Profil dan Status Verifikasi
          </Link>
        </section>
      </main>
    );
  }

  if (
    user.role === "sekolah" &&
    user.account_status === "verified" &&
    location.pathname === "/status-verifikasi"
  ) {
    return <Navigate to="/sekolah/profil" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <h1 className="page-title">Akses terbatas</h1>
        <p className="text-ink-light mt-2">
          Halaman ini hanya untuk peran: {roles.join(", ")}. Akun Anda saat ini berperan sebagai {user.role}.
        </p>
      </div>
    );
  }

  return children;
}
