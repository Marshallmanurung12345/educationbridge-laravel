import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import NotificationMenu from "./NotificationMenu";

const linkClass = ({ isActive }) =>
  `px-2.5 py-2 text-[13px] font-medium transition-colors ${
    isActive ? "text-[#1a2d4d]" : "text-[#4c5a73] hover:text-[#1a2d4d]"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block border-b border-[#edf0f4] py-3 text-sm font-medium ${
    isActive ? "text-[#1a2d4d]" : "text-[#4c5a73]"
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function onLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#e4e7eb] bg-[#ffffff]">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-10">
        <NavLink to="/" className="flex items-center gap-2.5">
          <img
            src={logo}
            alt="EducationBridge Logo"
            className="h-8 w-auto max-h-8 object-contain"
          />
          <span className="font-display text-[1.45rem] leading-none text-[#1d273a]">
            EducationBridge
          </span>
        </NavLink>

        <nav className="hidden items-center gap-0 lg:flex">
          <NavLink to="/" className={linkClass}>
            Beranda
          </NavLink>

          {/* NAV LINKS KHUSUS SETIAP ROLE */}
          {user?.role === "pemerintah" && (
            <>
              <NavLink to="/dashboard-pemerintah" className={linkClass}>
                Dashboard Monev
              </NavLink>
              <NavLink to="/kampanye" className={linkClass}>
                Peta Kebutuhan Daerah
              </NavLink>
            </>
          )}

          {user?.role === "perusahaan" && (
            <>
              <NavLink to="/dashboard-perusahaan" className={linkClass}>
                Portal CSR
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
              <NavLink to="/ajukan" className={linkClass}>
                Dashboard Sekolah
              </NavLink>
              <NavLink to="/kampanye" className={linkClass}>
                Jelajahi Kebutuhan
              </NavLink>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <NavLink to="/admin" className={linkClass}>
                Panel Admin
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

        <div className="hidden items-center gap-3 lg:flex">
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

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-xl text-[#17365d] lg:hidden"
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? "×" : "☰"}
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-[#e4e7eb] bg-white px-4 pb-4 lg:hidden"
        >
          <nav aria-label="Navigasi mobile" className="mx-auto max-w-[1280px]">
            <NavLink
              to="/"
              className={mobileLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              Beranda
            </NavLink>

            {user?.role === "pemerintah" && (
              <>
                <NavLink
                  to="/dashboard-pemerintah"
                  className={mobileLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard Monev
                </NavLink>
                <NavLink
                  to="/kampanye"
                  className={mobileLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Peta Kebutuhan Daerah
                </NavLink>
              </>
            )}

            {user?.role === "perusahaan" && (
              <>
                <NavLink
                  to="/dashboard-perusahaan"
                  className={mobileLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Portal CSR
                </NavLink>
                <NavLink
                  to="/cocok"
                  className={mobileLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Program Adopsi
                </NavLink>
                <NavLink
                  to="/kampanye"
                  className={mobileLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Jelajahi Kebutuhan
                </NavLink>
              </>
            )}

            {user?.role === "sekolah" && (
              <>
                <NavLink
                  to="/ajukan"
                  className={mobileLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard Sekolah
                </NavLink>
                <NavLink
                  to="/kampanye"
                  className={mobileLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Jelajahi Kebutuhan
                </NavLink>
              </>
            )}

            {user?.role === "admin" && (
              <>
                <NavLink
                  to="/admin"
                  className={mobileLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Panel Admin
                </NavLink>
                <NavLink
                  to="/kampanye"
                  className={mobileLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Semua Kebutuhan
                </NavLink>
              </>
            )}

            {(!user || user?.role === "individu") && (
              <>
                <NavLink
                  to="/kampanye"
                  className={mobileLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Jelajahi Kebutuhan
                </NavLink>
                <NavLink
                  to="/cocok"
                  className={mobileLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Rekomendasi Pintar
                </NavLink>
              </>
            )}

            <a
              href="#footer"
              className={mobileLinkClass({ isActive: false })}
              onClick={() => setMobileMenuOpen(false)}
            >
              Tentang Kami
            </a>

            {user ? (
              <div className="flex items-center justify-between gap-3 pt-4">
                <span className="min-w-0 truncate text-sm font-medium text-[#1d273a]">
                  {user.name}
                </span>
                <div className="flex items-center gap-4">
                  <NotificationMenu user={user} />
                  <button
                    onClick={onLogout}
                    className="text-sm font-semibold text-[#a63c32]"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 pt-4">
                <NavLink
                  to="/masuk"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex min-h-10 flex-1 items-center justify-center border border-[#cbd3dc] px-4 text-sm font-medium text-[#17365d]"
                >
                  Masuk
                </NavLink>
                <NavLink
                  to="/daftar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex min-h-10 flex-1 items-center justify-center bg-[#17365d] px-4 text-sm font-medium text-white"
                >
                  Daftar
                </NavLink>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
