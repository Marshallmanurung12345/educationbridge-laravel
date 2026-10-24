import { useEffect, useState } from "react";
import { api } from "../api";
import LoadingIndicator from "../components/LoadingIndicator";

const EMPTY_META = { current_page: 1, last_page: 1, per_page: 20, total: 0 };

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(EMPTY_META);
  const [options, setOptions] = useState({ actions: [], actors: [] });
  const [filters, setFilters] = useState({
    search: "",
    action: "",
    actor: "",
    from: "",
    to: "",
  });
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let current = true;

    api
      .listAuditLogs({ ...filters, page })
      .then((result) => {
        if (!current) return;
        setLogs(result.data || []);
        setMeta(result.meta || EMPTY_META);
        setOptions(result.filters || { actions: [], actors: [] });
      })
      .catch((loadError) => {
        if (current) {
          setLogs([]);
          setMeta(EMPTY_META);
          setError(loadError.message || "Catatan audit gagal dimuat.");
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [filters, page, reloadKey]);

  function updateFilter(name, value) {
    setLoading(true);
    setError("");
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  }

  function resetFilters() {
    setLoading(true);
    setError("");
    setFilters({ search: "", action: "", actor: "", from: "", to: "" });
    setPage(1);
  }

  const inputClass =
    "w-full rounded-lg border border-[#d0d5dd] bg-white px-3 py-2.5 text-sm text-[#17345B] outline-none transition focus:border-[#17345B] focus:ring-2 focus:ring-[#17345B]/10";

  return (
    <main className="min-h-[calc(100svh-68px)] bg-[#f8fafc] px-4 py-8 text-[#17345B] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#f28c28]">
            Administrasi
          </p>
          <h1 className="page-title mt-1">Audit Aktivitas</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#667085]">
            Riwayat tindakan admin dan perubahan penting yang benar-benar
            tersimpan di sistem. Catatan audit hanya dapat dibaca.
          </p>
        </header>

        <section
          aria-label="Filter catatan audit"
          className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <label className="text-xs font-medium text-[#475467] sm:col-span-2 lg:col-span-2">
              Cari aktivitas
              <input
                className={`${inputClass} mt-1.5`}
                type="search"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Pelaku, aktivitas, objek, atau catatan"
              />
            </label>
            <label className="text-xs font-medium text-[#475467]">
              Jenis aktivitas
              <select
                className={`${inputClass} mt-1.5`}
                value={filters.action}
                onChange={(event) => updateFilter("action", event.target.value)}
              >
                <option value="">Semua aktivitas</option>
                {options.actions.map((action) => (
                  <option key={action} value={action}>
                    {formatAction(action)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-[#475467]">
              Pelaku
              <select
                className={`${inputClass} mt-1.5`}
                value={filters.actor}
                onChange={(event) => updateFilter("actor", event.target.value)}
              >
                <option value="">Semua pelaku</option>
                {options.actors.map((actor) => (
                  <option key={actor.id} value={actor.id}>
                    {actor.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-[#475467]">
              Dari tanggal
              <input
                className={`${inputClass} mt-1.5`}
                type="date"
                value={filters.from}
                max={filters.to || undefined}
                onChange={(event) => updateFilter("from", event.target.value)}
              />
            </label>
            <label className="text-xs font-medium text-[#475467]">
              Sampai tanggal
              <input
                className={`${inputClass} mt-1.5`}
                type="date"
                value={filters.to}
                min={filters.from || undefined}
                onChange={(event) => updateFilter("to", event.target.value)}
              />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#667085]">
              {meta.total} catatan ditemukan
            </p>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!Object.values(filters).some(Boolean)}
              className="text-sm font-semibold text-[#17345B] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-[#98a2b3] disabled:no-underline"
            >
              Hapus filter
            </button>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setError("");
                setReloadKey((key) => key + 1);
              }}
              className="font-semibold underline underline-offset-2"
            >
              Coba lagi
            </button>
          </div>
        )}

        {loading ? (
          <LoadingIndicator
            label="Memuat catatan audit…"
            className="mt-6 min-h-32 rounded-xl border border-[#e5e7eb] bg-white"
          />
        ) : logs.length === 0 && !error ? (
          <div className="mt-6 rounded-xl border border-dashed border-[#d0d5dd] bg-white px-5 py-12 text-center">
            <p className="font-semibold">Tidak ada catatan aktivitas</p>
            <p className="mt-1 text-sm text-[#667085]">
              Coba ubah kata pencarian atau filter tanggal dan aktivitas.
            </p>
          </div>
        ) : (
          <>
            <ol className="mt-5 space-y-3">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div>
                      <h2 className="font-semibold">
                        {formatAction(log.action)}
                      </h2>
                      <p className="mt-1 text-sm text-[#667085]">
                        Oleh{" "}
                        <span className="font-medium text-[#344054]">
                          {log.actor?.name || "Akun tidak tersedia"}
                        </span>
                        {" · "}
                        {formatSubject(log)}
                      </p>
                    </div>
                    <time
                      className="shrink-0 text-xs text-[#667085] sm:text-right"
                      dateTime={log.created_at}
                    >
                      {formatDate(log.created_at)}
                    </time>
                  </div>

                  {log.note && (
                    <p className="mt-3 rounded-lg bg-[#f8fafc] px-3 py-2 text-sm text-[#475467]">
                      <span className="font-medium text-[#344054]">Catatan:</span>{" "}
                      {log.note}
                    </p>
                  )}

                  <ChangeSummary log={log} />
                  {(log.old_values || log.new_values) && (
                    <details className="mt-3 border-t border-[#eaecf0] pt-3 text-sm">
                      <summary className="cursor-pointer font-medium text-[#475467]">
                        Detail teknis
                      </summary>
                      <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-[#f8fafc] p-3 text-xs text-[#475467]">
                        {JSON.stringify(
                          {
                            sebelum: log.old_values,
                            sesudah: log.new_values,
                          },
                          null,
                          2,
                        )}
                      </pre>
                    </details>
                  )}
                </li>
              ))}
            </ol>

            {meta.last_page > 1 && (
              <nav
                aria-label="Halaman catatan audit"
                className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4"
              >
                <p className="text-sm text-[#667085]">
                  Halaman {meta.current_page} dari {meta.last_page}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoading(true);
                      setPage((current) => Math.max(1, current - 1));
                    }}
                    disabled={meta.current_page <= 1 || loading}
                    className="rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm font-medium disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoading(true);
                      setPage((current) =>
                        Math.min(meta.last_page, current + 1),
                      );
                    }}
                    disabled={meta.current_page >= meta.last_page || loading}
                    className="rounded-lg border border-[#d0d5dd] px-3 py-2 text-sm font-medium disabled:opacity-50"
                  >
                    Berikutnya
                  </button>
                </div>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function ChangeSummary({ log }) {
  const oldValues = log.old_values || {};
  const newValues = log.new_values || {};
  const fields = [...new Set([...Object.keys(oldValues), ...Object.keys(newValues)])];

  if (!fields.length) return null;

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
        Ringkasan perubahan
      </p>
      <dl className="mt-2 grid gap-2 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field}
            className="rounded-lg border border-[#eaecf0] px-3 py-2"
          >
            <dt className="text-xs font-medium text-[#667085]">
              {formatField(field)}
            </dt>
            <dd className="mt-1 break-words text-sm text-[#344054]">
              <span>{formatValue(oldValues[field], field)}</span>
              <span className="mx-2 text-[#98a2b3]">→</span>
              <span className="font-medium">
                {formatValue(newValues[field], field)}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function formatAction(action = "") {
  return (
    {
      school_account_status_changed: "Status akun sekolah diperbarui",
      campaign_reviewed_or_updated: "Kebutuhan ditinjau atau diperbarui",
      campaign_approved: "Kebutuhan disetujui",
      campaign_rejected: "Kebutuhan ditolak",
      campaign_revision_requested: "Revisi kebutuhan diminta",
      campaign_suspended: "Kebutuhan ditangguhkan",
      campaign_completed: "Kebutuhan ditandai selesai",
      campaign_priority_updated: "Priority Score diperbarui",
      campaign_updated: "Data kebutuhan diperbarui",
      campaign_deleted: "Kebutuhan dihapus",
      report_deleted: "Laporan penggunaan dana dihapus",
    }[action] || action.replaceAll("_", " ")
  );
}

function formatSubject(log) {
  const subject = log.subject_type?.split("\\").pop() || "Objek";
  const labels = { Campaign: "Kebutuhan", User: "Akun sekolah", Report: "Laporan" };
  return `${labels[subject] || subject} #${log.subject_id}`;
}

function formatField(field) {
  return (
    {
      account_status: "Status akun",
      status: "Status kebutuhan",
      school_id: "Data sekolah",
      verification_note: "Catatan verifikasi",
      title: "Judul",
      category: "Kategori",
      target_amount: "Target dana",
      student_count: "Jumlah siswa",
      urgency: "Tingkat urgensi",
      facility_condition: "Kondisi fasilitas",
      remoteness: "Tingkat keterpencilan",
      access_score: "Aksesibilitas",
      priority_score: "Priority Score",
      campaign_id: "ID kebutuhan",
    }[field] || field.replaceAll("_", " ")
  );
}

function formatValue(value, field) {
  if (value === undefined || value === null || value === "") return "—";
  if (field === "target_amount" && typeof value === "number") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }
  const labels = {
    verified: "Terverifikasi / disetujui",
    pending: "Menunggu",
    pending_verification: "Menunggu verifikasi",
    needs_revision: "Memerlukan revisi",
    revision_required: "Memerlukan perbaikan",
    rejected: "Ditolak",
    suspended: "Ditangguhkan",
    completed: "Selesai",
  };
  if (typeof value === "string" && labels[value]) return labels[value];
  if (typeof value === "number" && value >= 1000) {
    return new Intl.NumberFormat("id-ID").format(value);
  }
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Waktu tidak tersedia"
    : date.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      });
}
