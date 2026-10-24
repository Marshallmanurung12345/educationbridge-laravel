import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      const redirectTo =
        user.role === "sekolah" || user.role === "admin" || user.role === "individu"
          ? defaultRouteForRole(user.role, user.account_status)
          : location.state?.from || defaultRouteForRole(user.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100svh-68px)] items-center justify-center bg-[#f8fafc] px-5 py-8">
      <section className="w-full max-w-[430px] rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_12px_32px_rgba(23,52,91,0.08)] sm:p-9">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link to="/" aria-label="EducationBridge - Beranda">
            <img
              src={logo}
              alt="EducationBridge"
              className="h-14 w-14 object-contain"
            />
          </Link>
          <h1 className="page-title mt-3 text-[#17345B]">Masuk</h1>
          <p className="mt-1.5 text-sm text-[#667085]">
            Selamat datang kembali.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#17345B]">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-1.5 rounded-md border-[#d0d5dd] focus:border-[#17345B]"
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#17345B]">
                Kata sandi
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input mt-1.5 rounded-md border-[#d0d5dd] focus:border-[#17345B]"
                placeholder="Masukkan kata sandi"
              />
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-md bg-[#fff1ef] px-4 py-3 text-sm text-[#c24135]"
              >
                {error}
              </p>
            )}
            <button
              disabled={loading}
              className="w-full rounded-md bg-[#F28C28] py-3 text-sm font-semibold text-white transition hover:bg-[#dc7616] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#667085]">
            Belum punya akun?{" "}
            <Link
              to="/daftar"
              className="font-semibold text-[#17345B] underline underline-offset-4"
            >
              Daftar
            </Link>
        </p>
      </section>
    </div>
  );
}

export function defaultRouteForRole(role, accountStatus = "verified") {
  if (role === "admin") return "/admin";
  if (role === "sekolah") return "/dashboard-sekolah";
  if (role === "individu") return "/dashboard-donatur";
  if (role === "pemerintah") return "/dashboard-pemerintah";
  if (role === "perusahaan") return "/dashboard-perusahaan";
  return accountStatus === "verified" ? "/kampanye" : "/status-verifikasi";
}
