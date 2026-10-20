import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import NotificationMenu from "./NotificationMenu";

const linkClass = ({ isActive }) =>
  `border-b-2 px-2.5 py-2 text-[13px] font-medium transition-colors ${
    isActive
      ? "border-[#f28c28] text-[#17345b]"
      : "border-transparent text-[#42546b] hover:text-[#c56c13]"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block border-b border-[#edf0f4] py-3 text-sm font-medium ${
    isActive ? "text-[#17345b]" : "text-[#42546b] hover:text-[#c56c13]"
  }`;

const roleNames = {
  admin: "Admin",
  sekolah: "Sekolah",
  individu: "Donatur",
  perusahaan: "Mitra Perusahaan",
  pemerintah: "Pemerintah",
};

const roleLinks = {
  admin: [
    { label: "Panel Admin", to: "/admin" },
    { label: "Semua Kebutuhan", to: "/kampanye" },
  ],
  sekolah: [
    { label: "Dashboard Sekolah", to: "/ajukan" },
    { label: "Jelajahi Kebutuhan", to: "/kampanye" },
  ],
  individu: [
    { label: "Jelajahi Kebutuhan", to: "/kampanye" },
    { label: "Rekomendasi Pintar", to: "/cocok" },
  ],
  perusahaan: [
    { label: "Portal CSR", to: "/dashboard-perusahaan" },
    { label: "Program Adopsi", to: "/cocok" },
    { label: "Jelajahi Kebutuhan", to: "/kampanye" },
  ],
  pemerintah: [
    { label: "Dashboard Monev", to: "/dashboard-pemerintah" },
    { label: "Peta Kebutuhan Daerah", to: "/kampanye" },
  ],
};

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function onLogout() {
    await logout();
    setMobileMenuOpen(false);
    navigate("/");
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#e8edf2] bg-white">
      <div className="mx-auto flex min-h-[68px] w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-10">
        <Link
          to="/"
          onClick={closeMobileMenu}
          className="flex shrink-0 items-center gap-2.5"
        >
          <span
            aria-hidden="true"
            className="relative h-9 w-10 shrink-0 overflow-hidden"
          >
            <img
              src={logo}
              alt=""
              className="absolute -left-[14px] -top-[17px] h-[68px] w-[68px] max-w-none"
            />
          </span>
          <span className="font-display text-xl leading-none text-[#17345b] sm:text-[1.4rem]">
            EducationBridge
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-1 lg:flex"
        >
          <NavLink to="/" end className={linkClass}>
            Beranda
          </NavLink>
          <NavLink to="/kampanye" className={linkClass}>
            Kebutuhan Sekolah
          </NavLink>
          <a href="/#footer" className={linkClass({ isActive: false })}>
            Tentang Kami
          </a>
          <a href="/#dampak" className={linkClass({ isActive: false })}>
            Dampak
          </a>
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          {user ? (
            <>
              <NotificationMenu user={user} />
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-[#f5f7fa]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#17345b] text-sm font-semibold text-white">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                  <span className="max-w-32">
                    <span className="block truncate text-sm font-semibold text-[#17345b]">
                      {user.name}
                    </span>
                    <span className="block text-[11px] text-[#718096]">
                      {roleNames[user.role] || "Pengguna"}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-xs text-[#718096]">
                    ▾
                  </span>
                </summary>
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-[#e5eaf0] bg-white p-2 shadow-lg">
                  {(roleLinks[user.role] || []).map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block rounded-md px-3 py-2 text-sm text-[#42546b] hover:bg-[#f5f7fa] hover:text-[#17345b]"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={onLogout}
                    className="mt-1 block w-full border-t border-[#edf0f4] px-3 py-2 text-left text-sm font-medium text-[#a63c32] hover:bg-[#fff7f6]"
                  >
                    Keluar
                  </button>
                </div>
              </details>
            </>
          ) : (
            <>
              <NavLink
                to="/masuk"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#d5dde6] px-4 text-sm font-medium text-[#17345b] transition-colors hover:bg-[#f7f9fb]"
              >
                Masuk
              </NavLink>
              <NavLink
                to="/daftar"
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#f28c28] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#dc7616]"
              >
                Daftar
              </NavLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-2xl text-[#17345b] hover:bg-[#f5f7fa] lg:hidden"
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
          className="border-t border-[#e8edf2] bg-white px-4 pb-4 lg:hidden"
        >
          <nav
            aria-label="Navigasi mobile"
            className="mx-auto max-w-[1280px]"
          >
            <NavLink
              to="/"
              end
              className={mobileLinkClass}
              onClick={closeMobileMenu}
            >
              Beranda
            </NavLink>
            <NavLink
              to="/kampanye"
              className={mobileLinkClass}
              onClick={closeMobileMenu}
            >
              Kebutuhan Sekolah
            </NavLink>
            <a
              href="/#footer"
              className={mobileLinkClass({ isActive: false })}
              onClick={closeMobileMenu}
            >
              Tentang Kami
            </a>
            <a
              href="/#dampak"
              className={mobileLinkClass({ isActive: false })}
              onClick={closeMobileMenu}
            >
              Dampak
            </a>

            {user ? (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-[#edf0f4] py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[#17345b]">
                      {user.name}
                    </span>
                    <span className="text-xs text-[#718096]">
                      {roleNames[user.role] || "Pengguna"}
                    </span>
                  </span>
                  <NotificationMenu user={user} />
                </div>
                {(roleLinks[user.role] || []).map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={mobileLinkClass}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-4 w-full py-2 text-left text-sm font-semibold text-[#a63c32]"
                >
                  Keluar
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-4">
                <NavLink
                  to="/masuk"
                  onClick={closeMobileMenu}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-[#d5dde6] px-4 text-sm font-medium text-[#17345b]"
                >
                  Masuk
                </NavLink>
                <NavLink
                  to="/daftar"
                  onClick={closeMobileMenu}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-[#f28c28] px-4 text-sm font-semibold text-white"
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
