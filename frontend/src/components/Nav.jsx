import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";
import NotificationMenu from "./NotificationMenu";

const publicLinks = [
  ["Beranda", "/"],
  ["Kebutuhan Sekolah", "/kampanye"],
  ["Dampak", "/#dampak"],
];

const roleLinks = {
  admin: [
    ["Dashboard Admin", "/admin"],
    ["Akun Sekolah", "/admin/akun-sekolah"],
    ["Audit Log", "/admin/audit-log"],
  ],
  sekolah: [
    ["Dashboard Sekolah", "/ajukan"],
    ["Jelajahi Kebutuhan", "/kampanye"],
  ],
  individu: [
    ["Jelajahi Kebutuhan", "/kampanye"],
    ["Ajukan Kebutuhan", "/ajukan"],
  ],
  perusahaan: [
    ["Dashboard CSR", "/dashboard-perusahaan"],
    ["Jelajahi Kebutuhan", "/kampanye"],
    ["Ajukan Kebutuhan", "/ajukan"],
  ],
  pemerintah: [
    ["Dashboard Pemerintah", "/dashboard-pemerintah"],
    ["Peta Kebutuhan", "/kampanye"],
    ["Ajukan Kebutuhan", "/ajukan"],
  ],
};

const roleLabels = {
  admin: "Administrator",
  sekolah: "Akun Sekolah",
  individu: "Donatur Individu",
  perusahaan: "Perusahaan / CSR",
  pemerintah: "Instansi Pemerintah",
  user: "Pengguna",
};

function ProfileMenu({
  user,
  links,
  onLogout,
  onNavigate,
  mobile = false,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function closeOnOutsidePointer(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
    onNavigate();
  }

  return (
    <div ref={menuRef} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={
          mobile
            ? "flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-white/10"
            : "flex min-h-10 min-w-0 max-w-56 items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-white/10"
        }
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-white">
              {user.name}
            </span>
            <span className="block truncate text-[11px] text-white/70">
              {mobile ? (roleLabels[user.role] || roleLabels.user) : "Menu profil"}
            </span>
          </span>
        </span>
        <span aria-hidden="true" className="shrink-0 text-xs text-white/70">
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Menu profil"
          className={
            mobile
              ? "mt-2 max-h-[min(60vh,24rem)] overflow-y-auto rounded-lg border border-white/15 bg-white p-2 text-[#42546b] shadow-lg"
              : "absolute right-0 top-full z-[60] mt-2 max-h-[min(70vh,32rem)] w-60 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg border border-[#e5eaf0] bg-white p-2 text-[#42546b] shadow-xl"
          }
        >
          {!mobile && (
            <div className="border-b border-[#edf0f4] px-3 py-2">
              <p className="truncate text-sm font-semibold text-[#17345b]">{user.name}</p>
              <p className="text-xs text-[#718096]">{roleLabels[user.role] || roleLabels.user}</p>
            </div>
          )}
          {links.map(([label, to]) => (
            <Link
              key={to}
              to={to}
              role="menuitem"
              onClick={closeMenu}
              className="block min-h-10 rounded-md px-3 py-2.5 text-sm transition hover:bg-[#f5f7fa] hover:text-[#17345b]"
            >
              {label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="mt-1 block min-h-10 w-full border-t border-[#edf0f4] px-3 py-2.5 text-left text-sm font-medium text-[#a63c32] transition hover:bg-[#fff7f6]"
          >
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const primaryLinks = isAdmin
    ? roleLinks.admin.map(([label, to]) => [label, to])
    : user?.role === "individu"
      ? [...publicLinks, ["Donasi Saya", "/dashboard-donatur"]]
      : publicLinks;
  const userRoleLinks =
    user?.role === "sekolah" && user.account_status !== "verified"
      ? [["Status Verifikasi", "/status-verifikasi"], ["Jelajahi Kebutuhan", "/kampanye"]]
      : roleLinks[user?.role] || [];
  const profileLinks = isAdmin ? [] : userRoleLinks;

  async function onLogout() {
    await logout();
    setMobileMenuOpen(false);
    navigate("/");
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#29496f] bg-[#17345b]">
      <div className="mx-auto flex min-h-[68px] w-full max-w-[1280px] items-center justify-between gap-3 px-4 sm:gap-4 sm:px-8 lg:px-10">
        <Link
          to={isAdmin ? "/admin" : "/"}
          onClick={closeMobileMenu}
          className="flex shrink-0 items-center gap-2.5"
        >
          <span aria-hidden="true" className="relative h-9 w-10 shrink-0 overflow-hidden">
            <img
              src={logo}
              alt=""
              className="absolute -left-[14px] -top-[17px] h-[68px] w-[68px] max-w-none"
            />
          </span>
          <span className="font-display text-lg leading-none text-white sm:text-[1.4rem]">
            EducationBridge
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
          {primaryLinks.map(([label, to]) =>
            label === "Dampak" ? (
              <a
                key={to}
                href={to}
                className="border-b-2 border-transparent px-2.5 py-2 text-[13px] font-medium text-white/90 transition-colors hover:border-[#f28c28] hover:text-white"
              >
                {label}
              </a>
            ) : (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `border-b-2 px-2.5 py-2 text-[13px] font-medium transition-colors ${
                    isActive
                      ? "border-[#f28c28] text-white"
                      : "border-transparent text-white/90 hover:text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {user ? (
            <>
              <NotificationMenu user={user} />
              <ProfileMenu
                user={user}
                links={profileLinks}
                onLogout={onLogout}
                onNavigate={closeMobileMenu}
              />
            </>
          ) : (
            <>
              <NavLink
                to="/masuk"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/45 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
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

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-2xl text-white hover:bg-white/10"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-white/15 bg-[#17345b] px-4 pb-4 lg:hidden"
        >
          <nav aria-label="Navigasi mobile" className="mx-auto max-w-[1280px]">
            {primaryLinks.map(([label, to]) =>
              label === "Dampak" ? (
                <a
                  key={to}
                  href={to}
                  className="block border-b border-white/10 py-3 text-sm font-medium text-white/90 hover:text-[#ffad55]"
                  onClick={closeMobileMenu}
                >
                  {label}
                </a>
              ) : (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `block border-b border-white/10 py-3 text-sm font-medium ${
                      isActive ? "text-[#ffad55]" : "text-white/90"
                    }`
                  }
                  onClick={closeMobileMenu}
                >
                  {label}
                </NavLink>
              ),
            )}

            {user ? (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-white/10 py-3">
                  <ProfileMenu
                    user={user}
                    links={profileLinks}
                    onLogout={onLogout}
                    onNavigate={closeMobileMenu}
                    mobile
                  />
                  <NotificationMenu user={user} />
                </div>
              </>
            ) : (
              <div className="flex gap-3 pt-4">
                <NavLink
                  to="/masuk"
                  onClick={closeMobileMenu}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-white/45 px-4 text-sm font-medium text-white"
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
