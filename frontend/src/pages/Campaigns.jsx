import { useEffect, useState } from "react";
import { api } from "../api";
import CampaignRow from "../components/CampaignRow";

const categories = ["Semua", "Fasilitas", "Buku", "Teknologi", "Beasiswa", "Laboratorium"];

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [category, setCategory] = useState("Semua");
  const [sort, setSort] = useState("priority");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { status: "verified", sort };
    if (category !== "Semua") params.category = category;
    api.listCampaigns(params).then(setCampaigns).finally(() => setLoading(false));
  }, [category, sort]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl">Jelajahi Kebutuhan Sekolah</h1>
      <p className="text-ink-light mt-2 prose-measure">
        Campaign yang tayang di sini sudah diverifikasi oleh tim EducationBridge. Urutkan berdasarkan Priority Score
        untuk melihat kebutuhan paling mendesak.
      </p>

      <div className="flex flex-wrap gap-4 mt-8 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 text-sm border ${
                category === c ? "bg-navy text-paper border-navy" : "border-ink/20 text-ink-light hover:border-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-ink/20 px-3 py-1.5 text-sm bg-paper"
        >
          <option value="priority">Urutkan: Priority Score</option>
          <option value="newest">Urutkan: Terbaru</option>
          <option value="progress">Urutkan: Progress Dana</option>
        </select>
      </div>

      <div className="mt-6">
        {loading && <p className="text-ink-light py-8">Memuat campaign...</p>}
        {!loading && campaigns.length === 0 && (
          <p className="text-ink-light py-8">Belum ada campaign untuk filter ini.</p>
        )}
        {campaigns.map((c) => (
          <CampaignRow key={c.id} campaign={c} />
        ))}
      </div>
    </div>
  );
}
