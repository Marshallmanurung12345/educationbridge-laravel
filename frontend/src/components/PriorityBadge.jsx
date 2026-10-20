const tierColor = (score) => {
  if (score >= 80) return { ring: "border-clay", text: "text-clay" };
  if (score >= 60) return { ring: "border-marigold", text: "text-marigold" };
  if (score >= 40) return { ring: "border-navy-soft", text: "text-navy" };
  return { ring: "border-ink-light/40", text: "text-ink-light" };
};

export default function PriorityBadge({ score, label, size = "md" }) {
  const { ring, text } = tierColor(score);
  const dims =
    size === "lg" ? "h-20 w-20 text-2xl" : "h-14 w-14 text-xl sm:h-16 sm:w-16";
  return (
    <div className="flex w-full flex-col items-center gap-1 self-center">
      <div
        className={`flex shrink-0 items-center justify-center rounded-full border-[3px] font-display font-semibold ${ring} ${text} ${dims}`}
        aria-label={`Priority Score ${score} dari 100${label ? `, ${label}` : ""}`}
      >
        {score}
      </div>
      {label && (
        <span
          className={`max-w-[76px] text-center text-[10px] font-medium leading-tight sm:text-[11px] ${text}`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
