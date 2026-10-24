import { Link } from "react-router-dom";
import { formatRupiah } from "../api";
import PriorityBadge from "./PriorityBadge";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function resolveImageUrl(value) {
  if (!value) return "";

  try {
    return new URL(value, API_BASE_URL).toString();
  } catch {
    return "";
  }
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
    school?.is_3t === true
      ? school.status_3t_detail || "Wilayah 3T"
      : school?.is_3t === false
        ? "Bukan wilayah 3T"
        : "Status wilayah belum tersedia";
  const imageUrl = resolveImageUrl(campaign.image_url);

  return (
    <Link
      to={`/kampanye/${campaign.id}`}
      className="group my-3 grid min-w-0 grid-cols-[72px_minmax(0,1fr)] items-start gap-3 rounded-xl border border-[#e1e7ee] bg-white p-3 transition hover:border-[#cbd6e2] hover:shadow-sm sm:my-4 sm:grid-cols-[112px_minmax(0,1fr)_92px] sm:items-center sm:gap-5 sm:p-4"
    >
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#edf0f2]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Dokumentasi kebutuhan: ${campaign.title}`}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.hidden = true;
              const placeholder = event.currentTarget.nextElementSibling;
              if (placeholder) placeholder.hidden = false;
            }}
          />
        ) : null}
        <div
          hidden={Boolean(imageUrl)}
          role="img"
          aria-label={`Foto dokumentasi belum tersedia untuk ${campaign.title}`}
          className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] leading-4 text-[#64748b]"
        >
          Foto dokumentasi belum tersedia
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-4 text-[#64748b]">
          <span className="font-semibold uppercase tracking-wide text-[#9a6b1c]">
            {campaign.category || "Data belum tersedia"}
          </span>
          <span aria-hidden="true">·</span>
          <span className="min-w-0 break-words">{location}</span>
          {campaign.status === "verified" && (
            <span className="rounded-full bg-[#edf7f1] px-2 py-0.5 font-semibold text-[#28734b]">
              Terverifikasi
            </span>
          )}
          <span className="font-medium text-[#53677f]">
            {regionStatus}
          </span>
        </div>
        <h3 className="mt-1 break-words font-display text-base leading-5 text-[#17345B] group-hover:underline decoration-marigold decoration-2 underline-offset-4 sm:text-lg sm:leading-6">
          {campaign.title}
        </h3>
        <p className="mt-1 text-xs font-medium text-[#34465d] sm:text-sm">
          {school?.name || campaign.school_name || "Nama sekolah belum tersedia"}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] leading-4 text-[#718096] sm:text-[11px]">
          <span>{school?.npsn ? `NPSN: ${school.npsn}` : "NPSN: Data belum tersedia"}</span>
          <span>
            Siswa: {studentCount != null ? studentCount : "Data belum tersedia"}
          </span>
          <span>
            Guru: {teacherCount != null ? teacherCount : "Data belum tersedia"}
          </span>
          <span>
            Sumber data: {dataSource || "Data belum tersedia"}
          </span>
        </div>

        <div className="mt-2.5 max-w-[480px]">
          <div
            role="progressbar"
            aria-label={`Dana terkumpul untuk ${campaign.title}`}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progress}
            className="h-1.5 overflow-hidden rounded-full bg-[#e6e9ed]"
          >
            <div
              className="h-full rounded-full bg-[#17365d]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 text-[10px] leading-4 text-[#64748b] sm:text-[11px]">
            <span>
              <strong className="font-semibold text-[#34465d]">
                {hasRaised ? formatRupiah(raised) : "Data belum tersedia"}
              </strong>{" "}
              terkumpul dari {hasTarget ? formatRupiah(target) : "Data belum tersedia"}
            </span>
            <span className="font-semibold text-[#34465d]">
              {hasTarget && hasRaised ? `${progress}%` : "Data belum tersedia"}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#edf0f4] pt-2 sm:hidden">
          {hasScore ? (
            <PriorityBadge score={score} label={campaign.priority_label} />
          ) : (
            <span className="text-[11px] text-[#64748b]">Skor belum tersedia</span>
          )}
          <span className="text-xs font-semibold text-[#17345B]">Lihat Detail →</span>
        </div>
      </div>
      <div className="hidden flex-col items-center gap-2 sm:flex">
        {hasScore ? (
          <PriorityBadge score={score} label={campaign.priority_label} />
        ) : (
          <span className="text-center text-xs text-[#64748b]">Skor belum tersedia</span>
        )}
        <span className="text-center text-[11px] font-semibold text-[#17345B]">
          Lihat Detail →
        </span>
      </div>
    </Link>
  );
}
