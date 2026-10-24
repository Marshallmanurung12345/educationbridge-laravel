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

function Card({ title, icon, action, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-[#e1e7ee] bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-3 text-base font-bold text-[#17345B]">
            {icon && (
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef4fb] text-lg">
                {icon}
              </span>
            )}
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function Fact({ icon, value, label }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-lg text-[#53677f]" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-[#17345B]">{value}</p>
        <p className="text-xs text-[#718096]">{label}</p>
      </div>
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
  const [activeTab, setActiveTab] = useState(null);
  const [copied, setCopied] = useState(false);

  function load() {
    api
      .getCampaign(id)
      .then(setCampaign)
      .catch((e) => setError(e.message));
    api
      .listDonations(id)
      .then((result) => {
        setDonations(result);
        setDonationLoadError("");
      })
      .catch((loadError) => setDonationLoadError(loadError.message));
    api
      .listReports(id)
      .then((result) => {
        setReports(result);
        setReportLoadError("");
      })
      .catch((loadError) => setReportLoadError(loadError.message));
  }

  useEffect(() => {
    setImageFailed(false);
    setActiveTab(null);
    load();
  }, [id]);

  async function submitDonation(event) {
    event.preventDefault();
    setError("");
    try {
      await api.createDonation(id, {
        amount: Number(amount),
        payment_method: paymentMethod,
        message,
      });
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

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: campaign.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* dibatalkan pengguna */
    }
  }

  if (error && !campaign)
    return (
      <div className="mx-auto max-w-4xl px-5 py-16 text-[#c24135]">{error}</div>
    );
  if (!campaign)
    return (
      <div className="mx-auto max-w-4xl px-5 py-16 text-[#667085]">
        Memuat kebutuhan sekolah...
      </div>
    );

  const school = campaign.school;
  const isOwnerSchool =
    user?.role === "sekolah" && user.id === campaign.user_id;
  const fallbackImage = getCategoryImage(campaign.category, campaign.title);
  const image = (!imageFailed && campaign.image_url) || fallbackImage;
  const tags = Array.isArray(campaign.tags) ? campaign.tags : [];
  const priorityBreakdown = campaign.priority_breakdown || {};
  const progressPercent = Math.min(
    100,
    Math.max(0, Number(campaign.progress_percent) || 0),
  );
  const location = school
    ? [school.kecamatan, school.kabupaten_kota, school.provinsi]
        .filter(Boolean)
        .join(", ") || "Lokasi belum tersedia"
    : campaign.location || "Lokasi belum tersedia";
  const studentCount = school?.jumlah_siswa ?? campaign.student_count;
  const hasCoords = school?.latitude && school?.longitude;

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-[#23364f]">
      <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link
          to="/kampanye"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#53677f] transition hover:text-[#17365d]"
        >
          <span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e6ebf1]"
          >
            ←
          </span>
          Kembali ke daftar kebutuhan
        </Link>

        {/* ===== HERO: foto | info | donasi ===== */}
        <section className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)_340px] lg:items-start">
          <div className="overflow-hidden rounded-2xl bg-[#e9eef3] shadow-sm">
            <img
              src={image}
              alt={`Foto dokumentasi kebutuhan: ${campaign.title}`}
              onError={() => setImageFailed(true)}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              {campaign.status === "verified" && (
                <span className="rounded-full bg-[#e8f6ee] px-3 py-1 text-[#28734b]">
                  ✓ Terverifikasi
                </span>
              )}
              {campaign.priority_label && (
                <span className="rounded-full bg-[#fff1e3] px-3 py-1 text-[#c56c13]">
                  {campaign.priority_label}
                </span>
              )}
              {campaign.category && (
                <span className="rounded-full border border-[#d9e2eb] bg-white px-3 py-1 text-[#53677f]">
                  {campaign.category}
                </span>
              )}
              {school?.is_3t && (
                <span className="rounded-full bg-[#fdecec] px-3 py-1 text-[#c24135]">
                  Wilayah 3T
                </span>
              )}
            </div>

            <h1 className="mt-3 break-words text-[1.7rem] font-bold leading-tight tracking-tight text-[#17345B] sm:text-[2rem]">
              {campaign.title}
            </h1>
            <p className="mt-2 text-sm font-bold uppercase text-[#17345B]">
              {school?.name || campaign.school_name || "Nama sekolah belum tersedia"}
            </p>
            <p className="mt-1 text-sm text-[#53677f]">📍 {location}</p>

            <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-4 rounded-xl border border-[#d6e4f3] bg-[#eef5fd] px-4 py-3 text-xs">
              <span className="rounded-md bg-[#d6e6f8] px-2.5 py-1 font-mono font-semibold text-[#17345B]">
                NPSN: {school?.npsn || "—"}
              </span>
              <div className="border-l border-[#cddcee] pl-4 text-[#53677f]">
                Sumber data:
                <br />
                <span className="font-medium text-[#17345B]">
                  {school?.data_source || "Data belum tersedia"}
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
              <Fact icon="👥" value={studentCount ?? "—"} label="siswa terdampak" />
              <Fact icon="🧑‍🏫" value={school?.jumlah_guru ?? "—"} label="guru" />
              <Fact
                icon="🏫"
                value={
                  school
                    ? `${school.jenjang || "—"} • ${school.status_sekolah || "—"}`
                    : "—"
                }
                label="Jenjang pendidikan"
              />
              {school?.is_3t && (
                <div className="col-span-2 sm:col-span-2">
                  <Fact
                    icon="🚩"
                    value={school.status_3t_detail || "Wilayah 3T"}
                    label="Status wilayah"
                  />
                </div>
              )}
              <Fact icon="📅" value={dateLabel(campaign.end_date)} label="Batas waktu" />
            </div>
          </div>

          {/* Donation card */}
          <aside className="rounded-2xl border border-[#e1e7ee] bg-white p-5 shadow-[0_10px_30px_rgba(23,52,91,0.08)] lg:sticky lg:top-24">
            <h2 className="text-base font-bold text-[#17345B]">Donasi untuk Kebutuhan Ini</h2>
            <p className="mt-1 text-xs leading-5 text-[#718096]">
              Bantu wujudkan ruang belajar yang aman dan nyaman
              {studentCount ? ` bagi ${studentCount} siswa.` : "."}
            </p>

            <div className="mt-4 flex items-end justify-between">
              <p className="text-2xl font-bold text-[#17345B]">
                {formatRupiah(campaign.raised_amount)}
              </p>
              <p className="text-sm font-bold text-[#17345B]">{progressPercent}%</p>
            </div>
            <div
              role="progressbar"
              aria-label="Progress dana terkumpul"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={progressPercent}
              className="mt-2 h-2 overflow-hidden rounded-full bg-[#e6ebf1]"
            >
              <div
                className="h-full rounded-full bg-[#2d6fdc] transition-[width] duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[#718096]">
              terkumpul dari {formatRupiah(campaign.target_amount)}
            </p>

            <button
              type="button"
              onClick={() => setActiveTab("donasi")}
              className="mt-4 flex w-full items-center justify-between rounded-lg border border-[#e1e7ee] bg-[#f7f9fb] px-3 py-2.5 text-xs font-semibold text-[#17345B] transition hover:bg-[#eef3f8]"
            >
              <span>{donations.length} donasi tercatat</span>
              <span aria-hidden="true">›</span>
            </button>

            {!user && (
              <div className="mt-4 space-y-2">
                <Link
                  to="/masuk"
                  state={{ from: `/kampanye/${id}` }}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#F28C28] text-sm font-semibold text-white transition hover:bg-[#dc7616]"
                >
                  ♥ Masuk untuk Donasi
                </Link>
                <Link
                  to="/daftar"
                  state={{ from: `/kampanye/${id}` }}
                  className="flex min-h-11 items-center justify-center rounded-lg border border-[#d5dfe9] text-sm font-semibold text-[#17345B] transition hover:bg-[#f7f9fb]"
                >
                  Daftar Akun
                </Link>
              </div>
            )}

            {user && !donorRoles.includes(user.role) && (
              <p className="mt-4 rounded-lg bg-[#f7f9fb] p-3 text-xs leading-5 text-[#667085]">
                Akun dengan role {user.role} belum dapat menyalurkan donasi.
              </p>
            )}

            {user && donorRoles.includes(user.role) && (
              <form onSubmit={submitDonation} className="mt-4">
                <div className="grid grid-cols-2 gap-2">
                  {donationPresets.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setAmount(preset)}
                      aria-pressed={amount === preset}
                      className={`min-h-10 rounded-lg border text-sm transition ${
                        amount === preset
                          ? "border-[#2d6fdc] bg-[#eef4fd] font-semibold text-[#17345B]"
                          : "border-[#d5dfe9] bg-white text-[#53677f] hover:border-[#9cacc0]"
                      }`}
                    >
                      {formatRupiah(preset)}
                    </button>
                  ))}
                </div>
                <label htmlFor="donation-amount" className="sr-only">
                  Nominal donasi lainnya
                </label>
                <input
                  id="donation-amount"
                  type="number"
                  min="10000"
                  required
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                  className="mt-2 min-h-10 w-full rounded-lg border border-[#d5dfe9] px-3 text-sm text-[#17345B] focus:border-[#2d6fdc] focus:outline-none"
                  placeholder="Nominal lainnya"
                />
                <select
                  aria-label="Metode pembayaran"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="mt-2 min-h-10 w-full rounded-lg border border-[#d5dfe9] bg-white px-3 text-sm text-[#17345B] focus:border-[#2d6fdc] focus:outline-none"
                >
                  <option value="transfer_bank">Transfer bank</option>
                  <option value="e_wallet">E-wallet</option>
                </select>
                <textarea
                  aria-label="Pesan untuk sekolah"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={2}
                  className="mt-2 w-full resize-y rounded-lg border border-[#d5dfe9] px-3 py-2 text-sm focus:border-[#2d6fdc] focus:outline-none"
                  placeholder="Pesan untuk sekolah (opsional)"
                />
                <button className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#F28C28] text-sm font-semibold text-white shadow-sm transition hover:bg-[#dc7616]">
                  ♥ Donasi Sekarang
                </button>
                {status && (
                  <p role="status" className="mt-2 text-xs text-[#258a5b]">{status}</p>
                )}
                {error && (
                  <p role="alert" className="mt-2 text-xs text-[#c24135]">{error}</p>
                )}
              </form>
            )}

            <button
              type="button"
              onClick={share}
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#c9d6e4] text-sm font-semibold text-[#17345B] transition hover:bg-[#f7f9fb]"
            >
              {copied ? "✓ Tautan disalin" : "⤴ Bagikan Kebutuhan Ini"}
            </button>
          </aside>
        </section>

        {/* ===== TABS ===== */}
        <nav
          aria-label="Bagian informasi kebutuhan"
          className="mt-10 flex gap-1 overflow-x-auto border-b border-[#dfe5eb] text-sm"
        >
          {tabs.map(([key, label]) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                aria-expanded={active}
                onClick={() => setActiveTab(active ? null : key)}
                className={`shrink-0 border-b-2 px-4 py-3 font-medium transition ${
                  active
                    ? "border-[#F28C28] text-[#17345B]"
                    : "border-transparent text-[#667085] hover:text-[#17345B]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {!activeTab && (
          <p className="mt-6 rounded-xl border border-dashed border-[#d5dfe9] bg-white/60 px-5 py-6 text-center text-sm text-[#718096]">
            Pilih salah satu tab di atas untuk melihat informasi lengkap.
          </p>
        )}

        <div key={activeTab} className="mt-6 animate-[fadeIn_.25s_ease-out]">
          {activeTab === "tentang" && (
            <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
              <Card title="Deskripsi Kebutuhan" icon="📄">
                {campaign.description ? (
                  <p className="whitespace-pre-line text-sm leading-7 text-[#53677f]">
                    {campaign.description}
                  </p>
                ) : (
                  <p className="text-sm text-[#667085]">Deskripsi kebutuhan belum tersedia.</p>
                )}
                {tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#d9e2eb] px-3 py-1 text-xs text-[#53677f]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
              <Card
                title="Indikator Priority Score"
                icon="📊"
                className="bg-gradient-to-br from-[#fff8f0] to-white"
              >
                <p className="text-4xl font-bold text-[#17345B]">
                  {campaign.priority_score ?? "—"}
                  <span className="ml-1 text-base font-medium text-[#7b8798]">/ 100</span>
                </p>
                {campaign.priority_label && (
                  <span className="mt-1 inline-block rounded-full bg-[#fdecec] px-2.5 py-0.5 text-xs font-semibold text-[#c24135]">
                    {campaign.priority_label}
                  </span>
                )}
                <div className="mt-4 space-y-3 text-xs text-[#53677f]">
                  {[
                    ["Wilayah prioritas", priorityBreakdown.wilayah_prioritas, 25],
                    ["Kondisi fasilitas", priorityBreakdown.kondisi_fasilitas, 25],
                    ["Siswa terdampak", priorityBreakdown.siswa_terdampak, 20],
                    ["Akses pendidikan", priorityBreakdown.akses_pendidikan, 15],
                    ["Urgensi kebutuhan", priorityBreakdown.urgensi, 15],
                  ].map(([label, value, max]) => (
                    <div key={label} className="grid grid-cols-[120px_1fr_44px] items-center gap-3">
                      <span>{label}</span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-[#e7edf4]">
                        <span
                          className="block h-full rounded-full bg-[#17345B]"
                          style={{ width: `${value ? (value / max) * 100 : 0}%` }}
                        />
                      </span>
                      <strong className="text-right text-[#17345B]">
                        {value ?? "-"}/{max}
                      </strong>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "anggaran" && (
            <Card
              title="Rincian Anggaran"
              icon="💰"
              action={
                <div className="text-right">
                  <p className="text-xs text-[#718096]">Total kebutuhan</p>
                  <p className="text-lg font-bold text-[#17345B]">
                    {formatRupiah(campaign.target_amount)}
                  </p>
                </div>
              }
            >
              {campaign.rab_description ? (
                <div className="whitespace-pre-line rounded-lg bg-[#f7f9fb] p-4 text-sm leading-7 text-[#53677f]">
                  {campaign.rab_description}
                </div>
              ) : (
                <p className="text-sm text-[#667085]">Rincian anggaran belum tersedia.</p>
              )}
            </Card>
          )}

          {activeTab === "donasi" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Card
                title="Donasi Tercatat"
                icon="❤️"
                action={<span className="text-xs text-[#718096]">{donations.length} donasi</span>}
              >
                {donationLoadError ? (
                  <p role="alert" className="text-sm text-rose-700">
                    Riwayat donasi tidak dapat dimuat: {donationLoadError}
                  </p>
                ) : donations.length === 0 ? (
                  <p className="text-sm text-[#667085]">Belum ada donasi untuk kebutuhan ini.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-[#f7f9fb] text-xs text-[#718096]">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Tanggal</th>
                        <th className="px-3 py-2 text-right font-medium">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf0f4]">
                      {donations.map((donation) => (
                        <tr key={donation.id}>
                          <td className="px-3 py-2.5 text-[#53677f]">
                            {donation.created_at
                              ? new Date(donation.created_at).toLocaleDateString("id-ID")
                              : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-[#17345B]">
                            {formatRupiah(donation.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>

              <Card title="Laporan Dampak" icon="📋">
                {reportLoadError ? (
                  <p role="alert" className="text-sm text-rose-700">
                    Laporan tidak dapat dimuat: {reportLoadError}
                  </p>
                ) : reports.length === 0 ? (
                  <p className="text-sm text-[#667085]">
                    Belum ada laporan dari sekolah untuk kebutuhan ini.
                  </p>
                ) : (
                  <ul className="divide-y divide-[#edf0f4]">
                    {reports.map((report) => (
                      <li key={report.id} className="py-3 first:pt-0">
                        <p className="text-xs text-[#718096]">
                          {new Date(report.created_at).toLocaleDateString("id-ID")}
                        </p>
                        <h3 className="mt-1 font-semibold text-[#17345B]">{report.title}</h3>
                        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#53677f]">
                          {report.narrative}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                {isOwnerSchool && (
                  <form onSubmit={submitReport} className="mt-5 space-y-3 border-t border-[#edf0f4] pt-4">
                    <h3 className="text-sm font-semibold text-[#17345B]">Tambahkan laporan dampak</h3>
                    <input
                      required
                      value={reportTitle}
                      onChange={(event) => setReportTitle(event.target.value)}
                      placeholder="Judul laporan"
                      className="input rounded-lg"
                    />
                    <textarea
                      required
                      rows={3}
                      value={reportNarrative}
                      onChange={(event) => setReportNarrative(event.target.value)}
                      placeholder="Ceritakan penggunaan dan dampak bantuan"
                      className="input rounded-lg"
                    />
                    <button className="min-h-10 rounded-lg bg-[#17345B] px-4 text-sm font-semibold text-white transition hover:bg-[#102846]">
                      Kirim laporan
                    </button>
                    {reportStatus && (
                      <p role="status" className="text-sm text-[#53677f]">{reportStatus}</p>
                    )}
                  </form>
                )}
              </Card>
            </div>
          )}

          {activeTab === "sekolah" && (
            <Card
              title="Informasi Sekolah"
              icon="🏫"
              action={
                school?.source_url && (
                  <a
                    href={school.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#2d6fdc] hover:underline"
                  >
                    Lihat di Data Induk Pendidikan →
                  </a>
                )
              }
            >
              <div className="grid gap-5 md:grid-cols-[220px_1fr]">
                <div>
                  <p className="text-base font-bold text-[#17345B]">
                    {school?.name || campaign.school_name || "—"}
                  </p>
                  <p className="text-xs text-[#718096]">NPSN: {school?.npsn || "—"}</p>
                  {school?.data_source && (
                    <span className="mt-2 inline-block rounded-full bg-[#e8f6ee] px-2.5 py-1 text-[11px] font-semibold text-[#28734b]">
                      {school.data_source}
                    </span>
                  )}
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  {[
                    ["Jenjang & Status", school ? `${school.jenjang || "—"} • ${school.status_sekolah || "—"}` : "—"],
                    ["Jumlah Siswa", school?.jumlah_siswa != null ? `${school.jumlah_siswa} siswa` : "—"],
                    ["Jumlah Guru", school?.jumlah_guru != null ? `${school.jumlah_guru} guru` : "—"],
                    ["Wilayah Administrasi", location, "sm:col-span-2"],
                    ["Alamat", school?.alamat || "—"],
                    [
                      "Fasilitas (Data Induk)",
                      school?.fasilitas
                        ? typeof school.fasilitas === "object"
                          ? Object.entries(school.fasilitas)
                              .map(([k, v]) => `${k.replace("_", " ")}: ${v}`)
                              .join(" | ")
                          : school.fasilitas
                        : "—",
                      "sm:col-span-3",
                    ],
                  ].map(([label, value, span = ""]) => (
                    <div key={label} className={`rounded-lg border border-[#edf0f4] bg-[#fafbfc] p-3 ${span}`}>
                      <p className="text-[11px] text-[#7b8798]">{label}</p>
                      <p className="mt-1 font-semibold text-[#17345B]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {activeTab === "lokasi" && (
            <Card title="Lokasi Sekolah" icon="📍">
              <p className="mb-3 text-sm text-[#53677f]">{school?.alamat ? `${school.alamat}, ` : ""}{location}</p>
              {hasCoords ? (
                <div className="overflow-hidden rounded-xl border border-[#e1e7ee]">
                  <iframe
                    title="Peta lokasi sekolah"
                    className="h-[340px] w-full"
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(school.longitude) - 0.02},${Number(school.latitude) - 0.015},${Number(school.longitude) + 0.02},${Number(school.latitude) + 0.015}&layer=mapnik&marker=${school.latitude},${school.longitude}`}
                  />
                  <a
                    href={`https://www.google.com/maps?q=${school.latitude},${school.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block bg-[#f7f9fb] px-4 py-2.5 text-center text-sm font-semibold text-[#2d6fdc] hover:underline"
                  >
                    Buka di Google Maps ↗
                  </a>
                </div>
              ) : (
                <p className="text-sm text-[#667085]">Koordinat lokasi belum tersedia.</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
