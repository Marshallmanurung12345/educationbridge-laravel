import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationMenu from "./NotificationMenu";
import logo from "../assets/logo.jpeg";

const links = [
  { label: "Ringkasan", to: "/admin", icon: "M3 3h8v8H3z M13 3h8v5h-8z M13 10h8v11h-8z M3 13h8v8H3z" },
  { label: "Verifikasi Sekolah", to: "/admin/akun-sekolah", icon: "M9 12l2 2 4-4 M5 3h10l4 4v14H5z M15 3v5h5" },
  { label: "Tinjau Kebutuhan Sekolah", to: "/admin/pengajuan-kampanye", icon: "M7 4h10 M7 8h10 M7 12h6 M5 3h14v18H5z" },
  { label: "Data Sekolah", to: "/admin/data-sekolah", icon: "M3 21h18 M5 21V7l7-4 7 4v14 M9 10h1 M14 10h1 M9 14h1 M14 14h1" },
  { label: "Laporan Penggunaan Dana", to: "/admin/laporan", icon: "M5 3h14v18H5z M8 8h8 M8 12h8 M8 16h5" },
  { label: "Audit Aktivitas", to: "/admin/audit-log", icon: "M12 8v4l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
];

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    onNavigate();
    navigate("/masuk", { replace: true });
  }

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col bg-[#17345B] text-white">
      <Link
        to="/admin"
        onClick={onNavigate}
        className="flex h-[68px] items-center gap-2.5 border-b border-white/10 px-5"
      >
        <img src={logo} alt="" className="h-9 w-9 rounded bg-white object-contain" />
        <span className="font-display text-lg text-white">EducationBridge</span>
      </Link>

      <nav aria-label="Navigasi admin" className="flex-1 space-y-1 px-3 py-5">
        {links.map(({ label, to, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition ${
                isActive
                  ? "bg-white/15 font-semibold text-white before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-r before:bg-[#F28C28]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] shrink-0 fill-none stroke-current stroke-[1.7]">
              <path d={icon} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.name || "Admin"}</p>
            <p className="text-xs text-white/65">Administrator</p>
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

const pageTitles = Object.fromEntries(links.map(({ to, label }) => [to, label]));

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const title = pageTitles[location.pathname] || "Ringkasan";

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
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setDrawerOpen(false)}
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
              aria-label="Buka menu admin"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E6EAF0] text-lg lg:hidden"
            >
              ☰
            </button>
            <div className="truncate text-sm">
              <span className="text-[#7B8798]">Admin</span>
              <span className="mx-2 text-[#B7C0CC]">/</span>
              <span className="font-semibold text-[#17345B]">{title}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <NotificationMenu user={user} />
            <div className="hidden items-center gap-2 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8EFF8] text-sm font-semibold text-[#17345B]">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </span>
              <span className="max-w-40 truncate text-sm font-medium">{user?.name || "Admin"}</span>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
