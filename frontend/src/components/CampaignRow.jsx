import { Link } from "react-router-dom";
import { formatRupiah } from "../api";
import { getCategoryImage } from "../categoryImages";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function resolveImageUrl(value) {
  if (!value) return "";

  try {
    return new URL(value, API_BASE_URL).toString();
  } catch {
    return "";
  }
}

function daysLeft(endDate) {
  if (!endDate) return null;
  const diff = Math.ceil((new Date(endDate) - new Date()) / 86400000);
  return Number.isFinite(diff) ? diff : null;
}

function scoreColor(score) {
  if (score >= 80) return "text-[#c24135]";
  if (score >= 60) return "text-[#c56c13]";
  return "text-[#2d70b3]";
}

export default function CampaignRow({ campaign }) {
  const school = campaign.school;
  const hasScore = campaign.priority_score != null && Number.isFinite(Number(campaign.priority_score));
  const score = hasScore ? Number(campaign.priority_score) : null;
  const hasTarget = campaign.target_amount != null;
  const hasRaised = campaign.raised_amount != null;
  const target = Number(campaign.target_amount);
  const raised = Number(campaign.raised_amount);
  const progress = Math.min(
    100,
    Math.max(
      0,
      Number(
        campaign.progress_percent ??
          (target > 0 && hasRaised ? Math.round((raised / target) * 100) : 0),
      ),
    ),
  );
  const location = school
    ? [school.kecamatan, school.kabupaten_kota, school.provinsi]
        .filter(Boolean)
        .join(", ") || "Lokasi belum tersedia"
    : campaign.location || "Lokasi belum tersedia";
  const studentCount = school?.jumlah_siswa ?? campaign.student_count;
  const teacherCount = school?.jumlah_guru;
  const dataSource = school?.data_source;
  const regionStatus =
    school?.is_3t === true ? school.status_3t_detail || "Wilayah 3T" : null;
  const fallbackImage = getCategoryImage(campaign.category, campaign.title);
  const imageUrl = resolveImageUrl(campaign.image_url) || fallbackImage;
  const remaining = daysLeft(campaign.end_date);

  return (
    <Link
      to={`/kampanye/${campaign.id}`}
      className="group grid min-w-0 gap-4 border-b border-[#e5eaf0] py-6 transition sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#edf0f2] sm:aspect-auto sm:h-[130px]">
        <img
          src={imageUrl}
          alt={`Dokumentasi kebutuhan: ${campaign.title}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(event) => {
            if (event.currentTarget.src.endsWith(fallbackImage)) return;
            event.currentTarget.src = fallbackImage;
          }}
        />
        {remaining != null && (
          <span className="absolute left-2 top-2 rounded-md bg-[#e6f4fb] px-2 py-1 text-[11px] font-semibold text-[#1b6a93] shadow-sm">
            {remaining > 0 ? `${remaining} hari lagi` : "Berakhir"}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          {school?.npsn && (
            <span className="rounded bg-[#17345B] px-2 py-0.5 font-mono text-white">
              NPSN: {school.npsn}
            </span>
          )}
          {campaign.status === "verified" && (
            <span className="rounded bg-[#e6f4fb] px-2 py-0.5 text-[#1b6a93]">
              ✓ Terverifikasi Official
            </span>
          )}
          {regionStatus && (
            <span className="rounded bg-[#fdecec] px-2 py-0.5 text-[#c24135]">
              {regionStatus}
            </span>
          )}
          {campaign.category && (
            <span className="rounded border border-[#e1e7ee] px-2 py-0.5 font-medium text-[#9a6b1c]">
              {campaign.category}
            </span>
          )}
        </div>

        <h3 className="mt-2 break-words text-lg font-semibold leading-6 text-[#17345B] group-hover:underline decoration-[#F28C28] decoration-2 underline-offset-4">
          {campaign.title}
        </h3>
        <p className="mt-1 text-sm font-semibold uppercase text-[#34465d]">
          {school?.name || campaign.school_name || "Nama sekolah belum tersedia"}
        </p>
        <p className="mt-1 text-xs text-[#64748b]">📍 {location}</p>

        <div className="mt-3 grid grid-cols-3 gap-3 rounded-lg border border-[#e5eaf0] bg-[#f4f7fa] p-3 text-xs">
          <div>
            <p className="text-[10px] uppercase text-[#7b8798]">Jumlah siswa:</p>
            <p className="mt-0.5 font-semibold text-[#17345B]">
              {studentCount != null ? `${studentCount} siswa` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-[#7b8798]">Jumlah guru:</p>
            <p className="mt-0.5 font-semibold text-[#17345B]">
              {teacherCount != null ? `${teacherCount} guru` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-[#7b8798]">Sumber data sekolah:</p>
            <p className="mt-0.5 font-semibold text-[#1b6a93]">{dataSource || "—"}</p>
          </div>
        </div>

        <div
          role="progressbar"
          aria-label={`Dana terkumpul untuk ${campaign.title}`}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progress}
          className="mt-4 h-2 overflow-hidden rounded-full bg-[#e6e9ed]"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#1b6a93] to-[#2d8fc4] transition-[width] duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[#64748b]">
            Terkumpul{" "}
            <strong className="ml-1 text-base font-bold text-[#1b6a93]">
              {hasRaised ? formatRupiah(raised) : "—"}
            </strong>
          </span>
          <span className="font-semibold text-[#34465d]">
            {progress}% dari {hasTarget ? formatRupiah(target) : "—"}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <span className={hasScore ? scoreColor(score) : "text-[#64748b]"}>
            {hasScore
              ? `Priority Score: ${score} (${campaign.priority_label || "-"})`
              : "Skor belum tersedia"}
          </span>
          <span className="text-[#1b6a93] transition group-hover:translate-x-1">
            Lihat Detail &amp; Data Official →
          </span>
        </div>
      </div>
    </Link>
  );
}
