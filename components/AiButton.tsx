type AiButtonProps = {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

export function AiButton({
  onClick,
  loading = false,
  disabled = false,
  className = "",
}: AiButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`shrink-0 rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium tracking-wide text-violet-800 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      title="AI suggestion"
    >
      {loading ? "AI..." : "AI"}
    </button>
  );
}
