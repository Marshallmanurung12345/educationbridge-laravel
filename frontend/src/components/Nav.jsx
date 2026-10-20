import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/useLanguage";
import logo from "../assets/logo.png";
import NotificationMenu from "./NotificationMenu";

const publicLinks = [
  ["home", "/"],
  ["needs", "/kampanye"],
  ["impact", "/#dampak"],
];

const roleLinks = {
  admin: [
    ["admin", "/admin"],
    ["schoolAccounts", "/admin/akun-sekolah"],
    ["auditLogs", "/admin/audit-log"],
  ],
  sekolah: [
    ["school", "/ajukan"],
    ["browse", "/kampanye"],
  ],
  individu: [
    ["donorDashboard", "/dashboard-donatur"],
    ["browse", "/kampanye"],
    ["recommendations", "/cocok"],
    ["fundraise", "/ajukan"],
  ],
  perusahaan: [
    ["csr", "/dashboard-perusahaan"],
    ["adoption", "/cocok"],
    ["browse", "/kampanye"],
    ["fundraise", "/ajukan"],
  ],
  pemerintah: [
    ["government", "/dashboard-pemerintah"],
    ["map", "/kampanye"],
    ["fundraise", "/ajukan"],
  ],
};

function LanguageSwitcher({ language, setLanguage, label }) {
  const [open, setOpen] = useState(false);
  const options = [
    { code: "id", flag: "🇮🇩", label: "Bahasa Indonesia" },
    { code: "en", flag: "🇬🇧", label: "English" },
  ];
  const selected = options.find((option) => option.code === language);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label={`${label}: ${selected.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex min-h-10 items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-2.5 text-base transition-colors hover:bg-white/15"
      >
        <span aria-hidden="true">{selected.flag}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className={`h-3 w-3 fill-current text-white transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m2 4 4 4 4-4z" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          aria-label={label}
          className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-[#e5eaf0] bg-white p-1.5 text-[#17345b] shadow-lg"
        >
          {options.map((option) => (
            <button
              key={option.code}
              type="button"
              role="menuitemradio"
              aria-checked={language === option.code}
              lang={option.code}
              onClick={() => {
                setLanguage(option.code);
                setOpen(false);
              }}
              className={`flex min-h-10 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-sm transition-colors ${
                language === option.code
                  ? "bg-[#f1f5f9] font-semibold text-[#17345b]"
                  : "text-[#42546b] hover:bg-[#f7f9fb]"
              }`}
            >
              <span aria-hidden="true" className="text-base">
                {option.flag}
              </span>
              {option.label}
              {language === option.code && (
                <span aria-hidden="true" className="ml-auto text-[#f28c28]">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Nav() {
  const { user, logout } = useAuth();
  const { language, setLanguage, translations } = useLanguage();
  const { nav } = translations;
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  const primaryLinks = isAdmin ? roleLinks.admin : publicLinks;
  const userRoleLinks =
    user?.role === "sekolah" && user.account_status !== "verified"
      ? [["schoolStatus", "/status-verifikasi"], ["browse", "/kampanye"]]
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

  function linkText(key) {
    return nav.links[key];
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#29496f] bg-[#17345b]">
      <div className="mx-auto flex min-h-[68px] w-full max-w-[1280px] items-center justify-between gap-3 px-4 sm:gap-4 sm:px-8 lg:px-10">
        <Link
          to={isAdmin ? "/admin" : "/"}
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
          <span className="font-display text-lg leading-none text-white sm:text-[1.4rem]">
            EducationBridge
          </span>
        </Link>

        <nav
          aria-label={nav.primaryNavigation}
          className="hidden items-center gap-1 lg:flex"
        >
          {primaryLinks.map(([key, to]) =>
            key === "impact" ? (
              <a
                key={key}
                href={to}
                className="border-b-2 border-transparent px-2.5 py-2 text-[13px] font-medium text-white/90 transition-colors hover:border-[#f28c28] hover:text-white"
              >
                {isAdmin ? linkText(key) : nav[key]}
              </a>
            ) : (
              <NavLink
                key={key}
                to={to}
                end={key === "home"}
                className={({ isActive }) =>
                  `border-b-2 px-2.5 py-2 text-[13px] font-medium transition-colors ${
                    isActive
                      ? "border-[#f28c28] text-white"
                      : "border-transparent text-white/90 hover:text-white"
                  }`
                }
              >
                {isAdmin ? linkText(key) : nav[key]}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <LanguageSwitcher
            language={language}
            setLanguage={setLanguage}
            label={nav.language}
          />
          {user ? (
            <>
              <NotificationMenu user={user} />
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/10">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                  <span className="max-w-32">
                    <span className="block truncate text-sm font-semibold text-white">
                      {user.name}
                    </span>
                    <span className="block text-[11px] text-white/70">
                      {nav.roles[user.role] || nav.roles.user}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-xs text-white/70">
                    ▾
                  </span>
                </summary>
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-[#e5eaf0] bg-white p-2 shadow-lg">
                  {profileLinks.map(([key, to]) => (
                    <Link
                      key={to}
                      to={to}
                      className="block rounded-md px-3 py-2 text-sm text-[#42546b] hover:bg-[#f5f7fa] hover:text-[#17345b]"
                    >
                      {linkText(key)}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={onLogout}
                    className="mt-1 block w-full border-t border-[#edf0f4] px-3 py-2 text-left text-sm font-medium text-[#a63c32] hover:bg-[#fff7f6]"
                  >
                    {nav.links.logout}
                  </button>
                </div>
              </details>
            </>
          ) : (
            <>
              <NavLink
                to="/masuk"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/45 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                {nav.login}
              </NavLink>
              <NavLink
                to="/daftar"
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#f28c28] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#dc7616]"
              >
                {nav.register}
              </NavLink>
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <LanguageSwitcher
            language={language}
            setLanguage={setLanguage}
            label={nav.language}
          />
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-2xl text-white hover:bg-white/10"
            aria-label={mobileMenuOpen ? nav.closeMenu : nav.openMenu}
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
          <nav
            aria-label={nav.mobileNavigation}
            className="mx-auto max-w-[1280px]"
          >
            {primaryLinks.map(([key, to]) =>
              key === "impact" ? (
                <a
                  key={key}
                  href={to}
                  className="block border-b border-white/10 py-3 text-sm font-medium text-white/90 hover:text-[#ffad55]"
                  onClick={closeMobileMenu}
                >
                  {nav[key]}
                </a>
              ) : (
                <NavLink
                  key={key}
                  to={to}
                  end={key === "home"}
                  className={({ isActive }) =>
                    `block border-b border-white/10 py-3 text-sm font-medium ${
                      isActive ? "text-[#ffad55]" : "text-white/90"
                    }`
                  }
                  onClick={closeMobileMenu}
                >
                  {nav[key]}
                </NavLink>
              ),
            )}

            {user ? (
              <>
                <div className="flex items-center justify-between gap-3 border-b border-white/10 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">
                      {user.name}
                    </span>
                    <span className="text-xs text-white/70">
                      {nav.roles[user.role] || nav.roles.user}
                    </span>
                  </span>
                  <NotificationMenu user={user} />
                </div>
                {profileLinks.map(([key, to]) => (
                  <NavLink
                    key={to}
                    to={to}
                    className="block border-b border-white/10 py-3 text-sm font-medium text-white/90"
                    onClick={closeMobileMenu}
                  >
                    {linkText(key)}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={onLogout}
                  className="mt-4 w-full py-2 text-left text-sm font-semibold text-[#ffadad]"
                >
                  {nav.links.logout}
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-4">
                <NavLink
                  to="/masuk"
                  onClick={closeMobileMenu}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-white/45 px-4 text-sm font-medium text-white"
                >
                  {nav.login}
                </NavLink>
                <NavLink
                  to="/daftar"
                  onClick={closeMobileMenu}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-[#f28c28] px-4 text-sm font-semibold text-white"
                >
                  {nav.register}
                </NavLink>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
