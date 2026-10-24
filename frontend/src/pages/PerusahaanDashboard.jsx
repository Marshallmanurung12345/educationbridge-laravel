import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatRupiah } from "../api";
import { useAuth } from "../context/AuthContext";

export default function PerusahaanDashboard() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listCampaigns({ sort: "priority" })
      .then((campaignsData) => {
        setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const verifiedCampaigns = campaigns.filter((c) => c.status === "verified");
  const companyName =
    user?.organization_name || user?.name || "Perusahaan Anda";

  return (
    <main className="min-h-screen bg-[#f5f7fa] pb-16 text-[#1e293b]">
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
        <header className="border-b border-[#e1e6ec] py-8 sm:py-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9a6b1c]">
                Dashboard Perusahaan
              </p>
              <h1 className="page-title mt-2 text-[#17365d]">
                Program CSR
              </h1>
              <p className="mt-2 text-sm text-[#64748b]">
                {companyName} <span aria-hidden="true">·</span> Pilih kebutuhan
                sekolah yang ingin Anda dukung.
              </p>
            </div>
            <Link
              to="/kampanye?sort=recommended"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#17365d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#214675]"
            >
              Cari program <span aria-hidden="true">→</span>
            </Link>
          </div>
        </header>

        <section aria-labelledby="needs-heading" className="pt-8">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#dfe5eb] pb-4">
            <div>
              <h2
                id="needs-heading"
                className="text-lg font-semibold text-[#17365d]"
              >
                Kebutuhan sekolah
              </h2>
              <p className="mt-1 text-sm text-[#64748b]">
                Program yang dapat ditinjau untuk dukungan CSR.
              </p>
            </div>
            {!loading && (
              <span className="text-sm text-[#64748b]">
                {verifiedCampaigns.length} kebutuhan tersedia
              </span>
            )}
          </div>

          {loading ? (
            <p className="py-10 text-sm text-[#64748b]" role="status">
              Memuat kebutuhan sekolah...
            </p>
          ) : error ? (
            <div className="py-10" role="alert">
              <p className="font-semibold text-[#17365d]">Kebutuhan sekolah tidak dapat dimuat.</p>
              <p className="mt-1 text-sm text-[#64748b]">{error}</p>
            </div>
          ) : verifiedCampaigns.length === 0 ? (
            <div className="py-10">
              <p className="font-semibold text-[#17365d]">
                Belum ada kebutuhan yang tersedia.
              </p>
              <p className="mt-1 text-sm text-[#64748b]">
                Silakan periksa kembali nanti.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#e1e6ec]">
              {verifiedCampaigns.map((campaign) => {
                const school = campaign.school;
                const target = Number(campaign.target_amount) || 0;
                const raised = Number(campaign.raised_amount) || 0;
                const progress = Math.min(
                  100,
                  Math.max(
                    0,
                    Number(
                      campaign.progress_percent ??
                        (target > 0 ? Math.round((raised / target) * 100) : 0),
                    ),
                  ),
                );

                return (
                  <li key={campaign.id}>
                    <div className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_190px_auto] sm:items-center sm:gap-6">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9a6b1c]">
                            {campaign.category}
                          </span>
                          {school?.is_3t && (
                            <span className="border-l border-[#d7dde5] pl-2 text-[11px] text-[#64748b]">
                              Wilayah 3T
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1 font-semibold leading-6 text-[#17365d]">
                          {campaign.title}
                        </h3>
                        <p className="mt-1 text-sm text-[#64748b]">
                          {school?.name || campaign.school_name}
                          {(school?.kecamatan || school?.kabupaten_kota) && (
                            <span>
                              {" "}
                              ·{" "}
                              {[school.kecamatan, school.kabupaten_kota]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          )}
                          {!school && campaign.location && (
                            <span> · {campaign.location}</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-[#64748b]">Terkumpul</span>
                          <span className="font-semibold text-[#17365d]">
                            {progress}%
                          </span>
                        </div>
                        <div
                          className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e4e9ef]"
                          role="progressbar"
                          aria-label={`Dana terkumpul untuk ${campaign.title}`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={progress}
                        >
                          <div
                            className="h-full rounded-full bg-[#d99a2b]"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-[#64748b]">
                          {formatRupiah(raised)} dari {formatRupiah(target)}
                        </p>
                      </div>

                      <Link
                        to={`/kampanye/${campaign.id}`}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#cdd6e0] px-3.5 py-2 text-sm font-semibold text-[#17365d] transition hover:border-[#17365d] hover:bg-white"
                      >
                        Lihat kebutuhan <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
