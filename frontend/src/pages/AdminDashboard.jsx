import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatRupiah } from "../api";

const statusLabels = {
  pending: "Menunggu",
  pending_verification: "Menunggu",
  needs_revision: "Perlu Perbaikan",
  revision_required: "Perlu Perbaikan",
  verified: "Disetujui",
  rejected: "Ditolak",
};

const pageSize = 8;

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
}

function externalHttpUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function Status({ value }) {
  const label = statusLabels[value] || value || "—";
  const style =
    value === "verified"
      ? "bg-emerald-50 text-emerald-700"
      : value === "rejected"
        ? "bg-rose-50 text-rose-700"
        : value === "needs_revision" || value === "revision_required"
          ? "bg-orange-50 text-orange-800"
          : "bg-amber-50 text-amber-800";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

function Pagination({ count, page, onChange }) {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  if (count <= pageSize) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF0F3] px-4 py-3 text-sm text-[#667085]">
      <span>
        Menampilkan {Math.min((page - 1) * pageSize + 1, count)}–
        {Math.min(page * pageSize, count)} dari {count}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="rounded-md border border-[#E2E7EE] px-3 py-1.5 disabled:opacity-40"
        >
          Sebelumnya
        </button>
        <span>{page} / {pages}</span>
        <button
          type="button"
          disabled={page === pages}
          onClick={() => onChange(page + 1)}
          className="rounded-md border border-[#E2E7EE] px-3 py-1.5 disabled:opacity-40"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, note, icon }) {
  return (
    <article className="rounded-xl border border-[#E6EAF0] bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#667085]">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#17345B]">
            {value ?? "—"}
          </p>
          <p className="mt-1 text-xs text-[#8893A3]">{note}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F1F5FA] text-[#17345B]">
          {icon}
        </span>
      </div>
    </article>
  );
}

export default function AdminDashboard({ campaignQueue = false }) {
  const [campaigns, setCampaigns] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState(campaignQueue ? "campaigns" : "schools");
  const [campaignFilter, setCampaignFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [verificationNote, setVerificationNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      api.adminStats(),
      api.listSchoolAccounts(),
      api.listCampaigns({ sort: "newest" }),
    ])
      .then(([dashboardStats, schoolAccounts, campaignData]) => {
        if (!active) return;
        setStats(dashboardStats);
        setAccounts(Array.isArray(schoolAccounts) ? schoolAccounts : []);
        setCampaigns(Array.isArray(campaignData) ? campaignData : []);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryKey]);

  const pendingAccounts = useMemo(
    () => accounts.filter((account) => account.account_status === "pending_verification"),
    [accounts],
  );
  const visibleCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) =>
        campaignFilter === "semua" ? true : campaign.status === campaignFilter,
      ),
    [campaignFilter, campaigns],
  );
  const rows = activeTab === "schools" ? pendingAccounts : visibleCampaigns;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / pageSize)));
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function updateCampaignStatus(campaign, newStatus) {
    const note = verificationNote.trim();
    if (newStatus !== "verified" && !note) {
      setError(newStatus === "needs_revision"
        ? "Catatan revisi wajib diisi."
        : "Alasan penolakan wajib diisi.");
      return;
    }

    setUpdating(true);
    setError("");
    try {
      await api.updateCampaign(campaign.id, {
        status: newStatus,
        verification_note: note || undefined,
      });
      const refreshedStats = await api.adminStats();
      setStats(refreshedStats);
      setCampaigns((current) =>
        current.map((item) =>
          item.id === campaign.id
            ? { ...item, status: newStatus, verification_note: note || null }
            : item,
        ),
      );
      setSelectedCampaign(null);
      setVerificationNote("");
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <main className="min-h-[calc(100svh-68px)] bg-[#F7F8FA] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="page-title text-[#17345B]">
              {campaignQueue ? "Tinjau Kebutuhan Sekolah" : "Ringkasan Admin"}
            </h1>
            <p className="mt-1 text-sm text-[#667085]">
              {campaignQueue
                ? "Tinjau kebutuhan sekolah sebelum dipublikasikan."
                : "Kelola verifikasi sekolah dan pengajuan kebutuhan EducationBridge."}
            </p>
          </div>
          {campaignQueue && (
            <select
              value={campaignFilter}
              onChange={(event) => setCampaignFilter(event.target.value)}
              aria-label="Filter status kampanye"
              className="min-h-10 rounded-lg border border-[#DCE2EA] bg-white px-3 text-sm text-[#17345B]"
            >
              <option value="pending">Menunggu</option>
              <option value="needs_revision">Perlu Perbaikan</option>
              <option value="verified">Disetujui</option>
              <option value="rejected">Ditolak</option>
              <option value="semua">Semua Status</option>
            </select>
          )}
        </div>

        {!campaignQueue && (
          <section aria-label="Statistik admin" className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Sekolah Menunggu Verifikasi" value={stats?.pendingSchoolAccounts} note="Akun menunggu pemeriksaan" icon="◷" />
            <MetricCard label="Kebutuhan Menunggu" value={stats?.pendingCampaigns} note="Pengajuan perlu ditinjau" icon="▤" />
            <MetricCard label="Sekolah Terverifikasi" value={stats?.verifiedSchoolAccounts} note="Akun sekolah disetujui" icon="✓" />
            <MetricCard label="Kampanye Aktif" value={stats?.activeCampaigns} note="Kampanye tayang untuk publik" icon="▥" />
          </section>
        )}

        <section className="mt-5 overflow-hidden rounded-xl border border-[#E6EAF0] bg-white">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EEF0F3] px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-lg font-semibold text-[#17345B]">
                {campaignQueue ? "Daftar Pengajuan" : "Perlu Ditinjau"}
              </h2>
              <p className="mt-1 text-sm text-[#667085]">
                {campaignQueue
                  ? "Kebutuhan sekolah yang menunggu peninjauan admin."
                  : "Pengajuan yang membutuhkan pemeriksaan admin."}
              </p>
            </div>
            {!campaignQueue && (
              <Link
                to="/admin/akun-sekolah"
                className="text-sm font-medium text-[#1D62B5] hover:underline"
              >
                Semua akun sekolah
              </Link>
            )}
          </div>

          {!campaignQueue && (
            <div role="tablist" aria-label="Jenis pengajuan" className="flex gap-5 border-b border-[#EEF0F3] px-4 sm:px-5">
              {[
                ["schools", "Verifikasi Sekolah", pendingAccounts.length],
                ["campaigns", "Tinjau Kebutuhan Sekolah", campaigns.filter((item) => item.status === "pending").length],
              ].map(([tab, label, count]) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 px-1 py-3 text-sm font-medium ${
                    activeTab === tab
                      ? "border-[#F28C28] text-[#C86611]"
                      : "border-transparent text-[#667085] hover:text-[#17345B]"
                  }`}
                >
                  {label} <span className="ml-1 text-xs text-[#8893A3]">{count}</span>
                </button>
              ))}
            </div>
          )}

          {error && (
            <div role="alert" className="mx-4 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:mx-5">
              {error}
            </div>
          )}

          {loading ? (
            <p className="px-5 py-12 text-center text-sm text-[#667085]">Memuat data dashboard…</p>
          ) : error && !stats ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-[#667085]">Data dashboard belum dapat dimuat.</p>
              <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="mt-3 text-sm font-semibold text-[#1D62B5]">Coba lagi</button>
            </div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-medium text-[#17345B]">Tidak ada pengajuan untuk ditampilkan.</p>
              <p className="mt-1 text-sm text-[#667085]">Pengajuan baru akan muncul di sini setelah dikirim.</p>
            </div>
          ) : activeTab === "schools" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-[#F8F9FB] text-xs font-semibold text-[#667085]">
                  <tr>
                    <th className="px-5 py-3">Nama Sekolah</th>
                    <th className="px-5 py-3">NPSN</th>
                    <th className="px-5 py-3">Lokasi</th>
                    <th className="px-5 py-3">Tanggal Pengajuan</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF0F3]">
                  {pageRows.map((account) => (
                    <tr key={account.id} className="hover:bg-[#FBFCFD]">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-[#17345B]">{account.organization_name || "—"}</p>
                        <p className="mt-0.5 text-xs text-[#8893A3]">{account.name}</p>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[#475467]">{account.npsn || "—"}</td>
                      <td className="px-5 py-3.5 text-[#667085]">
                        {[account.school?.kabupaten_kota, account.school?.provinsi].filter(Boolean).join(", ") || "Belum terverifikasi"}
                      </td>
                      <td className="px-5 py-3.5 text-[#667085]">{formatDate(account.created_at)}</td>
                      <td className="px-5 py-3.5"><Status value={account.account_status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to="/admin/akun-sekolah"
                          state={{ selectedSchoolId: account.id }}
                          className="font-semibold text-[#1D62B5] hover:underline"
                        >
                          Periksa
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-[#F8F9FB] text-xs font-semibold text-[#667085]">
                  <tr>
                    <th className="px-5 py-3">Judul Kebutuhan</th>
                    <th className="px-5 py-3">Sekolah</th>
                    <th className="px-5 py-3">Pengaju</th>
                    <th className="px-5 py-3">Target Dana</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF0F3]">
                  {pageRows.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-[#FBFCFD]">
                      <td className="max-w-[240px] px-5 py-3.5">
                        <p className="truncate font-medium text-[#17345B]">{campaign.title}</p>
                        <p className="mt-0.5 text-xs text-[#8893A3]">Priority Score {campaign.priority_score ?? "—"}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[#475467]">{campaign.school?.name || campaign.school_name || "—"}</td>
                      <td className="px-5 py-3.5 text-[#667085]">{campaign.user?.name || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[#475467]">{formatRupiah(campaign.target_amount)}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[#667085]">{formatDate(campaign.created_at)}</td>
                      <td className="px-5 py-3.5"><Status value={campaign.status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setVerificationNote(campaign.verification_note || "");
                            setError("");
                          }}
                          className="font-semibold text-[#1D62B5] hover:underline"
                        >
                          Tinjau
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && rows.length > 0 && (
            <Pagination count={rows.length} page={currentPage} onChange={setPage} />
          )}
        </section>
      </div>

      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => event.target === event.currentTarget && setSelectedCampaign(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="campaign-review-title" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-[#EEF0F3] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8893A3]">Detail kebutuhan sekolah</p>
                <h2 id="campaign-review-title" className="mt-1 text-xl font-semibold text-[#17345B]">{selectedCampaign.title}</h2>
                <p className="mt-1 text-sm text-[#667085]">{selectedCampaign.school?.name || selectedCampaign.school_name} · {selectedCampaign.location}</p>
              </div>
              <button type="button" onClick={() => setSelectedCampaign(null)} aria-label="Tutup detail" className="rounded-md px-2 py-1 text-xl text-[#667085] hover:bg-[#F1F3F6]">×</button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px]">
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold text-[#17345B]">Deskripsi kebutuhan</h3>
                  <p className="mt-1 whitespace-pre-wrap text-[#475467]">{selectedCampaign.description || "Belum ada deskripsi."}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#17345B]">Rencana anggaran</h3>
                  <p className="mt-1 whitespace-pre-wrap text-[#475467]">{selectedCampaign.rab_description || "Belum tersedia."}</p>
                  <p className="mt-1 font-medium text-[#17345B]">Target: {formatRupiah(selectedCampaign.target_amount)}</p>
                  <p className="mt-1 text-[#667085]">Hubungan dengan sekolah: {selectedCampaign.applicant_relationship || "Belum tersedia."}</p>
                  <p className="mt-1 text-[#667085]">Bukti/izin: {selectedCampaign.supporting_document || "Belum tersedia."}</p>
                  {externalHttpUrl(selectedCampaign.supporting_document) && (
                    <a
                      href={externalHttpUrl(selectedCampaign.supporting_document)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block font-medium text-[#1D62B5] underline"
                    >
                      Buka bukti pendukung
                    </a>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-[#17345B]">Pengaju</h3>
                  <p className="mt-1 text-[#475467]">{selectedCampaign.user?.name || "—"}{selectedCampaign.user?.email ? ` · ${selectedCampaign.user.email}` : ""}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#17345B]">Priority Score</h3>
                  <p className="mt-1 text-[#475467]">{selectedCampaign.priority_score ?? "—"} / 100</p>
                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-[#667085]">
                    <dt>Urgensi</dt><dd>{selectedCampaign.urgency ?? "—"}/5</dd>
                    <dt>Kondisi fasilitas</dt><dd>{selectedCampaign.facility_condition ?? "—"}/5</dd>
                    <dt>Keterpencilan</dt><dd>{selectedCampaign.remoteness ?? "—"}/5</dd>
                    <dt>Aksesibilitas</dt><dd>{selectedCampaign.access_score ?? "—"}/5</dd>
                  </dl>
                  {selectedCampaign.priority_breakdown && (
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-[#F7F8FA] p-3 text-xs text-[#475467]">{JSON.stringify(selectedCampaign.priority_breakdown, null, 2)}</pre>
                  )}
                </div>
              </div>
              <div>
                {selectedCampaign.image_url ? (
                  <img src={selectedCampaign.image_url} alt={`Foto kebutuhan ${selectedCampaign.title}`} className="aspect-square w-full rounded-lg border border-[#E6EAF0] object-cover" />
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-[#D9E0E8] bg-[#F8F9FB] text-center text-xs text-[#8893A3]">Belum ada foto kebutuhan</div>
                )}
                <p className="mt-2 text-xs text-[#667085]">NPSN: {selectedCampaign.school?.npsn || "—"}</p>
                <p className="mt-1 text-xs text-[#667085]">Wilayah: {[selectedCampaign.school?.kecamatan, selectedCampaign.school?.kabupaten_kota, selectedCampaign.school?.provinsi].filter(Boolean).join(", ") || selectedCampaign.location || "Data belum tersedia"}</p>
                <p className="mt-1 text-xs text-[#667085]">Status 3T: {selectedCampaign.school?.is_3t === true ? "Terverifikasi 3T" : selectedCampaign.school?.is_3t === false ? "Bukan wilayah 3T" : "Data belum tersedia"}</p>
                <p className="mt-1 text-xs text-[#667085]">Status: <Status value={selectedCampaign.status} /></p>
              </div>
            </div>

            {selectedCampaign.status !== "verified" && selectedCampaign.status !== "rejected" && (
              <div className="mt-5 border-t border-[#EEF0F3] pt-4">
                <label htmlFor="verification-note" className="text-sm font-medium text-[#17345B]">Catatan untuk pengaju</label>
                <textarea id="verification-note" rows={3} value={verificationNote} onChange={(event) => setVerificationNote(event.target.value)} placeholder="Wajib diisi jika meminta revisi atau menolak." className="mt-1.5 w-full rounded-lg border border-[#DCE2EA] p-3 text-sm outline-none focus:border-[#17345B] focus:ring-2 focus:ring-[#17345B]/10" />
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <button type="button" disabled={updating} onClick={() => updateCampaignStatus(selectedCampaign, "rejected")} className="min-h-10 rounded-lg border border-rose-200 px-3 text-sm font-medium text-rose-700 disabled:opacity-50">Tolak</button>
                  <button type="button" disabled={updating} onClick={() => updateCampaignStatus(selectedCampaign, "needs_revision")} className="min-h-10 rounded-lg border border-[#F3C58F] px-3 text-sm font-medium text-[#A4540B] disabled:opacity-50">Minta Revisi</button>
                  <button type="button" disabled={updating} onClick={() => updateCampaignStatus(selectedCampaign, "verified")} className="min-h-10 rounded-lg bg-[#17345B] px-4 text-sm font-semibold text-white disabled:opacity-50">{updating ? "Menyimpan…" : "Setujui & Publikasikan"}</button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
