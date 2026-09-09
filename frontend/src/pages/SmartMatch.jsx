import { useState } from "react";
import { api } from "../api";
import CampaignRow from "../components/CampaignRow";

const focusOptions = [
  { key: "3t", label: "Wilayah 3T" },
  { key: "teknologi", label: "Teknologi & Digital" },
  { key: "renovasi", label: "Renovasi Fasilitas" },
  { key: "beasiswa", label: "Beasiswa" },
  { key: "literasi", label: "Literasi & Buku" },
  { key: "sains", label: "Sains & Laboratorium" },
];

export default function SmartMatch() {
  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  function toggle(key) {
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));
  }

  async function findMatches() {
    setLoading(true);
    try {
      const rows = await api.match(selected);
      setResults(rows);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl">Rekomendasi untuk Donatur</h1>
      <p className="text-ink-light mt-2 prose-measure">
        Pilih fokus bantuan yang sesuai dengan minat Anda atau program CSR perusahaan. Smart Matching akan
        merekomendasikan campaign yang paling relevan, diurutkan juga berdasarkan Priority Score.
      </p>

      <div className="flex flex-wrap gap-2 mt-6">
        {focusOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => toggle(opt.key)}
            className={`px-3 py-2 text-sm border ${
              selected.includes(opt.key) ? "bg-marigold border-marigold text-navy" : "border-ink/20 text-ink-light hover:border-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        onClick={findMatches}
        disabled={selected.length === 0 || loading}
        className="mt-6 bg-navy text-paper px-6 py-3 disabled:opacity-40"
      >
        {loading ? "Mencari..." : "Cari rekomendasi"}
      </button>

      {results && (
        <div className="mt-8">
          {results.length === 0 && <p className="text-ink-light">Belum ada campaign yang cocok dengan fokus ini.</p>}
          {results.map((c) => (
            <CampaignRow key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
