import { useEffect, useState } from "react";
import { api, formatRupiah } from "../api";

const statusStyle = {
  pending: "bg-marigold/20 text-marigold",
  verified: "bg-sage/20 text-sage",
  rejected: "bg-clay/20 text-clay",
};

export default function AdminDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const params = filter === "semua" ? {} : { status: filter };
    api.listCampaigns(params).then(setCampaigns).finally(() => setLoading(false));
  }

  useEffect(load, [filter]);

  async function setStatus(campaign, status) {
    await api.updateCampaign(campaign.id, { status });
    load();
  }

  async function remove(campaign) {
    if (!confirm(`Hapus campaign "${campaign.title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    await api.deleteCampaign(campaign.id);
    load();
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl">Panel Admin</h1>
      <p className="text-ink-light mt-2">Verifikasi campaign masuk sebelum ditayangkan ke publik.</p>

      <div className="flex gap-2 mt-6">
        {["pending", "verified", "rejected", "semua"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm border capitalize ${filter === f ? "bg-navy text-paper border-navy" : "border-ink/20 text-ink-light"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto">
        {loading && <p className="text-ink-light py-8">Memuat...</p>}
        {!loading && campaigns.length === 0 && <p className="text-ink-light py-8">Tidak ada campaign dengan status ini.</p>}
        {!loading && campaigns.length > 0 && (
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-ink-light border-b border-ink/10">
                <th className="py-2 pr-4">Campaign</th>
                <th className="py-2 pr-4">Sekolah</th>
                <th className="py-2 pr-4">Skor</th>
                <th className="py-2 pr-4">Target</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-ink/5">
                  <td className="py-3 pr-4 font-medium max-w-xs">{c.title}</td>
                  <td className="py-3 pr-4 text-ink-light">{c.school_name}</td>
                  <td className="py-3 pr-4">
                    <span className="font-display">{c.priority_score}</span>
                  </td>
                  <td className="py-3 pr-4">{formatRupiah(c.target_amount)}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 text-xs rounded-sm capitalize ${statusStyle[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-2">
                      {c.status !== "verified" && (
                        <button onClick={() => setStatus(c, "verified")} className="text-sage hover:underline">Verifikasi</button>
                      )}
                      {c.status !== "rejected" && (
                        <button onClick={() => setStatus(c, "rejected")} className="text-clay hover:underline">Tolak</button>
                      )}
                      <button onClick={() => remove(c)} className="text-ink-light hover:underline">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
