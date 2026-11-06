export function Stars({ rating, size = "text-sm" }: { rating: number; size?: string }) {
  return (
    <span className={`${size} text-amber-500`} aria-label={`${rating}/5`}>
      {"★".repeat(Math.round(rating))}<span className="text-ink/20">{"★".repeat(5 - Math.round(rating))}</span>
    </span>
  );
}
