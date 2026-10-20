import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const links = [
  { label: "Ringkasan", to: "/dashboard-sekolah", end: true },
  { label: "Ajukan Kebutuhan Sekolah", to: "/ajukan" },
  { label: "Pengajuan Saya", to: "/dashboard-sekolah#pengajuan-saya" },
  { label: "Profil Sekolah", to: "/sekolah/profil" },
];

export default function SchoolLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    navigate("/", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F8FA]">
      <header className="sticky top-0 z-40 border-b border-[#E6EAF0] bg-white">
        <div className="mx-auto flex min-h-[68px] w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard-sekolah" className="flex shrink-0 items-center gap-2.5">
            <img src={logo} alt="" className="h-9 w-9 object-contain" />
            <span className="font-display text-lg font-semibold text-[#17345B]">EducationBridge</span>
          </Link>

          <nav aria-label="Navigasi sekolah" className="hidden items-center gap-1 lg:flex">
            {links.map(({ label, to, end }) => (
              <NavLink
                key={label}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#F1F5FA] text-[#17345B]"
                      : "text-[#667085] hover:bg-[#F7F8FA] hover:text-[#17345B]"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="max-w-44 truncate text-sm font-medium text-[#475467]">{user?.organization_name || user?.name}</span>
            <button type="button" onClick={handleLogout} className="rounded-lg border border-[#E2E7EE] px-3 py-2 text-sm font-medium text-[#475467] hover:bg-[#F7F8FA]">
              Keluar
            </button>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2E7EE] text-xl text-[#17345B] lg:hidden"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>

        {menuOpen && (
          <nav aria-label="Navigasi sekolah mobile" className="border-t border-[#E6EAF0] bg-white px-4 py-2 lg:hidden">
            {links.map(({ label, to, end }) => (
              <NavLink
                key={label}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block border-b border-[#F0F2F5] py-3 text-sm font-medium ${
                    isActive ? "text-[#17345B]" : "text-[#667085]"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="py-3 text-xs text-[#667085]">{user?.organization_name || user?.name}</div>
            <button type="button" onClick={handleLogout} className="w-full py-2 text-left text-sm font-semibold text-[#A63C32]">
              Keluar
            </button>
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
