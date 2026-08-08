import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewCenterCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 rounded-xl bg-slate-200" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 bg-slate-200" />
                <Skeleton className="h-3 w-20 bg-slate-200" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full bg-slate-200" />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <Skeleton className="h-4 w-40 bg-slate-200" />
            <Skeleton className="h-3 w-48 bg-slate-200" />
            <Skeleton className="h-3 w-36 bg-slate-200" />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <Skeleton className="h-8 w-24 rounded-lg bg-slate-200" />
            <div className="flex gap-1.5">
              <Skeleton className="size-8 rounded-lg bg-slate-200" />
              <Skeleton className="size-8 rounded-lg bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
