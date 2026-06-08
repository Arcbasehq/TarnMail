export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`pulse-soft rounded bg-neutral-200 dark:bg-neutral-800 ${className}`} />
  );
}
