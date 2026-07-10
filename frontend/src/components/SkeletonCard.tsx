export default function SkeletonCard() {
    return (
        <div className="w-full rounded-xl border border-slate-100 bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden flex flex-col animate-pulse">
            <div className="p-6 pb-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-16 bg-slate-200 rounded" />
                        <div className="h-5 w-24 bg-slate-200 rounded" />
                    </div>
                    <div className="h-5 w-20 bg-slate-200 rounded-full" />
                </div>
            </div>

            <div className="p-6 pt-4 pb-4">
                <div className="space-y-2">
                    <div className="h-4 w-full bg-slate-200 rounded" />
                    <div className="h-4 w-5/6 bg-slate-200 rounded" />
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <div className="h-6 w-24 bg-slate-200 rounded-md" />
                    <div className="h-6 w-20 bg-slate-200 rounded-md" />
                    <div className="h-6 w-16 bg-slate-200 rounded-md" />
                </div>
            </div>

            <div className="px-5">
                <div className="h-px w-full bg-slate-100"></div>
            </div>

            <div className="p-6 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-slate-200 rounded-full" />
                    <div className="flex flex-col gap-1">
                        <div className="h-4 w-24 bg-slate-200 rounded" />
                        <div className="h-3 w-16 bg-slate-200 rounded" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-slate-200 rounded-md" />
                    <div className="h-8 w-8 bg-slate-200 rounded-md" />
                </div>
            </div>
        </div>
    );
}