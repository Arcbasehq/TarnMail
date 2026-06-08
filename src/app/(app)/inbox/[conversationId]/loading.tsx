import { Skeleton } from "@/components/ui/Skeleton";

export default function ThreadLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-100 px-6 py-3 dark:border-neutral-800">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-24" />
      </div>
      <div className="flex flex-1 flex-col gap-4 px-6 py-5">
        <div className="flex flex-col items-start gap-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-12 w-64 rounded-2xl" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <Skeleton className="h-10 w-52 rounded-2xl" />
        </div>
        <div className="flex flex-col items-start gap-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-16 w-72 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
