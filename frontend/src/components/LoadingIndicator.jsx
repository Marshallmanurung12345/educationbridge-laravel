const spinnerSizes = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-7 w-7 border-[3px]",
};

export function LoadingSpinner({ size = "md" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 animate-spin rounded-full border-[#d9e2ec] border-t-[#F28C28] ${spinnerSizes[size] || spinnerSizes.md}`}
    />
  );
}

export default function LoadingIndicator({
  label = "Memuat…",
  className = "",
  size = "md",
}) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-sm text-[#667085] ${className}`}
      role="status"
    >
      <LoadingSpinner size={size} />
      <span>{label}</span>
    </div>
  );
}
