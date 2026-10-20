import { useEffect, useState } from "react";
import { api } from "../api";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listAuditLogs()
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-[calc(100svh-68px)] bg-[#f8fafc] px-5 py-10 text-[#17345B]">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Audit Aktivitas</h1>
        <p className="mt-2 text-sm text-[#667085]">
          Catatan perubahan status akun sekolah dan tindakan admin.
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {loading ? (
          <p className="mt-8 text-sm text-[#667085]">Memuat catatan aktivitas...</p>
        ) : logs.length === 0 ? (
          <p className="mt-8 rounded-lg border border-[#e5e7eb] bg-white p-5 text-sm text-[#667085]">
            Belum ada aktivitas yang tercatat.
          </p>
        ) : (
          <ol className="mt-6 space-y-3">
            {logs.map((log) => (
              <li
                key={log.id}
                className="rounded-lg border border-[#e5e7eb] bg-white p-4"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-medium">{formatAction(log.action)}</p>
                  <time className="text-sm text-[#667085]">
                    {new Date(log.created_at).toLocaleString("id-ID")}
                  </time>
                </div>
                <p className="mt-1 text-sm text-[#667085]">
                  Oleh {log.actor?.name || "Admin"} · {log.subject_type?.split("\\").pop()} #{log.subject_id}
                </p>
                {log.note && (
                  <p className="mt-2 text-sm">Catatan: {log.note}</p>
                )}
                {(log.old_values || log.new_values) && (
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer font-medium">
                      Detail perubahan
                    </summary>
                    <pre className="mt-2 overflow-x-auto rounded bg-[#f8fafc] p-3 text-xs">
                      {JSON.stringify(
                        { sebelum: log.old_values, sesudah: log.new_values },
                        null,
                        2,
                      )}
                    </pre>
                  </details>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}

function formatAction(action) {
  return (
    {
      school_account_status_changed: "Status akun sekolah diubah",
      campaign_reviewed_or_updated: "Campaign ditinjau atau diperbarui",
      campaign_deleted: "Campaign dihapus",
    }[action] || action
  );
}
