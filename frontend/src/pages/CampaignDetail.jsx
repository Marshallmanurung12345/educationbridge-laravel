import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatRupiah } from "../api";
import { useAuth } from "../context/AuthContext";

const donationPresets = [50000, 100000, 250000, 500000];
const donorRoles = ["individu", "perusahaan", "pemerintah"];

function dateLabel(value) {
  return value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Belum ditentukan";
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
  const [amount, setAmount] = useState(100000);
  const [paymentMethod, setPaymentMethod] = useState("transfer_bank");
  const [message, setMessage] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportNarrative, setReportNarrative] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

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

  const isOwnerSchool =
    user?.role === "sekolah" && user.id === campaign.user_id;
  const image = campaign.image_url;
  const tags = Array.isArray(campaign.tags) ? campaign.tags : [];
  const priorityBreakdown = campaign.priority_breakdown || {};
  const progressPercent = Math.min(
    100,
    Math.max(0, Number(campaign.progress_percent) || 0),
  );

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#23364f]">
      <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link
          to="/kampanye"
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#53677f] transition hover:text-[#17365d]"
        >
          <span aria-hidden="true">←</span>
          Kembali ke daftar kebutuhan
        </Link>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.04fr_0.96fr] lg:items-start lg:gap-7">
          <div className="min-w-0 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-[#e1e7ee] bg-white shadow-sm">
              {image && !imageFailed ? (
                <img
                  src={image}
                  alt={`Foto dokumentasi kebutuhan: ${campaign.title}`}
                  onError={() => setImageFailed(true)}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div
                  role="img"
                  aria-label="Foto dokumentasi belum tersedia"
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-3 bg-[#eef2f6] px-6 text-center text-sm text-[#667085]"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-10 w-10 fill-none stroke-current text-[#8795a6]"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="8.5" cy="9" r="1.5" />
                    <path d="m21 15-5-5L5 20" />
                  </svg>
                  <span>Foto dokumentasi belum tersedia</span>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[#e1e7ee] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                {campaign.status === "verified" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf7f1] px-3 py-1 text-xs font-semibold text-[#28734b]">
                    <span aria-hidden="true">✓</span> Terverifikasi
                  </span>
                )}
                {campaign.priority_label && (
                  <span className="rounded-full bg-[#fff5e9] px-3 py-1 text-xs font-semibold text-[#9a5a12]">
                    {campaign.priority_label}
                  </span>
                )}
                {campaign.category && (
                  <span className="rounded-full border border-[#e1e7ee] px-3 py-1 text-xs text-[#53677f]">
                    {campaign.category}
                  </span>
                )}
              </div>
              <h1 className="mt-3 break-words font-display text-2xl leading-tight text-[#17345B] sm:text-[1.8rem]">
                {campaign.title}
              </h1>
              <p className="mt-2 text-sm font-semibold text-[#344054]">
                {campaign.school?.name || campaign.school_name || "Nama sekolah belum tersedia"}
              </p>
              <p className="mt-1 flex items-start gap-2 text-sm leading-5 text-[#667085]">
                <span aria-hidden="true" className="text-[#F28C28]">⌖</span>
                <span>
                  {campaign.school
                    ? [campaign.school.kecamatan, campaign.school.kabupaten_kota, campaign.school.provinsi]
                        .filter(Boolean)
                        .join(", ") || "Lokasi belum tersedia"
                    : campaign.location || "Lokasi belum tersedia"}
                </span>
              </p>
              <div className="mt-4 grid gap-3 border-t border-[#edf0f4] pt-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-[#7b8798]">NPSN</p>
                  <p className="mt-1 font-medium text-[#344054]">
                    {campaign.school?.npsn || "Data belum tersedia"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#7b8798]">Informasi wilayah</p>
                  <p className="mt-1 font-medium text-[#344054]">
                    {campaign.school
                      ? campaign.school.is_3t === true
                        ? campaign.school.status_3t_detail || "Wilayah 3T"
                        : campaign.school.is_3t === false
                          ? "Bukan wilayah 3T"
                          : "Data belum tersedia"
                      : "Data belum tersedia"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="min-w-0 rounded-2xl border border-[#e1e7ee] bg-white p-5 shadow-[0_8px_24px_rgba(23,52,91,0.06)] sm:p-6 lg:p-7">
            <p className="text-sm font-semibold text-[#53677f]">Dukung kebutuhan ini</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-2xl font-bold tracking-tight text-[#17345B] sm:text-[1.75rem]">
                  {formatRupiah(campaign.raised_amount)}
                </p>
                <p className="mt-1 text-xs text-[#718096]">
                  terkumpul dari {formatRupiah(campaign.target_amount)}
                </p>
              </div>
              <p className="shrink-0 text-right text-lg font-bold text-[#17345B]">
                {progressPercent}%
                <span className="block text-xs font-normal text-[#718096]">terpenuhi</span>
              </p>
            </div>
            <div
              role="progressbar"
              aria-label="Progress dana terkumpul"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={progressPercent}
              className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e9edf2]"
            >
              <div
                className="h-full rounded-full bg-[#F28C28] transition-[width]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-y border-[#edf0f4] py-4">
              <div>
                <p className="text-lg font-bold text-[#17345B]">
                  {campaign.student_count ?? "—"}
                </p>
                <p className="text-xs text-[#718096]">siswa terdampak</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#17345B]">
                  {campaign.end_date
                    ? new Date(campaign.end_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Belum ditentukan"}
                </p>
                <p className="text-xs text-[#718096]">batas waktu</p>
              </div>
              <p className="col-span-2 border-t border-[#edf0f4] pt-3 text-xs text-[#718096]">
                Periode: {dateLabel(campaign.start_date)} – {dateLabel(campaign.end_date)}
              </p>
            </div>
            <p className="mt-3 text-xs text-[#718096]">
              <strong className="text-[#17345B]">{donations.length} donasi</strong> tercatat
            </p>

            {!user && (
              <div className="mt-5 border-t border-[#edf0f4] pt-5">
                <p className="text-sm leading-6 text-[#5e7289]">
                  Masuk atau buat akun untuk melanjutkan donasi.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to="/masuk"
                    state={{ from: `/kampanye/${id}` }}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#17345B] px-4 text-sm font-semibold text-white transition hover:bg-[#102846]"
                  >
                    Masuk untuk Donasi
                  </Link>
                  <Link
                    to="/daftar"
                    state={{ from: `/kampanye/${id}` }}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d5dfe9] px-4 text-sm font-semibold text-[#17345B] transition hover:bg-[#f7f9fb]"
                  >
                    Daftar
                  </Link>
                </div>
              </div>
            )}
            {user && !donorRoles.includes(user.role) && (
              <p className="mt-5 border-t border-[#edf0f4] pt-5 text-sm leading-6 text-[#667085]">
                Akun dengan role {user.role} belum dapat menyalurkan donasi.
                Gunakan akun individu, perusahaan, atau pemerintah.
              </p>
            )}
            {user && donorRoles.includes(user.role) && (
              <form
                onSubmit={submitDonation}
                className="mt-5 border-t border-[#edf0f4] pt-5"
              >
                <p className="text-xs text-[#718096]">
                  Berdonasi sebagai{" "}
                  <strong className="text-[#344054]">
                    {user.organization_name || user.name}
                  </strong>
                </p>
                <label className="mt-4 block text-sm font-semibold text-[#344054]">
                  Pilih nominal donasi
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {donationPresets.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setAmount(preset)}
                      aria-pressed={amount === preset}
                      className={`flex min-h-11 items-center justify-center rounded-lg border px-2 text-sm transition ${
                        amount === preset
                          ? "border-[#17345B] bg-[#edf4fb] font-semibold text-[#17345B]"
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
                  onChange={(event) => setAmount(event.target.value)}
                  className="mt-3 min-h-11 w-full rounded-lg border border-[#d5dfe9] px-3 py-2.5 text-sm text-[#17345B] focus:border-[#17345B] focus:outline-none"
                  placeholder="Nominal lainnya (min. Rp 10.000)"
                />
                <label className="mt-4 block text-sm font-semibold text-[#344054]">
                  Metode pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="mt-2 min-h-11 w-full rounded-lg border border-[#d5dfe9] bg-white px-3 py-2.5 text-sm text-[#17345B] focus:border-[#17345B] focus:outline-none"
                >
                  <option value="transfer_bank">Transfer bank</option>
                  <option value="e_wallet">E-wallet</option>
                </select>
                <label htmlFor="donation-message" className="sr-only">
                  Pesan untuk sekolah (opsional)
                </label>
                <textarea
                  id="donation-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={2}
                  className="mt-3 w-full resize-y rounded-lg border border-[#d5dfe9] px-3 py-2.5 text-sm focus:border-[#17345B] focus:outline-none"
                  placeholder="Pesan untuk sekolah (opsional)"
                />
                <p className="mt-3 rounded-lg bg-[#f7f9fb] px-3 py-2.5 text-xs leading-5 text-[#667085]">
                  Metode pembayaran dicatat bersama donasi. Pembayaran belum diproses otomatis di halaman ini.
                </p>
                <button className="mt-4 min-h-12 w-full rounded-lg bg-[#F28C28] px-4 text-sm font-semibold text-white transition hover:bg-[#dc7616] focus-visible:outline-[#17345B]">
                  Lanjutkan Donasi
                </button>
                {status && (
                  <p role="status" className="mt-3 text-sm text-[#258a5b]">{status}</p>
                )}
                {error && (
                  <p role="alert" className="mt-3 text-sm text-[#c24135]">{error}</p>
                )}
              </form>
            )}
          </aside>
        </section>

        <nav
          aria-label="Bagian informasi kebutuhan"
          className="mt-8 flex gap-1 overflow-x-auto border-b border-[#dfe5eb] text-sm"
        >
          {[
            ["#tentang-kebutuhan", "Tentang Kebutuhan"],
            ["#anggaran-rab", "Rincian Anggaran"],
            ["#laporan-dampak", "Laporan & Transparansi"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="shrink-0 border-b-2 border-transparent px-3 py-3 font-medium text-[#667085] transition hover:border-[#F28C28] hover:text-[#17345B] sm:px-4"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* SECTION: DATA INDUK SEKOLAH RESMI (PEMERINTAH) */}
        <section className="mt-6 rounded-2xl border border-[#e1e7ee] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f4] pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9a6b1c]">Identitas sekolah</p>
              <h2 className="mt-1 text-xl font-semibold text-[#17345B]">Informasi sekolah</h2>
            </div>
            <div className="text-xs text-[#667085] sm:text-right">
              <span className="block font-medium text-[#53677f]">Sumber data</span>
              {campaign.school?.data_source && campaign.school?.source_url ? (
                <a
                  href={campaign.school.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#17345B] underline underline-offset-2"
                >
                  {campaign.school.data_source}
                </a>
              ) : (
                <span>Data belum tersedia</span>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-[#edf0f4] bg-[#fafbfc] p-3.5">
              <span className="block text-[11px] font-semibold uppercase text-[#7b8798]">
                NPSN Asli
              </span>
              <strong className="mt-1 block font-mono text-sm text-[#17345B]">
                {campaign.school?.npsn || "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg border border-[#edf0f4] bg-[#fafbfc] p-3.5">
              <span className="block text-[11px] font-semibold uppercase text-[#7b8798]">
                Nama Resmi Sekolah
              </span>
              <strong className="mt-1 block text-sm text-[#17345B]">
                {campaign.school?.name ||
                  campaign.school_name ||
                  "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg border border-[#edf0f4] bg-[#fafbfc] p-3.5">
              <span className="block text-[11px] font-semibold uppercase text-[#7b8798]">
                Jenjang & Status
              </span>
              <strong className="mt-1 block text-sm text-[#17345B]">
                {campaign.school?.jenjang || "Data belum tersedia"} ·{" "}
                {campaign.school?.status_sekolah || "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg border border-[#edf0f4] bg-[#fafbfc] p-3.5">
              <span className="block text-[11px] font-semibold uppercase text-[#7b8798]">
                Status Wilayah 3T
              </span>
              <strong
                className="mt-1 block text-sm font-medium text-[#344054]"
              >
                {campaign.school
                  ? campaign.school.is_3t
                    ? campaign.school.status_3t_detail || "Wilayah 3T Official"
                    : campaign.school.is_3t === false
                      ? "Bukan Wilayah 3T"
                      : "Data belum tersedia"
                  : "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg border border-[#edf0f4] bg-[#fafbfc] p-3.5 lg:col-span-2">
              <span className="block text-[11px] font-semibold uppercase text-[#7b8798]">
                Wilayah Administrasi
              </span>
              <strong className="mt-1 block text-sm text-[#17345B]">
                {campaign.school
                  ? `Kec. ${campaign.school.kecamatan}, ${campaign.school.kabupaten_kota}, Prov. ${campaign.school.provinsi}`
                  : "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg border border-[#edf0f4] bg-[#fafbfc] p-3.5 lg:col-span-2">
              <span className="block text-[11px] font-semibold uppercase text-[#7b8798]">
                Alamat Jalan
              </span>
              <strong className="mt-1 block text-sm text-[#17345B]">
                {campaign.school?.alamat || "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg border border-[#edf0f4] bg-[#fafbfc] p-3.5">
              <span className="block text-[11px] font-semibold uppercase text-[#7b8798]">
                Jumlah Siswa
              </span>
              <strong className="mt-1 block text-sm text-[#17345B]">
                {campaign.school?.jumlah_siswa != null
                  ? `${campaign.school.jumlah_siswa} Siswa`
                  : "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg border border-[#edf0f4] bg-[#fafbfc] p-3.5">
              <span className="block text-[11px] font-semibold uppercase text-[#7b8798]">
                Jumlah Guru
              </span>
              <strong className="mt-1 block text-sm text-[#17345B]">
                {campaign.school?.jumlah_guru != null
                  ? `${campaign.school.jumlah_guru} Guru`
                  : "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg border border-[#edf0f4] bg-[#fafbfc] p-3.5 lg:col-span-2">
              <span className="block text-[11px] font-semibold uppercase text-[#7b8798]">
                Koordinat Lokasi
              </span>
              <strong className="mt-1 block font-mono text-xs text-[#17345B]">
                {campaign.school?.latitude && campaign.school?.longitude
                  ? `Lat: ${campaign.school.latitude}, Long: ${campaign.school.longitude}`
                  : "Data belum tersedia"}
              </strong>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-[#edf0f4] bg-[#fafbfc] p-4 text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase text-[#7b8798]">
              Catatan Fasilitas Official (Data Induk):
            </span>
            <p className="text-[#53677f]">
              {campaign.school?.fasilitas
                ? typeof campaign.school.fasilitas === "object"
                  ? Object.entries(campaign.school.fasilitas)
                      .map(([k, v]) => `${k.replace("_", " ")}: ${v}`)
                      .join(" | ")
                  : campaign.school.fasilitas
                : "Data belum tersedia"}
            </p>
          </div>
        </section>

        <section
          id="tentang-kebutuhan"
          className="mt-8 scroll-mt-24 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]"
        >
          <div className="rounded-2xl border border-[#e1e7ee] bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#9a6b1c]">
              Tentang kebutuhan
            </p>
            <h2 className="mt-1 font-display text-2xl leading-tight text-[#17345B]">
              Deskripsi kebutuhan
            </h2>
            {campaign.description ? (
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#53677f]">
                {campaign.description}
              </p>
            ) : (
              <p className="mt-4 rounded-lg bg-[#f7f9fb] px-4 py-3 text-sm text-[#667085]">
                Deskripsi kebutuhan belum tersedia.
              </p>
            )}
            {tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-[#edf0f4] pt-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#d9e2eb] bg-[#fafbfc] px-3 py-1 text-xs text-[#53677f]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <aside className="rounded-2xl border border-[#e1e7ee] bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7b8798]">
              Indikator prioritas
            </p>
            <p className="mt-2 text-3xl font-bold text-[#17345B]">
              {campaign.priority_score ?? "—"}
              <span className="ml-1 text-base font-medium text-[#7b8798]">/ 100</span>
            </p>
            {campaign.priority_label && (
              <p className="mt-1 text-sm font-semibold text-[#9a5a12]">
                {campaign.priority_label}
              </p>
            )}
            <p className="mt-3 text-xs leading-5 text-[#718096]">
              Skor dihitung dari indikator prioritas yang tercatat pada pengajuan.
            </p>
            <div className="mt-4 space-y-2.5 text-xs text-[#53677f]">
              {[
                ["Wilayah prioritas", priorityBreakdown.wilayah_prioritas, 25],
                ["Kondisi fasilitas", priorityBreakdown.kondisi_fasilitas, 25],
                ["Siswa terdampak", priorityBreakdown.siswa_terdampak, 20],
                ["Akses pendidikan", priorityBreakdown.akses_pendidikan, 15],
                ["Urgensi", priorityBreakdown.urgensi, 15],
              ].map(([label, value, max]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 border-b border-[#edf0f4] pb-2"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="h-1.5 min-w-8 flex-1 overflow-hidden rounded-full bg-[#e7edf4]">
                      <span
                        className="block h-full rounded-full bg-[#2d70b3]"
                        style={{ width: `${value ? (value / max) * 100 : 0}%` }}
                      />
                    </span>
                    <span className="shrink-0">{label}</span>
                  </span>
                  <strong className="shrink-0 text-[#17345B]">
                    {value ?? "-"}/{max}
                  </strong>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section
          id="anggaran-rab"
          className="mt-5 scroll-mt-24 rounded-2xl border border-[#e1e7ee] bg-white p-5 shadow-sm sm:p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9a6b1c]">
            Penggunaan dana
          </p>
          <h2 className="mt-1 font-display text-2xl text-[#17345B]">
            Rincian anggaran
          </h2>
          {campaign.rab_description ? (
            <div className="mt-4 whitespace-pre-line rounded-lg bg-[#f7f9fb] p-4 text-sm leading-7 text-[#53677f]">
              {campaign.rab_description}
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-[#f7f9fb] px-4 py-3 text-sm text-[#667085]">
              Rincian anggaran belum tersedia.
            </p>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-[#e1e7ee] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9a6b1c]">
                Transparansi
              </p>
              <h2 className="mt-1 font-display text-2xl text-[#17345B]">
                Donasi tercatat
              </h2>
            </div>
            <span className="text-sm text-[#667085]">{donations.length} donasi</span>
          </div>
          {donationLoadError ? (
            <p role="alert" className="mt-4 text-sm text-rose-700">
              Riwayat donasi tidak dapat dimuat: {donationLoadError}
            </p>
          ) : donations.length === 0 ? (
            <p className="mt-4 rounded-lg bg-[#f7f9fb] px-4 py-3 text-sm text-[#667085]">
              Belum ada donasi yang tercatat untuk kebutuhan ini.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#edf0f4]">
              {donations.map((donation) => (
                <li
                  key={donation.id}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <span className="text-[#53677f]">Donasi tercatat</span>
                  <span className="font-semibold text-[#17365d]">
                    {formatRupiah(donation.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          id="laporan-dampak"
          className="mt-5 scroll-mt-24 rounded-2xl border border-[#e1e7ee] bg-white p-5 shadow-sm sm:p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9a6b1c]">
            Laporan & transparansi
          </p>
          <h2 className="mt-1 font-display text-2xl text-[#17345B]">
            Laporan dampak
          </h2>
          {reportLoadError ? (
            <p role="alert" className="mt-4 text-sm text-rose-700">
              Laporan penggunaan dana tidak dapat dimuat: {reportLoadError}
            </p>
          ) : reports.length === 0 ? (
            <p className="mt-4 rounded-lg bg-[#f7f9fb] px-4 py-3 text-sm text-[#667085]">
              Belum ada laporan dari sekolah untuk kebutuhan ini.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#edf0f4]">
              {reports.map((report) => (
                <li
                  key={report.id}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <p className="text-xs text-[#718096]">
                    {new Date(report.created_at).toLocaleDateString("id-ID")}
                  </p>
                  <h3 className="mt-1 font-semibold text-[#17345B]">
                    {report.title}
                  </h3>
                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#53677f]">
                    {report.narrative}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {isOwnerSchool && (
            <div className="mt-6 border-t border-[#edf0f4] pt-5">
              <h3 className="text-base font-semibold text-[#17345B]">
                Tambahkan laporan dampak
              </h3>
              <form onSubmit={submitReport} className="mt-4 max-w-2xl space-y-3">
                <input
                  required
                  value={reportTitle}
                  onChange={(event) => setReportTitle(event.target.value)}
                  placeholder="Judul laporan"
                  className="input rounded-lg"
                />
                <textarea
                  required
                  rows={4}
                  value={reportNarrative}
                  onChange={(event) => setReportNarrative(event.target.value)}
                  placeholder="Ceritakan penggunaan dan dampak bantuan"
                  className="input rounded-lg"
                />
                <button className="min-h-11 rounded-lg bg-[#17345B] px-4 text-sm font-semibold text-white transition hover:bg-[#102846]">
                  Kirim laporan
                </button>
                {reportStatus && (
                  <p role="status" className="text-sm text-[#53677f]">{reportStatus}</p>
                )}
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
