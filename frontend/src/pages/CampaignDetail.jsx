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
  const [paymentMethod, setPaymentMethod] = useState("transfer_bank");
  const [message, setMessage] = useState("");

  const [reportTitle, setReportTitle] = useState("");
  const [reportNarrative, setReportNarrative] = useState("");
  const [reportStatus, setReportStatus] = useState("");

  function load() {
    api
      .getCampaign(id)
      .then(setCampaign)
      .catch((e) => setError(e.message));
    api
      .listDonations(id)
      .then(setDonations)
      .catch(() => {});
    api
      .listReports(id)
      .then(setReports)
      .catch(() => {});
  }

  useEffect(load, [id]);

  async function submitDonation(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createDonation(id, {
        amount: Number(amount),
        payment_method: paymentMethod,
        message,
      });
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
      await api.createReport(id, {
        title: reportTitle,
        narrative: reportNarrative,
      });
      setReportTitle("");
      setReportNarrative("");
      setReportStatus("Laporan berhasil ditambahkan.");
      load();
    } catch (err) {
      setReportStatus(err.message);
    }
  }

  const isOwnerSchool =
    user && campaign && user.role === "sekolah" && user.id === campaign.user_id;

  if (error && !campaign)
    return (
      <div className="max-w-3xl mx-auto px-5 py-16 text-clay">{error}</div>
    );
  if (!campaign)
    return (
      <div className="max-w-3xl mx-auto px-5 py-16 text-ink-light">
        Memuat...
      </div>
    );

  return (
    <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-10 lg:grid-cols-[1.35fr_0.65fr] lg:px-8">
      <div>
        <Link to="/kampanye" className="text-sm text-[#667085] hover:text-[#17365d]">← Kembali ke kebutuhan sekolah</Link>

        <div className="flex items-start justify-between gap-4 mt-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#667085]">
              {campaign.category} · {campaign.location}
            </p>
            <h1 className="mt-2 font-display text-4xl leading-tight text-[#17365d]">{campaign.title}</h1>
            <p className="mt-2 text-[#667085]">
              {campaign.school_name} · {campaign.student_count} siswa terdampak
            </p>
            <p className="mt-2 text-sm text-[#667085]">
              Periode bantuan:{" "}
              {campaign.start_date
                ? new Date(campaign.start_date).toLocaleDateString("id-ID")
                : "-"}{" "}
              sampai{" "}
              {campaign.end_date
                ? new Date(campaign.end_date).toLocaleDateString("id-ID")
                : "-"}
            </p>
          </div>
          <PriorityBadge
            score={campaign.priority_score}
            label={campaign.priority_label}
            size="lg"
          />
        </div>

        <p className="mt-7 max-w-[680px] text-base leading-8 text-[#53677f]">
          {campaign.description}
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {campaign.tags.map((t) => (
            <span
              key={t}
              className="text-xs border border-ink/20 px-2 py-1 text-ink-light"
            >
              #{t}
            </span>
          ))}
        </div>

        <section className="mt-12 border-t border-[#e7ebf0] pt-8">
          <h2 className="font-display text-xl">Laporan Dampak</h2>
          {reports.length === 0 && (
            <p className="text-sm text-ink-light mt-2">
              Belum ada laporan dari sekolah untuk campaign ini.
            </p>
          )}
          <ul className="mt-4 space-y-4">
            {reports.map((r) => (
              <li key={r.id} className="border-l-2 border-sage pl-4">
                <p className="text-xs text-ink-light">
                  {new Date(r.created_at).toLocaleDateString("id-ID")}
                </p>
                <h3 className="font-medium">{r.title}</h3>
                <p className="text-sm text-ink-light mt-1">{r.narrative}</p>
              </li>
            ))}
          </ul>

          {isOwnerSchool && (
            <form
              onSubmit={submitReport}
              className="mt-6 border border-ink/15 p-4 space-y-3"
            >
              <p className="text-sm font-medium">
                Tambah laporan dampak (khusus sekolah pengaju)
              </p>
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
              <button className="bg-navy text-paper px-4 py-2 text-sm">
                Kirim laporan
              </button>
              {reportStatus && (
                <p className="text-sm text-ink-light">{reportStatus}</p>
              )}
            </form>
          )}
        </section>

        <section className="mt-12 border-t border-[#e7ebf0] pt-8">
          <h2 className="font-display text-xl">Donasi Terbaru</h2>
          {donations.length === 0 && (
            <p className="text-sm text-ink-light mt-2">
              Jadilah donatur pertama untuk kebutuhan ini.
            </p>
          )}
          <ul className="mt-4 divide-y divide-ink/10">
            {donations.map((d) => (
              <li key={d.id} className="py-3 flex justify-between text-sm">
                <span>
                  {d.donor_name}{" "}
                  <span className="text-ink-light">({d.donor_type})</span>
                </span>
                <span className="font-medium">{formatRupiah(d.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="h-fit rounded-[14px] border border-[#dfe6ee] bg-white p-6 shadow-[0_10px_30px_rgba(23,54,93,0.08)] lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">Dukungan terkumpul</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e9edf2]">
          <div
            className="h-full bg-[#2d83c6]"
            style={{ width: `${campaign.progress_percent}%` }}
          />
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <span className="font-display text-2xl text-[#17365d]">
            {formatRupiah(campaign.raised_amount)}
          </span>
          <span className="text-right text-xs text-[#667085]">
            dari {formatRupiah(campaign.target_amount)}
          </span>
        </div>
        <p className="mt-2 text-xs text-[#667085]">{campaign.progress_percent}% dari target bantuan</p>
        <div className="mt-5 grid grid-cols-2 gap-3 border-y border-[#edf0f4] py-4 text-center"><div><strong className="block text-lg text-[#17365d]">{donations.length}</strong><span className="text-xs text-[#667085]">donasi tercatat</span></div><div><strong className="block text-lg text-[#17365d]">{campaign.end_date ? new Date(campaign.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-"}</strong><span className="text-xs text-[#667085]">batas donasi</span></div></div>

        {!user && (
          <div className="mt-6 text-sm">
            <p className="text-[#53677f]">Anda dapat melihat kebutuhan ini tanpa masuk. Untuk mencatat donasi, silakan masuk atau buat akun terlebih dahulu.</p>
            <div className="mt-4 flex gap-3">
              <Link
                to="/masuk"
                state={{ from: `/kampanye/${id}` }}
                className="rounded-[8px] bg-[#17365d] px-4 py-2 font-medium text-white"
              >
                Masuk
              </Link>
              <Link to="/daftar" state={{ from: `/kampanye/${id}` }} className="rounded-[8px] border border-[#cbd5e1] px-4 py-2 text-[#17365d]">
                Daftar
              </Link>
            </div>
          </div>
        )}

        {user && !donorRoles.includes(user.role) && (
          <p className="mt-6 text-sm text-[#667085]">
            Akun berperan "{user.role}" tidak dapat berdonasi. Donasi hanya
            untuk akun individu, perusahaan, atau pemerintah.
          </p>
        )}

        {user && donorRoles.includes(user.role) && (
          <form onSubmit={submitDonation} className="mt-6 space-y-4">
            <p className="text-xs text-[#667085]">
              Berdonasi sebagai {user.organization_name || user.name}
            </p>
            <div>
              <label className="text-sm font-semibold text-[#344054]">Nominal donasi</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {donationPresets.map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setAmount(p)}
                    className={`border px-2 py-2 text-xs ${amount === p ? "border-[#17365d] bg-[#edf4fb] text-[#17365d]" : "border-[#d5dfe9] text-[#53677f]"}`}
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
                className="mt-2 w-full rounded-[8px] border border-[#d5dfe9] px-3 py-2 text-sm text-[#17365d]"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#344054]">Metode pembayaran</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-2 w-full rounded-[8px] border border-[#d5dfe9] bg-white px-3 py-2 text-sm text-[#17365d]"><option value="transfer_bank">Transfer bank</option><option value="e_wallet">E-wallet</option></select>
              <p className="mt-1 text-[11px] text-[#8a98a8]">Pembayaran akan diarahkan setelah donasi dikonfirmasi.</p>
            </div>
            <div>
                <label className="text-sm font-semibold text-[#344054]">Pesan (opsional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-2 w-full rounded-[8px] border border-[#d5dfe9] px-3 py-2 text-sm text-[#17365d]"
                rows={2}
              />
            </div>
            <button className="w-full rounded-[8px] bg-[#e3a22f] py-3 font-semibold text-[#17365d] hover:bg-[#f0b94f] transition-colors">
              Donasi Sekarang
            </button>
            {status && <p className="text-sage text-sm">{status}</p>}
            {error && <p className="text-clay text-sm">{error}</p>}
          </form>
        )}
      </aside>
    </div>
  );
}
