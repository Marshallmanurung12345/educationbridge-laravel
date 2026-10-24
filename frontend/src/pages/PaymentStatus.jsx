import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, formatRupiah } from "../api";

const statusCopy = {
  pending: {
    title: "Menunggu konfirmasi pembayaran",
    description: "Midtrans sedang memproses pembayaran. Status akan diperbarui setelah ada konfirmasi.",
    style: "border-amber-200 bg-amber-50 text-amber-900",
  },
  success: {
    title: "Pembayaran berhasil",
    description: "Pembayaran telah dikonfirmasi oleh Midtrans. Terima kasih telah mendukung sekolah.",
    style: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  failed: {
    title: "Pembayaran gagal atau kedaluwarsa",
    description: "Pembayaran ini tidak berhasil. Anda dapat kembali ke kebutuhan sekolah dan mencoba lagi.",
    style: "border-rose-200 bg-rose-50 text-rose-900",
  },
  unverified: {
    title: "Transaksi belum terverifikasi",
    description: "Transaksi lama ini tidak memiliki konfirmasi pembayaran dari Midtrans.",
    style: "border-slate-200 bg-slate-50 text-slate-800",
  },
};

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [donation, setDonation] = useState(null);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const refresh = useCallback(async () => {
    if (!orderId) {
      setError("ID transaksi tidak ditemukan pada tautan pembayaran.");
      return;
    }

    try {
      const result = await api.refreshDonationStatus(orderId);
      setDonation(result);
      setError("");
      return result;
    } catch (loadError) {
      setError(loadError.message);
      return null;
    }
  }, [orderId]);

  useEffect(() => {
    let active = true;
    let timeoutId;
    let attempts = 0;

    async function checkStatus() {
      const result = await refresh();
      if (!active || result?.payment_status !== "pending" || attempts >= 11) return;
      attempts += 1;
      timeoutId = window.setTimeout(checkStatus, 5000);
    }

    checkStatus();
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [refresh, retryKey]);

  const status = statusCopy[donation?.payment_status] || statusCopy.pending;

  return (
    <main className="min-h-[60vh] bg-[#F7F8FA] px-4 py-12 text-[#17345B] sm:px-6">
      <section className="mx-auto max-w-xl rounded-2xl border border-[#E3E8EF] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9a6b1c]">
          Status transaksi
        </p>
        <h1 className="page-title mt-2">Pembayaran Donasi</h1>

        {error && (
          <div role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {error}
            <button
              type="button"
              onClick={() => {
                setError("");
                setRetryKey((key) => key + 1);
              }}
              className="ml-2 font-semibold underline underline-offset-2"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!donation && !error ? (
          <div className="mt-6 flex items-center gap-3 text-sm text-[#667085]" role="status">
            <span
              aria-hidden="true"
              className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#d9e2ec] border-t-[#F28C28]"
            />
            Memeriksa status pembayaran…
          </div>
        ) : donation ? (
          <>
            <div className={`mt-6 rounded-lg border p-4 ${status.style}`} role="status">
              <h2 className="font-semibold">{status.title}</h2>
              <p className="mt-1 text-sm leading-6">{status.description}</p>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#667085]">Nominal</dt>
                <dd className="font-semibold">{formatRupiah(donation.amount)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#667085]">ID transaksi</dt>
                <dd className="break-all text-right font-mono text-xs">{donation.order_id}</dd>
              </div>
            </dl>
            {donation.payment_status === "pending" && (
              <button
                type="button"
                onClick={() => setRetryKey((key) => key + 1)}
                className="mt-5 min-h-10 rounded-lg border border-[#C9D3DF] px-4 text-sm font-semibold hover:bg-[#F7F8FA]"
              >
                Periksa status lagi
              </button>
            )}
          </>
        ) : null}

        <Link
          to="/dashboard-donatur"
          className="mt-6 inline-flex min-h-10 items-center rounded-lg bg-[#17345B] px-4 text-sm font-semibold text-white hover:bg-[#234a78]"
        >
          Lihat Donasi Saya
        </Link>
      </section>
    </main>
  );
}
