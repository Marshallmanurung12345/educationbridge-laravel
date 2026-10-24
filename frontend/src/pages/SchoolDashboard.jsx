import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatRupiah } from "../api";
import { useAuth } from "../context/AuthContext";

const campaignStatus = {
  pending: ["Menunggu pemeriksaan", "bg-amber-50 text-amber-800"],
  needs_revision: ["Perlu perbaikan", "bg-orange-50 text-orange-800"],
  verified: ["Disetujui dan dipublikasikan", "bg-emerald-50 text-emerald-800"],
  rejected: ["Ditolak", "bg-rose-50 text-rose-700"],
  completed: ["Selesai", "bg-slate-100 text-slate-700"],
};

const accountStatus = {
  pending_verification: ["Menunggu verifikasi", "bg-amber-50 text-amber-900"],
  revision_required: ["Perlu perbaikan profil", "bg-orange-50 text-orange-900"],
  verified: ["Terverifikasi", "bg-emerald-50 text-emerald-900"],
  rejected: ["Ditolak", "bg-rose-50 text-rose-800"],
  suspended: ["Ditangguhkan", "bg-slate-100 text-slate-700"],
};

function dateLabel(value) {
  return value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
}

export default function SchoolDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const verified = user.account_status === "verified";
  const [schoolLabel, schoolStyle] =
    accountStatus[user.account_status] || accountStatus.pending_verification;

  const loadDashboard = useCallback(async () => {
    setError("");
    try {
      const result = await api.myCampaigns();
      setData(result);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const campaigns = Array.isArray(data?.campaigns) ? data.campaigns : [];
  const pages = Math.max(1, Math.ceil(campaigns.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visibleCampaigns = campaigns.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pendingCount = campaigns.filter((item) => ["pending", "needs_revision"].includes(item.status)).length;
  const approvedCount = campaigns.filter((item) => item.status === "verified").length;

  return (
    <div className="bg-[#F7F8FA] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-[#667085]">Dashboard Sekolah</p>
            <h1 className="page-title mt-1 text-[#17345B]">
              {user.organization_name || "Sekolah Anda"}
            </h1>
            <p className="mt-1 text-sm text-[#667085]">
              Pantau status akun dan kebutuhan yang diajukan sekolah.
            </p>
          </div>
          {verified ? (
            <Link to="/ajukan" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#F28C28] px-4 text-sm font-semibold text-white hover:bg-[#DC7616]">
              + Ajukan Kebutuhan Sekolah
            </Link>
          ) : (
            <Link to="/sekolah/profil" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#E2E7EE] bg-white px-4 text-sm font-semibold text-[#17345B] hover:bg-[#F8F9FB]">
              Periksa status akun
            </Link>
          )}
        </div>

        <section aria-label="Status verifikasi akun" className={`mt-5 rounded-xl border px-4 py-4 sm:px-5 ${verified ? "border-emerald-200 bg-emerald-50/70" : "border-amber-200 bg-amber-50/70"}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-[#17345B]">Status akun sekolah</h2>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${schoolStyle}`}>{schoolLabel}</span>
              </div>
              <p className="mt-1 text-sm text-[#667085]">
                {verified
                  ? "Akun sekolah sudah terverifikasi. Pengajuan kebutuhan tetap ditinjau admin sebelum dipublikasikan."
                  : user.account_status === "revision_required"
                    ? user.verification_note || "Perbarui data profil sekolah agar admin dapat memeriksanya kembali."
                    : user.account_status === "rejected"
                      ? user.verification_note || "Hubungi administrator jika Anda memerlukan informasi mengenai keputusan ini."
                      : user.account_status === "suspended"
                        ? user.verification_note || "Akun sekolah sedang ditangguhkan. Hubungi administrator untuk informasi lebih lanjut."
                        : "Akun sedang menunggu pemeriksaan admin. Pengajuan kebutuhan baru tersedia setelah akun sekolah terverifikasi."}
              </p>
            </div>
            {!verified && ["pending_verification", "revision_required"].includes(user.account_status) && (
              <Link to="/sekolah/profil" className="text-sm font-semibold text-[#1D62B5] hover:underline">Lihat profil dan catatan admin</Link>
            )}
          </div>
        </section>

        {error && (
          <div role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
            <button type="button" onClick={() => { setLoading(true); loadDashboard(); }} className="ml-3 font-semibold underline">Coba lagi</button>
          </div>
        )}

        <section id="pengajuan-saya" className="mt-6 overflow-hidden rounded-xl border border-[#E6EAF0] bg-white">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EEF0F3] px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-lg font-semibold text-[#17345B]">Pengajuan Saya</h2>
              <p className="mt-1 text-sm text-[#667085]">Riwayat dan proses pemeriksaan kebutuhan sekolah Anda.</p>
            </div>
            {!loading && (
              <div className="flex gap-2 text-xs">
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">{pendingCount} menunggu</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">{approvedCount} disetujui</span>
              </div>
            )}
          </div>

          {loading ? (
            <p className="px-5 py-12 text-center text-sm text-[#667085]">Memuat pengajuan sekolah…</p>
          ) : campaigns.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-medium text-[#17345B]">Belum ada kebutuhan yang diajukan.</p>
              <p className="mt-1 text-sm text-[#667085]">
                {verified ? "Ajukan kebutuhan sekolah untuk memulai proses peninjauan." : "Setelah akun terverifikasi, Anda dapat mengajukan kebutuhan sekolah."}
              </p>
              {verified && <Link to="/ajukan" className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-[#F28C28] px-4 text-sm font-semibold text-white hover:bg-[#DC7616]">Ajukan Kebutuhan</Link>}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-[#F8F9FB] text-xs font-semibold text-[#667085]">
                    <tr>
                      <th className="px-5 py-3">Kebutuhan</th>
                      <th className="px-5 py-3">Target Dana</th>
                      <th className="px-5 py-3">Tanggal Diajukan</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Catatan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF0F3]">
                    {visibleCampaigns.map((campaign) => {
                      const [label, style] = campaignStatus[campaign.status] || [campaign.status, "bg-slate-100 text-slate-700"];
                      return (
                        <tr key={campaign.id} className="align-top hover:bg-[#FBFCFD]">
                          <td className="px-5 py-4">
                            <p className="font-medium text-[#17345B]">{campaign.title}</p>
                            <p className="mt-1 text-xs text-[#8893A3]">{campaign.category || "Kebutuhan sekolah"}</p>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-[#475467]">{formatRupiah(campaign.target_amount)}</td>
                          <td className="whitespace-nowrap px-5 py-4 text-[#667085]">{dateLabel(campaign.created_at)}</td>
                          <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>{label}</span></td>
                          <td className="max-w-[240px] px-5 py-4 text-xs text-[#667085]">{campaign.verification_note || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {campaigns.length > pageSize && (
                <div className="flex items-center justify-between border-t border-[#EEF0F3] px-5 py-3 text-sm text-[#667085]">
                  <span>{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, campaigns.length)} dari {campaigns.length} pengajuan</span>
                  <div className="flex items-center gap-3">
                    <button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)} className="disabled:opacity-40">Sebelumnya</button>
                    <span>{currentPage} / {pages}</span>
                    <button type="button" disabled={currentPage === pages} onClick={() => setPage((value) => value + 1)} className="disabled:opacity-40">Berikutnya</button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
