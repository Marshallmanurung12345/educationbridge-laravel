import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, formatRupiah } from "../api";
import { useAuth } from "../context/AuthContext";
import schoolImage from "../assets/sekolah1.jpeg";

const donationPresets = [50000, 100000, 250000, 500000];
const donorRoles = ["individu", "perusahaan", "pemerintah"];
const fallbackImage = schoolImage;

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
  const image = campaign.image_url || fallbackImage;
  const tags = Array.isArray(campaign.tags) ? campaign.tags : [];
  const priorityBreakdown = campaign.priority_breakdown || {};

  return (
    <main className="bg-[#faf9f6] text-[#23364f]">
      <div className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 lg:py-12">
        <Link
          to="/kampanye"
          className="text-sm text-[#667085] hover:text-[#17365d]"
        >
          ← Kembali ke kebutuhan sekolah
        </Link>

        <section className="mt-6 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="relative overflow-hidden rounded-[16px]">
            <img
              src={image}
              alt={campaign.title}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102a4b]/75 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-6">
              <p className="text-sm font-bold">{campaign.school_name}</p>
              <p className="mt-1 text-xs text-white/80">
                ● {campaign.location}
              </p>
            </div>
            <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#17365d]">
              Lihat foto sekolah
            </span>
          </div>
          <div className="rounded-[16px] border border-[#e0e7ef] bg-white p-6 shadow-[0_8px_24px_rgba(23,54,93,0.06)] sm:p-7">
            <div className="flex flex-wrap gap-2">
              <span className="rounded bg-[#17365d] px-2.5 py-1 text-xs font-mono font-bold text-white">
                NPSN: {campaign.school?.npsn || "Data belum tersedia"}
              </span>
              <span className="rounded-full bg-[#fce4e4] px-3 py-1 text-[11px] font-bold text-[#d84747]">
                {campaign.priority_label || "Prioritas"}
              </span>
              <span className="rounded-full bg-[#e0f2fe] px-3 py-1 text-[11px] font-semibold text-[#0369a1]">
                ✓ Terverifikasi Official
              </span>
            </div>
            <h1 className="mt-3 font-display text-3xl leading-tight text-[#17365d] sm:text-4xl">
              {campaign.title}
            </h1>
            <p className="mt-2 text-sm font-semibold text-[#334155]">
              {campaign.school?.name || campaign.school_name}
            </p>
            <p className="mt-1 text-xs text-[#64748b]">
              📍{" "}
              {campaign.school
                ? `${campaign.school.kecamatan}, ${campaign.school.kabupaten_kota}, ${campaign.school.provinsi}`
                : campaign.location}
            </p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#e9edf2]">
              <div
                className="h-full bg-[#2d83c6]"
                style={{ width: `${campaign.progress_percent}%` }}
              />
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-bold text-[#17365d]">
                  {formatRupiah(campaign.raised_amount)}
                </p>
                <p className="mt-1 text-xs text-[#718096]">
                  terkumpul dari {formatRupiah(campaign.target_amount)}
                </p>
              </div>
              <p className="text-right text-xs text-[#718096]">
                {campaign.progress_percent}%<br />
                terpenuhi
              </p>
            </div>
            <div
              className="mt-5 grid grid-cols-2 gap-3 border-y border-[#edf0f4] py-4 text-sm text-[#5e7289]
            "
            >
              <div>
                <p className="text-lg font-bold text-[#17365d]">
                  {campaign.student_count}
                </p>
                <p className="text-xs">siswa terdampak</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#17365d]">
                  {campaign.end_date
                    ? new Date(campaign.end_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })
                    : "-"}
                </p>
                <p className="text-xs">batas bantuan</p>
              </div>
              <p className="col-span-2 border-t border-[#edf0f4] pt-3 text-xs">
                <strong className="text-[#17365d]">Periode:</strong>{" "}
                {dateLabel(campaign.start_date)} sampai{" "}
                {dateLabel(campaign.end_date)}
              </p>
            </div>
            <div className="mt-3 text-xs text-[#718096]">
              <strong className="text-[#17365d]">
                {donations.length} donasi
              </strong>{" "}
              sudah tercatat
            </div>

            {!user && (
              <div className="mt-6 border-t border-[#edf0f4] pt-5">
                <p className="text-sm leading-6 text-[#5e7289]">
                  Anda dapat melihat kebutuhan ini tanpa masuk. Untuk berdonasi,
                  silakan masuk atau buat akun terlebih dahulu.
                </p>
                <div className="mt-4 flex gap-3">
                  <Link
                    to="/masuk"
                    state={{ from: `/kampanye/${id}` }}
                    className="rounded-[9px] bg-[#17365d] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Masuk untuk Donasi
                  </Link>
                  <Link
                    to="/daftar"
                    state={{ from: `/kampanye/${id}` }}
                    className="rounded-[9px] border border-[#cbd5e1] px-4 py-2.5 text-sm font-semibold text-[#17365d]"
                  >
                    Daftar
                  </Link>
                </div>
              </div>
            )}
            {user && !donorRoles.includes(user.role) && (
              <p className="mt-6 border-t border-[#edf0f4] pt-5 text-sm leading-6 text-[#667085]">
                Akun dengan role {user.role} belum dapat menyalurkan donasi.
                Gunakan akun individu, perusahaan, atau pemerintah.
              </p>
            )}
            {user && donorRoles.includes(user.role) && (
              <form
                onSubmit={submitDonation}
                className="mt-6 border-t border-[#edf0f4] pt-5"
              >
                <p className="text-xs text-[#718096]">
                  Berdonasi sebagai {user.organization_name || user.name}
                </p>
                <label className="mt-4 block text-sm font-semibold text-[#344054]">
                  Pilih nominal
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {donationPresets.map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setAmount(preset)}
                      className={`rounded-[8px] border px-3 py-2 text-sm ${amount === preset ? "border-[#17365d] bg-[#edf4fb] font-semibold text-[#17365d]" : "border-[#d5dfe9] text-[#53677f]"}`}
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
                  onChange={(event) => setAmount(event.target.value)}
                  className="mt-3 w-full rounded-[8px] border border-[#d5dfe9] px-3 py-2.5 text-sm text-[#17365d]"
                  placeholder="Nominal lainnya"
                />
                <label className="mt-4 block text-sm font-semibold text-[#344054]">
                  Metode pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="mt-2 w-full rounded-[8px] border border-[#d5dfe9] bg-white px-3 py-2.5 text-sm text-[#17365d]"
                >
                  <option value="transfer_bank">Transfer bank</option>
                  <option value="e_wallet">E-wallet</option>
                </select>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={2}
                  className="mt-4 w-full rounded-[8px] border border-[#d5dfe9] px-3 py-2.5 text-sm"
                  placeholder="Pesan untuk sekolah (opsional)"
                />
                <button className="mt-4 w-full rounded-[9px] bg-[#e3a22f] py-3 font-semibold text-[#17365d] hover:bg-[#f0b94f]">
                  Bantu Sekarang
                </button>
                {status && (
                  <p className="mt-3 text-sm text-[#258a5b]">{status}</p>
                )}
                {error && (
                  <p className="mt-3 text-sm text-[#c24135]">{error}</p>
                )}
              </form>
            )}
          </div>
        </section>

        {/* SECTION: DATA INDUK SEKOLAH RESMI (PEMERINTAH) */}
        <section className="mt-10 rounded-2xl border border-blue-200 bg-blue-50/50 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-200 pb-4">
            <div>
              <span className="inline-block rounded bg-blue-700 px-2.5 py-1 text-xs font-bold text-white uppercase tracking-wider">
                Identitas Resmi Government
              </span>
              <h2 className="mt-2 text-2xl font-bold text-[#17365d]">
                Data Induk Sekolah (Kemendikdasmen)
              </h2>
            </div>
            <div className="text-right text-xs text-blue-900">
              <span className="block font-semibold">Sumber Data Sekolah:</span>
              <a
                href={
                  campaign.school?.source_url ||
                  "https://data.kemendikdasmen.go.id/data-induk"
                }
                target="_blank"
                rel="noreferrer"
                className="font-bold text-blue-700 underline"
              >
                {campaign.school?.data_source ||
                  "Data Induk Pendidikan Kemendikdasmen"}
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-3.5 border border-slate-200 shadow-sm">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                NPSN Asli
              </span>
              <strong className="mt-1 block font-mono text-base text-[#17365d]">
                {campaign.school?.npsn || "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg bg-white p-3.5 border border-slate-200 shadow-sm">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                Nama Resmi Sekolah
              </span>
              <strong className="mt-1 block text-sm text-[#17365d]">
                {campaign.school?.name ||
                  campaign.school_name ||
                  "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg bg-white p-3.5 border border-slate-200 shadow-sm">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                Jenjang & Status
              </span>
              <strong className="mt-1 block text-sm text-[#17365d]">
                {campaign.school?.jenjang || "Data belum tersedia"} ·{" "}
                {campaign.school?.status_sekolah || "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg bg-white p-3.5 border border-slate-200 shadow-sm">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                Status Wilayah 3T
              </span>
              <strong
                className={`mt-1 block text-sm ${campaign.school?.is_3t ? "text-red-600 font-bold" : "text-slate-700"}`}
              >
                {campaign.school
                  ? campaign.school.is_3t
                    ? campaign.school.status_3t_detail || "Wilayah 3T Official"
                    : "Bukan Wilayah 3T"
                  : "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg bg-white p-3.5 border border-slate-200 shadow-sm lg:col-span-2">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                Wilayah Administrasi
              </span>
              <strong className="mt-1 block text-sm text-[#17365d]">
                {campaign.school
                  ? `Kec. ${campaign.school.kecamatan}, ${campaign.school.kabupaten_kota}, Prov. ${campaign.school.provinsi}`
                  : "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg bg-white p-3.5 border border-slate-200 shadow-sm lg:col-span-2">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                Alamat Jalan
              </span>
              <strong className="mt-1 block text-sm text-[#17365d]">
                {campaign.school?.alamat || "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg bg-white p-3.5 border border-slate-200 shadow-sm">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                Jumlah Siswa
              </span>
              <strong className="mt-1 block text-sm text-[#17365d]">
                {campaign.school?.jumlah_siswa != null
                  ? `${campaign.school.jumlah_siswa} Siswa`
                  : "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg bg-white p-3.5 border border-slate-200 shadow-sm">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                Jumlah Guru
              </span>
              <strong className="mt-1 block text-sm text-[#17365d]">
                {campaign.school?.jumlah_guru != null
                  ? `${campaign.school.jumlah_guru} Guru`
                  : "Data belum tersedia"}
              </strong>
            </div>

            <div className="rounded-lg bg-white p-3.5 border border-slate-200 shadow-sm lg:col-span-2">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                Koordinat Lokasi
              </span>
              <strong className="mt-1 block font-mono text-xs text-[#17365d]">
                {campaign.school?.latitude && campaign.school?.longitude
                  ? `Lat: ${campaign.school.latitude}, Long: ${campaign.school.longitude}`
                  : "Data belum tersedia"}
              </strong>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-white p-4 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700 uppercase block mb-1">
              Catatan Fasilitas Official (Data Induk):
            </span>
            <p className="text-slate-600">
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

        <section className="mt-14 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b27a1d]">
              Cerita kebutuhan
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl leading-tight text-[#17365d] sm:text-[2.15rem]">
              Mengapa sekolah ini membutuhkan dukungan?
            </h2>
            <p className="mt-5 max-w-[650px] text-[15px] leading-8 text-[#425873]">
              {campaign.description}
            </p>
            <p className="mt-4 max-w-[650px] text-[15px] leading-8 text-[#425873]">
              Dukungan yang terkumpul akan membantu sekolah menyediakan
              lingkungan belajar yang lebih layak bagi siswa.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#d9e2eb] px-3 py-1 text-xs text-[#667085]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="border-l-2 border-[#d6a331] pl-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718096]">
              Priority Score
            </p>
            <p className="mt-3 text-5xl font-bold text-[#17365d]">
              {campaign.priority_score}
              <span className="text-xl font-normal text-[#8b98a8]"> / 100</span>
            </p>
            <p className="mt-2 font-semibold text-[#d84747]">
              {campaign.priority_label}
            </p>
            <p className="mt-4 text-sm leading-7 text-[#687b90]">
              Skor menunjukkan tingkat urgensi berdasarkan indikator pendidikan
              dan kondisi yang telah diverifikasi.
            </p>
            <div className="mt-5 space-y-2 text-xs text-[#526a83]">
              {[
                ["Wilayah prioritas", priorityBreakdown.wilayah_prioritas, 25],
                ["Kondisi fasilitas", priorityBreakdown.kondisi_fasilitas, 25],
                ["Siswa terdampak", priorityBreakdown.siswa_terdampak, 20],
                ["Akses pendidikan", priorityBreakdown.akses_pendidikan, 15],
                ["Urgensi", priorityBreakdown.urgensi, 15],
              ].map(([label, value, max]) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-[#dbe7f4] pb-2"
                >
                  <span className="flex flex-1 items-center gap-3">
                    <span className="h-1.5 flex-1 bg-[#e7edf4]">
                      <span
                        className="block h-full bg-[#2d70b3]"
                        style={{ width: `${value ? (value / max) * 100 : 0}%` }}
                      />
                    </span>
                    {label}
                  </span>
                  <strong className="ml-3 text-[#17365d]">
                    {value ?? "-"}/{max}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl text-[#17365d]">
            Donasi terbaru
          </h2>
          {donations.length === 0 ? (
            <p className="mt-3 text-sm text-[#718096]">
              Belum ada donasi. Jadilah yang pertama membantu kebutuhan ini.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#edf0f4]">
              {donations.map((donation) => (
                <li
                  key={donation.id}
                  className="flex justify-between gap-4 py-3 text-sm"
                >
                  <span className="text-[#53677f]">{donation.donor_name}</span>
                  <span className="font-semibold text-[#17365d]">
                    {formatRupiah(donation.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {isOwnerSchool && (
          <section className="mt-12 border-t border-[#e5e9ee] pt-8">
            <h2 className="font-display text-2xl text-[#17365d]">
              Tambahkan laporan dampak
            </h2>
            <form onSubmit={submitReport} className="mt-5 max-w-2xl space-y-3">
              <input
                required
                value={reportTitle}
                onChange={(event) => setReportTitle(event.target.value)}
                placeholder="Judul laporan"
                className="input"
              />
              <textarea
                required
                rows={4}
                value={reportNarrative}
                onChange={(event) => setReportNarrative(event.target.value)}
                placeholder="Ceritakan penggunaan dan dampak bantuan"
                className="input"
              />
              <button className="rounded-[9px] bg-[#17365d] px-4 py-2.5 text-sm font-semibold text-white">
                Kirim laporan
              </button>
              {reportStatus && (
                <p className="text-sm text-[#53677f]">{reportStatus}</p>
              )}
            </form>
          </section>
        )}

        <section className="mt-12 border-t border-[#e5e9ee] pt-8">
          <h2 className="font-display text-2xl text-[#17365d]">
            Laporan dampak
          </h2>
          {reports.length === 0 ? (
            <p className="mt-3 text-sm text-[#718096]">
              Belum ada laporan dari sekolah untuk kebutuhan ini.
            </p>
          ) : (
            <ul className="mt-4 space-y-5">
              {reports.map((report) => (
                <li
                  key={report.id}
                  className="border-l-2 border-[#d6a331] pl-4"
                >
                  <p className="text-xs text-[#718096]">
                    {new Date(report.created_at).toLocaleDateString("id-ID")}
                  </p>
                  <h3 className="mt-1 font-semibold text-[#17365d]">
                    {report.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#687b90]">
                    {report.narrative}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
