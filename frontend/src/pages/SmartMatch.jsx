import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatRupiah } from "../api";
import schoolImage from "../assets/sekolah1.jpeg";

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

const fallbackResults = [
  {
    id: 1,
    title: "Perbaikan Atap dan Lantai Kelas yang Bocor",
    school_name: "SDN 03 Wamena Tengah",
    location: "Wamena, Papua Pegunungan",
    category: "Infrastruktur",
    priority_score: 87,
    priority_label: "Sangat Prioritas",
    raised_amount: 14550000,
    target_amount: 45000000,
    progress_percent: 32,
    end_date: "2026-10-31",
    image: schoolImage,
  },
  {
    id: 2,
    title: "Pengadaan Laptop dan Akses Internet",
    school_name: "SMPN 1 Kepulauan Sula",
    location: "Sanana, Maluku Utara",
    category: "Teknologi",
    priority_score: 82,
    priority_label: "Sangat Prioritas",
    raised_amount: 22000000,
    target_amount: 60000000,
    progress_percent: 37,
    end_date: "2026-11-15",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 3,
    title: "Pengadaan Buku Bacaan Perpustakaan",
    school_name: "SDN Cikoneng 2",
    location: "Ciamis, Jawa Barat",
    category: "Buku & Literasi",
    priority_score: 64,
    priority_label: "Prioritas Tinggi",
    raised_amount: 15000000,
    target_amount: 15000000,
    progress_percent: 100,
    end_date: "2026-10-20",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=700&q=80",
  },
];

function daysLeft(value) {
  if (!value) return "-";
  const days = Math.ceil((new Date(value) - new Date()) / 86400000);
  return days > 0 ? `${days} hari lagi` : "Berakhir";
}

function ResultRow({ campaign, index }) {
  const progress =
    campaign.progress_percent ??
    (campaign.target_amount
      ? Math.round((campaign.raised_amount / campaign.target_amount) * 100)
      : 0);
  return (
    <Link
      to={`/kampanye/${campaign.id || index + 1}`}
      className="group grid gap-4 border-b border-[#e1e5ea] py-5 transition hover:bg-[#f8fbfe] sm:grid-cols-[220px_1fr] sm:px-2"
    >
      <div className="relative h-[128px] w-full overflow-hidden rounded-[8px] sm:h-[132px]">
        <img
          src={campaign.image || schoolImage}
          alt={campaign.title}
          className="!block !h-full !max-h-full !w-full !max-w-full object-cover"
          style={{ height: "132px", width: "100%" }}
        />
        <span className="absolute left-0 top-0 rounded-br-[8px] bg-[#d9f3fb] px-3 py-1.5 text-sm font-bold text-[#087fae]">
          {daysLeft(campaign.end_date)}
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#667085]">
          <span className="font-semibold text-[#526a83]">
            {campaign.school_name}
          </span>
          <span>•</span>
          <span>✓ Terverifikasi</span>
        </div>
        <h3 className="mt-2 text-lg font-bold leading-6 text-[#344054] group-hover:text-[#1769aa]">
          {campaign.title}
        </h3>
        <p className="mt-1 text-xs text-[#718096]">{campaign.location}</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e6e8eb]">
          <div
            className="h-full bg-[#18a9df]"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[#667085]">
            Terkumpul{" "}
            <strong className="ml-1 text-base text-[#087fae]">
              {formatRupiah(campaign.raised_amount)}
            </strong>
          </span>
          <span className="font-semibold text-[#53677f]">
            {progress}% dari {formatRupiah(campaign.target_amount)}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`text-xs font-bold ${campaign.priority_score >= 80 ? "text-[#d84747]" : "text-[#bd7a17]"}`}
          >
            Priority Score {campaign.priority_score}
          </span>
          <span className="text-xs font-bold text-[#1769aa]">
            Lihat kebutuhan →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function SmartMatch() {
  const [selected, setSelected] = useState("3t");
  const [results, setResults] = useState(fallbackResults);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .match([selected])
      .then((rows) => {
        if (Array.isArray(rows) && rows.length)
          setResults(
            rows.map((row, index) => ({
              ...fallbackResults[index % fallbackResults.length],
              ...row,
              image:
                row.image_url ||
                fallbackResults[index % fallbackResults.length].image,
            })),
          );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <main className="min-h-screen bg-[#fbfbfa] text-[#344054]">
      <div className="mx-auto max-w-[980px] px-5 py-10 sm:px-8 lg:py-14">
        <div className="border-b border-[#e3e6e9] pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718096]">
            EducationBridge
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl text-[#17365d] sm:text-4xl">
            Pilih Kebutuhan yang Ingin Anda Dukung
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#687b90]">
            Pilih bidang pendidikan atau wilayah yang ingin Anda bantu. Kami
            menampilkan kebutuhan sekolah yang paling relevan.
          </p>
        </div>
        <section className="py-8">
          <h2 className="text-xl font-bold text-[#344054]">
            Pilih kategori favoritmu
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
                Rekomendasi kebutuhan
              </p>
              <h2 className="mt-2 text-xl font-bold text-[#344054]">
                Kebutuhan yang mungkin sesuai untuk Anda
              </h2>
            </div>
            <span className="hidden text-xs text-[#718096] sm:block">
              {results.length} kebutuhan
            </span>
          </div>
          {loading && (
            <p className="py-8 text-sm text-[#718096]">Memuat kebutuhan...</p>
          )}
          {!loading && results.length === 0 && (
            <p className="py-8 text-sm text-[#718096]">
              Belum ada kebutuhan untuk kategori ini.
            </p>
          )}
          {!loading &&
            results.map((campaign, index) => (
              <ResultRow
                key={campaign.id || campaign.title}
                campaign={campaign}
                index={index}
              />
            ))}
          <button
            type="button"
            className="mx-auto mt-7 block rounded-full bg-[#e4f5fc] px-7 py-3 text-sm font-semibold text-[#1688bd]"
          >
            Lihat semua kebutuhan <span className="ml-2">→</span>
          </button>
        </section>
      </div>
    </main>
  );
}
