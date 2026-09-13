import { Link } from "react-router-dom";
import { formatRupiah } from "../api";
import PriorityBadge from "./PriorityBadge";

const accentByScore = (score) => {
  if (score >= 80) return "bg-clay";
  if (score >= 60) return "bg-marigold";
  if (score >= 40) return "bg-navy-soft";
  return "bg-ink-light/40";
};

export default function CampaignRow({ campaign }) {
  const school = campaign.school;
  const npsn = school?.npsn
    ? `NPSN: ${school.npsn}`
    : "NPSN: Data belum tersedia";
  const dataSource =
    school?.data_source || "Data Induk Pendidikan Kemendikdasmen";

  return (
    <Link
      to={`/kampanye/${campaign.id}`}
      className="group flex items-stretch gap-4 border-b border-ink/10 py-5 hover:bg-navy/5 transition-colors"
    >
      <span
        className={`w-1.5 rounded-full ${accentByScore(campaign.priority_score)}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-light">
          <span className="font-mono font-bold bg-[#17365d] text-white px-2 py-0.5 rounded text-[11px]">
            {npsn}
          </span>
          <span className="uppercase tracking-wide font-semibold text-[#087fae]">
            {campaign.category}
          </span>
          <span>·</span>
          <span>
            {school
              ? `${school.kecamatan}, ${school.kabupaten_kota}, ${school.provinsi}`
              : campaign.location}
          </span>
          {school?.is_3t && (
            <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[10px]">
              Wilayah 3T
            </span>
          )}
        </div>
        <h3 className="font-display text-xl mt-1 group-hover:underline decoration-marigold decoration-2 underline-offset-4">
          {campaign.title}
        </h3>
        <p className="text-sm font-semibold text-ink mt-0.5">
          {school?.name || campaign.school_name}
        </p>
        <p className="text-[11px] text-ink-light mt-0.5">
          Sumber Data Sekolah:{" "}
          <span className="text-[#087fae] font-medium">{dataSource}</span>
        </p>

        <div className="mt-3 max-w-sm">
          <div className="h-1.5 bg-ink/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage"
              style={{ width: `${campaign.progress_percent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1 text-ink-light">
            <span>{formatRupiah(campaign.raised_amount)} terkumpul</span>
            <span>{campaign.progress_percent}%</span>
          </div>
        </div>
      </div>
      <PriorityBadge
        score={campaign.priority_score}
        label={campaign.priority_label}
      />
    </Link>
  );
}
