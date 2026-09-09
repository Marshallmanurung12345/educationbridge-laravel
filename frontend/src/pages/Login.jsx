import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
      const redirectTo = location.state?.from || defaultRouteForRole(user.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-[1180px] gap-6 px-4 py-8 lg:grid-cols-[1fr_0.85fr] lg:py-14">
      <div className="relative hidden min-h-[600px] overflow-hidden rounded-[30px] bg-[#1a2d4d] lg:block">
        <img
          src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=85"
          alt="Siswa belajar di kelas"
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-[#132641]/65" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Link to="/" className="font-display text-2xl">
            EducationBridge
          </Link>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3c36b]">
              Satu langkah berarti
            </p>
            <h2 className="max-w-md font-display text-5xl leading-[0.98]">
              Mari buka lebih banyak pintu pendidikan.
            </h2>
            <p className="mt-5 max-w-md leading-7 text-[#e7edf7]">
              Terhubung dengan sekolah dan mitra yang sedang membangun masa
              depan anak-anak Indonesia.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center rounded-[30px] border border-[#e0e3e8] bg-white p-6 shadow-[0_20px_50px_rgba(17,24,39,0.07)] sm:p-10">
        <div className="w-full">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c47d20]">
            Selamat datang kembali
          </p>
          <h1 className="mt-3 font-display text-4xl text-[#1d273a]">
            Masuk ke akun Anda
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#667085]">
            Gunakan akun Anda untuk mengikuti campaign dan melihat dampak
            kontribusi.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-[#344054]">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-2 rounded-xl"
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#344054]">
                Kata sandi
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input mt-2 rounded-xl"
                placeholder="Masukkan kata sandi"
              />
            </div>
            {error && (
              <p className="rounded-xl bg-[#fff1ef] px-4 py-3 text-sm text-[#c24135]">
                {error}
              </p>
            )}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-[#1a2d4d] py-3 text-sm font-semibold text-white transition hover:bg-[#263f69] disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#667085]">
            Belum punya akun?{" "}
            <Link
              to="/daftar"
              className="font-semibold text-[#1a2d4d] underline underline-offset-4"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function defaultRouteForRole(role) {
  if (role === "admin") return "/admin";
  if (role === "sekolah") return "/ajukan";
  return "/kampanye";
}
