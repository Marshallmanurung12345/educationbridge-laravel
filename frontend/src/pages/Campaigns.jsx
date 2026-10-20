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

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [category, setCategory] = useState("Semua");
  const [sort, setSort] = useState("priority");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const params = { status: "verified", sort };
    if (category !== "Semua") {
      params.category = category === "Buku" ? "Buku & Literasi" : category;
    }
    api
      .listCampaigns(params)
      .then((result) => {
        if (active) setCampaigns(Array.isArray(result) ? result : []);
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
  }, [category, sort, reloadKey]);

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#1e293b]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-4 border-b border-[#dfe5eb] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a6b1c]">
              Pendidikan untuk semua
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight text-[#17365d] sm:text-4xl">
              Jelajahi Kebutuhan Sekolah
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b]">
              Lihat kebutuhan yang telah disetujui admin. Data dan Priority Score
              ditampilkan sesuai informasi yang tersedia di sistem.
            </p>
          </div>
          <Link
            to="/ajukan"
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-[#F28C28] px-4 text-sm font-semibold text-white hover:bg-[#DB7415]"
          >
            Ajukan Kebutuhan Sekolah
          </Link>
        </div>

        <div className="flex flex-col gap-4 border-b border-[#dfe5eb] py-4 lg:flex-row lg:items-center lg:justify-between">
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
                    ? "border-[#17365d] bg-[#17365d] text-white"
                    : "border-[#d5dce4] bg-white text-[#52606d] hover:border-[#17365d] hover:text-[#17365d]"
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
              className="min-h-10 rounded-lg border border-[#cbd3dc] bg-white px-3 text-sm text-[#34465d] focus:border-[#17365d] focus:outline-none"
            >
              <option value="priority">Priority Score</option>
              <option value="newest">Terbaru</option>
              <option value="progress">Progress Dana</option>
            </select>
          </label>
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
              Data belum tersedia untuk filter ini.
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
