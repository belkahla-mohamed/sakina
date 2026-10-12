export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Sakina"
      focusable="false"
    >
      <rect width="64" height="64" rx="15" fill="var(--color-ink)" />
      <path
        d="M52.92 46.86 A29 29 0 1 1 24.26 10.01 A24 24 0 1 0 52.92 46.86 Z"
        fill="var(--color-highlight)"
      />
    </svg>
  );
}
