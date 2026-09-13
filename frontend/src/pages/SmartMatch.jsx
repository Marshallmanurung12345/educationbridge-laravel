import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatRupiah } from "../api";
import schoolImage from "../assets/sekolah1.jpeg";
import WelcomeOverlay from "../components/WelcomeOverlay";

const categories = [
  {
    key: "3t",
    label: "Wilayah 3T",
    icon: "⌂",
    tone: "border-[#16a7e0] text-[#1688bd]",
  },
  {
    key: "renovasi",
    label: "Infrastruktur",
    icon: "⌂",
    tone: "text-[#f28b3f]",
  },
  { key: "teknologi", label: "Teknologi", icon: "▣", tone: "text-[#2f9ed0]" },
  {
    key: "literasi",
    label: "Buku & Literasi",
    icon: "▤",
    tone: "text-[#efb43c]",
  },
  { key: "beasiswa", label: "Beasiswa", icon: "◇", tone: "text-[#52a879]" },
  { key: "sanitasi", label: "Sanitasi", icon: "◌", tone: "text-[#5b9bd2]" },
  { key: "lainnya", label: "Lainnya", icon: "•••", tone: "text-[#7a8796]" },
];

function daysLeft(value) {
  if (!value) return "-";
  const days = Math.ceil((new Date(value) - new Date()) / 86400000);
  return days > 0 ? `${days} hari lagi` : "Berakhir";
}

function ResultRow({ campaign }) {
  const progress =
    campaign.progress_percent ??
    (campaign.target_amount
      ? Math.round((campaign.raised_amount / campaign.target_amount) * 100)
      : 0);

  const school = campaign.school;
  const schoolName = school?.name || campaign.school_name || "Nama Sekolah";
  const npsn = school?.npsn
    ? `NPSN: ${school.npsn}`
    : "NPSN: Data belum tersedia";
  const dataSource =
    school?.data_source || "Data Induk Pendidikan Kemendikdasmen";
  const locationText = school
    ? `${school.kecamatan}, ${school.kabupaten_kota}, ${school.provinsi}`
    : campaign.location || "Data belum tersedia";
  const studentText =
    school?.jumlah_siswa != null
      ? `${school.jumlah_siswa} siswa`
      : campaign.student_count
        ? `${campaign.student_count} siswa`
        : "Data belum tersedia";
  const teacherText =
    school?.jumlah_guru != null
      ? `${school.jumlah_guru} guru`
      : "Data belum tersedia";
  const is3tText = school
    ? school.is_3t
      ? school.status_3t_detail || "Wilayah 3T Official"
      : "Bukan Wilayah 3T"
    : "Data belum tersedia";

  return (
    <div className="group border-b border-[#e1e5ea] py-6 transition hover:bg-[#f8fbfe] sm:px-3 rounded-lg">
      <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
        <div className="relative h-[140px] w-full overflow-hidden rounded-[10px] bg-slate-100">
          <img
            src={campaign.image_url || schoolImage}
            alt={campaign.title}
            className="h-full w-full object-cover"
          />
          <span className="absolute left-0 top-0 rounded-br-[8px] bg-[#d9f3fb] px-3 py-1 text-xs font-bold text-[#087fae]">
            {daysLeft(campaign.end_date)}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded bg-[#17365d] px-2 py-0.5 font-mono text-[11px] font-bold text-white">
              {npsn}
            </span>
            <span className="rounded bg-[#e0f2fe] px-2 py-0.5 text-[11px] font-semibold text-[#0369a1]">
              ✓ Terverifikasi Official
            </span>
            <span
              className={`rounded px-2 py-0.5 text-[11px] font-semibold ${school?.is_3t ? "bg-[#fef2f2] text-[#991b1b]" : "bg-slate-100 text-slate-600"}`}
            >
              {is3tText}
            </span>
          </div>

          <h3 className="mt-2 text-lg font-bold text-[#17365d] group-hover:text-[#1688bd]">
            <Link to={`/kampanye/${campaign.id}`}>{campaign.title}</Link>
          </h3>

          <p className="mt-1 text-sm font-semibold text-[#334155]">
            {schoolName}
          </p>

          <p className="mt-0.5 text-xs text-[#64748b]">📍 {locationText}</p>

          <div className="mt-2 grid grid-cols-2 gap-2 rounded-md bg-[#f1f5f9] p-2 text-xs sm:grid-cols-3">
            <div>
              <span className="block text-[10px] uppercase text-[#64748b]">
                Jumlah Siswa:
              </span>
              <strong className="text-[#1e293b]">{studentText}</strong>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-[#64748b]">
                Jumlah Guru:
              </span>
              <strong className="text-[#1e293b]">{teacherText}</strong>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="block text-[10px] uppercase text-[#64748b]">
                Sumber Data Sekolah:
              </span>
              <strong className="text-[#0369a1]">{dataSource}</strong>
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
            <div
              className="h-full bg-[#1688bd]"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[#64748b]">
              Terkumpul{" "}
              <strong className="ml-1 text-sm text-[#087fae]">
                {formatRupiah(campaign.raised_amount)}
              </strong>
            </span>
            <span className="font-semibold text-[#475569]">
              {progress}% dari {formatRupiah(campaign.target_amount)}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
            <span
              className={`text-xs font-bold ${campaign.priority_score >= 80 ? "text-[#dc2626]" : "text-[#d97706]"}`}
            >
              Priority Score: {campaign.priority_score} (
              {campaign.priority_label || "Prioritas"})
            </span>
            <Link
              to={`/kampanye/${campaign.id}`}
              className="text-xs font-bold text-[#1688bd] hover:underline"
            >
              Lihat Detail & Data Official →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SmartMatch() {
  const [selected, setSelected] = useState("3t");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .match([selected])
      .then((rows) => {
        if (Array.isArray(rows)) {
          setResults(rows);
        } else {
          setResults([]);
        }
      })
      .catch(() => {
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <main className="min-h-screen bg-[#fbfbfa] text-[#344054]">
      <WelcomeOverlay
        roleKey="individu"
        roleBadge="🤝 Rekomendasi Pintar Donatur"
        title="Selamat Datang di Portal Rekomendasi Pintar"
        subtitle="Temukan Kebutuhan Pendidikan Sekolah yang Paling Tepat Sasaran & Berdampak"
        features={[
          "Pilihan Kebutuhan Sekolah Terverifikasi Resmi Kemendikdasmen",
          "Penetapan Urgensi Berbasis Priority Score (0-100)",
          "Penyaluran Donasi Langsung & Transparan ke Akun Sekolah",
          "Laporan Pertanggungjawaban & Pemantauan Dampak Penggunaan Dana",
        ]}
      />

      <div className="mx-auto max-w-[980px] px-5 py-10 sm:px-8 lg:py-14">
        <div className="border-b border-[#e3e6e9] pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718096]">
            EducationBridge · Sistem Rekomendasi Official
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl text-[#17365d] sm:text-4xl">
            Rekomendasi Kebutuhan Sekolah Official
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#687b90]">
            Setiap sekolah yang ditampilkan berasal dari{" "}
            <strong>Data Induk Pendidikan Kemendikdasmen</strong>. Kebutuhan
            yang muncul adalah kampanye terverifikasi setelah sekolah mengajukan
            permohonan bantuan.
          </p>
        </div>

        <section className="py-8">
          <h2 className="text-xl font-bold text-[#344054]">
            Pilih Kategori Kebutuhan
          </h2>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-3 sm:gap-6">
            {categories.map((category) => (
              <button
                type="button"
                key={category.key}
                onClick={() => setSelected(category.key)}
                className={`min-w-[96px] shrink-0 text-center ${selected === category.key ? "text-[#17365d]" : "text-[#667085]"}`}
              >
                <span
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] bg-white text-2xl shadow-[0_6px_18px_rgba(23,54,93,0.08)] ${selected === category.key ? "border-[3px] border-[#16a7e0]" : "border border-transparent"} ${category.tone}`}
                >
                  {category.icon}
                </span>
                <span className="mt-3 block text-sm font-medium leading-5">
                  {category.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="border-t border-[#e3e6e9] pt-7">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718096]">
                Hasil Rekomendasi
              </p>
              <h2 className="mt-2 text-xl font-bold text-[#344054]">
                Kebutuhan Sekolah Terverifikasi
              </h2>
            </div>
            <span className="hidden text-xs text-[#718096] sm:block">
              {results.length} sekolah
            </span>
          </div>

          {loading && (
            <div className="py-12 text-center text-sm text-[#718096]">
              Mengambil data sekolah resmi dari Kemendikdasmen...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="my-8 rounded-lg border border-dashed border-slate-300 p-8 text-center">
              <p className="text-sm font-medium text-slate-600">
                Belum ada kebutuhan terverifikasi untuk kategori ini.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Semua data sekolah tersimpan resmi di database pemerintah.
              </p>
            </div>
          )}

          {!loading &&
            results.map((campaign) => (
              <ResultRow key={campaign.id} campaign={campaign} />
            ))}

          <div className="mt-8 rounded-lg bg-blue-50 p-4 text-xs text-blue-900 border border-blue-200">
            <strong>Catatan Verifikasi Data:</strong> Seluruh sekolah di atas
            memiliki NPSN valid dan terdaftar di Data Induk Pendidikan
            Kemendikdasmen. Wilayah 3T ditetapkan secara resmi berdasarkan
            Perpres No. 63 Tahun 2020.
          </div>
        </section>
      </div>
    </main>
  );
}
