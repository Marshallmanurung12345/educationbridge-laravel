import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatRupiah } from "../api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function resolveImageUrl(value) {
  if (!value) return "";

  try {
    return new URL(value, API_BASE_URL).toString();
  } catch {
    return "";
  }
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function campaignLocation(campaign) {
  const school = campaign.school;
  const officialLocation = [
    school?.kecamatan,
    school?.kabupaten_kota,
    school?.provinsi,
  ]
    .filter(Boolean)
    .join(", ");

  return officialLocation || campaign.location || "Lokasi belum tersedia";
}

function priorityLabel(campaign, score) {
  if (campaign.priority_label) return campaign.priority_label;
  if (score >= 80) return "Sangat Prioritas";
  if (score >= 60) return "Prioritas Tinggi";
  if (score >= 40) return "Prioritas Sedang";
  return "Prioritas Standar";
}

function priorityStyle(score) {
  if (score >= 80) return "bg-[#fae8e6] text-[#a63c32]";
  if (score >= 60) return "bg-[#fff1dc] text-[#9a5b10]";
  if (score >= 40) return "bg-[#e8eef7] text-[#34567e]";
  return "bg-[#eef0f2] text-[#52606d]";
}

function CampaignPhoto({ imageUrl, title, className = "" }) {
  const [failed, setFailed] = useState(false);
  const source = resolveImageUrl(imageUrl);

  if (source && !failed) {
    return (
      <img
        src={source}
        alt={`Dokumentasi: ${title}`}
        className={`${className} object-cover`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`Foto dokumentasi belum tersedia untuk ${title}`}
      className={`${className} flex items-center justify-center bg-[#edf0f2] px-4 text-center`}
    >
      <div>
        <span
          aria-hidden="true"
          className="mx-auto mb-2 flex h-9 w-9 items-center justify-center border border-[#cbd3dc] text-lg text-[#718096]"
        >
          ▧
        </span>
        <span className="text-xs font-medium text-[#64748b]">
          Foto dokumentasi belum tersedia
        </span>
      </div>
    </div>
  );
}

function NeedCard({ campaign }) {
  const score = Number(campaign.priority_score) || 0;
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
    <Link
      to={`/kampanye/${campaign.id}`}
      className="group min-w-0 overflow-hidden border border-[#e2e8ef] bg-white transition-colors hover:border-[#b9c6d5] focus-visible:outline-offset-4"
    >
      <CampaignPhoto
        imageUrl={campaign.image_url}
        title={campaign.title}
        className="aspect-[16/9] w-full"
      />
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#526a83]">
            {campaign.category || "Kategori belum tersedia"}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${priorityStyle(score)}`}
          >
            {priorityLabel(campaign, score)}
          </span>
        </div>
        <h3 className="mt-3 min-h-[48px] font-display text-lg leading-6 text-[#17365d]">
          {campaign.title}
        </h3>
        <p className="mt-2 text-sm font-medium text-[#34465d]">
          {campaign.school?.name || campaign.school_name}
        </p>
        <p className="mt-1 min-h-8 text-xs leading-4 text-[#718096]">
          {campaignLocation(campaign)}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-[#edf0f4] pt-3 text-xs">
          <span className="text-[#64748b]">Priority Score</span>
          <span className="font-semibold text-[#17365d]">{score}/100</span>
        </div>

        <div className="mt-3">
          <div
            className="h-1.5 overflow-hidden rounded-full bg-[#edf0f4]"
            role="progressbar"
            aria-label={`Dana terkumpul untuk ${campaign.title}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-[#17365d]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-[#64748b]">
            <span>
              <strong className="font-semibold text-[#34465d]">
                {formatRupiah(raised)}
              </strong>{" "}
              terkumpul
            </span>
            <span>{progress}%</span>
          </div>
          <p className="mt-1 text-[11px] text-[#64748b]">
            Target {formatRupiah(target)}
          </p>
        </div>
        <span className="mt-4 block text-sm font-semibold text-[#2767b1]">
          Lihat kebutuhan <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export default function PublicHome() {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    api
      .listCampaigns({ status: "verified", sort: "priority" })
      .then((rows) => {
        if (isMounted) setNeeds(Array.isArray(rows) ? rows.slice(0, 3) : []);
      })
      .catch(() => {
        if (isMounted) setLoadFailed(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const heroCampaign = needs.find((campaign) => campaign.image_url) || needs[0];
  const schoolSources = [
    ...new Set(
      needs.map((campaign) => campaign.school?.data_source).filter(Boolean),
    ),
  ];

  return (
    <div className="bg-[#faf9f6] text-[#23364f]">
      <main>
        <section className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="mx-auto grid max-w-[1200px] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#718096]">
                Pendidikan untuk semua, tanpa batas
              </p>
              <h1 className="mt-4 max-w-[520px] font-display text-4xl leading-[1.08] text-[#17365d] sm:text-5xl lg:text-[3.5rem]">
                Setiap sekolah punya kebutuhan.{" "}
                <span className="text-[#c47d20]">Mari bantu bersama.</span>
              </h1>
              <p className="mt-5 max-w-[500px] text-[15px] leading-7 text-[#5d7087]">
                EducationBridge menghubungkan sekolah yang membutuhkan dukungan
                dengan individu, perusahaan, dan mitra untuk menciptakan
                kesempatan pendidikan yang lebih merata.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/kampanye"
                  className="inline-flex min-h-11 items-center rounded-lg bg-[#17365d] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#245083]"
                >
                  Jelajahi Kebutuhan
                </Link>
                <Link
                  to="/ajukan"
                  className="inline-flex min-h-11 items-center rounded-lg border border-[#cbd3dc] px-4 py-2.5 text-sm font-semibold text-[#17365d] transition-colors hover:bg-white"
                >
                  Ajukan Kebutuhan
                </Link>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3 border-t border-[#e5e9ee] pt-5">
                {[
                  ["▤", "Data Pendidikan", "Sumber data tersedia"],
                  ["✓", "Tepat Sasaran", "Prioritas kebutuhan"],
                  ["↔", "Kolaborasi", "Sekolah dan mitra"],
                ].map(([icon, title, detail]) => (
                  <div key={title} className="min-w-0">
                    <span
                      aria-hidden="true"
                      className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#f4ead7] text-sm font-semibold text-[#9a6b1c]"
                    >
                      {icon}
                    </span>
                    <p className="text-xs font-semibold text-[#17365d]">
                      {title}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-[#718096]">
                      {detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="min-w-0">
              <figure className="overflow-hidden rounded-lg border border-[#e2e8ef] bg-white">
                <CampaignPhoto
                  imageUrl={heroCampaign?.image_url}
                  title={heroCampaign?.title || "sekolah"}
                  className="aspect-[16/10] w-full"
                />
                <figcaption className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-[#e2e8ef] px-3 py-2 text-[11px] text-[#64748b]">
                  <span>
                    {heroCampaign?.image_url
                      ? "Foto dokumentasi kebutuhan"
                      : "Dokumentasi sekolah belum tersedia"}
                  </span>
                  {heroCampaign && (
                    <>
                      <span>{campaignLocation(heroCampaign)}</span>
                      {formatDate(heroCampaign.updated_at) && (
                        <span>
                          Kebutuhan diperbarui{" "}
                          {formatDate(heroCampaign.updated_at)}
                        </span>
                      )}
                    </>
                  )}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-10 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-[1200px]">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="font-display text-3xl leading-tight text-[#17365d]">
                  Kebutuhan yang perlu diperhatikan
                </h2>
                <p className="mt-2 text-sm text-[#687b90]">
                  Beberapa kebutuhan sekolah yang membutuhkan dukungan lebih
                  cepat.
                </p>
              </div>
              <Link
                to="/kampanye"
                className="text-sm font-semibold text-[#2767b1] hover:text-[#17365d]"
              >
                Lihat semua kebutuhan <span aria-hidden="true">→</span>
              </Link>
            </div>

            {loading ? (
              <p className="py-10 text-sm text-[#687b90]" role="status">
                Memuat kebutuhan sekolah...
              </p>
            ) : loadFailed ? (
              <p className="py-10 text-sm text-[#687b90]" role="status">
                Kebutuhan sekolah belum dapat dimuat. Coba lagi nanti.
              </p>
            ) : needs.length === 0 ? (
              <p className="py-10 text-sm text-[#687b90]" role="status">
                Belum ada kebutuhan terverifikasi yang dapat ditampilkan.
              </p>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {needs.map((campaign) => (
                  <NeedCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}

            {needs.length > 0 && (
              <p className="mt-4 border-t border-[#e5e9ee] pt-3 text-[11px] leading-5 text-[#718096]">
                {schoolSources.length > 0
                  ? `Sumber identitas sekolah: ${schoolSources.join(", ")}. `
                  : "Sumber identitas sekolah mengikuti data yang tersedia. "}
                Foto ditampilkan hanya jika dokumentasi tersedia pada campaign.
              </p>
            )}
          </div>
        </section>

        <section className="px-5 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-5 border-t border-[#dce5ee] pt-8 sm:flex-row sm:items-center">
            <h2 className="max-w-xl font-display text-2xl leading-tight text-[#17365d] sm:text-3xl">
              Karena setiap anak berhak belajar di tempat yang layak.
            </h2>
            <Link
              to="/kampanye"
              className="inline-flex min-h-11 shrink-0 items-center rounded-lg bg-[#17365d] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245083]"
            >
              Jelajahi Kebutuhan
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
