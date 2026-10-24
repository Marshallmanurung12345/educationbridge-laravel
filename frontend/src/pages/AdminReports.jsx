import { useEffect, useState } from "react";
import { api } from "../api";
import LoadingIndicator from "../components/LoadingIndicator";

function dateLabel(value) {
  return value
    ? new Date(value).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Tanggal tidak tersedia";
}

function externalPhotoUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;
    api.listAdminReports()
      .then((result) => {
        if (active) setReports(Array.isArray(result) ? result : []);
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
  }, []);

  async function removeReport(report) {
    if (!window.confirm(`Hapus laporan "${report.title}"? Tindakan ini dicatat di Audit Aktivitas.`)) {
      return;
    }

    setDeletingId(report.id);
    setActionError("");
    try {
      await api.deleteAdminReport(report.id);
      setReports((current) => current.filter((item) => item.id !== report.id));
    } catch (deleteError) {
      setActionError(deleteError.message);
    } finally {
      setDeletingId(null);
    }
  }

  async function retryLoading() {
    setLoading(true);
    setError("");
    try {
      const result = await api.listAdminReports();
      setReports(Array.isArray(result) ? result : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-68px)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5">
          <h1 className="page-title">Laporan Penggunaan Dana</h1>
          <p className="mt-2 text-sm text-[#667085]">
            Tinjau laporan publik dan hapus laporan yang melanggar kebijakan. Penghapusan dicatat di audit log.
          </p>
        </header>

        {actionError && (
          <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">
            Laporan tidak dapat dihapus: {actionError}
          </p>
        )}
        {loading ? (
          <LoadingIndicator label="Memuat laporan…" className="min-h-40 rounded-xl border border-[#E3E8EF] bg-white" />
        ) : error ? (
          <div className="rounded-xl border border-[#E3E8EF] bg-white p-5" role="alert">
            <p className="text-sm text-rose-700">Laporan tidak dapat dimuat: {error}</p>
            <button
              type="button"
              onClick={retryLoading}
              className="mt-3 min-h-9 rounded-lg border border-[#C9D3DF] px-3 text-sm font-semibold"
            >
              Coba lagi
            </button>
          </div>
        ) : reports.length === 0 ? (
          <p className="rounded-xl border border-[#E3E8EF] bg-white p-6 text-sm text-[#667085]">
            Belum ada laporan penggunaan dana.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#E3E8EF] bg-white">
            <ul className="divide-y divide-[#E9EDF2]">
              {reports.map((report) => (
                <li key={report.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                  <article className="min-w-0">
                    <h2 className="font-semibold text-[#17345B]">{report.title}</h2>
                    <p className="mt-1 text-xs text-[#667085]">
                      {report.campaign?.school_name || "Sekolah"} · {report.campaign?.title || "Kebutuhan"} · {dateLabel(report.created_at)}
                    </p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#475467]">{report.narrative}</p>
                    {externalPhotoUrl(report.photo_url) && (
                      <a
                        href={externalPhotoUrl(report.photo_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-xs font-semibold text-[#1D62B5] hover:underline"
                      >
                        Buka dokumentasi foto
                      </a>
                    )}
                  </article>
                  <button
                    type="button"
                    disabled={deletingId === report.id}
                    onClick={() => removeReport(report)}
                    className="min-h-9 shrink-0 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                  >
                    {deletingId === report.id ? "Menghapus…" : "Hapus laporan"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
