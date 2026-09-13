import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { defaultRouteForRole } from "./Login";

const donorSubRoles = [
  { value: "individu", label: "Individu", hint: "Donatur Perseorangan" },
  {
    value: "perusahaan",
    label: "Perusahaan",
    hint: "Penyalur CSR / Instansi Swasta",
  },
  {
    value: "pemerintah",
    label: "Pemerintah / Mitra",
    hint: "Dinas Pendidikan / Instansi Pemerintah",
  },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [mainCategory, setMainCategory] = useState("donatur"); // 'sekolah' | 'donatur'
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "individu", // default donor type
    organization_name: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleMainCategoryChange(cat) {
    setMainCategory(cat);
    if (cat === "sekolah") {
      setForm((f) => ({ ...f, role: "sekolah" }));
    } else {
      setForm((f) => ({ ...f, role: "individu" }));
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
      const user = await register(form);
      navigate(defaultRouteForRole(user.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const needsOrg = form.role !== "individu";

  return (
    <div className="mx-auto grid max-w-[1180px] gap-6 px-4 py-8 lg:grid-cols-[0.85fr_1fr] lg:py-14">
      <div className="order-2 rounded-[30px] border border-[#e0e3e8] bg-white p-6 shadow-[0_20px_50px_rgba(17,24,39,0.07)] sm:p-10 lg:order-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c47d20]">
          Mulai berkontribusi
        </p>
        <h1 className="mt-3 font-display text-4xl text-[#1d273a]">
          Buat akun baru
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#667085]">
          Pilih peran Anda di EducationBridge dan mulai terhubung dengan
          kebutuhan pendidikan.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleMainCategoryChange("sekolah")}
            className={`rounded-xl border p-4 text-left transition ${mainCategory === "sekolah" ? "border-[#1a2d4d] bg-[#eef3fb] ring-2 ring-[#1a2d4d]" : "border-[#e0e3e8] bg-[#fafbfc] hover:border-[#9aa7ba]"}`}
          >
            <span className="block text-sm font-bold text-[#1d273a]">
              Sekolah
            </span>
            <span className="mt-1 block text-xs leading-5 text-[#667085]">
              Mengajukan kebutuhan bantuan
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleMainCategoryChange("donatur")}
            className={`rounded-xl border p-4 text-left transition ${mainCategory === "donatur" ? "border-[#1a2d4d] bg-[#eef3fb] ring-2 ring-[#1a2d4d]" : "border-[#e0e3e8] bg-[#fafbfc] hover:border-[#9aa7ba]"}`}
          >
            <span className="block text-sm font-bold text-[#1d273a]">
              Donatur / Mitra
            </span>
            <span className="mt-1 block text-xs leading-5 text-[#667085]">
              Ingin membantu / menyalurkan bantuan
            </span>
          </button>
        </div>

        {mainCategory === "donatur" && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-3.5">
            <label className="block text-xs font-bold text-[#1a2d4d] uppercase tracking-wider">
              Pilih Tipe Donatur / Mitra:
            </label>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#c3d1e6] bg-white px-3 py-2 text-sm font-semibold text-[#1d273a] focus:outline-none focus:ring-2 focus:ring-[#1a2d4d]"
            >
              {donorSubRoles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} — {r.hint}
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-7 space-y-5">
          <div>
            <label className="text-sm font-medium text-[#344054]">
              Nama lengkap
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="input mt-2 rounded-xl"
              placeholder="Nama Anda"
            />
          </div>
          {needsOrg && (
            <div>
              <label className="text-sm font-medium text-[#344054]">
                {form.role === "sekolah"
                  ? "Nama sekolah"
                  : "Nama perusahaan / instansi"}
              </label>
              <input
                value={form.organization_name}
                onChange={(e) => update("organization_name", e.target.value)}
                className="input mt-2 rounded-xl"
                placeholder="Nama organisasi"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-[#344054]">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
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
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="input mt-2 rounded-xl"
              placeholder="Minimal 6 karakter"
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
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[#667085]">
          Sudah punya akun?{" "}
          <Link
            to="/masuk"
            className="font-semibold text-[#1a2d4d] underline underline-offset-4"
          >
            Masuk di sini
          </Link>
        </p>
      </div>

      <div className="relative order-1 min-h-[360px] overflow-hidden rounded-[30px] bg-[#1a2d4d] lg:order-2 lg:min-h-[680px]">
        <img
          src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=85"
          alt="Buku dan perlengkapan belajar"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-[#132641]/65" />
        <div className="relative flex h-full flex-col justify-between p-8 text-white sm:p-10">
          <Link to="/" className="font-display text-2xl">
            EducationBridge
          </Link>
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#f3c36b]">
              Pendidikan untuk semua
            </p>
            <h2 className="max-w-md font-display text-5xl leading-[0.98]">
              Setiap peran punya dampak.
            </h2>
            <p className="mt-5 max-w-md leading-7 text-[#e7edf7]">
              Bergabunglah sebagai sekolah, individu, perusahaan, atau mitra
              pemerintah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
