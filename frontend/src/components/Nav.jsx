import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import NotificationMenu from "./NotificationMenu";

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "text-[#1a2d4d]" : "text-[#4c5a73] hover:text-[#1a2d4d]"
  }`;

const roleConfig = {
  admin: {
    label: "Admin System",
    badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
  },
  sekolah: {
    label: "Sekolah (Pengaju)",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
  },
  individu: {
    label: "Donatur Individu",
    badgeBg: "bg-slate-100 text-slate-800 border-slate-200",
  },
  perusahaan: {
    label: "Mitra CSR Perusahaan",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  pemerintah: {
    label: "Pemerintah / Monev",
    badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
  },
};

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#e4e7eb] bg-[#ffffff]">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-10">
        <NavLink to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="EducationBridge Logo"
            className="h-9 w-auto max-h-9 object-contain"
          />
          <span className="font-display text-[1.55rem] leading-none text-[#1d273a]">
            EducationBridge
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink to="/" className={linkClass}>
            Beranda
          </NavLink>

          {/* NAV LINKS KHUSUS SETIAP ROLE */}
          {user?.role === "pemerintah" && (
            <>
              <NavLink
                to="/dashboard-pemerintah"
                className="px-3.5 py-1.5 text-xs font-bold text-amber-950 bg-amber-100/80 hover:bg-amber-200/80 rounded-lg border border-amber-300 shadow-sm transition"
              >
                🏛️ Dashboard Monev
              </NavLink>
              <NavLink to="/kampanye" className={linkClass}>
                Peta Kebutuhan Daerah
              </NavLink>
            </>
          )}

          {user?.role === "perusahaan" && (
            <>
              <NavLink
                to="/dashboard-perusahaan"
                className="px-3.5 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-100/80 hover:bg-emerald-200/80 rounded-lg border border-emerald-300 shadow-sm transition"
              >
                🏢 Portal CSR
              </NavLink>
              <NavLink to="/cocok" className={linkClass}>
                Program Adopsi
              </NavLink>
              <NavLink to="/kampanye" className={linkClass}>
                Jelajahi Kebutuhan
              </NavLink>
            </>
          )}

          {user?.role === "sekolah" && (
            <>
              <NavLink
                to="/ajukan"
                className="px-3.5 py-1.5 text-xs font-bold text-blue-950 bg-blue-100/80 hover:bg-blue-200/80 rounded-lg border border-blue-300 shadow-sm transition"
              >
                🏫 Dashboard Sekolah
              </NavLink>
              <NavLink to="/kampanye" className={linkClass}>
                Jelajahi Kebutuhan
              </NavLink>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <NavLink
                to="/admin"
                className="px-3.5 py-1.5 text-xs font-bold text-purple-950 bg-purple-100/80 hover:bg-purple-200/80 rounded-lg border border-purple-300 shadow-sm transition"
              >
                ⚡ Panel Admin
              </NavLink>
              <NavLink to="/kampanye" className={linkClass}>
                Semua Kebutuhan
              </NavLink>
            </>
          )}

          {(!user || user?.role === "individu") && (
            <>
              <NavLink to="/kampanye" className={linkClass}>
                Jelajahi Kebutuhan
              </NavLink>
              <NavLink to="/cocok" className={linkClass}>
                Rekomendasi Pintar
              </NavLink>
            </>
          )}

          <a href="#footer" className={linkClass}>
            Tentang Kami
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2 border-b border-[#cfd5dd] px-1 py-2">
            <span aria-hidden="true" className="text-sm text-[#667085]">
              ⌕
            </span>
            <input
              aria-label="Cari sekolah, lokasi, atau kebutuhan"
              placeholder="Cari kebutuhan"
              className="w-32 border-0 bg-transparent text-sm text-[#384862] placeholder:text-[#98a2b3] focus:outline-none"
            />
          </div>

          {user ? (
            <div className="flex items-center gap-3 border-l border-[#e4e7eb] pl-3">
              <NotificationMenu user={user} />

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a2d4d] text-sm font-semibold text-white">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-[#1d273a]">
                  {user.name}
                </div>
                <span
                  className={`inline-block text-[10px] font-bold border rounded px-1.5 py-0.2 ${roleConfig[user.role]?.badgeBg || "bg-slate-100"}`}
                >
                  {roleConfig[user.role]?.label || "Donatur"}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="ml-1 text-xs font-semibold text-red-600 hover:text-red-800"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/masuk"
                className="border border-[#cfd5dd] px-4 py-2 text-sm font-medium text-[#1d273a] transition hover:bg-[#f4f6f8]"
              >
                Masuk
              </NavLink>
              <NavLink
                to="/daftar"
                className="bg-[#1a2d4d] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#223c70]"
              >
                Daftar
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
