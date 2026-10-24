import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatRupiah } from "../api";

export default function PemerintahDashboard() {
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("semua");

  useEffect(() => {
    Promise.all([api.stats(), api.listCampaigns({ sort: "priority" }), api.listSchools()])
      .then(([statsData, campaignsData, schoolsData]) => {
        setStats(statsData);
        setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
        setSchools(Array.isArray(schoolsData) ? schoolsData : []);
      })
      .catch((error) => setLoadError(error.message))
      .finally(() => setLoading(false));
  }, []);

  const schools3T = schools.filter((s) => s.is_3t);
  const filteredCampaigns = campaigns.filter((c) => {
    if (selectedFilter === "3t") return c.school?.is_3t || c.remoteness >= 4;
    if (selectedFilter === "verified") return c.status === "verified";
    return true;
  });

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] pb-16">
      {/* HEADER DASHBOARD PEMERINTAH */}
      <div className="bg-[#0f172a] text-white border-b border-slate-800">
        <div className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
                  🏛️ PORTAL PEMANTAUAN PENDIDIKAN
                </span>
                <span className="rounded bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30">
                  Data EducationBridge
                </span>
              </div>
              <h1 className="page-title mt-3 font-bold">
                Dashboard Evaluasi Pemerataan Pendidikan
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
                Pantau kebutuhan sekolah yang terdaftar di EducationBridge dan
                progres donasi terkonfirmasi. Data sekolah eksternal hanya
                ditampilkan jika tersedia di backend.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/kampanye"
                className="rounded-lg bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
              >
                📍 Peta Kebutuhan Daerah
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-5 pt-8 sm:px-8">
        {/* METRICS ROW */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sekolah Terdaftar
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900">
                {loading || loadError ? "—" : schools.length}
              </span>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Di EducationBridge
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Data sekolah yang tersedia di aplikasi
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sekolah Wilayah 3T Terdata
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-red-600">
                {loading || loadError ? "—" : schools3T.length}
              </span>
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                Perpres 63/2020
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Kategori Tertinggal, Terdepan, Terluar
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Dana Bantuan Tersalurkan
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-emerald-600">
                {stats && !loadError ? formatRupiah(stats.totalRaised) : "—"}
              </span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Aktif
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Total dari data transaksi kampanye
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Siswa Penerima Manfaat
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900">
                {stats && !loadError ? stats.totalStudents : "—"}
              </span>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Jiwa
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Terdampak program bantuan
            </p>
          </div>
        </div>

        {/* Monitoring scope */}
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50/70 p-5">
          <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                🏛️
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-950">
                  Informasi pemantauan
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-blue-900">
                  Halaman ini menyajikan kebutuhan dan progres donasi yang
                  tersedia di EducationBridge. Alokasi APBD dan verifikasi
                  lapangan belum dikelola melalui aplikasi ini.
                </p>
              </div>
          </div>
        </div>

        {/* MONITORING TABLE SECTION */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Peta Monitoring Kebutuhan Sekolah Daerah
              </h2>
              <p className="text-xs text-slate-500">
                Daftar kebutuhan sekolah terverifikasi yang tersedia di aplikasi
              </p>
            </div>
            <div className="flex gap-2">
              {[
                { id: "semua", label: "Semua Kebutuhan" },
                { id: "3t", label: "Fokus Wilayah 3T" },
                { id: "verified", label: "Terverifikasi" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    selectedFilter === f.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Memuat data pengawasan pemerintah...
            </div>
          ) : loadError ? (
            <div className="p-8 text-center text-sm text-rose-700" role="alert">
              Data pemantauan gagal dimuat: {loadError}
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Belum ada kebutuhan sekolah yang tersedia untuk filter ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">NPSN & Sekolah</th>
                    <th className="px-6 py-3.5">Wilayah Administrasi</th>
                    <th className="px-6 py-3.5">Status 3T</th>
                    <th className="px-6 py-3.5">Kategori & Judul Kebutuhan</th>
                    <th className="px-6 py-3.5 text-center">Priority Score</th>
                    <th className="px-6 py-3.5 text-right">Progres Dana</th>
                    <th className="px-6 py-3.5 text-center">Aksi Monitoring</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredCampaigns.map((c) => {
                    const school = c.school;
                    const is3t = school?.is_3t || c.remoteness >= 4;
                    const progress =
                      c.progress_percent ??
                      (c.target_amount > 0
                        ? Math.round((c.raised_amount / c.target_amount) * 100)
                        : 0);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-slate-900 block">
                            NPSN: {school?.npsn || "—"}
                          </span>
                          <span className="text-slate-700 font-semibold text-xs mt-0.5 block">
                            {school?.name || c.school_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {school
                            ? `${school.kecamatan}, ${school.kabupaten_kota}, ${school.provinsi}`
                            : c.location}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                              is3t
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {is3t                             ? "Wilayah 3T" : "Reguler"}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <span className="font-bold text-blue-700 uppercase tracking-wide text-[10px] block">
                            {c.category}
                          </span>
                          <span className="text-slate-900 font-semibold line-clamp-1">
                            {c.title}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 font-bold text-white text-[11px] ${
                              c.priority_score >= 80
                                ? "bg-red-600"
                                : "bg-amber-600"
                            }`}
                          >
                            {c.priority_score}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-slate-900 block">
                            {formatRupiah(c.raised_amount)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {progress}% dari {formatRupiah(c.target_amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link
                            to={`/kampanye/${c.id}`}
                            className="inline-block rounded bg-blue-50 px-3 py-1.5 font-bold text-blue-700 hover:bg-blue-100 transition"
                          >
                            Tinjau Data →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
