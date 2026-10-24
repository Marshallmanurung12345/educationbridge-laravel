import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../api";
import LoadingIndicator from "../components/LoadingIndicator";

const statusLabels = {
  pending_verification: "Menunggu",
  verified: "Disetujui",
  revision_required: "Perlu Perbaikan",
  rejected: "Ditolak",
  suspended: "Ditangguhkan",
};

const pageSize = 10;

function dateLabel(value) {
  return value ? new Date(value).toLocaleDateString("id-ID") : "—";
}

export default function SchoolAccountReview() {
  const location = useLocation();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [page, setPage] = useState(1);

  const loadAccounts = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await api.listSchoolAccounts();
      const schoolAccounts = Array.isArray(data) ? data : [];
      setAccounts(schoolAccounts);
      const selected = schoolAccounts.find(
        (account) => account.id === location.state?.selectedSchoolId,
      );
      if (selected) setSelectedAccount(selected);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [location.state?.selectedSchoolId]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const pageAccounts = useMemo(
    () => accounts.slice((page - 1) * pageSize, page * pageSize),
    [accounts, page],
  );
  const pages = Math.max(1, Math.ceil(accounts.length / pageSize));

  async function updateStatus(account, status) {
    const note =
      status === "verified"
        ? ""
        : window.prompt(
            status === "revision_required"
              ? "Catatan perbaikan untuk sekolah:"
              : "Alasan penolakan:",
          )?.trim();
    if (status !== "verified" && !note) return;

    setError("");
    setUpdatingId(account.id);
    try {
      await api.updateSchoolAccountStatus(account.id, { status, note });
      setSelectedAccount(null);
      await loadAccounts();
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-[calc(100svh-68px)] bg-[#F7F8FA] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div>
          <h1 className="page-title text-[#17345B]">Verifikasi Sekolah</h1>
          <p className="mt-1 text-sm text-[#667085]">Periksa data pendaftar dan kecocokan NPSN pada data sekolah resmi.</p>
        </div>

        {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}

        <section className="mt-5 overflow-hidden rounded-xl border border-[#E6EAF0] bg-white">
          {loading ? (
            <LoadingIndicator label="Memuat akun sekolah…" className="px-5 py-12" />
          ) : accounts.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-medium text-[#17345B]">Belum ada akun sekolah.</p>
              <p className="mt-1 text-sm text-[#667085]">Akun yang mendaftar akan muncul di halaman ini.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-[#F8F9FB] text-xs font-semibold text-[#667085]">
                    <tr>
                      <th className="px-5 py-3">Nama Sekolah / Perwakilan</th>
                      <th className="px-5 py-3">NPSN</th>
                      <th className="px-5 py-3">Lokasi Resmi</th>
                      <th className="px-5 py-3">Tanggal Pengajuan</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF0F3]">
                    {pageAccounts.map((account) => (
                      <tr key={account.id} className="hover:bg-[#FBFCFD]">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-[#17345B]">{account.organization_name || "—"}</p>
                          <p className="mt-0.5 text-xs text-[#8893A3]">{account.name}</p>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[#475467]">{account.npsn || "—"}</td>
                        <td className="px-5 py-3.5 text-[#667085]">
                          {[account.school?.kabupaten_kota, account.school?.provinsi].filter(Boolean).join(", ") || "Belum cocok dengan data resmi"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-[#667085]">{dateLabel(account.created_at)}</td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">{statusLabels[account.account_status] || account.account_status}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button type="button" onClick={() => setSelectedAccount(account)} className="font-semibold text-[#1D62B5] hover:underline">Periksa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {accounts.length > pageSize && (
                <div className="flex items-center justify-between border-t border-[#EEF0F3] px-5 py-3 text-sm text-[#667085]">
                  <span>{accounts.length} akun sekolah</span>
                  <div className="flex items-center gap-3">
                    <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="disabled:opacity-40">Sebelumnya</button>
                    <span>{page} / {pages}</span>
                    <button type="button" disabled={page === pages} onClick={() => setPage((value) => value + 1)} className="disabled:opacity-40">Berikutnya</button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => event.target === event.currentTarget && setSelectedAccount(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="school-review-title" className="w-full max-w-xl rounded-xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8893A3]">Profil pendaftar</p>
                <h2 id="school-review-title" className="mt-1 text-xl font-semibold text-[#17345B]">{selectedAccount.organization_name || "Sekolah"}</h2>
              </div>
              <button type="button" onClick={() => setSelectedAccount(null)} aria-label="Tutup detail" className="rounded-md px-2 py-1 text-xl text-[#667085] hover:bg-[#F1F3F6]">×</button>
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-[#8893A3]">NPSN terdaftar</dt><dd className="mt-0.5 font-medium text-[#17345B]">{selectedAccount.npsn || "—"}</dd></div>
              <div><dt className="text-[#8893A3]">Nama perwakilan</dt><dd className="mt-0.5 font-medium text-[#17345B]">{selectedAccount.name}</dd></div>
              <div><dt className="text-[#8893A3]">Email</dt><dd className="mt-0.5 font-medium text-[#17345B]">{selectedAccount.email}</dd></div>
              <div><dt className="text-[#8893A3]">Nomor telepon</dt><dd className="mt-0.5 font-medium text-[#17345B]">{selectedAccount.phone || "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="text-[#8893A3]">Kecocokan data sekolah resmi</dt><dd className="mt-0.5 font-medium text-[#17345B]">{selectedAccount.school ? `${selectedAccount.school.name} · ${selectedAccount.school.npsn} · ${selectedAccount.school.kabupaten_kota}, ${selectedAccount.school.provinsi}` : "Belum cocok. Minta pendaftar memperbaiki data sebelum menyetujui akun."}</dd></div>
              {selectedAccount.verification_note && <div className="sm:col-span-2"><dt className="text-[#8893A3]">Catatan verifikasi sebelumnya</dt><dd className="mt-0.5 text-[#475467]">{selectedAccount.verification_note}</dd></div>}
            </dl>
            {selectedAccount.account_status !== "verified" && (
              <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#EEF0F3] pt-4">
                <button type="button" disabled={updatingId === selectedAccount.id} onClick={() => updateStatus(selectedAccount, "rejected")} className="min-h-10 rounded-lg border border-rose-200 px-3 text-sm font-medium text-rose-700 disabled:opacity-50">Tolak</button>
                <button type="button" disabled={updatingId === selectedAccount.id} onClick={() => updateStatus(selectedAccount, "revision_required")} className="min-h-10 rounded-lg border border-[#F3C58F] px-3 text-sm font-medium text-[#A4540B] disabled:opacity-50">Minta Perbaikan</button>
                <button type="button" disabled={updatingId === selectedAccount.id || !selectedAccount.school} onClick={() => updateStatus(selectedAccount, "verified")} className="min-h-10 rounded-lg bg-[#17345B] px-4 text-sm font-semibold text-white disabled:opacity-50">Setujui Akun</button>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
