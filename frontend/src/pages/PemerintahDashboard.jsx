import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatRupiah } from "../api";

const fallbackSchools = [
  {
    npsn: "60301416",
    name: "SD NEGERI 1 WAMENA",
    provinsi: "Papua Pegunungan",
    kabupaten_kota: "Kab. Jayawijaya",
    kecamatan: "Wamena",
    is_3t: true,
  },
  {
    npsn: "60200843",
    name: "SMP NEGERI 1 KEPULAUAN SULA",
    provinsi: "Maluku Utara",
    kabupaten_kota: "Kab. Kepulauan Sula",
    kecamatan: "Sanana",
    is_3t: true,
  },
  {
    npsn: "20211543",
    name: "SD NEGERI CIKONENG 2",
    provinsi: "Jawa Barat",
    kabupaten_kota: "Kab. Ciamis",
    kecamatan: "Cikoneng",
    is_3t: false,
  },
  {
    npsn: "50300215",
    name: "SMAN 1 ALOR",
    provinsi: "Nusa Tenggara Timur",
    kabupaten_kota: "Kab. Alor",
    kecamatan: "Teluk Mutiara",
    is_3t: true,
  },
  {
    npsn: "10645210",
    name: "SD NEGERI SUKA MAKMUR",
    provinsi: "Sumatera Selatan",
    kabupaten_kota: "Kab. Musi Rawas Utara",
    kecamatan: "Rupit",
    is_3t: true,
  },
  {
    npsn: "50300189",
    name: "SMK NEGERI 2 KUPANG",
    provinsi: "Nusa Tenggara Timur",
    kabupaten_kota: "Kota Kupang",
    kecamatan: "Oebobo",
    is_3t: false,
  },
  {
    npsn: "60302194",
    name: "SD NEGERI 1 AGATS",
    provinsi: "Papua Selatan",
    kabupaten_kota: "Kab. Asmat",
    kecamatan: "Agats",
    is_3t: true,
  },
  {
    npsn: "10208123",
    name: "SMP NEGERI 1 NIAS BARAT",
    provinsi: "Sumatera Utara",
    kabupaten_kota: "Kab. Nias Barat",
    kecamatan: "Lahomi",
    is_3t: true,
  },
  {
    npsn: "30401822",
    name: "SD NEGERI 01 KRAYAN",
    provinsi: "Kalimantan Utara",
    kabupaten_kota: "Kab. Nunukan",
    kecamatan: "Krayan",
    is_3t: true,
  },
];

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
  {
    id: 4,
    title: "Pemasangan Akses Internet Satelit untuk Pembelajaran Digital",
    school_name: "SD NEGERI SUKA MAKMUR",
    location: "Rupit, Kab. Musi Rawas Utara, Sumatera Selatan",
    category: "Teknologi",
    priority_score: 85,
    status: "verified",
    raised_amount: 3000000,
    target_amount: 25000000,
    student_count: 115,
    school: {
      npsn: "10645210",
      name: "SD NEGERI SUKA MAKMUR",
      kecamatan: "Rupit",
      kabupaten_kota: "Kab. Musi Rawas Utara",
      provinsi: "Sumatera Selatan",
      is_3t: true,
    },
  },
];

export default function PemerintahDashboard() {
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState(fallbackCampaigns);
  const [schools, setSchools] = useState(fallbackSchools);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("semua");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.stats().catch(() => null),
      api.listCampaigns({ sort: "priority" }).catch(() => []),
      api.listSchools().catch(() => []),
    ]).then(([statsData, campaignsData, schoolsData]) => {
      if (statsData) setStats(statsData);
      if (Array.isArray(campaignsData) && campaignsData.length > 0)
        setCampaigns(campaignsData);
      if (Array.isArray(schoolsData) && schoolsData.length > 0)
        setSchools(schoolsData);
      setLoading(false);
    });
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
                  🏛️ PORTAL MONITORING PEMERINTAH & MITRA
                </span>
                <span className="rounded bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30">
                  Terintegrasi Kemendikdasmen
                </span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Dashboard Evaluasi Pemerataan Pendidikan
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
                Platform pengawasan alokasi bantuan sekolah, pemantauan wilayah
                3T, dan verifikasi akuntabilitas program pendidikan daerah
                berbasis Data Induk Kemendikdasmen.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  alert(
                    "Laporan Monitoring & Evaluasi Daerah berhasil di-generate!",
                  )
                }
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-500 transition"
              >
                📄 Cetak Laporan Monev Daerah
              </button>
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
              Total Sekolah Data Induk
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900">
                {schools.length}
              </span>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                NPSN Resmi
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              100% Terdaftar di Kemendikdasmen
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sekolah Wilayah 3T Terdata
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-red-600">
                {schools3T.length}
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
                {formatRupiah(
                  stats?.totalRaised ||
                    campaigns.reduce(
                      (acc, c) => acc + (c.raised_amount || 0),
                      0,
                    ),
                )}
              </span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Aktif
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Transparansi publik terverifikasi
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Siswa Penerima Manfaat
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-slate-900">
                {stats?.totalStudents ||
                  campaigns.reduce((acc, c) => acc + (c.student_count || 0), 0)}
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

        {/* INTEGRATION NOTICE WITH ACTION BUTTONS */}
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-4 max-w-3xl">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                🏛️
              </div>
              <div>
                <h3 className="text-sm font-bold text-blue-950">
                  Wewenang & Aksi Pemerintah / Dinas Pendidikan Daerah
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-blue-900">
                  Pemerintah tidak hanya memantau, namun berperan aktif
                  mengalokasikan{" "}
                  <strong>Dana Pendampingan APBD (Matching Grant)</strong>,
                  melakukan <strong>Verifikasi Validitas Sarpras 3T</strong>,
                  serta mengesahkan rekomendasi perbaikan fasilitas sekolah.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  alert(
                    "Komitmen Alokasi Dana Pendampingan APBD (Matching Grant 50%) berhasil dicatat!",
                  )
                }
                className="rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-amber-500 transition"
              >
                💰 Alokasikan Matching Grant APBD
              </button>
              <button
                onClick={() =>
                  alert(
                    "Status Verifikasi Lapangan Sarpras Dinas Pendidikan disahkan!",
                  )
                }
                className="rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-blue-600 transition"
              >
                ✅ Pengesahan Sarpras Dinas
              </button>
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
                Daftar kampanye bantuan sekolah terdaftar dalam Data Induk
                Kemendikdasmen
              </p>
            </div>
            <div className="flex gap-2">
              {[
                { id: "semua", label: "Semua Kebutuhan" },
                { id: "3t", label: "Fokus Wilayah 3T" },
                { id: "verified", label: "Terverifikasi Official" },
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
                      c.progress_percent ||
                      Math.round((c.raised_amount / c.target_amount) * 100);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-slate-900 block">
                            NPSN: {school?.npsn || "Official"}
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
                            {is3t ? "Wilayah 3T Official" : "Reguler"}
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
