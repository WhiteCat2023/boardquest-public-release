import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewCenterCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 font-sans">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-card border border-border rounded-xl p-3.5 shadow-2xs flex flex-col justify-between space-y-3"
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>

          <div className="space-y-2 pt-2.5 border-t border-border">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-3 w-32" />
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-border">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <div className="flex gap-1">
              <Skeleton className="size-7 rounded-lg" />
              <Skeleton className="size-7 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
