import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatRupiah } from "../api";
import heroImage from "../assets/sekolah1.jpeg";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function resolveImageUrl(value) {
  if (!value) return "";

  try {
    return new URL(value, API_BASE_URL).toString();
  } catch {
    return "";
  }
}

function hasNumber(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value))
  );
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

function campaignProgress(campaign) {
  if (hasNumber(campaign.progress_percent)) {
    return Math.min(100, Math.max(0, Number(campaign.progress_percent)));
  }

  if (
    hasNumber(campaign.raised_amount) &&
    hasNumber(campaign.target_amount) &&
    Number(campaign.target_amount) > 0
  ) {
    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (Number(campaign.raised_amount) / Number(campaign.target_amount)) *
            100,
        ),
      ),
    );
  }

  return null;
}

function CampaignPhoto({ imageUrl, title }) {
  const [failed, setFailed] = useState(false);
  const source = resolveImageUrl(imageUrl);

  if (!source || failed) {
    return (
      <div
        role="img"
        aria-label={`Foto dokumentasi belum tersedia untuk ${title}`}
        className="flex aspect-[16/9] w-full items-center justify-center bg-[#edf1f4] px-4 text-center"
      >
        <div>
          <span
            aria-hidden="true"
            className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-[#526a83]"
          >
            ▧
          </span>
          <span className="text-xs font-medium text-[#64748b]">
            Foto kebutuhan belum tersedia
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={source}
      alt={`Dokumentasi kebutuhan: ${title}`}
      className="aspect-[16/9] w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function NeedCard({ campaign }) {
  const progress = campaignProgress(campaign);
  const hasAmounts =
    hasNumber(campaign.raised_amount) && hasNumber(campaign.target_amount);
  const score = hasNumber(campaign.priority_score)
    ? Number(campaign.priority_score)
    : null;
  const schoolName =
    campaign.school?.name ||
    campaign.school_name ||
    "Nama sekolah belum tersedia";

  return (
    <article className="group min-w-0 overflow-hidden rounded-xl border border-[#e5eaf0] bg-white shadow-[0_2px_10px_rgba(23,52,91,0.05)] transition-shadow hover:shadow-[0_8px_24px_rgba(23,52,91,0.11)]">
      <Link
        to={`/kampanye/${campaign.id}`}
        aria-label={`Lihat kebutuhan: ${campaign.title}`}
        className="relative block overflow-hidden focus-visible:outline-offset-[-3px]"
      >
        <CampaignPhoto imageUrl={campaign.image_url} title={campaign.title} />
        {score !== null && (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-[#17345b] shadow-sm">
            {campaign.priority_label || "Priority Score"} · {score}/100
          </span>
        )}
      </Link>

      <div className="p-4 sm:p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#a96517]">
          {campaign.category || "Kategori belum tersedia"}
        </p>
        <h3 className="mt-2 line-clamp-2 min-h-12 text-base font-semibold leading-6 text-[#17345b] sm:text-[17px]">
          {campaign.title}
        </h3>
        <p className="mt-2 truncate text-sm font-medium text-[#34465d]">
          {schoolName}
        </p>
        <p className="mt-1 flex min-h-9 items-start gap-1.5 text-xs leading-5 text-[#718096]">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="mt-0.5 h-4 w-4 shrink-0 fill-current"
          >
            <path d="M10 1.8a6.2 6.2 0 0 0-6.2 6.2c0 4.3 6.2 10.2 6.2 10.2s6.2-5.9 6.2-10.2A6.2 6.2 0 0 0 10 1.8Zm0 8.7a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
          </svg>
          <span>{campaignLocation(campaign)}</span>
        </p>

        {progress !== null ? (
          <div className="mt-3">
            <div
              className="h-2 overflow-hidden rounded-full bg-[#edf0f4]"
              role="progressbar"
              aria-label={`Progress donasi untuk ${campaign.title}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-[#f28c28]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-[#718096]">
              <span>{hasAmounts ? `${progress}% terkumpul` : `${progress}%`}</span>
              {hasAmounts && (
                <span className="font-medium text-[#17345b]">
                  Target {formatRupiah(campaign.target_amount)}
                </span>
              )}
            </div>
            {hasAmounts && (
              <p className="mt-1 text-xs text-[#64748b]">
                <strong className="font-semibold text-[#17345b]">
                  {formatRupiah(campaign.raised_amount)}
                </strong>{" "}
                terkumpul
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-xs text-[#718096]">
            Informasi donasi belum tersedia.
          </p>
        )}

        <Link
          to={`/kampanye/${campaign.id}`}
          className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-[#17345b] transition-colors group-hover:text-[#c56c13]"
        >
          Lihat Kebutuhan <span aria-hidden="true" className="ml-1">→</span>
        </Link>
      </div>
    </article>
  );
}

export default function PublicHome() {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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
  }, [retryCount]);

  return (
    <div className="bg-white text-[#17345b]">
      <main>
        <section
          aria-labelledby="hero-title"
          className="relative flex min-h-[450px] items-center justify-center bg-cover bg-center px-5 py-14 text-center sm:min-h-[430px] sm:px-8 sm:py-16"
          style={{
            backgroundImage: `linear-gradient(rgba(10, 24, 42, 0.62), rgba(10, 24, 42, 0.68)), url("${heroImage}")`,
            backgroundPosition: "center 52%",
          }}
        >
          <div className="mx-auto w-full max-w-[900px] text-white">
            <h1
              id="hero-title"
              className="mx-auto max-w-[800px] text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl lg:text-[3.25rem]"
            >
              Bersama, Wujudkan{" "}
              <span className="text-[#ffad55]">
                Pendidikan yang Lebih Baik
              </span>{" "}
              di Wilayah 3T
            </h1>
            <p className="mx-auto mt-5 max-w-[690px] text-sm leading-6 text-white/90 sm:text-base sm:leading-7">
              Dukung sekolah-sekolah di daerah tertinggal, terdepan, dan terluar
              agar setiap anak memiliki kesempatan belajar yang lebih layak.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/ajukan"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#f28c28] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#dc7616] focus-visible:outline-white"
              >
                Galang Dana
              </Link>
              <Link
                to="/kampanye"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/80 bg-[#17345b]/55 px-8 text-sm font-semibold text-white transition-colors hover:bg-[#17345b]/85 focus-visible:outline-white"
              >
                Donasi
              </Link>
            </div>
          </div>
        </section>

        <section
          id="kebutuhan"
          aria-labelledby="needs-title"
          className="scroll-mt-20 bg-[#f8fafc] px-5 py-9 sm:px-8 sm:py-11 lg:px-12"
        >
          <div className="mx-auto max-w-[1200px]">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2
                  id="needs-title"
                  className="text-2xl font-semibold leading-tight text-[#17345b] sm:text-[28px]"
                >
                  Kebutuhan yang Perlu Diperhatikan
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#687b90]">
                  Beberapa kebutuhan sekolah yang membutuhkan dukungan lebih
                  cepat.
                </p>
              </div>
              <Link
                to="/kampanye"
                className="inline-flex min-h-10 shrink-0 items-center text-sm font-semibold text-[#17345b] hover:text-[#c56c13]"
              >
                Lihat Semua Kebutuhan <span aria-hidden="true" className="ml-1">→</span>
              </Link>
            </div>

            {loading ? (
              <p className="py-10 text-sm text-[#687b90]" role="status">
                Memuat kebutuhan sekolah...
              </p>
            ) : loadFailed ? (
              <div className="py-10 text-sm text-[#687b90]" role="alert">
                <p>Kebutuhan sekolah belum dapat dimuat.</p>
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    setLoadFailed(false);
                    setRetryCount((count) => count + 1);
                  }}
                  className="mt-2 font-semibold text-[#17345b] underline underline-offset-2"
                >
                  Coba lagi
                </button>
              </div>
            ) : needs.length === 0 ? (
              <p className="py-10 text-sm text-[#687b90]" role="status">
                Belum ada kebutuhan sekolah terverifikasi untuk ditampilkan.
              </p>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {needs.map((campaign) => (
                  <NeedCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section
          id="dampak"
          className="scroll-mt-20 bg-white px-5 py-8 sm:px-8 lg:px-12"
        >
          <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 border-t border-[#e5eaf0] pt-7 sm:flex-row sm:items-center">
            <h2 className="max-w-xl text-xl font-semibold leading-snug text-[#17345b] sm:text-2xl">
              Bersama, buka kesempatan belajar yang lebih layak bagi anak-anak
              di wilayah 3T.
            </h2>
            <Link
              to="/kampanye"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-[#17345b] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#234a78]"
            >
              Dukung Kebutuhan Sekolah
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
