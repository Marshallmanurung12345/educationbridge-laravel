import { useCallback, useEffect, useState } from "react";
import { api } from "../api";

const statuses = {
  pending_verification: "Menunggu Verifikasi",
  verified: "Disetujui",
  revision_required: "Perlu Perbaikan",
  rejected: "Ditolak",
  suspended: "Ditangguhkan",
};

export default function SchoolAccountReview() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadAccounts = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await api.listSchoolAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  async function updateStatus(account, status) {
    const note =
      status === "verified"
        ? ""
        : window.prompt(
            status === "revision_required"
              ? "Catatan perbaikan untuk sekolah:"
              : "Alasan penolakan atau penangguhan:",
          )?.trim();
    if (status !== "verified" && !note) return;

    setError("");
    setUpdatingId(account.id);
    try {
      await api.updateSchoolAccountStatus(account.id, { status, note });
      await loadAccounts();
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-[calc(100svh-68px)] bg-[#f8fafc] px-5 py-10 text-[#17345B]">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Verifikasi Akun Sekolah</h1>
        <p className="mt-2 text-sm text-[#667085]">
          Cocokkan nama sekolah dan NPSN dengan sumber data resmi sebelum
          menyetujui akun.
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {loading ? (
          <p className="mt-8 text-sm text-[#667085]">Memuat akun sekolah...</p>
        ) : accounts.length === 0 ? (
          <p className="mt-8 rounded-lg border border-[#e5e7eb] bg-white p-5 text-sm text-[#667085]">
            Belum ada akun sekolah.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{account.organization_name}</h2>
                    <p className="mt-1 text-sm text-[#667085]">
                      {account.name} · {account.email}
                    </p>
                    <p className="mt-1 text-sm text-[#667085]">
                      NPSN: {account.npsn || "Belum diisi"} · Telepon:{" "}
                      {account.phone || "Belum diisi"}
                    </p>
                    <p className="mt-1 text-sm text-[#667085]">
                      Data resmi: {account.school?.name || "NPSN belum cocok"}{" "}
                      {account.school &&
                        `· ${account.school.kabupaten_kota}, ${account.school.provinsi}`}
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      Status: {statuses[account.account_status] || account.account_status}
                    </p>
                    {account.verification_note && (
                      <p className="mt-1 text-sm text-amber-800">
                        Catatan: {account.verification_note}
                      </p>
                    )}
                  </div>
                  {account.account_status !== "verified" && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={updatingId === account.id}
                        onClick={() => updateStatus(account, "verified")}
                        className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Setujui
                      </button>
                      <button
                        disabled={updatingId === account.id}
                        onClick={() => updateStatus(account, "revision_required")}
                        className="rounded-md border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-900 disabled:opacity-50"
                      >
                        Minta Perbaikan
                      </button>
                      <button
                        disabled={updatingId === account.id}
                        onClick={() => updateStatus(account, "rejected")}
                        className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
