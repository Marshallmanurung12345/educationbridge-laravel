import { useEffect, useState } from "react";
import { api } from "../api";
import LoadingIndicator from "../components/LoadingIndicator";

const pageSize = 15;

export default function AdminSchools() {
  const [query, setQuery] = useState("");
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const result = await api.listSchools(query.trim() ? { q: query.trim() } : {});
        if (active) {
          setSchools(Array.isArray(result) ? result : []);
          setPage(1);
        }
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const pages = Math.max(1, Math.ceil(schools.length / pageSize));
  const visibleSchools = schools.slice((page - 1) * pageSize, page * pageSize);

  return (
    <main className="min-h-[calc(100svh-68px)] bg-[#F7F8FA] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="page-title text-[#17345B]">Data Sekolah</h1>
            <p className="mt-1 text-sm text-[#667085]">Data sekolah resmi yang tersedia untuk dicocokkan dengan pengajuan.</p>
          </div>
          <label className="block w-full sm:w-80">
            <span className="sr-only">Cari sekolah atau NPSN</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama sekolah atau NPSN"
              className="min-h-10 w-full rounded-lg border border-[#DCE2EA] bg-white px-3 text-sm outline-none focus:border-[#17345B]"
            />
          </label>
        </div>

        {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
        <section className="mt-5 overflow-hidden rounded-xl border border-[#E6EAF0] bg-white">
          {loading ? (
            <LoadingIndicator label="Memuat data sekolah…" className="px-5 py-12" />
          ) : visibleSchools.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-[#667085]">{query ? "Tidak ada sekolah yang cocok dengan pencarian." : "Data sekolah belum tersedia."}</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-[#F8F9FB] text-xs font-semibold text-[#667085]">
                    <tr>
                      <th className="px-5 py-3">Nama Sekolah</th>
                      <th className="px-5 py-3">NPSN</th>
                      <th className="px-5 py-3">Jenjang</th>
                      <th className="px-5 py-3">Lokasi</th>
                      <th className="px-5 py-3">Wilayah 3T</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF0F3]">
                    {visibleSchools.map((school) => (
                      <tr key={school.id} className="hover:bg-[#FBFCFD]">
                        <td className="px-5 py-3.5 font-medium text-[#17345B]">{school.name}</td>
                        <td className="px-5 py-3.5 font-mono text-[#475467]">{school.npsn}</td>
                        <td className="px-5 py-3.5 text-[#667085]">{school.jenjang || "—"}</td>
                        <td className="px-5 py-3.5 text-[#667085]">{[school.kabupaten_kota, school.provinsi].filter(Boolean).join(", ") || "—"}</td>
                        <td className="px-5 py-3.5 text-[#667085]">{school.is_3t ? "Ya" : "Tidak"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {schools.length > pageSize && (
                <div className="flex items-center justify-between border-t border-[#EEF0F3] px-5 py-3 text-sm text-[#667085]">
                  <span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, schools.length)} dari {schools.length}</span>
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
    </main>
  );
}
