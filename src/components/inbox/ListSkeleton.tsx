import { Skeleton } from "@/components/ui/Skeleton";

export function ListSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="mt-2 h-3 w-40" />
          <Skeleton className="mt-2 h-2.5 w-52" />
        </div>
      ))}
    </div>
  );
}
