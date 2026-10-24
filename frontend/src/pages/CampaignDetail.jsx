import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatRupiah } from "../api";
import { useAuth } from "../context/AuthContext";
import { getCategoryImage } from "../categoryImages";

const donationPresets = [50000, 100000, 250000, 500000];
const donorRoles = ["individu", "perusahaan", "pemerintah"];

const tabs = [
  ["tentang", "Tentang Kebutuhan"],
  ["anggaran", "Rincian Anggaran"],
  ["donasi", "Donasi & Transparansi"],
  ["sekolah", "Informasi Sekolah"],
  ["lokasi", "Lokasi"],
];

function dateLabel(value) {
  return value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Belum ditentukan";
}

function Card({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-[#eaecf0] bg-white p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#101828]">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#f2f4f7] py-2.5 last:border-0">
      <span className="text-xs text-[#667085]">{label}</span>
      <span className="text-right text-xs font-medium text-[#101828]">{value || "—"}</span>
    </div>
  );
}

export default function CampaignDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [donationLoadError, setDonationLoadError] = useState("");
  const [reportLoadError, setReportLoadError] = useState("");
  const [status, setStatus] = useState("");
  const [amount, setAmount] = useState(50000);
  const [paymentMethod, setPaymentMethod] = useState("transfer_bank");
  const [message, setMessage] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportNarrative, setReportNarrative] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [activeTab, setActiveTab] = useState("tentang");
  const [copied, setCopied] = useState(false);

  function load() {
    api.getCampaign(id).then(setCampaign).catch((e) => setError(e.message));
    api.listDonations(id)
      .then((result) => { setDonations(result); setDonationLoadError(""); })
      .catch((loadError) => setDonationLoadError(loadError.message));
    api.listReports(id)
      .then((result) => { setReports(result); setReportLoadError(""); })
      .catch((loadError) => setReportLoadError(loadError.message));
  }

  useEffect(() => {
    setImageFailed(false);
    setActiveTab("tentang");
    load();
  }, [id]);

  async function submitDonation(event) {
    event.preventDefault();
    setError("");
    try {
      await api.createDonation(id, { amount: Number(amount), payment_method: paymentMethod, message });
      setStatus("Terima kasih. Donasi Anda sudah tercatat.");
      setMessage("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitReport(event) {
    event.preventDefault();
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

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: campaign.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* dibatalkan */ }
  }

  if (error && !campaign)
    return <div className="mx-auto max-w-4xl px-5 py-16 text-red-600 text-sm">{error}</div>;
  if (!campaign)
    return <div className="mx-auto max-w-4xl px-5 py-16 text-[#667085] text-sm">Memuat kebutuhan sekolah...</div>;

  const school = campaign.school;
  const isOwnerSchool = user?.role === "sekolah" && user.id === campaign.user_id;
  const fallbackImage = getCategoryImage(campaign.category, campaign.title);
  const image = (!imageFailed && campaign.image_url) || fallbackImage;
  const tags = Array.isArray(campaign.tags) ? campaign.tags : [];
  const priorityBreakdown = campaign.priority_breakdown || {};
  const progressPercent = Math.min(100, Math.max(0, Number(campaign.progress_percent) || 0));
  const location = school
    ? [school.kecamatan, school.kabupaten_kota, school.provinsi].filter(Boolean).join(", ") || "Lokasi belum tersedia"
    : campaign.location || "Lokasi belum tersedia";
  const studentCount = school?.jumlah_siswa ?? campaign.student_count;
  const hasCoords = school?.latitude && school?.longitude;

  return (
    <main className="min-h-screen bg-[#f9fafb]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">

        {/* Back link */}
        <Link
          to="/kampanye"
          className="inline-flex items-center gap-1.5 text-sm text-[#667085] hover:text-[#344054] transition"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M10.5 3 5.5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          Kembali ke daftar kebutuhan
        </Link>

        {/* ===== MAIN LAYOUT: foto + info | donasi ===== */}
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">

          {/* LEFT: foto + info */}
          <div className="space-y-5">
            {/* Foto */}
            <div className="overflow-hidden rounded-xl bg-[#eaecf0]">
              <img
                src={image}
                alt={`Foto dokumentasi: ${campaign.title}`}
                onError={() => setImageFailed(true)}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>

            {/* Info utama */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
                {campaign.category || "Kebutuhan Sekolah"}
              </p>
              <h1 className="mt-1.5 text-xl font-semibold leading-snug text-[#101828] sm:text-2xl">
                {campaign.title}
              </h1>
              <p className="mt-1 text-sm font-medium text-[#344054]">
                {school?.name || campaign.school_name || "Nama sekolah belum tersedia"}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-[#667085]">
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current shrink-0" aria-hidden="true">
                  <path d="M10 1.8a6.2 6.2 0 0 0-6.2 6.2c0 4.3 6.2 10.2 6.2 10.2s6.2-5.9 6.2-10.2A6.2 6.2 0 0 0 10 1.8Zm0 8.7a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/>
                </svg>
                {location}
              </p>
            </div>

            {/* Stats sekolah */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Siswa terdampak", value: studentCount ?? "—" },
                { label: "Jumlah guru", value: school?.jumlah_guru ?? "—" },
                { label: "Jenjang", value: school ? `${school.jenjang || "—"} ${school.status_sekolah ? `· ${school.status_sekolah}` : ""}` : "—" },
                { label: "Batas waktu", value: dateLabel(campaign.end_date) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-[#eaecf0] bg-white px-3 py-2.5">
                  <p className="text-lg font-semibold text-[#101828]">{value}</p>
                  <p className="mt-0.5 text-[11px] text-[#667085]">{label}</p>
                </div>
              ))}
            </div>

            {/* NPSN */}
            {school?.npsn && (
              <div className="flex items-center gap-3 rounded-lg border border-[#eaecf0] bg-white px-4 py-2.5 text-xs">
                <span className="font-mono font-semibold text-[#344054]">NPSN: {school.npsn}</span>
                {school.data_source && (
                  <span className="text-[#667085]">· Sumber: {school.data_source}</span>
                )}
              </div>
            )}

            {/* ===== TABS ===== */}
            <div className="mt-2">
              <div className="flex gap-0 border-b border-[#eaecf0] overflow-x-auto">
                {tabs.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                      activeTab === key
                        ? "border-[#101828] text-[#101828]"
                        : "border-transparent text-[#667085] hover:text-[#344054]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                {/* Tab: Tentang Kebutuhan */}
                {activeTab === "tentang" && (
                  <div className="space-y-4">
                    {/* Deskripsi */}
                    <Card title="Deskripsi Kebutuhan">
                      {campaign.description ? (
                        <p className="text-sm leading-7 text-[#475467] whitespace-pre-line">
                          {campaign.description}
                        </p>
                      ) : (
                        <p className="text-sm text-[#98a2b3]">Deskripsi kebutuhan belum tersedia.</p>
                      )}
                      {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {tags.map((tag) => (
                            <span key={tag} className="rounded-md border border-[#eaecf0] px-2.5 py-0.5 text-xs text-[#667085]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>

                    {/* Priority Score */}
                    {campaign.priority_score != null && (
                      <Card title="Skor Prioritas">
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-3xl font-bold text-[#101828]">{campaign.priority_score}</span>
                          <span className="text-sm text-[#667085]">/ 100</span>
                          {campaign.priority_label && (
                            <span className="ml-1 rounded-md bg-[#fef3c7] px-2 py-0.5 text-xs font-medium text-[#92400e]">
                              {campaign.priority_label}
                            </span>
                          )}
                        </div>
                        <div className="space-y-3">
                          {[
                            ["Wilayah prioritas", priorityBreakdown.wilayah_prioritas, 25],
                            ["Kondisi fasilitas", priorityBreakdown.kondisi_fasilitas, 25],
                            ["Siswa terdampak", priorityBreakdown.siswa_terdampak, 20],
                            ["Akses pendidikan", priorityBreakdown.akses_pendidikan, 15],
                            ["Urgensi kebutuhan", priorityBreakdown.urgensi, 15],
                          ].map(([label, value, max]) => (
                            <div key={label} className="flex items-center gap-3 text-xs">
                              <span className="w-36 shrink-0 text-[#667085]">{label}</span>
                              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-[#f2f4f7]">
                                <div
                                  className="h-full rounded-full bg-[#344054]"
                                  style={{ width: `${value ? (value / max) * 100 : 0}%` }}
                                />
                              </div>
                              <span className="w-10 text-right font-medium text-[#344054]">
                                {value ?? "-"}/{max}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                )}

                {/* Tab: Rincian Anggaran */}
                {activeTab === "anggaran" && (
                  <Card
                    title="Rincian Anggaran"
                    action={
                      <div className="text-right">
                        <p className="text-[11px] text-[#667085]">Total kebutuhan</p>
                        <p className="text-base font-semibold text-[#101828]">{formatRupiah(campaign.target_amount)}</p>
                      </div>
                    }
                  >
                    {campaign.rab_description ? (
                      <div className="rounded-lg bg-[#f9fafb] p-4 text-sm leading-7 text-[#475467] whitespace-pre-line">
                        {campaign.rab_description}
                      </div>
                    ) : (
                      <p className="text-sm text-[#98a2b3]">Rincian anggaran belum tersedia.</p>
                    )}
                  </Card>
                )}

                {/* Tab: Donasi & Transparansi */}
                {activeTab === "donasi" && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card
                      title="Donasi Tercatat"
                      action={<span className="text-xs text-[#667085]">{donations.length} donasi</span>}
                    >
                      {donationLoadError ? (
                        <p role="alert" className="text-sm text-red-600">{donationLoadError}</p>
                      ) : donations.length === 0 ? (
                        <p className="text-sm text-[#98a2b3]">Belum ada donasi untuk kebutuhan ini.</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[#f2f4f7] text-xs text-[#667085]">
                              <th className="pb-2 text-left font-medium">Tanggal</th>
                              <th className="pb-2 text-right font-medium">Nominal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f2f4f7]">
                            {donations.map((donation) => (
                              <tr key={donation.id}>
                                <td className="py-2.5 text-xs text-[#667085]">
                                  {donation.created_at
                                    ? new Date(donation.created_at).toLocaleDateString("id-ID")
                                    : "—"}
                                </td>
                                <td className="py-2.5 text-right text-xs font-semibold text-[#101828]">
                                  {formatRupiah(donation.amount)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </Card>

                    <Card title="Laporan Dampak">
                      {reportLoadError ? (
                        <p role="alert" className="text-sm text-red-600">{reportLoadError}</p>
                      ) : reports.length === 0 ? (
                        <p className="text-sm text-[#98a2b3]">Belum ada laporan dari sekolah.</p>
                      ) : (
                        <ul className="divide-y divide-[#f2f4f7]">
                          {reports.map((report) => (
                            <li key={report.id} className="py-3 first:pt-0">
                              <p className="text-[11px] text-[#98a2b3]">
                                {new Date(report.created_at).toLocaleDateString("id-ID")}
                              </p>
                              <p className="mt-1 text-sm font-semibold text-[#101828]">{report.title}</p>
                              <p className="mt-1 text-sm leading-6 text-[#475467] whitespace-pre-line">
                                {report.narrative}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                      {isOwnerSchool && (
                        <form onSubmit={submitReport} className="mt-4 space-y-2.5 border-t border-[#f2f4f7] pt-4">
                          <p className="text-xs font-semibold text-[#344054]">Tambahkan laporan dampak</p>
                          <input
                            required
                            value={reportTitle}
                            onChange={(e) => setReportTitle(e.target.value)}
                            placeholder="Judul laporan"
                            className="w-full rounded-lg border border-[#eaecf0] px-3 py-2 text-sm text-[#101828] focus:border-[#344054] focus:outline-none"
                          />
                          <textarea
                            required
                            rows={3}
                            value={reportNarrative}
                            onChange={(e) => setReportNarrative(e.target.value)}
                            placeholder="Ceritakan penggunaan dan dampak bantuan"
                            className="w-full resize-y rounded-lg border border-[#eaecf0] px-3 py-2 text-sm text-[#101828] focus:border-[#344054] focus:outline-none"
                          />
                          <button className="min-h-9 rounded-lg bg-[#101828] px-4 text-sm font-semibold text-white hover:bg-[#1d2939] transition">
                            Kirim laporan
                          </button>
                          {reportStatus && <p role="status" className="text-xs text-[#475467]">{reportStatus}</p>}
                        </form>
                      )}
                    </Card>
                  </div>
                )}

                {/* Tab: Informasi Sekolah */}
                {activeTab === "sekolah" && (
                  <Card
                    title="Informasi Sekolah"
                    action={
                      school?.source_url && (
                        <a
                          href={school.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-[#344054] underline underline-offset-2 hover:text-[#101828]"
                        >
                          Lihat di Data Induk →
                        </a>
                      )
                    }
                  >
                    <div className="divide-y divide-[#f2f4f7]">
                      <InfoRow label="Nama Sekolah" value={school?.name || campaign.school_name} />
                      <InfoRow label="NPSN" value={school?.npsn} />
                      <InfoRow label="Jenjang & Status" value={school ? `${school.jenjang || "—"} · ${school.status_sekolah || "—"}` : "—"} />
                      <InfoRow label="Jumlah Siswa" value={school?.jumlah_siswa != null ? `${school.jumlah_siswa} siswa` : null} />
                      <InfoRow label="Jumlah Guru" value={school?.jumlah_guru != null ? `${school.jumlah_guru} guru` : null} />
                      <InfoRow label="Wilayah" value={location} />
                      <InfoRow label="Alamat" value={school?.alamat} />
                      {school?.fasilitas && (
                        <InfoRow
                          label="Fasilitas"
                          value={typeof school.fasilitas === "object"
                            ? Object.entries(school.fasilitas).map(([k, v]) => `${k.replace("_", " ")}: ${v}`).join(" · ")
                            : school.fasilitas}
                        />
                      )}
                    </div>
                  </Card>
                )}

                {/* Tab: Lokasi */}
                {activeTab === "lokasi" && (
                  <Card title="Lokasi Sekolah">
                    <p className="mb-3 text-sm text-[#475467]">
                      {school?.alamat ? `${school.alamat}, ` : ""}{location}
                    </p>
                    {hasCoords ? (
                      <div className="overflow-hidden rounded-lg border border-[#eaecf0]">
                        <iframe
                          title="Peta lokasi sekolah"
                          className="h-[320px] w-full"
                          loading="lazy"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(school.longitude) - 0.02},${Number(school.latitude) - 0.015},${Number(school.longitude) + 0.02},${Number(school.latitude) + 0.015}&layer=mapnik&marker=${school.latitude},${school.longitude}`}
                        />
                        <a
                          href={`https://www.google.com/maps?q=${school.latitude},${school.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block bg-[#f9fafb] px-4 py-2.5 text-center text-xs font-medium text-[#344054] hover:underline"
                        >
                          Buka di Google Maps ↗
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-[#98a2b3]">Koordinat lokasi belum tersedia.</p>
                    )}
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Donasi card (sticky) */}
          <aside className="space-y-4 lg:sticky lg:top-24">

            {/* Progress card */}
            <div className="rounded-xl border border-[#eaecf0] bg-white p-5">
              {/* Header ringkasan */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#101828]">
                    {school?.name || campaign.school_name || "Sekolah"}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-[#667085]">
                    <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current shrink-0" aria-hidden="true">
                      <path d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.1 4.5 8.5 4.5 8.5s4.5-5.4 4.5-8.5A4.5 4.5 0 0 0 8 1.5Zm0 6.3a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6Z"/>
                    </svg>
                    <span className="truncate">{location}</span>
                  </p>
                </div>
                {campaign.status === "verified" && (
                  <span className="shrink-0 rounded-md bg-[#ecfdf3] px-2 py-0.5 text-[11px] font-medium text-[#027a48]">
                    Terverifikasi
                  </span>
                )}
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-[#f2f4f7]" />

              {/* Dana terkumpul */}
              <div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[#98a2b3]">Dana Terkumpul</p>
                    <p className="mt-0.5 text-2xl font-bold text-[#101828]">
                      {formatRupiah(campaign.raised_amount)}
                    </p>
                  </div>
                  <span className="mb-0.5 text-sm font-bold text-[#344054]">{progressPercent}%</span>
                </div>

                <div
                  role="progressbar"
                  aria-label="Progress dana terkumpul"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPercent}
                  className="mt-2.5 h-2 overflow-hidden rounded-full bg-[#f2f4f7]"
                >
                  <div
                    className="h-full rounded-full bg-[#f28c28] transition-[width] duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-[#667085]">
                  Target: <span className="font-medium text-[#344054]">{formatRupiah(campaign.target_amount)}</span>
                </p>
              </div>

              {/* Stats row */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-[#f9fafb] py-2.5">
                  <p className="text-base font-bold text-[#101828]">{donations.length}</p>
                  <p className="text-[11px] text-[#667085]">Donatur</p>
                </div>
                <div className="rounded-lg bg-[#f9fafb] py-2.5">
                  <p className="text-base font-bold text-[#101828]">{studentCount ?? "—"}</p>
                  <p className="text-[11px] text-[#667085]">Siswa</p>
                </div>
                <div className="rounded-lg bg-[#f9fafb] py-2.5">
                  <p className="text-base font-bold text-[#101828]">
                    {campaign.priority_score != null ? campaign.priority_score : "—"}
                  </p>
                  <p className="text-[11px] text-[#667085]">Skor</p>
                </div>
              </div>

              {/* Batas waktu */}
              {campaign.end_date && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#eaecf0] px-3 py-2 text-xs">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-[#667085] fill-none stroke-current" strokeWidth="1.4" aria-hidden="true">
                    <rect x="1.5" y="2.5" width="13" height="12" rx="1.5"/>
                    <path d="M5 1v3M11 1v3M1.5 7h13"/>
                  </svg>
                  <span className="text-[#667085]">Batas waktu:</span>
                  <span className="font-medium text-[#344054]">{dateLabel(campaign.end_date)}</span>
                </div>
              )}

              {/* Donasi tercatat link */}
              <button
                type="button"
                onClick={() => setActiveTab("donasi")}
                className="mt-3 flex w-full items-center justify-between rounded-lg border border-[#eaecf0] px-3 py-2 text-xs font-medium text-[#344054] hover:bg-[#f9fafb] transition"
              >
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-[#f28c28] fill-current" aria-hidden="true">
                    <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8S4.41 14.5 8 14.5 14.5 11.59 14.5 8 11.59 1.5 8 1.5Zm.75 6.81v3.44h-1.5V8.31L5.47 6.53l1.06-1.06L8 6.94l1.47-1.47 1.06 1.06-1.78 1.78Z"/>
                  </svg>
                  {donations.length} donasi tercatat
                </span>
                <span className="text-[#98a2b3]">›</span>
              </button>
            </div>

            {/* CTA card */}
            <div className="rounded-xl border border-[#eaecf0] bg-white p-5">
              {!user && (
                <div className="space-y-2">
                  <p className="text-xs text-[#667085] leading-5">
                    Masuk untuk berdonasi dan bantu wujudkan kebutuhan sekolah ini.
                  </p>
                  <Link
                    to="/masuk"
                    state={{ from: `/kampanye/${id}` }}
                    className="mt-2 flex min-h-10 items-center justify-center rounded-lg bg-[#f28c28] text-sm font-semibold text-white hover:bg-[#dc7616] transition"
                  >
                    ♥ Donasi Sekarang
                  </Link>
                  <Link
                    to="/daftar"
                    state={{ from: `/kampanye/${id}` }}
                    className="flex min-h-9 items-center justify-center rounded-lg border border-[#eaecf0] text-sm font-medium text-[#344054] hover:bg-[#f9fafb] transition"
                  >
                    Daftar Akun
                  </Link>
                </div>
              )}

              {user && !donorRoles.includes(user.role) && (
                <p className="rounded-lg bg-[#f9fafb] p-3 text-xs leading-5 text-[#667085]">
                  Akun {user.role} belum dapat menyalurkan donasi.
                </p>
              )}

              {user && donorRoles.includes(user.role) && (
                <form onSubmit={submitDonation} className="space-y-2.5">
                  <p className="text-xs font-semibold text-[#344054]">Pilih nominal donasi</p>
                  <div className="grid grid-cols-2 gap-2">
                    {donationPresets.map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setAmount(preset)}
                        aria-pressed={amount === preset}
                        className={`min-h-9 rounded-lg border text-xs font-medium transition ${
                          amount === preset
                            ? "border-[#f28c28] bg-[#fff7f0] text-[#b44c00] font-semibold"
                            : "border-[#eaecf0] text-[#344054] hover:border-[#d0d5dd]"
                        }`}
                      >
                        {formatRupiah(preset)}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="10000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="Nominal lainnya"
                    className="min-h-9 w-full rounded-lg border border-[#eaecf0] px-3 text-sm text-[#101828] focus:border-[#f28c28] focus:outline-none"
                  />
                  <select
                    aria-label="Metode pembayaran"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="min-h-9 w-full rounded-lg border border-[#eaecf0] bg-white px-3 text-sm text-[#344054] focus:border-[#f28c28] focus:outline-none"
                  >
                    <option value="transfer_bank">Transfer bank</option>
                    <option value="e_wallet">E-wallet</option>
                  </select>
                  <textarea
                    aria-label="Pesan untuk sekolah"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                    className="w-full resize-y rounded-lg border border-[#eaecf0] px-3 py-2 text-sm text-[#101828] focus:border-[#f28c28] focus:outline-none"
                    placeholder="Pesan untuk sekolah (opsional)"
                  />
                  <button className="min-h-10 w-full rounded-lg bg-[#f28c28] text-sm font-semibold text-white hover:bg-[#dc7616] transition">
                    ♥ Donasi Sekarang
                  </button>
                  {status && <p role="status" className="text-xs text-green-700">{status}</p>}
                  {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
                </form>
              )}

              <button
                type="button"
                onClick={share}
                className="mt-3 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[#eaecf0] text-xs font-medium text-[#344054] hover:bg-[#f9fafb] transition"
              >
                {copied ? "✓ Tautan disalin" : "↗ Bagikan Kebutuhan Ini"}
              </button>
            </div>

            {/* Donor terbaru */}
            {donations.length > 0 && (
              <div className="rounded-xl border border-[#eaecf0] bg-white p-5">
                <p className="mb-3 text-xs font-semibold text-[#344054]">Donasi Terbaru</p>
                <ul className="space-y-2.5">
                  {donations.slice(0, 3).map((donation) => (
                    <li key={donation.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f9fafb] text-xs font-bold text-[#667085] border border-[#eaecf0]">
                          ♥
                        </div>
                        <span className="text-xs text-[#667085]">
                          {donation.created_at
                            ? new Date(donation.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
                            : "—"}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[#101828]">
                        {formatRupiah(donation.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
                {donations.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("donasi")}
                    className="mt-3 w-full text-center text-xs text-[#667085] hover:text-[#344054] transition"
                  >
                    Lihat semua {donations.length} donasi →
                  </button>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
