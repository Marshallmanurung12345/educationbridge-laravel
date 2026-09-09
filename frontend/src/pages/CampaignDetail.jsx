import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, formatRupiah } from "../api";
import PriorityBadge from "../components/PriorityBadge";
import { useAuth } from "../context/AuthContext";

const donationPresets = [50000, 100000, 500000, 1000000];
const donorRoles = ["individu", "perusahaan", "pemerintah"];

export default function CampaignDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const [amount, setAmount] = useState(100000);
  const [message, setMessage] = useState("");

  const [reportTitle, setReportTitle] = useState("");
  const [reportNarrative, setReportNarrative] = useState("");
  const [reportStatus, setReportStatus] = useState("");

  function load() {
    api.getCampaign(id).then(setCampaign).catch((e) => setError(e.message));
    api.listDonations(id).then(setDonations).catch(() => {});
    api.listReports(id).then(setReports).catch(() => {});
  }

  useEffect(load, [id]);

  async function submitDonation(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createDonation(id, { amount: Number(amount), message });
      setStatus("Terima kasih! Donasi Anda tercatat.");
      setMessage("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitReport(e) {
    e.preventDefault();
    setReportStatus("");
    try {
      await api.createReport(id, { title: reportTitle, narrative: reportNarrative });
      setReportTitle("");
      setReportNarrative("");
      setReportStatus("Laporan berhasil ditambahkan.");
      load();
    } catch (err) {
      setReportStatus(err.message);
    }
  }

  const isOwnerSchool = user && campaign && user.role === "sekolah" && user.id === campaign.user_id;

  if (error && !campaign) return <div className="max-w-3xl mx-auto px-5 py-16 text-clay">{error}</div>;
  if (!campaign) return <div className="max-w-3xl mx-auto px-5 py-16 text-ink-light">Memuat...</div>;

  return (
    <div className="max-w-5xl mx-auto px-5 py-12 grid md:grid-cols-[1.6fr_1fr] gap-10">
      <div>
        <Link to="/kampanye" className="text-sm text-ink-light hover:text-ink">&larr; Kembali ke daftar</Link>

        <div className="flex items-start justify-between gap-4 mt-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-light">{campaign.category} · {campaign.location}</p>
            <h1 className="font-display text-3xl mt-1">{campaign.title}</h1>
            <p className="text-ink-light mt-1">{campaign.school_name} · {campaign.student_count} siswa terdampak</p>
          </div>
          <PriorityBadge score={campaign.priority_score} label={campaign.priority_label} size="lg" />
        </div>

        <p className="mt-6 prose-measure leading-relaxed">{campaign.description}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {campaign.tags.map((t) => (
            <span key={t} className="text-xs border border-ink/20 px-2 py-1 text-ink-light">#{t}</span>
          ))}
        </div>

        <section className="mt-12">
          <h2 className="font-display text-xl">Laporan Dampak</h2>
          {reports.length === 0 && <p className="text-sm text-ink-light mt-2">Belum ada laporan dari sekolah untuk campaign ini.</p>}
          <ul className="mt-4 space-y-4">
            {reports.map((r) => (
              <li key={r.id} className="border-l-2 border-sage pl-4">
                <p className="text-xs text-ink-light">{new Date(r.created_at).toLocaleDateString("id-ID")}</p>
                <h3 className="font-medium">{r.title}</h3>
                <p className="text-sm text-ink-light mt-1">{r.narrative}</p>
              </li>
            ))}
          </ul>

          {isOwnerSchool && (
            <form onSubmit={submitReport} className="mt-6 border border-ink/15 p-4 space-y-3">
              <p className="text-sm font-medium">Tambah laporan dampak (khusus sekolah pengaju)</p>
              <input
                required
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Judul laporan"
                className="input"
              />
              <textarea
                required
                rows={3}
                value={reportNarrative}
                onChange={(e) => setReportNarrative(e.target.value)}
                placeholder="Ceritakan penggunaan dan dampak bantuan"
                className="input"
              />
              <button className="bg-navy text-paper px-4 py-2 text-sm">Kirim laporan</button>
              {reportStatus && <p className="text-sm text-ink-light">{reportStatus}</p>}
            </form>
          )}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl">Donasi Terbaru</h2>
          {donations.length === 0 && <p className="text-sm text-ink-light mt-2">Jadilah donatur pertama untuk kebutuhan ini.</p>}
          <ul className="mt-4 divide-y divide-ink/10">
            {donations.map((d) => (
              <li key={d.id} className="py-3 flex justify-between text-sm">
                <span>{d.donor_name} <span className="text-ink-light">({d.donor_type})</span></span>
                <span className="font-medium">{formatRupiah(d.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="bg-navy text-paper p-6 h-fit sticky top-24">
        <div className="h-2 bg-paper/20 rounded-full overflow-hidden">
          <div className="h-full bg-marigold" style={{ width: `${campaign.progress_percent}%` }} />
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="font-display text-lg">{formatRupiah(campaign.raised_amount)}</span>
          <span className="text-paper/60">dari {formatRupiah(campaign.target_amount)}</span>
        </div>

        {!user && (
          <div className="mt-6 text-sm">
            <p className="text-paper/80">Masuk sebagai individu, perusahaan, atau pemerintah untuk menyalurkan bantuan.</p>
            <div className="flex gap-3 mt-3">
              <Link to="/masuk" className="bg-marigold text-navy px-4 py-2 font-medium">Masuk</Link>
              <Link to="/daftar" className="border border-paper/40 px-4 py-2">Daftar</Link>
            </div>
          </div>
        )}

        {user && !donorRoles.includes(user.role) && (
          <p className="mt-6 text-sm text-paper/80">
            Akun berperan "{user.role}" tidak dapat berdonasi. Donasi hanya untuk akun individu, perusahaan, atau pemerintah.
          </p>
        )}

        {user && donorRoles.includes(user.role) && (
          <form onSubmit={submitDonation} className="mt-6 space-y-3">
            <p className="text-xs text-paper/60">Berdonasi sebagai {user.organization_name || user.name}</p>
            <div>
              <label className="text-xs text-paper/70">Nominal donasi</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {donationPresets.map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setAmount(p)}
                    className={`text-xs px-2 py-1 border ${amount === p ? "bg-marigold border-marigold text-navy" : "border-paper/30 text-paper/80"}`}
                  >
                    {formatRupiah(p)}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="10000"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full mt-2 px-3 py-2 bg-paper text-ink text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-paper/70">Pesan (opsional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-paper text-ink text-sm"
                rows={2}
              />
            </div>
            <button className="w-full bg-marigold text-navy font-medium py-2.5 hover:bg-paper transition-colors">
              Salurkan bantuan
            </button>
            {status && <p className="text-sage text-sm">{status}</p>}
            {error && <p className="text-clay text-sm">{error}</p>}
          </form>
        )}
      </aside>
    </div>
  );
}
