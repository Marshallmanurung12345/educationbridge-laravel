import { useEffect, useState } from "react";
import { api, formatRupiah } from "../api";

const statusConfig = {
  pending: {
    label: "Menunggu Verifikasi",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  needs_revision: {
    label: "Perlu Perbaikan",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
  },
  verified: {
    label: "Terverifikasi (Tayang)",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  rejected: {
    label: "Ditolak",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
  },
};

export default function AdminDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [verificationNote, setVerificationNote] = useState("");
  const [updating, setUpdating] = useState(false);

  function load() {
    setLoading(true);
    const params = filter === "semua" ? {} : { status: filter };
    api
      .listCampaigns(params)
      .then((data) => {
        setCampaigns(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, [filter]);

  async function updateCampaignStatus(campaign, newStatus) {
    let note = verificationNote;
    if (newStatus === "needs_revision" && !note) {
      note =
        prompt(
          "Masukkan catatan revisi untuk sekolah (misal: mohon sertakan foto RAB & Surat Kepsek terbaru):",
        ) || "";
      if (!note) return;
    } else if (newStatus === "rejected" && !note) {
      note = prompt("Alasan penolakan pengajuan:") || "";
    }

    setUpdating(true);
    try {
      await api.updateCampaign(campaign.id, {
        status: newStatus,
        verification_note: note || undefined,
      });
      setSelectedCampaign(null);
      setVerificationNote("");
      load();
    } catch (err) {
      alert("Gagal memperbarui status: " + err.message);
    } finally {
      setUpdating(false);
    }
  }

  async function remove(campaign) {
    if (
      !confirm(
        `Hapus campaign "${campaign.title}"? Tindakan ini tidak dapat dibatalkan.`,
      )
    )
      return;
    await api.deleteCampaign(campaign.id);
    load();
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#1e293b] pb-16">
      {/* HEADER PANEL VERIFIKASI ADMIN */}
      <div className="bg-[#0f172a] text-white border-b border-slate-800">
        <div className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-purple-500/20 px-2.5 py-1 text-xs font-bold text-purple-300 border border-purple-500/30">
                  ⚡ PANEL VERIFIKATOR & ADMIN EDUCATIONBRIDGE
                </span>
                <span className="rounded bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-300 border border-blue-500/30">
                  Sistem Validasi Multi-Tahap
                </span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Pemeriksaan & Verifikasi Pengajuan Sekolah
              </h1>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
                Pemeriksaan validitas Data Induk Kemendikdasmen, kelengkapan
                dokumen pendukung/RAB, dan penetapan status{" "}
                <strong>
                  Menunggu → Perlu Perbaikan → Terverifikasi / Ditolak
                </strong>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1280px] px-5 pt-8 sm:px-8">
        {/* WORKFLOW STEPPER BANNER */}
        <div className="mb-8 rounded-xl border border-purple-200 bg-purple-50/60 p-5">
          <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider mb-3">
            Standar Operasional Prosedur (SOP) Verifikator EducationBridge:
          </h3>
          <div className="grid gap-3 text-xs sm:grid-cols-4">
            <div className="rounded-lg bg-white p-3 border border-purple-100 shadow-sm">
              <strong className="block text-purple-900 font-bold mb-1">
                1. Cek Data Induk
              </strong>
              <span className="text-slate-600">
                Pastikan NPSN dan nama sekolah cocok dengan data Kemendikdasmen.
              </span>
            </div>
            <div className="rounded-lg bg-white p-3 border border-purple-100 shadow-sm">
              <strong className="block text-purple-900 font-bold mb-1">
                2. Validasi RAB & Dokumen
              </strong>
              <span className="text-slate-600">
                Periksa kewajaran target dana, RAB, dan Surat Pengajuan Kepala
                Sekolah.
              </span>
            </div>
            <div className="rounded-lg bg-white p-3 border border-purple-100 shadow-sm">
              <strong className="block text-purple-900 font-bold mb-1">
                3. Status Verification
              </strong>
              <span className="text-slate-600">
                Pilih <em>Terverifikasi</em>, atau <em>Perlu Perbaikan</em> jika
                dokumen kurang.
              </span>
            </div>
            <div className="rounded-lg bg-white p-3 border border-purple-100 shadow-sm">
              <strong className="block text-purple-900 font-bold mb-1">
                4. Priority Score System
              </strong>
              <span className="text-slate-600">
                Priority Score dihitung otomatis dan kampanye langsung
                dipublikasikan.
              </span>
            </div>
          </div>
        </div>

        {/* STATUS FILTER TABS */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          {[
            { id: "pending", label: "Menunggu Verifikasi" },
            { id: "needs_revision", label: "Perlu Perbaikan" },
            { id: "verified", label: "Terverifikasi (Tayang)" },
            { id: "rejected", label: "Ditolak" },
            { id: "semua", label: "Semua Pengajuan" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                filter === f.id
                  ? "bg-slate-900 text-white shadow"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* TABLE SECTION */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Mengambil daftar pengajuan sekolah...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Tidak ada pengajuan sekolah dengan status filter ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Judul Kebutuhan</th>
                    <th className="px-6 py-3.5">Identitas Sekolah & NPSN</th>
                    <th className="px-6 py-3.5">Target & RAB</th>
                    <th className="px-6 py-3.5">Priority Score</th>
                    <th className="px-6 py-3.5">Status Workflow</th>
                    <th className="px-6 py-3.5 text-center">
                      Aksi Pemeriksaan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {campaigns.map((c) => {
                    const statusInfo = statusConfig[c.status] || {
                      label: c.status,
                      badge: "bg-slate-100 text-slate-700",
                    };
                    const school = c.school;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 max-w-xs">
                          <span className="font-bold text-slate-900 block text-sm">
                            {c.title}
                          </span>
                          <span className="text-slate-500 text-[11px] block mt-0.5 line-clamp-1">
                            {c.description}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900 block">
                            {school?.name || c.school_name}
                          </span>
                          <span className="font-mono text-blue-700 font-bold text-[11px] block mt-0.5">
                            NPSN: {school?.npsn || "Tidak terdaftar"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block">
                            {formatRupiah(c.target_amount)}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {c.rab_description
                              ? "RAB Terlampir"
                              : "Belum melampirkan RAB"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 text-sm block">
                            {c.priority_score} / 100
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {c.status === "verified"
                              ? "Aktif"
                              : "Draft Evaluasi"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block rounded border px-2.5 py-1 text-[10px] font-bold ${statusInfo.badge}`}
                          >
                            {statusInfo.label}
                          </span>
                          {c.verification_note && (
                            <p className="mt-1 text-[10px] text-orange-700 italic max-w-xs">
                              "{c.verification_note}"
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedCampaign(c)}
                            className="rounded bg-slate-900 px-3 py-1.5 font-bold text-white shadow hover:bg-slate-800 transition"
                          >
                            Tinjau & Verifikasi →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* VERIFICATION DETAIL MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="rounded bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 text-[11px] uppercase tracking-wider">
                  Detail Pemeriksaan Verifikator
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {selectedCampaign.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pengaju: {selectedCampaign.school_name} (NPSN:{" "}
                  {selectedCampaign.school?.npsn || "Belum Ada"})
                </p>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              {/* CHECKLIST VALIDASI DATA INDUK */}
              <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4">
                <h4 className="font-bold text-blue-950 uppercase tracking-wider text-[11px] mb-2">
                  Checklist Data Induk Kemendikdasmen:
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-blue-900">
                    <span>✓</span> NPSN Sekolah Terdaftar:{" "}
                    <strong>{selectedCampaign.school?.npsn || "Valid"}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-blue-900">
                    <span>✓</span> Status 3T:{" "}
                    <strong>
                      {selectedCampaign.school?.is_3t
                        ? "Wilayah 3T Official"
                        : "Reguler"}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2 text-blue-900">
                    <span>✓</span> Lokasi Resmi:{" "}
                    <strong>{selectedCampaign.location}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-blue-900">
                    <span>✓</span> Jumlah Siswa:{" "}
                    <strong>{selectedCampaign.student_count} Siswa</strong>
                  </div>
                </div>
              </div>

              {/* RINCIAN PERMINTAAN KEBUTUHAN & RAB */}
              <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">
                    Deskripsi Permohonan Bantuan:
                  </span>
                  <p className="mt-1 text-slate-800 leading-relaxed">
                    {selectedCampaign.description}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">
                    Rencana Anggaran Biaya (RAB):
                  </span>
                  <p className="mt-1 text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200 font-mono text-[11px]">
                    {selectedCampaign.rab_description ||
                      "RAB belum diisi secara rinci."}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">
                    Dokumen Pendukung / Surat Pengajuan Kepsek:
                  </span>
                  <p className="mt-1 text-blue-700 font-medium">
                    {selectedCampaign.supporting_document ||
                      "Dokumen pendukung terlampir di sistem."}
                  </p>
                </div>
              </div>

              {/* CATATAN VERIFIKATOR */}
              <div>
                <label className="block font-bold text-slate-700 uppercase text-[11px] mb-1">
                  Catatan Verifikasi / Instruksi Perbaikan:
                </label>
                <textarea
                  rows={3}
                  value={verificationNote}
                  onChange={(e) => setVerificationNote(e.target.value)}
                  placeholder="Tuliskan catatan verifikasi (misal: mohon lampirkan foto RAB yang disetujui Kepala Sekolah)..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                disabled={updating}
                onClick={() =>
                  updateCampaignStatus(selectedCampaign, "needs_revision")
                }
                className="rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-orange-500 transition disabled:opacity-50"
              >
                📝 Minta Perbaikan (Needs Revision)
              </button>

              <button
                disabled={updating}
                onClick={() =>
                  updateCampaignStatus(selectedCampaign, "rejected")
                }
                className="rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-500 transition disabled:opacity-50"
              >
                ❌ Tolak Pengajuan
              </button>

              <button
                disabled={updating}
                onClick={() =>
                  updateCampaignStatus(selectedCampaign, "verified")
                }
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition disabled:opacity-50"
              >
                ✅ Terverifikasi & Hitung Priority Score
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
