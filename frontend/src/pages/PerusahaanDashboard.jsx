import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatRupiah } from "../api";
import { useAuth } from "../context/AuthContext";
import WelcomeOverlay from "../components/WelcomeOverlay";

const fallbackCampaigns = [
  {
    id: 1,
    title: "Perbaikan Atap dan Lantai Kelas yang Bocor",
    school_name: "SD NEGERI 1 WAMENA",
    location: "Wamena, Kab. Jayawijaya, Papua Pegunungan",
    category: "Fasilitas",
    priority_score: 87,
    status: "verified",
    raised_amount: 12500000,
    target_amount: 45000000,
    student_count: 342,
    school: {
      npsn: "60301416",
      name: "SD NEGERI 1 WAMENA",
      kecamatan: "Wamena",
      kabupaten_kota: "Kab. Jayawijaya",
      provinsi: "Papua Pegunungan",
      is_3t: true,
    },
  },
  {
    id: 2,
    title: "Pengadaan Laptop dan Akses Internet untuk Ujian Online (ANBK)",
    school_name: "SMP NEGERI 1 KEPULAUAN SULA",
    location: "Sanana, Kab. Kepulauan Sula, Maluku Utara",
    category: "Teknologi",
    priority_score: 82,
    status: "verified",
    raised_amount: 22000000,
    target_amount: 60000000,
    student_count: 285,
    school: {
      npsn: "60200843",
      name: "SMP NEGERI 1 KEPULAUAN SULA",
      kecamatan: "Sanana",
      kabupaten_kota: "Kab. Kepulauan Sula",
      provinsi: "Maluku Utara",
      is_3t: true,
    },
  },
  {
    id: 3,
    title: "Pengadaan Buku Bacaan Perpustakaan Anak",
    school_name: "SD NEGERI CIKONENG 2",
    location: "Cikoneng, Kab. Ciamis, Jawa Barat",
    category: "Buku & Literasi",
    priority_score: 64,
    status: "verified",
    raised_amount: 15000000,
    target_amount: 15000000,
    student_count: 174,
    school: {
      npsn: "20211543",
      name: "SD NEGERI CIKONENG 2",
      kecamatan: "Cikoneng",
      kabupaten_kota: "Kab. Ciamis",
      provinsi: "Jawa Barat",
      is_3t: false,
    },
  },
];

export default function PerusahaanDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState(fallbackCampaigns);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.stats().catch(() => null),
      api.listCampaigns({ sort: "priority" }).catch(() => []),
    ]).then(([statsData, campaignsData]) => {
      if (statsData) setStats(statsData);
      if (Array.isArray(campaignsData) && campaignsData.length > 0)
        setCampaigns(campaignsData);
      setLoading(false);
    });
  }, []);

  const verifiedCampaigns = campaigns.filter((c) => c.status === "verified");

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] pb-16">
      <WelcomeOverlay
        roleKey="perusahaan"
        roleBadge="🏢 Portal CSR Perusahaan"
        title={`Selamat Datang, ${user?.organization_name || user?.name || "Mitra CSR"}`}
        subtitle="Platform Penyaluran Tanggung Jawab Sosial & Keberlanjutan Lingkungan (ESG) Terukur"
        features={[
          "Penyaluran CSR Tepat Sasaran ke Sekolah Terverifikasi Kemendikdasmen",
          "Program Adopsi Fasilitas Sekolah Berbasis Wilayah 3T",
          "Penerbitan Sertifikat Kemitraan & Ringkasan Laporan Dampak ESG",
          "Klaim Fasilitas Tax Deductible (Potongan Pajak Kemitraan Sosial)",
        ]}
      />

      {/* HEADER DASHBOARD CSR PERUSAHAAN */}
      <div className="bg-[#0f172a] text-white border-b border-slate-800">
        <div className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  🏢 PORTAL CSR & KEMITRAAN PERUSAHAAN
                </span>
                <span className="rounded bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30">
                  Laporan Dampak ESG
                </span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Dashboard Penyaluran CSR Perusahaan
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
                Kelola program Tanggung Jawab Sosial dan Lingkungan (TJSL/CSR)
                perusahaan Anda. Salurkan dana CSR secara terukur ke sekolah
                terdaftar resmi di wilayah 3T dan dapatkan laporan akuntabilitas
                ESG.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  alert(
                    "Sertifikat & Ringkasan Laporan Dampak CSR berhasil di-download!",
                  )
                }
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition"
              >
                📜 Unduh Sertifikat & Laporan ESG
              </button>
              <Link
                to="/cocok"
                className="rounded-lg bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
              >
                🤝 Cari Program Adopsi Sekolah
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-5 pt-8 sm:px-8">
        {/* COMPANY PROFILE BADGE */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Entitas Perusahaan Terdaftar
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              {user?.organization_name ||
                user?.name ||
                "PT Teknologi Nusantara"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Mitra CSR Resmi EducationBridge · ID Kemitraan: CSR-
              {user?.id || 1029}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold">
              ✓ Status Kemitraan Aktif
            </span>
            <span className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-bold">
              Status Tax Deductible Valid
            </span>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Dana CSR Tersalurkan
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-emerald-600">
                {formatRupiah(stats?.totalRaised || 125000000)}
              </span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                CSR Valid
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Tercatat dalam laporan keberlanjutan
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sekolah Mitra Binaan
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900">
                {stats?.verifiedCampaigns || 6} Sekolah
              </span>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Adopsi
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Menerima alokasi dana CSR
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Siswa Penerima Bantuan
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900">
                {stats?.totalStudents || 1250}
              </span>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Siswa
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Dukungan sarana & beasiswa
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Score Kontribusi ESG
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-amber-600">
                94 / 100
              </span>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                Sangat Baik
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Indikator Social Impact
            </p>
          </div>
        </div>

        {/* CAMPAIGN SPONSORSHIP TABLE */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Program Adopsi & Penyaluran CSR Sekolah
              </h2>
              <p className="text-xs text-slate-500">
                Daftar kebutuhan sekolah terverifikasi resmi yang dapat didukung
                penuh oleh perusahaan
              </p>
            </div>
            <Link
              to="/cocok"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition"
            >
              + Salurkan Dana CSR Baru
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Memuat program CSR perusahaan...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Sekolah & NPSN</th>
                    <th className="px-6 py-3.5">Lokasi & Status 3T</th>
                    <th className="px-6 py-3.5">Kategori CSR</th>
                    <th className="px-6 py-3.5">Judul Program</th>
                    <th className="px-6 py-3.5 text-right">
                      Target & Terkumpul
                    </th>
                    <th className="px-6 py-3.5 text-center">
                      Aksi Penyaluran CSR
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {verifiedCampaigns.map((c) => {
                    const school = c.school;
                    const progress =
                      c.progress_percent ||
                      Math.round((c.raised_amount / c.target_amount) * 100);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block text-sm">
                            {school?.name || c.school_name}
                          </span>
                          <span className="font-mono text-slate-500 text-[11px] block mt-0.5">
                            NPSN: {school?.npsn || "Official"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="block text-slate-700">
                            {school
                              ? `${school.kecamatan}, ${school.kabupaten_kota}`
                              : c.location}
                          </span>
                          <span
                            className={`inline-block mt-1 text-[10px] font-bold rounded px-2 py-0.5 ${school?.is_3t ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}
                          >
                            {school?.is_3t ? "Wilayah 3T Official" : "Reguler"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            {c.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs font-semibold text-slate-900">
                          {c.title}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-emerald-700 block">
                            {formatRupiah(c.raised_amount)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {progress}% dari {formatRupiah(c.target_amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link
                            to={`/kampanye/${c.id}`}
                            className="inline-block rounded bg-emerald-600 px-3.5 py-1.5 font-bold text-white shadow hover:bg-emerald-500 transition"
                          >
                            Salurkan CSR →
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
