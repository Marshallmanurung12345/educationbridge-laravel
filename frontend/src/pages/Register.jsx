import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/LoadingIndicator";
import logo from "../assets/logo.jpeg";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [mainCategory, setMainCategory] = useState("donatur"); // 'sekolah' | 'donatur'
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "individu",
    organization_name: "",
    npsn: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleMainCategoryChange(cat) {
    setMainCategory(cat);
    if (cat === "sekolah") {
      setForm((f) => ({
        ...f,
        role: "sekolah",
        organization_name: "",
        npsn: "",
      }));
    } else {
      setForm((f) => ({
        ...f,
        role: "individu",
        organization_name: "",
      }));
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/masuk", {
        replace: true,
        state: { registered: true },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isSchool = form.role === "sekolah";

  return (
    <div className="flex min-h-[calc(100svh-68px)] items-center justify-center bg-[#f8fafc] px-5 py-8">
      <section className="w-full max-w-[480px] rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_12px_32px_rgba(23,52,91,0.08)] sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link to="/" aria-label="EducationBridge - Beranda">
            <img
              src={logo}
              alt="EducationBridge"
              className="h-14 w-14 object-contain"
            />
          </Link>
          <h1 className="page-title mt-3 text-[#17345B]">Daftar</h1>
          <p className="mt-1.5 text-sm text-[#667085]">
            Buat akun EducationBridge.
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleMainCategoryChange("sekolah")}
            className={`rounded-lg border p-3 text-left transition ${
              mainCategory === "sekolah"
                ? "border-[#17345B] bg-[#f1f5f9] ring-1 ring-[#17345B]"
                : "border-[#e0e3e8] bg-white hover:border-[#9aa7ba]"
            }`}
          >
            <span className="block text-sm font-semibold text-[#17345B]">
              Sekolah
            </span>
            <span className="mt-1 block text-xs leading-4 text-[#667085]">
              Mengajukan kebutuhan bantuan
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleMainCategoryChange("donatur")}
            className={`rounded-lg border p-3 text-left transition ${
              mainCategory === "donatur"
                ? "border-[#17345B] bg-[#f1f5f9] ring-1 ring-[#17345B]"
                : "border-[#e0e3e8] bg-white hover:border-[#9aa7ba]"
            }`}
          >
            <span className="block text-sm font-semibold text-[#17345B]">
              Donatur
            </span>
            <span className="mt-1 block text-xs leading-4 text-[#667085]">
              Ingin membantu / menyalurkan bantuan
            </span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#17345B]">
              {isSchool ? "Nama kepala sekolah / perwakilan" : "Nama lengkap / penanggung jawab"}
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="input mt-1.5 rounded-md border-[#d0d5dd] focus:border-[#17345B]"
              placeholder="Nama Anda"
            />
          </div>
          {isSchool && (
            <div>
              <label className="block text-sm font-medium text-[#17345B]">
                Nama sekolah
              </label>
              <input
                required={isSchool}
                value={form.organization_name}
                onChange={(e) => update("organization_name", e.target.value)}
                className="input mt-1.5 rounded-md border-[#d0d5dd] focus:border-[#17345B]"
                placeholder="Nama sekolah"
              />
            </div>
          )}
          {isSchool && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#17345B]">
                  NPSN
                </label>
                <input
                  required
                  inputMode="numeric"
                  maxLength={8}
                  pattern="[0-9]{8}"
                  value={form.npsn}
                  onChange={(e) => update("npsn", e.target.value.replace(/\D/g, ""))}
                  className="input mt-1.5 rounded-md border-[#d0d5dd] focus:border-[#17345B]"
                  placeholder="8 digit NPSN"
                />
                <p className="mt-1 text-xs text-[#667085]">
                  NPSN harus terdiri dari 8 angka. Sekolah tidak harus ada di daftar lokal; admin akan memeriksa data dan kewenangan sekolah.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#17345B]">
                  Nomor telepon
                </label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="input mt-1.5 rounded-md border-[#d0d5dd] focus:border-[#17345B]"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-[#17345B]">
              Email
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
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
              minLength={8}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="input mt-1.5 rounded-md border-[#d0d5dd] focus:border-[#17345B]"
              placeholder="Minimal 8 karakter"
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#F28C28] py-3 text-sm font-semibold text-white transition hover:bg-[#dc7616] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <><LoadingSpinner size="sm" /> Memproses...</> : "Daftar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#667085]">
          Sudah punya akun?{" "}
          <Link
            to="/masuk"
            className="font-semibold text-[#17345B] underline underline-offset-4"
          >
            Masuk
          </Link>
        </p>
      </section>
    </div>
  );
}
