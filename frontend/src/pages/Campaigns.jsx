import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import CampaignRow from "../components/CampaignRow";

const categories = [
  "Semua",
  "Fasilitas",
  "Buku",
  "Teknologi",
  "Beasiswa",
  "Laboratorium",
];

const categoryFocus = {
  Fasilitas: ["renovasi", "infrastruktur", "fasilitas"],
  Buku: ["literasi", "buku"],
  Teknologi: ["teknologi", "internet"],
  Beasiswa: ["beasiswa"],
  Laboratorium: ["laboratorium"],
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [category, setCategory] = useState("Semua");
  const [sort, setSort] = useState(() =>
    new URLSearchParams(window.location.search).get("sort") || "priority",
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const categoryValue = category === "Buku" ? "Buku & Literasi" : category;
    const query = search.trim();
    const request =
      sort === "recommended"
        ? api.match(categoryFocus[category] || [])
        : api.listCampaigns({
            status: "verified",
            sort: sort === "urgency" ? "priority" : sort,
            ...(category !== "Semua" && { category: categoryValue }),
            ...(query && { q: query }),
          });

    request
      .then((result) => {
        if (!active) return;
        let rows = Array.isArray(result) ? result : [];
        if (sort === "recommended" && category !== "Semua") {
          rows = rows.filter((campaign) => campaign.category === categoryValue);
        }
        if (sort === "recommended" && query) {
          const normalizedQuery = query.toLowerCase();
          rows = rows.filter((campaign) =>
            [
              campaign.title,
              campaign.school?.name,
              campaign.school_name,
              campaign.location,
              campaign.category,
            ]
              .filter(Boolean)
              .some((value) => value.toLowerCase().includes(normalizedQuery)),
          );
        }
        if (sort === "urgency") {
          rows = [...rows].sort(
            (first, second) =>
              Number(second.urgency || 0) - Number(first.urgency || 0) ||
              Number(second.priority_score || 0) - Number(first.priority_score || 0),
          );
        }
        setCampaigns(rows);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category, search, sort, reloadKey]);

  return (
    <main className="min-h-screen min-w-0 bg-[#f7f8fa] text-[#344054]">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-[#dfe5eb] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a6b1c]">
              Pendidikan untuk semua
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight text-[#17345B]">
              Jelajahi Kebutuhan Sekolah
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b]">
              Temukan kebutuhan sekolah terverifikasi berdasarkan lokasi, kategori,
              dan tingkat prioritas.
            </p>
          </div>
          <Link
            to="/ajukan"
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-[#F28C28] px-4 text-sm font-semibold text-white hover:bg-[#DB7415]"
          >
            Ajukan Kebutuhan Sekolah
          </Link>
        </div>

        <div className="border-b border-[#dfe5eb] py-4">
          <label className="block">
            <span className="sr-only">Cari kebutuhan, nama sekolah, atau lokasi</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari kebutuhan, sekolah, atau lokasi"
              className="min-h-11 w-full rounded-lg border border-[#d5dce4] bg-white px-4 text-sm text-[#344054] placeholder:text-[#98a2b3] focus:border-[#17345B] focus:outline-none sm:max-w-md"
            />
          </label>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter kategori kebutuhan"
            >
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={`min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    category === item
                      ? "border-[#17345B] bg-[#17345B] text-white"
                      : "border-[#d5dce4] bg-white text-[#52606d] hover:border-[#17345B] hover:text-[#17345B]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="flex shrink-0 items-center gap-2 text-xs font-medium text-[#64748b]">
              Urutkan
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="min-h-10 min-w-0 rounded-lg border border-[#cbd3dc] bg-white px-3 text-sm text-[#34465d] focus:border-[#17345B] focus:outline-none"
              >
                <option value="priority">Priority Score</option>
                <option value="newest">Kebutuhan terbaru</option>
                <option value="urgency">Urgensi</option>
                <option value="recommended">Direkomendasikan</option>
                <option value="progress">Progress dana</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-1">
          {loading && (
            <p className="py-8 text-sm text-[#64748b]" role="status">
              Memuat kebutuhan sekolah…
            </p>
          )}
          {!loading && error && (
            <div className="py-8" role="alert">
              <p className="text-sm text-rose-700">
                Kebutuhan sekolah tidak dapat dimuat: {error}
              </p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-3 rounded-lg border border-[#cbd3dc] bg-white px-3 py-2 text-sm font-semibold text-[#17365d]"
              >
                Coba lagi
              </button>
            </div>
          )}
          {!loading && !error && campaigns.length === 0 && (
            <p className="py-8 text-sm text-[#64748b]" role="status">
              {search
                ? "Tidak ada kebutuhan yang cocok dengan pencarian dan filter ini."
                : "Data belum tersedia untuk filter ini."}
            </p>
          )}
          {!loading &&
            !error &&
            campaigns.map((campaign) => (
              <CampaignRow key={campaign.id} campaign={campaign} />
            ))}
        </div>
      </div>
    </main>
  );
}
