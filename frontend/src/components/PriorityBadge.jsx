const tierColor = (score) => {
  if (score >= 80) return { ring: "border-clay", text: "text-clay" };
  if (score >= 60) return { ring: "border-marigold", text: "text-marigold" };
  if (score >= 40) return { ring: "border-navy-soft", text: "text-navy" };
  return { ring: "border-ink-light/40", text: "text-ink-light" };
};

export default function PriorityBadge({ score, label, size = "md" }) {
  const { ring, text } = tierColor(score);
  const dims = size === "lg" ? "w-24 h-24 text-3xl" : "w-14 h-14 text-lg";
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className={`rounded-full border-[3px] ${ring} flex items-center justify-center font-display font-semibold ${text} ${dims}`}>
        {score}
      </div>
      {label && <span className={`text-[11px] leading-tight text-center font-medium ${text}`}>{label}</span>}
    </div>
  );
}
