import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "text-[#1a2d4d]" : "text-[#4c5a73] hover:text-[#1a2d4d]"
  }`;

const roleLabel = {
  admin: "Admin",
  sekolah: "Sekolah",
  individu: "Individu",
  perusahaan: "Perusahaan",
  pemerintah: "Pemerintah",
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
      <div className="flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-12 xl:px-16">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1a2d4d] text-xs font-bold tracking-tight text-white">
            EB
          </div>
          <span className="font-display text-[1.55rem] leading-none text-[#1d273a]">
            EducationBridge
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink to="/" className={linkClass}>
            Beranda
          </NavLink>
          <NavLink to="/kampanye" className={linkClass}>
            Jelajahi Kebutuhan
          </NavLink>
          {(!user || user.role === "sekolah") && (
            <NavLink to="/ajukan" className={linkClass}>
              Ajukan Kebutuhan
            </NavLink>
          )}
          {(!user ||
            ["individu", "perusahaan", "pemerintah"].includes(user.role)) && (
            <NavLink to="/cocok" className={linkClass}>
              Rekomendasi
            </NavLink>
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a2d4d] text-sm font-semibold text-white">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-[#1d273a]">
                  {user.name}
                </div>
                <div className="text-[11px] text-[#5c6b82]">
                  {roleLabel[user.role] || "Donatur"}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="ml-1 text-sm text-[#1a2d4d] hover:text-[#32518f]"
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
