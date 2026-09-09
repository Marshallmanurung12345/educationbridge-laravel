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
  return (
    <Link
      to={`/kampanye/${campaign.id}`}
      className="group flex items-stretch gap-4 border-b border-ink/10 py-5 hover:bg-navy/5 transition-colors"
    >
      <span className={`w-1.5 rounded-full ${accentByScore(campaign.priority_score)}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-light">
          <span>{campaign.category}</span>
          <span>·</span>
          <span>{campaign.location}</span>
        </div>
        <h3 className="font-display text-xl mt-1 group-hover:underline decoration-marigold decoration-2 underline-offset-4">
          {campaign.title}
        </h3>
        <p className="text-sm text-ink-light mt-1">{campaign.school_name}</p>

        <div className="mt-3 max-w-sm">
          <div className="h-1.5 bg-ink/10 rounded-full overflow-hidden">
            <div className="h-full bg-sage" style={{ width: `${campaign.progress_percent}%` }} />
          </div>
          <div className="flex justify-between text-xs mt-1 text-ink-light">
            <span>{formatRupiah(campaign.raised_amount)} terkumpul</span>
            <span>{campaign.progress_percent}%</span>
          </div>
        </div>
      </div>
      <PriorityBadge score={campaign.priority_score} label={campaign.priority_label} />
    </Link>
  );
}
