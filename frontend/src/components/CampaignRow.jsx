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
  const location = school
    ? [school.kecamatan, school.kabupaten_kota, school.provinsi]
        .filter(Boolean)
        .join(", ") || "Lokasi belum tersedia"
    : campaign.location || "Lokasi belum tersedia";
  const dataSource = school?.data_source || "Sumber data belum tersedia";
  const imageUrl = resolveImageUrl(campaign.image_url);

  return (
    <Link
      to={`/kampanye/${campaign.id}`}
      className="group grid grid-cols-[68px_minmax(0,1fr)_64px] items-center gap-3 border-b border-[#dfe5eb] py-4 hover:bg-[#f7f8fa] sm:grid-cols-[96px_minmax(0,1fr)_76px] sm:gap-5 sm:py-5"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-[#edf0f2]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Dokumentasi campaign: ${campaign.title}`}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.hidden = true;
              event.currentTarget.nextElementSibling.hidden = false;
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
            {campaign.category || "Kategori belum tersedia"}
          </span>
          <span aria-hidden="true">·</span>
          <span className="min-w-0">{location}</span>
          {school?.is_3t === true && (
            <span className="border-l border-[#cbd3dc] pl-2 font-medium text-[#a63c32]">
              Wilayah 3T
            </span>
          )}
        </div>
        <h3 className="mt-1 font-display text-base leading-5 text-[#17365d] group-hover:underline decoration-marigold decoration-2 underline-offset-4 sm:text-lg sm:leading-6">
          {campaign.title}
        </h3>
        <p className="mt-1 text-xs font-medium text-[#34465d] sm:text-sm">
          {school?.name ||
            campaign.school_name ||
            "Nama sekolah belum tersedia"}
        </p>
        <p className="mt-1 flex flex-wrap gap-x-2 text-[10px] leading-4 text-[#718096] sm:text-[11px]">
          <span>
            {school?.npsn ? `NPSN: ${school.npsn}` : "NPSN belum tersedia"}
          </span>
          <span aria-hidden="true">·</span>
          <span>Sumber: {dataSource}</span>
        </p>

        <div className="mt-2.5 max-w-[480px]">
          <div className="h-1.5 overflow-hidden rounded-full bg-[#e6e9ed]">
            <div
              className="h-full rounded-full bg-[#17365d]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 text-[10px] leading-4 text-[#64748b] sm:text-[11px]">
            <span>
              <strong className="font-semibold text-[#34465d]">
                {formatRupiah(raised)}
              </strong>{" "}
              terkumpul dari {formatRupiah(target)}
            </span>
            <span className="font-semibold text-[#34465d]">{progress}%</span>
          </div>
        </div>
      </div>
      <PriorityBadge score={score} label={campaign.priority_label} />
    </Link>
  );
}
