import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatRupiah } from "../api";

const statusLabels = {
  pending: "Menunggu Verifikasi",
  needs_revision: "Perlu Revisi",
  verified: "Disetujui",
  rejected: "Ditolak",
  completed: "Selesai",
  suspended: "Ditangguhkan",
};
const paymentMethodLabels = {
  transfer_bank: "Transfer bank",
  e_wallet: "E-wallet",
  bank_bca: "BCA",
  bank_mandiri: "Mandiri",
  bank_bni: "BNI",
  bank_bri: "BRI",
  bank_bsi: "BSI",
  bank_btn: "BTN",
  bank_cimb_niaga: "CIMB Niaga",
  bank_ocbc: "OCBC",
  bank_danamon: "Danamon",
  bank_permata: "Permata",
  bank_lainnya: "Bank lainnya",
  bank_transfer: "Transfer bank",
  gopay: "GoPay",
  qris: "QRIS",
  shopeepay: "ShopeePay",
  credit_card: "Kartu kredit",
};
const paymentStatusLabels = {
  pending: "Menunggu Pembayaran",
  success: "Berhasil",
  failed: "Gagal",
  unverified: "Belum Terverifikasi",
};

function dateLabel(value) {
  return value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Tanggal belum tersedia";
}

function StatusBadge({ status }) {
  const colors = {
    pending: "bg-amber-50 text-amber-800",
    needs_revision: "bg-orange-50 text-orange-800",
    verified: "bg-emerald-50 text-emerald-800",
    rejected: "bg-rose-50 text-rose-800",
    completed: "bg-slate-100 text-slate-700",
    suspended: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status] || "bg-slate-100 text-slate-700"}`}
    >
      {statusLabels[status] || "Status belum tersedia"}
    </span>
  );
}

export default function DonorDashboard() {
  const [donationData, setDonationData] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  const [donationError, setDonationError] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [loadedPage, setLoadedPage] = useState(0);
  const [page, setPage] = useState(1);
  const loading = loadedPage !== page;

  useEffect(() => {
    let active = true;

    Promise.allSettled([api.myDonations(), api.mySubmissions(page)]).then(
      ([donationResult, submissionResult]) => {
        if (!active) return;
        if (donationResult.status === "fulfilled") {
          setDonationData(donationResult.value);
          setDonationError("");
        } else {
          setDonationError(donationResult.reason.message);
        }
        if (submissionResult.status === "fulfilled") {
          setSubmissionData(submissionResult.value);
          setSubmissionError("");
        } else {
          setSubmissionError(submissionResult.reason.message);
        }
        setLoadedPage(page);
      },
    );

    return () => {
      active = false;
    };
  }, [page]);

  const submissions = submissionData?.campaigns?.data || [];
  const donations = donationData?.donations || [];
  const summary = submissionData?.summary || {};
  const pagination = submissionData?.campaigns;

  return (
    <main className="min-h-screen min-w-0 bg-[#F7F8FA] px-4 py-8 text-[#17345B] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-[#E3E8EF] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9a6b1c]">
              Ruang Donatur
            </p>
            <h1 className="page-title mt-1">
              Donasi Saya
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
              Ringkasan donasi, pengajuan, dan aktivitas akun Anda.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to="/kampanye"
              className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-[#F28C28] px-4 text-center text-sm font-semibold text-white hover:bg-[#DB7415] sm:w-auto"
            >
              Cari Kebutuhan
            </Link>
            <Link
              to="/ajukan"
              className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[#C9D3DF] bg-white px-4 text-center text-sm font-semibold text-[#17345B] hover:bg-[#F1F4F8] sm:w-auto"
            >
              Ajukan Kebutuhan Sekolah
            </Link>
          </div>
        </header>

        <p className="mt-4 rounded-lg border border-[#D9E4F0] bg-white px-4 py-3 text-xs leading-5 text-[#667085]">
          Ringkasan donasi berasal dari catatan transaksi pada EducationBridge.
          Pencatatan ini bukan konfirmasi pembayaran dari penyedia pembayaran.
        </p>

        <section
          aria-label="Ringkasan donatur"
          className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {[
            ["Total Donasi Tercatat", formatRupiah(donationData?.total_donated), donationData?.total_donated != null],
            ["Transaksi Donasi", donationData?.total_donation_count, donationData?.total_donation_count != null],
            ["Kebutuhan Didukung", donationData?.campaigns_supported, donationData?.campaigns_supported != null],
            ["Pengajuan Kebutuhan", summary.total_submissions, summary.total_submissions != null],
          ].map(([label, value, available]) => (
            <article
              key={label}
              className="rounded-xl border border-[#E3E8EF] bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-medium text-[#667085]">{label}</p>
              <p className="mt-2 break-words text-xl font-semibold text-[#17345B]">
                {available ? value : loading ? <LoadingState label={`Memuat ${label.toLocaleLowerCase("id-ID")}`} /> : "Data belum tersedia"}
              </p>
            </article>
          ))}
        </section>

        <section id="pengajuan-saya" className="mt-8 rounded-xl border border-[#E3E8EF] bg-white">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#E9EDF2] px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-lg font-semibold">Pengajuan Saya</h2>
              <p className="mt-1 text-sm text-[#667085]">
                Status dan catatan pemeriksaan admin untuk pengajuan Anda.
              </p>
            </div>
            {summary.total_submissions > 0 && (
              <span className="text-xs text-[#667085]">
                {summary.pending || 0} menunggu · {summary.needs_revision || 0} perlu revisi
              </span>
            )}
          </div>

          {submissionError ? (
            <p role="alert" className="px-5 py-6 text-sm text-rose-700">
              Pengajuan tidak dapat dimuat: {submissionError}
            </p>
          ) : loading ? (
            <LoadingPanel label="Memuat pengajuan Anda" />
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-5 text-center sm:flex-row sm:justify-between sm:px-5">
              <p className="text-sm font-medium text-[#344054]">
                Belum ada pengajuan kebutuhan. Anda dapat mengajukan kebutuhan sekolah kapan saja.
              </p>
              <Link
                to="/ajukan"
                className="inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-lg border border-[#C9D3DF] bg-white px-4 text-sm font-semibold text-[#17345B] hover:bg-[#F1F4F8] sm:w-auto"
              >
                Ajukan Kebutuhan Sekolah
              </Link>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[#E9EDF2]">
                {submissions.map((campaign) => (
                  <article
                    key={campaign.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[#17345B]">
                          {campaign.title}
                        </h3>
                        <StatusBadge status={campaign.status} />
                      </div>
                      <p className="mt-1 text-sm text-[#667085]">
                        {campaign.school?.name || campaign.school_name || "Sekolah belum tersedia"}
                        {" · "}
                        {dateLabel(campaign.created_at)}
                      </p>
                      {campaign.verification_note && (
                        <p className="mt-3 rounded-md border border-[#F2D3AD] bg-[#FFF8EF] px-3 py-2 text-sm leading-5 text-[#80501D]">
                          <strong>Catatan admin:</strong> {campaign.verification_note}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {["pending", "needs_revision"].includes(campaign.status) && (
                        <Link
                          to={`/ajukan?edit=${campaign.id}`}
                          className="inline-flex min-h-9 items-center rounded-lg border border-[#C9D3DF] px-3 text-xs font-semibold text-[#17345B] hover:bg-[#F7F8FA]"
                        >
                          {campaign.status === "needs_revision" ? "Perbaiki Pengajuan" : "Ubah Pengajuan"}
                        </Link>
                      )}
                      <Link
                        to={`/kampanye/${campaign.id}`}
                        className="inline-flex min-h-9 items-center rounded-lg border border-[#C9D3DF] px-3 text-xs font-semibold text-[#17345B] hover:bg-[#F7F8FA]"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
              {pagination?.last_page > 1 && (
                <div className="flex items-center justify-between border-t border-[#E9EDF2] px-4 py-3 sm:px-5">
                  <span className="text-xs text-[#667085]">
                    Halaman {pagination.current_page} dari {pagination.last_page}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((current) => current - 1)}
                      className="min-h-9 rounded-md border border-[#C9D3DF] px-3 text-xs font-semibold disabled:opacity-50"
                    >
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      disabled={page >= pagination.last_page}
                      onClick={() => setPage((current) => current + 1)}
                      className="min-h-9 rounded-md border border-[#C9D3DF] px-3 text-xs font-semibold disabled:opacity-50"
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-[#E3E8EF] bg-white">
          <div className="border-b border-[#E9EDF2] px-4 py-4 sm:px-5">
            <h2 className="text-lg font-semibold">Riwayat Donasi</h2>
            <p className="mt-1 text-sm text-[#667085]">
              Donasi yang tercatat dari akun Anda, termasuk akses ke laporan penggunaan dana yang tersedia.
            </p>
          </div>
          {donationError ? (
            <p role="alert" className="px-5 py-6 text-sm text-rose-700">
              Riwayat donasi tidak dapat dimuat: {donationError}
            </p>
          ) : loading ? (
            <LoadingPanel label="Memuat riwayat donasi" />
          ) : donations.length === 0 ? (
            <p className="px-5 py-7 text-sm text-[#667085]">
              Belum ada donasi yang tercatat dari akun ini.
            </p>
          ) : (
            <ul className="divide-y divide-[#E9EDF2]">
              {donations.map((donation) => (
                <li
                  key={donation.id}
                  className="grid min-w-0 gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-[#17345B]">
                      {donation.campaign?.title || donation.campaign?.school_name || "Kebutuhan sekolah"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#667085]">
                      <span>{dateLabel(donation.created_at)}</span>
                      <span>
                        Metode: {paymentMethodLabels[donation.payment_method] || donation.payment_method || "Belum tersedia"}
                      </span>
                      {donation.id != null && <span>ID transaksi: #{donation.id}</span>}
                    </div>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        donation.payment_status === "success"
                          ? "bg-emerald-50 text-emerald-800"
                          : donation.payment_status === "failed"
                            ? "bg-rose-50 text-rose-800"
                            : donation.payment_status === "pending"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {paymentStatusLabels[donation.payment_status] || "Status belum tersedia"}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:justify-end">
                    <strong className="text-base text-[#17345B]">
                      {formatRupiah(donation.amount)}
                    </strong>
                    {donation.campaign?.reports_count > 0 &&
                    ["verified", "completed"].includes(donation.campaign.status) ? (
                      <Link
                        to={`/kampanye/${donation.campaign_id}#laporan-dampak`}
                        className="text-xs font-semibold text-[#1D62B5] hover:underline"
                      >
                        Lihat laporan penggunaan dana
                      </Link>
                    ) : (
                      <span className="text-xs text-[#667085]">
                        Laporan penggunaan dana belum tersedia.
                      </span>
                    )}
                    {donation.order_id && (
                      <Link
                        to={`/pembayaran/selesai?order_id=${encodeURIComponent(donation.order_id)}`}
                        className="w-full text-right text-xs font-semibold text-[#1D62B5] hover:underline"
                      >
                        Detail transaksi
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function LoadingState({ label }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-[#667085]" role="status">
      <span
        aria-hidden="true"
        className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#d9e2ec] border-t-[#F28C28]"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function LoadingPanel({ label }) {
  return (
    <div className="flex min-h-24 items-center justify-center gap-3 px-5 py-6 text-sm text-[#667085]" role="status">
      <span
        aria-hidden="true"
        className="inline-block h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[#d9e2ec] border-t-[#F28C28]"
      />
      <span>{label}…</span>
    </div>
  );
}
