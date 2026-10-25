import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationMenu from "./NotificationMenu";
import logo from "../assets/logo.jpeg";

const links = [
  { label: "Ringkasan", to: "/dashboard-sekolah", icon: "M3 3h8v8H3z M13 3h8v5h-8z M13 10h8v11h-8z M3 13h8v8H3z" },
  { label: "Ajukan Kebutuhan Sekolah", to: "/ajukan", icon: "M12 5v14 M5 12h14" },
  { label: "Pengajuan Saya", to: "/dashboard-sekolah#pengajuan-saya", icon: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01" },
  { label: "Profil Sekolah", to: "/sekolah/profil", icon: "M20 21a8 8 0 0 0-16 0 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
];

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    onNavigate();
    navigate("/", { replace: true });
  }

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col bg-[#17345B] text-white">
      <Link
        to="/dashboard-sekolah"
        onClick={onNavigate}
        className="flex h-[68px] items-center gap-2.5 border-b border-white/10 px-5"
      >
        <img src={logo} alt="" className="h-9 w-9 rounded bg-white object-contain" />
        <span className="font-display text-lg font-semibold text-white">EducationBridge</span>
      </Link>

      <nav aria-label="Navigasi sekolah" className="flex flex-1 flex-col gap-2 px-3 py-5">
        {links.map(({ label, to, icon }) => {
          const isActive =
            to === "/dashboard-sekolah#pengajuan-saya"
              ? location.pathname === "/dashboard-sekolah" &&
                location.hash === "#pengajuan-saya"
              : to === "/dashboard-sekolah"
                ? location.pathname === to && location.hash !== "#pengajuan-saya"
                : location.pathname === to;

          return (
            <Link
              key={label}
              to={to}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-white/15 font-semibold text-white before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-r before:bg-[#F28C28]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] shrink-0 fill-none stroke-current stroke-[1.7]">
                <path d={icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="leading-5">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
            {user?.organization_name?.charAt(0)?.toUpperCase() || "S"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.organization_name || "Sekolah"}</p>
            <p className="truncate text-xs text-white/65">{user?.name}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 min-h-10 w-full rounded-lg border border-white/15 px-3 text-left text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}

export default function SchoolLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const title = location.pathname === "/ajukan"
    ? "Ajukan Kebutuhan Sekolah"
    : location.pathname === "/sekolah/profil" || location.pathname === "/status-verifikasi"
      ? "Profil Sekolah"
      : location.hash === "#pengajuan-saya"
        ? "Pengajuan Saya"
        : "Ringkasan";

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#17345B]">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <Sidebar onNavigate={() => setDrawerOpen(false)} />
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-slate-950/50"
          />
          <div className="relative h-full w-[min(84vw,280px)] shadow-xl">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0 lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#E6EAF0] bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label={drawerOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((open) => !open)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E6EAF0] text-lg text-[#17345B] lg:hidden"
            >
              {drawerOpen ? "×" : "☰"}
            </button>
            <div className="truncate text-sm">
              <span className="text-[#7B8798]">Sekolah</span>
              <span className="mx-2 text-[#B7C0CC]">/</span>
              <span className="font-semibold text-[#17345B]">{title}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationMenu user={user} />
            <span className="hidden max-w-56 truncate text-sm font-medium text-[#475467] sm:block">
              {user?.organization_name || user?.name}
            </span>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
